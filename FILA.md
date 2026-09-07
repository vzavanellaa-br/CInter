# CInter — FILA DE TASKS

Uma entrada por task. O executor lê **só a entrada dele**.
Ao terminar: um commit único, e o hash volta para cá.

---

## T-00 — Consertar o deploy da Vercel (SPA + variáveis)
**Status:** ✅ concluída e conferida pelo Cowork em 05/09 · **Commit:** `833d1de`

Descoberto em 05/09: o projeto `c-inter` está no ar e o build passa, mas
`https://c-inter.vercel.app/entrar` devolve **404**. O motivo é conhecido: um app
de página única com `BrowserRouter` precisa que o servidor devolva o `index.html`
para qualquer caminho — senão só a raiz funciona, e recarregar a página em
qualquer tela quebra.

~~~
Carregue a skill cinter-fluxo. Depois leia ESTADO.md.

LEMBRETE DE SEGURANCA:
- Nao imprima o conteudo de .env.local nem de "Supabase Info.md". Se precisar
  conferir, mostre apenas o NOME das variaveis, nunca o valor.
- Nada de chave de servico (service_role) no front nem na Vercel. So a anon key.
- Nao mexa em banco, tela ou regra de negocio nesta task.

TASK: T-00 — Consertar o deploy da Vercel (rewrite de SPA + variaveis)

CONTEXTO: o projeto c-inter esta ligado ao repositorio e o build passa, mas
https://c-inter.vercel.app/entrar devolve 404 — conferido. O app usa
BrowserRouter, entao a Vercel precisa devolver index.html para qualquer caminho.
Sem isso, so a raiz abre e recarregar em qualquer tela quebra. Provavelmente as
variaveis do Supabase tambem nao estao configuradas la, o que deixaria a tela em
branco: src/lib/supabase.js lanca erro quando faltam.

ARQUIVOS:
- criar vercel.json na raiz

CRITERIO DE PRONTO:
1. vercel.json com rewrite mandando qualquer caminho para /index.html.
2. Confirmar no painel da Vercel que existem as variaveis VITE_SUPABASE_URL e
   VITE_SUPABASE_ANON_KEY nos ambientes Production, Preview e Development. Se
   faltarem, me diga quais faltam e em quais ambientes — NAO cole os valores no
   chat. Eu configuro no painel.
3. Depois do proximo deploy, provar que funciona abrindo estas URLs e me dizendo
   o que cada uma devolve:
   - https://c-inter.vercel.app/
   - https://c-inter.vercel.app/entrar
   - https://c-inter.vercel.app/criar-conta
4. Se a tela abrir em branco, ler o console do navegador e me trazer a mensagem.

NAO FACA:
- Nao mude nenhuma tela, rota, hook ou migration.
- Nao crie dominio proprio, nao ligue Analytics, nao mexa em protecao de deploy.
- Nao rode nada contra o banco.

AO FINAL: um commit unico explicando o PORQUE, e me devolva o hash.
~~~

---

## T-01 — Loja de recompensas, lado do responsável
**Status:** FEITA em 06/09 — aguarda teste de tela pelo PO · **Fase:** 2D · **Commit:** `3d18352`

O prompt abaixo vai inteiro para o code, sem edição:

~~~
Carregue a skill cinter-fluxo. Depois leia ESTADO.md.

LEMBRETE DE SEGURANCA:
- Toda movimentacao de moeda roda em funcao do banco. O front nunca informa valor.
- RLS filtra por familia_do_usuario(), nunca por parametro do cliente.
- Nao imprima o conteudo de .env.local nem de "Supabase Info.md".
- Nao rode nenhum ALTER TABLE nem CREATE TABLE nesta task. Se achar que precisa,
  PARE e me avise.

TASK: T-01 — Loja de recompensas (lado do responsavel)

CONTEXTO: o banco ja tem a tabela `recompensas` com RLS e as funcoes
`resgatar_recompensa`, `entregar_resgate` e `cancelar_resgate`. Nao existe
nenhuma tela para isso, e a tabela tem zero linhas — a loja nunca foi usada.
Sem ela a crianca ganha moeda e nao tem onde gastar, e o ciclo do produto fica
pela metade. Esta task cobre SO o cadastro pelo responsavel.

ARQUIVOS:
- criar src/telas/responsavel/Recompensas.jsx
- criar src/telas/responsavel/FormularioRecompensa.jsx
- criar src/hooks/useRecompensas.js
- editar src/rotas/AppRotas.jsx (rota /inicio/recompensas, dentro de RotaProtegida)
- editar src/telas/responsavel/Inicio.jsx (link para a nova tela)

Use src/telas/responsavel/Tarefas.jsx e FormularioTarefa.jsx como modelo de
estrutura, e os componentes de src/componentes/ui.

CRITERIO DE PRONTO:
1. Listar as recompensas da familia, separando ativas de desativadas.
2. Criar recompensa com: titulo, icone, custo (inteiro > 0), tipo
   (objeto | experiencia | privilegio) e estoque opcional.
3. Editar e desativar. Desativar nunca apaga a linha.
4. Ao criar, o formulario sugere uma faixa de custo com base no ganho semanal
   possivel da crianca (some o valor das tarefas ativas dela na semana). A
   sugestao e um texto de ajuda, nao trava o campo.
5. Erro de toda chamada ao Supabase tratado e exibido com o componente Aviso.
6. Testado em viewport de celular, alvo de toque minimo 44px.
7. Todo texto em portugues brasileiro.

NAO FACA:
- Nada do lado da crianca (a loja da crianca e a T-02).
- Nao mexa em tarefas, aprovacoes, carteira nem extrato.
- Nao crie nem altere tabela, coluna ou funcao no banco.
- Nao escreva a palavra "cruzeiro" em codigo novo; use o rotulo que ja existir
  nas telas atuais.
- Nao configure deploy.

AO FINAL: um commit unico, mensagem explicando o PORQUE da mudanca, e me
devolva o hash.
~~~

---


### Adendo de 06/09 — plano aprovado com três correções

O code remapeou e apresentou o plano; aprovado com estes ajustes:

1. **Rótulo da moeda vai para um arquivo só.** Criar `src/lib/moeda.js` exportando
   o nome visível da moeda, e usar isso nas telas novas. Citar a coluna existente
   `tarefas.valor_cruzeiro` é inevitável e está liberado — a trava é sobre criar
   *nomes novos*. Não refatorar as telas antigas nesta task.
2. **O ganho semanal precisa somar o bônus de consistência**, não só as tarefas:
   `regras_bonus.valor_bonus` quando `ativo`. Sem ele a faixa sugerida subestima
   o que a criança pode ganhar, e o pai precifica errado.
3. **Faixa sugerida: piso = meia semana, teto = quatro semanas** (não três). A
   regra de produto é "uma recompensa pequena por semana e uma grande por mês".

**O teste de RLS já foi feito pelo Cowork** em 06/09, direto no banco, simulando
os dois responsáveis. Resultado: 13 tarefas no total, cada responsável enxerga
só as suas (6 e 7), e a consulta explícita pelas tarefas da outra família devolve
zero. O code não precisa refazer — testa a tela com uma conta que o PO fornecer.

---

## T-01b — Nome visível da moeda passa a ser Realeta
**Status:** ✅ concluída · **Commit:** `3987f71`
8 arquivos, 10 ocorrências de texto. Busca por "cruzeiro" em `src/` devolve só a
coluna de banco `valor_cruzeiro`. O singular ficou pendente: as telas escrevem
"1 Realetas". É regra de plural, não de nome — vira ajuste de outra task.

---

## T-02 — Loja e carteira, lado da criança
**Status:** FEITA em 07/09 — aguarda teste de tela pelo PO · **Fase:** 2D · **Commit:** `da5557e`

⚠️ **Fato do banco que muda o desenho da tela:** `resgatar_recompensa` **debita o
saldo no momento do pedido**, não na entrega. Cria o `resgate` como pendente,
desconta a carteira, grava a transação e baixa o estoque. Se o responsável
cancelar, `cancelar_resgate` estorna. A criança precisa entender isso na tela —
senão ela pede, vê o saldo cair, e acha que perdeu.

## T-02b — Tirar "papai" dos textos da criança
**Status:** aguarda T-02 · **Fase:** 2D
`MinhasTarefas.jsx` diz "Esperando o papai conferir". Trocar por "alguém da
família". Varrer o resto do app pelo mesmo padrão. Decisão 73.

## T-03 — Aprovação de resgate pelo responsável
**Status:** aguarda T-02 · **Fase:** 2D
Entregar e cancelar (com estorno). Já existe função no banco para os dois.


## T-04 — Janela de schema 1 (ampliada em 06/09)
**Status:** bloqueada pela decisão de nome (ver `PLANO.md` §7) · **Fase:** 2E
⚠️ Irreversível: apresenta e PARA antes de rodar.

Agora carrega **quatro** grupos, numa janela só, enquanto o banco só tem dado de teste:
1. PIN da criança em `criancas` (hash, nunca texto puro) + sessão separada
2. Rename da moeda em coluna e telas
3. **Regras da casa:** `regras`, `ocorrencias_regra`
4. **Comportamento e desconto:** `avaliacoes_mensais`, `limites_desconto`,
   e `'desconto'` no CHECK de `transacoes.origem`

## T-09 — Regras da casa e avaliação mensal (telas)
**Status:** aguarda T-04 · **Fase:** 2E
Página de Regras (cadastro e visualização), registro de ocorrência sem valor,
tela de avaliação mensal com bônus discricionário, e o desconto com as **sete
travas** da decisão 64 — sem todas elas, não entra.

## T-10 — Calibragem da economia do Cruzeiro
**Status:** aguarda T-09 · **Fase:** antes da 3
Com quatro entradas e uma saída, simular o saldo de uma criança ao longo de 3
meses e ajustar as faixas antes que o conteúdo entre e dobre a entrada.

<!-- versão anterior da T-04, substituída acima -->
## T-04 (antiga) — PIN da criança + renomear a moeda
**Status:** **bloqueada por decisão de nome** (ver `PLANO.md` §7) · **Fase:** 2E
⚠️ Irreversível: apresenta e PARA antes de rodar.
Agrupa: coluna de PIN em `criancas` (hash, nunca texto puro), separação da sessão
da criança, e o rename da moeda em coluna e telas.

## T-05 — Fazer o bônus semanal acontecer de verdade
**Status:** aguarda T-04 · **Fase:** 2E
`fechar_semana_consistencia` existe e nunca foi chamada. Decidir o gatilho
(pg_cron no Supabase é o caminho) e provar com uma semana fechada de verdade.

## T-06 — Higiene da varredura
**Status:** aguarda T-05 · **Fase:** 2E
Ligar proteção contra senha vazada no painel. Trocar o CHECK de
`criancas.ano_nascimento` (hoje fixo em 2010–2025) por janela móvel.

## T-07 — Deploy, PWA e SMTP
**Status:** aguarda T-06 · **Fase:** 2F
⚠️ Irreversível: apresenta e PARA antes de publicar.
Vercel + `manifest.json` + ícones + SMTP próprio. Fim: link que a sogra abre no
celular dela.

## T-08 em diante — Fundação de conteúdo
**Status:** aguarda 2F fechada · **Fase:** 3A
Desenho em `PLANO.md` §6. Não criar tabela de conteúdo antes disso.
