import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CAMPOS = 'id, custo_pago, status, pedido_em, decidido_em, recompensas(titulo, icone), criancas(nome, apelido)'

// Quantos entregues/cancelados mostrar no histórico. Sem limite a tela
// cresceria sem fim; 50 cobre meses de uma família normal.
const LIMITE_HISTORICO = 50

// "pedido há 2 dias": há quanto tempo desde uma data do banco. Função pura,
// recebe "agora" por parâmetro para dar para testar com valores conhecidos.
export function tempoDesde(dataISO, agora = new Date()) {
  const segundos = Math.max(0, Math.floor((agora - new Date(dataISO)) / 1000))
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)

  if (minutos < 1) return 'agora há pouco'
  if (horas < 1) return `há ${minutos} min`
  if (dias < 1) return horas === 1 ? 'há 1 hora' : `há ${horas} horas`
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`
}

// As funções do banco lançam mensagens técnicas de uma linha. Aqui viram
// português de adulto, sem parecer mensagem de sistema.
export function traduzirErroPedido(error) {
  const mensagem = error?.message ?? ''

  if (mensagem.includes('já foi entregue')) {
    return 'Esse pedido já foi entregue, não dá mais para cancelar.'
  }
  if (mensagem.includes('foi cancelado')) {
    return 'Esse pedido já tinha sido cancelado.'
  }
  if (mensagem.includes('Resgate não encontrado')) {
    return 'Pedido não encontrado. Atualize a tela e tente de novo.'
  }

  return 'Não foi possível concluir. Tente novamente.'
}

// Pedidos (resgates) da família logada. Pendentes do mais antigo para o
// mais novo — quem esperou mais aparece no topo. Entregar e cancelar chamam
// só as funções do banco: cancelar estorna a carteira lá dentro, entregar
// não mexe em saldo porque o débito já aconteceu no pedido.
// comHistorico=false carrega só os pendentes (o Início só precisa do número).
export function usePedidos({ comHistorico = true } = {}) {
  const [pendentes, setPendentes] = useState([])
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro('')

    const { data: pendentesData, error: erroPendentes } = await supabase
      .from('resgates')
      .select(CAMPOS)
      .eq('status', 'pendente')
      .order('pedido_em', { ascending: true })

    if (erroPendentes) {
      setErro('Não foi possível carregar os pedidos.')
      setCarregando(false)
      return
    }

    setPendentes(pendentesData ?? [])

    if (!comHistorico) {
      setCarregando(false)
      return
    }

    const { data: historicoData, error: erroHistorico } = await supabase
      .from('resgates')
      .select(CAMPOS)
      .in('status', ['entregue', 'cancelado'])
      .order('decidido_em', { ascending: false })
      .limit(LIMITE_HISTORICO)

    if (erroHistorico) {
      setErro('Não foi possível carregar o histórico de pedidos.')
      setCarregando(false)
      return
    }

    setHistorico(historicoData ?? [])
    setCarregando(false)
  }, [comHistorico])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function entregar(resgateId) {
    const { error } = await supabase.rpc('entregar_resgate', { p_resgate_id: resgateId })
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  async function cancelar(resgateId) {
    const { error } = await supabase.rpc('cancelar_resgate', { p_resgate_id: resgateId })
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  return { pendentes, historico, carregando, erro, recarregar, entregar, cancelar }
}
