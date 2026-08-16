-- O Supabase concede EXECUTE a `anon` por privilégio padrão do schema public,
-- não via PUBLIC — por isso o revoke anterior não bastou. Revoga direto do
-- papel anon: quem não está logado não pode chamar nenhuma das duas funções.
revoke execute on function public.familia_do_usuario() from anon;
revoke execute on function public.criar_familia(text, text) from anon;
