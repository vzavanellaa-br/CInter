const ESTILOS_POR_VARIANTE = {
  primario: 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300',
  secundario:
    'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50 disabled:text-purple-300 disabled:border-purple-200',
  perigo: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
}

// Botão padrão do CInter. Altura mínima de 44px (min-h-11) para ficar fácil
// de tocar em celular, como manda o CLAUDE.md.
export default function Botao({ children, variante = 'primario', className = '', ...props }) {
  return (
    <button
      {...props}
      className={`min-h-11 w-full rounded-lg px-4 font-medium transition-colors disabled:cursor-not-allowed ${ESTILOS_POR_VARIANTE[variante]} ${className}`}
    >
      {children}
    </button>
  )
}
