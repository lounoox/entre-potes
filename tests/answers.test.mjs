import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {DEMO_CHALLENGES,GAMES,formatAnswer} from '../src/game.js';

test('les réponses de tous les jeux se lisent en résultats et au bilan, jamais pendant la manche',async()=>{
  const vite=await createServer({server:{middlewareMode:true,ws:false},appType:'custom'});
  try {
    const {RoundAnswers,AnswerHistory}=await vite.ssrLoadModule('/src/AnswerResults.jsx');
    const players=[{id:'you',name:'Louis',avatar:0},{id:'friend',name:'Léa',avatar:1},{id:'absent',name:'Sam',avatar:2}];
    const history=DEMO_CHALLENGES.map((challenge,index)=>({round:index+1,challenge,results:[{id:'you',answer:GAMES[challenge.type].review?'<Une variante personnelle>':challenge.type==='majority'?0:challenge.expected,points:2},{id:'friend',answer:GAMES[challenge.type].review?challenge.expected[0]:challenge.type==='majority'?1:challenge.expected,points:3}]}));
    for(const entry of history) {
      const room={...entry,status:'results',players,viewer_id:'you'};
      const html=renderToStaticMarkup(React.createElement(RoundAnswers,{room}));
      assert.match(html,/Louis/);assert.match(html,/Léa/);assert.match(html,/Sam/);
      assert.match(html,/Pas de réponse/);assert.match(html,/2 pts/);
      if(GAMES[entry.challenge.type].review) assert.match(html,/&lt;Une variante personnelle&gt;/);
      else assert.ok(html.includes(formatAnswer(entry.challenge,entry.results[0].answer)));
      for(const status of ['playing','review','lobby']) assert.equal(renderToStaticMarkup(React.createElement(RoundAnswers,{room:{...room,status}})),'');
    }
    const room={status:'finished',history,players,viewer_id:'you',round:12};
    const html=renderToStaticMarkup(React.createElement(AnswerHistory,{room}));
    assert.equal((html.match(/class="history-round"/g)||[]).length,12);
    assert.match(html,/Manche 12/);assert.match(html,/Le carnet de la soirée/);
    assert.equal(renderToStaticMarkup(React.createElement(AnswerHistory,{room:{...room,status:'playing'}})),'');
    assert.equal(formatAnswer({type:'majority'},null),'Pas de réponse');
  } finally {await vite.close();}
});
