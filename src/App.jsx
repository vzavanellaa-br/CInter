import AppRotas from './rotas/AppRotas'
import AuthProvider from './hooks/AuthProvider'

function App() {
  return (
    <AuthProvider>
      <AppRotas />
    </AuthProvider>
  )
}

export default App
