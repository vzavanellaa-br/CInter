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

## 05/09/2026 — Skill de processo e deploy

| # | Decisão | Motivo |
|---|---|---|
| 53 | Criada a skill **`cinter-fluxo`** — o ritual de execução de toda task | O documento de orquestração prevê "carregar a skill de processo" na primeira linha do prompt. Sem ela, o ritual (o que ler, os lembretes de segurança, quando parar, como reportar) era recopiado em cada prompt — o que fazia os prompts crescerem, que é justamente o sinal de que algo quebrou. Agora o prompt carrega só o que é da task |
| 54 | Todo prompt para o code passa a começar com `Carregue a skill cinter-fluxo. Depois leia ESTADO.md.` | Uma linha substitui vinte |
| 55 | `vercel.json` com rewrite de SPA; deploy validado em 3 URLs | Sem ele só a raiz abria. Conferido pelo Cowork por fora, não pelo relatório do code |
| 56 | Na Vercel, as duas variáveis ficam com Type **Config**, não Secret | Secret é write-only e conflita com o prefixo `VITE_`, que significa "publique no navegador". A anon key é pública por desenho; quem protege é a RLS |

## 06/09/2026 — Onde as skills do executor moram

| # | Decisão | Motivo |
|---|---|---|
| 57 | **A skill `cinter-fluxo` mora no repositório**, em `.claude/skills/cinter-fluxo/SKILL.md` | Skill salva na conta Claude sincroniza para o Cowork, **não** para o Claude Code na máquina. O code abriu a T-01, não achou a skill e parou — corretamente. Skill do executor tem que viajar com o repositório: versionada, revisável em diff e disponível em qualquer máquina que clone o projeto |
| 58 | Regra geral: **skill do executor vai para o repositório; skill do orquestrador fica na conta** | `cinter-fluxo` (ritual) e `cinter-stack` (padrões de código) são do executor. `cinter-produto` (escopo, economia, fases) é de quem decide, e continua na conta |
| 59 | Toda skill nova para o code entra por commit, nunca só pelo painel | Foi assim que a `cinter-fluxo` ficou invisível por um ciclo inteiro |

## 06/09/2026 — Regras da casa, desconto e a economia com quatro fontes

| # | Decisão | Motivo |
|---|---|---|
| 60 | **Entra a página de Regras** — princípios da casa, comportamento, moral e ética | Terceiro pilar que nenhum concorrente brasileiro tem. Regra não paga por cumprimento: o reforço é o bônus mensal |
| 61 | **Bônus mensal discricionário**: o responsável avalia o mês e credita o valor que quiser, com um bilhete curto | Casa com a decisão 13 (recompensa hábito, não unidade) e com a economia de uma recompensa grande por mês |
| 62 | **Registro de ocorrência sem valor**: o responsável marca que a regra foi quebrada, sem mexer em saldo | Transforma a avaliação mensal em conversa com fatos em vez de memória |
| 63 | **DECISÃO DO PO, CONTRA RECOMENDAÇÃO: existe desconto de Cruzeiro** por desrespeito, agressão ou comportamento grave | O PO quer que a criança saiba que perde ao desrespeitar. Discordância registrada abaixo; a decisão 12 (sem multa) fica revogada em parte — só para comportamento grave, nunca para tarefa não feita |
| 64 | **Sete travas obrigatórias no desconto** (ver abaixo). Sem TODAS elas, o desconto não entra | Multa sem trava é o mecanismo que ensina a criança a esconder o erro. As travas existem para reduzir esse efeito ao mínimo |
| 65 | Nunca usar as palavras "multa" ou "penalidade" na interface. O termo é **desconto** | A palavra ensina o enquadramento mesmo quando o valor é pequeno |
| 66 | **Tarefa não feita continua sem desconto.** O desconto é só de comportamento | Deixar de fazer a cama nunca tira moeda; a consequência segue sendo não ganhar |
| 67 | **Lição de conteúdo paga; não fazer apenas não paga** (Fase 3) | Confirmado pelo PO. Mantém a decisão 14 |
| 68 | Antes da Fase 3, fazer a **calibragem da economia** | Com quatro entradas (tarefa, bônus semanal, bônus mensal, lição) e uma saída (loja), o Cruzeiro infla e a loja perde sentido |

### As sete travas do desconto (decisão 64)

1. **Nunca automático.** Só um responsável, decidindo na hora. Regra quebrada não desconta sozinha.
2. **Motivo obrigatório**, em texto livre curto, e ele aparece no extrato da criança. Sem motivo, o botão não envia.
3. **Teto por ocorrência**, definido pela família. Sugestão padrão do app: 100.
4. **Teto mensal acumulado**, também da família. Sem ele, dez descontos de 100 zeram tudo e a trava 3 vira decoração.
5. **Saldo nunca negativo.** Se o desconto passa do saldo, desconta até zerar e registra o valor efetivo. **Criança não tem dívida.**
6. **Alerta de desproporção antes de confirmar**, com número na tela: "Isso é X% do que ele tem" e "equivale a Y semanas de tarefas". Confirmação em dois passos.
7. **Arrependimento em 24h.** O responsável desfaz e o valor volta, via `origem='estorno'`, que já existe. O desconto acontece no calor do momento; a trava existe para isso.

### Discordância registrada (decisão 63)

O Cowork recomendou não haver desconto, por três motivos: multa ensina a criança a
esconder o erro em vez de corrigi-lo; contamina o significado da moeda, que precisa
valer "eu construí isso"; e `carteiras.saldo >= 0` é trava de banco, o que faria um
desconto maior que o saldo falhar na cara do responsável.

O PO decidiu manter o desconto, restrito a comportamento grave e com as sete travas
acima. Registrado para não se rediscutir, e para que, se o efeito aparecer no uso
real, se saiba de onde veio.

## 06/09/2026 — Nome da moeda decidido

| # | Decisão | Motivo |
|---|---|---|
| 69 | **A moeda passa a se chamar "Realeta"** (plural: Realetas) | Decidido pelo PO. Verificado: não colide com produto, marca ou app existente. Legível para o pai ("real pequeno"), fácil para a criança, plural natural, e sugere imagem — realeza, coroa, castelo — o que dá direção para mascote e identidade visual. "Cruzeiro" carregava hiperinflação para o pai e não significava nada para a criança |
| 70 | **Troca em dois tempos:** o texto visível muda agora (T-01b); o nome da **coluna** `valor_cruzeiro` só muda na janela de schema da T-04 | Texto é front, custo zero e reversível. Renomear coluna é irreversível e vai agrupada com PIN e as tabelas de regras. Trava T5 |
| 71 | **A trava "não escreva cruzeiro em código novo" está encerrada** | Ela existia porque o nome era indefinido. Agora o nome existe: use `NOME_MOEDA`, sempre |
| 72 | Fica aberto se o **nome do app** vira "Realeta" também | Não decidir agora. Entra na conversa de nome e identidade visual, prazo 22/09. O nome do app define domínio e bundle id, que não mudam depois de publicado — é decisão maior que a da moeda |

## 06/09/2026 — Linguagem da interface e vitrine da criança

| # | Decisão | Motivo |
|---|---|---|
| 73 | **Nunca "papai", "mamãe" ou "seus pais" na interface.** O termo é "alguém da família", ou o nome do responsável quando o app souber qual | Levantado pelo code. Não é delicadeza, é requisito comercial: o produto é multi-família e vai ser usado por mãe sozinha, avó que cria o neto, padrasto, tutor. Um texto que pressupõe "papai" exclui parte do mercado e machuca uma criança de graça |
| 74 | O texto antigo "Esperando o papai conferir" em `MinhasTarefas.jsx` **será corrigido**, mas em task própria | Não incha a T-02. Vira T-02b |
| 75 | **Recompensa sem estoque some da vitrine da criança** em vez de aparecer bloqueada | Escolha do code, aprovada. Criança de 6 anos vendo algo que não pode pedir sem entender o motivo é frustração sem função |
| 76 | Na seção "Quase lá", mostrar **só as três mais próximas** do saldo atual, com "Ver tudo" para o resto | Parede de itens bloqueados é desmotivador conhecido em produto infantil. Três alvos alcançáveis puxam; vinte inalcançáveis afundam |
| 77 | **A senha de conta nunca é passada para o executor.** O teste de tela é do PO | Credencial não circula em prompt nem em chat. A fricção recorrente tem solução própria — seed de dados e login de desenvolvimento — que vira task quando doer o bastante |

## 06/09/2026 — Entrega de resgate

| # | Decisão | Motivo |
|---|---|---|
| 78 | **Entregar pede confirmação**, mas em forma de pergunta de fato, não de "tem certeza": *"Você já entregou X para o Miguel?"* | O code verificou que entregar é irreversível — depois disso `cancelar_resgate` recusa. Dois botões irmãos, mesmo tamanho, num celular segurado com uma mão: o toque errado consome a recompensa da criança sem ela receber nada. "Tem certeza?" as pessoas fecham no automático; "você já entregou?" faz o adulto olhar para o mundo real antes de responder |
| 79 | **Textos não presumem gênero da criança.** Repetir o nome em vez de "ele"/"ela" | Escolha do code, aprovada. `criancas` não guarda gênero de propósito — é dado que não precisamos e não vamos coletar. Vale a mesma lógica da decisão 73 |
| 80 | Fica em aberto: a criança não fica sabendo quando o pedido é **entregue** | Hoje o item some de "Esperando" e nada avisa. Vira polimento depois da 2D, não incha a T-03 |

## 06/09/2026 — Desenho da janela de schema (T-04)

| # | Decisão | Motivo |
|---|---|---|
| 81 | A coluna `tarefas.valor_cruzeiro` passa a se chamar **`valor_moeda`**, não `valor_realeta` | Não gravar a marca no schema. "Realeta" pode mudar de novo; "moeda" não. O nome comercial vive em `src/lib/moeda.js` e em lugar nenhum do banco |
| 82 | **PIN da criança é trava de comportamento, não fronteira de segurança.** Isso fica escrito, não implícito | A criança não tem conta no `auth` (decisão 10), então o token da sessão é sempre o do responsável. O PIN impede a criança de navegar para a área de adulto; **não** impede quem sabe abrir o DevTools. Para 6–10 anos é proporcional. Fingir que é segurança seria mentir para nós mesmos e para o pai |
| 83 | O PIN é **guardado com hash** (`pgcrypto`), definido e conferido por função de banco. Nunca trafega nem é comparado no front | Mesma lógica da moeda: o que o navegador controla, a criança controla |
| 84 | **A T-04 entrega SÓ a migration.** Nenhuma tela | Ela é a única operação irreversível do lote. Uma revisão, uma aplicação. As telas que usam essas tabelas são reversíveis e vêm depois, em tasks próprias |
| 85 | A migration entra com **estrutura ligada e comportamento desligado** onde a tela ainda não existe | Resolve o conflito entre "a janela de schema é agora" e "essa função ainda não pode rodar". Padrão já usado antes no projeto |

## 07/09/2026 — Revisão da migration da T-04

| # | Decisão | Motivo |
|---|---|---|
| 86 | Aprovados 8 dos 9 desvios do executor. O ponto 1 (tabela `descontos`) era **falha do meu prompt**, não iniciativa dele: sem ela as travas 4 e 7 são impossíveis | Registrado para eu não repetir. Ao escrever uma trava, escrever também onde ela guarda o estado |
| 87 | **Teto mensal padrão baixa de 300 para 150** | Com ganho semanal típico de ~85 mais bônus, a criança faz algo entre 400 e 540 por mês. Teto de 300 apaga até 3/4 do mês — exatamente o que a trava 4 existe para impedir. 150 permite um desconto grande e um pequeno, ou três pequenos. Passou disso, o problema não é o saldo: é outra coisa, e o app não deve ser o instrumento |
| 88 | **A chave `ativo` não é ligada para nenhuma família enquanto a tela do desconto não existir** | A trava 6 (alerta de desproporção) é de interface e não cabe no banco. Ligar antes da tela seria entregar a função sem uma das sete travas. Estrutura ligada, comportamento desligado |
| 89 | Excelente a revogação de `select` em `criancas` com reconcessão coluna a coluna | É o que faz o `pin_hash` ser invisível de fato, não invisível por ninguém ter pedido |

## 08/09/2026 — Janela de schema 1 aplicada (T-04): os oito desvios do executor

Registrados pelo executor, com as palavras dele. Propostos na apresentação da
migration e aprovados antes de aplicar. Viram parte do desenho.

| # | Decisão | Motivo |
|---|---|---|
| 90 | Existe a tabela **`descontos`**: uma linha por desconto aplicado, com valor pedido, valor efetivo, motivo, quem, quando, e o estorno se houver | O teto mensal (trava 4) precisa somar o que já saiu no mês, e o arrependimento (trava 7) precisa achar o desconto para desfazer. Sem tabela, as duas travas não têm onde guardar estado. O extrato sozinho não serve: ele registra o efeito, não a intenção |
| 91 | O CHECK de `transacoes.origem` ganhou **`bonus_mensal`** além de `desconto` | O bônus mensal credita moeda e o extrato precisa dizer de onde veio. Sem origem própria ele entraria como `ajuste_manual`, que é mentira, ou como `bonus_consistencia`, que é outra coisa |
| 92 | `regras_bonus` ganhou **`valor_bonus_mensal`** (padrão 100) e **`bonus_mensal_ativo`** (padrão desligado) | O valor do bônus mensal não pode vir do cliente — é a regra de toda moeda. Tem que morar na configuração da família. Reaproveita a tabela que já é a configuração de bônus, em vez de criar outra com gatilho e backfill próprios |
| 93 | Função **`crianca_tem_pin`**, que devolve só verdadeiro ou falso | A tela de PIN precisa saber se pede o PIN ou oferece criar um. A coluna do hash ficou invisível para o cliente de propósito, então essa pergunta só pode ser respondida por função |
| 94 | Função **`estornar_desconto`**, com prazo de 24 horas e estorno estável (`origem='estorno'`, `referencia_id` = id do desconto) | É a trava 7. "Função de desconto" sem a função de desfazer é desconto com seis travas, não sete. Segue o padrão de `cancelar_resgate`: `FOR UPDATE` contra corrida, idempotente, índice único impede crédito duplo |
| 95 | **Privilégio por coluna em `criancas`**: o cliente lê, insere e edita só nome, apelido, ano, avatar e família. `pin_hash` fica fora do SELECT, INSERT e UPDATE | RLS decide quais linhas; isto decide quais colunas. Sem isto, `select pin_hash from criancas` devolveria o hash ao navegador. Provado depois de aplicar: `select *` pelo cliente dá "permission denied", `select pin_hash` idem, e as colunas permitidas voltam normalmente. O front já listava colunas explicitamente em todo acesso |
| 96 | **Ocorrência de regra não se edita**: RLS de leitura, inserção e exclusão, sem UPDATE. `registrada_por` vem de `auth.uid()` por padrão | Registro errado se apaga e se registra de novo — histórico de comportamento não deve ter "editado depois". O autor vem do banco, não do cliente, para ninguém registrar em nome de outro |
| 97 | `limites_desconto` nasce por **gatilho** para família nova e por **backfill** para as que já existem, ambos com `on conflict do nothing` | Mesmo padrão de `regras_bonus` e `carteiras`: a linha de configuração existe antes de qualquer tela precisar dela, e `aplicar_desconto` pode confiar que ela está lá. Provado: 2 famílias, 2 linhas, todas com `ativo = false` e teto mensal 150 |
