// Ordem cronológica dos períodos do dia. 'manha' < 'noite' < 'tarde' em
// ordem alfabética sairia errado — por isso a ordem vem daqui, nunca de
// ORDER BY no banco nem de .sort() por texto no JavaScript.
export const ORDEM_PERIODOS = ['manha', 'tarde', 'noite', null]

const INFO_PERIODOS = {
  manha: { rotulo: 'Manhã', icone: '🌅', inicio: '00:00', fim: '12:00' },
  tarde: { rotulo: 'Tarde', icone: '☀️', inicio: '12:00', fim: '18:00' },
  noite: { rotulo: 'Noite', icone: '🌙', inicio: '18:00', fim: '24:00' },
}

const QUALQUER_HORA = { rotulo: 'A qualquer hora', icone: '🕐' }

// periodo null (ou desconhecido) sempre cai em "a qualquer hora".
export function infoPeriodo(periodo) {
  return INFO_PERIODOS[periodo] ?? QUALQUER_HORA
}

// Mesma faixa do CHECK periodo_horario_coerente do banco. Usado para avisar
// antes de salvar, em vez de deixar o banco recusar com erro técnico.
export function horarioForaDoPeriodo(periodo, horario) {
  if (!periodo || !horario) return false
  const faixa = INFO_PERIODOS[periodo]
  if (!faixa) return false
  return horario < faixa.inicio || horario >= faixa.fim
}

// 'HH:MM' (do <input type="time">) ou 'HH:MM:SS' (como o banco devolve)
// -> "às 7h30", ou "às 7h" quando os minutos são 00.
export function formatarHorario(horario) {
  if (!horario) return ''
  const [horaTexto, minutoTexto] = horario.split(':')
  const hora = Number(horaTexto)
  const minuto = Number(minutoTexto)
  return minuto === 0 ? `às ${hora}h` : `às ${hora}h${String(minuto).padStart(2, '0')}`
}

// Período atual pelo relógio do aparelho — mesma faixa da tabela.
export function periodoAtual() {
  const hora = new Date().getHours()
  if (hora < 12) return 'manha'
  if (hora < 18) return 'tarde'
  return 'noite'
}
