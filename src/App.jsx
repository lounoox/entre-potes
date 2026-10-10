import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowRight, ArrowUpRight, Brain, Check, CheckCheck, Copy, Dice5, Eye, Flag, Gamepad2, Heart, HelpCircle, LoaderCircle, Maximize, Monitor, Plus, RotateCcw, Smartphone, Sparkles, Target, Timer, Trophy, Users, X } from 'lucide-react';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import { AVATARS, GAMES, formatAnswer } from './game';
import MiniGame, { SizeStage } from './MiniGame';
import { RoundAnswers, AnswerHistory } from './AnswerResults';
import { TILES, comparePlayers, roundEvent } from './board';
import { StancePicker, BoardRules, BoardRecap, ReviewPanel, GamePicker } from './PartyExtras';
import { call, configured, watch } from './api';
import './style.css';
import './expansion.css';
import './answers.css';

const ICONS = { brain: Brain, target: Target, eye: Eye, timer: Timer };
const EXAMPLE_PLAYERS = [{ id: 'a', avatar: 0, score: 3 }, { id: 'b', avatar: 1, score: 9 }, { id: 'c', avatar: 2, score: 14 }, { id: 'd', avatar: 3, score: 20 }];

function Face({ avatar = 0, size = 44, className = '' }) {
  return <svg className={`face ${className}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill={AVATARS[avatar % AVATARS.length]} stroke="#30352c" strokeWidth="1.5"/><ellipse cx="17" cy="21" rx="2.5" ry={avatar % 3 === 0 ? 4 : 3}/><ellipse cx="31" cy="21" rx="2.5" ry={avatar % 3 === 0 ? 4 : 3}/>{avatar % 2 === 0 ? <path d="M17 30 Q24 39 31 30" fill="none" stroke="#30352c" strokeWidth="2.5" strokeLinecap="round"/> : <path d="M18 30 Q24 35 31 27" fill="none" stroke="#30352c" strokeWidth="2.5" strokeLinecap="round"/>}<ellipse cx="12" cy="28" rx="3" ry="1.5" fill="#f48070" opacity=".5"/><ellipse cx="36" cy="28" rx="3" ry="1.5" fill="#f48070" opacity=".5"/></svg>;
}

function Board({ players = EXAMPLE_PLAYERS, hero = false }) {
  const coords = Array.from({ length: 25 }, (_, index) => {
    const row = Math.floor(index / 5);
    return { x: 47 + (row % 2 ? 4 - index % 5 : index % 5) * 79, y: 310 - row * 66 };
  });
  const path = coords.map((p, index) => `${index ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  return <div className={`board ${hero ? 'hero-board' : ''}`}><div className="board-label"><span><span className="live-dot"/> LA TOURNÉE DES POTES</span><Flag size={15}/></div><svg viewBox="0 0 410 350" role="img" aria-label="Plateau en boucle de 25 cases : coffres, boucliers, raccourcis, pièges et comptoirs des étoiles."><path d={path} stroke="#b9c9b2" strokeWidth="12" fill="none" strokeLinejoin="round"/>{coords.map((p, index) => <g key={index}><rect x={p.x - 24} y={p.y - 24} width="48" height="48" rx="15" fill={TILES[index]?.color || (index === 0 ? '#c2d39e' : '#faf9ee')} stroke="#72856b" strokeWidth="1"/><text x={p.x} y={p.y + 5} textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize={TILES[index] ? 21 : 12} fill="#55614b">{TILES[index]?.icon || (index === 0 ? '↻' : index)}</text></g>)}{players.map((player, i) => {
    const p = coords[(player.position ?? player.score) % 25];
    const overlaps = players.filter(x => (x.position ?? x.score) % 25 === (player.position ?? player.score) % 25);
    const offset = (overlaps.findIndex(x => x.id === player.id) - (overlaps.length - 1) / 2) * 11;
    return <g key={player.id} transform={`translate(${p.x - 21 + offset}, ${p.y - 33 - (i % 2) * 3})`}><ellipse cx="22" cy="49" rx="17" ry="5" fill="#384b3433"/><path d="M14 29 L7 48 Q22 55 37 48 L30 29" fill={AVATARS[player.avatar]} stroke="#30352c" strokeWidth="1.5"/><Face avatar={player.avatar} size={44}/></g>;
  })}</svg><div className="board-caption"><span>Un tour = 1 étoile + 3 pièces.</span><strong>Les étoiles font la victoire.</strong></div></div>;
}

function Logo({ onClick }) {
  return <button className="logo" onClick={onClick} aria-label="Entre potes, accueil"><span className="logo-mark"><Dice5 size={27} strokeWidth={2}/></span>entre potes<span className="logo-period">.</span></button>;
}

function Landing({ open, demo, busy }) {
  return <>
    <header className="header shell"><Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}/><nav aria-label="Navigation principale"><a href="#comment">Le concept</a><a href="#jeux">Les mini-jeux</a><button className="button small outline" onClick={() => open('join')}>Rejoindre <ArrowUpRight size={16}/></button></nav></header>
    <main>
      <section className="hero shell">
        <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> LES BONS POTES FONT LES BONNES PARTIES</span><h1>La soirée<br/>se joue <span className="highlight">ici<svg viewBox="0 0 180 14" aria-hidden="true"><path d="M3 10 Q80 -2 176 7" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/></svg></span>.</h1><p>Un plateau, des mini-jeux et juste vos téléphones.<br className="desktop-break"/> Réunissez la bande. On s’occupe du reste.</p><div className="hero-actions"><button className="button primary" onClick={() => open('create')}><Plus size={20}/> Créer une partie <ArrowRight size={19}/></button><button className="button light" onClick={() => open('join')}>J’ai un code <ArrowUpRight size={18}/></button></div><div className="hero-meta"><span><Users size={16}/> 2 à 8 potes</span><span><Smartphone size={16}/> Chacun son téléphone</span><span><Check size={16}/> Sans compte à créer</span></div></div>
        <div className="hero-art"><div className="art-note"><Sparkles size={15}/> Attention, amitiés mises à l’épreuve.</div><Board hero/><div className="floating-game"><span className="floating-icon"><Brain size={25}/></span><div><small>PROCHAINE MANCHE</small><strong>Quiz express</strong></div><span className="tag">20 s</span></div><span className="doodle-star star-one">✳</span><span className="doodle-star star-two">✦</span><div className="art-sticker">100 % potes<br/><span>0 téléchargement</span></div></div>
      </section>
      <div className="ticker" aria-hidden="true"><div>UN PEU DE TALENT <span>✳</span> BEAUCOUP DE CHANCE <span>✳</span> UNE BONNE DOSE DE MAUVAISE FOI <span>✳</span> ET SURTOUT, DES POTES <span>✳</span></div></div>
      <section className="how shell section" id="comment"><div className="section-heading"><div><span className="eyebrow">MOINS DE BLABLA, PLUS DE JEU</span><h2>Trois étapes. Et c’est parti.</h2></div><button className="text-button" onClick={demo} disabled={busy}>Essayer la démo <ArrowUpRight size={18}/></button></div><div className="steps"><article><span className="step-number">01</span><div><h3>Rassemble la bande</h3><p>Crée une partie et partage le code.<br/>Un pseudo, un pion, vous y êtes.</p></div></article><article><span className="step-number">02</span><div><h3>Joue ta meilleure carte</h3><p>À chaque manche, un mini-jeu.<br/>Récupère des pièces et avance sur le plateau.</p></div></article><article><span className="step-number">03</span><div><h3>Réclame ta couronne</h3><p>Le plus d’étoiles à la fin l’emporte.<br/>Les autres demanderont une revanche.</p></div></article></div></section>
      <section className="games-section shell section" id="jeux"><div className="section-heading"><div><span className="eyebrow">IL Y EN A POUR TOUS LES TALENTS</span><h2>12 jeux. Zéro soirée identique.</h2></div><span className="hand-note">Culture, adresse, instinct de bande.</span></div><div className="game-grid">{Object.entries(GAMES).map(([id, game]) => { const Icon = ICONS[game.icon]; return <article key={id} className={`game-card ${game.color}`}><div className="game-card-top"><span className="game-category">{game.category}</span><span className="game-time"><Timer size={12}/>{game.duration} s</span></div><div className="game-art"><Icon size={59} strokeWidth={1.5}/>{id === 'quiz' ? <><b className="decoration one">?</b><b className="decoration two">!</b></> : id === 'estimate' ? <><b className="decoration one">≈</b><b className="decoration two">42</b></> : id === 'memory' ? <><b className="decoration one">✧</b><b className="decoration two">✦</b></> : <><b className="decoration one">{id === 'timing' ? '5' : id === 'size' ? '↔' : '✳'}</b><b className="decoration two">{id === 'timing' ? 's' : id === 'order' ? '123' : '?'}</b></>}</div><h3>{game.name}</h3><p>{game.description}</p></article>; })}</div></section>
      <section className="screen-banner shell"><div className="screen-art"><Monitor size={61} strokeWidth={1.5}/><Smartphone size={31} strokeWidth={1.7}/></div><div><span className="eyebrow">VOTRE SOIRÉE, VOTRE FAÇON DE JOUER</span><h2>À portée de pouce.<br className="mobile-break"/> Ou en grand.</h2><p>Tout se joue sur vos téléphones. Une télé à disposition ?<br className="desktop-break"/> Ajoutez un écran spectateur pour suivre le plateau ensemble.</p></div><span className="optional-tag">L’écran est optionnel <Check size={15}/></span></section>
      <section className="last-call shell"><div className="avatar-stack">{[0, 1, 2, 3].map(n => <Face key={n} avatar={n} size={45}/>)}</div><h2>Il manque juste ta bande.</h2><button className="button primary" onClick={() => open('create')}>On lance une partie ? <ArrowRight size={18}/></button><button className="text-button demo-link" onClick={demo} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16}/> : <Gamepad2 size={16}/>} Tester avec des joueurs simulés</button></section>
    </main><footer className="footer shell"><Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}/><span>Fait pour les soirées qui débordent. <Heart size={13}/></span><span>Jouer ensemble. Tout simplement.</span></footer>
  </>;
}

function SetupDialog({ kind, close, onCreate, onJoin, busy, initialCode, error }) {
  const dialog = useRef(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [rounds, setRounds] = useState(8);
  const [games, setGames] = useState(Object.keys(GAMES));
  const [code, setCode] = useState(initialCode || '');
  const create = kind === 'create';
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog className="setup-dialog" ref={dialog} onCancel={close} aria-labelledby="setup-title"><button className="icon-button dialog-close" onClick={close} aria-label="Fermer"><X size={22}/></button><span className="dialog-icon"><Dice5 size={31}/></span><span className="eyebrow">LA BANDE N’ATTEND QUE TOI</span><h2 id="setup-title">{create ? 'C’est toi qui invites.' : 'Garde-moi une place.'}</h2><p>{create ? 'Choisis ton pion. On prépare le plateau.' : 'Un code, un pseudo, et te voilà dans la partie.'}</p><form onSubmit={e => { e.preventDefault(); create ? onCreate({ name: name.trim(), avatar, rounds, games }, !configured) : onJoin({ name: name.trim(), avatar, code: code.trim().toUpperCase() }); }}>
    {!create && <label>Le code de la partie<input className="code-input" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={6} minLength={6} required placeholder="ABC123" autoComplete="off" autoCapitalize="characters"/></label>}
    <label>Ton petit nom<input value={name} onChange={e => setName(e.target.value)} placeholder="Le futur champion" maxLength={16} minLength={2} required autoComplete="nickname"/></label><fieldset><legend>Ton compagnon de jeu</legend><div className="avatar-picker">{AVATARS.map((_, index) => <button key={index} type="button" className={avatar === index ? 'selected' : ''} onClick={() => setAvatar(index)} aria-label={`Pion ${index + 1}`} aria-pressed={avatar === index}><Face avatar={index}/>{avatar === index && <span><Check size={11}/></span>}</button>)}</div></fieldset>
    {create && <fieldset><legend>Combien de manches ?</legend><div className="round-picker">{[4, 8, 12].map(n => <button key={n} type="button" className={rounds === n ? 'selected' : ''} aria-pressed={rounds === n} onClick={() => setRounds(n)}>{n} manches<small>{n === 4 ? 'La petite partie' : n === 8 ? 'Le bon équilibre' : 'On a la soirée'}</small></button>)}</div></fieldset>}
    {create && <GamePicker selected={games} onChange={setGames}/>}
    {!configured && <p className="notice"><HelpCircle size={18}/><span>{create ? 'Pour le moment, essaie le jeu avec trois potes simulés. Les salons entre téléphones seront disponibles après la connexion à la base de données.' : 'Les salons entre téléphones attendent la connexion à la base de données. La démo est déjà jouable depuis l’accueil.'}</span></p>}
    {error && <p className="inline-error" role="alert">{error}</p>}
    <button className="button primary full" disabled={busy || (create && !games.length) || (!create && !configured)}>{busy ? <LoaderCircle className="spin" size={19}/> : <ArrowRight size={19}/>} {create ? configured ? 'Créer ma partie' : 'Lancer ma partie démo' : 'Rejoindre la bande'}</button>
  </form></dialog>;
}

function Ranking({ room, compact = false }) {
  const players = [...room.players].sort(comparePlayers);
  return <div className={`ranking ${compact ? 'compact' : ''}`}>{players.map((player, index) => <div key={player.id} className={`ranking-row ${player.id === room.viewer_id ? 'is-me' : ''}`}><span className="rank">{index === 0 && room.status !== 'lobby' ? <Trophy size={17}/> : index + 1}</span><Face avatar={player.avatar} size={compact ? 34 : 42}/><span className="player-name">{player.name}{player.id === room.viewer_id && <small>toi</small>}{player.id === room.host_id && <span className="host-tag">hôte</span>}</span><strong className="rank-treasure"><span aria-label={`${player.stars || 0} étoiles`}>★ {player.stars || 0}</span><small>● {player.coins ?? 3} · {player.score} pts</small></strong>{['results', 'finished'].includes(room.status) && <span className="points-gained">+{room.results.find(r => r.id === player.id)?.points || 0}</span>}</div>)}</div>;
}

function Room({ room, demo, screen, busy, now, action, leave, notify }) {
  const host = room.host_id === room.viewer_id && !screen;
  const finished = room.status === 'finished';
  const leader = [...room.players].sort(comparePlayers)[0];
  const winners = room.players.filter(p => comparePlayers(p, leader) === 0);
  const event = roundEvent(room.round || 1);
  const shareUrl = new URL(window.location.href);
  shareUrl.search = demo ? '?demo=1&screen=1' : `?room=${room.code}&screen=1`;
  const copy = async () => {
    const link = new URL(window.location.href); link.search = `?room=${room.code}`;
    try { await navigator.clipboard.writeText(link.href); notify('Lien d’invitation copié !'); }
    catch { notify(`Le code à partager : ${room.code}`); }
  };
  return <div className={`room-page ${screen ? 'screen-mode' : ''}`}><header className="header shell"><Logo onClick={leave}/><div className="room-header-actions">{demo && <span className="demo-badge">DÉMO · JOUEURS SIMULÉS</span>}{screen ? <button className="button small outline" onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { notify('Le plein écran n’est pas disponible dans ce navigateur.'); } }}><Maximize size={16}/><span>Plein écran</span></button> : <button className="icon-button" onClick={leave} aria-label="Retour à l’accueil"><X size={22}/></button>}</div></header><main className="shell room-main">
    <div className="room-title"><div><span className="eyebrow">{screen ? 'ÉCRAN SPECTATEUR' : room.status === 'lobby' ? 'LE SALON DES POTES' : finished ? 'ÇA MÉRITE UNE REVANCHE' : `MANCHE ${room.round} SUR ${room.total_rounds}`}</span><h1>{room.status === 'lobby' ? 'La bande se rassemble.' : finished ? 'Et la couronne revient à…' : room.status === 'review' ? 'Le tribunal des potes.' : room.status === 'results' ? 'Le plateau s’anime.' : 'À toi de jouer !'}</h1></div><div className="room-code"><span>CODE DE LA PARTIE</span><strong>{room.code}</strong>{!demo && <button className="icon-button" onClick={copy} aria-label="Copier le lien d’invitation"><Copy size={17}/></button>}</div></div>
    <div className="room-layout"><div className="room-primary">
      {room.status === 'lobby' && <section className="lobby-card"><div className="lobby-top"><h2><Users size={20}/> Les potes <span>{room.players.length}/8</span></h2><span className="tag">{room.total_rounds} manches</span></div><div className="lobby-players">{room.players.map(player => <div key={player.id}><Face avatar={player.avatar} size={64}/><strong>{player.name}</strong><small>{player.id === room.host_id ? 'L’hôte de la soirée' : demo ? 'Pote simulé' : 'Prêt à jouer'}</small></div>)}{room.players.length < 8 && !demo && <div className="empty-player"><span><Plus size={25}/></span><strong>Une place libre</strong><small>Partage le code</small></div>}</div><div className="lobby-rules"><Sparkles size={20}/><p><strong>Le principe est simple.</strong> Gagne des pièces, avance, déjoue les pièges et transforme 6 pièces en étoile aux comptoirs. Après {room.total_rounds} manches, le plus d’étoiles gagne !</p></div>{!screen && <StancePicker room={room} action={action} busy={busy}/>}<div className="selected-games">{(room.games || []).map(id => <span key={id}>{GAMES[id].name}</span>)}</div>{host ? <button className="button primary full" onClick={() => action('start')} disabled={busy || room.players.length < 2}>{busy ? <LoaderCircle className="spin" size={18}/> : <Gamepad2 size={19}/>} {room.players.length < 2 ? 'On attend au moins un pote…' : 'Tout le monde est là. On joue !'}</button> : <p className="waiting-host"><LoaderCircle className="spin" size={17}/> L’hôte lancera la partie quand tout le monde sera là.</p>}{demo && <p className="demo-explanation">Tu joues pour de vrai. Les trois autres joueurs sont simulés.</p>}</section>}
      {room.status === 'review' && <ReviewPanel room={room} action={action} busy={busy} host={host}/>}
      {room.status === 'playing' && <MiniGame key={`${room.id}-${room.round}`} room={room} now={now} submit={answer => action('answer', { answer })} busy={busy} spectator={screen || room.viewer_role === 'spectator'}/>}
      {['results', 'finished'].includes(room.status) && <section className="results-card">{finished ? <div className="winner"><span className="winner-crown"><Trophy size={46}/></span><div className="winner-faces">{winners.map(player => <Face key={player.id} avatar={player.avatar} size={77}/>)}</div><h2>{winners.map(p => p.name).join(' & ')} !</h2><p>{winners[0].stars || 0} étoiles, {winners[0].coins ?? 3} pièces… et le droit de réclamer la dernière part de pizza.</p></div> : <div className="round-result"><span className="eyebrow">{GAMES[room.challenge.type].name}</span><h2>{room.challenge.type === 'majority' ? 'La bande a voté !' : room.challenge.type === 'timing' ? 'Ton horloge intérieure dit…' : 'La bonne réponse était…'}</h2><strong className="correct-answer">{room.challenge.type === 'majority' ? 'Le choix de la bande !' : formatAnswer(room.challenge, room.challenge.expected)}</strong>{room.challenge.note && <p className="game-hint">{room.challenge.note}</p>}{room.challenge.source && <a className="source-link" href={room.challenge.source} target="_blank" rel="noopener noreferrer">Voir la source des dimensions ↗</a>}{room.challenge.type === 'size' && <SizeStage challenge={room.challenge} ratio={1} answer={room.results.find(r => r.id === room.viewer_id)?.answer} reveal/>}{room.challenge.type === 'majority' && <div className="vote-results">{room.challenge.options.map((option, i) => <p key={i}><span>{option}</span><strong>{room.results.filter(r => r.answer === i).length} vote(s)</strong></p>)}</div>}</div>}<RoundAnswers room={room}/><Ranking room={room}/><AnswerHistory room={room}/><BoardRecap room={room}/>{!screen && !finished && <StancePicker room={room} action={action} busy={busy}/>}<BoardRules round={room.round + 1}/>{host && !finished && <button className="button primary full" onClick={() => action('start')} disabled={busy}>Manche suivante <ArrowRight size={18}/></button>}{!host && !finished && <p className="waiting-host">L’hôte va lancer la manche suivante.</p>}{finished && !screen && <button className="button ink full" onClick={leave}><RotateCcw size={17}/> Retour à l’accueil pour la revanche</button>}</section>}
    </div><aside className="room-sidebar"><Board players={room.players}/><div className="event-banner"><Sparkles size={18}/><span><strong>{event.name}</strong>{event.description}</span></div><BoardRules round={room.round || 1}/>{room.status !== 'lobby' && <section className="sidebar-ranking"><h3><Trophy size={16}/> Le classement</h3><Ranking room={room} compact/></section>}{!screen && <a className="screen-link" href={shareUrl.href} target="_blank" rel="noopener noreferrer"><Monitor size={22}/><span><strong>La soirée en grand</strong><small>{demo ? 'Écran démo sur ce navigateur' : 'Ouvrir l’écran spectateur'}</small></span><ArrowUpRight size={18}/></a>}{screen && <div className="notice"><Eye size={19}/><span>Ce mode affiche le plateau et les résultats. Chaque pote joue sur son téléphone.</span></div>}</aside></div>
  </main><footer className="room-footer"><Smartphone size={14}/> Chacun son téléphone. Tous dans la même partie.</footer></div>;
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const [room, setRoom] = useState(null);
  const [demo, setDemo] = useState(params.has('demo'));
  const [screen, setScreen] = useState(params.get('screen') === '1');
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(Date.now());
  const [offset, setOffset] = useState(0);
  const finishing = useRef(false);
  const request = useRef(0);
  const latest = useRef(null);
  const toastTimer = useRef();
  const notify = useCallback(message => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 5000); }, []);
  const accept = useCallback(data => {
    if (latest.current?.id === data.id && latest.current.revision > data.revision) return;
    latest.current = data;
    setRoom(data); setOffset(Date.parse(data.server_now) - Date.now()); setNow(Date.parse(data.server_now));
  }, []);
  const perform = useCallback(async (type, args = {}, useDemo = demo) => {
    setBusy(true); setError('');
    const token = ++request.current;
    try {
      const data = await call(type, { code: room?.code, round: room?.round, ...args }, useDemo);
      if (token === request.current) accept(data);
      return data;
    } catch (e) { setError(e.message); return null; }
    finally { setBusy(false); }
  }, [room?.code, room?.round, demo, accept]);
  const create = async (args = { name: 'Toi', avatar: 0, rounds: 8 }, useDemo = false) => {
    setDemo(useDemo); setScreen(false);
    const data = await perform('create', args, useDemo);
    if (data) { setDemo(useDemo); setScreen(false); setDialog(null); history.replaceState(null, '', useDemo ? '?demo=1' : `?room=${data.code}`); }
  };
  const join = async args => {
    setDemo(false); setScreen(false);
    const data = await perform('join', args, false);
    if (data) { setDemo(false); setScreen(false); setDialog(null); history.replaceState(null, '', `?room=${data.code}`); }
  };
  const leave = () => { ++request.current; latest.current = null; setRoom(null); setScreen(false); setDemo(false); setError(''); setDialog(null); history.replaceState(null, '', window.location.pathname); };
  useEffect(() => {
    if (room?.status !== 'playing') return;
    const tick = setInterval(() => setNow(Date.now() + offset), 200);
    return () => clearInterval(tick);
  }, [offset, room?.status]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [room?.status, room?.round]);
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search);
    if (!initial.has('room') && !initial.has('demo')) return;
    let cancelled = false;
    const isDemo = initial.has('demo');
    const code = initial.get('room');
    setBusy(true);
    call(initial.get('screen') === '1' && !isDemo ? 'join' : 'get', { code, spectator: initial.get('screen') === '1', name: 'Écran', avatar: 0 }, isDemo)
      .then(data => { if (!cancelled) accept(data); })
      .catch(e => { if (cancelled) return; if (!isDemo && initial.get('screen') !== '1') setDialog('join'); else setError(e.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [accept]);
  useEffect(() => {
    if (!room?.id) return;
    let active = true;
    let loading = false;
    const refresh = async () => {
      if (loading) return;
      loading = true;
      const token = request.current;
      try { const data = await call('get', { code: room.code }, demo); if (active && token === request.current) accept(data); }
      catch { /* The next poll or visibility change retries the connection. */ }
      finally { loading = false; }
    };
    const unsubscribe = watch(room, refresh, demo);
    return () => { active = false; unsubscribe(); };
  }, [room?.id, room?.code, demo, accept]);
  useEffect(() => {
    if (!room || room.status !== 'playing' || screen || busy || finishing.current) return;
    if (now < Date.parse(room.ends_at) && room.submitted.length < room.players.length) return;
    finishing.current = true;
    const timeout = setTimeout(async () => { await perform('finish'); finishing.current = false; }, 850);
    return () => { clearTimeout(timeout); finishing.current = false; };
  }, [room?.status, room?.round, room?.submitted.length, now >= Date.parse(room?.ends_at), screen, busy, perform]);
  return <>{room ? <Room room={room} demo={demo} screen={screen} now={now} busy={busy} action={perform} leave={leave} notify={notify}/> : <Landing open={kind => { setError(''); setDialog(kind); }} demo={() => create(undefined, true)} busy={busy}/>}{dialog && !room && <SetupDialog key={dialog} kind={dialog} close={() => { setDialog(null); setError(''); }} onCreate={create} onJoin={join} busy={busy} initialCode={params.get('room')} error={error}/>} {error && !dialog && <div className="toast error-toast" role="alert"><span>{error}</span><button className="icon-button" onClick={() => setError('')} aria-label="Fermer le message"><X size={18}/></button></div>}{toast && <div className="toast" role="status"><Check size={19}/>{toast}</div>}</>;
}

export default App;
