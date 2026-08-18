import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Dados de uma única criança, buscados pelo id (a RLS só deixa passar se
// ela for da família de quem está logado).
export function useCrianca(criancaId) {
  const [crianca, setCrianca] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    if (!criancaId) {
      setCrianca(null)
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('criancas')
      .select('id, nome, apelido, avatar, ano_nascimento, familia_id')
      .eq('id', criancaId)
      .maybeSingle()

    if (error) {
      setErro('Não foi possível carregar os dados da criança.')
      setCarregando(false)
      return
    }

    setCrianca(data)
    setCarregando(false)
  }, [criancaId])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { crianca, carregando, erro, recarregar }
}
