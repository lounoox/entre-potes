import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { DEMO_CHALLENGES, GAMES, pointsFor } from '../src/game.js';
import { resolveBoard } from '../src/board.js';

let db;
const host = '00000000-0000-0000-0000-000000000001';
const friend = '00000000-0000-0000-0000-000000000002';
const screen = '00000000-0000-0000-0000-000000000003';
const outsider = '00000000-0000-0000-0000-000000000004';
let room;

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    grant usage on schema public, auth to authenticated;
  `);
  await db.exec(await readFile(new URL('../supabase/001_party.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/002_party_expansion.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/003_content.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/004_answer_history.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/005_explanations.sql', import.meta.url), 'utf8'));
});
after(async () => { await db?.close(); });

async function rpc(uid, action, payload = {}, code = room?.code) {
  await db.exec('reset role; set role authenticated;');
  await db.query("select set_config('test.uid', $1, false)", [uid]);
  const { rows } = await db.query('select public.ep_action($1, $2, $3::jsonb) as snapshot', [action, code || null, JSON.stringify({ round: room?.round, ...payload })]);
  return rows[0].snapshot;
}
async function admin(sql, params = []) { await db.exec('reset role;'); return db.query(sql, params); }
async function openWindow() { await admin("update public.ep_rooms set starts_at = clock_timestamp() - interval '8 seconds', ends_at = clock_timestamp() + interval '30 seconds' where id = $1", [room.id]); }

test('salon, accès privés, noms uniques et spectateur', async () => {
  room = await rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: ['quiz'] });
  assert.match(room.code, /^[A-Z0-9]{6}$/);
  assert.equal(room.players.length, 1);
  await assert.rejects(rpc(outsider, 'get'), /Rejoins/);
  await assert.rejects(rpc(friend, 'join', { name: 'louis', avatar: 1 }), /déjà pris/);
  room = await rpc(friend, 'join', { name: 'Léa', avatar: 1 });
  assert.equal(room.players.length, 2);
  const display = await rpc(screen, 'join', { name: 'Écran', avatar: 0, spectator: true });
  assert.equal(display.viewer_role, 'spectator');
  assert.equal(display.players.length, 2);
  await assert.rejects(db.query('select * from public.ep_rooms'), /permission denied/);
  await assert.rejects(db.query('select public.ep_snapshot($1)', [room.id]), /permission denied/);
  assert.equal((await db.query('select * from public.ep_signals')).rows.length, 1);
  await db.query("select set_config('test.uid', $1, false)", [outsider]);
  assert.equal((await db.query('select * from public.ep_signals')).rows.length, 0);
});

test('l’hôte lance, les réponses restent secrètes et chaque score est compté une seule fois', async () => {
  await assert.rejects(rpc(friend, 'start'), /Seul l’hôte/);
  room = await rpc(host, 'start');
  assert.equal(room.challenge.expected, undefined);
  await assert.rejects(rpc(host, 'answer', { answer: 0 }), /moment/);
  await assert.rejects(rpc(screen, 'answer', { answer: 0 }), /spectateur/);
  await assert.rejects(rpc(outsider, 'join', { name: 'Sam', avatar: 2 }), /déjà commencé/);
  await openWindow();
  const expected = (await admin('select challenge from public.ep_rooms where id = $1', [room.id])).rows[0].challenge.expected;
  await assert.rejects(rpc(host, 'answer', { answer: expected, round: 0 }), /manche a changé/);
  await assert.rejects(rpc(host, 'answer', { answer: 9 }), /pas valide/);
  const answered = await rpc(host, 'answer', { answer: expected });
  assert.equal(answered.results.length, 0);
  assert.equal(answered.challenge.expected, undefined);
  await assert.rejects(rpc(host, 'answer', { answer: expected }), /déjà enregistrée/);
  await assert.rejects(rpc(host, 'finish'), /autres joueurs/);
  await rpc(friend, 'answer', { answer: expected });
  await assert.rejects(rpc(screen, 'finish'), /spectateur/);
  room = await rpc(friend, 'finish');
  assert.equal(room.status, 'results');
  assert.equal(room.challenge.expected, expected);
  assert.deepEqual(room.players.map(p => p.score), [3, 3]);
  assert.deepEqual((await rpc(host, 'finish')).players.map(p => p.score), [3, 3]);
});

test('une partie complète termine après quatre manches avec les scores attendus', async () => {
  for (let index = 1; index < 4; index++) {
    room = await rpc(host, 'start');
    await openWindow();
    const expected = (await admin('select challenge from public.ep_rooms where id = $1', [room.id])).rows[0].challenge.expected;
    if (room.challenge.type === 'memory') {
      assert.equal((await rpc(friend, 'get')).challenge.sequence, undefined);
      await assert.rejects(rpc(friend, 'answer', { answer: [0, 1, 2, 3, '4'] }), /pas valide/);
    }
    await rpc(host, 'answer', { answer: expected });
    await rpc(friend, 'answer', { answer: expected });
    room = await rpc(host, 'finish');
    assert.deepEqual(room.players.map(p => p.score), [(index + 1) * 3, (index + 1) * 3]);
  }
  assert.equal(room.status, 'finished');
  await assert.rejects(rpc(host, 'start'), /Impossible/);
});

test('une expiration de manche donne zéro aux absents et ne bloque pas le jeu', async () => {
  room = await rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: ['quiz'] });
  await rpc(friend, 'join', { name: 'Léa', avatar: 1 });
  room = await rpc(host, 'start');
  await admin("update public.ep_rooms set starts_at = clock_timestamp() - interval '30 seconds', ends_at = clock_timestamp() - interval '1 second' where id = $1", [room.id]);
  await assert.rejects(rpc(host, 'answer', { answer: 1 }), /moment/);
  room = await rpc(friend, 'finish');
  assert.equal(room.status, 'results');
  assert.deepEqual(room.players.map(p => p.score), [0, 0]);
});

test('les huit places sont réservées aux joueurs et les spectateurs n’occupent pas de place', async () => {
  room = await rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4 });
  await rpc(screen, 'join', { name: 'Écran', avatar: 0, spectator: true });
  for (let i = 10; i < 17; i++) await rpc(`00000000-0000-0000-0000-0000000000${i}`, 'join', { name: `Pote ${i}`, avatar: i % 8 });
  assert.equal((await rpc(host, 'get')).players.length, 8);
  await assert.rejects(rpc(friend, 'join', { name: 'Un de plus', avatar: 1 }), /complète/);
});

test('les règles SQL et les règles de la démo donnent les mêmes points', async () => {
  for (const challenge of DEMO_CHALLENGES) {
    if (challenge.type === 'majority') continue;
    const answers = GAMES[challenge.type].review ? [challenge.expected[0], challenge.expected[0].toUpperCase() + ' !', 'aucune idee'] : ['memory','order'].includes(challenge.type) ? [[...challenge.expected].reverse(), challenge.expected] : [0, 1, challenge.expected, challenge.expected * 1.05, challenge.expected * 1.2, challenge.expected * 1.51];
    for (const answer of answers) {
      const result = await admin('select public.ep_points($1::jsonb, $2::jsonb) as points', [JSON.stringify(challenge), JSON.stringify(answer)]);
      assert.equal(result.rows[0].points, pointsFor(challenge, answer));
    }
  }
});

test('les 12 jeux acceptent leurs réponses, protègent leurs secrets et résolvent le plateau', async () => {
  for (const challenge of DEMO_CHALLENGES) {
    await admin("update public.ep_rooms set expires_at=clock_timestamp()-interval '1 day'");
    room = await rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: [challenge.type] });
    await rpc(friend, 'join', { name: 'Léa', avatar: 1 });
    await admin('update public.ep_rooms set deck=$1::jsonb where id=$2', [JSON.stringify(Array(4).fill(challenge)), room.id]);
    room = await rpc(host, 'start');
    assert.equal(room.challenge.expected, undefined);
    assert.equal(room.deck, undefined);
    await openWindow();
    const answer = GAMES[challenge.type].review ? challenge.expected[0] : challenge.type === 'majority' ? 0 : challenge.expected;
    await rpc(host, 'answer', { answer });
    await rpc(friend, 'answer', { answer });
    room = await rpc(host, 'finish');
    if (GAMES[challenge.type].review) {
      assert.equal(room.status, 'review');
      assert.equal(room.players[0].score, 0, 'aucun déplacement avant validation');
      await assert.rejects(rpc(friend, 'review', { player_id: host, points: 3 }), /hôte/);
      await assert.rejects(rpc(friend, 'resolve'), /hôte/);
      await assert.rejects(rpc(host, 'review', { player_id: friend, points: 99 }), /pas valide/);
      await assert.rejects(rpc(host, 'review', { player_id: friend, points: 1.5 }), /pas valide/);
      await rpc(host, 'review', { player_id: friend, points: 0 });
      room = await rpc(host, 'resolve');
      assert.equal(room.players.find(p => p.id === friend).score, 0);
    }
    assert.equal(room.status, 'results');
    assert.equal(room.players.find(p => p.id === host).score, challenge.reward || 3, challenge.type);
    assert.equal(room.board_log.length, 2);
    const again = await rpc(host, 'finish');
    assert.deepEqual(again.players, room.players);
  }
});

test('le vote attribue les majorités, égalités et absences correctement', async () => {
  await admin("update public.ep_rooms set expires_at=clock_timestamp()-interval '1 day'");
  room = await rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: ['majority'] });
  await rpc(friend, 'join', { name: 'Léa', avatar: 1 });
  await rpc(outsider, 'join', { name: 'Sam', avatar: 2 });
  for (const answers of [[0,0,1],[0,1,2],[0,null,null]]) {
    room = await rpc(host, 'start');
    await openWindow();
    const ids = [host,friend,outsider];
    for (let i=0;i<ids.length;i++) if (answers[i] != null) await rpc(ids[i], 'answer', { answer: answers[i] });
    await admin("update public.ep_rooms set ends_at=clock_timestamp()-interval '1 second' where id=$1", [room.id]);
    room = await rpc(host, 'finish');
    for (let i=0;i<ids.length;i++) assert.equal(room.results.find(r=>r.id===ids[i])?.points || 0, pointsFor(room.challenge,answers[i],answers));
  }
});

test('risque, pièces, étoiles et cases : la BDD et la démo restent cohérentes', async () => {
  for (let position = 0; position < 25; position++) for (let points = 0; points < 4; points++) for (const stance of ['chill','bold']) {
    const player = { id: host, position, coins: position % 9, stars: 1, score: 4, shield: position % 2 === 1, stance };
    const round = position % 6 + 1;
    const actual = (await admin('select public.ep_board($1::jsonb,$2,$3) as result', [JSON.stringify(player), points, round])).rows[0].result;
    assert.deepEqual(actual, resolveBoard(player, points, round));
  }
});

test('sélections et stratégies invalides sont refusées, catalogue et anciennes fonctions sont privés', async () => {
  await admin("update public.ep_rooms set expires_at=clock_timestamp()-interval '1 day'");
  await assert.rejects(rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: [] }), /mini-jeu/);
  await assert.rejects(rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: ['quiz','quiz'] }), /doublon/);
  await assert.rejects(rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 4, games: ['inconnu'] }), /mini-jeu/);
  room = await rpc(host, 'create', { name: 'Louis', avatar: 0, rounds: 12 });
  await rpc(friend, 'join', { name: 'Léa', avatar: 1 });
  const deck = (await admin('select deck from public.ep_rooms where id=$1',[room.id])).rows[0].deck;
  assert.equal(new Set(deck.map(c => c.type)).size, 12);
  room = await rpc(host, 'stance', { stance: 'bold' });
  assert.equal(room.players.find(p => p.id === host).stance, 'bold');
  room = await rpc(host, 'start');
  await assert.rejects(rpc(host, 'stance', { stance: 'chill' }), /avant/);
  await assert.rejects(db.query('select * from public.ep_catalog'), /permission denied/);
  await assert.rejects(db.query("select public.ep_action_v1('get',$1,'{}')",[room.code]), /permission denied/);
});


test('le carnet final conserve questions, réponses et corrections, et reste privé pendant le jeu', async () => {
  await admin("update public.ep_rooms set expires_at=clock_timestamp()-interval '1 day'");
  room=await rpc(host,'create',{name:'Louis',avatar:0,rounds:4,games:['culture']});
  await rpc(friend,'join',{name:'Léa',avatar:1});
  await rpc(screen,'join',{name:'Écran',avatar:0,spectator:true});
  const questions=[];
  for(let round=1;round<=4;round++) {
    room=await rpc(host,'start');
    questions.push(room.challenge.prompt);
    assert.deepEqual(room.history,[]);
    assert.deepEqual((await rpc(screen,'get')).history,[]);
    assert.equal(room.challenge.expected,undefined);
    await openWindow();
    await rpc(host,'answer',{answer:'Ma proposition '+round});
    if(round!==2) await rpc(friend,'answer',{answer:'La proposition de Léa '+round});
    await admin("update public.ep_rooms set ends_at=clock_timestamp()-interval '1 second' where id=$1",[room.id]);
    room=await rpc(host,'finish');
    assert.equal(room.status,'review');
    assert.deepEqual(room.history,[]);
    await rpc(host,'review',{player_id:host,points:1});
    room=await rpc(host,'resolve');
    if(round<4) assert.deepEqual(room.history,[]);
  }
  assert.equal(room.status,'finished');
  assert.deepEqual(room.history.map(h=>h.round),[1,2,3,4]);
  assert.deepEqual(room.history.map(h=>h.challenge.prompt),questions);
  for(const entry of room.history) {
    assert.ok(entry.challenge.expected);
    assert.equal(entry.results.find(r=>r.id===host).answer,'Ma proposition '+entry.round);
    assert.equal(entry.results.find(r=>r.id===host).points,1);
  }
  assert.equal(room.history[1].results.find(r=>r.id===friend),undefined);
  assert.deepEqual((await rpc(screen,'get')).history,room.history);
  assert.deepEqual((await rpc(host,'resolve')).history,room.history);
  await assert.rejects(rpc(outsider,'get'),/Rejoins/);
  await assert.rejects(db.query('select * from public.ep_rounds'),/permission denied/);
  const history=structuredClone(room.history);
  await admin('delete from public.ep_rounds where room_id=$1',[room.id]);
  await db.exec(await readFile(new URL('../supabase/004_answer_history.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/005_explanations.sql',import.meta.url),'utf8'));
  assert.deepEqual((await rpc(host,'get')).history,history,'les parties existantes sont reconstituées');
});


test('les explications sont masquées pendant le jeu et ajoutées aux anciens résultats',async()=>{
  await admin("update public.ep_rooms set expires_at=clock_timestamp()-interval '1 day'");
  room=await rpc(host,'create',{name:'Louis',avatar:0,rounds:4,games:['odd']});
  await rpc(friend,'join',{name:'Léa',avatar:1});
  await rpc(screen,'join',{name:'Écran',avatar:0,spectator:true});
  const question=(await admin("select challenge from public.ep_catalog where id='odd-6'")).rows[0].challenge;
  const oldQuestion={...question};delete oldQuestion.explanation;
  await admin('update public.ep_rooms set deck=$1::jsonb where id=$2',[JSON.stringify(Array(4).fill(oldQuestion)),room.id]);
  for(let round=1;round<=4;round++){
    room=await rpc(host,'start');
    assert.equal(room.challenge.explanation,undefined);
    assert.equal((await rpc(screen,'get')).challenge.explanation,undefined);
    await openWindow();
    await rpc(host,'answer',{answer:0});await rpc(friend,'answer',{answer:3});
    room=await rpc(host,'finish');
    assert.equal(room.challenge.explanation,question.explanation,'ancienne question enrichie depuis le catalogue');
  }
  assert.equal(room.status,'finished');
  assert.ok(room.history.every(h=>h.challenge.explanation===question.explanation));
  await assert.rejects(db.query('select public.ep_explained($1::jsonb)',[JSON.stringify(question)]),/permission denied/);
  await db.exec('reset role');
  await db.exec(await readFile(new URL('../supabase/005_explanations.sql',import.meta.url),'utf8'));
  assert.ok((await rpc(host,'get')).history.every(h=>h.challenge.explanation===question.explanation));
});
