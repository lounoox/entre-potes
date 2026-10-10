-- Entre potes · migration initiale. À exécuter dans un nouveau projet Supabase.
-- Les tables de jeu sont privées : les joueurs passent par ep_action.
begin;

create table public.ep_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null,
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'results', 'finished')),
  round integer not null default 0,
  total_rounds integer not null check (total_rounds in (4, 6, 8)),
  challenge jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create table public.ep_members (
  room_id uuid not null references public.ep_rooms(id) on delete cascade,
  user_id uuid not null,
  name text not null check (char_length(name) between 2 and 16),
  avatar integer not null check (avatar between 0 and 7),
  role text not null check (role in ('player', 'spectator')),
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create table public.ep_answers (
  room_id uuid not null,
  user_id uuid not null,
  round integer not null,
  answer jsonb not null,
  points integer not null default 0,
  answered_at timestamptz not null default now(),
  primary key (room_id, user_id, round),
  foreign key (room_id, user_id) references public.ep_members(room_id, user_id) on delete cascade
);
create table public.ep_signals (
  room_id uuid primary key references public.ep_rooms(id) on delete cascade,
  revision bigint not null default 0
);

alter table public.ep_rooms enable row level security;
alter table public.ep_members enable row level security;
alter table public.ep_answers enable row level security;
alter table public.ep_signals enable row level security;
revoke all on public.ep_rooms, public.ep_members, public.ep_answers, public.ep_signals from anon, authenticated;
grant select on public.ep_signals to authenticated;

create function public.ep_is_member(p_room uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.ep_members where room_id = p_room and user_id = auth.uid());
$$;
revoke all on function public.ep_is_member(uuid) from public, anon;
grant execute on function public.ep_is_member(uuid) to authenticated;
create policy "Les membres suivent uniquement leur salon" on public.ep_signals
  for select to authenticated using (public.ep_is_member(room_id));

-- Banque de questions côté serveur. La réponse attendue est retirée des instantanés
-- tant que la manche n'est pas terminée.
create function public.ep_challenge(p_round integer) returns jsonb
language plpgsql set search_path = '' as $$
declare
  bank jsonb;
  challenge jsonb;
  sequence jsonb;
begin
  case (p_round - 1) % 4
    when 0 then
      bank := '[
        {"type":"quiz","prompt":"Quel animal a trois cœurs ?","options":["Le dauphin","La pieuvre","Le requin","Le pingouin"],"expected":1},
        {"type":"quiz","prompt":"Quelle planète est surnommée la planète rouge ?","options":["Vénus","Jupiter","Mars","Saturne"],"expected":2},
        {"type":"quiz","prompt":"Combien de côtés possède un hexagone ?","options":["Cinq","Six","Sept","Huit"],"expected":1},
        {"type":"quiz","prompt":"Quel est le plus grand océan ?","options":["Atlantique","Indien","Arctique","Pacifique"],"expected":3},
        {"type":"quiz","prompt":"Quel ingrédient est à la base du guacamole ?","options":["Le petit pois","Le concombre","L’avocat","La courgette"],"expected":2},
        {"type":"quiz","prompt":"Combien de cordes possède une guitare classique ?","options":["Quatre","Cinq","Six","Huit"],"expected":2}
      ]'::jsonb;
      challenge := bank -> (((p_round - 1) / 4 + floor(random() * 3)::integer) % 6);
    when 1 then
      bank := '[
        {"type":"estimate","prompt":"Combien de minutes y a-t-il dans une semaine ?","unit":"minutes","expected":10080},
        {"type":"estimate","prompt":"Combien de touches possède un piano standard ?","unit":"touches","expected":88},
        {"type":"estimate","prompt":"Combien d’os compte habituellement un squelette humain adulte ?","unit":"os","expected":206},
        {"type":"estimate","prompt":"Combien de cases comporte un échiquier ?","unit":"cases","expected":64},
        {"type":"estimate","prompt":"Combien de secondes y a-t-il dans une journée de 24 heures ?","unit":"secondes","expected":86400},
        {"type":"estimate","prompt":"Combien de cartes contient un jeu standard, sans jokers ?","unit":"cartes","expected":52}
      ]'::jsonb;
      challenge := bank -> (((p_round - 1) / 4 + floor(random() * 3)::integer) % 6);
    when 2 then
      select jsonb_agg(floor(random() * 6)::integer) into sequence from generate_series(1, 5);
      challenge := jsonb_build_object('type', 'memory', 'prompt', 'Retrouve les cinq fruits dans le bon ordre.', 'sequence', sequence, 'expected', sequence);
    else
      challenge := '{"type":"timing","prompt":"Arrête le chrono au plus près de 5 secondes.","expected":5000}'::jsonb;
  end case;
  return challenge;
end;
$$;
revoke all on function public.ep_challenge(integer) from public, anon, authenticated;

create function public.ep_points(p_challenge jsonb, p_answer jsonb) returns integer
language plpgsql immutable set search_path = '' as $$
declare delta numeric; matches integer;
begin
  if p_answer is null then return 0; end if;
  case p_challenge ->> 'type'
    when 'quiz' then return case when p_answer = p_challenge -> 'expected' then 3 else 0 end;
    when 'estimate' then
      delta := abs((p_answer #>> '{}')::numeric - (p_challenge ->> 'expected')::numeric) / greatest(1, (p_challenge ->> 'expected')::numeric);
      return case when delta <= 0.05 then 3 when delta <= 0.2 then 2 when delta <= 0.5 then 1 else 0 end;
    when 'memory' then
      select count(*) into matches from generate_series(0, 4) as i where p_answer -> i = p_challenge -> 'expected' -> i;
      return case when matches = 5 then 3 when matches >= 3 then 2 when matches >= 1 then 1 else 0 end;
    when 'timing' then
      delta := abs((p_answer #>> '{}')::numeric - 5000);
      return case when delta <= 250 then 3 when delta <= 750 then 2 when delta <= 1500 then 1 else 0 end;
    else return 0;
  end case;
end;
$$;
revoke all on function public.ep_points(jsonb, jsonb) from public, anon, authenticated;

create function public.ep_snapshot(p_room uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  r public.ep_rooms;
  m public.ep_members;
  challenge jsonb;
  players jsonb;
  submitted jsonb;
  results jsonb;
begin
  select * into r from public.ep_rooms where id = p_room;
  select * into m from public.ep_members where room_id = p_room and user_id = auth.uid();
  if m.user_id is null then raise exception 'Rejoins cette partie pour la consulter.'; end if;
  challenge := r.challenge;
  if r.status = 'playing' then
    challenge := challenge - 'expected';
    if challenge ->> 'type' = 'memory' and clock_timestamp() >= r.starts_at + interval '6 seconds' then
      challenge := challenge - 'sequence';
    end if;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', user_id, 'name', name, 'avatar', avatar, 'score', score) order by joined_at, user_id), '[]'::jsonb)
    into players from public.ep_members where room_id = p_room and role = 'player';
  select coalesce(jsonb_agg(user_id), '[]'::jsonb) into submitted from public.ep_answers where room_id = p_room and round = r.round;
  results := '[]'::jsonb;
  if r.status in ('results', 'finished') then
    select coalesce(jsonb_agg(jsonb_build_object('id', user_id, 'answer', answer, 'points', points)), '[]'::jsonb)
      into results from public.ep_answers where room_id = p_room and round = r.round;
  end if;
  return jsonb_build_object(
    'id', r.id, 'code', r.code, 'host_id', r.host_id, 'status', r.status,
    'round', r.round, 'total_rounds', r.total_rounds, 'challenge', challenge,
    'starts_at', r.starts_at, 'ends_at', r.ends_at, 'players', players,
    'submitted', submitted, 'results', results, 'viewer_id', auth.uid(),
    'viewer_role', m.role, 'revision', r.revision, 'server_now', clock_timestamp()
  );
end;
$$;
revoke all on function public.ep_snapshot(uuid) from public, anon, authenticated;

create function public.ep_action(p_action text, p_code text default null, p_payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  r public.ep_rooms;
  m public.ep_members;
  chosen_name text;
  chosen_avatar integer;
  chosen_rounds integer;
  is_screen boolean;
  player_count integer;
  answer_count integer;
  answer jsonb;
  answer_number numeric;
  duration integer;
begin
  if uid is null then raise exception 'Connecte-toi pour jouer.'; end if;
  if p_action in ('create', 'join') then
    chosen_name := trim(coalesce(p_payload ->> 'name', ''));
    chosen_avatar := coalesce((p_payload ->> 'avatar')::integer, 0);
    if char_length(chosen_name) not between 2 and 16 or chosen_name ~ '[[:cntrl:]]' then raise exception 'Choisis un pseudo de 2 à 16 caractères.'; end if;
    if chosen_avatar not between 0 and 7 then raise exception 'Choisis un pion valide.'; end if;
  end if;

  if p_action = 'create' then
    chosen_rounds := coalesce((p_payload ->> 'rounds')::integer, 4);
    if chosen_rounds not in (4, 6, 8) then raise exception 'Choisis 4, 6 ou 8 manches.'; end if;
    if (select count(*) from public.ep_rooms where host_id = uid and expires_at > clock_timestamp() and status <> 'finished') >= 5 then
      raise exception 'Tu as déjà cinq parties ouvertes. Termine une partie avant d’en créer une autre.';
    end if;
    loop
      insert into public.ep_rooms (code, host_id, total_rounds)
        values (upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), uid, chosen_rounds)
        on conflict (code) do nothing returning * into r;
      exit when r.id is not null;
    end loop;
    insert into public.ep_members(room_id, user_id, name, avatar, role) values (r.id, uid, chosen_name, chosen_avatar, 'player');
    insert into public.ep_signals(room_id) values (r.id);
    return public.ep_snapshot(r.id);
  end if;

  -- Le verrou sérialise les réponses et empêche de compter deux fois les points.
  select * into r from public.ep_rooms where code = upper(trim(p_code)) for update;
  if r.id is null then raise exception 'Ce code ne correspond à aucune partie.'; end if;
  if r.expires_at < clock_timestamp() then raise exception 'Cette partie a expiré. Crée une nouvelle soirée.'; end if;
  select * into m from public.ep_members where room_id = r.id and user_id = uid;

  if p_action = 'join' then
    if m.user_id is not null then return public.ep_snapshot(r.id); end if;
    is_screen := coalesce((p_payload ->> 'spectator')::boolean, false);
    if (select count(*) from public.ep_members where room_id = r.id) >= 16 then raise exception 'Ce salon a atteint sa limite de connexions.'; end if;
    if not is_screen then
      if r.status <> 'lobby' then raise exception 'La partie a déjà commencé. Tu peux encore la suivre en mode écran.'; end if;
      if (select count(*) from public.ep_members where room_id = r.id and role = 'player') >= 8 then raise exception 'La partie est complète : huit potes maximum.'; end if;
      if exists(select 1 from public.ep_members where room_id = r.id and role = 'player' and lower(name) = lower(chosen_name)) then raise exception 'Ce pseudo est déjà pris dans la partie.'; end if;
    end if;
    insert into public.ep_members(room_id, user_id, name, avatar, role)
      values (r.id, uid, chosen_name, chosen_avatar, case when is_screen then 'spectator' else 'player' end);
  else
    if m.user_id is null then raise exception 'Rejoins cette partie pour jouer.'; end if;
    if p_action = 'get' then return public.ep_snapshot(r.id); end if;
    if p_action = 'start' then
      if r.host_id <> uid or m.role <> 'player' then raise exception 'Seul l’hôte peut lancer une manche.'; end if;
      if r.status not in ('lobby', 'results') or r.round >= r.total_rounds then raise exception 'Impossible de lancer une manche maintenant.'; end if;
      if (select count(*) from public.ep_members where room_id = r.id and role = 'player') < 2 then raise exception 'Il faut au moins deux potes pour jouer.'; end if;
      r.challenge := public.ep_challenge(r.round + 1);
      duration := case when r.challenge ->> 'type' in ('estimate', 'memory') then 25 else 20 end;
      update public.ep_rooms set status = 'playing', round = round + 1, challenge = r.challenge,
        starts_at = clock_timestamp() + interval '3 seconds',
        ends_at = clock_timestamp() + make_interval(secs => duration + 3) where id = r.id;
    elsif p_action = 'answer' then
      if m.role <> 'player' then raise exception 'Un écran spectateur ne peut pas répondre.'; end if;
      if (p_payload ->> 'round')::integer is distinct from r.round then raise exception 'La manche a changé. Recharge la partie.'; end if;
      if r.status <> 'playing' or clock_timestamp() < r.starts_at or clock_timestamp() > r.ends_at then raise exception 'La manche n’accepte pas de réponse pour le moment.'; end if;
      if exists(select 1 from public.ep_answers where room_id = r.id and user_id = uid and round = r.round) then raise exception 'Ta réponse est déjà enregistrée.'; end if;
      answer := p_payload -> 'answer';
      if r.challenge ->> 'type' = 'memory' then
        if clock_timestamp() < r.starts_at + interval '6 seconds' then raise exception 'Observe encore la suite.'; end if;
        if jsonb_typeof(answer) is distinct from 'array' then raise exception 'Choisis les cinq fruits.'; end if;
        if jsonb_array_length(answer) <> 5 then raise exception 'Choisis les cinq fruits.'; end if;
        if exists(select 1 from jsonb_array_elements(answer) as v where jsonb_typeof(v) <> 'number' or v not in ('0'::jsonb, '1'::jsonb, '2'::jsonb, '3'::jsonb, '4'::jsonb, '5'::jsonb)) then raise exception 'Cette suite n’est pas valide.'; end if;
      else
        if jsonb_typeof(answer) is distinct from 'number' then raise exception 'Entre une réponse numérique valide.'; end if;
        answer_number := (answer #>> '{}')::numeric;
        if answer_number < 0 or answer_number > 1000000000 then raise exception 'Cette réponse dépasse les limites.'; end if;
        if r.challenge ->> 'type' = 'quiz' and (answer_number > 3 or answer_number <> trunc(answer_number)) then raise exception 'Choisis l’une des quatre réponses.'; end if;
        if r.challenge ->> 'type' = 'timing' and answer_number > 60000 then raise exception 'Ce temps n’est pas valide.'; end if;
      end if;
      insert into public.ep_answers(room_id, user_id, round, answer) values (r.id, uid, r.round, answer);
    elsif p_action = 'finish' then
      if m.role <> 'player' then raise exception 'Seuls les joueurs peuvent terminer une manche.'; end if;
      if r.status in ('results', 'finished') then return public.ep_snapshot(r.id); end if;
      if r.status <> 'playing' then raise exception 'Aucune manche n’est en cours.'; end if;
      select count(*) into player_count from public.ep_members where room_id = r.id and role = 'player';
      select count(*) into answer_count from public.ep_answers where room_id = r.id and round = r.round;
      if clock_timestamp() < r.ends_at and answer_count < player_count then raise exception 'Les autres joueurs sont encore en train de jouer.'; end if;
      update public.ep_answers as a set points = public.ep_points(r.challenge, a.answer) where a.room_id = r.id and a.round = r.round;
      update public.ep_members as member set score = member.score + a.points from public.ep_answers as a
        where a.room_id = r.id and a.round = r.round and member.room_id = r.id and member.user_id = a.user_id;
      update public.ep_rooms set status = case when round = total_rounds then 'finished' else 'results' end where id = r.id;
    else
      raise exception 'Cette action n’existe pas.';
    end if;
  end if;
  update public.ep_rooms set revision = revision + 1 where id = r.id;
  update public.ep_signals set revision = revision + 1 where room_id = r.id;
  return public.ep_snapshot(r.id);
end;
$$;
revoke all on function public.ep_action(text, text, jsonb) from public, anon;
grant execute on function public.ep_action(text, text, jsonb) to authenticated;

-- Supabase possède déjà cette publication. Le test local peut ne pas l'avoir.
do $$ begin
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.ep_signals;
  end if;
end $$;

commit;
