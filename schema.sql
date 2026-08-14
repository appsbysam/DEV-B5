
-- All Season Car Rental - Supabase schema foundation
-- Run this in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  pickup_fee numeric(12,2) not null default 0,
  dropoff_fee numeric(12,2) not null default 0,
  turnaround_minutes integer not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text,
  secondary_phone text,
  email text,
  nationality text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text unique,
  make text not null,
  model text not null,
  model_year integer,
  colour text,
  category_id uuid references vehicle_categories(id) on delete set null,
  transmission text,
  fuel_type text,
  seats integer,
  standard_daily_rate numeric(12,2) not null default 0,
  source_type text not null default 'Own Fleet' check (source_type in ('Own Fleet','External')),
  supplier_id uuid references suppliers(id) on delete set null,
  operational_status text not null default 'Available',
  long_term_contract boolean not null default false,
  odometer integer,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  requested_category_id uuid references vehicle_categories(id) on delete set null,
  requested_vehicle_id uuid references vehicles(id) on delete set null,
  pickup_at timestamptz not null,
  return_at timestamptz not null,
  pickup_location_id uuid references locations(id) on delete set null,
  dropoff_location_id uuid references locations(id) on delete set null,
  proposed_daily_rate numeric(12,2),
  estimated_rental_days numeric(10,2),
  pickup_fee numeric(12,2) not null default 0,
  dropoff_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  other_charges numeric(12,2) not null default 0,
  estimated_total numeric(12,2) not null default 0,
  notes text,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rental_agreements (
  id uuid primary key default gen_random_uuid(),
  agreement_number bigserial unique,
  customer_id uuid not null references customers(id),
  original_pickup_at timestamptz not null,
  expected_final_return_at timestamptz not null,
  actual_final_return_at timestamptz,
  pickup_location_id uuid references locations(id) on delete set null,
  expected_dropoff_location_id uuid references locations(id) on delete set null,
  actual_dropoff_location_id uuid references locations(id) on delete set null,
  guarantee_type text not null default 'Specific Vehicle',
  status text not null default 'Reserved',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rental_segments (
  id uuid primary key default gen_random_uuid(),
  rental_agreement_id uuid not null references rental_agreements(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id),
  start_at timestamptz not null,
  end_at timestamptz,
  agreed_daily_rate numeric(12,2) not null,
  standard_daily_rate_snapshot numeric(12,2),
  reason text not null default 'Original Rental',
  pricing_mode text not null default 'Use Agreed Rate',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists rental_charges (
  id uuid primary key default gen_random_uuid(),
  rental_agreement_id uuid not null references rental_agreements(id) on delete cascade,
  charge_type text not null,
  description text,
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  rental_agreement_id uuid not null references rental_agreements(id) on delete cascade,
  payment_type text not null,
  amount numeric(12,2) not null,
  payment_method text,
  reference text,
  notes text,
  paid_at timestamptz not null default now()
);

create table if not exists security_bonds (
  id uuid primary key default gen_random_uuid(),
  rental_agreement_id uuid not null references rental_agreements(id) on delete cascade,
  amount_required numeric(12,2) not null default 0,
  amount_collected numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  amount_refunded numeric(12,2) not null default 0,
  collected_at timestamptz,
  refunded_at timestamptz,
  notes text
);

create table if not exists vehicle_unavailability (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,
  reason text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_segments_vehicle_time on rental_segments(vehicle_id,start_at,end_at);
create index if not exists idx_agreements_time on rental_agreements(original_pickup_at,expected_final_return_at);
create index if not exists idx_unavailability_vehicle_time on vehicle_unavailability(vehicle_id,start_at,end_at);

-- Starter categories
insert into vehicle_categories(name) values
('Economy'),('Compact'),('Sedan'),('Hatchback'),('SUV'),('Large SUV'),('7 Seater'),('Luxury'),('Van'),('Pickup'),('Other')
on conflict (name) do nothing;

-- NOTE:
-- Row Level Security policies should be added once the authentication/user-role flow is confirmed.
