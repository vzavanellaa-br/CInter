# CInter — Regras do projeto

## Produto
App de rotina + estudo + recompensa para crianças de 6 a 10 anos, com moeda
fictícia (Cruzeiro). Produto comercial multi-família.

## Regras inegociáveis
1. Nenhum código sem aprovação prévia do Vinicius. Apresente o plano, espere o OK.
2. O PO não é programador. Explique em linguagem simples, traduza todo jargão.
3. Toda movimentação de Cruzeiro roda em função de banco (SECURITY DEFINER),
   NUNCA no front. O front nunca informa quanto creditar; o banco lê o valor.
   O usuário final é uma criança com acesso ao DevTools.
4. Saldo nunca é campo editável pelo cliente e nunca fica negativo.
5. RLS ligada em TODA tabela, sem exceção. A migration que cria a tabela já traz
   a política. Filtro sempre por família derivada de auth.uid(), nunca de
   parâmetro vindo do cliente.
6. A conta é sempre do responsável. A criança é perfil interno, NUNCA tem conta
   no auth nem e-mail (LGPD art. 14).
7. Nunca coletar e-mail, telefone ou localização de criança.
8. Chave de serviço do Supabase jamais no front nem no repositório.
8b. **NUNCA crie variável com prefixo `VITE_` que contenha segredo.** Tudo que
   começa com `VITE_` é embutido no pacote JavaScript e fica legível por qualquer
   visitante do site. Só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` podem ter
   esse prefixo. Segredo de servidor não tem consumidor no CInter — não há backend.
8c. **Nunca leia `import.meta.env` como objeto inteiro.** Leia sempre pelo nome da
   variável. Ler o objeto inteiro arrasta toda variável `VITE_` para o pacote.
9. Sem anúncios e sem rastreamento de terceiros na área da criança.

## Stack
React + Vite + Tailwind, JavaScript puro. Supabase. Sem TypeScript, sem Express,
sem Prisma, sem Next.js, sem Railway.

## Padrões
- Um componente por arquivo, PascalCase
- Toda chamada ao Supabase trata o erro; nunca ignore `error`
- Nada de localStorage para saldo ou progresso — a verdade é sempre o banco
- Todo texto visível em português brasileiro
- Duas áreas separadas: src/telas/responsavel e src/telas/crianca
- Alvo de toque mínimo 44px, mobile-first

## Checklist antes de dar algo por pronto
1. RLS ligada e testada com duas famílias diferentes?
2. Alguma operação de moeda acontecendo fora do banco?
3. Erro de toda chamada Supabase tratado?
4. Testado em tela de celular?
