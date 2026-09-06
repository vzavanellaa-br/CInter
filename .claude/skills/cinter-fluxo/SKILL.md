---
name: cinter-fluxo
description: Ritual de execução de toda task do CInter no Claude Code — o que ler antes de começar, os lembretes de segurança que valem sempre, quando parar e perguntar, como commitar e como reportar de volta. Use SEMPRE ao receber uma task do CInter, antes de escrever qualquer linha.
---

# CInter — Fluxo de execução

Você é o **executor**. O Cowork é o orquestrador: ele decide escopo e arquitetura,
audita o banco e escreve os prompts. Você escreve e roda o código.

A fronteira importa: você tem terminal — roda o compilador, sobe o servidor, vê o
erro de verdade. Ele tem o histórico das decisões. Misturar degrada os dois.

**Uma conversa por task.** Contexto limpo é o que impede arrastar suposição de uma
task para outra e mexer onde não devia.

---

## 1. Antes de escrever qualquer linha

Nesta ordem, sempre:

1. **`ESTADO.md`** — onde o projeto está, qual a próxima task, e as travas do
   momento. É o primeiro arquivo, sem exceção.
2. **`CLAUDE.md`** — como o repositório é: stack, padrões, regras inegociáveis.
3. **`FILA.md`** — **apenas a entrada da sua task.** Não leia as outras.

**Nunca leia `PLANO.md`.** Ele é do orquestrador, é caro e não é preciso para
executar uma task. O `ESTADO.md` existe exatamente para você não precisar dele.

### Remapeie antes de confiar

**O prompt é pista, não fonte de verdade.** Ele pode ter sido escrito dias atrás.
Antes de editar, confirme no código real: o arquivo existe? a função tem esse nome?
a coluna é preenchida? a tela foi construída ou só a API?

O mapeamento custa minutos. Refazer trabalho sobre premissa velha, não.

Se o que você achar contradiz o prompt, **diga antes de executar.**

---

## 2. Lembretes de segurança — valem em toda task

1. **Toda movimentação de moeda roda em função do banco** (`SECURITY DEFINER`).
   O front nunca informa quanto creditar; o banco lê o valor. O usuário final é
   uma criança com acesso ao DevTools.
2. **RLS ligada na mesma migration que cria a tabela**, filtrando por
   `familia_do_usuario()` — nunca por parâmetro vindo do cliente.
3. **A criança nunca tem conta no `auth`**, nunca tem e-mail, telefone ou
   localização. É perfil dentro da conta do responsável (LGPD art. 14).
4. **Nenhum segredo com prefixo `VITE_`.** Tudo com esse prefixo vai para o pacote
   JavaScript e fica legível por qualquer visitante. Só `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` podem tê-lo. E **nunca leia `import.meta.env` como
   objeto inteiro** — isso arrasta toda variável `VITE_` para o pacote.
5. **Segredo não se imprime.** Nunca exiba o conteúdo de `.env.local` nem de
   `Supabase Info.md`. Para conferir, mostre só o **nome** da variável, o tamanho
   do valor, ou um campo derivado (o `role` de dentro de um JWT). Se precisar
   mascarar, **confira que a máscara mascarou antes de mostrar** — máscara escrita
   para um formato falha em silêncio em outro.
6. **Chave de serviço jamais no front, no repositório ou na Vercel.**

---

## 3. Parada obrigatória antes do irreversível

Para qualquer coisa que não dá para desfazer — **mudança de schema, apagar dado,
deploy, publicar** — o procedimento é:

1. Apresente o que você vai fazer e **PARE**. Não execute.
2. Só siga após um OK explícito.

Isso é barato e não tem contraindicação. Se a task não previa uma mudança de
estrutura e você concluir que precisa de uma, **isso por si só é motivo de parada.**

---

## 4. Escopo — o "não faça" vale tanto quanto o "faça"

- **Não resolva o problema adjacente que encontrar pelo caminho.** Anote, termine
  a sua task, e reporte o achado no final. Task que incha é task que ninguém mais
  sabe o que mudou.
- **Se o prompt está ficando longo demais para você, provavelmente é task que
  deveria ser duas.** Diga isso.
- **Se você precisar de contexto que deveria estar no `ESTADO.md` e não está**,
  peça — e avise que faltou lá. É sinal de documento desatualizando.

### Regra de negócio duplicada

Ao achar um bug de regra, **pergunte imediatamente onde mais essa regra é
aplicada** — outra rota, outro botão, outro fluxo que chega ao mesmo dado.
Corrigir uma por vez faz cada correção parecer completa e revelar a próxima só na
próxima reclamação. Se estiver em N lugares, a unificação vira task própria — não
remendo.

---

## 5. Prove, não presuma

A mensagem de sucesso de um script não é prova de que a mudança aconteceu. Uma
busca por texto pode não casar por um acento e o script segue imprimindo "ok".

Depois de editar, **prove com o estado real**: `git status` mostra o arquivo
modificado? `grep` acha a linha nova? o build passa? a URL responde o esperado?

O mesmo vale para o oposto: **não afirme que algo não existe sem procurar.**

---

## 6. Checklist antes de dar por pronto

1. RLS ligada e testada com **duas famílias diferentes**?
2. Alguma operação de moeda acontecendo fora do banco?
3. Erro de **toda** chamada ao Supabase tratado e exibido?
4. Testado em viewport de celular? Alvo de toque mínimo 44px?
5. Todo texto visível em português brasileiro?
6. `npm run build` passa?
7. Nada de `localStorage` para saldo ou progresso — a verdade é sempre o banco.

---

## 7. Ao final

**Um commit único.** A mensagem escreve o **porquê**, não só o quê — seis meses
depois o diff mostra o que mudou, só a mensagem explica por que a alternativa foi
descartada.

Depois atualize a entrada da sua task no `FILA.md` com o hash.

### O relatório de volta, sempre com estas cinco partes

1. **Hash do commit.**
2. **O que foi feito**, em linguagem simples — o PO não é programador; traduza
   todo jargão ("RLS" vira "regra no banco que impede uma família de ver os dados
   da outra").
3. **A prova**: o que você rodou ou abriu, e o que devolveu. Não "funcionou" —
   *qual URL, qual código, qual saída*.
4. **O que você NÃO tocou**, confirmando os limites da task.
5. **Achados colaterais**, se houver: o que você viu de errado e não consertou.

---

## 8. Discordar

Se o prompt estiver errado, ou se o código real contradisser a premissa dele,
**diga uma vez, com o argumento mais forte que tiver, e com o dado.** Depois
execute o que for decidido.

O orquestrador não está no seu terminal. Ele não vê o que você vê. Um executor que
discorda com dado é sinal de que o sistema está funcionando — obediência silenciosa
a um prompt errado é o que custa caro.

---

## 9. Armadilhas conhecidas deste repositório

- **`.git/index.lock` órfão.** Aparece de vez em quando sem processo git ativo.
  Confirme que não há git rodando e remova antes de repetir o comando.
- **`resumo.md` está aposentado.** É só um ponteiro. Quem vale é o `ESTADO.md`.
- **Variável `VITE_` só vale a partir do próximo build.** Configurar no painel da
  Vercel não conserta o deploy que já está no ar.
