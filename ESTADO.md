# CInter — ESTADO

> **Carregue a skill `cinter-fluxo` e leia este arquivo, nesta ordem, sempre.**
> Ele diz onde o projeto está hoje.
> Como o repositório é: `CLAUDE.md`. Regras de produto: skill `cinter-produto`.
> **Não leia o `PLANO.md`** — ele é do orquestrador e você não precisa dele.

**Atualizado em:** 05/09/2026 (após T-00)

---

## Onde estamos

Fases 1 e 2A–2C fechadas e auditadas contra o banco real.
Existe: login do responsável, família, cadastro de criança, tarefas com período
e horário, marcação pela criança, aprovação/rejeição pelo responsável, carteira,
extrato. 11 tabelas com RLS ligada, 13 funções `SECURITY DEFINER`.

**Fase atual: 2D — fechar o ciclo do dinheiro.**

---

## As três coisas quebradas hoje

1. **A loja não existe em tela.** O banco sabe tudo (`recompensas`, `resgates`,
   `resgatar_recompensa`, `entregar_resgate`, `cancelar_resgate`) e não há uma
   única tela. Zero linhas nas duas tabelas. A criança ganha e não gasta.
2. **O bônus semanal nunca rodou.** `fechar_semana_consistencia` está correta e
   **ninguém a chama**. Sem ela, o app paga por unidade — o oposto da regra.
3. **A criança pode aprovar as próprias tarefas.** `/crianca/:id` roda com a
   sessão do responsável e sem PIN.

---

## Próxima task

**T-01 — Loja de recompensas (lado do responsável).**
Cadastrar, editar, desativar recompensa. Nada do lado da criança ainda.
O prompt completo está em `FILA.md`.

---

## Travas — o que NÃO fazer

- ⛔ **Não escreva a palavra "cruzeiro" em código novo.** O nome da moeda vai
  mudar e a decisão ainda não saiu. Em código novo, use a variável/rótulo que já
  existir; não crie coluna, função ou texto novo com esse nome.
- ⛔ **Não crie tabela de conteúdo educacional.** A fundação do conteúdo é uma
  fase própria com modelo desenhado. Tabela criada antes é tabela para adaptar depois.
- ⛔ **Não mexa em nada de assinatura, pagamento ou loja de aplicativo.**
- ⛔ **Não publique nada** (Vercel, Play, App Store) sem OK explícito.
- ⛔ **Não faça mudança de estrutura de banco fora da janela combinada.** Se uma
  task exigir `alter table`, **pare e avise** antes de rodar.
- ⛔ Nada de jogo, minijogo ou animação de distração. Está cortado do escopo.

---

## Lembretes de segurança — valem em toda task

1. **Toda movimentação de moeda roda em função do banco.** O front nunca informa
   quanto creditar. O usuário final é criança com acesso ao DevTools.
2. **RLS ligada na migration que cria a tabela**, filtrando por
   `familia_do_usuario()`, nunca por parâmetro vindo do cliente.
3. **Criança nunca tem conta no `auth`, nunca tem e-mail, telefone ou localização.**
4. **Segredo não se imprime.** Nunca exiba o conteúdo de `.env.local` nem de
   `Supabase Info.md`. Para conferir um alvo, filtre só o identificador.
5. **Antes de qualquer coisa irreversível** (schema, apagar dado, deploy):
   apresente o que vai fazer e **PARE**. Só siga após OK explícito.

---

## Estado da infra

| Serviço | Situação |
|---|---|
| Supabase | ✅ `cinter`, ref `rslbbsuwvxkfswlgixxg`, sa-east-1 |
| GitHub | ✅ `github.com/vzavanellaa-br/CInter`, branch `main` |
| Vercel | ✅ `c-inter.vercel.app` no ar, rotas internas OK (`vercel.json`, commit `833d1de`), variáveis configuradas nos 3 ambientes |
| SMTP próprio | ❌ falta — hoje: 2 e-mails/hora, não serve para usuário real |
| PWA / manifest | ❌ falta — fase 2F |
| Railway | ⛔ decidido não usar |

**Conta de teste:** `teste.cinter.2c@gmail.com` — família "Família Cruzeiro
Teste", criança Miguel, saldo 10, com extrato.

## Como rodar
`npm run dev` → `http://localhost:5173`
