# Auditoria do banco Supabase — 15/08/2026

Projeto `cinter` · ref `rslbbsuwvxkfswlgixxg` · região sa-east-1 (São Paulo) ·
criado em 31/05/2026 · status saudável.

Auditado pelo Cowork via MCP do Supabase.

---

## O que já existe

| Tabela | Linhas | RLS |
|---|---|---|
| `familias` | 1 | ❌ desligada |
| `usuarios` | 2 | ❌ desligada |
| `carteiras` | 1 | ❌ desligada |
| `transacoes` | 1 | ❌ desligada |

São dados de teste. Nada de real se perde ao refazer.

### Estrutura atual

```
familias   (id, nome, criado_em)
usuarios   (id → auth.users, familia_id → familias, nome, tipo['pai'|'filho'], avatar_url, criado_em)
carteiras  (id, usuario_id → usuarios [unique], saldo int, atualizado_em)
transacoes (id, carteira_id → carteiras, valor int, tipo['credito'|'debito'], descricao, criado_em)
```

---

## Problemas encontrados

### 1. RLS desligada nas quatro tabelas — CRÍTICO

Sem RLS, qualquer pessoa com a chave pública do projeto lê e altera **todas as
linhas de todas as famílias**. Como o produto é multi-família e guarda dados de
criança, isso é o defeito mais grave possível.

Hoje o risco é baixo (só dados de teste, sem usuário real). Mas nada pode entrar
antes de resolver.

*Não basta ligar a RLS:* ligar sem criar as políticas bloqueia tudo. Ligar e
escrever as políticas é a mesma tarefa.

### 2. Criança teria conta própria no `auth` — viola a decisão de LGPD

`usuarios.id` referencia `auth.users`, e a mesma tabela guarda `tipo = 'filho'`.
Ou seja: cada criança precisaria de uma conta de autenticação própria, com e-mail.

Isso contraria a decisão nº 10 (`decisoes.md`): **a conta é do responsável; a
criança é perfil interno.** Além do lado jurídico, obriga a criança a ter e-mail.

**Correção:** separar em duas tabelas — `responsaveis` (ligada a `auth.users`) e
`criancas` (sem vínculo com auth, identificada por PIN dentro da conta do responsável).

### 3. `carteiras.saldo` é um campo comum, editável

Qualquer chamada pelo cliente pode gravar o saldo que quiser. É exatamente o
cenário "criança de 10 anos com o DevTools aberto".

**Correção:** saldo derivado de `transacoes`, ou cache que **só** função de banco
com `SECURITY DEFINER` escreve. Mais trava para não aceitar saldo negativo.

### 4. `transacoes` não registra origem nem saldo resultante

Só tem `descricao` em texto livre. Não dá para saber que crédito veio de qual
tarefa aprovada, nem auditar o saldo depois de cada movimento — e não há como
impedir que a mesma aprovação credite duas vezes.

**Correção:** acrescentar `origem` (tipo do evento), `referencia_id` (qual
execução ou resgate) e `saldo_apos`. Chave única em (`origem`, `referencia_id`)
para garantir que aprovar duas vezes não credite duas vezes.

### 5. Falta metade do modelo

Não existem: `tarefas`, `execucoes_tarefa`, `recompensas`, `resgates`. Sem elas
não há Fase 2.

---

## Recomendação

Refazer o modelo do zero, em migrations versionadas. Os dados atuais são de teste
e não justificam migração cuidadosa.

Ordem: apagar o que existe → recriar conforme `especificacao.md` § 6 → RLS e
políticas na mesma migration → funções de moeda → testar com duas famílias distintas.

Isso vira o **Prompt 2** para o code, depois que o repositório estiver de pé.
