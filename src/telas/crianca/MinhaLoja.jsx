import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCrianca } from '../../hooks/useCrianca'
import { useCarteira } from '../../hooks/useCarteira'
import { traduzirErroResgate, useLojaCrianca } from '../../hooks/useLojaCrianca'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import { NOME_MOEDA } from '../../lib/moeda'

// Quantas metas mostrar de cara em "Quase lá". Três alvos alcançáveis puxam;
// vinte inalcançáveis afundam (decisão 74).
const METAS_VISIVEIS = 3

// Confirmação antes de pedir. O saldo é debitado NO PEDIDO, não na entrega —
// se a criança não souber disso, ela vê o número cair e acha que perdeu.
// "Se não der, elas voltam" é o que faz ela conseguir apertar o botão.
function ConfirmarPedido({ recompensa, enviando, onCancelar, onConfirmar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <p className="text-center text-5xl" aria-hidden="true">
          {recompensa.icone || '🎁'}
        </p>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">Pedir {recompensa.titulo}?</h2>
        <p className="mt-4 text-center text-lg text-gray-700">
          As {recompensa.custo} {NOME_MOEDA} saem da sua carteira agora. Depois alguém da família vai te
          entregar. Se não der, elas voltam.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Botao onClick={onConfirmar} disabled={enviando} className="min-h-14 text-xl">
            {enviando ? 'Pedindo…' : 'Pedir! 🎁'}
          </Botao>
          <Botao variante="secundario" onClick={onCancelar} disabled={enviando} className="min-h-14 text-xl">
            Ainda não
          </Botao>
        </div>
      </div>
    </div>
  )
}

function CartaoRecompensa({ recompensa, children }) {
  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          {recompensa.icone || '🎁'}
        </span>
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">{recompensa.titulo}</p>
          <p className="text-sm text-gray-500">
            {recompensa.custo} {NOME_MOEDA}
          </p>
        </div>
      </div>
      {children}
    </li>
  )
}

// Loja da criança (6 a 10 anos): saldo em destaque, o que ela já pode pedir,
// o que está quase lá (em tom de meta, nunca de falta) e o que ela já pediu
// e está esperando receber.
export default function MinhaLoja() {
  const { criancaId } = useParams()
  const navigate = useNavigate()
  const { crianca, carregando: carregandoCrianca } = useCrianca(criancaId)
  const { saldo, carregando: carregandoSaldo, recarregar: recarregarSaldo } = useCarteira(criancaId)
  const { recompensas, pendentes, carregando: carregandoLoja, erro, pedir } = useLojaCrianca(criancaId)
  const [confirmando, setConfirmando] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [avisoPedido, setAvisoPedido] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [mostrarTodasMetas, setMostrarTodasMetas] = useState(false)

  async function aoConfirmar() {
    if (!confirmando) return
    setAvisoPedido('')
    setSucesso('')
    setEnviando(true)
    const { error } = await pedir(confirmando.id)
    setEnviando(false)

    if (error) {
      setConfirmando(null)
      setAvisoPedido(traduzirErroResgate(error))
      return
    }

    setSucesso(`🎉 Pedido feito! ${confirmando.titulo} está a caminho. Agora é só esperar.`)
    setConfirmando(null)
    recarregarSaldo()
  }

  const carregando = carregandoCrianca || carregandoSaldo || carregandoLoja

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl text-gray-500">
        Carregando…
      </div>
    )
  }

  const saldoAtual = saldo ?? 0
  const disponiveis = recompensas.filter((r) => r.custo <= saldoAtual)
  // Já vêm ordenadas por custo, então as primeiras são as mais próximas.
  const metas = recompensas.filter((r) => r.custo > saldoAtual)
  const metasVisiveis = mostrarTodasMetas ? metas : metas.slice(0, METAS_VISIVEIS)
  const metasEscondidas = metas.length - metasVisiveis.length

  return (
    <div className="min-h-screen bg-yellow-50 pb-10">
      <header className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate(`/crianca/${criancaId}`)}
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
          <p className="text-lg font-medium opacity-90">Você tem</p>
          <p className="mt-1 text-5xl font-extrabold">{saldoAtual}</p>
          <p className="text-lg font-semibold opacity-90">{NOME_MOEDA}</p>
        </div>

        <Aviso tipo="erro">{erro}</Aviso>
        <Aviso tipo="info">{avisoPedido}</Aviso>
        <Aviso tipo="sucesso">{sucesso}</Aviso>

        {pendentes.length > 0 && (
          <section className="mb-6 mt-4">
            <h2 className="mb-3 text-xl font-bold text-gray-800">⏳ Esperando</h2>
            <ul className="flex flex-col gap-3">
              {pendentes.map((pedido) => (
                <li key={pedido.id} className="rounded-2xl bg-amber-50 p-4 shadow-sm ring-2 ring-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      {pedido.recompensas?.icone || '🎁'}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{pedido.recompensas?.titulo}</p>
                      <p className="text-sm text-amber-700">Pedido feito! Alguém da família vai te entregar.</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recompensas.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white p-4 text-center text-base text-gray-500 shadow-sm">
            A loja ainda está vazia. Peça para alguém da família colocar prêmios aqui! 🎁
          </p>
        ) : (
          <>
            <section className="mb-6 mt-4">
              <h2 className="mb-3 text-xl font-bold text-gray-800">🎁 Já posso pedir</h2>
              {disponiveis.length === 0 ? (
                <p className="rounded-2xl bg-white p-4 text-center text-base text-gray-500 shadow-sm">
                  Continue fazendo suas tarefas e logo você vai poder pedir um prêmio!
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {disponiveis.map((recompensa) => (
                    <CartaoRecompensa key={recompensa.id} recompensa={recompensa}>
                      <div className="mt-3">
                        <Botao onClick={() => setConfirmando(recompensa)} className="min-h-14 text-xl">
                          Quero! 🎁
                        </Botao>
                      </div>
                    </CartaoRecompensa>
                  ))}
                </ul>
              )}
            </section>

            {metas.length > 0 && (
              <section className="mb-6">
                <h2 className="mb-3 text-xl font-bold text-gray-800">🎯 Quase lá</h2>
                <ul className="flex flex-col gap-3">
                  {metasVisiveis.map((recompensa) => {
                    const faltam = recompensa.custo - saldoAtual
                    const progresso = Math.round((saldoAtual / recompensa.custo) * 100)
                    return (
                      <CartaoRecompensa key={recompensa.id} recompensa={recompensa}>
                        <div className="mt-3">
                          <p className="text-base font-semibold text-purple-700">
                            Faltam {faltam} {NOME_MOEDA}
                          </p>
                          <div
                            className="mt-1 h-3 w-full overflow-hidden rounded-full bg-purple-100"
                            role="progressbar"
                            aria-valuenow={progresso}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div className="h-full rounded-full bg-purple-500" style={{ width: `${progresso}%` }} />
                          </div>
                        </div>
                      </CartaoRecompensa>
                    )
                  })}
                </ul>

                {metasEscondidas > 0 && (
                  <Botao variante="secundario" className="mt-3 text-lg" onClick={() => setMostrarTodasMetas(true)}>
                    Ver tudo (+{metasEscondidas})
                  </Botao>
                )}
                {mostrarTodasMetas && metas.length > METAS_VISIVEIS && (
                  <Botao variante="secundario" className="mt-3 text-lg" onClick={() => setMostrarTodasMetas(false)}>
                    Mostrar menos
                  </Botao>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {confirmando && (
        <ConfirmarPedido
          recompensa={confirmando}
          enviando={enviando}
          onCancelar={() => setConfirmando(null)}
          onConfirmar={aoConfirmar}
        />
      )}
    </div>
  )
}
