-- Add the initial_bird_count column to the farm_config table
ALTER TABLE public.farm_config
ADD COLUMN IF NOT EXISTS initial_bird_count INTEGER;

-- We can also set a default value for existing rows if needed
-- For example, setting it to 0 for the existing config row.
UPDATE public.farm_config
SET initial_bird_count = 0
WHERE id = 1 AND initial_bird_count IS NULL;
