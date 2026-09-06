import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Rótulos dos tipos aceitos pelo CHECK da tabela recompensas.
export const TIPO_ROTULO = { objeto: 'Objeto', experiencia: 'Experiência', privilegio: 'Privilégio' }

// Formata uma data como AAAA-MM-DD no fuso local, igual ao que o banco guarda
// em tarefas.data_especifica.
function dataLocal(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

// Quanto uma tarefa ativa rende na semana corrente (domingo a sábado):
// diária conta 7 vezes, semanal uma vez por dia marcado, avulsa só se a data
// cair dentro desta semana.
function valorSemanalDaTarefa(tarefa, inicioSemana, fimSemana) {
  if (tarefa.recorrencia === 'diaria') return tarefa.valor_cruzeiro * 7
  if (tarefa.recorrencia === 'semanal') return tarefa.valor_cruzeiro * (tarefa.dias_semana?.length ?? 0)
  if (tarefa.recorrencia === 'avulsa' && tarefa.data_especifica) {
    const dentroDaSemana = tarefa.data_especifica >= inicioSemana && tarefa.data_especifica <= fimSemana
    return dentroDaSemana ? tarefa.valor_cruzeiro : 0
  }
  return 0
}

// Ganho semanal possível por criança: soma das tarefas ativas dela na semana
// mais o bônus de consistência da família, quando ativo. O bônus é uma regra
// por família e vale para cada criança que bater a meta, por isso entra
// inteiro em cada uma. Função pura, sem acesso ao banco — fácil de conferir.
export function calcularGanhoSemanal(tarefas, regraBonus, hoje = new Date()) {
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - hoje.getDay())
  const fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6)
  const inicioSemana = dataLocal(inicio)
  const fimSemana = dataLocal(fim)

  const bonus = regraBonus?.ativo ? regraBonus.valor_bonus : 0
  const porCrianca = {}

  for (const tarefa of tarefas) {
    if (!tarefa.ativa) continue
    porCrianca[tarefa.crianca_id] =
      (porCrianca[tarefa.crianca_id] ?? 0) + valorSemanalDaTarefa(tarefa, inicioSemana, fimSemana)
  }

  for (const criancaId of Object.keys(porCrianca)) {
    porCrianca[criancaId] += bonus
  }

  return { porCrianca, bonus }
}

// Recompensas da família logada (a RLS já cuida do filtro), mais o que a
// tela de cadastro precisa para sugerir uma faixa de custo: as tarefas ativas
// e a regra de bônus. Aqui só se lê tarefas e regras_bonus — nunca se escreve.
export function useRecompensas() {
  const [recompensas, setRecompensas] = useState([])
  const [ganhoSemanal, setGanhoSemanal] = useState({ porCrianca: {}, bonus: 0 })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('recompensas')
      .select('id, titulo, icone, custo, tipo, estoque, ativa')
      .order('criado_em', { ascending: false })

    if (error) {
      setErro('Não foi possível carregar as recompensas.')
      setCarregando(false)
      return
    }

    setRecompensas(data ?? [])
    setCarregando(false)
  }, [])

  // A sugestão de custo é ajuda, não bloqueio: se falhar, a tela segue sem
  // ela e avisa com uma mensagem própria, sem travar o cadastro.
  const carregarGanhoSemanal = useCallback(async () => {
    const { data: tarefas, error: erroTarefas } = await supabase
      .from('tarefas')
      .select('crianca_id, valor_cruzeiro, recorrencia, dias_semana, data_especifica, ativa')
      .eq('ativa', true)

    if (erroTarefas) {
      setGanhoSemanal({ porCrianca: {}, bonus: 0, erro: true })
      return
    }

    const { data: regraBonus, error: erroBonus } = await supabase
      .from('regras_bonus')
      .select('valor_bonus, ativo')
      .maybeSingle()

    if (erroBonus) {
      setGanhoSemanal({ porCrianca: {}, bonus: 0, erro: true })
      return
    }

    setGanhoSemanal(calcularGanhoSemanal(tarefas ?? [], regraBonus))
  }, [])

  useEffect(() => {
    recarregar()
    carregarGanhoSemanal()
  }, [recarregar, carregarGanhoSemanal])

  async function criar(recompensa) {
    const { error } = await supabase.from('recompensas').insert(recompensa)
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  // Desativar é atualizar({ ativa: false }). Não existe apagar: um resgate
  // antigo pode apontar para a recompensa, e o histórico depende dela existir.
  async function atualizar(id, campos) {
    const { error } = await supabase.from('recompensas').update(campos).eq('id', id)
    if (error) return { error }
    await recarregar()
    return { error: null }
  }

  return { recompensas, ganhoSemanal, carregando, erro, recarregar, criar, atualizar }
}
