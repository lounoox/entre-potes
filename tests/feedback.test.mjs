import test from 'node:test';
import assert from 'node:assert/strict';
import {answerFeedback} from '../src/answerFeedback.js';
import {BANK,DEMO} from '../content/catalog.mjs';

test('chaque question et exemple possède une explication cohérente',()=>{
  const all=Object.values(BANK).flat();
  assert.equal(all.length,72);
  for(const challenge of [...all,...Object.values(DEMO)]) assert.ok(typeof challenge.explanation==='string'&&challenge.explanation.length>25);
  assert.match(BANK.odd[5].explanation,/requin est un poisson/);
  assert.match(BANK.odd[5].explanation,/mammifères/);
  assert.match(BANK.estimate[1].explanation,/52 blanches et 36 noires/);
});

test('les points expliquent les écarts, seuils, positions et corrections',()=>{
  const feedback=(challenge,answer,points=0,results=[])=>answerFeedback(challenge,{answer,points},results);
  assert.match(feedback({...BANK.odd[5],type:'odd'},0),/Requin/);
  assert.match(feedback({type:'estimate',expected:100},105,3),/5 %.*5 % près/);
  assert.match(feedback({type:'estimate',expected:100},105.04,2),/5,04 %.*20 % près/);
  assert.match(feedback({type:'size',expected:100},151),/tolérance de 50 %/);
  assert.match(feedback({type:'timing',target_ms:5000},4750,3),/0,25 s trop tôt.*250 ms/);
  assert.match(feedback({type:'timing',target_ms:5000},5251,2),/0,251 s trop tard.*750 ms/);
  assert.match(feedback({type:'timing',target_ms:5000},6501),/tolérance de 1,5 s/);
  assert.match(feedback({type:'memory',expected:[0,1,2,3,4]},[0,5,2,5,4],2),/3 fruits sur 5/);
  assert.match(feedback({type:'order',expected:[0,1,2,3]},[0,1,3,2],2),/5 comparaisons sur 6/);
  assert.match(feedback({type:'majority',options:['a','b','c','d']},1,1,[{answer:0},{answer:0},{answer:1},{answer:null}]),/1 vote sur 3.*minoritaire/);
  assert.match(feedback({type:'majority',options:['a','b','c','d']},1,3,[{answer:0},{answer:1}]),/groupe de tête/);
  const word={type:'culture',expected:['éléphant'],reward:2};
  assert.match(feedback(word,'ÉLÉPHANT!',2),/Réponse reconnue/);
  assert.match(feedback(word,'Une variante',1),/hôte a retenu 1 point/);
  assert.match(feedback(word,'Une variante',0),/pas été acceptée/);
  assert.match(feedback({type:'majority'},null),/Aucune réponse.*0 point/);
});
