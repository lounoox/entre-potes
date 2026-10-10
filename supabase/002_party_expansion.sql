-- À appliquer après 001_party.sql. Préserve les salons et leurs réponses.
begin;
alter table public.ep_rooms drop constraint ep_rooms_status_check;
alter table public.ep_rooms add constraint ep_rooms_status_check check(status in ('lobby','playing','review','results','finished'));
alter table public.ep_rooms drop constraint ep_rooms_total_rounds_check;
alter table public.ep_rooms add constraint ep_rooms_total_rounds_check check(total_rounds in (4,6,8,12));
alter table public.ep_rooms add column games text[] not null default array['size','culture','timing','emoji','order','majority','petitbac','rebus','odd','memory','estimate','quiz'];
alter table public.ep_rooms add column deck jsonb not null default '[]';
alter table public.ep_rooms add column board_log jsonb not null default '[]';
alter table public.ep_members add column position integer not null default 0 check(position between 0 and 24);
alter table public.ep_members add column coins integer not null default 3 check(coins >= 0);
alter table public.ep_members add column stars integer not null default 0 check(stars >= 0);
alter table public.ep_members add column shield boolean not null default false;
alter table public.ep_members add column stance text not null default 'chill' check(stance in ('chill','bold'));
create table public.ep_catalog(id text primary key, type text not null, challenge jsonb not null);
alter table public.ep_catalog enable row level security;
revoke all on public.ep_catalog from anon, authenticated;

create function public.ep_normalize(value text) returns text language sql immutable set search_path = '' as $$
  select regexp_replace(translate(replace(replace(lower(trim(value)), 'œ', 'oe'), 'æ', 'ae'), 'àâäáãåéèêëíìîïóòôöõúùûüçÿý', 'aaaaaaeeeeiiiiooooouuuucyy'), '[^a-z0-9]', '', 'g');
$$;

create function public.ep_deck(p_games text[], p_rounds integer) returns jsonb language plpgsql set search_path = '' as $$
declare v_deck jsonb := '[]'; v_bag text[]; v_type text; v_temp text; v_challenge jsonb;
begin
  while jsonb_array_length(v_deck) < p_rounds loop
    select array_agg(t order by random()) into v_bag from unnest(p_games) as t;
    if cardinality(v_bag) > 1 and v_bag[1] = (v_deck -> -1 ->> 'type') then v_temp := v_bag[1]; v_bag[1] := v_bag[2]; v_bag[2] := v_temp; end if;
    foreach v_type in array v_bag loop
      select challenge into v_challenge from public.ep_catalog c where c.type = v_type and not exists(select 1 from jsonb_array_elements(v_deck) d where d->>'id' = c.id) order by random() limit 1;
      if v_challenge is null then select challenge into v_challenge from public.ep_catalog c where c.type = v_type and c.id is distinct from (v_deck -> -1 ->> 'id') order by random() limit 1; end if;
      if v_challenge is null then raise exception 'Le catalogue doit être initialisé avec 003_content.sql.'; end if;
      v_deck := v_deck || jsonb_build_array(v_challenge);
      exit when jsonb_array_length(v_deck) >= p_rounds;
    end loop;
  end loop;
  return v_deck;
end;
$$;

create or replace function public.ep_points(p_challenge jsonb, p_answer jsonb) returns integer language plpgsql immutable set search_path = '' as $$
declare delta numeric; matches integer := 0; i integer; j integer; left_pos integer; right_pos integer; reward integer := coalesce((p_challenge->>'reward')::integer,3);
begin
  if p_answer is null or p_answer = 'null'::jsonb then return 0; end if;
  if p_challenge->>'type' in ('culture','emoji','rebus','petitbac') then
    return case when exists(select 1 from jsonb_array_elements_text(p_challenge->'expected') v where public.ep_normalize(v) = public.ep_normalize(p_answer #>> '{}')) then reward else 0 end;
  elsif p_challenge->>'type' in ('quiz','odd') then return case when p_answer = p_challenge->'expected' then reward else 0 end;
  elsif p_challenge->>'type' in ('estimate','size') then
    delta := abs((p_answer #>> '{}')::numeric - (p_challenge->>'expected')::numeric) / greatest(1,(p_challenge->>'expected')::numeric);
    return case when delta <= 0.050000000001 then 3 when delta <= 0.200000000001 then 2 when delta <= 0.500000000001 then 1 else 0 end;
  elsif p_challenge->>'type' = 'memory' then
    select count(*) into matches from generate_series(0,4) as n where p_answer->n = p_challenge->'expected'->n;
    return case when matches = 5 then 3 when matches >= 3 then 2 when matches >= 1 then 1 else 0 end;
  elsif p_challenge->>'type' = 'order' then
    for i in 0..2 loop for j in (i+1)..3 loop
      select ord into left_pos from jsonb_array_elements(p_answer) with ordinality as a(val,ord) where val = p_challenge->'expected'->i;
      select ord into right_pos from jsonb_array_elements(p_answer) with ordinality as a(val,ord) where val = p_challenge->'expected'->j;
      if left_pos < right_pos then matches := matches + 1; end if;
    end loop; end loop;
    return case when matches = 6 then 3 when matches >= 4 then 2 when matches >= 2 then 1 else 0 end;
  elsif p_challenge->>'type' = 'timing' then
    delta := abs((p_answer #>> '{}')::numeric - coalesce((p_challenge->>'target_ms')::numeric,5000));
    return case when delta <= 250 then 3 when delta <= 750 then 2 when delta <= 1500 then 1 else 0 end;
  end if;
  return 0;
end;
$$;

create function public.ep_valid(p_challenge jsonb, p_answer jsonb) returns boolean language plpgsql immutable set search_path = '' as $$
declare v_type text := p_challenge->>'type'; v_number numeric;
begin
  if p_answer is null or p_answer = 'null'::jsonb then return false; end if;
  if v_type in ('culture','emoji','rebus','petitbac') then
    return jsonb_typeof(p_answer) = 'string' and char_length(trim(p_answer #>> '{}')) between 1 and 80 and not ((p_answer #>> '{}') ~ '[[:cntrl:]]');
  elsif v_type in ('memory','order') then
    if jsonb_typeof(p_answer) <> 'array' then return false; end if;
    if jsonb_array_length(p_answer) <> (case when v_type = 'memory' then 5 else 4 end) then return false; end if;
    if exists(select 1 from jsonb_array_elements(p_answer) as v where jsonb_typeof(v) <> 'number' or v not in ('0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb)) then return false; end if;
    if v_type = 'order' then return (select count(distinct v) = 4 and bool_and(v in ('0'::jsonb,'1'::jsonb,'2'::jsonb,'3'::jsonb)) from jsonb_array_elements(p_answer) v); end if;
    return true;
  end if;
  if jsonb_typeof(p_answer) <> 'number' then return false; end if;
  v_number := (p_answer #>> '{}')::numeric;
  if v_number < 0 or v_number > 1000000000 then return false; end if;
  if v_type in ('quiz','odd','majority') then return v_number <= 3 and v_number = trunc(v_number); end if;
  if v_type = 'timing' then return v_number <= 60000; end if;
  return v_type in ('estimate','size');
end;
$$;

create function public.ep_board(p_player jsonb, p_points integer, p_round integer) returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  v_start integer := coalesce((p_player->>'position')::integer,0);
  v_old_coins integer := coalesce((p_player->>'coins')::integer,3);
  v_old_stars integer := coalesce((p_player->>'stars')::integer,0);
  v_coins integer; v_stars integer := v_old_stars; v_position integer; v_landing integer;
  v_move integer := 1+p_points; v_shield boolean := coalesce((p_player->>'shield')::boolean,false);
  v_notes jsonb := '[]'; v_player jsonb;
begin
  v_coins := v_old_coins + p_points;
  if p_round % 6 = 0 then v_move := v_move + 1; elsif p_round % 3 = 0 then v_coins := v_coins + 1; end if;
  if p_player->>'stance' = 'bold' then
    if p_points >= 2 then v_move := v_move + 2; v_coins := v_coins + 1; v_notes := v_notes || '["Audace réussie : +2 cases, +1 pièce"]';
    else v_coins := greatest(0,v_coins-1); v_notes := v_notes || '["Audace manquée : −1 pièce"]'; end if;
  end if;
  v_position := (v_start+v_move) % 25; v_landing := v_position;
  if v_start+v_move >= 25 then v_stars := v_stars+1; v_coins := v_coins+3; v_notes := v_notes || '["Tour bouclé : +1 étoile, +3 pièces"]'; end if;
  if v_landing = 3 then v_coins := v_coins+3; v_notes := v_notes || '["Fond du canapé : +3 pièces"]'; end if;
  if v_landing = 15 then v_coins := v_coins+3; v_notes := v_notes || '["Cagnotte de l’apéro : +3 pièces"]'; end if;
  if v_landing = 24 then v_coins := v_coins+2; v_notes := v_notes || '["Dernier snack : +2 pièces"]'; end if;
  if v_landing = 5 then v_shield := true; v_notes := v_notes || '["Bouclier récupéré"]'; end if;
  if v_landing in (7,17) then v_position := v_position+3; v_notes := v_notes || '["Raccourci : +3 cases (sans activer la case d’arrivée)"]'; end if;
  if v_landing in (10,20) then
    if v_coins >= 6 then v_coins := v_coins-6; v_stars := v_stars+1; v_notes := v_notes || '["6 pièces échangées contre 1 étoile"]';
    else v_coins := v_coins+1; v_notes := v_notes || '["Pas assez pour une étoile : +1 pièce"]'; end if;
  end if;
  if v_landing in (12,22) then
    if v_shield then v_shield := false; v_notes := v_notes || '["Piège évité grâce au bouclier"]';
    else v_coins := greatest(0,v_coins-2); v_notes := v_notes || '["Piège : −2 pièces"]'; end if;
  end if;
  if v_notes = '[]'::jsonb then v_notes := '["Une étape de plus dans la tournée."]'; end if;
  v_player := p_player || jsonb_build_object('position',v_position,'coins',v_coins,'stars',v_stars,'shield',v_shield,'stance','chill','score',coalesce((p_player->>'score')::integer,0)+p_points);
  return jsonb_build_object('player',v_player,'log',jsonb_build_object('id',p_player->>'id','from',v_start,'to',v_position,'points',p_points,'coins',v_coins-v_old_coins,'stars',v_stars-v_old_stars,'notes',v_notes));
end;
$$;

create function public.ep_resolve(p_room uuid) returns void language plpgsql security definer set search_path = '' as $$
declare r public.ep_rooms; m public.ep_members; v_points integer; v_result jsonb; v_logs jsonb := '[]';
begin
  select * into r from public.ep_rooms where id=p_room for update;
  if r.status not in ('playing','review') then return; end if;
  for m in select * from public.ep_members where room_id=p_room and role='player' order by joined_at,user_id loop
    select points into v_points from public.ep_answers where room_id=p_room and user_id=m.user_id and round=r.round;
    v_result := public.ep_board(jsonb_build_object('id',m.user_id,'position',m.position,'coins',m.coins,'stars',m.stars,'shield',m.shield,'stance',m.stance,'score',m.score),coalesce(v_points,0),r.round);
    update public.ep_members set score=(v_result->'player'->>'score')::integer,position=(v_result->'player'->>'position')::integer,
      coins=(v_result->'player'->>'coins')::integer,stars=(v_result->'player'->>'stars')::integer,shield=(v_result->'player'->>'shield')::boolean,stance='chill'
      where room_id=p_room and user_id=m.user_id;
    v_logs := v_logs || jsonb_build_array(v_result->'log');
  end loop;
  update public.ep_rooms set status=case when round=total_rounds then 'finished' else 'results' end,board_log=v_logs where id=p_room;
end;
$$;

create or replace function public.ep_snapshot(p_room uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.ep_rooms; m public.ep_members; v_challenge jsonb; v_players jsonb; v_submitted jsonb; v_results jsonb := '[]';
begin
  select * into r from public.ep_rooms where id=p_room;
  select * into m from public.ep_members where room_id=p_room and user_id=auth.uid();
  if m.user_id is null then raise exception 'Rejoins cette partie pour la consulter.'; end if;
  v_challenge := r.challenge;
  if r.status='playing' then
    v_challenge := v_challenge - 'expected';
    if v_challenge->>'type'='memory' and clock_timestamp() >= r.starts_at+interval '6 seconds' then v_challenge := v_challenge-'sequence'; end if;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',user_id,'name',name,'avatar',avatar,'score',score,'position',position,'coins',coins,'stars',stars,'shield',shield,'stance',stance) order by joined_at,user_id),'[]'::jsonb) into v_players from public.ep_members where room_id=p_room and role='player';
  select coalesce(jsonb_agg(user_id),'[]'::jsonb) into v_submitted from public.ep_answers where room_id=p_room and round=r.round;
  if r.status in ('review','results','finished') then
    select coalesce(jsonb_agg(jsonb_build_object('id',user_id,'answer',answer,'points',points)),'[]'::jsonb) into v_results from public.ep_answers where room_id=p_room and round=r.round;
  end if;
  return jsonb_build_object('id',r.id,'code',r.code,'host_id',r.host_id,'status',r.status,'round',r.round,'total_rounds',r.total_rounds,'games',to_jsonb(r.games),
    'challenge',v_challenge,'starts_at',r.starts_at,'ends_at',r.ends_at,'players',v_players,'submitted',v_submitted,'results',v_results,'board_log',r.board_log,
    'viewer_id',auth.uid(),'viewer_role',m.role,'revision',r.revision,'server_now',clock_timestamp());
end;
$$;

alter function public.ep_action(text,text,jsonb) rename to ep_action_v1;
revoke all on function public.ep_action_v1(text,text,jsonb) from public,anon,authenticated;

create function public.ep_action(p_action text,p_code text default null,p_payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid(); r public.ep_rooms; m public.ep_members; base jsonb;
  v_games text[]; v_rounds integer; v_challenge jsonb; v_duration integer; v_answer jsonb;
  v_points integer; v_player uuid; v_stance text; v_max_count integer;
begin
  if uid is null then raise exception 'Connecte-toi pour jouer.'; end if;
  if p_action='create' then
    v_rounds := coalesce((p_payload->>'rounds')::integer,8);
    if v_rounds not in (4,6,8,12) then raise exception 'Choisis 4, 6, 8 ou 12 manches.'; end if;
    if p_payload ? 'games' then
      if jsonb_typeof(p_payload->'games') <> 'array' then raise exception 'Choisis des mini-jeux valides.'; end if;
      select array_agg(v) into v_games from jsonb_array_elements_text(p_payload->'games') v;
    else v_games := array['size','culture','timing','emoji','order','majority','petitbac','rebus','odd','memory','estimate','quiz']; end if;
    if coalesce(cardinality(v_games),0) < 1 or cardinality(v_games)>12 or not (v_games <@ array['size','culture','timing','emoji','order','majority','petitbac','rebus','odd','memory','estimate','quiz']) or (select count(distinct v) from unnest(v_games) v) <> cardinality(v_games) then raise exception 'Choisis au moins un mini-jeu valide, sans doublon.'; end if;
    base := public.ep_action_v1('create',null,jsonb_set(p_payload,'{rounds}','4'));
    update public.ep_rooms set total_rounds=v_rounds,games=v_games,deck=public.ep_deck(v_games,v_rounds),revision=revision+1 where id=(base->>'id')::uuid returning * into r;
    update public.ep_signals set revision=revision+1 where room_id=r.id;
    return public.ep_snapshot(r.id);
  end if;
  if p_action in ('join','get') then return public.ep_action_v1(p_action,p_code,p_payload); end if;
  select * into r from public.ep_rooms where code=upper(trim(p_code)) for update;
  if r.id is null then raise exception 'Ce code ne correspond à aucune partie.'; end if;
  if r.expires_at < clock_timestamp() then raise exception 'Cette partie a expiré.'; end if;
  select * into m from public.ep_members where room_id=r.id and user_id=uid;
  if m.user_id is null then raise exception 'Rejoins cette partie pour jouer.'; end if;
  if m.role <> 'player' then raise exception 'Un écran spectateur ne peut pas agir dans la partie.'; end if;

  if p_action='start' then
    if r.host_id<>uid then raise exception 'Seul l’hôte peut lancer une manche.'; end if;
    if r.status not in ('lobby','results') or r.round>=r.total_rounds then raise exception 'Impossible de lancer une manche maintenant.'; end if;
    if (select count(*) from public.ep_members where room_id=r.id and role='player')<2 then raise exception 'Il faut au moins deux potes pour jouer.'; end if;
    if jsonb_array_length(r.deck)<r.total_rounds then r.deck := public.ep_deck(r.games,r.total_rounds); end if;
    v_challenge := r.deck->r.round;
    v_duration := case v_challenge->>'type' when 'timing' then 35 when 'quiz' then 20 when 'memory' then 25 when 'estimate' then 25 when 'majority' then 25 when 'odd' then 25 else 30 end;
    update public.ep_rooms set status='playing',round=round+1,deck=r.deck,challenge=v_challenge,board_log='[]',starts_at=clock_timestamp()+interval '3 seconds',ends_at=clock_timestamp()+make_interval(secs=>v_duration+3) where id=r.id;
  elsif p_action='stance' then
    v_stance := p_payload->>'stance';
    if r.status not in ('lobby','results') or v_stance is null or v_stance not in ('chill','bold') or (p_payload->>'round')::integer is distinct from r.round then raise exception 'Le choix se fait avant la prochaine manche.'; end if;
    update public.ep_members set stance=v_stance where room_id=r.id and user_id=uid;
  elsif p_action='answer' then
    if (p_payload->>'round')::integer is distinct from r.round then raise exception 'La manche a changé. Recharge la partie.'; end if;
    if r.status<>'playing' or clock_timestamp()<r.starts_at or clock_timestamp()>r.ends_at then raise exception 'La manche n’accepte pas de réponse pour le moment.'; end if;
    if exists(select 1 from public.ep_answers where room_id=r.id and user_id=uid and round=r.round) then raise exception 'Ta réponse est déjà enregistrée.'; end if;
    if r.challenge->>'type'='memory' and clock_timestamp()<r.starts_at+interval '6 seconds' then raise exception 'Observe encore la suite.'; end if;
    v_answer := p_payload->'answer';
    if not public.ep_valid(r.challenge,v_answer) then raise exception 'Cette réponse n’est pas valide.'; end if;
    insert into public.ep_answers(room_id,user_id,round,answer) values(r.id,uid,r.round,v_answer);
  elsif p_action='finish' then
    if r.status in ('review','results','finished') then return public.ep_snapshot(r.id); end if;
    if r.status<>'playing' then raise exception 'Aucune manche n’est en cours.'; end if;
    if clock_timestamp()<r.ends_at and (select count(*) from public.ep_answers where room_id=r.id and round=r.round)<(select count(*) from public.ep_members where room_id=r.id and role='player') then raise exception 'Les autres joueurs sont encore en train de jouer.'; end if;
    if r.challenge->>'type'='majority' then
      select max(n) into v_max_count from (select count(*) as n from public.ep_answers where room_id=r.id and round=r.round group by answer) votes;
      update public.ep_answers a set points=case when (select count(*) from public.ep_answers b where b.room_id=r.id and b.round=r.round and b.answer=a.answer)=v_max_count then 3 else 1 end where a.room_id=r.id and a.round=r.round;
    else update public.ep_answers a set points=public.ep_points(r.challenge,a.answer) where a.room_id=r.id and a.round=r.round; end if;
    if r.challenge->>'type' in ('culture','emoji','rebus','petitbac') then update public.ep_rooms set status='review' where id=r.id;
    else perform public.ep_resolve(r.id); end if;
  elsif p_action='review' then
    if r.host_id<>uid then raise exception 'Seul l’hôte peut corriger les réponses.'; end if;
    if r.status<>'review' or (p_payload->>'round')::integer is distinct from r.round then raise exception 'Cette correction est fermée.'; end if;
    if jsonb_typeof(p_payload->'points') is distinct from 'number' then raise exception 'Ce score n’est pas valide.'; end if;
    if (p_payload->>'points')::numeric <> trunc((p_payload->>'points')::numeric) then raise exception 'Ce score n’est pas valide.'; end if;
    v_points := (p_payload->>'points')::integer; v_player := (p_payload->>'player_id')::uuid;
    if v_points<0 or v_points>coalesce((r.challenge->>'reward')::integer,3) then raise exception 'Ce score n’est pas valide.'; end if;
    update public.ep_answers set points=v_points where room_id=r.id and round=r.round and user_id=v_player;
    if not found then raise exception 'Réponse introuvable.'; end if;
  elsif p_action='resolve' then
    if r.host_id<>uid then raise exception 'Seul l’hôte peut valider la correction.'; end if;
    if r.status in ('results','finished') then return public.ep_snapshot(r.id); end if;
    if r.status<>'review' or (p_payload->>'round')::integer is distinct from r.round then raise exception 'Aucune correction à valider.'; end if;
    perform public.ep_resolve(r.id);
  else raise exception 'Cette action n’existe pas.';
  end if;
  update public.ep_rooms set revision=revision+1 where id=r.id;
  update public.ep_signals set revision=revision+1 where room_id=r.id;
  return public.ep_snapshot(r.id);
end;
$$;

revoke all on function public.ep_normalize(text),public.ep_deck(text[],integer),public.ep_valid(jsonb,jsonb),public.ep_board(jsonb,integer,integer),public.ep_resolve(uuid),public.ep_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.ep_action(text,text,jsonb) to authenticated;
commit;
