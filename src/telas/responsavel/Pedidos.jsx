import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tempoDesde, traduzirErroPedido, usePedidos } from '../../hooks/usePedidos'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import { NOME_MOEDA } from '../../lib/moeda'

function formatarData(dataISO) {
  if (!dataISO) return ''
  return new Date(dataISO).toLocaleDateString('pt-BR')
}

function nomeCrianca(pedido) {
  return pedido.criancas?.apelido || pedido.criancas?.nome
}

// Confirmação de entrega. Entregar é irreversível — depois dele o banco
// recusa cancelar — e o botão fica colado no "Cancelar", no celular, numa
// mão só. "Tem certeza?" as pessoas fecham no automático; a pergunta que
// importa é se a recompensa já foi dada de verdade (decisões 78 a 80).
function ConfirmarEntrega({ pedido, processando, onFechar, onConfirmar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-lg font-semibold text-gray-900">Você já entregou?</h2>
        <p className="mt-3 text-base text-gray-700">
          Confirme só depois de dar &quot;{pedido.recompensas?.titulo}&quot; para {nomeCrianca(pedido)} de verdade.
          Depois disso não dá mais para cancelar.
        </p>
        <div className="mt-6 flex gap-3">
          <Botao variante="secundario" onClick={onFechar} disabled={processando}>
            Ainda não
          </Botao>
          <Botao onClick={onConfirmar} disabled={processando}>
            {processando ? 'Entregando…' : 'Já entreguei'}
          </Botao>
        </div>
      </div>
    </div>
  )
}

// Confirmação de cancelamento: diz o que acontece com a moeda, porque o
// cancelamento estorna e a criança vê isso no extrato.
function ConfirmarCancelamento({ pedido, processando, onFechar, onConfirmar }) {
  const nome = nomeCrianca(pedido)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="text-lg font-semibold text-gray-900">Cancelar &quot;{pedido.recompensas?.titulo}&quot;?</h2>
        <p className="mt-3 text-base text-gray-700">
          As {pedido.custo_pago} {NOME_MOEDA} voltam para a carteira de {nome}. {nome} vai ver isso no extrato.
        </p>
        <div className="mt-6 flex gap-3">
          <Botao variante="secundario" onClick={onFechar} disabled={processando}>
            Voltar
          </Botao>
          <Botao variante="perigo" onClick={onConfirmar} disabled={processando}>
            {processando ? 'Cancelando…' : 'Cancelar pedido'}
          </Botao>
        </div>
      </div>
    </div>
  )
}

function resumoHistorico(pedido) {
  if (pedido.status === 'entregue') return `Entregue em ${formatarData(pedido.decidido_em)}`
  return `Cancelado em ${formatarData(pedido.decidido_em)} · ${pedido.custo_pago} ${NOME_MOEDA} devolvidas`
}

export default function Pedidos() {
  const { pendentes, historico, carregando, erro, entregar, cancelar } = usePedidos()
  const navigate = useNavigate()
  const [entregando, setEntregando] = useState(null)
  const [cancelando, setCancelando] = useState(null)
  const [processando, setProcessando] = useState(false)
  const [erroAcao, setErroAcao] = useState('')

  async function aoConfirmarEntrega() {
    if (!entregando) return
    setErroAcao('')
    setProcessando(true)
    const { error } = await entregar(entregando.id)
    setProcessando(false)
    setEntregando(null)
    if (error) setErroAcao(traduzirErroPedido(error))
  }

  async function aoConfirmarCancelamento() {
    if (!cancelando) return
    setErroAcao('')
    setProcessando(true)
    const { error } = await cancelar(cancelando.id)
    setProcessando(false)
    setCancelando(null)
    if (error) setErroAcao(traduzirErroPedido(error))
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
        <h1 className="text-lg font-bold text-gray-900">Pedidos</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Aviso tipo="erro">{erro || erroAcao}</Aviso>

        <h2 className="mb-2 text-base font-semibold text-gray-800">Esperando</h2>
        {pendentes.length === 0 ? (
          <p className="mb-6 rounded-xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
            Nenhum pedido esperando. Quando uma criança pedir uma recompensa na loja, ele aparece aqui.
          </p>
        ) : (
          <ul className="mb-6 flex flex-col gap-3">
            {pendentes.map((pedido) => (
              <li key={pedido.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {pedido.recompensas?.icone || '🎁'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pedido.recompensas?.titulo}</p>
                    <p className="text-sm text-gray-500">
                      {nomeCrianca(pedido)} · {pedido.custo_pago} {NOME_MOEDA}
                    </p>
                    <p className="text-xs text-gray-400">pedido {tempoDesde(pedido.pedido_em)}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Botao
                    variante="secundario"
                    className="!w-auto flex-1 px-3 text-sm"
                    onClick={() => setCancelando(pedido)}
                    disabled={processando}
                  >
                    Cancelar
                  </Botao>
                  <Botao
                    className="!w-auto flex-1 px-3 text-sm"
                    onClick={() => setEntregando(pedido)}
                    disabled={processando}
                  >
                    Entregar
                  </Botao>
                </div>
              </li>
            ))}
          </ul>
        )}

        {historico.length > 0 && (
          <>
            <h2 className="mb-2 text-base font-semibold text-gray-800">Histórico</h2>
            <ul className="flex flex-col gap-3">
              {historico.map((pedido) => (
                <li key={pedido.id} className="rounded-xl bg-white p-4 opacity-60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {pedido.recompensas?.icone || '🎁'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{pedido.recompensas?.titulo}</p>
                      <p className="text-sm text-gray-500">
                        {nomeCrianca(pedido)} · {pedido.custo_pago} {NOME_MOEDA}
                      </p>
                      <p className="text-xs text-gray-400">{resumoHistorico(pedido)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      {entregando && (
        <ConfirmarEntrega
          pedido={entregando}
          processando={processando}
          onFechar={() => setEntregando(null)}
          onConfirmar={aoConfirmarEntrega}
        />
      )}

      {cancelando && (
        <ConfirmarCancelamento
          pedido={cancelando}
          processando={processando}
          onFechar={() => setCancelando(null)}
          onConfirmar={aoConfirmarCancelamento}
        />
      )}
    </div>
  )
}
