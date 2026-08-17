import { useContext } from 'react'
import { AuthContext } from './AuthContext'

// Sessão atual, carregando, entrar, criarConta, sair — tudo lido do
// AuthProvider que envolve o app inteiro (ver src/App.jsx). Não abre escuta
// própria: usa a única escuta central, então todo componente enxerga a
// mesma sessão ao mesmo tempo.
export function useAuth() {
  return useContext(AuthContext)
}
