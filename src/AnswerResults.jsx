import React from 'react';
import { AVATARS, GAMES, formatAnswer } from './game';
import { answerFeedback } from './answerFeedback';

export function AnswerList({ challenge, results, players, viewerId }) {
  return <div className="answer-list">{players.map(player => {
    const result = results.find(entry => entry.id === player.id);
    const missing = result?.answer == null;
    const me = player.id === viewerId;
    return <div className={'answer-row ' + (me ? 'is-me' : '')} key={player.id}>
      <span className="answer-avatar" style={{ background: AVATARS[player.avatar % AVATARS.length] }} aria-hidden="true">{player.name.slice(0, 1).toUpperCase()}</span>
      <div className="answer-player"><strong>{player.name}{me && <small>toi</small>}</strong><p className={missing ? 'missing-answer' : ''}>{missing ? 'Pas de réponse' : formatAnswer(challenge, result.answer)}</p><p className="answer-feedback">{answerFeedback(challenge,result,results)}</p></div>
      <span className="answer-points">{result?.points || 0} pt{result?.points === 1 ? '' : 's'}</span>
    </div>;
  })}</div>;
}

function Question({ challenge }) {
  return <div className="answer-question"><p>{challenge.prompt}</p>{challenge.clue && <p className="answer-clue">{challenge.clue}</p>}<span>{challenge.type === 'majority' ? 'Les choix de la bande' : challenge.type === 'petitbac' ? 'Exemple accepté' : 'Réponse attendue'}<strong>{challenge.type === 'majority' ? 'Le groupe en tête gagne.' : formatAnswer(challenge, challenge.expected)}</strong></span></div>;
}

export function RoundAnswers({ room }) {
  if (room.status !== 'results') return null;
  return <section className="round-answers" aria-label="Les réponses de la manche"><h3>Vous aviez répondu…</h3><p className="answer-prompt">{room.challenge.prompt}</p>{room.challenge.clue && <p className="answer-clue">{room.challenge.clue}</p>}<Explanation challenge={room.challenge}/><AnswerList challenge={room.challenge} results={room.results} players={room.players} viewerId={room.viewer_id}/></section>;
}

export function AnswerHistory({ room }) {
  if (room.status !== 'finished') return null;
  const rounds = room.history?.length ? room.history : [{ round: room.round, challenge: room.challenge, results: room.results }];
  return <section className="answer-history" aria-label="Toutes les réponses de la partie"><h3>Le carnet de la soirée</h3><p>Vos réponses, celles des potes et les points de chaque manche.</p><div>{rounds.map((entry, index) => <details className="history-round" key={entry.round} open={index === rounds.length - 1}>
    <summary><span>Manche {entry.round}</span><strong>{GAMES[entry.challenge.type]?.name || 'Mini-jeu'}</strong></summary>
    <Question challenge={entry.challenge}/><Explanation challenge={entry.challenge}/><AnswerList challenge={entry.challenge} results={entry.results} players={room.players} viewerId={room.viewer_id}/>
  </details>)}</div></section>;
}

export function Explanation({challenge}) {
  if(!challenge.explanation) return null;
  return <aside className="answer-explanation" aria-label="Explication de la réponse"><strong>Pourquoi ?</strong><p>{challenge.explanation}</p></aside>;
}
