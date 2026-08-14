-- dev-B5 V4: Supplier cleanup / merge
-- Purpose:
--   Boss variants    -> Boss
--   Jonny/Johnny     -> Jonny
--   Mekano/Mikano    -> Mekano
--   Halal variants   -> Halal
--
-- This migration preserves vehicle records by first moving every vehicle
-- reference to one canonical supplier row, then deleting only duplicate
-- supplier rows. Unrelated supplier names are not changed.
--
-- Run this once in the Supabase SQL Editor.

begin;

do $$
declare
  canonical_id uuid;
begin
  -- BOSS -> Boss
  select id into canonical_id
  from suppliers
  where lower(trim(name)) = 'boss'
  order by case when name = 'Boss' then 0 else 1 end, id::text
  limit 1;

  if canonical_id is not null then
    update suppliers set name = 'Boss' where id = canonical_id;

    update vehicles
    set supplier_id = canonical_id
    where supplier_id in (
      select id from suppliers
      where lower(trim(name)) = 'boss'
        and id <> canonical_id
    );

    delete from suppliers
    where lower(trim(name)) = 'boss'
      and id <> canonical_id;
  end if;

  -- JONNY / JOHNNY -> Jonny
  canonical_id := null;
  select id into canonical_id
  from suppliers
  where lower(trim(name)) in ('jonny','johnny')
  order by case when name = 'Jonny' then 0 else 1 end, id::text
  limit 1;

  if canonical_id is not null then
    update suppliers set name = 'Jonny' where id = canonical_id;

    update vehicles
    set supplier_id = canonical_id
    where supplier_id in (
      select id from suppliers
      where lower(trim(name)) in ('jonny','johnny')
        and id <> canonical_id
    );

    delete from suppliers
    where lower(trim(name)) in ('jonny','johnny')
      and id <> canonical_id;
  end if;

  -- MEKANO / MIKANO -> Mekano
  canonical_id := null;
  select id into canonical_id
  from suppliers
  where lower(trim(name)) in ('mekano','mikano')
  order by case when name = 'Mekano' then 0 else 1 end, id::text
  limit 1;

  if canonical_id is not null then
    update suppliers set name = 'Mekano' where id = canonical_id;

    update vehicles
    set supplier_id = canonical_id
    where supplier_id in (
      select id from suppliers
      where lower(trim(name)) in ('mekano','mikano')
        and id <> canonical_id
    );

    delete from suppliers
    where lower(trim(name)) in ('mekano','mikano')
      and id <> canonical_id;
  end if;

  -- HALAL case variants -> Halal
  canonical_id := null;
  select id into canonical_id
  from suppliers
  where lower(trim(name)) = 'halal'
  order by case when name = 'Halal' then 0 else 1 end, id::text
  limit 1;

  if canonical_id is not null then
    update suppliers set name = 'Halal' where id = canonical_id;

    update vehicles
    set supplier_id = canonical_id
    where supplier_id in (
      select id from suppliers
      where lower(trim(name)) = 'halal'
        and id <> canonical_id
    );

    delete from suppliers
    where lower(trim(name)) = 'halal'
      and id <> canonical_id;
  end if;
end $$;

commit;

-- Verification query:
select
  s.name,
  count(v.id) as vehicle_count
from suppliers s
left join vehicles v on v.supplier_id = s.id
group by s.id, s.name
order by lower(s.name), s.name;
