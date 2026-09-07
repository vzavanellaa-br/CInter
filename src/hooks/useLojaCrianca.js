import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { NOME_MOEDA } from '../lib/moeda'

// As mensagens que resgatar_recompensa lança são para adulto. Aqui viram
// fala de criança: sem "não", sem "insuficiente", sem parecer bronca.
export function traduzirErroResgate(error) {
  const mensagem = error?.message ?? ''

  if (mensagem.includes('Saldo insuficiente')) {
    return `Ainda faltam algumas ${NOME_MOEDA} para essa. Continue fazendo suas tarefas!`
  }
  if (mensagem.includes('sem estoque')) {
    return 'Essa acabou! Escolha outra.'
  }
  if (mensagem.includes('não está mais disponível') || mensagem.includes('Recompensa não encontrada')) {
    return 'Essa saiu da loja. Escolha outra.'
  }

  return 'Não deu para pedir agora. Peça ajuda para alguém da família.'
}

// Loja do lado da criança: vitrine com as recompensas ativas da família e a
// lista do que ela já pediu e ainda não recebeu. Pedir chama a função do
// banco, que confere saldo e estoque, cria o pedido, debita a carteira e
// grava a transação. O front nunca calcula nem escreve saldo.
export function useLojaCrianca(criancaId) {
  const [recompensas, setRecompensas] = useState([])
  const [pendentes, setPendentes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    if (!criancaId) {
      setRecompensas([])
      setPendentes([])
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro('')

    const { data: recompensasData, error: erroRecompensas } = await supabase
      .from('recompensas')
      .select('id, titulo, icone, custo, tipo, estoque')
      .eq('ativa', true)
      .order('custo', { ascending: true })

    if (erroRecompensas) {
      setErro('Não deu para abrir a loja agora. Tente de novo daqui a pouco.')
      setCarregando(false)
      return
    }

    const { data: pendentesData, error: erroPendentes } = await supabase
      .from('resgates')
      .select('id, custo_pago, pedido_em, recompensas(titulo, icone)')
      .eq('crianca_id', criancaId)
      .eq('status', 'pendente')
      .order('pedido_em', { ascending: false })

    if (erroPendentes) {
      setErro('Não deu para ver seus pedidos agora. Tente de novo daqui a pouco.')
      setCarregando(false)
      return
    }

    // Esgotada (estoque zero) some da vitrine: para a criança ela simplesmente
    // não está na loja. Estoque null é ilimitado e passa.
    setRecompensas((recompensasData ?? []).filter((r) => r.estoque === null || r.estoque > 0))
    setPendentes(pendentesData ?? [])
    setCarregando(false)
  }, [criancaId])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function pedir(recompensaId) {
    const { error } = await supabase.rpc('resgatar_recompensa', {
      p_recompensa_id: recompensaId,
      p_crianca_id: criancaId,
    })
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  return { recompensas, pendentes, carregando, erro, recarregar, pedir }
}
