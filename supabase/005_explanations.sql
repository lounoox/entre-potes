-- Généré par npm run content:generate. Après 001 à 003 ; inclut aussi 004.
-- Rejouable : ajoute les explications aux parties existantes sans changer les scores.
begin;

create table if not exists public.ep_rounds (
  room_id uuid not null references public.ep_rooms(id) on delete cascade,
  round integer not null check(round>0),
  challenge jsonb not null,
  primary key(room_id,round)
);
alter table public.ep_rounds enable row level security;
revoke all on public.ep_rounds from public,anon,authenticated;

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


update public.ep_catalog c set challenge=c.challenge || jsonb_build_object('explanation',e.value->>'explanation')
from jsonb_array_elements($explanations$[
  {
    "id": "quiz-1",
    "explanation": "La pieuvre a trois cœurs : deux envoient le sang vers les branchies, le troisième vers le reste du corps."
  },
  {
    "id": "quiz-2",
    "explanation": "L’étoile rend le pilote temporairement invincible. La banane et les carapaces sont des obstacles ou des projectiles."
  },
  {
    "id": "quiz-3",
    "explanation": "29 ne se divise que par 1 et par lui-même. Les autres sont divisibles par 3 : 21 = 3 × 7, 27 = 3 × 9 et 33 = 3 × 11."
  },
  {
    "id": "quiz-4",
    "explanation": "La tortilla espagnole classique associe des œufs et des pommes de terre. L’oignon est un ajout possible."
  },
  {
    "id": "quiz-5",
    "explanation": "L’Atlantique se trouve entre les côtes de l’Europe et celles de l’Amérique du Nord."
  },
  {
    "id": "quiz-6",
    "explanation": "Le S signifie Secure. HTTPS sécurise la communication HTTP grâce à TLS."
  },
  {
    "id": "quiz-7",
    "explanation": "La carte Inversion change le sens de circulation du tour. À deux joueurs, elle agit comme une carte Passe ton tour."
  },
  {
    "id": "quiz-8",
    "explanation": "Bohemian Rhapsody est une chanson de Queen, écrite par Freddie Mercury."
  },
  {
    "id": "estimate-1",
    "explanation": "Une semaine compte 7 jours : 7 × 24 heures × 60 minutes = 10 080 minutes."
  },
  {
    "id": "estimate-2",
    "explanation": "Un piano standard possède 88 touches : 52 blanches et 36 noires."
  },
  {
    "id": "estimate-3",
    "explanation": "24 heures × 60 minutes × 60 secondes = 86 400 secondes."
  },
  {
    "id": "estimate-4",
    "explanation": "Un échiquier comporte 8 rangées de 8 cases : 8 × 8 = 64."
  },
  {
    "id": "estimate-5",
    "explanation": "Un jeu classique comporte 4 couleurs de 13 cartes chacune : 4 × 13 = 52, sans les jokers."
  },
  {
    "id": "estimate-6",
    "explanation": "La réponse est dans la question : un dé à vingt faces, aussi appelé D20, possède 20 faces."
  },
  {
    "id": "size-1",
    "explanation": "Une feuille A4 mesure 21 × 29,7 cm. Sa hauteur est donc de 29,7 cm, contre 21 cm pour la feuille A5 de référence."
  },
  {
    "id": "size-2",
    "explanation": "Une feuille A3 mesure 29,7 × 42 cm. Elle est environ 1,41 fois aussi haute que la feuille A4 de référence."
  },
  {
    "id": "size-3",
    "explanation": "Le diamètre intérieur de référence du cercle est de 45 cm. Cela représente environ 1,52 fois la hauteur d’une feuille A4."
  },
  {
    "id": "size-4",
    "explanation": "Une feuille A5 mesure 14,8 × 21 cm. Sa hauteur représente un peu moins de la moitié du diamètre de 45 cm du cercle."
  },
  {
    "id": "size-5",
    "explanation": "Un panneau de basket officiel mesure 180 cm de large et 105 cm de haut. On demandait ici sa hauteur."
  },
  {
    "id": "size-6",
    "explanation": "Une feuille A6 mesure 10,5 × 14,8 cm. Elle est environ deux fois moins haute qu’une feuille A4."
  },
  {
    "id": "culture-1",
    "explanation": "Mario est reconnaissable à sa moustache, sa casquette rouge et aux tuyaux de ses aventures."
  },
  {
    "id": "culture-2",
    "explanation": "Harry Potter étudie à Poudlard, appelé Hogwarts dans la version anglaise."
  },
  {
    "id": "culture-3",
    "explanation": "Dans Tetris, les tétriminos s’empilent pour former des lignes complètes, qui disparaissent."
  },
  {
    "id": "culture-4",
    "explanation": "Le ukulélé possède généralement quatre cordes et est associé à Hawaï. Il est plus petit qu’une guitare classique."
  },
  {
    "id": "culture-5",
    "explanation": "La Nuit étoilée est une œuvre de Vincent van Gogh."
  },
  {
    "id": "culture-6",
    "explanation": "Central Perk est le café où les personnages de Friends se retrouvent autour du canapé."
  },
  {
    "id": "culture-7",
    "explanation": "Un palindrome garde le même ordre de lettres quand on le lit à l’envers, comme « kayak » ou « radar »."
  },
  {
    "id": "culture-8",
    "explanation": "Le 221B Baker Street est l’adresse du détective fictif Sherlock Holmes."
  },
  {
    "id": "emoji-1",
    "explanation": "Le lion et la couronne renvoient au titre Le Roi lion."
  },
  {
    "id": "emoji-2",
    "explanation": "Le bateau évoque le Titanic, la glace l’iceberg, et le cœur brisé l’histoire d’amour."
  },
  {
    "id": "emoji-3",
    "explanation": "Le rat, le cuisinier et la France évoquent Rémy et la cuisine parisienne de Ratatouille."
  },
  {
    "id": "emoji-4",
    "explanation": "L’araignée, l’homme et la toile forment le nom Spider-Man : l’homme-araignée."
  },
  {
    "id": "emoji-5",
    "explanation": "La voiture, l’électricité et l’horloge évoquent la DeLorean et les voyages dans le temps de Retour vers le futur."
  },
  {
    "id": "emoji-6",
    "explanation": "La pioche, les blocs, les diamants et les zombies sont des éléments caractéristiques de Minecraft."
  },
  {
    "id": "rebus-1",
    "explanation": "« Chat » + « peau » se prononce « chapeau ». On additionne les sons, pas les lettres."
  },
  {
    "id": "rebus-2",
    "explanation": "« Pain » + « seau » donne le son « pinceau »."
  },
  {
    "id": "rebus-3",
    "explanation": "« Chat » + « lait » se prononce « chalet »."
  },
  {
    "id": "rebus-4",
    "explanation": "« Verre » + « nid » se prononce « vernis »."
  },
  {
    "id": "rebus-5",
    "explanation": "« Scie » + « trouille » se prononce « citrouille »."
  },
  {
    "id": "rebus-6",
    "explanation": "« Rat » + « d’eau » se prononce « radeau »."
  },
  {
    "id": "petitbac-1",
    "explanation": "Il fallait trouver une réponse dans la catégorie « Animal », commençant par P. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne."
  },
  {
    "id": "petitbac-2",
    "explanation": "Il fallait trouver une réponse dans la catégorie « Fruit », commençant par P. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne."
  },
  {
    "id": "petitbac-3",
    "explanation": "Il fallait trouver une réponse dans la catégorie « Pays », commençant par C. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne."
  },
  {
    "id": "petitbac-4",
    "explanation": "Il fallait trouver une réponse dans la catégorie « Ville », commençant par B. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne."
  },
  {
    "id": "petitbac-5",
    "explanation": "Il fallait trouver une réponse dans la catégorie « Sport », commençant par T. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne."
  },
  {
    "id": "petitbac-6",
    "explanation": "Il fallait trouver une réponse dans la catégorie « Aliment », commençant par C. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne."
  },
  {
    "id": "order-1",
    "explanation": "1 cm = 10 mm, 1 m = 100 cm et 1 km = 1 000 m. L’ordre est millimètre, centimètre, mètre, kilomètre."
  },
  {
    "id": "order-2",
    "explanation": "En partant du Soleil, ces quatre planètes sont Mercure, Vénus, Terre puis Mars."
  },
  {
    "id": "order-3",
    "explanation": "Dans la série A, plus le numéro augmente, plus la feuille est petite : A6, A5, A4 puis A3."
  },
  {
    "id": "order-4",
    "explanation": "Un tiers vaut environ 0,33 ; un demi 0,5 ; deux tiers 0,67 ; trois quarts 0,75."
  },
  {
    "id": "order-5",
    "explanation": "Une heure vaut 60 minutes, deux heures 120 minutes et une journée 1 440 minutes : 60, 90, 120 puis 1 440."
  },
  {
    "id": "order-6",
    "explanation": "On compare les lettres de gauche à droite : Abricot, Cerise, Citron puis Kiwi. « Ce » précède « Ci »."
  },
  {
    "id": "odd-1",
    "explanation": "Kayak, radar et ressasser se lisent à l’identique dans les deux sens. À l’envers, « revenir » donne « rinever »."
  },
  {
    "id": "odd-2",
    "explanation": "9 est divisible par 3 : 9 = 3 × 3. Les nombres 2, 3 et 11 ne se divisent que par 1 et par eux-mêmes."
  },
  {
    "id": "odd-3",
    "explanation": "La clarinette est un instrument à vent. Le violon, la harpe et le ukulélé produisent leur son grâce à des cordes."
  },
  {
    "id": "odd-4",
    "explanation": "Fe est le fer, Au l’or et Na le sodium. Xx n’est pas le symbole d’un élément chimique."
  },
  {
    "id": "odd-5",
    "explanation": "Juin compte 30 jours. Mars, mai et juillet en comptent 31."
  },
  {
    "id": "odd-6",
    "explanation": "Le requin est un poisson. Le dauphin, la baleine et la chauve-souris sont des mammifères : ils allaitent leurs petits."
  },
  {
    "id": "majority-1",
    "explanation": "Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points."
  },
  {
    "id": "majority-2",
    "explanation": "Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points."
  },
  {
    "id": "majority-3",
    "explanation": "Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points."
  },
  {
    "id": "majority-4",
    "explanation": "Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points."
  },
  {
    "id": "majority-5",
    "explanation": "Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points."
  },
  {
    "id": "majority-6",
    "explanation": "Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points."
  },
  {
    "id": "memory-1",
    "explanation": "On compare chaque fruit à la même position dans la suite : 5 positions correctes rapportent 3 points, au moins 3 en rapportent 2, au moins 1 rapporte 1 point."
  },
  {
    "id": "memory-2",
    "explanation": "On compare chaque fruit à la même position dans la suite : 5 positions correctes rapportent 3 points, au moins 3 en rapportent 2, au moins 1 rapporte 1 point."
  },
  {
    "id": "memory-3",
    "explanation": "On compare chaque fruit à la même position dans la suite : 5 positions correctes rapportent 3 points, au moins 3 en rapportent 2, au moins 1 rapporte 1 point."
  },
  {
    "id": "memory-4",
    "explanation": "On compare chaque fruit à la même position dans la suite : 5 positions correctes rapportent 3 points, au moins 3 en rapportent 2, au moins 1 rapporte 1 point."
  },
  {
    "id": "timing-1",
    "explanation": "L’objectif était de 5 secondes. Un écart de 250 ms ou moins rapporte 3 points, jusqu’à 750 ms 2 points, jusqu’à 1 500 ms 1 point."
  },
  {
    "id": "timing-2",
    "explanation": "L’objectif était de 7 secondes. Un écart de 250 ms ou moins rapporte 3 points, jusqu’à 750 ms 2 points, jusqu’à 1 500 ms 1 point."
  },
  {
    "id": "timing-3",
    "explanation": "L’objectif était de 9 secondes. Un écart de 250 ms ou moins rapporte 3 points, jusqu’à 750 ms 2 points, jusqu’à 1 500 ms 1 point."
  },
  {
    "id": "timing-4",
    "explanation": "L’objectif était de 11 secondes. Un écart de 250 ms ou moins rapporte 3 points, jusqu’à 750 ms 2 points, jusqu’à 1 500 ms 1 point."
  }
]$explanations$::jsonb) e(value)
where c.id=e.value->>'id';
create or replace function public.ep_explained(p_challenge jsonb) returns jsonb
language sql stable security definer set search_path='' as $$
select p_challenge || coalesce((select jsonb_build_object('explanation',c.challenge->>'explanation')
  from public.ep_catalog c where c.id=p_challenge->>'id' and c.challenge ? 'explanation'),'{}'::jsonb);
$$;
revoke all on function public.ep_explained(jsonb) from public,anon,authenticated;
create or replace function public.ep_snapshot(p_room uuid) returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.ep_rooms; m public.ep_members; v_challenge jsonb; v_players jsonb; v_submitted jsonb; v_results jsonb := '[]'; v_history jsonb := '[]';
begin
  select * into r from public.ep_rooms where id=p_room;
  select * into m from public.ep_members where room_id=p_room and user_id=auth.uid();
  if m.user_id is null then raise exception 'Rejoins cette partie pour la consulter.'; end if;
  v_challenge := case when r.status in ('review','results','finished') then public.ep_explained(r.challenge) else r.challenge end;
  if r.status='playing' then
    v_challenge := v_challenge - 'expected' - 'explanation';
    if v_challenge->>'type'='memory' and clock_timestamp() >= r.starts_at+interval '6 seconds' then v_challenge := v_challenge-'sequence'; end if;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',user_id,'name',name,'avatar',avatar,'score',score,'position',position,'coins',coins,'stars',stars,'shield',shield,'stance',stance) order by joined_at,user_id),'[]'::jsonb) into v_players from public.ep_members where room_id=p_room and role='player';
  select coalesce(jsonb_agg(user_id),'[]'::jsonb) into v_submitted from public.ep_answers where room_id=p_room and round=r.round;
  if r.status in ('review','results','finished') then
    select coalesce(jsonb_agg(jsonb_build_object('id',user_id,'answer',answer,'points',points)),'[]'::jsonb) into v_results from public.ep_answers where room_id=p_room and round=r.round;
  end if;
  if r.status='finished' then
    select coalesce(jsonb_agg(jsonb_build_object('round',h.round,'challenge',public.ep_explained(h.challenge),'results',
      (select coalesce(jsonb_agg(jsonb_build_object('id',a.user_id,'answer',a.answer,'points',a.points) order by a.user_id),'[]'::jsonb)
       from public.ep_answers a where a.room_id=p_room and a.round=h.round)) order by h.round),'[]'::jsonb)
      into v_history from public.ep_rounds h where h.room_id=p_room and h.round<=r.round;
  end if;
  return jsonb_build_object('id',r.id,'code',r.code,'host_id',r.host_id,'status',r.status,'round',r.round,'total_rounds',r.total_rounds,'games',to_jsonb(r.games),
    'challenge',v_challenge,'starts_at',r.starts_at,'ends_at',r.ends_at,'players',v_players,'submitted',v_submitted,'results',v_results,'board_log',r.board_log,'history',v_history,
    'viewer_id',auth.uid(),'viewer_role',m.role,'revision',r.revision,'server_now',clock_timestamp());
end;
$$;
commit;
