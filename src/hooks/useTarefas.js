import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Todas as tarefas da família logada (RLS já cuida do filtro), com o nome
// da criança embutido para não precisar de uma segunda busca na tela.
export function useTarefas() {
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('tarefas')
      .select(
        'id, titulo, icone, valor_cruzeiro, recorrencia, dias_semana, data_especifica, periodo, horario, ativa, crianca_id, criancas(nome, apelido)',
      )
      .order('criado_em', { ascending: false })

    if (error) {
      setErro('Não foi possível carregar as tarefas.')
      setCarregando(false)
      return
    }

    setTarefas(data ?? [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function criar(tarefa) {
    const { error } = await supabase.from('tarefas').insert(tarefa)
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  async function atualizar(id, campos) {
    const { error } = await supabase.from('tarefas').update(campos).eq('id', id)
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  return { tarefas, carregando, erro, recarregar, criar, atualizar }
}
