import { useState } from 'react'
import Botao from '../../componentes/ui/Botao'
import CampoTexto from '../../componentes/ui/CampoTexto'
import Aviso from '../../componentes/ui/Aviso'
import { NOME_MOEDA } from '../../lib/moeda'
import { TIPO_ROTULO } from '../../hooks/useRecompensas'

const ICONES = ['🎮', '🍦', '🎬', '🧸', '🎡', '📱', '🍕', '🎨', '⚽', '🛌', '🎁', '⭐']

const OPCOES_TIPO = [
  { valor: 'objeto', rotulo: TIPO_ROTULO.objeto },
  { valor: 'experiencia', rotulo: TIPO_ROTULO.experiencia },
  { valor: 'privilegio', rotulo: TIPO_ROTULO.privilegio },
]

// Faixa sugerida de custo a partir do ganho semanal: piso é meia semana,
// teto é quatro semanas. A regra de produto é "uma recompensa pequena por
// semana e uma grande por mês". É texto de ajuda — não trava o campo.
function faixaSugerida(ganhoSemanal) {
  return { piso: Math.max(1, Math.round(ganhoSemanal / 2)), teto: ganhoSemanal * 4 }
}

// Formulário de criar/editar recompensa, em modal. onSalvar recebe o payload
// já no formato da tabela (estoque null = ilimitado) e devolve { error } —
// quem decide entre INSERT e UPDATE é a tela que chama este componente.
export default function FormularioRecompensa({ criancas, ganhoSemanal, recompensaExistente, onFechar, onSalvar }) {
  const editando = Boolean(recompensaExistente)

  const [titulo, setTitulo] = useState(recompensaExistente?.titulo ?? '')
  const [icone, setIcone] = useState(recompensaExistente?.icone ?? ICONES[0])
  const [custo, setCusto] = useState(recompensaExistente?.custo ?? '')
  const [tipo, setTipo] = useState(recompensaExistente?.tipo ?? 'objeto')
  const [estoque, setEstoque] = useState(recompensaExistente?.estoque ?? '')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Só crianças com pelo menos uma tarefa ativa têm ganho para mostrar.
  const ganhosPorCrianca = criancas
    .map((c) => ({ nome: c.apelido || c.nome, ganho: ganhoSemanal.porCrianca[c.id] }))
    .filter((c) => c.ganho > 0)
  const ganhos = ganhosPorCrianca.map((c) => c.ganho)
  const faixa =
    ganhos.length > 0
      ? { piso: faixaSugerida(Math.min(...ganhos)).piso, teto: faixaSugerida(Math.max(...ganhos)).teto }
      : null

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    if (!titulo.trim()) {
      setErro('Digite o nome da recompensa.')
      return
    }

    const custoNumero = Number(custo)
    if (!Number.isInteger(custoNumero) || custoNumero <= 0) {
      setErro(`Digite um custo em ${NOME_MOEDA} inteiro e maior que zero.`)
      return
    }

    let estoqueNumero = null
    if (String(estoque).trim() !== '') {
      estoqueNumero = Number(estoque)
      if (!Number.isInteger(estoqueNumero) || estoqueNumero < 0) {
        setErro('O estoque precisa ser um número inteiro, zero ou maior. Deixe vazio para ilimitado.')
        return
      }
    }

    const payload = {
      titulo: titulo.trim(),
      icone,
      custo: custoNumero,
      tipo,
      estoque: estoqueNumero,
    }

    setEnviando(true)
    const { error } = await onSalvar(payload)
    setEnviando(false)

    if (error) {
      setErro('Não foi possível salvar a recompensa. Tente novamente.')
      return
    }

    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {editando ? 'Editar recompensa' : 'Nova recompensa'}
        </h2>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <Aviso tipo="erro">{erro}</Aviso>

          <CampoTexto
            id="titulo-recompensa"
            rotulo="Nome"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            required
          />

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Ícone</span>
            <div className="flex flex-wrap gap-2">
              {ICONES.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcone(emoji)}
                  aria-pressed={icone === emoji}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border text-2xl ${
                    icone === emoji ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Tipo</span>
            <div className="flex gap-2">
              {OPCOES_TIPO.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setTipo(opcao.valor)}
                  aria-pressed={tipo === opcao.valor}
                  className={`min-h-11 flex-1 rounded-lg border px-1 text-sm font-medium ${
                    tipo === opcao.valor
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <CampoTexto
              id="custo-recompensa"
              rotulo={`Custo em ${NOME_MOEDA}`}
              type="number"
              min="1"
              step="1"
              value={custo}
              onChange={(evento) => setCusto(evento.target.value)}
              required
            />
            <div className="mt-1 flex flex-col gap-0.5 text-xs text-gray-500">
              {ganhoSemanal.erro && <p>Não foi possível calcular o ganho semanal para sugerir um custo.</p>}
              {!ganhoSemanal.erro && ganhosPorCrianca.length === 0 && (
                <p>Cadastre tarefas para ver uma sugestão de custo com base no que a criança pode ganhar.</p>
              )}
              {ganhosPorCrianca.map((c) => (
                <p key={c.nome}>
                  Na semana, {c.nome} pode ganhar até {c.ganho} {NOME_MOEDA}
                  {ganhoSemanal.bonus > 0 && ` (já contando o bônus de ${ganhoSemanal.bonus})`}.
                </p>
              ))}
              {faixa && (
                <p className="font-medium text-gray-600">
                  Sugestão: pequena, para toda semana: {faixa.piso} · grande, para uma vez por mês: {faixa.teto}
                </p>
              )}
            </div>
          </div>

          <div>
            <CampoTexto
              id="estoque-recompensa"
              rotulo="Estoque (opcional)"
              type="number"
              min="0"
              step="1"
              value={estoque}
              onChange={(evento) => setEstoque(evento.target.value)}
              placeholder="Ilimitado"
            />
            <p className="mt-1 text-xs text-gray-500">
              Quantas vezes pode ser resgatada. Deixe vazio para não limitar.
            </p>
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
