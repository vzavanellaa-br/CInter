// Traduz mensagens de erro técnicas do Supabase Auth para português simples.
// Nunca mostramos o texto cru do Supabase na tela — só aqui, se algum dia
// precisar depurar, é que o detalhe original importa.
export function traduzirErroAuth(error) {
  const mensagem = error?.message ?? ''

  if (mensagem.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (mensagem.includes('User already registered')) {
    return 'Este e-mail já tem uma conta. Tente entrar.'
  }
  if (mensagem.includes('Password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (mensagem.includes('Unable to validate email address')) {
    return 'Digite um e-mail válido.'
  }
  if (mensagem.includes('Email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.'
  }

  return 'Não foi possível completar a ação. Tente novamente.'
}
