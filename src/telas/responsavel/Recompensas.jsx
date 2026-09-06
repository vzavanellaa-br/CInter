import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFamilia } from '../../hooks/useFamilia'
import { TIPO_ROTULO, useRecompensas } from '../../hooks/useRecompensas'
import Botao from '../../componentes/ui/Botao'
import Aviso from '../../componentes/ui/Aviso'
import FormularioRecompensa from './FormularioRecompensa'
import { NOME_MOEDA } from '../../lib/moeda'

function resumoEstoque(recompensa) {
  if (recompensa.estoque === null || recompensa.estoque === undefined) return 'Sem limite'
  if (recompensa.estoque === 0) return 'Esgotada'
  return `Restam ${recompensa.estoque}`
}

function CartaoRecompensa({ recompensa, onEditar, onAlternarAtiva }) {
  return (
    <li className={`rounded-xl bg-white p-4 shadow-sm ${!recompensa.ativa ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {recompensa.icone || '🎁'}
        </span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{recompensa.titulo}</p>
          <p className="text-sm text-gray-500">
            {recompensa.custo} {NOME_MOEDA}
          </p>
          <p className="text-xs text-gray-400">
            {TIPO_ROTULO[recompensa.tipo]} · {resumoEstoque(recompensa)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Botao variante="secundario" className="!w-auto px-3 text-sm" onClick={() => onEditar(recompensa)}>
          Editar
        </Botao>
        <Botao variante="secundario" className="!w-auto px-3 text-sm" onClick={() => onAlternarAtiva(recompensa)}>
          {recompensa.ativa ? 'Desativar' : 'Reativar'}
        </Botao>
      </div>
    </li>
  )
}

export default function Recompensas() {
  const { sessao } = useAuth()
  const { familia, criancas, carregando: carregandoFamilia } = useFamilia(sessao)
  const { recompensas, ganhoSemanal, carregando, erro, criar, atualizar } = useRecompensas()
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)
  const [recompensaEditando, setRecompensaEditando] = useState(null)
  const [erroAcao, setErroAcao] = useState('')

  const ativas = recompensas.filter((r) => r.ativa)
  const desativadas = recompensas.filter((r) => !r.ativa)

  function abrirNova() {
    setRecompensaEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(recompensa) {
    setRecompensaEditando(recompensa)
    setModalAberto(true)
  }

  async function aoSalvar(payload) {
    if (recompensaEditando) {
      return atualizar(recompensaEditando.id, payload)
    }
    return criar({ ...payload, familia_id: familia.id })
  }

  // Desativar usa ativa=false — nunca apagamos uma recompensa, ela pode já
  // ter resgates, e o histórico da criança depende dela continuar existindo.
  async function aoAlternarAtiva(recompensa) {
    setErroAcao('')
    const { error } = await atualizar(recompensa.id, { ativa: !recompensa.ativa })
    if (error) {
      setErroAcao('Não foi possível atualizar a recompensa. Tente novamente.')
    }
  }

  if (carregandoFamilia || carregando) {
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
        <h1 className="text-lg font-bold text-gray-900">Recompensas</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <Aviso tipo="erro">{erro || erroAcao}</Aviso>

        <Botao onClick={abrirNova} className="mb-4">
          + Nova recompensa
        </Botao>

        {recompensas.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
            Nenhuma recompensa ainda. Crie a primeira para a criança ter onde gastar o que ganhou.
          </p>
        ) : (
          <>
            <h2 className="mb-2 text-base font-semibold text-gray-800">Ativas</h2>
            {ativas.length === 0 ? (
              <p className="mb-6 text-sm text-gray-500">Nenhuma recompensa ativa.</p>
            ) : (
              <ul className="mb-6 flex flex-col gap-3">
                {ativas.map((r) => (
                  <CartaoRecompensa
                    key={r.id}
                    recompensa={r}
                    onEditar={abrirEdicao}
                    onAlternarAtiva={aoAlternarAtiva}
                  />
                ))}
              </ul>
            )}

            {desativadas.length > 0 && (
              <>
                <h2 className="mb-2 text-base font-semibold text-gray-800">Desativadas</h2>
                <ul className="flex flex-col gap-3">
                  {desativadas.map((r) => (
                    <CartaoRecompensa
                      key={r.id}
                      recompensa={r}
                      onEditar={abrirEdicao}
                      onAlternarAtiva={aoAlternarAtiva}
                    />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>

      {modalAberto && (
        <FormularioRecompensa
          criancas={criancas}
          ganhoSemanal={ganhoSemanal}
          recompensaExistente={recompensaEditando}
          onFechar={() => setModalAberto(false)}
          onSalvar={aoSalvar}
        />
      )}
    </div>
  )
}
