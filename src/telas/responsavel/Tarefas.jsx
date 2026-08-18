import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFamilia } from '../../hooks/useFamilia'
import { useTarefas } from '../../hooks/useTarefas'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import FormularioTarefa from './FormularioTarefa'

const RECORRENCIA_ROTULO = { diaria: 'Diária', semanal: 'Semanal', avulsa: 'Avulsa' }
const DIA_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function resumoRecorrencia(tarefa) {
  if (tarefa.recorrencia === 'diaria') return 'Todos os dias'
  if (tarefa.recorrencia === 'semanal') {
    return (tarefa.dias_semana ?? []).map((d) => DIA_ABREV[d]).join(', ')
  }
  if (tarefa.recorrencia === 'avulsa' && tarefa.data_especifica) {
    return new Date(`${tarefa.data_especifica}T00:00:00`).toLocaleDateString('pt-BR')
  }
  return ''
}

export default function Tarefas() {
  const { sessao } = useAuth()
  const { familia, criancas, carregando: carregandoFamilia } = useFamilia(sessao)
  const { tarefas, carregando, erro, criar, atualizar } = useTarefas()
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [erroAcao, setErroAcao] = useState('')

  function abrirNovaTarefa() {
    setTarefaEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(tarefa) {
    setTarefaEditando(tarefa)
    setModalAberto(true)
  }

  async function aoSalvar(payload) {
    if (tarefaEditando) {
      return atualizar(tarefaEditando.id, payload)
    }
    return criar({ ...payload, familia_id: familia.id })
  }

  // Desativar usa ativa=false — nunca apagamos uma tarefa, ela pode já ter
  // execuções (histórico e conferência dependem dela continuar existindo).
  async function aoAlternarAtiva(tarefa) {
    setErroAcao('')
    const { error } = await atualizar(tarefa.id, { ativa: !tarefa.ativa })
    if (error) {
      setErroAcao('Não foi possível atualizar a tarefa. Tente novamente.')
    }
  }

  if (carregandoFamilia || carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="flex items-center gap-3 bg-white px-4 py-4 shadow-sm">
        <button onClick={() => navigate('/inicio')} className="flex min-h-11 items-center px-1 text-gray-600">
          ← Voltar
        </button>
        <h1 className="text-lg font-bold text-gray-900">Tarefas</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Aviso tipo="erro">{erro || erroAcao}</Aviso>

        {criancas.length === 0 ? (
          <Aviso tipo="info">Cadastre uma criança antes de criar tarefas.</Aviso>
        ) : (
          <>
            <Botao onClick={abrirNovaTarefa} className="mb-4">
              + Nova tarefa
            </Botao>

            {tarefas.length === 0 ? (
              <p className="rounded-xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
                Nenhuma tarefa ainda. Crie a primeira tarefa para começar a rotina.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {tarefas.map((tarefa) => (
                  <li
                    key={tarefa.id}
                    className={`rounded-xl bg-white p-4 shadow-sm ${!tarefa.ativa ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {tarefa.icone || '⭐'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tarefa.titulo}</p>
                        <p className="text-sm text-gray-500">
                          {tarefa.criancas?.apelido || tarefa.criancas?.nome} · {tarefa.valor_cruzeiro} Cruzeiros
                        </p>
                        <p className="text-xs text-gray-400">
                          {RECORRENCIA_ROTULO[tarefa.recorrencia]} · {resumoRecorrencia(tarefa)}
                        </p>
                        {!tarefa.ativa && <p className="mt-1 text-xs font-medium text-gray-400">Desativada</p>}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Botao
                        variante="secundario"
                        className="!w-auto px-3 text-sm"
                        onClick={() => abrirEdicao(tarefa)}
                      >
                        Editar
                      </Botao>
                      <Botao
                        variante="secundario"
                        className="!w-auto px-3 text-sm"
                        onClick={() => aoAlternarAtiva(tarefa)}
                      >
                        {tarefa.ativa ? 'Desativar' : 'Reativar'}
                      </Botao>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {modalAberto && (
        <FormularioTarefa
          criancas={criancas}
          tarefaExistente={tarefaEditando}
          onFechar={() => setModalAberto(false)}
          onSalvar={aoSalvar}
        />
      )}
    </div>
  )
}
