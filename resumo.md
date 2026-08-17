# CInter — Criança Interessada · Resumo de contexto

> Leia este arquivo no início de toda sessão. Ele é o contexto mínimo.
> Detalhe completo: `especificacao.md`. Histórico de decisões: `decisoes.md`.

**Atualizado em:** 15/08/2026

---

## O que é

App onde a criança (6–10 anos) cumpre rotina de casa **e** estuda dentro do
próprio app, ganhando uma moeda fictícia — o **Cruzeiro** — que ela troca por
recompensas definidas pelos pais.

**Produto comercial**, não uso doméstico. Multi-família desde o primeiro dia.

## Diferencial (a tese do produto)

Existem ~7 apps de rotina+recompensa no Brasil, vários grátis. O que nenhum faz:
**amarrar conteúdo educacional à mesma economia da rotina.** É isso que se vende.
Rotina sozinha não é produto; é a isca gratuita.

## Estado atual

**Fase 0 reconstruída.** Os documentos originais (mai/2026) se perderam e foram
refeitos em 15/08/2026.

**Fase 1 — Passos 1 a 3 concluídos e auditados (16/08/2026).**

- Repositório `cinter` no GitHub (privado), Vite + React + Tailwind v4 rodando local
- Banco refeito do zero: `familias`, `responsaveis`, `criancas` — RLS ligada nas três,
  7 políticas todas derivadas de `auth.uid()`, verificado de forma independente
  pelo Cowork via MCP. Ver `auditoria-banco.md`
- Funções `familia_do_usuario()` e `criar_familia()`, ambas com `search_path` fixo
- 3 migrations versionadas

**Falta no Passo 4:** telas de login, cadastro de família e cadastro de criança.

⚠️ **Nunca versionar `Supabase Info.md`** — contém chaves e string de conexão.
Já está no `.gitignore`; o ideal é movê-lo para fora da pasta do repositório.

## Fluxo de trabalho

Cowork orquestra e decide; **code** (Claude Code no VS Code) executa.
Ver `fluxo-de-trabalho.md`. Todo prompt para o code sai pronto para copiar e colar.

## Infra

| Serviço | Situação |
|---|---|
| Supabase | ✅ projeto `cinter`, ref `rslbbsuwvxkfswlgixxg`, sa-east-1 |
| GitHub | ❌ falta |
| Vercel | ❌ falta |
| Railway | ⛔ não usar — não há backend próprio |

## Regras de trabalho inegociáveis

1. **Nenhum código sem aprovação prévia do Vinicius.** Apresentar o plano, esperar o OK.
2. **Explicar em linguagem simples.** O PO não é programador. Jargão só com tradução.
3. **Dev local primeiro.** Deploy só depois de validação completa.
4. **Toda movimentação de Cruzeiro roda no banco**, nunca no navegador. Ver `especificacao.md` § Segurança.
5. **A conta é sempre do responsável.** Criança é perfil dentro da conta, nunca conta própria (LGPD art. 14).

## Stack

| Camada | Escolha |
|---|---|
| Front | React + Vite + Tailwind, **JavaScript puro** (sem TypeScript) |
| Back | Supabase (auth, Postgres, storage, RLS) |
| Regras de moeda | Funções Postgres (RPC) com `SECURITY DEFINER` |
| Deploy | Só após validação local |

## Perfil do usuário

- **Responsável:** cria tarefas, define preços e recompensas, aprova execuções.
- **Criança (6–10):** marca tarefa como feita, estuda, vê saldo, gasta na loja.
- **Aparelho:** celular/tablet da criança. Mobile-first, PWA instalável.
- Fluxo central: criança marca → responsável aprova → Cruzeiro cai na carteira.

## Skills do projeto

- `cinter-produto` — economia do Cruzeiro, gamificação com base em evidência, escopo por fase
- `cinter-stack` — padrões React+Vite+Tailwind+Supabase em JS puro, RLS, RPC de moeda

## Próximo passo

Fase 1 aguardando aprovação: setup do ambiente + modelo de dados.
Ver `especificacao.md` § Fases.
