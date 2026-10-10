import DEMO from './demo-content.json' with { type: 'json' };
import { resolveBoard } from './board.js';

export const AVATARS = ['#c6d5fd', '#fac7ac', '#d2e69b', '#ded0f4', '#ffe390', '#b9dcd6', '#f6bdd4', '#ccd2bf'];
export const SYMBOLS = ['🍋', '🍒', '🍇', '🥝', '🍉', '🍊'];
export const GAMES = {
  size: { name: 'Guess the size', category: 'LE COMPAS DANS L’ŒIL', description: 'Redimensionne un objet à côté d’un repère. Alors, si grand que ça ?', color: 'mint', icon: 'target', duration: 30, family: 'Adresse' },
  culture: { name: 'Culture remix', category: 'RÉPONSE LIBRE', description: 'Séries, gaming, musique… On sort la culture du canapé.', color: 'lilac', icon: 'brain', duration: 30, family: 'Culture', review: true },
  timing: { name: 'Pile à l’heure', category: 'CHRONO À L’AVEUGLE', description: 'Aucun compteur. Aucun indice. Juste ton horloge intérieure.', color: 'peach', icon: 'timer', duration: 35, family: 'Adresse' },
  emoji: { name: 'Émoji cinéma', category: 'ÇA VEUT DIRE QUOI ?', description: 'Des émojis racontent un film ou un jeu. Décode-les.', color: 'yellow', icon: 'eye', duration: 30, family: 'Culture', review: true },
  order: { name: 'Dans le bon ordre', category: 'PETIT CHAOS ORGANISÉ', description: 'Quatre propositions à remettre à leur place. Sans s’emmêler.', color: 'lilac', icon: 'brain', duration: 30, family: 'Adresse' },
  majority: { name: 'Dans la tête des potes', category: 'INSTINCT DE BANDE', description: 'Devine ce que la majorité va choisir. Vous vous connaissez ?', color: 'peach', icon: 'brain', duration: 25, family: 'Ambiance' },
  petitbac: { name: 'Petit Bac flash', category: 'UNE LETTRE, UNE IDÉE', description: 'Un thème, une lettre. À l’hôte de trancher les réponses créatives.', color: 'mint', icon: 'brain', duration: 30, family: 'Culture', review: true },
  rebus: { name: 'Rébus tordu', category: 'DITES-LE TOUT HAUT', description: 'Des morceaux de mots. Un déclic. Et beaucoup de « aaaah ! ».', color: 'yellow', icon: 'eye', duration: 30, family: 'Culture', review: true },
  odd: { name: 'L’intrus du groupe', category: 'PAS COMME LES AUTRES', description: 'Trois vont ensemble. Le quatrième s’est incrusté.', color: 'peach', icon: 'eye', duration: 25, family: 'Culture' },
  memory: { name: 'Mémoire de pote', category: 'MÉMOIRE', description: 'Cinq fruits. Six secondes. Tu les as ?', color: 'mint', icon: 'eye', duration: 25, family: 'Adresse' },
  estimate: { name: 'À un poil près', category: 'ESTIMATION', description: 'Pas besoin de tout savoir. Il faut viser juste.', color: 'yellow', icon: 'target', duration: 25, family: 'Adresse' },
  quiz: { name: 'Quiz express', category: 'CULTURE GÉNÉRALE', description: 'Une question. Quatre choix. Gare aux certitudes.', color: 'lilac', icon: 'brain', duration: 20, family: 'Culture' },
};
export const DEMO_CHALLENGES = DEMO;
export const normalizeAnswer = value => String(value).toLowerCase().replaceAll('œ', 'oe').replaceAll('æ', 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

export function pointsFor(challenge, answer, answers = []) {
  if (answer == null) return 0;
  const reward = challenge.reward || 3;
  if (GAMES[challenge.type]?.review) return challenge.expected.some(option => normalizeAnswer(option) === normalizeAnswer(answer)) ? reward : 0;
  if (['quiz', 'odd'].includes(challenge.type)) return answer === challenge.expected ? reward : 0;
  if (challenge.type === 'majority') {
    const counts = challenge.options.map((_, i) => answers.filter(a => a === i).length);
    return counts[answer] > 0 && counts[answer] === Math.max(...counts) ? 3 : 1;
  }
  if (['estimate', 'size'].includes(challenge.type)) {
    const distance = Math.abs(answer - challenge.expected) / Math.max(1, challenge.expected);
    return distance <= .05 + 1e-12 ? 3 : distance <= .2 + 1e-12 ? 2 : distance <= .5 + 1e-12 ? 1 : 0;
  }
  if (challenge.type === 'memory') {
    const count = challenge.expected.filter((n, index) => answer[index] === n).length;
    return count === 5 ? 3 : count >= 3 ? 2 : count >= 1 ? 1 : 0;
  }
  if (challenge.type === 'order') {
    let pairs = 0;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (answer.indexOf(challenge.expected[i]) < answer.indexOf(challenge.expected[j])) pairs++;
    return pairs === 6 ? 3 : pairs >= 4 ? 2 : pairs >= 2 ? 1 : 0;
  }
  if (challenge.type === 'timing') {
    const distance = Math.abs(answer - (challenge.target_ms || 5000));
    return distance <= 250 ? 3 : distance <= 750 ? 2 : distance <= 1500 ? 1 : 0;
  }
  return 0;
}

export function validateAnswer(challenge, answer) {
  if (GAMES[challenge.type]?.review) return typeof answer === 'string' && answer.trim().length > 0 && answer.length <= 80 && !/[\u0000-\u001f]/.test(answer);
  if (challenge.type === 'memory') return Array.isArray(answer) && answer.length === 5 && answer.every(n => Number.isInteger(n) && n >= 0 && n < SYMBOLS.length);
  if (challenge.type === 'order') return Array.isArray(answer) && answer.length === 4 && new Set(answer).size === 4 && answer.every(n => Number.isInteger(n) && n >= 0 && n < 4);
  if (typeof answer !== 'number' || !Number.isFinite(answer)) return false;
  if (['quiz', 'odd', 'majority'].includes(challenge.type)) return Number.isInteger(answer) && answer >= 0 && answer < 4;
  return answer >= 0 && answer <= (challenge.type === 'timing' ? 60000 : 1000000000);
}

export function makeDeck(games, rounds, random = Math.random) {
  if (!Array.isArray(games) || !games.length || games.some(type => !GAMES[type]) || new Set(games).size !== games.length) throw new Error('Choisis au moins un mini-jeu valide, sans doublon.');
  const deck = [];
  while (deck.length < rounds) {
    const bag = [...games];
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    if (bag.length > 1 && bag[0] === deck.at(-1)?.type) [bag[0], bag[1]] = [bag[1], bag[0]];
    deck.push(...bag.map(type => structuredClone(DEMO.find(c => c.type === type))));
  }
  return deck.slice(0, rounds);
}

export function newDemo(name = 'Toi', avatar = 0, rounds = 8, games = Object.keys(GAMES), random = Math.random) {
  if (![4, 6, 8, 12].includes(rounds)) throw new Error('Choisis 4, 6, 8 ou 12 manches.');
  return {
    id: `demo-${crypto.randomUUID()}`, revision: 0, code: 'DÉMO', host_id: 'you', viewer_id: 'you', viewer_role: 'player',
    status: 'lobby', round: 0, total_rounds: rounds, challenge: null, games, deck: makeDeck(games, rounds, random), board_log: [],
    players: [{ id: 'you', name, avatar }, { id: 'lea', name: 'Léa', avatar: 1 }, { id: 'sam', name: 'Sam', avatar: 2 }, { id: 'alex', name: 'Alex', avatar: 3 }].map(p => ({ ...p, score: 0, position: 0, coins: 3, stars: 0, shield: false, stance: 'chill' })),
    submitted: [], results: [],
  };
}

export function advanceDemo(room, now = Date.now()) {
  if (!['lobby', 'results'].includes(room.status)) throw new Error('Cette manche est encore en cours.');
  if (room.round >= room.total_rounds) throw new Error('La partie est terminée.');
  const challenge = structuredClone(room.deck[room.round]);
  return { ...room, status: 'playing', round: room.round + 1, challenge, results: [], submitted: [], board_log: [], starts_at: new Date(now + 3000).toISOString(), ends_at: new Date(now + 3000 + GAMES[challenge.type].duration * 1000).toISOString() };
}

export function answerDemo(room, answer, now = Date.now()) {
  if (room.status !== 'playing' || now < Date.parse(room.starts_at) || now > Date.parse(room.ends_at)) throw new Error('La manche n’accepte pas de réponse pour le moment.');
  if (room.submitted.includes('you')) throw new Error('Ta réponse est déjà enregistrée.');
  if (room.challenge.type === 'memory' && now < Date.parse(room.starts_at) + 6000) throw new Error('Observe encore la suite.');
  if (!validateAnswer(room.challenge, answer)) throw new Error('Cette réponse n’est pas valide.');
  return { ...room, submitted: ['you', 'lea', 'sam', 'alex'], results: [{ id: 'you', answer, points: pointsFor(room.challenge, answer) }] };
}

function botAnswer(challenge, index) {
  if (GAMES[challenge.type].review) return index % 3 === 0 ? 'Un truc, je l’ai sur le bout de la langue' : challenge.expected[0];
  if (['quiz', 'odd', 'majority'].includes(challenge.type)) return index % 4;
  if (['memory', 'order'].includes(challenge.type)) return index % 2 ? [...challenge.expected].reverse() : challenge.expected;
  return Number((challenge.expected * (1 + (index - 2) * .15)).toFixed(2));
}

export function resolveDemo(room) {
  if (!['review', 'playing'].includes(room.status)) return room;
  const board = room.players.map(player => resolveBoard(player, room.results.find(r => r.id === player.id)?.points || 0, room.round));
  return { ...room, status: room.round === room.total_rounds ? 'finished' : 'results', players: board.map(b => b.player), board_log: board.map(b => b.log) };
}

export function finishDemo(room, now = Date.now()) {
  if (room.status !== 'playing') return room;
  if (now < Date.parse(room.ends_at) && room.submitted.length < room.players.length) throw new Error('Les autres joueurs sont encore en train de jouer.');
  let results = room.players.map((player, index) => room.results.find(r => r.id === player.id) || { id: player.id, answer: index === 0 ? null : botAnswer(room.challenge, index) });
  results = results.map(r => ({ ...r, points: pointsFor(room.challenge, r.answer, results.map(a => a.answer)) }));
  const updated = { ...room, results };
  return GAMES[room.challenge.type].review ? { ...updated, status: 'review' } : resolveDemo(updated);
}

export function reviewDemo(room, id, points) {
  if (room.status !== 'review' || !Number.isInteger(points) || points < 0 || points > (room.challenge.reward || 3)) throw new Error('Cette correction n’est pas valide.');
  if (!room.results.some(r => r.id === id && r.answer != null)) throw new Error('Réponse introuvable.');
  return { ...room, results: room.results.map(r => r.id === id ? { ...r, points } : r) };
}

export function stanceDemo(room, stance) {
  if (!['lobby', 'results'].includes(room.status) || !['chill', 'bold'].includes(stance)) throw new Error('Le choix se fait avant la prochaine manche.');
  return { ...room, players: room.players.map(p => p.id === 'you' ? { ...p, stance } : p) };
}

export function formatAnswer(challenge, answer) {
  if (answer == null) return challenge.type === 'majority' ? 'Le choix de la bande !' : 'Pas de réponse';
  if (GAMES[challenge.type]?.review) return Array.isArray(answer) ? answer[0] : answer;
  if (['quiz', 'odd', 'majority'].includes(challenge.type)) return challenge.options[answer];
  if (challenge.type === 'memory') return answer.map(n => SYMBOLS[n]).join(' ');
  if (challenge.type === 'order') return answer.map(n => challenge.options[n]).join(' → ');
  if (challenge.type === 'timing') return `${(answer / 1000).toFixed(2)} s`;
  return `${Number(answer).toLocaleString('fr-BE')} ${challenge.unit || ''}`;
}
