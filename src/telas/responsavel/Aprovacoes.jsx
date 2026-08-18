import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAprovacoes } from '../../hooks/useAprovacoes'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'

function formatarData(dataISO) {
  return new Date(`${dataISO}T00:00:00`).toLocaleDateString('pt-BR')
}

export default function Aprovacoes() {
  const { execucoes, carregando, erro, aprovar, rejeitar } = useAprovacoes()
  const navigate = useNavigate()
  const [processandoId, setProcessandoId] = useState(null)
  const [erroAcao, setErroAcao] = useState('')

  async function aoAprovar(id) {
    setErroAcao('')
    setProcessandoId(id)
    const { error } = await aprovar(id)
    setProcessandoId(null)
    if (error) setErroAcao('Não foi possível aprovar. Tente novamente.')
  }

  async function aoRejeitar(id) {
    setErroAcao('')
    setProcessandoId(id)
    const { error } = await rejeitar(id)
    setProcessandoId(null)
    if (error) setErroAcao('Não foi possível rejeitar. Tente novamente.')
  }

  if (carregando) {
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
        <h1 className="text-lg font-bold text-gray-900">Aprovações</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Aviso tipo="erro">{erro || erroAcao}</Aviso>

        {execucoes.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
            Nenhuma aprovação pendente. Assim que uma criança marcar uma tarefa como feita, ela aparece aqui.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {execucoes.map((execucao) => (
              <li key={execucao.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {execucao.tarefas?.icone || '⭐'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{execucao.tarefas?.titulo}</p>
                    <p className="text-sm text-gray-500">
                      {execucao.criancas?.apelido || execucao.criancas?.nome} · {formatarData(execucao.data_referencia)}
                    </p>
                    <p className="text-sm font-medium text-purple-600">
                      {execucao.tarefas?.valor_cruzeiro} Cruzeiros
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Botao
                    variante="secundario"
                    className="!w-auto flex-1 px-3 text-sm"
                    onClick={() => aoRejeitar(execucao.id)}
                    disabled={processandoId === execucao.id}
                  >
                    Rejeitar
                  </Botao>
                  <Botao
                    className="!w-auto flex-1 px-3 text-sm"
                    onClick={() => aoAprovar(execucao.id)}
                    disabled={processandoId === execucao.id}
                  >
                    Aprovar
                  </Botao>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
