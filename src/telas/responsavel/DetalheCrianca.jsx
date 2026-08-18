import { useNavigate, useParams } from 'react-router-dom'
import { useCrianca } from '../../hooks/useCrianca'
import { useCarteira } from '../../hooks/useCarteira'
import { useTransacoes } from '../../hooks/useTransacoes'
import Aviso from '../../componentes/ui/Aviso'

const ORIGEM_ROTULO = {
  tarefa: 'Tarefa aprovada',
  bonus_consistencia: 'Bônus de consistência',
  resgate: 'Resgate',
  ajuste_manual: 'Ajuste',
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Saldo em destaque + extrato das últimas 50 transações. Tudo só leitura —
// carteiras e transacoes não aceitam escrita do cliente.
export default function DetalheCrianca() {
  const { criancaId } = useParams()
  const navigate = useNavigate()
  const { crianca, carregando: carregandoCrianca, erro: erroCrianca } = useCrianca(criancaId)
  const { saldo, carregando: carregandoSaldo, erro: erroSaldo } = useCarteira(criancaId)
  const { transacoes, carregando: carregandoTransacoes, erro: erroTransacoes } = useTransacoes(criancaId, 50)

  const carregando = carregandoCrianca || carregandoSaldo || carregandoTransacoes
  const erro = erroCrianca || erroSaldo || erroTransacoes

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
        <span className="text-2xl" aria-hidden="true">
          {crianca?.avatar}
        </span>
        <h1 className="text-lg font-bold text-gray-900">{crianca?.apelido || crianca?.nome}</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Aviso tipo="erro">{erro}</Aviso>

        <div className="mb-6 rounded-2xl bg-purple-600 p-6 text-center text-white shadow-sm">
          <p className="text-sm font-medium opacity-90">Saldo atual</p>
          <p className="text-4xl font-extrabold">{saldo ?? 0} Cruzeiros</p>
        </div>

        <h2 className="mb-3 text-base font-semibold text-gray-800">Extrato</h2>

        {transacoes.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
            Nenhuma transação ainda. Assim que uma tarefa for aprovada, ela aparece aqui.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {transacoes.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t.descricao || ORIGEM_ROTULO[t.origem] || 'Movimentação'}
                  </p>
                  <p className="text-xs text-gray-400">{formatarDataHora(t.criado_em)}</p>
                </div>
                <p className={`text-sm font-semibold ${t.tipo === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.tipo === 'credito' ? '+' : '-'}
                  {t.valor} Cruzeiros
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
