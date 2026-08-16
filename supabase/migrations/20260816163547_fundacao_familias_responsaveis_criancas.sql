-- Apaga o modelo antigo (só continha dados de teste).
-- Motivos: RLS desligada, criança com conta no auth, saldo editável pelo
-- cliente, transação sem rastro de origem/saldo resultante.
drop table if exists public.transacoes cascade;
drop table if exists public.carteiras cascade;
drop table if exists public.usuarios cascade;
drop table if exists public.familias cascade;

-- ============================================================
-- Tabelas novas
-- ============================================================

create table public.familias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

-- O responsável É a conta do auth (LGPD art. 14: só adulto tem conta própria).
create table public.responsaveis (
  id uuid primary key references auth.users(id) on delete cascade,
  familia_id uuid not null references public.familias(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now()
);

-- A criança é um perfil interno da família. Nunca liga a auth.users e nunca
-- guarda e-mail, telefone, endereço ou localização. Ano de nascimento (não
-- data completa) só para saber a faixa etária.
create table public.criancas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familias(id) on delete cascade,
  nome text not null,
  apelido text,
  ano_nascimento int not null check (ano_nascimento between 2010 and 2025),
  avatar text,
  criado_em timestamptz not null default now()
);

-- ============================================================
-- Função auxiliar: família do usuário logado
-- ============================================================
-- SECURITY DEFINER é obrigatório aqui: as políticas de RLS da própria tabela
-- responsaveis chamam esta função. Sem SECURITY DEFINER, a função rodaria com
-- as permissões de quem chamou, tentaria checar RLS de responsaveis de novo
-- para responder, e entraria em recursão infinita.
create or replace function public.familia_do_usuario()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select familia_id from public.responsaveis where id = auth.uid();
$$;

grant execute on function public.familia_do_usuario() to authenticated;

-- ============================================================
-- RLS — ligada nas três tabelas, política sempre a partir de auth.uid()
-- ============================================================

alter table public.familias enable row level security;
alter table public.responsaveis enable row level security;
alter table public.criancas enable row level security;

-- familias: o responsável vê e atualiza só a própria família.
-- Sem política de INSERT: família só nasce via criar_familia() (SECURITY DEFINER).
create policy "familias_select_propria" on public.familias
  for select
  using (id = public.familia_do_usuario());

create policy "familias_update_propria" on public.familias
  for update
  using (id = public.familia_do_usuario())
  with check (id = public.familia_do_usuario());

-- responsaveis: só leitura dos responsáveis da própria família.
-- Sem política de INSERT: responsável só nasce via criar_familia().
create policy "responsaveis_select_familia" on public.responsaveis
  for select
  using (familia_id = public.familia_do_usuario());

-- criancas: CRUD completo, sempre restrito à própria família.
create policy "criancas_select_familia" on public.criancas
  for select
  using (familia_id = public.familia_do_usuario());

create policy "criancas_insert_familia" on public.criancas
  for insert
  with check (familia_id = public.familia_do_usuario());

create policy "criancas_update_familia" on public.criancas
  for update
  using (familia_id = public.familia_do_usuario())
  with check (familia_id = public.familia_do_usuario());

create policy "criancas_delete_familia" on public.criancas
  for delete
  using (familia_id = public.familia_do_usuario());

-- ============================================================
-- RPC: criar_familia — único jeito de nascer uma família
-- ============================================================
create or replace function public.criar_familia(nome_familia text, nome_responsavel text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nova_familia_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if exists (select 1 from public.responsaveis where id = auth.uid()) then
    raise exception 'Este usuário já pertence a uma família.';
  end if;

  insert into public.familias (nome)
  values (nome_familia)
  returning id into nova_familia_id;

  insert into public.responsaveis (id, familia_id, nome)
  values (auth.uid(), nova_familia_id, nome_responsavel);

  return nova_familia_id;
end;
$$;

grant execute on function public.criar_familia(text, text) to authenticated;
