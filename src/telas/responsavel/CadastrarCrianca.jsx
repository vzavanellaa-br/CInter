import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Botao from '../../componentes/ui/Botao'
import CampoTexto from '../../componentes/ui/CampoTexto'
import Aviso from '../../componentes/ui/Aviso'

// 6 avatares fixos — nada de foto real da criança.
const AVATARES = ['🦁', '🐼', '🦊', '🐸', '🦄', '🐳']

// Mesma faixa do check da tabela criancas (ano_nascimento between 2010 and
// 2025). Se o banco mudar esse intervalo, mude aqui também.
const ANO_MIN = 2010
const ANO_MAX = 2025
const ANOS = Array.from({ length: ANO_MAX - ANO_MIN + 1 }, (_, i) => ANO_MAX - i)

// Modal simples para cadastrar uma criança na família do responsável logado.
// A política de INSERT da tabela já garante que só entra criança na família
// de quem está logado — aqui só mandamos familiaId, que veio do próprio banco.
export default function CadastrarCrianca({ familiaId, onFechar, onCriada }) {
  const [nome, setNome] = useState('')
  const [apelido, setApelido] = useState('')
  const [anoNascimento, setAnoNascimento] = useState('')
  const [avatar, setAvatar] = useState(AVATARES[0])
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Digite o nome da criança.')
      return
    }
    if (!anoNascimento) {
      setErro('Escolha o ano de nascimento.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('criancas').insert({
      familia_id: familiaId,
      nome: nome.trim(),
      apelido: apelido.trim() || null,
      ano_nascimento: Number(anoNascimento),
      avatar,
    })
    setEnviando(false)

    if (error) {
      setErro('Não foi possível cadastrar a criança. Tente novamente.')
      return
    }

    onCriada()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Cadastrar criança</h2>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <Aviso tipo="erro">{erro}</Aviso>

          <CampoTexto
            id="nome-crianca"
            rotulo="Nome"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            required
          />

          <CampoTexto
            id="apelido-crianca"
            rotulo="Apelido (opcional)"
            value={apelido}
            onChange={(evento) => setApelido(evento.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="ano-nascimento" className="text-sm font-medium text-gray-700">
              Ano de nascimento
            </label>
            <select
              id="ano-nascimento"
              value={anoNascimento}
              onChange={(evento) => setAnoNascimento(evento.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Selecione…</option>
              {ANOS.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Avatar</span>
            <div className="flex flex-wrap gap-2">
              {AVATARES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  aria-pressed={avatar === emoji}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border text-2xl ${
                    avatar === emoji ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Botao type="button" variante="secundario" onClick={onFechar}>
              Cancelar
            </Botao>
            <Botao type="submit" disabled={enviando}>
              {enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
