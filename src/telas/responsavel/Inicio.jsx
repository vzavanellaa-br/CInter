import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFamilia } from '../../hooks/useFamilia'
import { useAprovacoes } from '../../hooks/useAprovacoes'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import CadastrarCrianca from './CadastrarCrianca'
import CriancaItem from './CriancaItem'

export default function Inicio() {
  const { sessao, sair } = useAuth()
  const { familia, criancas, carregando, erro, recarregar } = useFamilia(sessao)
  const { execucoes: pendencias, carregando: carregandoPendencias } = useAprovacoes()
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

        <div className="mb-6 grid grid-cols-2 gap-3">
          <Botao variante="secundario" onClick={() => navigate('/inicio/tarefas')}>
            Tarefas
          </Botao>
          <Botao variante="secundario" onClick={() => navigate('/inicio/aprovacoes')}>
            Aprovações
            {!carregandoPendencias && pendencias.length > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {pendencias.length}
              </span>
            )}
          </Botao>
        </div>

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
              <CriancaItem key={crianca.id} crianca={crianca} />
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
