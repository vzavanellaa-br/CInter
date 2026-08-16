# CInter — Fluxo de trabalho

**Definido em 15/08/2026.**

## Divisão de papéis

| Onde | Papel | Faz |
|---|---|---|
| **Cowork** (aqui) | Orquestrador e regulador | Decide produto e escopo, desenha modelo de dados, revisa o que voltou, escreve os prompts para o code, mantém a documentação |
| **code** (Claude Code no VS Code) | Executor | Escreve, roda e testa o código. Usa os MCPs de Supabase, Vercel e GitHub |

"**code**" = Claude Code rodando no VS Code. É como o Vinicius se refere a ele.

## Como cada ciclo funciona

```
1. Cowork decide o passo e escreve o prompt
2. Vinicius copia o prompt e cola no code
3. code executa
4. Vinicius traz o resultado de volta para o Cowork
5. Cowork revisa, corrige o rumo e escreve o próximo prompt
```

**Regra de formato:** todo prompt para o code sai em bloco de código único, pronto
para copiar e colar sem edição. Um passo por prompt. Sem "e depois faça também".

## Infraestrutura

| Serviço | Situação | Observação |
|---|---|---|
| **Supabase** | ✅ Criado | Projeto `cinter`, ref `rslbbsuwvxkfswlgixxg`, região sa-east-1 (São Paulo) |
| **GitHub** | ❌ Falta | Repositório privado |
| **Vercel** | ❌ Falta | Só quando houver o que publicar |
| **Railway** | ⛔ **Não usar** | O CInter não tem backend próprio — o front fala direto com o Supabase. Railway seria custo e complexidade sem função. Se um dia surgir necessidade real (processamento pesado, integração que exige segredo no servidor), reavaliamos. |

## MCPs

O Vinicius já usa MCPs de Supabase, Vercel e Railway no projeto **uaupet**
(`Documents\Claude\Projects` vizinho). A configuração de MCP e deploy de lá é
referência para o CInter — mas **sem copiar o Railway**.

O Cowork também tem MCP do Supabase conectado, e usa isso para **auditar** o banco
(conferir tabelas, RLS, migrations) sem depender do code. Auditoria aqui, execução lá.

## Regras que atravessam os dois lados

1. Nenhum código sem aprovação prévia do Vinicius.
2. Um passo por vez; mostrar funcionando antes de seguir.
3. Explicação em linguagem simples — o PO não é programador.
4. O code deve ler o `CLAUDE.md` do repositório, que carrega as regras do projeto.
