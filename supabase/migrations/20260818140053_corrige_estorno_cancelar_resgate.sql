-- Corrige três problemas em cancelar_resgate (Passo 2B):
-- 1. referencia_id era um uuid novo a cada chamada -> o índice único
--    (origem, referencia_id) nunca disparava para o estorno, a idempotência
--    ficava só na checagem de status, sem a rede de proteção do banco.
-- 2. SELECT sem FOR UPDATE -> janela de corrida entre ler o status e escrever.
-- 3. Sem rastreabilidade: não dava pra achar o estorno de um resgate.

-- 'estorno' vira uma origem válida, distinta de 'resgate' (o débito
-- original). Assim (estorno, resgate_id) não colide com (resgate, resgate_id).
alter table public.transacoes drop constraint transacoes_origem_check;
alter table public.transacoes add constraint transacoes_origem_check
  check (origem = any (array['tarefa', 'bonus_consistencia', 'resgate', 'ajuste_manual', 'estorno']));

create or replace function public.cancelar_resgate(p_resgate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resgate record;
  v_novo_saldo int;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado.';
  end if;

  -- FOR UPDATE trava a linha do resgate até o fim desta transação: uma
  -- segunda chamada concorrente espera aqui em vez de decidir com base num
  -- status que já pode estar desatualizado.
  select * into v_resgate
  from public.resgates
  where id = p_resgate_id
    and familia_id = public.familia_do_usuario()
  for update;

  if not found then
    raise exception 'Resgate não encontrado.';
  end if;

  -- idempotente: já cancelado, não credita de novo (cinto e suspensório —
  -- o índice único em transacoes agora também garante isso de verdade)
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

  -- origem='estorno' + referencia_id=resgate.id: estável (sempre o mesmo
  -- id do resgate, nunca um uuid novo), diferente do par
  -- (origem='resgate', referencia_id=resgate.id) do débito original — não
  -- colide, e o índice único volta a proteger de verdade contra crédito
  -- duplicado. Também dá pra achar o estorno de um resgate específico.
  insert into public.transacoes (
    crianca_id, familia_id, tipo, valor, origem, referencia_id, saldo_apos, descricao
  ) values (
    v_resgate.crianca_id, v_resgate.familia_id, 'credito', v_resgate.custo_pago, 'estorno',
    p_resgate_id, v_novo_saldo, 'Estorno de resgate cancelado'
  );

  update public.recompensas
  set estoque = estoque + 1
  where id = v_resgate.recompensa_id and estoque is not null;
end;
$$;

revoke execute on function public.cancelar_resgate(uuid) from public, anon;
grant execute on function public.cancelar_resgate(uuid) to authenticated;
