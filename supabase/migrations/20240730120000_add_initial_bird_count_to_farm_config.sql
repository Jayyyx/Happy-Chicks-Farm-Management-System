-- Add initial_bird_count column to farm_config table
alter table public.farm_config
add column if not exists initial_bird_count integer default 0;

-- Backfill the value from an initial setup if it doesn't exist
-- For this example, we assume an initial count of 500 if it's not set.
-- You can adjust this value in the settings page later.
update public.farm_config set initial_bird_count = 500 where initial_bird_count is null;
