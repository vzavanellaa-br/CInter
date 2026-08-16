-- O Postgres concede EXECUTE a PUBLIC por padrão ao criar uma função. Isso
-- deixava familia_do_usuario() e criar_familia() chamáveis também por quem
-- não está logado (papel anon). Revoga de PUBLIC e mantém só authenticated.
revoke execute on function public.familia_do_usuario() from public;
revoke execute on function public.criar_familia(text, text) from public;

grant execute on function public.familia_do_usuario() to authenticated;
grant execute on function public.criar_familia(text, text) to authenticated;
