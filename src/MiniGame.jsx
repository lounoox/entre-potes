import React, { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Brain, Check, CheckCheck, Eye, RotateCcw, Smartphone, Target, Timer } from 'lucide-react';
import { GAMES, SYMBOLS } from './game';

const ICONS = { brain: Brain, target: Target, eye: Eye, timer: Timer };

function Shape({ shape, x, bottom, height, aspect, color, outline = false }) {
  const width = height * aspect;
  return <g fill={outline ? 'none' : color} stroke={outline ? color : '#384339'} strokeWidth={outline ? 3 : 1.5}>
    {shape === 'ring' ? <circle cx={x} cy={bottom - height / 2} r={height / 2} fill="none" stroke={color} strokeWidth="6"/> : <rect x={x - width / 2} y={bottom - height} width={width} height={height} rx="2"/>}
    {shape === 'backboard' && <rect x={x - width / 6} y={bottom - height * .52} width={width / 3} height={height * .4} fill="none"/>}
    {shape === 'paper' && !outline && <path d={`M ${x - width * .28} ${bottom - height * .7} h ${width * .56} m ${-width * .56} ${height * .15} h ${width * .42}`} fill="none" opacity=".25"/>}
  </g>;
}

export function SizeStage({ challenge, ratio, answer, reveal = false }) {
  const base = Math.min(44, 145 / (4 * challenge.aspect));
  const guessed = answer != null ? answer / challenge.reference_cm : ratio;
  return <div className="size-stage"><svg viewBox="0 0 400 235" role="img" aria-label={reveal ? 'Comparaison de ta proposition et de la vraie taille' : 'Objet de référence à gauche, objet à redimensionner à droite'}>
    <path d="M12 188H388" stroke="#9ba78d" strokeWidth="1"/>
    <Shape shape={challenge.reference_shape} x={100} bottom={188} height={base} aspect={challenge.reference_aspect} color="#b3cde2"/>
    <Shape shape={challenge.shape} x={285} bottom={188} height={base * guessed} aspect={challenge.aspect} color="#f4a179"/>
    {reveal && <Shape shape={challenge.shape} x={285} bottom={188} height={base * challenge.expected / challenge.reference_cm} aspect={challenge.aspect} color="#658650" outline/>}
    <text x="100" y="207" textAnchor="middle">{challenge.reference}</text><text x="100" y="224" textAnchor="middle" className="size-reference">{challenge.reference_cm} cm</text>
    <text x="285" y="207" textAnchor="middle">{challenge.target}</text><text x="285" y="224" textAnchor="middle" className="size-reference">{reveal ? `${challenge.expected} cm en réalité` : 'À toi d’ajuster'}</text>
  </svg></div>;
}

export default function MiniGame({ room, now, submit, busy, spectator }) {
  const challenge = room.challenge;
  const game = GAMES[challenge.type];
  const [value, setValue] = useState('');
  const [sequence, setSequence] = useState([]);
  const [ratio, setRatio] = useState(1);
  const [timer, setTimer] = useState(false);
  const [stopped, setStopped] = useState(null);
  const timerRef = useRef(null);
  const starts = Date.parse(room.starts_at);
  const remaining = Math.max(0, Math.ceil((Date.parse(room.ends_at) - now) / 1000));
  const preparing = now < starts;
  const memorizing = challenge.type === 'memory' && now < starts + 6000;
  const answered = room.submitted.includes(room.viewer_id);
  const Icon = ICONS[game.icon];
  const blocked = busy || answered || !remaining || preparing || spectator;
  const blind = challenge.type === 'timing';
  return <section className={`play-card ${game.color} ${blind ? 'blind-round' : ''}`}>
    <div className="play-top"><span className="eyebrow"><Icon size={15}/>{game.name}</span>{blind ? <span className="blind-label">SANS REPÈRE</span> : <span className={`countdown ${remaining <= 5 ? 'urgent' : ''}`}><Timer size={15}/>{remaining} s</span>}</div>
    {!blind && <div className="time-track"><div style={{ width: `${Math.min(100, remaining / game.duration * 100)}%` }}/></div>}
    {preparing ? <div className="get-ready"><span>{blind ? 'Prépare ton horloge intérieure…' : 'On se concentre…'}</span>{!blind && <strong>{Math.ceil((starts - now) / 1000)}</strong>}<p>{game.description}</p></div> : <>
      <h2>{challenge.prompt}</h2>
      {spectator ? <div className="spectator-message"><Smartphone size={38}/><h3>{blind ? 'Silence, on compte dans sa tête.' : 'À vous de jouer sur vos téléphones !'}</h3><p>{blind ? 'Cet écran reste immobile jusqu’aux résultats.' : 'Les réponses restent sur les téléphones jusqu’aux résultats.'}</p></div> : answered ? <div className="answer-sent"><span><CheckCheck size={37}/></span><h3>C’est dans la boîte.</h3><p>Ta réponse est enregistrée.<br/>{blind ? 'Garde ton temps secret jusqu’aux résultats.' : 'On attend les autres potes.'}</p></div> : <>
        {['quiz', 'odd', 'majority'].includes(challenge.type) && <>{challenge.type === 'majority' && <p className="game-hint">3 points pour les choix les plus populaires, 1 pour les autres. En cas d’égalité, les groupes en tête gagnent tous.</p>}<div className="quiz-options">{challenge.options.map((option, index) => <button key={option} onClick={() => submit(index)} disabled={blocked}><span>{'ABCD'[index]}</span>{option}<ArrowUpRight size={16}/></button>)}</div></>}
        {game.review && <div className="word-game"><div className="word-meta"><span>{challenge.theme || game.category}</span><span>{challenge.reward || 3} points à gagner</span></div>{challenge.clue && <div className={`word-clue ${challenge.type === 'emoji' ? 'emoji-clue' : ''}`}>{challenge.clue}</div>}{challenge.letter && <div className="letter-card">{challenge.letter}</div>}<form onSubmit={e => { e.preventDefault(); submit(value.trim()); }}><label>Ta réponse<input value={value} onChange={e => setValue(e.target.value)} maxLength={80} required autoComplete="off" placeholder={challenge.type === 'petitbac' ? 'Une idée, vite !' : 'Tu l’as ?'} disabled={blocked}/></label><button className="button ink full" disabled={blocked || !value.trim()}>Je valide <Check size={17}/></button></form><p className="game-hint">L’hôte vérifie les réponses après la manche. Les accents et la ponctuation ne comptent pas.</p></div>}
        {challenge.type === 'estimate' && <form onSubmit={e => { e.preventDefault(); submit(Number(value)); }} className="estimate-form"><label>Ton estimation<div className="number-field"><input value={value} onChange={e => setValue(e.target.value)} type="number" min="0" max="1000000000" step="any" inputMode="decimal" placeholder="À toi de voir…" required disabled={blocked}/><span>{challenge.unit}</span></div></label><p>À 5 % près : 3 points · À 20 % : 2 · À 50 % : 1</p><button className="button ink full" disabled={blocked || value === ''}>Je tente ma chance <ArrowRight size={17}/></button></form>}
        {challenge.type === 'size' && <div className="size-game"><p className="game-hint">La référence bleue ne bouge pas. Fais grandir ou rétrécir la silhouette orange à sa vraie échelle.</p><SizeStage challenge={challenge} ratio={ratio}/><label htmlFor="size-slider">Ajuste la taille</label><input id="size-slider" type="range" min=".25" max="4" step=".01" value={ratio} onChange={e => setRatio(Number(e.target.value))} disabled={blocked} aria-valuetext={`${Math.round(ratio * 100)} % de la référence`}/><div className="range-hints"><span>Plus petit</span><span>Plus grand</span></div><button className="button ink full" disabled={blocked} onClick={() => submit(Number((ratio * challenge.reference_cm).toFixed(3)))}>C’est cette taille ! <Check size={17}/></button></div>}
        {challenge.type === 'order' && <div className="order-game"><p className="game-hint">Touche les propositions dans le bon ordre.</p><ol className="order-slots">{Array.from({ length: 4 }, (_, index) => <li key={index}><span>{index + 1}</span>{sequence[index] == null ? 'À toi de choisir…' : challenge.options[sequence[index]]}</li>)}</ol><div className="order-choices">{challenge.options.map((option, index) => <button key={index} className="button light" onClick={() => setSequence([...sequence, index])} disabled={blocked || sequence.includes(index)}>{option}</button>)}</div><div className="memory-actions"><button className="button light" onClick={() => setSequence(sequence.slice(0, -1))} disabled={blocked || !sequence.length}><RotateCcw size={16}/> Corriger</button><button className="button ink" disabled={blocked || sequence.length !== 4} onClick={() => submit(sequence)}>Valider l’ordre <Check size={17}/></button></div></div>}
        {challenge.type === 'memory' && <div className="memory-game">{memorizing ? <><p>Mémorise la suite. Elle disparaît dans {Math.ceil((starts + 6000 - now) / 1000)} s.</p><div className="memory-sequence">{challenge.sequence?.map((symbol, index) => <span key={index}>{SYMBOLS[symbol]}</span>)}</div></> : <><p>Retape les cinq fruits dans le bon ordre.</p><div className="memory-sequence chosen">{Array.from({ length: 5 }, (_, index) => <span key={index}>{sequence[index] != null ? SYMBOLS[sequence[index]] : <small>{index + 1}</small>}</span>)}</div><div className="fruit-picker">{SYMBOLS.map((symbol, index) => <button key={symbol} onClick={() => setSequence([...sequence, index])} disabled={blocked || sequence.length === 5} aria-label={['Citron', 'Cerise', 'Raisin', 'Kiwi', 'Pastèque', 'Orange'][index]}>{symbol}</button>)}</div><div className="memory-actions"><button className="button light" onClick={() => setSequence(sequence.slice(0, -1))} disabled={blocked || !sequence.length}><RotateCcw size={16}/> Corriger</button><button className="button ink" disabled={blocked || sequence.length !== 5} onClick={() => submit(sequence)}>Valider <Check size={17}/></button></div></>}</div>}
        {blind && <div className="timing-game"><p>Lance ton chrono, compte dans ta tête, puis arrête-le. Aucun indice ne sera affiché pendant l’essai.</p><div className="timer-dial"><Eye size={54} strokeWidth={1.4}/><strong>{timer ? 'Fais confiance à ton instinct.' : `Objectif : ${(challenge.target_ms / 1000).toFixed(2)} s`}</strong></div><button className={`button ${timer ? 'primary' : 'ink'} full`} disabled={blocked || stopped != null} onClick={() => { if (timerRef.current == null) { timerRef.current = performance.now(); setTimer(true); } else { const elapsed = Math.round(performance.now() - timerRef.current); setStopped(elapsed); submit(elapsed); } }}>{timer ? 'Stop !' : 'Lancer mon chrono'}</button>{stopped != null && !answered && <button className="text-button" disabled={busy || !remaining} onClick={() => submit(stopped)}>Réessayer l’envoi</button>}</div>}
      </>}
      {!remaining && !answered && !spectator && <p className="time-over">Manche terminée ! Place aux résultats.</p>}
    </>}
    {!blind && <div className="answered-count"><span>Les potes sont sur le coup.</span><span>{room.submitted.length}/{room.players.length} réponses</span></div>}
  </section>;
}
