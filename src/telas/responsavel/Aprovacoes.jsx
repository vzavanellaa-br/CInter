import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAprovacoes } from '../../hooks/useAprovacoes'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import { NOME_MOEDA } from '../../lib/moeda'

function formatarData(dataISO) {
  return new Date(`${dataISO}T00:00:00`).toLocaleDateString('pt-BR')
}

function nomeCrianca(execucao) {
  return execucao.criancas?.apelido || execucao.criancas?.nome
}

// Aprovar e rejeitar são IRREVERSÍVEIS no banco: aprovar_execucao recusa uma
// execução rejeitada, e rejeitar_execucao recusa uma aprovada ("estornar é
// um fluxo separado, ainda não implementado"). Por isso os dois pedem
// confirmação — mas não "tem certeza?", que as pessoas fecham no automático.
// A pergunta é a que faz o adulto olhar para o mundo real (decisão 78).
function ConfirmarAprovacao({ execucao, processando, onFechar, onConfirmar }) {
  const nome = nomeCrianca(execucao)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-lg font-semibold text-gray-900">{nome} fez mesmo?</h2>
        <p className="mt-3 text-base text-gray-700">
          Confirme só depois de ver que &quot;{execucao.tarefas?.titulo}&quot; foi feita de verdade. {nome} recebe{' '}
          {execucao.tarefas?.valor_moeda} {NOME_MOEDA} agora, e isso não tem volta.
        </p>
        <div className="mt-6 flex gap-3">
          <Botao variante="secundario" onClick={onFechar} disabled={processando}>
            Ainda não
          </Botao>
          <Botao onClick={onConfirmar} disabled={processando}>
            {processando ? 'Aprovando…' : 'Fez, aprovar'}
          </Botao>
        </div>
      </div>
    </div>
  )
}

// Rejeitar por engano é o pior caso: a criança fez, o adulto errou o botão,
// e não existe conserto dentro do app. O texto diz isso sem rodeio.
function ConfirmarRejeicao({ execucao, processando, onFechar, onConfirmar }) {
  const nome = nomeCrianca(execucao)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-lg font-semibold text-gray-900">Rejeitar &quot;{execucao.tarefas?.titulo}&quot;?</h2>
        <p className="mt-3 text-base text-gray-700">
          {nome} não vai receber as {execucao.tarefas?.valor_moeda} {NOME_MOEDA} por essa tarefa neste dia. Isso
          não pode ser desfeito: depois de rejeitar, não dá mais para aprovar.
        </p>
        <div className="mt-6 flex gap-3">
          <Botao variante="secundario" onClick={onFechar} disabled={processando}>
            Voltar
          </Botao>
          <Botao variante="perigo" onClick={onConfirmar} disabled={processando}>
            {processando ? 'Rejeitando…' : 'Rejeitar'}
          </Botao>
        </div>
      </div>
    </div>
  )
}

export default function Aprovacoes() {
  const { execucoes, carregando, erro, aprovar, rejeitar } = useAprovacoes()
  const navigate = useNavigate()
  const [aprovando, setAprovando] = useState(null)
  const [rejeitando, setRejeitando] = useState(null)
  const [processando, setProcessando] = useState(false)
  const [erroAcao, setErroAcao] = useState('')

  async function aoConfirmarAprovacao() {
    if (!aprovando) return
    setErroAcao('')
    setProcessando(true)
    const { error } = await aprovar(aprovando.id)
    setProcessando(false)
    setAprovando(null)
    if (error) setErroAcao('Não foi possível aprovar. Tente novamente.')
  }

  async function aoConfirmarRejeicao() {
    if (!rejeitando) return
    setErroAcao('')
    setProcessando(true)
    const { error } = await rejeitar(rejeitando.id)
    setProcessando(false)
    setRejeitando(null)
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
                      {nomeCrianca(execucao)} · {formatarData(execucao.data_referencia)}
                    </p>
                    <p className="text-sm font-medium text-purple-600">
                      {execucao.tarefas?.valor_moeda} {NOME_MOEDA}
                    </p>
                  </div>
                </div>

                {/* Aprovar é a ação principal e ocupa a linha. Rejeitar fica
                    menor, abaixo e à direita, longe do polegar que aprova. */}
                <div className="mt-3 flex flex-col gap-2">
                  <Botao onClick={() => setAprovando(execucao)} disabled={processando}>
                    Aprovar
                  </Botao>
                  <div className="flex justify-end">
                    <Botao
                      variante="secundario"
                      className="!w-auto border-transparent px-3 text-sm text-gray-500 hover:bg-gray-100"
                      onClick={() => setRejeitando(execucao)}
                      disabled={processando}
                    >
                      Rejeitar
                    </Botao>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {aprovando && (
        <ConfirmarAprovacao
          execucao={aprovando}
          processando={processando}
          onFechar={() => setAprovando(null)}
          onConfirmar={aoConfirmarAprovacao}
        />
      )}

      {rejeitando && (
        <ConfirmarRejeicao
          execucao={rejeitando}
          processando={processando}
          onFechar={() => setRejeitando(null)}
          onConfirmar={aoConfirmarRejeicao}
        />
      )}
    </div>
  )
}
