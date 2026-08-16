# CInter — Registro de decisões

Uma linha por decisão, com data e motivo. Serve para não refazer discussão já vencida.

---

## 15/08/2026 — Sessão de retomada

| # | Decisão | Motivo |
|---|---|---|
| 1 | Fase 0 reconstruída do zero | Pasta do projeto estava vazia; `resumo.md` e `system-prompt.md` de mai/2026 se perderam |
| 2 | CInter é **produto comercial**, não uso doméstico | Definido pelo PO. Muda tudo: multi-família, LGPD, monetização |
| 3 | MVP atende **6 a 10 anos** | Criança de 2–5 é pré-alfabetizada e exige outra interface. Filho do PO (8 anos) é usuário de teste diário |
| 4 | Faixa 2–5 vira versão "Júnior" depois | Não cabe no mesmo produto |
| 5 | Fluxo: criança marca → responsável aprova → crédito | Autonomia da criança sem abrir porta para fraude; a aprovação vira momento de conversa |
| 6 | Aparelho alvo: celular/tablet da criança | PWA, mobile-first |
| 7 | **Conteúdo educacional entra no MVP** (fatia fina) | Reversão de recomendação anterior. Pesquisa de mercado mostrou ~7 concorrentes no Brasil na camada rotina+recompensa, vários gratuitos. Rotina sozinha não é produto vendável; o conteúdo é o único diferencial |
| 8 | Fase 3 = **uma** matéria, **um** ano escolar | Conteúdo pedagógico é caro. Fatia fina prova a tese sem inviabilizar |
| 9 | Conteúdo produzido por AI + curadoria humana | Competência que o PO já tem em outras empresas. É a vantagem injusta do projeto |
| 10 | Conta é sempre do responsável; criança é perfil interno | LGPD art. 14 e simplicidade de produto |
| 11 | Toda transação de Cruzeiro roda em função de banco | Usuário final é criança de até 10 anos com navegador. Lógica no front = saldo infinito |
| 12 | Sem multa; saldo nunca negativo | Tirar moeda como castigo ensina a esconder o erro |
| 13 | Obrigação básica paga bônus semanal, não por unidade | Efeito de superjustificação |
| 14 | No conteúdo, paga-se lição concluída, não acerto | Pagar acerto ensina a chutar e a fugir do difícil |
| 15 | Mantida a stack: React+Vite+Tailwind, JS puro, Supabase | Decisão de mai/2026 continua válida. Risco do JS puro mitigado com validação nas bordas e testes nas funções de moeda |
| 16 | Criadas as skills `cinter-produto` e `cinter-stack` | Nenhuma skill existente cobria o projeto; as de Los Santos/AM2 são de stack diferente |
| 17 | Freemium: rotina grátis, conteúdo pago | O corte cai naturalmente na tese do produto |

## 15/08/2026 — Fluxo de trabalho e auditoria de infra

| # | Decisão | Motivo |
|---|---|---|
| 18 | **Cowork orquestra, code executa** | Cowork decide produto/escopo/modelo e escreve os prompts; Claude Code no VS Code escreve e roda o código. Ver `fluxo-de-trabalho.md` |
| 19 | Todo prompt para o code sai em bloco único, copiar e colar | Pedido do PO |
| 20 | **Railway não será usado** | O CInter não tem backend próprio; o front fala direto com o Supabase. Railway seria custo e complexidade sem função |
| 21 | Infra: Supabase (feito) + GitHub + Vercel | Suficiente para todo o MVP |
| 22 | Modelo de dados atual será **refeito do zero** | Auditoria achou RLS desligada, criança com conta no auth, saldo editável e transação sem rastro. Só há dados de teste — não compensa migrar. Ver `auditoria-banco.md` |
| 23 | `responsaveis` e `criancas` viram tabelas separadas | Modelo antigo juntava tudo em `usuarios` com FK para `auth.users`, o que obrigaria a criança a ter conta própria — contraria a decisão 10 |

### Pendências abertas

- [ ] Nome comercial definitivo
- [ ] Matéria e ano escolar da Fase 3
- [ ] Identidade visual e mascote
- [ ] Preço da assinatura
- [ ] PWA apenas ou também lojas de aplicativo
