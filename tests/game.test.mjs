import test from 'node:test';
import assert from 'node:assert/strict';
import { newDemo, advanceDemo, answerDemo, finishDemo, pointsFor, validateAnswer, resolveDemo, reviewDemo, makeDeck, GAMES, normalizeAnswer } from '../src/game.js';
import { resolveBoard, comparePlayers } from '../src/board.js';

test('une partie de douze manches parcourt tous les jeux, corrige les réponses et termine', () => {
  let room = newDemo('Louis', 2, 12);
  const now = Date.now();
  let score = 0;
  for (let round = 0; round < 12; round++) {
    room = advanceDemo(room, now);
    const answer = GAMES[room.challenge.type].review ? room.challenge.expected[0] : room.challenge.type === 'majority' ? 1 : room.challenge.expected;
    room = answerDemo(room, answer, now + 10000);
    room = finishDemo(room, now + 11000);
    if (room.status === 'review') {
      assert.equal(room.players[0].score, score);
      room = reviewDemo(room, 'you', room.challenge.reward || 3);
      room = resolveDemo(room);
    }
    score += room.results.find(r => r.id === 'you').points;
    assert.equal(room.players[0].score, score);
    assert.equal(room.board_log.length, 4);
    assert.deepEqual(finishDemo(room).players, room.players);
    assert.deepEqual(resolveDemo(room).players, room.players);
  }
  assert.equal(room.status, 'finished');
});

test('la sélection est respectée sans répétition de type avant épuisement', () => {
  const all = Object.keys(GAMES);
  assert.equal(new Set(makeDeck(all,12).map(c=>c.type)).size,12);
  const sequence = makeDeck(['quiz','timing','size'],12);
  for(let i=0;i<12;i+=3) assert.equal(new Set(sequence.slice(i,i+3).map(c=>c.type)).size,3);
  for(let i=1;i<sequence.length;i++) assert.notEqual(sequence[i].type,sequence[i-1].type);
  assert.throws(()=>makeDeck([],4)); assert.throws(()=>makeDeck(['quiz','quiz'],4));
});

test('les limites, doubles réponses, types et permutations invalides sont rejetés', () => {
  const now = Date.now(); const room = advanceDemo(newDemo('Toi',0,4,['quiz']),now);
  assert.throws(()=>answerDemo(room,1,now),/moment/);
  assert.throws(()=>answerDemo(room,1,now+50000),/moment/);
  assert.throws(()=>answerDemo(room,9,now+5000),/valide/);
  assert.throws(()=>finishDemo(room,now+5000),/autres joueurs/);
  const answered = answerDemo(room,1,now+5000);
  assert.throws(()=>answerDemo(answered,1,now+6000),/déjà/);
  assert.equal(validateAnswer({type:'order'},[0,0,2,3]),false);
  assert.equal(validateAnswer({type:'order'},[3,2,1,0]),true);
  assert.equal(validateAnswer({type:'culture'},'  '),false);
  assert.equal(validateAnswer({type:'culture'},'a'.repeat(81)),false);
  assert.equal(validateAnswer({type:'size'},Infinity),false);
});

test('les seuils, variantes de texte, objectifs de chrono et majorités sont justes',()=>{
  assert.equal(pointsFor({type:'estimate',expected:100},105),3);
  assert.equal(pointsFor({type:'estimate',expected:100},120),2);
  assert.equal(pointsFor({type:'estimate',expected:100},150),1);
  assert.equal(pointsFor({type:'size',expected:29.7},29.7),3);
  assert.equal(pointsFor({type:'timing',target_ms:9000},9250),3);
  assert.equal(pointsFor({type:'timing',target_ms:9000},9750),2);
  assert.equal(pointsFor({type:'timing',target_ms:9000},10500),1);
  assert.equal(pointsFor({type:'timing',target_ms:9000},10501),0);
  assert.equal(pointsFor({type:'culture',expected:['éléphant'],reward:2},' ÉLÉPHANT ! '),2);
  assert.equal(normalizeAnswer('Cœur de l’été'),'coeurdelete');
  const vote={type:'majority',options:['a','b','c','d']};
  assert.equal(pointsFor(vote,1,[1,1,2]),3); assert.equal(pointsFor(vote,2,[1,1,2]),1);
  assert.equal(pointsFor(vote,2,[1,2]),3);
});

test('les cases produisent de vrais effets, sans cascade ni pièces négatives',()=>{
  const p={id:'you',position:6,coins:3,stars:0,score:0,shield:false,stance:'chill'};
  let result=resolveBoard(p,3,1).player; assert.equal(result.position,10); assert.equal(result.stars,1); assert.equal(result.coins,0);
  result=resolveBoard({...p,coins:9},0,1).player; assert.equal(result.position,10); assert.equal(result.stars,0,'le raccourci ne déclenche pas le comptoir');
  result=resolveBoard({...p,position:24},0,1).player; assert.equal(result.stars,1); assert.equal(result.position,0); assert.equal(result.coins,6);
  result=resolveBoard({...p,position:11,shield:true},0,1).player; assert.equal(result.coins,3); assert.equal(result.shield,false);
  result=resolveBoard({...p,position:11,coins:0},0,1).player; assert.equal(result.coins,0);
  result=resolveBoard({...p,position:0,stance:'bold'},2,1).player; assert.equal(result.position,5); assert.equal(result.shield,true); assert.equal(result.coins,6);
  assert.ok(comparePlayers({stars:2,coins:0,score:0},{stars:1,coins:30,score:30})<0);
});
