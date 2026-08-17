import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Envolve uma tela que só pode ser vista por quem está logado.
// Sem sessão, manda direto para /entrar.
export default function RotaProtegida({ children }) {
  const { sessao, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Carregando…
      </div>
    )
  }

  if (!sessao) {
    return <Navigate to="/entrar" replace />
  }

  return children
}
