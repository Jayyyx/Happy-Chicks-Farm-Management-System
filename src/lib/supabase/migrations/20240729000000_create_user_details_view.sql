-- src/lib/supabase/migrations/20240729000000_create_user_details_view.sql
create or replace view public.user_details as
select
  u.id,
  u.email,
  u.last_sign_in_at,
  p.full_name,
  p.role,
  p.status
from
  auth.users u
  left join public.profiles p on u.id = p.id;
