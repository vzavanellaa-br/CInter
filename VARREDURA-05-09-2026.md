# CInter — Varredura completa

**Data:** 05/09/2026 · **Feita por:** Cowork, contra o código e o banco reais.
Nada aqui veio da documentação: o `resumo.md` estava desatualizado em 4 pontos.

---

## 1. O que existe de verdade

### Repositório
- `github.com/vzavanellaa-br/CInter`, branch `main`, árvore limpa, **9 commits**
- Último commit: `63d30ee` — período e horário nas tarefas (18/08/2026)
- **2.097 linhas** em `src/`, 31 arquivos
- Build de produção existe em `dist/` — mas nunca foi publicado em lugar nenhum

### Telas — 14 arquivos
| Área | Telas |
|---|---|
| Responsável (10) | Entrar, CriarConta, PrimeiroAcesso, Inicio, Tarefas, FormularioTarefa, Aprovacoes, CadastrarCrianca, DetalheCrianca, CriancaItem |
| Criança (1) | MinhasTarefas |
| UI genérico (3) | Botao, CampoTexto, Aviso |

**8 rotas.** Nenhuma tela de loja, nenhuma tela de recompensa, nenhuma tela de conteúdo.

### Banco (auditado via MCP, hoje)
- **11 tabelas**, RLS ligada nas 11 — sem exceção
- **13 funções**, todas `SECURITY DEFINER` com `search_path=public` fixo
- Linhas: familias 2 · responsaveis 2 · criancas 2 · tarefas 13 · execucoes 2 · carteiras 2 · transacoes 1 · **recompensas 0 · resgates 0 · bonus_semanais 0** · regras_bonus 2

### Advisors do Supabase
9 avisos. 8 são "função SECURITY DEFINER chamável por usuário logado" — **isso é o desenho pretendido**, não um defeito: é assim que a moeda fica fora do alcance do navegador. O 9º é real e fácil: **proteção contra senha vazada está desligada** (um clique no painel).

---

## 2. O que a documentação diz e não é verdade

| `resumo.md` diz | Realidade |
|---|---|
| "Correção do estorno — ⚠️ PENDENTE" | **Feito.** Commit `64fa24b` + migration `20260818140053` |
| "Próximo passo: Fase 1 aguardando aprovação" | Fase 1 fechou há três semanas |
| "GitHub ❌ falta" | **Existe**, remote configurado e sincronizado |
| Memória do projeto: "Zero código ainda" | 2.097 linhas escritas |

Isso é exatamente o que o documento de orquestração avisa: **o backlog é pista, não fonte de verdade.** A partir de hoje quem manda é o `ESTADO.md`.

---

## 3. Os buracos reais

### 🔴 O ciclo do dinheiro está pela metade
O banco sabe criar recompensa, resgatar, entregar e estornar. **Não existe uma única tela para isso.** `recompensas` e `resgates` têm **zero linhas** — a loja nunca foi usada uma vez, nem em teste.

Traduzindo: a criança ganha Cruzeiro e não tem onde gastar. Um app de recompensa sem recompensa.

### 🔴 O bônus de consistência é código morto
A função `fechar_semana_consistencia` existe, está correta — e **ninguém a chama**. Não há agendamento, não há botão, não há gatilho. `bonus_semanais` tem zero linhas.

Isso é grave por um motivo específico: o bônus semanal é **o mecanismo que protege contra o efeito de superjustificação** (decisão 26). Ele está no papel e não no ar. O produto hoje paga por unidade, que é justamente o que a regra manda evitar.

### 🔴 A criança pode aprovar as próprias tarefas
A rota `/crianca/:id` roda dentro de `RotaProtegida` — com a sessão **do responsável**. O comentário no código admite: *"por enquanto sem PIN"*. Qualquer criança que aperte o botão de voltar vira administradora da própria mesada.

Em casa é engraçado. Com família de fora, é a fraude que mata a confiança do pai — e ele descobre pelo saldo, não pelo app.

### 🟠 Não está no ar
Vercel não configurado. Sem PWA (não existe `manifest.json`; só um favicon). Ninguém além de você consegue abrir isso. Não dá para pedir para a sua sogra rodar `npm run dev`.

### 🟠 E-mail limitado a 2 por hora
O SMTP embutido do Supabase. O segundo cadastro do dia falha em silêncio.

### 🟠 A tese do produto não existe em código
Zero conteúdo educacional. Zero tabelas de conteúdo. **O que diferencia o CInter de sete concorrentes gratuitos ainda não foi construído.**

### 🟡 Um detalhe que vai envelhecer
`criancas.ano_nascimento` tem `CHECK (>= 2010 AND <= 2025)`. Uma criança nascida em 2026 já não cadastra hoje, e em 2029 o limite de baixo deixa passar adolescente de 19 anos. Trocar por idade calculada ou por uma janela móvel.

---

## 4. O mercado, reconferido hoje

### O achado que muda a estratégia
**O mercado brasileiro de rotina+recompensa não está disputado. Está vazio.**

| App | Downloads reais | Avaliações | Conteúdo? |
|---|---|---|---|
| ParensUP / Feito! | ~48.000 | **0** | não |
| GoKids | 1.900 | **0** | não |
| Daily Kids | **430** | 4 | **sim — 14 minijogos** |
| Rotina Kids | **76** | 0 | não |
| Pontuei | sem loja (só web) | — | não |
| Tarefa e Recompensa | — | 0 | não (e é polonês) |
| Tindin | **removido da Play em ago/2025** | — | pivotou para escola |

O líder tem 48 mil downloads e **zero avaliações**. Isso lê nos dois sentidos: a porta está aberta, **e ninguém provou ainda que o pai brasileiro paga por isso.**

### A brecha, em uma frase
Quem tem conteúdo alinhado ao currículo brasileiro (Matific, Árvore, Elefante Letrado, Escola Games, Aprender Valor) **vende para escola e não entra na rotina de casa**. Quem tem rotina de casa **não tem conteúdo nenhum**. E o melhor conteúdo gamificado gratuito para criança — Khan Academy Kids e Duolingo ABC — **só existe em inglês**, e a reclamação nº 1 dos pais brasileiros nas lojas é literalmente essa.

O CInter é o único desenho que atravessa os dois lados.

### Pontos fortes dos concorrentes (o que copiar)
- **Greenlight (EUA):** o único que faz o que você quer — *Level Up* paga moeda por vídeo/quiz concluído. É a prova de que a mecânica funciona; ninguém a trouxe para o Brasil, e nenhum deles usa currículo escolar, só educação financeira.
- **NatWest Rooster Money:** o plano grátis é generoso de propósito (potes de guardar/gastar/doar, juros configuráveis). Ensina que o freemium bem cortado vira aquisição.
- **Árvore:** 4,6★ com 4.100 avaliações e 2 milhões de alunos — mas **só via escola parceira**. É o melhor produto brasileiro do setor e o pai não consegue comprar sozinho.
- **Duolingo:** a gramática que todos copiam — XP, ofensiva, lição curta, progressão visível.

### Pontos fracos dos concorrentes (onde ganhar)
- **Nenhum app BR de rotina tem conteúdo curricular.** Nenhum.
- **Nenhum tem gamificação de verdade.** Os que citam "streak" e "badges" têm 76 e 430 downloads.
- **Cobrança é o calcanhar do setor:** 35,71% das reclamações da Lingokids no Reclame Aqui são estorno/cobrança não autorizada. Trial mal desenhado destrói a marca antes do produto existir.
- **A armadilha Prodigy:** a Fairplay documentou 16 anúncios de assinatura contra 4 exercícios em 19 minutos, virou matéria na NBC. Monetizar cosmético dentro de app infantil gera denúncia. Não repetir.
- **Daily Kids é o alerta mais útil para você:** é o único BR com jogos educativos dentro, tem 14 minijogos, cobra R$24,90/mês — e tem 430 downloads. **Jogo não vende app.**

### Quem pode esmagar o projeto
1. **Matific** — já tem BNCC, já tem matemática gamificada, já opera no Brasil, e em mar/2026 lançou educação financeira alinhada à BNCC. Falta só descer para o canal família. É a ameaça mais concreta.
2. **Árvore / Elefante Letrado** — 2 e 5 milhões de alunos já dentro de casa, chegando pelo professor. Se abrirem plano família com moeda, a distribuição é imbatível.
3. **Bancos e fintechs** — o Barclays comprou o GoHenry em jun/2026. No Brasil, Inter, Nubank ou PicPay podem lançar mesada+tarefa **de graça** como retenção de conta. Contra grátis subsidiado não se compete com assinatura.
4. **Duolingo** — se lançarem alfabetização em português no ABC (18 milhões de downloads), o conteúdo básico vira commodity gratuita da noite para o dia.
5. **Aprender Valor (Banco Central)** — gratuito, estatal, BNCC, expandindo em 2026.

**A leitura:** a janela existe, mas não é larga. O ativo defensável não é o app — é **a trilha de conteúdo em português, com autoridade pedagógica declarada, amarrada à economia de casa.** Isso leva tempo para copiar; a tela de tarefa, não.

---

## 5. Os dois ativos que você tem e não está usando

**Sua sogra pedagoga e seu tio doutor em matemática não são "respaldo".** São o único diferencial que os concorrentes não conseguem comprar rápido, e resolvem o maior risco técnico do projeto: conteúdo educacional errado, escrito por AI, sem ninguém que saiba conferir.

Uso concreto, em ordem de valor:
1. **Revisão obrigatória** de cada nível da trilha antes de publicar. Sem isso, conteúdo por AI é risco, não vantagem.
2. **"Conteúdo revisado por pedagoga e por professor doutor em Matemática"** na página da loja e na de vendas. É verificável, é raro e é exatamente o que o pai procura.
3. **Definir a escada de níveis.** A pergunta "o que uma criança precisa dominar antes de fração?" é a decisão mais difícil do produto e a que mais quebra se for chutada.
4. Rosto e nome deles no material de venda, se aceitarem. Autoridade emprestada vende assinatura infantil melhor que qualquer anúncio.

**Formalize:** combine escopo, crédito e uma contrapartida (participação, pagamento por nível revisado, ou nada além do crédito — mas por escrito). Favor de família sem combinado escrito azeda quando o projeto dá dinheiro.
