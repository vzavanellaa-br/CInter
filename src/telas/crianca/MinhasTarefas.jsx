import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCrianca } from '../../hooks/useCrianca'
import { useCarteira } from '../../hooks/useCarteira'
import { useTarefasDoDia } from '../../hooks/useTarefasDoDia'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'

// Tela da criança (6 a 10 anos): sem PIN por enquanto, entra pelo botão
// "Ver como criança" do Início. Texto curto, fonte grande, nada de vermelho
// de erro ou linguagem de culpa quando uma tarefa é rejeitada.
export default function MinhasTarefas() {
  const { criancaId } = useParams()
  const navigate = useNavigate()
  const { crianca, carregando: carregandoCrianca } = useCrianca(criancaId)
  const { saldo, carregando: carregandoSaldo, recarregar: recarregarSaldo } = useCarteira(criancaId)
  const { tarefas, carregando: carregandoTarefas, erro, marcar } = useTarefasDoDia(criancaId)
  const [marcandoId, setMarcandoId] = useState(null)
  const [erroMarcar, setErroMarcar] = useState('')

  async function aoMarcar(tarefaId) {
    setErroMarcar('')
    setMarcandoId(tarefaId)
    const { error } = await marcar(tarefaId)
    setMarcandoId(null)

    if (error) {
      setErroMarcar('Não deu para marcar essa tarefa agora. Peça ajuda para o responsável.')
      return
    }

    recarregarSaldo()
  }

  const carregando = carregandoCrianca || carregandoSaldo || carregandoTarefas

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-gray-500">
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-50 pb-10">
      <header className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate('/inicio')}
          className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-base font-medium text-gray-600"
        >
          ← Voltar
        </button>
        <span className="text-3xl" aria-hidden="true">
          {crianca?.avatar}
        </span>
      </header>

      <div className="mx-auto max-w-md px-4">
        <div className="mb-6 rounded-3xl bg-purple-600 p-6 text-center text-white shadow-md">
          <p className="text-lg font-medium opacity-90">Oi, {crianca?.apelido || crianca?.nome}!</p>
          <p className="mt-1 text-5xl font-extrabold">{saldo ?? 0}</p>
          <p className="text-lg font-semibold opacity-90">Cruzeiros</p>
        </div>

        <Aviso tipo="erro">{erro || erroMarcar}</Aviso>

        <h2 className="mb-3 text-xl font-bold text-gray-800">Tarefas de hoje</h2>

        {tarefas.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-center text-base text-gray-500 shadow-sm">
            Nenhuma tarefa por hoje. Aproveite para brincar! 🎉
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tarefas.map((tarefa) => (
              <li key={tarefa.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {tarefa.icone || '⭐'}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-900">{tarefa.titulo}</p>
                    <p className="text-sm text-gray-500">{tarefa.valor_cruzeiro} Cruzeiros</p>
                  </div>
                </div>

                <div className="mt-3">
                  {tarefa.status === 'nao_feita' && (
                    <Botao
                      onClick={() => aoMarcar(tarefa.id)}
                      disabled={marcandoId === tarefa.id}
                      className="min-h-14 text-xl"
                    >
                      {marcandoId === tarefa.id ? 'Marcando…' : 'Fiz! ✅'}
                    </Botao>
                  )}

                  {tarefa.status === 'pendente' && (
                    <div className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-amber-50 text-center text-lg font-medium text-amber-700">
                      ⏳ Esperando o papai conferir
                    </div>
                  )}

                  {tarefa.status === 'aprovada' && (
                    <div className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-green-50 text-center text-lg font-medium text-green-700">
                      🎉 Você ganhou {tarefa.valorCreditado} Cruzeiros!
                    </div>
                  )}

                  {tarefa.status === 'rejeitada' && (
                    <div className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-blue-50 px-2 text-center text-lg font-medium text-blue-700">
                      💙 Essa não valeu dessa vez. Vamos tentar de novo amanhã!
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
