-- FitTrack initial schema

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  youtube_url text,
  image_url text,
  created_at timestamptz default now()
);

alter table exercises enable row level security;
create policy "Users manage own exercises" on exercises
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

alter table workouts enable row level security;
create policy "Users manage own workouts" on workouts
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table workout_steps (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts on delete cascade not null,
  exercise_id uuid references exercises on delete set null,
  step_type text check (step_type in ('exercise','rest')) not null,
  order_index integer not null,
  duration_seconds integer,
  reps integer,
  tracking_type text check (tracking_type in ('duration','reps')) not null default 'duration'
);

alter table workout_steps enable row level security;
create policy "Users manage own workout_steps" on workout_steps
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_steps.workout_id
        and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workouts w
      where w.id = workout_steps.workout_id
        and w.user_id = auth.uid()
    )
  );

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  workout_id uuid references workouts on delete set null,
  completed_at timestamptz default now(),
  duration_seconds integer not null
);

alter table workout_sessions enable row level security;
create policy "Users manage own workout_sessions" on workout_sessions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
