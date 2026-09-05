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

## 16/08/2026 — Fase 1 concluída e desenho da Fase 2

| # | Decisão | Motivo |
|---|---|---|
| 24 | Sessão centralizada em `AuthProvider` (contexto único) | Cada tela com sua própria escuta criava corrida: a tela concluía "não tem família" antes da sessão carregar, gerando vaivém infinito entre `/inicio` e `/primeiro-acesso` |
| 25 | Recorrência de tarefa: **diária, semanal e avulsa** | Escolha do PO. Semanal exige dias da semana; avulsa exige data |
| 26 | **Bônus de consistência entra na Fase 2** | É o mecanismo que protege contra o efeito de superjustificação. Adiar viraria nunca |
| 27 | Preço definido pelo pai, com faixa sugerida pelo app | Mantém o controle com ele sem deixar a economia desandar |
| 28 | Fase 2 dividida em 2A (ciclo do dinheiro) e 2B (loja e bônus) | 2A é a parte mais crítica do produto; merece atenção e teste isolados |
| 29 | Uma tarefa pertence a UMA criança | Simplicidade. Agrupar por vários filhos só se doer no uso real |
| 30 | `valor_creditado` e `custo_pago` guardam fotografia do valor | Mudar o preço hoje não pode reescrever o histórico financeiro |
| 31 | Tarefa nunca é apagada, só desativada | Apagar destruiria o histórico de execuções |
| 32 | E-mail: desligar confirmação no desenvolvimento; SMTP próprio na Fase 4 | O e-mail embutido do Supabase é limitado a 2/hora e não serve para produção |

## 17/08/2026 — Horários nas tarefas

| # | Decisão | Motivo |
|---|---|---|
| 33 | Tarefa ganha **período** (manhã/tarde/noite) e **horário opcional** | Período é legível por criança que ainda não lê relógio; o horário exato fica como dica para quem lê |
| 34 | Período pode ficar vazio = "a qualquer hora" | Nem toda tarefa tem hora ("arrumar o quarto") |
| 35 | Horário é **orientação, não regra** | Bloquear marcação fora da janela puniria a criança por esquecer de apertar o botão, não por deixar de fazer. Contraria a regra de não existir multa |
| 36 | Bônus de pontualidade fica em aberto | Se um dia for feito, tem que ser crédito extra por acertar, nunca desconto por atrasar |
| 37 | CHECK garantindo que o horário cai dentro do período | Impede "noite às 07:00". Barato e evita confusão na tela |

### Pendências abertas

- [ ] Nome comercial definitivo
- [ ] Matéria e ano escolar da Fase 3
- [ ] Identidade visual e mascote
- [ ] Preço da assinatura
- [ ] PWA apenas ou também lojas de aplicativo

## 05/09/2026 — Retomada: varredura, orquestração e rumo para as lojas

| # | Decisão | Motivo |
|---|---|---|
| 38 | Adotada a **lógica de orquestração** com quatro documentos: `ESTADO.md` (o executor lê sempre), `FILA.md` (só a entrada dele), `PLANO.md` (só o Cowork), `CLAUDE.md` (como o repositório é) | `resumo.md` estava errado em 4 pontos após 3 semanas parado. Documento único vira mentira; separar por público é o que faz o custo cair |
| 39 | `resumo.md` aposentado, vira ponteiro para `ESTADO.md` | Um fato mora em um lugar só |
| 40 | **Conteúdo é escada de níveis, não série escolar.** Nível de entrada por teste de nivelamento; progressão por assertividade | Decisão do PO. Ementa de 1º ano varia demais entre escolas; e tira o CInter da briga de BNCC, onde as edtechs já venceram pelo canal escola |
| 41 | Níveis pré-escolares de **conteúdo** entram; interface para 2–5 anos **não** | Reconcilia com a decisão 4. Quem mais precisa do nível 1 é a criança de 7 anos com defasagem — mesma interface |
| 42 | **Sem vidas e sem corações** no conteúdo | Vida é multa com outro nome; contraria a decisão 12 |
| 43 | **Não haverá streak separado.** O bônus de consistência já é a ofensiva | `regras_bonus` + `fechar_semana_consistencia` já fazem isso, e pagam hábito em vez de unidade |
| 44 | Refazer lição já concluída paga zero | Senão repetir o nível 1 vira mina de ouro |
| 45 | **Jogos cortados do escopo**, vão para a fila de adiantamento | Daily Kids fez exatamente isso — 14 minijogos, R$24,90/mês — e tem 430 downloads. Jogo multiplica zero enquanto não há base. Discordância registrada em `PLANO.md` §8 |
| 46 | **App nativo por Capacitor**, embrulhando o front atual — nunca reescrita em React Native | Jogar fora 2.000 linhas testadas não se paga. Mas a loja rejeita webview puro: push, offline e PIN entram na mesma janela |
| 47 | **Play Store primeiro; App Store depois do primeiro assinante** | US$99/ano, Mac para build e revisão mais dura em app infantil |
| 48 | Uma trilha só (Matemática) no lançamento | Fatia fina prova a tese; a segunda trilha é 2027 |
| 49 | **Nome comercial e nome da moeda decididos até 22/09**, em conversa própria | O nome vira domínio e *bundle id*, que não muda depois de publicado. E o nome da moeda está no schema — barato hoje, janela de risco depois |
| 50 | Revisão pedagógica humana é **obrigatória** antes de publicar qualquer nível, e vira selo na loja | Conteúdo por AI sem revisor é risco; com revisor é o diferencial que o concorrente não copia rápido |
| 51 | Conta de desenvolvedor Google aberta em **setembro**, e no CNPJ da Otimus Hub se possível | Conta pessoal nova exige 12 testadores por 14 dias antes de publicar. É o risco de calendário mais subestimado do plano |
| 52 | Decidir **cobrança web vs. compra dentro do app** antes de escrever a tela de assinatura | 15–30% de comissão muda o preço; vender por fora e liberar no app é rejeição certa |

### Pendências abertas (atualizadas)

- [ ] Nome comercial definitivo — **prazo 22/09**
- [ ] Nome da moeda — **prazo 22/09**
- [ ] Identidade visual e mascote — **prazo 22/09**
- [ ] Combinado escrito com a revisora pedagógica e o revisor de matemática (escopo, crédito, contrapartida)
- [ ] Preço da assinatura e modelo de cobrança (T8 do `PLANO.md`)
- [ ] Quantos níveis a escada terá no lançamento — definir depois de medir o tempo de revisão de 1 lote
