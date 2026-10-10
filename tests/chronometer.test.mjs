import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

test('le chrono aveugle ne donne aucun repère périodique au joueur ou au spectateur',async()=>{
  const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
  try {
    const {default:MiniGame}=await vite.ssrLoadModule('/src/MiniGame.jsx');
    const start=Date.now();
    const room={challenge:{type:'timing',prompt:'Vise 7 secondes.',target_ms:7000},starts_at:new Date(start).toISOString(),ends_at:new Date(start+35000).toISOString(),submitted:[],players:[],viewer_id:'you'};
    for(const spectator of [false,true]){
      const render=now=>renderToStaticMarkup(React.createElement(MiniGame,{room,now,submit:()=>{},busy:false,spectator}));
      const early=render(start+1000),late=render(start+9000);
      assert.equal(early,late,'le DOM visible reste identique pendant la manche');
      assert.doesNotMatch(early,/countdown|time-track|ticking|answered-count|class="spin/);
      const preparing=render(start-1000);
      assert.doesNotMatch(preparing,/countdown|time-track|<strong>1<\/strong>/);
    }
  } finally {await vite.close();}
});
