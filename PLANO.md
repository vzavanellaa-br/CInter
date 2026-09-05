# CInter — PLANO

> **Só o orquestrador lê este arquivo.** O executor lê `ESTADO.md` e `FILA.md`.
> Escrito em 05/09/2026, depois da varredura de código, banco e mercado.

---

## 1. A decisão que reorganizou o plano

Você definiu em 05/09: **o conteúdo não é organizado por ano escolar. É uma
escada de níveis, do mais básico ao avançado, e o lugar da criança na escada é
definido por avaliação e por assertividade — não pela série dela.**

Isso está certo e é melhor do que o plano anterior, por três motivos:

1. Resolve o problema que você levantou: ementa de 1º ano privado ≠ 1º ano público.
2. É como Duolingo e Khan realmente funcionam (teste de nivelamento + progressão
   por domínio), e não como as edtechs brasileiras funcionam (turma por série).
3. **Tira o CInter da briga de BNCC**, onde Matific, Árvore e Elefante Letrado
   já ganharam pelo canal escola. Escada por domínio é outro jogo.

**Mas cobra um preço, e ele precisa estar escrito:** escada exige *motor* — teste
de nivelamento, critério de domínio, e regra de subir/descer. Isso é software de
verdade, não conteúdo. E exige **muito mais conteúdo** do que "um ano escolar",
porque toda a escada precisa existir para a escada funcionar.

**Como isso cabe:** o motor entra inteiro na Fase 3A. O conteúdo entra por faixa,
começando pelos níveis mais baixos. Uma escada de 12 níveis com poucos exercícios
por nível prova a tese; uma escada de 60 níveis é o produto de 2027.

### Ponto de atrito com decisão já registrada
Você disse "a partir da pré-escola". A decisão 4 (15/08) diz que 2–5 anos é
pré-alfabetizado e vira versão Júnior, outro produto. **As duas coisas convivem
se separarmos conteúdo de interface:** os níveis 1–3 da escada podem ser conteúdo
de nível pré-escolar (contar até 10, reconhecer números) **dentro da interface de
6–10 anos** — porque quem mais precisa desses níveis é a criança de 7 anos com
defasagem, que é exatamente o caso que você descreveu. **Interface para criança de
4 anos continua fora do MVP.** Registrado como decisão 40.

---

## 2. Travas — o grafo de dependências

| # | Trava | Por quê |
|---|---|---|
| **T1** | **Nome comercial e nome da moeda antes de qualquer código novo que os use** | O nome define domínio, handle, INPI e o *bundle id* do app (`com.x.y`). Bundle id **não muda depois de publicado**: mudar = app novo, zera avaliações e instalações. O nome da moeda vive em `tarefas.valor_cruzeiro` e em todas as telas — trocar hoje custa 1 migration com 13 linhas de dado de teste; depois de ter usuário, vira janela de schema com risco |
| **T2** | **Loja (2D) antes de conteúdo** | O ciclo do dinheiro está pela metade: 0 recompensas, 0 resgates. Ligar conteúdo, que é uma **segunda fonte** de moeda, num ciclo sem sumidouro = inflação imediata. Sumidouro primeiro |
| **T3** | **PIN da criança antes de qualquer família de fora** | Hoje a criança aprova as próprias tarefas. Em casa é engraçado; com cliente é a fraude que mata a confiança |
| **T4** | **Fundação de conteúdo antes de produzir conteúdo** | Custo de retrofit é proporcional ao que já existe. Cada lição escrita antes do modelo é uma lição para migrar depois |
| **T5** | **Janela de schema agrupada** | Renomear moeda (T1) + PIN em `criancas` (T3) + tabelas de conteúdo (T4) entram numa janela só, enquanto só há dado de teste. Nunca avulsas |
| **T6** | **Deploy antes de teste externo** | Não se pede para a sogra rodar `npm run dev` |
| **T7** | **SMTP próprio antes do primeiro usuário real** | 2 e-mails/hora: o segundo cadastro do dia falha |
| **T8** | **Decidir cobrança web vs. IAP antes de escrever a tela de assinatura** | Apple e Google exigem compra dentro do app para conteúdo digital, com 15–30% de comissão. R$25 vira R$17,50 líquidos. Vender por fora e "liberar" no app é motivo de rejeição. É decisão de dinheiro, não de código |
| **T9** | **App nativo é embrulho (Capacitor), não reescrita — e vai com função nativa junto** | Reescrever em React Native joga fora 2.000 linhas testadas. Mas as lojas **rejeitam webview que é só o site**: notificação push, funcionamento offline e PIN entram na MESMA janela do empacotamento |
| **T10** | **Consertar antes de reescrever** | `fechar_semana_consistencia` existe e nunca rodou. Ou ganha gatilho, ou é código que finge que o bônus funciona. Resolver antes de mexer na região |
| **T11** | **Estrutura entra desligada quando o comportamento ainda não pode ir** | Campos de assinatura entram na janela de schema da Fase 4, com a cobrança atrás de uma trava desligada |

---

## 3. A conta

Você disse **10 h/dia em paralelo com outros projetos**. Vou registrar minha
discordância uma vez, com o motivo, e depois seguir com o que você decidiu.

**A discordância:** você toca AM2 em transição, UAU! Pet, Los Santos, o LocHub e
um projeto político. 10 h/dia no CInter significa 70 h/semana em um projeto entre
cinco. O risco não é você trabalhar menos — é o plano ter data de dezembro
enquanto a realidade entrega em março, e a diferença ser descoberta em novembro.

**Como resolvi:** o plano tem **dois relógios**. As datas de calendário abaixo são
do ritmo agressivo (30 h/semana efetivas de projeto). A coluna "semanas no ritmo
sustentável" é o mesmo plano a 12 h/semana. Compare os dois em toda revisão.

| Bloco | Conversas do code | Horas | Agressivo (30h/sem) | Sustentável (12h/sem) |
|---|---|---|---|---|
| 2D — Loja | 3 | 10 h | 08–14/set | 2,5 sem |
| 2E — PIN + higiene + bônus vivo | 3 | 8 h | 15–21/set | 2 sem |
| 2F — Deploy, PWA, SMTP | 3 | 8 h | 22–28/set | 2 sem |
| 3A — Fundação de conteúdo (modelo + motor) | 4 | 14 h | 29/set–12/out | 3 sem |
| 3B — Primeira trilha + revisão pedagógica | 3 + curadoria | 23 h | 13/out–02/nov | 4 sem |
| 3C — Amarrar lição ao Cruzeiro | 2 | 6 h | 03–09/nov | 1,5 sem |
| 4A — LGPD, termos, consentimento | 2 | 8 h | 10–16/nov | 2 sem |
| 4B — Assinatura e cobrança | 4 | 14 h | 17–30/nov | 3 sem |
| 4C — Empacotar e publicar na Play Store | 4 | 16 h | 01–14/dez | 3,5 sem |
| 4D — App Store | 3 | 12 h | jan/2027 | +3 sem |
| **Total** | **31** | **~120 h** | **Play Store até 22/12/2026** | **Play Store em fev/2027** |

**Esperas que não dependem de você e já estão embutidas:** revisão da Play Store
(1–7 dias, primeira submissão costuma ser a pior), verificação de conta de
desenvolvedor Google (até 2 semanas, e desde 2024 exige teste fechado com 12
testadores por 14 dias para conta pessoal nova), revisão jurídica da LGPD,
revisão pedagógica de cada nível.

> ⚠️ **A trava de 12 testadores da Google é o risco de calendário mais subestimado
> do plano.** Se a conta de desenvolvedor for pessoal e nova, você precisa de 12
> pessoas instalando e usando por 14 dias corridos antes de poder publicar. **Abra
> a conta e comece a juntar os 12 testadores em setembro**, não em dezembro.
> Conta de empresa (com CNPJ — a Otimus Hub serve) escapa dessa exigência.

---

## 4. O que NÃO vai ser feito

Nomeado, com a palavra que você usou no pedido.

### 🔴 Corta primeiro — **"+joguinhos educativos que estimulem raciocínio e alguns para distração"**
O dado: **Daily Kids** é o único concorrente brasileiro que já fez exatamente isso
— 14 minijogos, 50 cards colecionáveis, R$24,90/mês. Tem **430 downloads totais**
e 4 avaliações.

Jogo é multiplicador: multiplica engajamento quando existe base, e multiplica zero
enquanto não existe. Pior, "alguns para distração" trabalha contra a única frase
que vende o produto para o pai — *"é o app que faz meu filho estudar"*. Pai não
paga R$25 para o filho se distrair; ele já tem YouTube de graça.

**Volta como item 5 da fila de adiantamento**, depois que houver assinante pagante.

### 🟠 Corta antes — **iOS no primeiro lançamento**
Publica só Android. Apple custa US$99/ano, exige Mac para gerar o build e a
revisão é mais lenta e mais rigorosa em app infantil. Android primeiro; iOS quando
existir assinante pagando.

### 🟠 Corta antes — **segunda trilha (Português/alfabetização)**
Uma trilha só — Matemática — prova a tese. Sua sogra revisa a segunda em 2027.

### 🟡 Corta por último — **ligas, ranking e comparação entre crianças**
Além de exigir base de usuários que não existe, comparar criança com criança é
justamente a crítica que derrubou o Prodigy na imprensa. Se um dia entrar, é
comparação da criança **com ela mesma na semana passada**.

### 🔒 Intocável — se cair, o objetivo cai junto
Loja de recompensas · PIN da criança · motor de nível adaptativo · uma trilha de
conteúdo revisada por humano · consentimento LGPD · cobrança funcionando.

---

## 5. Fila de adiantamento

Se uma fase fechar antes, puxe **desta ordem**, não do que estiver mais fresco na cabeça.

1. **Notificação push de tarefa pendente para o responsável.** É o que traz o pai
   de volta ao app todo dia. Maior impacto isolado em retenção — e a retenção é o
   que sustenta assinatura.
2. **Resumo semanal para o pai** (e-mail ou WhatsApp): o que o filho fez, o que
   aprendeu, quanto ganhou. É a prova de valor que justifica continuar pagando.
   Também é o melhor conteúdo de marketing que existe: print de pai.
3. **Segunda trilha de conteúdo.**
4. **Onboarding que sugere o nível inicial pela idade**, para pular o teste na
   primeira sessão e só ajustar depois.
5. **Jogos.**

---

## 6. Desenho do motor de conteúdo (Fase 3A)

Escrito aqui para não ser improvisado na hora da task.

**Vocabulário:** *trilha* (Matemática) → *nível* (1..N, a escada) → *lição*
(5–7 exercícios, 3–5 min) → *exercício*.

**Progresso** é por criança e por trilha: em que nível está, quantas lições
concluiu, e a assertividade recente.

**Nivelamento na entrada.** Um teste curto (10–12 exercícios) que sobe de
dificuldade enquanto acerta e para no primeiro tropeço consistente. Resultado:
o nível de entrada. Refazível a qualquer momento pelo responsável.

**Regra de domínio (subir de nível).** Duas lições seguidas do nível com
assertividade ≥ 80%. Nunca uma só — uma lição boa pode ser sorte.

**Regra de descida.** Não existe descida automática. Se a criança travar (três
lições abaixo de 50%), o app **injeta uma lição de revisão do nível anterior** sem
anunciar rebaixamento. Criança de 8 anos que é rebaixada em público abandona o app.

**Sem vidas, sem corações.** É a mecânica mais copiada do Duolingo e é
incompatível com a regra 2 do produto (*não existe multa*). Vida é punição por
erro com outro nome. Errar leva a repetir, não a perder.

**A ofensiva já existe e se chama bônus de consistência.** Não invente um streak
separado: `regras_bonus` + `fechar_semana_consistencia` já são exatamente isso, e
pagam por hábito e não por unidade — que é a regra pedagógica do projeto. Basta
passar a contar lição de conteúdo junto com tarefa de rotina no mesmo cálculo.

**Pagamento.** Cruzeiro por **lição concluída**, nunca por acerto (regra 4). A
dificuldade do nível multiplica o valor. Refazer a mesma lição paga zero — senão
a criança descobre em uma tarde que repetir o nível 1 é a mina de ouro.

**Produção do conteúdo.** AI escreve, humano revisa. O gargalo é a revisão, não a
escrita. Modele um lote de 1 nível = ~4 lições = ~28 exercícios, e meça quanto
tempo seu tio leva para revisar um lote antes de estimar os 12 níveis.

---

## 7. Nome, moeda e identidade — conversa à parte, com prazo

Você pediu uma conversa separada. Concordo, e ela tem **data-limite: antes do
início da Fase 2F (22/09)**, porque é ali que o nome vira domínio, e antes de
qualquer código novo, porque o nome da moeda está no schema.

O que precisa sair de lá:
- Nome comercial (curto, fácil de falar em voz alta, disponível como domínio `.com.br`,
  como @ no Instagram, e sem colisão no INPI classe 9/41)
- Nome da moeda (**"Cruzeiro" tem um problema real**: é moeda extinta associada à
  hiperinflação para o pai, e não significa nada para a criança)
- Logotipo, cor e mascote
- Tom de voz para os textos da criança

## 8. Registro de discordância

Registrado em 05/09/2026, para não ser rediscutido:

1. **Jogos** — discordo do escopo, com o dado do Daily Kids. Cortado para a fila
   de adiantamento. Se você decidir o contrário, isto fica escrito.
2. **10 h/dia** — discordo da premissa de capacidade. O plano tem dois relógios
   para que o desvio apareça em outubro e não em dezembro.
