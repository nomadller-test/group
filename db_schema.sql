-- Run this in the Supabase SQL Editor

-- 1. Create the table
create table trip_events (
  id text primary key,
  title text not null,
  description text,
  time text,
  icon text,
  status text default 'pending', -- pending, active, completed
  count_check boolean default false,
  head_count_verified boolean default false,
  warning boolean default false,
  sort_order serial
);

-- 2. Insert Default Data (Feb 7 Trip)
insert into trip_events (id, title, description, time, icon, status, count_check, head_count_verified, warning, sort_order) values
('start', 'Trip Begins: Assembly', 'Assembly at Thrissur Railway Station. Head Count Check.', 'Feb 7', '🚩', 'pending', true, false, false, 1),
('train_board', 'Boarding Train', 'Train Departs towards Delhi', 'Feb 7', '🚆', 'pending', false, false, false, 2),
('delhi_reach', 'Reached Delhi', 'Arrival at Hazrat Nizamuddin Station. Head Count Check.', 'Feb 8', '📍', 'pending', true, false, false, 3),
('bus_board', 'Boarding Volvo', 'Transfer to Volvo Bus for Manali', 'Feb 8', '🚌', 'pending', false, false, false, 4),
('manali_reach', 'Reached Manali', 'Arrival in Manali. Hotel Check-in. Head Count Check.', 'Feb 9', '🏔️', 'pending', true, false, false, 5),
('sightseeing_manali', 'Local Sightseeing', 'Hadimba Temple, Van Vihar, Mall Road', 'Feb 9', '📷', 'pending', false, false, false, 6),
('snow_point_start', 'Depart for Snow Point', 'Early morning departure for Snow Point.', 'Feb 10', '❄️', 'pending', false, false, false, 7),
('snow_point_check', 'Snow Point Check', 'Post-excursion Head Count. ⚠️ ALERT: Not all students reported.', 'Feb 10', '📋', 'pending', true, false, true, 8),
('kullu_visit', 'Kullu Visit', 'River Rafting. Head Count Check.', 'Feb 11', '🌊', 'pending', true, false, false, 9),
('return_journey', 'Return Journey', 'Volvo Bus to Delhi boarded', 'Feb 11', '🚌', 'pending', false, false, false, 10),
('delhi_sight', 'Delhi Sightseeing', 'Sightseeing. Head Count Check.', 'Feb 12', '🕌', 'pending', true, false, false, 11),
('train_return', 'Train to Mumbai', 'Boarding train to Mumbai', 'Feb 12', '🚆', 'pending', false, false, false, 12),
('mumbai_transfer', 'Mumbai Transfer', 'Transfer to LTT. Head Count Check.', 'Feb 13', '⇄', 'pending', true, false, false, 13),
('home_arrival', 'Homecoming', 'Reached Kerala safely', 'Feb 14', '🏡', 'pending', false, false, false, 14);

-- 3. Enable Public Access (Simplest for this demo)
alter table trip_events enable row level security;

-- Policy to allow anyone to read
create policy "Public Read" on trip_events for select using (true);

-- Policy to allow anonymous updates (For demo Admin panel without login)
-- IMPORTANT: In a real app, you would require auth for this!
create policy "Public Update" on trip_events for update using (true);

-- 4. Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table trip_events;
commit;