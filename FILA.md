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
**Status:** ATUAL — pronta para enviar · **Fase:** 2D · **Commit:** —

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

## T-02 — Loja e carteira, lado da criança
**Status:** aguarda T-01 · **Fase:** 2D
Vitrine, pedido de resgate, saldo em destaque, "faltam X para isso".
Ao pedir, cria `resgate` pendente e o responsável entrega ou cancela.

## T-03 — Aprovação de resgate pelo responsável
**Status:** aguarda T-02 · **Fase:** 2D
Entregar e cancelar (com estorno). Já existe função no banco para os dois.

## T-04 — Janela de schema 1: PIN da criança + renomear a moeda
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
