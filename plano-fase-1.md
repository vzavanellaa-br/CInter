# Fase 1 — Fundação · Plano para aprovação

**Status:** aguardando o "pode ir" do Vinicius. Nenhuma linha de código antes disso.

---

## O que a Fase 1 entrega

Um app rodando no seu computador onde você consegue: **criar sua conta, criar sua
família e cadastrar seu filho.** Só isso.

Parece pouco e é de propósito. É a fundação: se a base do banco de dados estiver
errada, tudo que vier em cima nasce torto — e refazer depois custa dez vezes mais.

**O que NÃO entra:** tarefas, Cruzeiro, loja, conteúdo, visual bonito, internet.
Tudo isso é Fase 2 em diante.

## Os quatro passos

### Passo 1 — Montar o ambiente

Instalar as ferramentas na sua máquina e criar o esqueleto do projeto.

*Em miúdos:* é como comprar as ferramentas e montar a bancada antes de começar a
marcenaria. Você não vê nada de bonito ainda, mas nada acontece sem isso.

**Você vai precisar:** ter o Node.js instalado. Se não tiver, eu te passo o passo a passo.
**Resultado:** uma página em branco abrindo no navegador, escrito "CInter".

### Passo 2 — Criar o projeto no Supabase

Abrir a conta e o projeto que vai guardar todos os dados.

*Em miúdos:* Supabase é o "armário" onde ficam guardadas as informações — quem é
você, quem é seu filho, quanto ele tem de Cruzeiro. Um serviço externo, de graça
no começo.

**Você vai precisar:** criar a conta (é grátis) e me passar duas chaves de acesso.
Uma delas é secreta e nunca vai para dentro do app.
**Resultado:** banco de dados vazio, no ar, pronto para receber as tabelas.

### Passo 3 — Desenhar as tabelas

Criar as "gavetas" do armário: famílias, responsáveis, crianças.

Junto disso vêm as **travas de segurança** — regra que garante que a família A
nunca enxergue nada da família B. Como o CInter é produto para várias famílias e
guarda dados de criança, isso não é enfeite: é o item mais importante da fase.

*Em miúdos:* é montar as gavetas e colocar fechadura em cada uma antes de guardar
qualquer coisa.

**Resultado:** três tabelas criadas, cada uma com sua fechadura testada.

### Passo 4 — Login e cadastro

Tela para você entrar com e-mail e senha, criar sua família e cadastrar seu filho.

Aqui vale a regra que segue por todo o projeto: **a conta é sua, do responsável.
Seu filho é um perfil dentro da sua conta, nunca uma conta própria.** É o que a
lei brasileira exige para dados de criança, e por acaso também deixa o produto
mais simples.

**Resultado:** você loga, cria a família "Zavanella", cadastra o Miguel de 8 anos,
fecha e abre de novo — e continua lá.

## Como vou trabalhar

- Um passo por vez. Termino, te mostro funcionando, você aprova, sigo.
- Se algo travar, eu te aviso na hora. Não fico tentando esconder problema.
- Tudo em português, sem jargão solto. Se eu usar termo técnico, ele vem traduzido.
- Nada vai para a internet nesta fase. Roda só na sua máquina.

## Verificação ao fim da fase

Antes de dizer "pronto", testo com **duas famílias diferentes** e confirmo que
uma não enxerga nada da outra. Se enxergar, a fase não acabou.

## O que preciso de você

1. **O "pode ir"** para começar o Passo 1.
2. Confirmar se já tem Node.js instalado (se não souber, eu te ensino a checar).
3. Criar a conta no Supabase quando chegarmos no Passo 2.

## Estimativa honesta

Não vou dar prazo em dias porque não sei quanto tempo você tem por semana. O que
sei: cada passo é curto e você vê resultado ao fim de cada um. Se a Fase 1
demorar mais que algumas sessões, algo está errado e vou te falar.
