# Fase 2 — Modelo de dados da economia do Cruzeiro

Decidido em 16/08/2026. Referência para os prompts do code.

## Decisões que geraram este modelo

- Recorrência: **diária, semanal e avulsa**
- **Bônus de consistência entra já na Fase 2**
- Preço: **o pai define, com faixa sugerida pelo app**

## Divisão em dois passos

| Passo | Conteúdo | Por quê |
|---|---|---|
| **2A** | `tarefas`, `execucoes_tarefa`, `carteiras`, `transacoes` + funções de marcar/aprovar/rejeitar | É o ciclo do dinheiro. Parte mais crítica do produto, merece atenção isolada |
| **2B** | `recompensas`, `resgates`, `regras_bonus`, `bonus_semanais` + funções de resgate e fechamento de semana | Depende de 2A funcionando |

---

## Passo 2A

### `tarefas`
`id` · `familia_id` · `crianca_id` · `titulo` · `icone` · `valor_cruzeiro` (>0) ·
`recorrencia` ('diaria'|'semanal'|'avulsa') · `dias_semana` int[] · `data_especifica` date ·
`ativa` · `criado_em`

- Uma tarefa pertence a **uma** criança. Para dois filhos, o pai cria duas. Simples
  de propósito; agrupar vem depois se doer.
- `semanal` exige `dias_semana` preenchido; `avulsa` exige `data_especifica`.
  Garantido por CHECK, não por confiança no front.
- Nunca apagar tarefa que já tem execução — usar `ativa = false`. Apagar destruiria
  o histórico financeiro.

### `execucoes_tarefa`
`id` · `tarefa_id` · `crianca_id` · `familia_id` · `data_referencia` date ·
`status` ('pendente'|'aprovada'|'rejeitada') · `marcada_em` · `decidida_em` ·
`decidida_por` · `valor_creditado` int

- **UNIQUE (`tarefa_id`, `data_referencia`)** — impede marcar a mesma tarefa duas
  vezes no mesmo dia.
- `valor_creditado` é uma **fotografia** do valor no momento da aprovação. Se o pai
  mudar o preço depois, o histórico não se reescreve.
- `crianca_id` e `familia_id` repetidos aqui de propósito: deixam a RLS simples e
  rápida, sem precisar de subconsulta.

### `carteiras`
`crianca_id` (PK) · `familia_id` · `saldo` int not null default 0 **CHECK (saldo >= 0)** ·
`atualizado_em`

- RLS: **apenas SELECT** para a família. Nenhum INSERT, UPDATE ou DELETE pelo cliente.
  Só função de banco escreve.
- Criada automaticamente por trigger quando a criança é cadastrada.

### `transacoes`
`id` · `crianca_id` · `familia_id` · `tipo` ('credito'|'debito') · `valor` (>0) ·
`origem` ('tarefa'|'bonus_consistencia'|'resgate'|'ajuste_manual') ·
`referencia_id` uuid · `saldo_apos` int · `descricao` · `criado_em`

- **UNIQUE (`origem`, `referencia_id`)** quando `referencia_id` não é nulo.
  É o que impede aprovar duas vezes e creditar duas vezes.
- `saldo_apos` permite auditar a carteira sem recalcular tudo.
- RLS: **apenas SELECT**. Extrato não se edita.

### Funções (todas `SECURITY DEFINER`, `search_path` fixo)

| Função | Faz |
|---|---|
| `marcar_tarefa(tarefa_id, data)` | Cria execução `pendente`. Valida família, se a tarefa está ativa e se a data bate com a recorrência |
| `aprovar_execucao(execucao_id)` | Só responsável. Grava `valor_creditado` lendo o valor **da tarefa**, cria transação e atualiza carteira — tudo numa transação só. Idempotente |
| `rejeitar_execucao(execucao_id)` | Só responsável. Não movimenta dinheiro |

**Regra que não se negocia:** o front chama `aprovar_execucao(id)` e nada mais.
Nunca informa valor. O banco lê o valor.

---

## Passo 2B (esboço, detalhar depois)

- `recompensas`: `familia_id` · `titulo` · `icone` · `custo` · `tipo`
  ('objeto'|'experiencia'|'privilegio') · `estoque` (null = ilimitado) · `ativa`
- `resgates`: `recompensa_id` · `crianca_id` · `custo_pago` (fotografia) ·
  `status` ('pendente'|'entregue'|'cancelado')
- `regras_bonus`: por família — `percentual_minimo` (padrão 80) · `valor_bonus` · `ativo`
- `bonus_semanais`: `crianca_id` · `semana_inicio` · `percentual_atingido` · `valor`
  — UNIQUE (`crianca_id`, `semana_inicio`)
- `resgatar_recompensa()` recusa se o saldo não cobre. Saldo nunca fica negativo.
- `fechar_semana_consistencia()` disparada por botão do responsável no MVP.
  Automatizar com agendamento fica para depois.

## Faixas sugeridas de preço (o pai pode ignorar)

| Item | Faixa |
|---|---|
| Tarefa simples do dia a dia | 5 a 15 Cruzeiros |
| Tarefa que dá trabalho de verdade | 20 a 40 |
| Bônus de consistência semanal | 50 a 100 |
| Recompensa pequena (sorvete, escolher o filme) | 50 a 150 |
| Recompensa grande (passeio, brinquedo) | 400 a 1.000 |

Objetivo do calibre: o ganho de uma semana típica compra uma recompensa pequena
por semana e uma grande por mês.
