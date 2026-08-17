import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFamilia } from '../../hooks/useFamilia'
import { supabase } from '../../lib/supabase'
import Botao from '../../componentes/ui/Botao'
import CampoTexto from '../../componentes/ui/CampoTexto'
import Aviso from '../../componentes/ui/Aviso'

// Só faz sentido ver esta tela quem ainda não tem família. Quem já tem é
// mandado direto para /inicio.
export default function PrimeiroAcesso() {
  const { sessao } = useAuth()
  const { familia, carregando: carregandoFamilia } = useFamilia(sessao)
  const navigate = useNavigate()

  const [nomeFamilia, setNomeFamilia] = useState('')
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!carregandoFamilia && familia) {
      navigate('/inicio', { replace: true })
    }
  }, [carregandoFamilia, familia, navigate])

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    if (!nomeFamilia.trim() || !nomeResponsavel.trim()) {
      setErro('Preencha os dois campos.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.rpc('criar_familia', {
      nome_familia: nomeFamilia.trim(),
      nome_responsavel: nomeResponsavel.trim(),
    })
    setEnviando(false)

    if (error) {
      setErro('Não foi possível criar sua família. Tente novamente.')
      return
    }

    navigate('/inicio', { replace: true })
  }

  if (carregandoFamilia) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Carregando…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Bem-vindo ao CInter</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Vamos criar a sua família antes de continuar.
        </p>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
          <Aviso tipo="erro">{erro}</Aviso>

          <CampoTexto
            id="nome-familia"
            rotulo="Nome da família"
            placeholder="Ex.: Família Silva"
            value={nomeFamilia}
            onChange={(evento) => setNomeFamilia(evento.target.value)}
            required
          />

          <CampoTexto
            id="nome-responsavel"
            rotulo="Seu nome"
            value={nomeResponsavel}
            onChange={(evento) => setNomeResponsavel(evento.target.value)}
            required
          />

          <Botao type="submit" disabled={enviando}>
            {enviando ? 'Criando…' : 'Criar família'}
          </Botao>
        </form>
      </div>
    </div>
  )
}
