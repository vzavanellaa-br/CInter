import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Botao from '../../componentes/ui/Botao'
import CampoTexto from '../../componentes/ui/CampoTexto'
import Aviso from '../../componentes/ui/Aviso'
import { traduzirErroAuth } from '../../lib/erros'

export default function CriarConta() {
  const { sessao, criarConta } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (sessao) {
      navigate('/inicio', { replace: true })
    }
  }, [sessao, navigate])

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setMensagem('')

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.')
      return
    }

    setEnviando(true)
    const { data, error } = await criarConta(email, senha)
    setEnviando(false)

    if (error) {
      setErro(traduzirErroAuth(error))
      return
    }

    // Se o projeto exige confirmação de e-mail, o Supabase não devolve
    // sessão ainda — o usuário precisa clicar no link do e-mail primeiro.
    if (!data.session) {
      setMensagem('Conta criada! Confira seu e-mail para confirmar antes de entrar.')
      return
    }

    navigate('/primeiro-acesso', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">CInter</h1>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Criar conta</h2>

          <Aviso tipo="erro">{erro}</Aviso>
          <Aviso tipo="sucesso">{mensagem}</Aviso>

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
            autoComplete="new-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />

          <CampoTexto
            id="confirmar-senha"
            rotulo="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirmarSenha}
            onChange={(evento) => setConfirmarSenha(evento.target.value)}
            required
          />

          <Botao type="submit" disabled={enviando}>
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </Botao>

          <p className="text-center text-sm text-gray-600">
            Já tem conta?{' '}
            <Link to="/entrar" className="font-medium text-purple-600 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
