# CInter — Criança Interessada · Especificação do Produto

**Versão:** 1.0 (reconstrução da Fase 0) · **Data:** 15/08/2026 · **PO:** Vinicius

> Este documento substitui o `resumo.md` e o `system-prompt.md` originais de
> mai/2026, que se perderam. Tudo aqui foi reconstruído a partir da memória do
> projeto e das decisões tomadas na sessão de 15/08/2026.

---

## 1. Visão

Um app onde a criança de 6 a 10 anos cumpre a rotina de casa **e** estuda dentro
do próprio app, ganhando **Cruzeiros** — moeda fictícia — que troca por
recompensas que os pais definem.

O objetivo pedagógico não é "fazer a criança obedecer". É construir a ponte entre
esforço e consequência, num ambiente onde errar é barato.

## 2. Público

| | |
|---|---|
| **Usuário pagante** | Pai/mãe/responsável, classe média, filho em idade escolar |
| **Usuário final** | Criança de 6 a 10 anos (1º ao 5º ano do fundamental) |
| **Fora do MVP** | 2 a 5 anos — pré-alfabetizada, exige UI sem texto e sem números. Vira versão "Júnior" depois que o MVP validar. |

**Por que 6–10 e não 2–10:** uma criança de 2 anos não lê e não compreende que
10 vale mais que 5. Uma de 10 calcula troco. São dois produtos. Além disso, o
filho do PO tem 8 anos — usuário real disponível para teste diário, que é a
forma mais barata de validação que existe.

## 3. Posicionamento competitivo

**Concorrentes diretos no Brasil (ago/2026):** Daily Kids, Tarefa e Recompensa,
Pontuei (tem plano grátis), ParensUP, Bot de Tarefas e Mesada, KidFlow (já tem
XP, pet e ranking), Crianças e Tarefas de Casa.
**Exterior:** BusyKid (US$4/mês por família), Greenlight (US$5,99+/mês), OurHome (grátis).

**Conclusão dura:** a camada rotina + recompensa está comoditizada e parte da
concorrência é gratuita. Lançar só isso é entrar numa briga de preço contra o zero.

**Nossa tese:** ninguém amarra **conteúdo educacional à mesma economia da rotina**.
A criança ganha Cruzeiro tanto por arrumar a cama quanto por concluir uma lição
de matemática, e gasta tudo na mesma loja. Isso é o produto. A rotina é a isca.

**Vantagem injusta do PO:** produção de conteúdo educacional em escala via AI com
curadoria humana — competência que ele já exerce em outras empresas. É o que torna
a fatia cara do produto viável para um time de uma pessoa.

## 4. Escopo por fase

O erro que travou o projeto por três meses foi escopo grande demais. Cada fase
abaixo tem que ser utilizável sozinha.

### Fase 1 — Fundação (aprovação pendente)

Ambiente rodando + modelo de dados + autenticação do responsável.
**Entregável:** app local que loga, cria família e cadastra uma criança. Nada mais.

### Fase 2 — Rotina e Cruzeiro

- Responsável cria tarefas (título, ícone, valor, recorrência, para qual criança)
- Criança vê as tarefas do dia e marca como feita
- Responsável aprova ou rejeita; aprovação credita o Cruzeiro
- Carteira com saldo e extrato
- Loja: responsável cadastra recompensas com preço; criança resgata

**Entregável:** produto usável pela família do PO todo dia. Marco de validação real.

### Fase 3 — Conteúdo (o produto pago)

- Uma matéria só (recomendo **matemática**, mais fácil de auto-corrigir)
- Uma faixa: um ano escolar
- Banco de questões gerado por AI + curadoria humana, alinhado à BNCC
- Lição = conjunto de questões; concluir a lição credita Cruzeiro
- Progresso visível para o responsável

**Entregável:** a tese do produto, provada. Só depois disso faz sentido cobrar.

### Fase 4 — Comercial

Onboarding público, consentimento LGPD formal, assinatura, publicação nas lojas.

### Depois

Mais matérias, mais anos escolares, versão Júnior (2–5), relatórios para o responsável.

## 5. Economia do Cruzeiro

Esta é a parte do produto que dá mais errado se for feita no improviso. A
literatura de psicologia da motivação é clara num ponto: **recompensar uma
criança por algo que ela já faz espontaneamente costuma reduzir o interesse dela
naquilo** — é o efeito de superjustificação. O desenho abaixo existe para evitar isso.

### Regras de desenho

1. **Obrigação básica não paga por unidade.** Escovar os dentes e arrumar a cama
   não geram Cruzeiro cada vez. Geram **bônus de consistência** ao fechar a semana.
   O que se recompensa é o hábito, não o ato isolado.

2. **Não existe multa.** Saldo nunca diminui por punição. Tirar moeda como castigo
   gera ressentimento e ensina a criança a esconder o erro. A consequência de não
   fazer é simplesmente não ganhar.

3. **Saldo nunca fica negativo.** Regra do banco, não do front.

4. **No conteúdo, paga-se esforço concluído, não acerto.** Pagar por acerto ensina
   a chutar e a evitar o que é difícil. Paga-se por lição concluída; a dificuldade
   pode multiplicar o valor.

5. **Recompensas incluem experiência e privilégio**, não só objeto: escolher o filme
   da noite, 30 min a mais acordado, um passeio. Sai mais barato e ensina melhor.

6. **Equilíbrio de preços.** O app sugere faixas para que o ganho semanal típico
   compre uma recompensa pequena por semana e uma grande por mês. Sem isso, o pai
   define preços no chute e a economia quebra — ou vira inflação, ou vira frustração.

### Fluxo de aprovação

```
criança marca feito  →  fica PENDENTE  →  responsável aprova  →  crédito na carteira
                                       →  responsável rejeita →  nada acontece
```

O responsável recebe aviso de que há itens esperando. A aprovação é de propósito:
é o momento de conversa entre pai e filho, não burocracia.

## 6. Modelo de dados (v1, para discussão)

| Tabela | Guarda |
|---|---|
| `familias` | A unidade de isolamento. Tudo pendura aqui. |
| `responsaveis` | Ligação com `auth.users` do Supabase |
| `membros_familia` | Qual responsável pertence a qual família e com que papel |
| `criancas` | Nome, apelido, nascimento, avatar, PIN de acesso. **Sem e-mail, sem conta própria.** |
| `tarefas` | Título, ícone, tipo, valor, recorrência, criança destinatária |
| `execucoes_tarefa` | Cada vez que a criança marca: data, status, quem aprovou, quando |
| `transacoes` | Todo movimento de Cruzeiro: tipo, valor, origem, saldo depois |
| `recompensas` | Título, custo, tipo (objeto/experiência/privilégio), estoque |
| `resgates` | Criança pediu, responsável entregou |

**Fase 3 acrescenta:** `trilhas`, `licoes`, `questoes`, `tentativas`.

**Decisão de projeto:** o saldo **não** é um campo editável. É calculado a partir
de `transacoes`, ou mantido em cache que só a função do banco escreve. Saldo
editável é a porta de entrada para fraude e para bug de inconsistência.

## 7. Segurança — o item mais crítico

Multi-família com dados de criança. Vazar dados entre famílias aqui é o pior
cenário possível do produto.

1. **RLS ligada em toda tabela, sem exceção.** Toda consulta filtra por
   `familia_id` derivado do usuário autenticado — nunca de um parâmetro vindo do
   navegador.
2. **Transação de Cruzeiro só via função do banco** (`SECURITY DEFINER`). O front
   pede "aprova a execução 123"; o banco decide o valor e credita. O front nunca
   informa quanto creditar. Sem isso, uma criança de 10 anos com o DevTools aberto
   se dá saldo infinito.
3. **Chave de serviço do Supabase nunca vai para o front.** Só a chave pública.
4. **PIN da criança não substitui autenticação.** É conveniência de troca de perfil
   dentro de um dispositivo já autenticado pelo responsável.
5. **Aprovação é sempre do responsável.** Nenhum caminho no código credita sem passar por lá.

## 8. LGPD e dados de criança

Tratamento de dados de criança tem regime próprio (LGPD, art. 14): exige
consentimento específico e destacado de ao menos um dos pais, e o tratamento deve
atender ao melhor interesse da criança.

Consequências práticas de design:

- **A conta é do responsável.** A criança é perfil interno. Nunca coletar e-mail,
  telefone ou localização da criança.
- Coletar o mínimo: nome ou apelido e faixa etária bastam. Data de nascimento
  completa só se houver uso real.
- Tela de consentimento explícita no cadastro, não escondida em "termos de uso".
- Caminho claro para o responsável exportar e apagar tudo.
- **Sem anúncios e sem rastreamento de terceiros no app da criança.** Além do
  jurídico, é exigência das lojas para a categoria infantil.

> Não sou advogado. Antes de abrir cadastro público, vale uma revisão com quem seja.

## 9. Monetização (hipótese a testar)

Freemium com corte natural na tese do produto:

- **Grátis:** rotina, Cruzeiro e loja de recompensas — o que a concorrência já dá de graça
- **Pago:** o conteúdo educacional e o acompanhamento de progresso

Faixa de referência: concorrência internacional cobra US$4–6/mês pela família.
No Brasil, algo entre R$15 e R$25/mês por família parece o teto plausível — a
validar com pais reais, não no chute.

## 10. Riscos

| Risco | Gravidade | Como reduzir |
|---|---|---|
| Escopo grande demais trava o projeto de novo | **Alta** | Fases pequenas; Fase 2 usável pela família do PO antes de qualquer conteúdo |
| Concorrência gratuita na camada de rotina | **Alta** | Não vender rotina; vender conteúdo |
| Custo de produzir conteúdo pedagógico | **Alta** | AI + curadoria; uma matéria e um ano escolar por vez |
| Criança fraudando saldo | Média | Toda transação no banco, RLS, RPC |
| LGPD com dados de menor | Média | Conta do responsável, coleta mínima, revisão jurídica antes do lançamento |
| JS puro em código que move saldo | Média | Validação nas bordas + testes só nas funções de moeda |
| Economia mal calibrada mata o engajamento | Média | Faixas de preço sugeridas; revisar com uso real |
| Efeito de superjustificação | Média | Regras da seção 5 |

## 11. O que ainda precisa ser decidido

- [ ] Nome comercial definitivo ("CInter" é nome interno; "Criança Interessada" é longo para loja)
- [ ] Matéria e ano escolar da Fase 3
- [ ] Identidade visual e nome da mascote
- [ ] Preço e formato da assinatura
- [ ] Web (PWA) apenas ou também lojas de aplicativo
