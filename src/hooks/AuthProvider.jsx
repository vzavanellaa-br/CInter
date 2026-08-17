import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContext'

// Único lugar que de fato escuta a sessão do Supabase. Fica no topo do app
// (ver App.jsx) para que RotaProtegida e as telas leiam sempre o mesmo
// estado, em vez de cada uma abrir sua própria escuta.
export default function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function entrar(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    return { data, error }
  }

  async function criarConta(email, senha) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    })
    return { data, error }
  }

  async function sair() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ sessao, carregando, entrar, criarConta, sair }}>
      {children}
    </AuthContext.Provider>
  )
}
