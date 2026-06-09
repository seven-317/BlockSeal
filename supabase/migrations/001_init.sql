-- BlockSeal schema
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists seals (
  id           text primary key,               -- UUID (also used as Storage filename)
  tx_hash      text not null,                  -- Sepolia txHash
  cipher_hash  text not null,                  -- hex SHA-256 of ciphertext, for integrity check
  read_once    boolean not null default true,
  expires_at   timestamptz,                    -- null = never expires
  opened_at    timestamptz,                    -- null = not yet opened
  created_at   timestamptz not null default now()
);

-- No public access: all reads/writes go through service-role API routes
alter table seals enable row level security;
