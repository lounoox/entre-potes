import React from 'react';
import { ArrowRight, Check, Coins, Shield, Sparkles, Star } from 'lucide-react';
import { formatAnswer, GAMES } from './game';
import { STANCES, TILES, roundEvent } from './board';

export function StancePicker({ room, action, busy }) {
  const me = room.players.find(p => p.id === room.viewer_id);
  if (!me) return null;
  return <section className="stance-picker"><h3>La prochaine manche, tu la joues comment ?</h3><div>{Object.entries(STANCES).map(([id, stance]) => <button key={id} onClick={() => action('stance', { stance: id })} disabled={busy} aria-pressed={me.stance === id} className={me.stance === id ? 'selected' : ''}><strong>{id === 'chill' ? <Shield size={17}/> : <Sparkles size={17}/>} {stance.name}{me.stance === id && <Check size={14}/>}</strong><span>{stance.description}</span></button>)}</div><p>Le choix reste modifiable jusqu’au lancement. Par défaut : tranquille.</p></section>;
}

export function BoardRules({ round = 1 }) {
  const event = roundEvent(round);
  return <details className="board-rules"><summary>La tournée : règles et cases spéciales</summary><p><strong>Gagne le plus d’étoiles.</strong> En cas d’égalité : les pièces, puis les points des mini-jeux départagent. Une égalité parfaite partage la victoire.</p><p>Tu commences avec 3 pièces. Chaque manche rapporte ses points en pièces et fait avancer de 1 + tes points. Un tour complet rapporte 1 étoile et 3 pièces.</p><div className="tile-legend">{[3, 5, 7, 10, 12].map(index => <div key={index}><span style={{ background: TILES[index].color }}>{TILES[index].icon}</span><p><strong>{TILES[index].name}</strong>{TILES[index].description}</p></div>)}</div><p>Un raccourci ne déclenche pas la case d’arrivée. Toutes les 3 manches, un événement est annoncé avant de jouer.</p><p className="next-event"><Sparkles size={16}/><span><strong>{event.name}</strong>{event.description}</span></p></details>;
}

export function BoardRecap({ room }) {
  if (!room.board_log?.length) return null;
  return <div className="board-recap"><h3>Ce qui s’est passé sur le plateau</h3>{room.board_log.map(log => <div key={log.id}><strong>{room.players.find(p => p.id === log.id)?.name}<small>Case {log.from} → {log.to}</small></strong><p>{log.notes.join(' · ')}</p><span><Coins size={13}/>{log.coins >= 0 ? '+' : ''}{log.coins} {log.stars > 0 && <><Star size={13}/>+{log.stars}</>}</span></div>)}</div>;
}

export function ReviewPanel({ room, action, busy, host }) {
  const max = room.challenge.reward || 3;
  return <section className="results-card review-panel"><span className="eyebrow">LA BANDE FAIT LES COMPTES</span><h2>On accepte cette réponse ?</h2><p>{room.challenge.prompt}</p><div className="review-answer"><strong>{room.challenge.type === 'petitbac' ? 'Quelques réponses possibles' : 'Réponse attendue'}</strong><span>{room.challenge.expected.slice(0, room.challenge.type === 'petitbac' ? 5 : 2).join(' · ')}</span></div><p className="game-hint">{host ? 'Les points sont proposés automatiquement. Accepte les variantes et les autres réponses valables avant de valider.' : 'L’hôte vérifie les variantes. Les pions avanceront après sa validation.'}</p>{room.players.map(player => { const result = room.results.find(r => r.id === player.id); return <div className="review-row" key={player.id}><strong>{player.name}<span>{result ? formatAnswer(room.challenge, result.answer) : 'Pas de réponse'}</span></strong>{host && result?.answer != null ? <select aria-label={`Points pour ${player.name}`} value={result.points} disabled={busy} onChange={e => action('review', { player_id: player.id, points: Number(e.target.value) })}>{Array.from({ length: max + 1 }, (_, i) => <option value={i} key={i}>{i} pt{i > 1 ? 's' : ''}</option>)}</select> : <span>{result?.points || 0} pts</span>}</div>; })}{host && <button className="button primary full" disabled={busy} onClick={() => action('resolve')}>Valider et avancer sur le plateau <ArrowRight size={17}/></button>}</section>;
}

export function GamePicker({ selected, onChange }) {
  return <fieldset className="game-picker"><legend>Le menu de la soirée · {selected.length} jeux</legend><div className="game-presets">{['Tous', 'Culture', 'Adresse'].map(family => <button key={family} type="button" onClick={() => onChange(Object.keys(GAMES).filter(id => family === 'Tous' || GAMES[id].family === family))}>{family === 'Tous' ? 'Le grand mélange' : family === 'Culture' ? 'Culture & rébus' : 'À l’instinct'}</button>)}</div><div className="game-checkboxes">{Object.entries(GAMES).map(([id, game]) => <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={e => onChange(e.target.checked ? [...selected, id] : selected.filter(x => x !== id))}/><span>{game.name}</span></label>)}</div><p>Les jeux sont mélangés ; on fait le tour de la sélection avant de recommencer.</p></fieldset>;
}
