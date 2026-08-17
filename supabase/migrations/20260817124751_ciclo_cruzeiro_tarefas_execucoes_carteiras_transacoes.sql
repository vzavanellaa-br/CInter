-- ============================================================
-- Tabela: tarefas
-- ============================================================
create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  titulo text not null,
  icone text,
  valor_cruzeiro int not null check (valor_cruzeiro > 0),
  recorrencia text not null check (recorrencia in ('diaria', 'semanal', 'avulsa')),
  dias_semana int[],
  data_especifica date,
  ativa boolean not null default true,
  criado_em timestamptz not null default now(),
  -- diária: nem dias_semana nem data_especifica. semanal: dias_semana
  -- obrigatório, não vazio, só valores 0–6, sem data_especifica. avulsa:
  -- data_especifica obrigatória, sem dias_semana.
  constraint recorrencia_coerente check (
    case recorrencia
      when 'diaria' then dias_semana is null and data_especifica is null
      when 'semanal' then dias_semana is not null
        and array_length(dias_semana, 1) > 0
        and dias_semana <@ array[0, 1, 2, 3, 4, 5, 6]
        and data_especifica is null
      when 'avulsa' then data_especifica is not null and dias_semana is null
      else false
    end
  )
);

-- Trava extra de integridade: a criança da tarefa tem que pertencer à mesma
-- família da tarefa. A RLS de INSERT/UPDATE só olha familia_id — sem isso,
-- uma família poderia (sabendo o uuid) criar tarefa apontando pra criança
-- de outra família.
create or replace function public.validar_crianca_pertence_familia()
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
  return new;
end;
$$;

create trigger trg_tarefas_valida_crianca
  before insert or update on public.tarefas
  for each row
  execute function public.validar_crianca_pertence_familia();

-- ============================================================
-- Tabela: execucoes_tarefa
-- ============================================================
create table public.execucoes_tarefa (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  data_referencia date not null,
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada')),
  marcada_em timestamptz not null default now(),
  decidida_em timestamptz,
  decidida_por uuid references public.responsaveis(id),
  valor_creditado int,
  unique (tarefa_id, data_referencia)
);

-- ============================================================
-- Tabela: carteiras
-- ============================================================
create table public.carteiras (
  crianca_id uuid primary key references public.criancas(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  saldo int not null default 0 check (saldo >= 0),
  atualizado_em timestamptz not null default now()
);

-- Toda criança nasce com carteira zerada automaticamente.
create or replace function public.criar_carteira_para_crianca()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.carteiras (crianca_id, familia_id)
  values (new.id, new.familia_id);
  return new;
end;
$$;

create trigger trg_criar_carteira_apos_inserir_crianca
  after insert on public.criancas
  for each row
  execute function public.criar_carteira_para_crianca();

-- ============================================================
-- Tabela: transacoes
-- ============================================================
create table public.transacoes (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  tipo text not null check (tipo in ('credito', 'debito')),
  valor int not null check (valor > 0),
  origem text not null check (origem in ('tarefa', 'bonus_consistencia', 'resgate', 'ajuste_manual')),
  referencia_id uuid,
  saldo_apos int not null,
  descricao text,
  criado_em timestamptz not null default now()
);

-- Trava contra crédito duplicado: uma (origem, referencia_id) só pode
-- gerar uma transação. É isso que impede aprovar a mesma execução duas
-- vezes e creditar duas vezes, mesmo em caso de corrida.
create unique index transacoes_origem_referencia_unica
  on public.transacoes (origem, referencia_id)
  where referencia_id is not null;

-- ============================================================
-- RLS
-- ============================================================
alter table public.tarefas enable row level security;
alter table public.execucoes_tarefa enable row level security;
alter table public.carteiras enable row level security;
alter table public.transacoes enable row level security;

-- tarefas: CRUD completo, sempre restrito à própria família
create policy "tarefas_select_familia" on public.tarefas
  for select
  using (familia_id = public.familia_do_usuario());

create policy "tarefas_insert_familia" on public.tarefas
  for insert
  with check (familia_id = public.familia_do_usuario());

create policy "tarefas_update_familia" on public.tarefas
  for update
  using (familia_id = public.familia_do_usuario())
  with check (familia_id = public.familia_do_usuario());

create policy "tarefas_delete_familia" on public.tarefas
  for delete
  using (familia_id = public.familia_do_usuario());

-- execucoes_tarefa: só leitura. Criar/aprovar/rejeitar é só via função.
create policy "execucoes_tarefa_select_familia" on public.execucoes_tarefa
  for select
  using (familia_id = public.familia_do_usuario());

-- carteiras: só leitura. Saldo nunca é editável pelo cliente.
create policy "carteiras_select_familia" on public.carteiras
  for select
  using (familia_id = public.familia_do_usuario());

-- transacoes: só leitura. Extrato não se edita.
create policy "transacoes_select_familia" on public.transacoes
  for select
  using (familia_id = public.familia_do_usuario());

-- ============================================================
-- Função: marcar_tarefa
-- ============================================================
create or replace function public.marcar_tarefa(p_tarefa_id uuid, p_data date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tarefa record;
  v_dia_semana int;
  v_execucao_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select * into v_tarefa
  from public.tarefas
  where id = p_tarefa_id
    and familia_id = public.familia_do_usuario();

  if not found then
    raise exception 'Tarefa não encontrada.';
  end if;

  if not v_tarefa.ativa then
    raise exception 'Esta tarefa está inativa.';
  end if;

  if p_data > current_date then
    raise exception 'Não é possível marcar uma tarefa em data futura.';
  end if;

  if v_tarefa.recorrencia = 'semanal' then
    v_dia_semana := extract(dow from p_data)::int;
    if not (v_dia_semana = any(v_tarefa.dias_semana)) then
      raise exception 'Esta tarefa não ocorre neste dia da semana.';
    end if;
  elsif v_tarefa.recorrencia = 'avulsa' then
    if p_data <> v_tarefa.data_especifica then
      raise exception 'Esta tarefa só pode ser marcada na data específica dela.';
    end if;
  end if;
  -- 'diaria': qualquer dia serve, nada a validar

  if exists (
    select 1 from public.execucoes_tarefa
    where tarefa_id = p_tarefa_id and data_referencia = p_data
  ) then
    raise exception 'Esta tarefa já foi marcada nesta data.';
  end if;

  insert into public.execucoes_tarefa (tarefa_id, crianca_id, familia_id, data_referencia, status)
  values (p_tarefa_id, v_tarefa.crianca_id, v_tarefa.familia_id, p_data, 'pendente')
  returning id into v_execucao_id;

  return v_execucao_id;
end;
$$;

-- ============================================================
-- Função: aprovar_execucao
-- ============================================================
create or replace function public.aprovar_execucao(p_execucao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_execucao record;
  v_valor int;
  v_novo_saldo int;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select * into v_execucao
  from public.execucoes_tarefa
  where id = p_execucao_id
    and familia_id = public.familia_do_usuario();

  if not found then
    raise exception 'Execução não encontrada.';
  end if;

  -- idempotente: já aprovada, não credita de novo
  if v_execucao.status = 'aprovada' then
    return;
  end if;

  if v_execucao.status = 'rejeitada' then
    raise exception 'Esta execução já foi rejeitada e não pode ser aprovada.';
  end if;

  -- o valor vem SEMPRE da tarefa, nunca de parâmetro do cliente
  select valor_cruzeiro into v_valor
  from public.tarefas
  where id = v_execucao.tarefa_id;

  if v_valor is null then
    raise exception 'Não foi possível determinar o valor da tarefa.';
  end if;

  update public.execucoes_tarefa
  set status = 'aprovada',
      valor_creditado = v_valor,
      decidida_em = now(),
      decidida_por = auth.uid()
  where id = p_execucao_id;

  update public.carteiras
  set saldo = saldo + v_valor,
      atualizado_em = now()
  where crianca_id = v_execucao.crianca_id
  returning saldo into v_novo_saldo;

  insert into public.transacoes (
    crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
  ) values (
    v_execucao.crianca_id, v_execucao.familia_id, 'credito', v_valor, 'tarefa', p_execucao_id, v_novo_saldo,
    'Tarefa aprovada'
  );
end;
$$;

-- ============================================================
-- Função: rejeitar_execucao
-- ============================================================
create or replace function public.rejeitar_execucao(p_execucao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_execucao record;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select * into v_execucao
  from public.execucoes_tarefa
  where id = p_execucao_id
    and familia_id = public.familia_do_usuario();

  if not found then
    raise exception 'Execução não encontrada.';
  end if;

  if v_execucao.status = 'aprovada' then
    raise exception 'Esta execução já foi aprovada. Estornar é um fluxo separado, ainda não implementado.';
  end if;

  -- idempotente: já estava rejeitada
  if v_execucao.status = 'rejeitada' then
    return;
  end if;

  update public.execucoes_tarefa
  set status = 'rejeitada',
      decidida_em = now(),
      decidida_por = auth.uid()
  where id = p_execucao_id;
end;
$$;

-- ============================================================
-- Permissões de execução — só authenticated, nunca anon/public
-- (o Postgres/Supabase concede EXECUTE por padrão; revoga explicitamente)
-- ============================================================
revoke execute on function public.validar_crianca_pertence_familia() from public, anon, authenticated;
revoke execute on function public.criar_carteira_para_crianca() from public, anon, authenticated;

revoke execute on function public.marcar_tarefa(uuid, date) from public, anon;
grant execute on function public.marcar_tarefa(uuid, date) to authenticated;

revoke execute on function public.aprovar_execucao(uuid) from public, anon;
grant execute on function public.aprovar_execucao(uuid) to authenticated;

revoke execute on function public.rejeitar_execucao(uuid) from public, anon;
grant execute on function public.rejeitar_execucao(uuid) to authenticated;
