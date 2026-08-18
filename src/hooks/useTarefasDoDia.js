import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Data de hoje em texto AAAA-MM-DD, no fuso do navegador — igual ao que
// current_date usaria no servidor para o mesmo dia civil.
function hojeISO() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// Date.getDay() já usa 0=domingo…6=sábado, igual ao dias_semana do banco.
function tarefaOcorreHoje(tarefa, diaSemanaHoje, hojeStr) {
  if (tarefa.recorrencia === 'diaria') return true
  if (tarefa.recorrencia === 'semanal') return (tarefa.dias_semana ?? []).includes(diaSemanaHoje)
  if (tarefa.recorrencia === 'avulsa') return tarefa.data_especifica === hojeStr
  return false
}

// Tarefas de hoje de uma criança, já cruzadas com a execução do dia (se
// houver) para saber o status: nao_feita / pendente / aprovada / rejeitada.
export function useTarefasDoDia(criancaId) {
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    if (!criancaId) {
      setTarefas([])
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro('')

    const hoje = hojeISO()
    const diaSemanaHoje = new Date().getDay()

    const { data: tarefasData, error: erroTarefas } = await supabase
      .from('tarefas')
      .select('id, titulo, icone, valor_cruzeiro, recorrencia, dias_semana, data_especifica')
      .eq('crianca_id', criancaId)
      .eq('ativa', true)

    if (erroTarefas) {
      setErro('Não foi possível carregar as tarefas de hoje.')
      setCarregando(false)
      return
    }

    const { data: execucoesData, error: erroExecucoes } = await supabase
      .from('execucoes_tarefa')
      .select('id, tarefa_id, status, valor_creditado')
      .eq('crianca_id', criancaId)
      .eq('data_referencia', hoje)

    if (erroExecucoes) {
      setErro('Não foi possível carregar o que já foi feito hoje.')
      setCarregando(false)
      return
    }

    const execucaoPorTarefa = new Map((execucoesData ?? []).map((e) => [e.tarefa_id, e]))

    const doDia = (tarefasData ?? [])
      .filter((t) => tarefaOcorreHoje(t, diaSemanaHoje, hoje))
      .map((t) => {
        const execucao = execucaoPorTarefa.get(t.id)
        return {
          ...t,
          execucaoId: execucao?.id ?? null,
          status: execucao?.status ?? 'nao_feita',
          valorCreditado: execucao?.valor_creditado ?? null,
        }
      })

    setTarefas(doDia)
    setCarregando(false)
  }, [criancaId])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  async function marcar(tarefaId) {
    const { error } = await supabase.rpc('marcar_tarefa', {
      p_tarefa_id: tarefaId,
      p_data: hojeISO(),
    })
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  return { tarefas, carregando, erro, recarregar, marcar }
}
