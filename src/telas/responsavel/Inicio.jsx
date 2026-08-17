import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFamilia } from '../../hooks/useFamilia'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import CadastrarCrianca from './CadastrarCrianca'

export default function Inicio() {
  const { sessao, sair } = useAuth()
  const { familia, criancas, carregando, erro, recarregar } = useFamilia(sessao)
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)
  const [erroSair, setErroSair] = useState('')

  // Logado mas sem família ainda? Manda para criar a família primeiro.
  useEffect(() => {
    if (!carregando && !familia) {
      navigate('/primeiro-acesso', { replace: true })
    }
  }, [carregando, familia, navigate])

  async function aoSair() {
    setErroSair('')
    const { error } = await sair()

    if (error) {
      setErroSair('Não foi possível sair. Tente novamente.')
      return
    }

    navigate('/entrar', { replace: true })
  }

  if (carregando || !familia) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Família {familia.nome}</h1>
        <button
          onClick={aoSair}
          className="min-h-11 rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Aviso tipo="erro">{erro || erroSair}</Aviso>

        <div className="mb-4 mt-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Crianças</h2>
          <Botao variante="secundario" className="!w-auto px-4" onClick={() => setModalAberto(true)}>
            + Adicionar
          </Botao>
        </div>

        {criancas.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma criança cadastrada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {criancas.map((crianca) => (
              <li
                key={crianca.id}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
              >
                <span className="text-3xl" aria-hidden="true">
                  {crianca.avatar}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{crianca.apelido || crianca.nome}</p>
                  <p className="text-sm text-gray-500">Nascimento: {crianca.ano_nascimento}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {modalAberto && (
        <CadastrarCrianca
          familiaId={familia.id}
          onFechar={() => setModalAberto(false)}
          onCriada={() => {
            setModalAberto(false)
            recarregar()
          }}
        />
      )}
    </div>
  )
}
