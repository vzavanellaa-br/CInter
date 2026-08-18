import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Execuções pendentes da família logada, mais recentes primeiro. Aprovar e
// rejeitar chamam só as funções do banco — o front nunca escreve direto em
// execucoes_tarefa, carteiras ou transacoes.
export function useAprovacoes() {
  const [execucoes, setExecucoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('execucoes_tarefa')
      .select(
        'id, data_referencia, marcada_em, tarefas(titulo, icone, valor_cruzeiro), criancas(nome, apelido)',
      )
      .eq('status', 'pendente')
      .order('marcada_em', { ascending: false })

    if (error) {
      setErro('Não foi possível carregar as aprovações pendentes.')
      setCarregando(false)
      return
    }

    setExecucoes(data ?? [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function aprovar(execucaoId) {
    const { error } = await supabase.rpc('aprovar_execucao', { p_execucao_id: execucaoId })
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  async function rejeitar(execucaoId) {
    const { error } = await supabase.rpc('rejeitar_execucao', { p_execucao_id: execucaoId })
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  return { execucoes, carregando, erro, recarregar, aprovar, rejeitar }
}
