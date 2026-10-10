import {GAMES,normalizeAnswer,formatAnswer} from './game.js';
const number=(value,precision=2)=>Number(value.toFixed(precision)).toLocaleString('fr-BE');

export function answerFeedback(challenge,result,results=[]) {
  if(result?.answer==null) return 'Aucune réponse envoyée : 0 point.';
  const answer=result.answer;
  if(['quiz','odd'].includes(challenge.type)) return answer===challenge.expected ? 'Bonne réponse : 3 points.' : 'Il fallait choisir « '+formatAnswer(challenge,challenge.expected)+' » : 0 point.';
  if(['estimate','size'].includes(challenge.type)) {
    const gap=Math.abs(answer-challenge.expected)/Math.max(1,challenge.expected)*100;
    const reason=gap<=5+1e-10?'à 5 % près':gap<=20+1e-10?'à 20 % près':gap<=50+1e-10?'à 50 % près':'au-delà de la tolérance de 50 %';
    return 'Écart de '+number(gap)+' % par rapport à la bonne valeur : '+reason+'.';
  }
  if(challenge.type==='timing') {
    const delta=answer-(challenge.target_ms||5000);
    return delta===0?'Pile sur l’objectif !':number(Math.abs(delta)/1000,3)+' s '+(delta<0?'trop tôt':'trop tard')+'. '+(Math.abs(delta)<=250?'À 250 ms près.':Math.abs(delta)<=750?'À 750 ms près.':Math.abs(delta)<=1500?'À 1 500 ms près.':'Au-delà de la tolérance de 1,5 s.');
  }
  if(challenge.type==='memory') {
    const matches=challenge.expected.filter((symbol,index)=>answer[index]===symbol).length;
    return matches+' fruit'+(matches===1?'':'s')+' sur 5 à la bonne position.';
  }
  if(challenge.type==='order') {
    let pairs=0;
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) if(answer.indexOf(challenge.expected[i])<answer.indexOf(challenge.expected[j])) pairs++;
    return pairs+' comparaisons sur 6 dans le bon ordre. On compte les paires bien placées.';
  }
  if(challenge.type==='majority') {
    const counts=challenge.options.map((_,i)=>results.filter(r=>r.answer===i).length);
    const total=results.filter(r=>r.answer!=null).length;
    return counts[answer]+' vote'+(counts[answer]===1?'':'s')+' sur '+total+' pour ce choix : '+(counts[answer]===Math.max(...counts)?'dans le groupe de tête.':'un choix minoritaire.');
  }
  if(GAMES[challenge.type]?.review) {
    const recognized=challenge.expected.some(text=>normalizeAnswer(text)===normalizeAnswer(answer));
    const max=challenge.reward||3;
    if(recognized&&result.points===max) return 'Réponse reconnue ; les accents et la ponctuation ne comptent pas.';
    return result.points>0?'L’hôte a retenu '+result.points+' point'+(result.points===1?'':'s')+' lors de la correction.':'Cette réponse n’a pas été acceptée lors de la correction.';
  }
  return '';
}
