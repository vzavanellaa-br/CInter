import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Busca a família do responsável logado e as crianças cadastradas nela.
// A RLS já garante que só vem a família do próprio usuário — não filtramos
// por família_id aqui, o banco decide isso sozinho a partir de auth.uid().
export function useFamilia(sessao) {
  const [familia, setFamilia] = useState(null)
  const [criancas, setCriancas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const recarregar = useCallback(async () => {
    if (!sessao) {
      setFamilia(null)
      setCriancas([])
      setCarregando(false)
      return
    }

    setCarregando(true)
    setErro('')

    const { data: familiaData, error: erroFamilia } = await supabase
      .from('familias')
      .select('id, nome')
      .maybeSingle()

    if (erroFamilia) {
      setErro('Não foi possível carregar os dados da família.')
      setCarregando(false)
      return
    }

    setFamilia(familiaData)

    if (!familiaData) {
      setCriancas([])
      setCarregando(false)
      return
    }

    const { data: criancasData, error: erroCriancas } = await supabase
      .from('criancas')
      .select('id, nome, apelido, ano_nascimento, avatar')
      .order('criado_em', { ascending: true })

    if (erroCriancas) {
      setErro('Não foi possível carregar as crianças cadastradas.')
    } else {
      setCriancas(criancasData ?? [])
    }

    setCarregando(false)
  }, [sessao])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { familia, criancas, carregando, erro, recarregar }
}
