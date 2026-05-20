-- Grant table permissions to authenticated and anon roles
-- Required because CLI migrations do not automatically apply default Supabase grants

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on exercises to authenticated;
grant select, insert, update, delete on workouts to authenticated;
grant select, insert, update, delete on workout_steps to authenticated;
grant select, insert, update, delete on workout_sessions to authenticated;
