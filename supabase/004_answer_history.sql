-- Après 001, 002 et 003. Rejouable. Conserve les réponses et les parties existantes.
begin;
create table if not exists public.ep_rounds (
  room_id uuid not null references public.ep_rooms(id) on delete cascade,
  round integer not null check(round>0),
  challenge jsonb not null,
  primary key(room_id,round)
);
alter table public.ep_rounds enable row level security;
revoke all on public.ep_rounds from public,anon,authenticated;

-- Reconstruit les manches déjà terminées à partir de leur sélection conservée.
insert into public.ep_rounds(room_id,round,challenge)
select r.id,d.ordinality::integer,d.value
from public.ep_rooms r cross join lateral jsonb_array_elements(r.deck) with ordinality d(value,ordinality)
where d.ordinality <= r.round - case when r.status in ('playing','review') then 1 else 0 end
on conflict(room_id,round) do nothing;
insert into public.ep_rounds(room_id,round,challenge)
select id,round,challenge from public.ep_rooms where status in ('results','finished') and round>0 and challenge is not null
on conflict(room_id,round) do update set challenge=excluded.challenge;

create or replace function public.ep_archive_round() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.status in ('results','finished') and (old.status is distinct from new.status or old.round is distinct from new.round) then
    insert into public.ep_rounds(room_id,round,challenge) values(new.id,new.round,new.challenge)
    on conflict(room_id,round) do update set challenge=excluded.challenge;
  end if;
  return new;
end;
$$;
revoke all on function public.ep_archive_round() from public,anon,authenticated;
drop trigger if exists ep_archive_round on public.ep_rooms;
create trigger ep_archive_round after update of status on public.ep_rooms
for each row execute function public.ep_archive_round();

create or replace function public.ep_snapshot(p_room uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.ep_rooms; m public.ep_members; v_challenge jsonb; v_players jsonb; v_submitted jsonb; v_results jsonb := '[]'; v_history jsonb := '[]';
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
  if r.status='finished' then
    select coalesce(jsonb_agg(jsonb_build_object('round',h.round,'challenge',h.challenge,'results',
      (select coalesce(jsonb_agg(jsonb_build_object('id',a.user_id,'answer',a.answer,'points',a.points) order by a.user_id),'[]'::jsonb)
       from public.ep_answers a where a.room_id=p_room and a.round=h.round)) order by h.round),'[]'::jsonb)
      into v_history from public.ep_rounds h where h.room_id=p_room and h.round<=r.round;
  end if;
  return jsonb_build_object('id',r.id,'code',r.code,'host_id',r.host_id,'status',r.status,'round',r.round,'total_rounds',r.total_rounds,'games',to_jsonb(r.games),
    'challenge',v_challenge,'starts_at',r.starts_at,'ends_at',r.ends_at,'players',v_players,'submitted',v_submitted,'results',v_results,'board_log',r.board_log,'history',v_history,
    'viewer_id',auth.uid(),'viewer_role',m.role,'revision',r.revision,'server_now',clock_timestamp());
end;
$$;
-- Les privilèges de ep_snapshot restent privés ; les membres passent par ep_action.
commit;
