import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Saldo de uma criança. Só leitura — carteiras não aceita INSERT/UPDATE/DELETE
// do cliente, o crédito e o débito acontecem sempre dentro das funções do banco.
export function useCarteira(criancaId) {
  const [saldo, setSaldo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    if (!criancaId) {
      setSaldo(null)
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('carteiras')
      .select('saldo')
      .eq('crianca_id', criancaId)
      .maybeSingle()

    if (error) {
      setErro('Não foi possível carregar o saldo.')
      setCarregando(false)
      return
    }

    setSaldo(data?.saldo ?? 0)
    setCarregando(false)
  }, [criancaId])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { saldo, carregando, erro, recarregar }
}
