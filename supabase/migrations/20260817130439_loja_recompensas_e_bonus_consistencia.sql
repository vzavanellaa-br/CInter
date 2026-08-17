-- ============================================================
-- Tabela: recompensas
-- ============================================================
create table public.recompensas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  titulo text not null,
  icone text,
  custo int not null check (custo > 0),
  tipo text not null check (tipo in ('objeto', 'experiencia', 'privilegio')),
  estoque int check (estoque >= 0), -- null = ilimitado
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- Tabela: resgates
-- ============================================================
create table public.resgates (
  id uuid primary key default gen_random_uuid(),
  recompensa_id uuid not null references public.recompensas(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  custo_pago int not null, -- fotografia do custo no momento do resgate
  status text not null default 'pendente' check (status in ('pendente', 'entregue', 'cancelado')),
  pedido_em timestamptz not null default now(),
  decidido_em timestamptz,
  decidido_por uuid references public.responsaveis(id)
);

-- Mesmo espírito do trg_tarefas_valida_crianca (Passo 2A): a RLS de INSERT
-- só olha familia_id. Sem isso, dava pra criar um resgate com crianca_id ou
-- recompensa_id de outra família, sabendo o uuid.
create or replace function public.validar_resgate_mesma_familia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.criancas
    where id = new.crianca_id and familia_id = new.familia_id
  ) then
    raise exception 'A criança informada não pertence a esta família.';
  end if;

  if not exists (
    select 1 from public.recompensas
    where id = new.recompensa_id and familia_id = new.familia_id
  ) then
    raise exception 'A recompensa informada não pertence a esta família.';
  end if;

  return new;
end;
$$;

create trigger trg_resgates_valida_familia
  before insert or update on public.resgates
  for each row
  execute function public.validar_resgate_mesma_familia();

-- ============================================================
-- Tabela: regras_bonus (uma linha por família)
-- ============================================================
create table public.regras_bonus (
  familia_id uuid primary key references public.familias(id) on delete cascade,
  percentual_minimo int not null default 80 check (percentual_minimo between 1 and 100),
  valor_bonus int not null default 50 check (valor_bonus > 0),
  ativo boolean not null default true
);

-- Toda família nasce com regra padrão de bônus. Mesmo padrão do
-- criar_carteira_para_crianca (Passo 2A): trigger em vez de mexer na função
-- criar_familia já testada — garante a linha mesmo se um dia existir outro
-- caminho de criação de família.
create or replace function public.criar_regras_bonus_para_familia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.regras_bonus (familia_id)
  values (new.id);
  return new;
end;
$$;

create trigger trg_criar_regras_bonus_apos_inserir_familia
  after insert on public.familias
  for each row
  execute function public.criar_regras_bonus_para_familia();

-- ============================================================
-- Tabela: bonus_semanais
-- ============================================================
create table public.bonus_semanais (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  semana_inicio date not null, -- sempre uma segunda-feira
  percentual_atingido int,
  valor int,
  criado_em timestamptz not null default now(),
  unique (crianca_id, semana_inicio)
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.recompensas enable row level security;
alter table public.resgates enable row level security;
alter table public.regras_bonus enable row level security;
alter table public.bonus_semanais enable row level security;

-- recompensas: CRUD completo, sempre restrito à própria família
create policy "recompensas_select_familia" on public.recompensas
  for select
  using (familia_id = public.familia_do_usuario());

create policy "recompensas_insert_familia" on public.recompensas
  for insert
  with check (familia_id = public.familia_do_usuario());

create policy "recompensas_update_familia" on public.recompensas
  for update
  using (familia_id = public.familia_do_usuario())
  with check (familia_id = public.familia_do_usuario());

create policy "recompensas_delete_familia" on public.recompensas
  for delete
  using (familia_id = public.familia_do_usuario());

-- resgates: só leitura. Resgatar/entregar/cancelar é só via função.
create policy "resgates_select_familia" on public.resgates
  for select
  using (familia_id = public.familia_do_usuario());

-- regras_bonus: só leitura. Ajuste de regra fica para uma fase futura.
create policy "regras_bonus_select_familia" on public.regras_bonus
  for select
  using (familia_id = public.familia_do_usuario());

-- bonus_semanais: só leitura. Só fechar_semana_consistencia escreve.
create policy "bonus_semanais_select_familia" on public.bonus_semanais
  for select
  using (familia_id = public.familia_do_usuario());

-- ============================================================
-- Função: resgatar_recompensa
-- ============================================================
create or replace function public.resgatar_recompensa(p_recompensa_id uuid, p_crianca_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_familia_id uuid;
  v_recompensa record;
  v_saldo_atual int;
  v_novo_saldo int;
  v_resgate_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  v_familia_id := public.familia_do_usuario();

  if not exists (
    select 1 from public.criancas
    where id = p_crianca_id and familia_id = v_familia_id
  ) then
    raise exception 'Criança não encontrada.';
  end if;

  select * into v_recompensa
  from public.recompensas
  where id = p_recompensa_id
    and familia_id = v_familia_id;

  if not found then
    raise exception 'Recompensa não encontrada.';
  end if;

  if not v_recompensa.ativa then
    raise exception 'Esta recompensa não está mais disponível.';
  end if;

  if v_recompensa.estoque is not null and v_recompensa.estoque <= 0 then
    raise exception 'Esta recompensa está sem estoque.';
  end if;

  select saldo into v_saldo_atual
  from public.carteiras
  where crianca_id = p_crianca_id;

  if v_saldo_atual < v_recompensa.custo then
    raise exception 'Saldo insuficiente para resgatar esta recompensa.';
  end if;

  insert into public.resgates (recompensa_id, crianca_id, familia_id, custo_pago)
  values (p_recompensa_id, p_crianca_id, v_familia_id, v_recompensa.custo)
  returning id into v_resgate_id;

  update public.carteiras
  set saldo = saldo - v_recompensa.custo,
      atualizado_em = now()
  where crianca_id = p_crianca_id
  returning saldo into v_novo_saldo;

  insert into public.transacoes (
    crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
  ) values (
    p_crianca_id, v_familia_id, 'debito', v_recompensa.custo, 'resgate', v_resgate_id, v_novo_saldo,
    'Resgate: ' || v_recompensa.titulo
  );

  if v_recompensa.estoque is not null then
    update public.recompensas
    set estoque = estoque - 1
    where id = p_recompensa_id;
  end if;

  return v_resgate_id;
end;
$$;

-- ============================================================
-- Função: entregar_resgate
-- ============================================================
create or replace function public.entregar_resgate(p_resgate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resgate record;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select * into v_resgate
  from public.resgates
  where id = p_resgate_id
    and familia_id = public.familia_do_usuario();

  if not found then
    raise exception 'Resgate não encontrado.';
  end if;

  -- idempotente: já entregue, não faz nada de novo
  if v_resgate.status = 'entregue' then
    return;
  end if;

  if v_resgate.status = 'cancelado' then
    raise exception 'Este resgate foi cancelado e não pode ser entregue.';
  end if;

  update public.resgates
  set status = 'entregue',
      decidido_em = now(),
      decidido_por = auth.uid()
  where id = p_resgate_id;
end;
$$;

-- ============================================================
-- Função: cancelar_resgate
-- ============================================================
create or replace function public.cancelar_resgate(p_resgate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resgate record;
  v_novo_saldo int;
  v_credito_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select * into v_resgate
  from public.resgates
  where id = p_resgate_id
    and familia_id = public.familia_do_usuario();

  if not found then
    raise exception 'Resgate não encontrado.';
  end if;

  -- idempotente: já cancelado, não credita de novo
  if v_resgate.status = 'cancelado' then
    return;
  end if;

  if v_resgate.status = 'entregue' then
    raise exception 'Este resgate já foi entregue e não pode mais ser cancelado.';
  end if;

  update public.resgates
  set status = 'cancelado',
      decidido_em = now(),
      decidido_por = auth.uid()
  where id = p_resgate_id;

  update public.carteiras
  set saldo = saldo + v_resgate.custo_pago,
      atualizado_em = now()
  where crianca_id = v_resgate.crianca_id
  returning saldo into v_novo_saldo;

  -- referencia_id PRÓPRIO (o id desta própria transação de estorno), não o
  -- do resgate — o débito original já usa (origem='resgate',
  -- referencia_id=resgate.id), e esse par é UNIQUE. Reaproveitar o mesmo
  -- referencia_id pro crédito colidiria com o débito.
  v_credito_id := gen_random_uuid();

  insert into public.transacoes (
    id, crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
  ) values (
    v_credito_id, v_resgate.crianca_id, v_resgate.familia_id, 'credito', v_resgate.custo_pago, 'resgate',
    v_credito_id, v_novo_saldo, 'Estorno de resgate cancelado'
  );

  update public.recompensas
  set estoque = estoque + 1
  where id = v_resgate.recompensa_id and estoque is not null;
end;
$$;

-- ============================================================
-- Função: fechar_semana_consistencia
-- ============================================================
create or replace function public.fechar_semana_consistencia(p_crianca_id uuid, p_semana_inicio date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_familia_id uuid;
  v_semana_fim date;
  v_esperado int := 0;
  v_aprovado int;
  v_percentual int;
  v_regra record;
  v_bonus_id uuid;
  v_valor_bonus int := 0;
  v_novo_saldo int;
  v_tarefa record;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  v_familia_id := public.familia_do_usuario();

  if not exists (
    select 1 from public.criancas
    where id = p_crianca_id and familia_id = v_familia_id
  ) then
    raise exception 'Criança não encontrada.';
  end if;

  if extract(dow from p_semana_inicio)::int <> 1 then
    raise exception 'A semana precisa começar numa segunda-feira.';
  end if;

  v_semana_fim := p_semana_inicio + 6;

  if current_date <= v_semana_fim then
    raise exception 'Esta semana ainda não terminou.';
  end if;

  -- idempotente: se já foi fechada, devolve o bônus já calculado em vez de
  -- recalcular e (pior) tentar creditar de novo
  select id into v_bonus_id
  from public.bonus_semanais
  where crianca_id = p_crianca_id and semana_inicio = p_semana_inicio;

  if v_bonus_id is not null then
    return v_bonus_id;
  end if;

  -- quantas execuções eram esperadas, pelas tarefas ATIVAS da criança
  for v_tarefa in
    select recorrencia, dias_semana, data_especifica
    from public.tarefas
    where crianca_id = p_crianca_id and ativa = true
  loop
    if v_tarefa.recorrencia = 'diaria' then
      v_esperado := v_esperado + 7;
    elsif v_tarefa.recorrencia = 'semanal' then
      v_esperado := v_esperado + coalesce(array_length(v_tarefa.dias_semana, 1), 0);
    elsif v_tarefa.recorrencia = 'avulsa' then
      if v_tarefa.data_especifica between p_semana_inicio and v_semana_fim then
        v_esperado := v_esperado + 1;
      end if;
    end if;
  end loop;

  select count(*) into v_aprovado
  from public.execucoes_tarefa
  where crianca_id = p_crianca_id
    and status = 'aprovada'
    and data_referencia between p_semana_inicio and v_semana_fim;

  if v_esperado = 0 then
    v_percentual := 0;
  else
    v_percentual := round((v_aprovado * 100.0) / v_esperado)::int;
  end if;

  select * into v_regra
  from public.regras_bonus
  where familia_id = v_familia_id;

  if not found then
    raise exception 'Regras de bônus não configuradas para esta família.';
  end if;

  if v_regra.ativo and v_esperado > 0 and v_percentual >= v_regra.percentual_minimo then
    v_valor_bonus := v_regra.valor_bonus;
  end if;

  insert into public.bonus_semanais (crianca_id, familia_id, semana_inicio, percentual_atingido, valor)
  values (p_crianca_id, v_familia_id, p_semana_inicio, v_percentual, v_valor_bonus)
  returning id into v_bonus_id;

  if v_valor_bonus > 0 then
    update public.carteiras
    set saldo = saldo + v_valor_bonus,
        atualizado_em = now()
    where crianca_id = p_crianca_id
    returning saldo into v_novo_saldo;

    insert into public.transacoes (
      crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
    ) values (
      p_crianca_id, v_familia_id, 'credito', v_valor_bonus, 'bonus_consistencia', v_bonus_id, v_novo_saldo,
      'Bônus de consistência semanal'
    );
  end if;

  return v_bonus_id;
end;
$$;

-- ============================================================
-- Permissões de execução — só authenticated, nunca anon/public
-- ============================================================
revoke execute on function public.validar_resgate_mesma_familia() from public, anon, authenticated;
revoke execute on function public.criar_regras_bonus_para_familia() from public, anon, authenticated;

revoke execute on function public.resgatar_recompensa(uuid, uuid) from public, anon;
grant execute on function public.resgatar_recompensa(uuid, uuid) to authenticated;

revoke execute on function public.entregar_resgate(uuid) from public, anon;
grant execute on function public.entregar_resgate(uuid) to authenticated;

revoke execute on function public.cancelar_resgate(uuid) from public, anon;
grant execute on function public.cancelar_resgate(uuid) to authenticated;

revoke execute on function public.fechar_semana_consistencia(uuid, date) from public, anon;
grant execute on function public.fechar_semana_consistencia(uuid, date) to authenticated;
