import { createContext } from 'react'

// Contexto puro — o estado de verdade vive em AuthProvider.jsx, e o hook
// useAuth.js só lê daqui. Assim toda a árvore compartilha a MESMA sessão em
// vez de cada componente buscar a sua própria (o que causava tela presa em
// "Carregando" e vaivém entre /inicio e /primeiro-acesso).
export const AuthContext = createContext(null)
