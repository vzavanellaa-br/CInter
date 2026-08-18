import { useState } from 'react'
import Botao from '../../componentes/ui/Botao'
import CampoTexto from '../../componentes/ui/CampoTexto'
import Aviso from '../../componentes/ui/Aviso'

const ICONES = ['🦷', '🛏️', '📚', '🧹', '🍽️', '🐶', '👕', '🧸', '🚿', '🥗', '✏️', '⭐']

const DIAS_SEMANA = [
  { valor: 0, rotulo: 'Dom' },
  { valor: 1, rotulo: 'Seg' },
  { valor: 2, rotulo: 'Ter' },
  { valor: 3, rotulo: 'Qua' },
  { valor: 4, rotulo: 'Qui' },
  { valor: 5, rotulo: 'Sex' },
  { valor: 6, rotulo: 'Sáb' },
]

const OPCOES_RECORRENCIA = [
  { valor: 'diaria', rotulo: 'Diária' },
  { valor: 'semanal', rotulo: 'Semanal' },
  { valor: 'avulsa', rotulo: 'Avulsa' },
]

// Formulário de criar/editar tarefa, em modal. onSalvar recebe o payload já
// coerente com o CHECK da tabela (dias_semana/data_especifica certos para a
// recorrência escolhida) e devolve { error } — quem decide entre INSERT e
// UPDATE é a tela que chama este componente.
export default function FormularioTarefa({ criancas, tarefaExistente, onFechar, onSalvar }) {
  const editando = Boolean(tarefaExistente)

  const [titulo, setTitulo] = useState(tarefaExistente?.titulo ?? '')
  const [icone, setIcone] = useState(tarefaExistente?.icone ?? ICONES[0])
  const [criancaId, setCriancaId] = useState(tarefaExistente?.crianca_id ?? criancas[0]?.id ?? '')
  const [valor, setValor] = useState(tarefaExistente?.valor_cruzeiro ?? '')
  const [recorrencia, setRecorrencia] = useState(tarefaExistente?.recorrencia ?? 'diaria')
  const [diasSemana, setDiasSemana] = useState(tarefaExistente?.dias_semana ?? [])
  const [dataEspecifica, setDataEspecifica] = useState(tarefaExistente?.data_especifica ?? '')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function alternarDiaSemana(dia) {
    setDiasSemana((atual) => (atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia].sort()))
  }

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')

    if (!titulo.trim()) {
      setErro('Digite o título da tarefa.')
      return
    }
    if (!criancaId) {
      setErro('Escolha a criança.')
      return
    }

    const valorNumero = Number(valor)
    if (!Number.isInteger(valorNumero) || valorNumero <= 0) {
      setErro('Digite um valor em Cruzeiros inteiro e maior que zero.')
      return
    }
    if (recorrencia === 'semanal' && diasSemana.length === 0) {
      setErro('Escolha pelo menos um dia da semana.')
      return
    }
    if (recorrencia === 'avulsa' && !dataEspecifica) {
      setErro('Escolha a data da tarefa.')
      return
    }

    const payload = {
      titulo: titulo.trim(),
      icone,
      crianca_id: criancaId,
      valor_cruzeiro: valorNumero,
      recorrencia,
      dias_semana: recorrencia === 'semanal' ? diasSemana : null,
      data_especifica: recorrencia === 'avulsa' ? dataEspecifica : null,
    }

    setEnviando(true)
    const { error } = await onSalvar(payload)
    setEnviando(false)

    if (error) {
      setErro('Não foi possível salvar a tarefa. Tente novamente.')
      return
    }

    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {editando ? 'Editar tarefa' : 'Nova tarefa'}
        </h2>

        <form onSubmit={aoEnviar} className="flex flex-col gap-4">
          <Aviso tipo="erro">{erro}</Aviso>

          <CampoTexto
            id="titulo-tarefa"
            rotulo="Título"
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
            <label htmlFor="crianca-tarefa" className="text-sm font-medium text-gray-700">
              Criança
            </label>
            <select
              id="crianca-tarefa"
              value={criancaId}
              onChange={(evento) => setCriancaId(evento.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              {criancas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.apelido || c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <CampoTexto
              id="valor-tarefa"
              rotulo="Valor em Cruzeiros"
              type="number"
              min="1"
              step="1"
              value={valor}
              onChange={(evento) => setValor(evento.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Dica: tarefa simples: 5 a 15 · tarefa que dá trabalho: 20 a 40
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Recorrência</span>
            <div className="flex gap-2">
              {OPCOES_RECORRENCIA.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setRecorrencia(opcao.valor)}
                  className={`min-h-11 flex-1 rounded-lg border text-sm font-medium ${
                    recorrencia === opcao.valor
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          {recorrencia === 'semanal' && (
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">Dias da semana</span>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.valor}
                    type="button"
                    onClick={() => alternarDiaSemana(dia.valor)}
                    aria-pressed={diasSemana.includes(dia.valor)}
                    className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${
                      diasSemana.includes(dia.valor)
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    {dia.rotulo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recorrencia === 'avulsa' && (
            <CampoTexto
              id="data-tarefa"
              rotulo="Data"
              type="date"
              value={dataEspecifica}
              onChange={(evento) => setDataEspecifica(evento.target.value)}
              required
            />
          )}

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
