-- ============================================================
-- Janela de schema 1 (T-04) — decisões 81 a 85
-- ============================================================
-- Quatro mudanças de estrutura numa janela só, enquanto o banco tem apenas
-- dado de teste. Depois de família de fora usando, cada uma custa dez vezes
-- mais. Estrutura entra LIGADA; comportamento que ainda não tem tela entra
-- criado e DESLIGADO (decisão 85): limites_desconto.ativo = false e
-- regras_bonus.bonus_mensal_ativo = false. As funções recusam rodar enquanto
-- a chave estiver desligada.
--
-- Grupos: (1) PIN da criança  (2) moeda no schema  (3) regras da casa
--         (4) comportamento: avaliação mensal, limites e desconto


-- ============================================================
-- (0) pgcrypto — para o hash do PIN. No Supabase mora no schema
--     "extensions"; se já estiver instalado (em qualquer schema), este
--     comando não faz nada.
-- ============================================================
create extension if not exists pgcrypto with schema extensions;


-- ============================================================
-- (2) Moeda: tarefas.valor_cruzeiro -> valor_moeda (decisão 81)
-- ============================================================
-- Não se grava a marca no schema: "Realeta" pode mudar de novo, "moeda" não.
-- O CHECK (valor > 0) acompanha o rename sozinho. O corpo de função plpgsql
-- NÃO acompanha: é texto. A única função que lê a coluna é aprovar_execucao,
-- recriada abaixo com o nome novo. fechar_semana_consistencia conta
-- execuções, não lê valor — confirmado por busca nas migrations.
alter table public.tarefas rename column valor_cruzeiro to valor_moeda;

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
  select valor_moeda into v_valor
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
-- (1) PIN da criança (decisões 82 e 83)
-- ============================================================
-- Trava de comportamento, não fronteira de segurança: a sessão é sempre a
-- do responsável. O PIN impede a criança de navegar para a área de adulto;
-- não impede quem sabe abrir o DevTools. Para 6–10 anos é proporcional.
--
-- Guardado com hash bcrypt (pgcrypto). Nulo = "sem PIN ainda". O hash nunca
-- sai do banco: a coluna fica fora do SELECT/INSERT/UPDATE que o cliente
-- tem em criancas (privilégio por coluna, abaixo). Só definir_pin escreve e
-- só validar_pin lê — as duas SECURITY DEFINER.
alter table public.criancas add column pin_hash text;

-- Privilégio por coluna: a RLS decide QUAIS LINHAS a família vê; isto
-- decide QUAIS COLUNAS. Sem isto, "select pin_hash from criancas" voltaria
-- o hash para o navegador. O front já lista colunas explicitamente em todo
-- acesso e nunca usa select('*') — confirmado por busca no código.
revoke select, insert, update on public.criancas from anon, authenticated;
grant select (id, familia_id, nome, apelido, ano_nascimento, avatar, criado_em)
  on public.criancas to authenticated;
grant insert (familia_id, nome, apelido, ano_nascimento, avatar)
  on public.criancas to authenticated;
grant update (nome, apelido, ano_nascimento, avatar)
  on public.criancas to authenticated;

-- search_path inclui "extensions" só nestas duas funções, para crypt() e
-- gen_salt() resolverem onde quer que o pgcrypto tenha sido instalado.
create or replace function public.definir_pin(p_crianca_id uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if not exists (
    select 1 from public.criancas
    where id = p_crianca_id and familia_id = public.familia_do_usuario()
  ) then
    raise exception 'Criança não encontrada.';
  end if;

  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    raise exception 'O PIN precisa ter exatamente 4 números.';
  end if;

  update public.criancas
  set pin_hash = crypt(p_pin, gen_salt('bf'))
  where id = p_crianca_id;
end;
$$;

-- Devolve true só se a criança tem PIN e ele confere. Nunca devolve o hash.
-- Sem PIN definido devolve false: a tela decide o que fazer nesse caso.
create or replace function public.validar_pin(p_crianca_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select pin_hash into v_hash
  from public.criancas
  where id = p_crianca_id and familia_id = public.familia_do_usuario();

  if not found then
    raise exception 'Criança não encontrada.';
  end if;

  if v_hash is null or p_pin is null then
    return false;
  end if;

  return v_hash = crypt(p_pin, v_hash);
end;
$$;

-- A tela precisa saber se a criança JÁ TEM PIN (para pedir ou para
-- oferecer criar), sem nunca ver o hash. Só um boolean sai daqui.
create or replace function public.crianca_tem_pin(p_crianca_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select pin_hash is not null
  from public.criancas
  where id = p_crianca_id and familia_id = public.familia_do_usuario();
$$;


-- ============================================================
-- (3) Regras da casa
-- ============================================================
-- Regra é texto da família ("Não bater no irmão"). Ocorrência é o registro
-- de que aconteceu, com quem e quando. SEM VALOR: ocorrência não mexe em
-- moeda (decisão 66 — desconto é ato separado, decidido na hora).
create table public.regras (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 80),
  descricao text check (char_length(descricao) <= 300),
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.ocorrencias_regra (
  id uuid primary key default gen_random_uuid(),
  regra_id uuid not null references public.regras(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  ocorrida_em timestamptz not null default now(),
  registrada_por uuid not null default auth.uid() references public.responsaveis(id),
  observacao text check (char_length(observacao) <= 200),
  criado_em timestamptz not null default now()
);

-- Mesmo espírito de trg_tarefas_valida_crianca: a RLS de INSERT só olha
-- familia_id. Sem isto, sabendo o uuid, daria para registrar ocorrência com
-- regra ou criança de outra família.
create or replace function public.validar_ocorrencia_mesma_familia()
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
    select 1 from public.regras
    where id = new.regra_id and familia_id = new.familia_id
  ) then
    raise exception 'A regra informada não pertence a esta família.';
  end if;

  return new;
end;
$$;

create trigger trg_ocorrencias_valida_familia
  before insert or update on public.ocorrencias_regra
  for each row
  execute function public.validar_ocorrencia_mesma_familia();

alter table public.regras enable row level security;
alter table public.ocorrencias_regra enable row level security;

-- regras: CRUD completo, sempre restrito à própria família
create policy "regras_select_familia" on public.regras
  for select using (familia_id = public.familia_do_usuario());
create policy "regras_insert_familia" on public.regras
  for insert with check (familia_id = public.familia_do_usuario());
create policy "regras_update_familia" on public.regras
  for update using (familia_id = public.familia_do_usuario())
  with check (familia_id = public.familia_do_usuario());
create policy "regras_delete_familia" on public.regras
  for delete using (familia_id = public.familia_do_usuario());

-- ocorrencias_regra: ler, registrar e apagar (registro errado). Sem UPDATE:
-- ocorrência não se edita, apaga-se e registra-se de novo.
create policy "ocorrencias_regra_select_familia" on public.ocorrencias_regra
  for select using (familia_id = public.familia_do_usuario());
create policy "ocorrencias_regra_insert_familia" on public.ocorrencias_regra
  for insert with check (familia_id = public.familia_do_usuario());
create policy "ocorrencias_regra_delete_familia" on public.ocorrencias_regra
  for delete using (familia_id = public.familia_do_usuario());


-- ============================================================
-- (4) Comportamento: avaliação mensal, limites e desconto
-- ============================================================

-- 4a. Duas origens novas no extrato. 'desconto' é o débito de comportamento;
--     'bonus_mensal' é o crédito da avaliação mensal. 'estorno' (já existe)
--     serve também para desfazer um desconto.
alter table public.transacoes drop constraint transacoes_origem_check;
alter table public.transacoes add constraint transacoes_origem_check
  check (origem = any (array[
    'tarefa', 'bonus_consistencia', 'bonus_mensal', 'resgate', 'ajuste_manual', 'estorno', 'desconto'
  ]));

-- 4b. Bônus mensal: o VALOR vem da configuração da família, nunca do
--     cliente (mesma regra de toda moeda). Entra DESLIGADO (decisão 85).
alter table public.regras_bonus
  add column valor_bonus_mensal int not null default 100 check (valor_bonus_mensal > 0),
  add column bonus_mensal_ativo boolean not null default false;

-- 4c. Limites do desconto, uma linha por família (travas 3 e 4 da decisão
--     64). Padrão sugerido: 100 por ocorrência, 150 no mês. Com ganho típico
--     de 400 a 540 por mês, 300 apagaria até três quartos do mês — o que a
--     trava 4 existe para impedir. 150 permite um desconto grande e um
--     pequeno, ou três pequenos. Entra DESLIGADO.
create table public.limites_desconto (
  familia_id uuid primary key references public.familias(id) on delete cascade,
  teto_por_ocorrencia int not null default 100 check (teto_por_ocorrencia > 0),
  teto_mensal int not null default 150 check (teto_mensal > 0),
  ativo boolean not null default false,
  constraint teto_mensal_cobre_ocorrencia check (teto_mensal >= teto_por_ocorrencia)
);

-- Toda família nasce com limites padrão (mesmo padrão de regras_bonus), e
-- as famílias que já existem recebem a linha agora.
create or replace function public.criar_limites_desconto_para_familia()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.limites_desconto (familia_id)
  values (new.id)
  on conflict (familia_id) do nothing;
  return new;
end;
$$;

create trigger trg_criar_limites_desconto_apos_inserir_familia
  after insert on public.familias
  for each row
  execute function public.criar_limites_desconto_para_familia();

insert into public.limites_desconto (familia_id)
select id from public.familias
on conflict (familia_id) do nothing;

-- 4d. Avaliação mensal: uma por criança por mês. Só a função escreve.
create table public.avaliacoes_mensais (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  mes_referencia date not null check (extract(day from mes_referencia) = 1), -- sempre dia 1
  valor_bonus int not null default 0 check (valor_bonus >= 0),
  bilhete text check (char_length(bilhete) <= 280),
  avaliada_por uuid not null references public.responsaveis(id),
  avaliada_em timestamptz not null default now(),
  unique (crianca_id, mes_referencia)
);

-- 4e. Desconto: cada aplicação fica registrada com o valor pedido e o valor
--     que de fato saiu (trava 5: nunca passa do saldo), o motivo (trava 2)
--     e, se houver, o estorno (trava 7). Só as funções escrevem.
create table public.descontos (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  ocorrencia_id uuid references public.ocorrencias_regra(id) on delete set null,
  valor_solicitado int not null check (valor_solicitado > 0),
  valor_efetivo int not null check (valor_efetivo > 0 and valor_efetivo <= valor_solicitado),
  motivo text not null check (char_length(motivo) between 3 and 200),
  aplicado_por uuid not null references public.responsaveis(id),
  aplicado_em timestamptz not null default now(),
  estornado_por uuid references public.responsaveis(id),
  estornado_em timestamptz
);

alter table public.limites_desconto enable row level security;
alter table public.avaliacoes_mensais enable row level security;
alter table public.descontos enable row level security;

-- Todas só leitura pelo cliente. Escrita é só via função.
create policy "limites_desconto_select_familia" on public.limites_desconto
  for select using (familia_id = public.familia_do_usuario());
create policy "avaliacoes_mensais_select_familia" on public.avaliacoes_mensais
  for select using (familia_id = public.familia_do_usuario());
create policy "descontos_select_familia" on public.descontos
  for select using (familia_id = public.familia_do_usuario());

-- ------------------------------------------------------------
-- Função: aplicar_desconto — as sete travas da decisão 64
-- ------------------------------------------------------------
-- 1. Nunca automático: só existe como RPC chamada por um responsável logado.
--    Nenhum trigger chama isto.
-- 2. Motivo obrigatório: sem texto, recusa. O motivo vai para o extrato.
-- 3. Teto por ocorrência: limites_desconto.teto_por_ocorrencia.
-- 4. Teto mensal acumulado: soma dos descontos NÃO estornados do mês.
-- 5. Saldo nunca negativo: desconta até zerar e registra o valor efetivo.
--    Saldo zero = nada a descontar, recusa. CRIANÇA NÃO TEM DÍVIDA.
-- 6. Alerta de desproporção: é da tela (T futura). O banco expõe os números
--    (saldo, teto) que a tela precisa para calcular.
-- 7. Arrependimento em 24h: estornar_desconto, abaixo.
-- Enquanto limites_desconto.ativo = false, recusa (decisão 85).
create or replace function public.aplicar_desconto(
  p_crianca_id uuid,
  p_valor int,
  p_motivo text,
  p_ocorrencia_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_familia_id uuid;
  v_limites record;
  v_saldo_atual int;
  v_acumulado_mes int;
  v_valor_efetivo int;
  v_novo_saldo int;
  v_desconto_id uuid;
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

  select * into v_limites
  from public.limites_desconto
  where familia_id = v_familia_id;

  if not found or not v_limites.ativo then
    raise exception 'O desconto ainda não está ligado para esta família.';
  end if;

  -- trava 2
  if p_motivo is null or char_length(btrim(p_motivo)) < 3 then
    raise exception 'O motivo do desconto é obrigatório.';
  end if;

  if p_valor is null or p_valor <= 0 then
    raise exception 'O valor do desconto precisa ser maior que zero.';
  end if;

  -- trava 3
  if p_valor > v_limites.teto_por_ocorrencia then
    raise exception 'Este desconto passa do teto por ocorrência (%).', v_limites.teto_por_ocorrencia;
  end if;

  if p_ocorrencia_id is not null and not exists (
    select 1 from public.ocorrencias_regra
    where id = p_ocorrencia_id and crianca_id = p_crianca_id and familia_id = v_familia_id
  ) then
    raise exception 'Ocorrência não encontrada para esta criança.';
  end if;

  -- trava 5, parte 1: trava a carteira e lê o saldo real
  select saldo into v_saldo_atual
  from public.carteiras
  where crianca_id = p_crianca_id
  for update;

  if v_saldo_atual <= 0 then
    raise exception 'A criança não tem saldo para descontar.';
  end if;

  -- trava 4: o que já saiu neste mês e não foi estornado
  select coalesce(sum(valor_efetivo), 0) into v_acumulado_mes
  from public.descontos
  where crianca_id = p_crianca_id
    and estornado_em is null
    and aplicado_em >= date_trunc('month', now())
    and aplicado_em < date_trunc('month', now()) + interval '1 month';

  if v_acumulado_mes + p_valor > v_limites.teto_mensal then
    raise exception 'Este desconto passa do teto mensal (% de % já descontados).', v_acumulado_mes, v_limites.teto_mensal;
  end if;

  -- trava 5, parte 2: desconta até zerar, nunca além
  v_valor_efetivo := least(p_valor, v_saldo_atual);

  insert into public.descontos (
    familia_id, crianca_id, ocorrencia_id, valor_solicitado, valor_efetivo, motivo, aplicado_por
  ) values (
    v_familia_id, p_crianca_id, p_ocorrencia_id, p_valor, v_valor_efetivo, btrim(p_motivo), auth.uid()
  )
  returning id into v_desconto_id;

  update public.carteiras
  set saldo = saldo - v_valor_efetivo,
      atualizado_em = now()
  where crianca_id = p_crianca_id
  returning saldo into v_novo_saldo;

  insert into public.transacoes (
    crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
  ) values (
    p_crianca_id, v_familia_id, 'debito', v_valor_efetivo, 'desconto', v_desconto_id, v_novo_saldo,
    'Desconto: ' || btrim(p_motivo)
  );

  return v_desconto_id;
end;
$$;

-- ------------------------------------------------------------
-- Função: estornar_desconto — trava 7 (arrependimento em 24h)
-- ------------------------------------------------------------
-- Mesmo padrão de cancelar_resgate: FOR UPDATE contra corrida, idempotente,
-- e (origem='estorno', referencia_id=desconto.id) estável — o índice único
-- de transacoes impede creditar duas vezes.
create or replace function public.estornar_desconto(p_desconto_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desconto record;
  v_novo_saldo int;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select * into v_desconto
  from public.descontos
  where id = p_desconto_id
    and familia_id = public.familia_do_usuario()
  for update;

  if not found then
    raise exception 'Desconto não encontrado.';
  end if;

  if v_desconto.estornado_em is not null then
    return;
  end if;

  if now() - v_desconto.aplicado_em > interval '24 hours' then
    raise exception 'O prazo de 24 horas para desfazer este desconto já passou.';
  end if;

  update public.descontos
  set estornado_em = now(),
      estornado_por = auth.uid()
  where id = p_desconto_id;

  update public.carteiras
  set saldo = saldo + v_desconto.valor_efetivo,
      atualizado_em = now()
  where crianca_id = v_desconto.crianca_id
  returning saldo into v_novo_saldo;

  insert into public.transacoes (
    crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
  ) values (
    v_desconto.crianca_id, v_desconto.familia_id, 'credito', v_desconto.valor_efetivo, 'estorno',
    p_desconto_id, v_novo_saldo, 'Desconto desfeito'
  );
end;
$$;

-- ------------------------------------------------------------
-- Função: registrar_avaliacao_mensal
-- ------------------------------------------------------------
-- O responsável decide SE a criança merece o bônus do mês (boolean) e
-- escreve um bilhete curto. QUANTO vale vem de regras_bonus, nunca do
-- cliente — mesmo padrão de aprovar_execucao. Só depois do mês terminar.
-- Idempotente: uma avaliação por criança por mês; repetir devolve a que
-- existe. Enquanto bonus_mensal_ativo = false, recusa (decisão 85).
create or replace function public.registrar_avaliacao_mensal(
  p_crianca_id uuid,
  p_mes_referencia date,
  p_merece_bonus boolean,
  p_bilhete text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_familia_id uuid;
  v_regra record;
  v_avaliacao_id uuid;
  v_valor_bonus int := 0;
  v_novo_saldo int;
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

  if p_mes_referencia is null or extract(day from p_mes_referencia) <> 1 then
    raise exception 'O mês de referência precisa ser o dia 1 do mês.';
  end if;

  if current_date < p_mes_referencia + interval '1 month' then
    raise exception 'Este mês ainda não terminou.';
  end if;

  select * into v_regra
  from public.regras_bonus
  where familia_id = v_familia_id;

  if not found or not v_regra.bonus_mensal_ativo then
    raise exception 'O bônus mensal ainda não está ligado para esta família.';
  end if;

  select id into v_avaliacao_id
  from public.avaliacoes_mensais
  where crianca_id = p_crianca_id and mes_referencia = p_mes_referencia;

  if v_avaliacao_id is not null then
    return v_avaliacao_id;
  end if;

  if coalesce(p_merece_bonus, false) then
    v_valor_bonus := v_regra.valor_bonus_mensal;
  end if;

  insert into public.avaliacoes_mensais (
    familia_id, crianca_id, mes_referencia, valor_bonus, bilhete, avaliada_por
  ) values (
    v_familia_id, p_crianca_id, p_mes_referencia, v_valor_bonus, nullif(btrim(p_bilhete), ''), auth.uid()
  )
  returning id into v_avaliacao_id;

  if v_valor_bonus > 0 then
    update public.carteiras
    set saldo = saldo + v_valor_bonus,
        atualizado_em = now()
    where crianca_id = p_crianca_id
    returning saldo into v_novo_saldo;

    insert into public.transacoes (
      crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
    ) values (
      p_crianca_id, v_familia_id, 'credito', v_valor_bonus, 'bonus_mensal', v_avaliacao_id, v_novo_saldo,
      'Bônus do mês'
    );
  end if;

  return v_avaliacao_id;
end;
$$;


-- ============================================================
-- Permissões de execução — só authenticated, nunca anon/public
-- ============================================================
revoke execute on function public.validar_ocorrencia_mesma_familia() from public, anon, authenticated;
revoke execute on function public.criar_limites_desconto_para_familia() from public, anon, authenticated;

revoke execute on function public.aprovar_execucao(uuid) from public, anon;
grant execute on function public.aprovar_execucao(uuid) to authenticated;

revoke execute on function public.definir_pin(uuid, text) from public, anon;
grant execute on function public.definir_pin(uuid, text) to authenticated;

revoke execute on function public.validar_pin(uuid, text) from public, anon;
grant execute on function public.validar_pin(uuid, text) to authenticated;

revoke execute on function public.crianca_tem_pin(uuid) from public, anon;
grant execute on function public.crianca_tem_pin(uuid) to authenticated;

revoke execute on function public.aplicar_desconto(uuid, int, text, uuid) from public, anon;
grant execute on function public.aplicar_desconto(uuid, int, text, uuid) to authenticated;

revoke execute on function public.estornar_desconto(uuid) from public, anon;
grant execute on function public.estornar_desconto(uuid) to authenticated;

revoke execute on function public.registrar_avaliacao_mensal(uuid, date, boolean, text) from public, anon;
grant execute on function public.registrar_avaliacao_mensal(uuid, date, boolean, text) to authenticated;
