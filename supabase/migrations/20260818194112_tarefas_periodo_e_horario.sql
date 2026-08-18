-- Noção de tempo nas tarefas: período (manhã/tarde/noite) e horário opcional.
-- Período vazio = "a qualquer hora". Horário é ORIENTAÇÃO, não regra — não há
-- nenhuma trava impedindo marcar_tarefa fora do horário, de propósito (não
-- existe multa neste produto). Não mexe em nenhuma função de moeda.

alter table public.tarefas
  add column periodo text check (periodo in ('manha', 'tarde', 'noite')), -- null = a qualquer hora
  add column horario time; -- null = sem hora definida

-- Tarefas existentes ficam com os dois nulos automaticamente (ALTER TABLE
-- ADD COLUMN sem DEFAULT) — nada quebra.

-- Duas regras numa constraint só: horário exige período, e quando os dois
-- estão preenchidos o horário precisa cair dentro da faixa do período
-- (impede cadastrar "noite às 07:00").
alter table public.tarefas
  add constraint periodo_horario_coerente check (
    horario is null
    or (
      periodo is not null
      and case periodo
        when 'manha' then horario >= time '00:00' and horario < time '12:00'
        when 'tarde' then horario >= time '12:00' and horario < time '18:00'
        when 'noite' then horario >= time '18:00'
        else false
      end
    )
  );
