const ESTILOS_POR_TIPO = {
  erro: 'bg-red-50 text-red-700 border-red-200',
  sucesso: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
}

// Caixa de aviso para mensagens de erro/sucesso/info. Não renderiza nada se
// não houver texto — assim dá para usar sempre <Aviso>{erro}</Aviso> sem
// checar antes se erro está vazio.
export default function Aviso({ tipo = 'erro', children }) {
  if (!children) return null

  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${ESTILOS_POR_TIPO[tipo]}`}>
      {children}
    </div>
  )
}
