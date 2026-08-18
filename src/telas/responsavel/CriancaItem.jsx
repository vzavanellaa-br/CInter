import { useNavigate } from 'react-router-dom'
import { useCarteira } from '../../hooks/useCarteira'
import Botao from '../../componentes/ui/Botao'

// Um item da lista de crianças no Início: avatar, nome, saldo, atalho para
// o detalhe (extrato) e para entrar no modo criança.
export default function CriancaItem({ crianca }) {
  const navigate = useNavigate()
  const { saldo, carregando } = useCarteira(crianca.id)

  return (
    <li className="rounded-xl bg-white p-4 shadow-sm">
      <button
        onClick={() => navigate(`/inicio/crianca/${crianca.id}`)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="text-3xl" aria-hidden="true">
          {crianca.avatar}
        </span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{crianca.apelido || crianca.nome}</p>
          <p className="text-sm text-gray-500">{carregando ? 'Carregando saldo…' : `${saldo ?? 0} Cruzeiros`}</p>
        </div>
      </button>

      <Botao variante="secundario" className="mt-3 text-sm" onClick={() => navigate(`/crianca/${crianca.id}`)}>
        Ver como criança
      </Botao>
    </li>
  )
}
