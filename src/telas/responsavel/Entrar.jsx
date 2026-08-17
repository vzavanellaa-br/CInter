import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Botao from '../../componentes/ui/Botao'
import CampoTexto from '../../componentes/ui/CampoTexto'
import Aviso from '../../componentes/ui/Aviso'
import { traduzirErroAuth } from '../../lib/erros'

export default function Entrar() {
  const { sessao, entrar } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Já está logado? Não precisa ver a tela de entrar de novo.
  useEffect(() => {
    if (sessao) {
      navigate('/inicio', { replace: true })
    }
  }, [sessao, navigate])

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)

    const { error } = await entrar(email, senha)

    setEnviando(false)

    if (error) {
      setErro(traduzirErroAuth(error))
      return
    }

    navigate('/inicio', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">CInter</h1>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Entrar</h2>

          <Aviso tipo="erro">{erro}</Aviso>

          <CampoTexto
            id="email"
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />

          <CampoTexto
            id="senha"
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />

          <Botao type="submit" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Botao>

          <p className="text-center text-sm text-gray-600">
            Não tem conta?{' '}
            <Link to="/criar-conta" className="font-medium text-purple-600 hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
