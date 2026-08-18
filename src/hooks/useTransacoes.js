import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Extrato de uma criança — só leitura, mais recente primeiro.
export function useTransacoes(criancaId, limite = 50) {
  const [transacoes, setTransacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    if (!criancaId) {
      setTransacoes([])
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('transacoes')
      .select('id, tipo, valor, origem, descricao, saldo_apos, criado_em')
      .eq('crianca_id', criancaId)
      .order('criado_em', { ascending: false })
      .limit(limite)

    if (error) {
      setErro('Não foi possível carregar o extrato.')
      setCarregando(false)
      return
    }

    setTransacoes(data ?? [])
    setCarregando(false)
  }, [criancaId, limite])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { transacoes, carregando, erro, recarregar }
}
