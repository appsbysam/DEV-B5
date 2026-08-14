-- B5 V6.1 - Demo test data + authenticated access
-- Safe to run more than once.
-- Does NOT modify vehicles or suppliers.

begin;

-- ------------------------------------------------------------
-- 1. TEST CUSTOMERS
-- ------------------------------------------------------------
insert into public.customers (full_name, mobile, email, nationality, notes)
select *
from (values
  ('Test Customer 1', '+961 70 100001', 'testcustomer1@example.com', 'Lebanese', 'Demo/test customer'),
  ('Test Customer 2', '+961 70 100002', 'testcustomer2@example.com', 'Lebanese', 'Demo/test customer'),
  ('Test Customer 3', '+961 70 100003', 'testcustomer3@example.com', 'Australian', 'Demo/test customer'),
  ('Test Customer 4', '+961 70 100004', 'testcustomer4@example.com', 'Lebanese', 'Demo/test customer'),
  ('Test Customer 5', '+961 70 100005', 'testcustomer5@example.com', 'Australian', 'Demo/test customer')
) as x(full_name,mobile,email,nationality,notes)
where not exists (
  select 1 from public.customers c where lower(c.full_name)=lower(x.full_name)
);

-- ------------------------------------------------------------
-- 2. TEST LOCATIONS
-- Same locations used by the app.
-- ------------------------------------------------------------
insert into public.locations
  (name, address, pickup_fee, dropoff_fee, turnaround_minutes, notes, active)
select *
from (values
  ('Hasbaya Office', 'Hasbaya, Lebanon', 0.00, 0.00, 30, 'Primary office / demo location', true),
  ('Beirut Airport', 'Beirut-Rafic Hariri International Airport, Lebanon', 75.00, 75.00, 180, 'Airport pickup/drop-off', true),
  ('Beirut', 'Beirut, Lebanon', 65.00, 65.00, 180, 'Beirut pickup/drop-off', true),
  ('Saida', 'Saida, Lebanon', 40.00, 40.00, 90, 'Saida pickup/drop-off', true),
  ('Nabatieh', 'Nabatieh, Lebanon', 25.00, 25.00, 60, 'Nabatieh pickup/drop-off', true)
) as x(name,address,pickup_fee,dropoff_fee,turnaround_minutes,notes,active)
where not exists (
  select 1 from public.locations l where lower(l.name)=lower(x.name)
);

-- ------------------------------------------------------------
-- 3. AUTHENTICATED DEMO ACCESS
-- These tables are used by the V6 rental workflow.
-- The user must be signed in.
-- ------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.locations enable row level security;
alter table public.rental_agreements enable row level security;
alter table public.rental_segments enable row level security;
alter table public.rental_charges enable row level security;
alter table public.payments enable row level security;
alter table public.security_bonds enable row level security;

drop policy if exists "b5_authenticated_customers" on public.customers;
create policy "b5_authenticated_customers" on public.customers
for all to authenticated using (true) with check (true);

drop policy if exists "b5_authenticated_locations" on public.locations;
create policy "b5_authenticated_locations" on public.locations
for all to authenticated using (true) with check (true);

drop policy if exists "b5_authenticated_rental_agreements" on public.rental_agreements;
create policy "b5_authenticated_rental_agreements" on public.rental_agreements
for all to authenticated using (true) with check (true);

drop policy if exists "b5_authenticated_rental_segments" on public.rental_segments;
create policy "b5_authenticated_rental_segments" on public.rental_segments
for all to authenticated using (true) with check (true);

drop policy if exists "b5_authenticated_rental_charges" on public.rental_charges;
create policy "b5_authenticated_rental_charges" on public.rental_charges
for all to authenticated using (true) with check (true);

drop policy if exists "b5_authenticated_payments" on public.payments;
create policy "b5_authenticated_payments" on public.payments
for all to authenticated using (true) with check (true);

drop policy if exists "b5_authenticated_security_bonds" on public.security_bonds;
create policy "b5_authenticated_security_bonds" on public.security_bonds
for all to authenticated using (true) with check (true);

commit;

-- Verification
select id, full_name, mobile from public.customers
where full_name ilike 'Test Customer %'
order by full_name;

select id, name, pickup_fee, dropoff_fee, turnaround_minutes
from public.locations
order by name;
