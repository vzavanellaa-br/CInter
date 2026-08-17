// Campo de texto padrão do CInter: rótulo, input e mensagem de erro opcional.
export default function CampoTexto({ rotulo, id, erro, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {rotulo && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {rotulo}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`min-h-11 w-full rounded-lg border px-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          erro ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {erro && <span className="text-sm text-red-600">{erro}</span>}
    </div>
  )
}
