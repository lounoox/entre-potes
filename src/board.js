export const TILES = {
  3: { name: 'Fond du canapé', icon: '●', color: '#f6e29a', description: '+3 pièces retrouvées entre les coussins.' },
  5: { name: 'Bouclier anti-poisse', icon: '◇', color: '#cbdcf2', description: 'Protège du prochain piège.' },
  7: { name: 'Raccourci cuisine', icon: '↗', color: '#d6c5f0', description: 'Avance de 3 cases supplémentaires.' },
  10: { name: 'Comptoir des étoiles', icon: '★', color: '#f8c482', description: '6 pièces deviennent 1 étoile. Sinon, récupère 1 pièce.' },
  12: { name: 'Chips renversées', icon: '!', color: '#f3c3b7', description: 'Perds 2 pièces, sauf si tu as un bouclier.' },
  15: { name: 'Cagnotte de l’apéro', icon: '●', color: '#f6e29a', description: '+3 pièces pour la tournée.' },
  17: { name: 'Téléportation terrasse', icon: '↗', color: '#d6c5f0', description: 'Avance de 3 cases supplémentaires.' },
  20: { name: 'Comptoir des étoiles', icon: '★', color: '#f8c482', description: '6 pièces deviennent 1 étoile. Sinon, récupère 1 pièce.' },
  22: { name: 'Le verre de trop… d’eau', icon: '!', color: '#f3c3b7', description: 'Éponge les dégâts : −2 pièces, sauf bouclier.' },
  24: { name: 'Dernier snack', icon: '●', color: '#f6e29a', description: '+2 pièces avant de boucler le tour.' },
};
export const STANCES = {
  chill: { name: 'Tranquille', description: 'Avance de 1 + tes points. Aucun risque.' },
  bold: { name: 'Coup d’audace', description: '2 points ou plus : +2 cases et +1 pièce. Sinon : −1 pièce.' },
};
export function roundEvent(round) {
  if (round % 6 === 0) return { name: 'La tournée accélère', description: 'Tout le monde avance d’une case supplémentaire.', move: 1, coins: 0 };
  if (round % 3 === 0) return { name: 'La maison régale', description: 'Une pièce offerte à chaque pote.', move: 0, coins: 1 };
  return { name: 'La tournée des potes', description: 'Les étoiles d’abord, les pièces ensuite. Rien n’est joué.', move: 0, coins: 0 };
}
export function resolveBoard(player, points, round) {
  const start = { score: 0, position: 0, coins: 3, stars: 0, shield: false, stance: 'chill', ...player };
  const event = roundEvent(round);
  let move = 1 + points + event.move;
  let coins = start.coins + points + event.coins;
  let stars = start.stars;
  let shield = start.shield;
  const notes = [];
  if (start.stance === 'bold') {
    if (points >= 2) { move += 2; coins++; notes.push('Audace réussie : +2 cases, +1 pièce'); }
    else { coins = Math.max(0, coins - 1); notes.push('Audace manquée : −1 pièce'); }
  }
  let total = start.position + move;
  let position = total % 25;
  if (total >= 25) { stars++; coins += 3; notes.push('Tour bouclé : +1 étoile, +3 pièces'); }
  const tile = TILES[position];
  if (position === 3 || position === 15) { coins += 3; notes.push(`${tile.name} : +3 pièces`); }
  if (position === 24) { coins += 2; notes.push('Dernier snack : +2 pièces'); }
  if (position === 5) { shield = true; notes.push('Bouclier récupéré'); }
  if (position === 7 || position === 17) { position += 3; notes.push('Raccourci : +3 cases (sans activer la case d’arrivée)'); }
  if (position === 10 && total % 25 === 10 || position === 20 && total % 25 === 20) {
    if (coins >= 6) { coins -= 6; stars++; notes.push('6 pièces échangées contre 1 étoile'); }
    else { coins++; notes.push('Pas assez pour une étoile : +1 pièce'); }
  }
  if (position === 12 || position === 22) {
    if (shield) { shield = false; notes.push('Piège évité grâce au bouclier'); }
    else { coins = Math.max(0, coins - 2); notes.push('Piège : −2 pièces'); }
  }
  return {
    player: { ...start, position, coins, stars, shield, stance: 'chill', score: start.score + points },
    log: { id: start.id, from: start.position, to: position, points, coins: coins - start.coins, stars: stars - start.stars, notes: notes.length ? notes : ['Une étape de plus dans la tournée.'] },
  };
}
export function comparePlayers(a, b) { return (b.stars || 0) - (a.stars || 0) || (b.coins || 0) - (a.coins || 0) || b.score - a.score; }
