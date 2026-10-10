import {EXPLANATIONS,DEMO_EXPLANATIONS,explanationFor} from './explanations.mjs';
// Questions et indices rédigés pour Entre potes. Pas d'extraction de banques tierces.
const choice = (prompt, options, expected, extra = {}) => ({ prompt, options, expected, ...extra });
const text = (prompt, expected, extra = {}) => ({ prompt, expected, ...extra });
const order = (prompt, options, expected) => ({ prompt, options, expected });
const paperSource = 'https://www.adobe.com/uk/creativecloud/design/discover/a4-format.html';
const sportSource = 'https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-official-basketball-rules-and-basketball-equipment.pdf';

export const BANK = {
  quiz: [
    choice('La pieuvre a un sacré cardio. Combien a-t-elle de cœurs ?', ['Un', 'Deux', 'Trois', 'Quatre'], 2),
    choice('Dans Mario Kart, quel objet rend temporairement invincible ?', ['La banane', 'L’étoile', 'La carapace verte', 'La pièce'], 1),
    choice('Lequel de ces nombres est premier ?', ['21', '27', '29', '33'], 2),
    choice('Quel ingrédient transforme une omelette en tortilla espagnole classique ?', ['Le riz', 'La pomme de terre', 'La semoule', 'Les pâtes'], 1),
    choice('Quel océan sépare l’Europe de l’Amérique du Nord ?', ['Pacifique', 'Indien', 'Arctique', 'Atlantique'], 3),
    choice('Dans une adresse web, que signifie le S de HTTPS ?', ['Speed', 'Secure', 'Search', 'Server'], 1),
    choice('Au Uno classique, que fait une carte Inversion ?', ['Elle change la couleur', 'Elle inverse le sens du jeu', 'Elle fait piocher quatre cartes', 'Elle échange les mains'], 1),
    choice('Quel groupe chante Bohemian Rhapsody ?', ['ABBA', 'Queen', 'Oasis', 'Coldplay'], 1),
  ],
  estimate: [
    text('Combien de minutes dure une semaine entière ?', 10080, { unit: 'minutes' }),
    text('Combien de touches possède un piano standard ?', 88, { unit: 'touches' }),
    text('Combien de secondes dure une journée de 24 heures ?', 86400, { unit: 'secondes' }),
    text('Un échiquier entier, ça fait combien de cases ?', 64, { unit: 'cases' }),
    text('Combien de cartes dans un jeu classique sans jokers ?', 52, { unit: 'cartes' }),
    text('Combien de faces a un dé à vingt faces ?', 20, { unit: 'faces', note: 'Parfois, le piège est de chercher un piège.' }),
  ],
  size: [
    text('Redonne sa hauteur à une feuille A4.', 29.7, { target: 'Feuille A4', shape: 'paper', aspect: .707, reference: 'Feuille A5', reference_cm: 21, reference_shape: 'paper', reference_aspect: .705, unit: 'cm', source: paperSource }),
    text('Une feuille A3, c’est haut comment ?', 42, { target: 'Feuille A3', shape: 'paper', aspect: .707, reference: 'Feuille A4', reference_cm: 29.7, reference_shape: 'paper', reference_aspect: .707, unit: 'cm', source: paperSource }),
    text('Remets ce cercle de basket à la bonne taille.', 45, { target: 'Cercle de basket', shape: 'ring', aspect: 1, reference: 'Feuille A4', reference_cm: 29.7, reference_shape: 'paper', reference_aspect: .707, unit: 'cm', source: sportSource, note: 'On compare le diamètre intérieur du cercle à la hauteur de la feuille.' }),
    text('Rends sa hauteur à la petite feuille A5.', 21, { target: 'Feuille A5', shape: 'paper', aspect: .705, reference: 'Cercle de basket', reference_cm: 45, reference_shape: 'ring', reference_aspect: 1, unit: 'cm', source: paperSource }),
    text('Un panneau de basket officiel : quelle hauteur ?', 105, { target: 'Panneau de basket', shape: 'backboard', aspect: 1.714, reference: 'Cercle de basket', reference_cm: 45, reference_shape: 'ring', reference_aspect: 1, unit: 'cm', source: sportSource }),
    text('Ajuste la hauteur de cette feuille A6.', 14.8, { target: 'Feuille A6', shape: 'paper', aspect: .709, reference: 'Feuille A4', reference_cm: 29.7, reference_shape: 'paper', reference_aspect: .707, unit: 'cm', source: paperSource }),
  ],
  culture: [
    text('Quel plombier moustachu porte une casquette rouge et adore les tuyaux ?', ['mario', 'super mario'], { reward: 1, theme: 'Jeux vidéo' }),
    text('Quelle école de sorcellerie accueille Harry Potter ?', ['poudlard', 'hogwarts'], { reward: 1, theme: 'Cinéma & livres' }),
    text('Dans quel jeu faut-il empiler des tétriminos sans laisser de trou ?', ['tetris'], { reward: 2, theme: 'Jeux vidéo' }),
    text('Quel instrument à quatre cordes est plus petit qu’une guitare et évoque Hawaï ?', ['ukulele', 'ukulélé'], { reward: 2, theme: 'Musique' }),
    text('Quel peintre a signé La Nuit étoilée ?', ['vincent van gogh', 'van gogh'], { reward: 3, theme: 'Art' }),
    text('Quel nom porte le café où se retrouve la bande de Friends ?', ['central perk'], { reward: 3, theme: 'Séries' }),
    text('Quel mot désigne un mot qui se lit de la même façon dans les deux sens ?', ['palindrome'], { reward: 3, theme: 'Langue' }),
    text('Quel détective habite au 221B Baker Street ?', ['sherlock holmes', 'sherlock'], { reward: 2, theme: 'Fiction' }),
  ],
  emoji: [
    text('Retrouve le film derrière ces émojis.', ['le roi lion', 'roi lion', 'the lion king'], { clue: '🦁 👑', reward: 1 }),
    text('Quel film se cache ici ?', ['titanic'], { clue: '🚢 🧊 💔', reward: 1 }),
    text('Donne le titre de ce film.', ['ratatouille'], { clue: '🐀 👨‍🍳 🇫🇷', reward: 2 }),
    text('Quel héros de cinéma vois-tu ?', ['spider man', 'spiderman', 'spider-man'], { clue: '🕷️ 🧑 🕸️', reward: 1 }),
    text('Une saga de films. À toi de la nommer.', ['retour vers le futur', 'back to the future'], { clue: '🚗 ⚡ 🕰️', reward: 2 }),
    text('Quel jeu vidéo se cache dans cette ligne ?', ['minecraft'], { clue: '⛏️ 🧱 💎 🧟', reward: 2 }),
  ],
  rebus: [
    text('Lis les morceaux à voix haute. Quel mot entends-tu ?', ['chapeau'], { clue: 'CHAT + PEAU', reward: 1 }),
    text('Un mot se cache dans ces deux sons.', ['pinceau'], { clue: 'PAIN + SEAU', reward: 2 }),
    text('Additionne les sons, pas les lettres.', ['chalet'], { clue: 'CHAT + LAIT', reward: 2 }),
    text('Ça se prononce comme un seul mot. Lequel ?', ['vernis'], { clue: 'VERRE + NID', reward: 2 }),
    text('Deux morceaux, un mot.', ['citrouille'], { clue: 'SCIE + TROUILLE', reward: 2 }),
    text('Le sens ne compte pas. Écoute les sons.', ['radeau'], { clue: 'RAT + D’EAU', reward: 2 }),
  ],
  petitbac: [
    text('Un animal qui commence par P.', ['panda', 'panthere', 'puma', 'poule', 'poulet', 'pigeon', 'pie', 'pingouin', 'perroquet', 'perruche', 'poisson', 'poney', 'phoque', 'paon', 'porc', 'pelican', 'python', 'poulpe', 'papillon', 'punaise', 'porc epic', 'pangolin'], { letter: 'P', theme: 'Animal', reward: 3 }),
    text('Un fruit qui commence par P.', ['pomme', 'poire', 'peche', 'prune', 'pamplemousse', 'papaye', 'pitaya', 'physalis', 'pasteque', 'prunelle'], { letter: 'P', theme: 'Fruit', reward: 3 }),
    text('Un pays qui commence par C (nom français).', ['canada', 'chine', 'chili', 'cameroun', 'cambodge', 'chypre', 'colombie', 'costa rica', 'cuba', 'croatie', 'comores', 'cap vert', 'congo', 'cote d ivoire', 'coree du sud', 'coree du nord'], { letter: 'C', theme: 'Pays', reward: 3 }),
    text('Une ville qui commence par B.', ['bruxelles', 'bruges', 'berlin', 'bordeaux', 'barcelone', 'brest', 'bristol', 'boston', 'belfast', 'beyrouth', 'bangkok', 'brasilia', 'bucarest', 'budapest', 'bologne', 'bamako', 'bogota', 'bern', 'berne'], { letter: 'B', theme: 'Ville', reward: 3 }),
    text('Un sport qui commence par T.', ['tennis', 'tennis de table', 'triathlon', 'taekwondo', 'tir', 'tir a l arc', 'trampoline', 'trail', 'touch rugby'], { letter: 'T', theme: 'Sport', reward: 3 }),
    text('Un aliment qui commence par C.', ['carotte', 'chocolat', 'chou', 'courgette', 'concombre', 'cerise', 'clementine', 'citron', 'crepe', 'croissant', 'camembert', 'chevre', 'curry', 'couscous', 'champignon', 'crevette', 'crabe', 'chataigne', 'cassis', 'cereales', 'caviar'], { letter: 'C', theme: 'Aliment', reward: 3 }),
  ],
  order: [
    order('Remets ces unités de longueur de la plus petite à la plus grande.', ['Mètre', 'Kilomètre', 'Millimètre', 'Centimètre'], [2, 3, 0, 1]),
    order('Range ces planètes de la plus proche à la plus éloignée du Soleil.', ['Mars', 'Vénus', 'Mercure', 'Terre'], [2, 1, 3, 0]),
    order('Remets ces formats de papier du plus petit au plus grand.', ['A3', 'A6', 'A4', 'A5'], [1, 3, 2, 0]),
    order('Du plus petit nombre au plus grand. Attention aux fractions.', ['Un demi', 'Trois quarts', 'Un tiers', 'Deux tiers'], [2, 0, 3, 1]),
    order('Range ces durées de la plus courte à la plus longue.', ['90 minutes', 'Une journée', 'Une heure', 'Deux heures'], [2, 0, 3, 1]),
    order('Dans l’ordre alphabétique, s’il vous plaît.', ['Kiwi', 'Cerise', 'Citron', 'Abricot'], [3, 1, 2, 0]),
  ],
  odd: [
    choice('Un de ces mots n’est pas un palindrome. Lequel ?', ['Kayak', 'Radar', 'Revenir', 'Ressasser'], 2, { note: 'Un palindrome se lit dans les deux sens.' }),
    choice('Trouve l’intrus : les trois autres sont des nombres premiers.', ['2', '3', '9', '11'], 2),
    choice('Lequel n’est pas un instrument à cordes ?', ['Violon', 'Harpe', 'Ukulélé', 'Clarinette'], 3),
    choice('Trois de ces symboles désignent des éléments chimiques. Un est inventé.', ['Fe', 'Au', 'Na', 'Xx'], 3),
    choice('Lequel de ces mois ne compte jamais 31 jours ?', ['Mars', 'Mai', 'Juin', 'Juillet'], 2),
    choice('Trois de ces animaux sont des mammifères. Qui fait bande à part ?', ['Dauphin', 'Chauve-souris', 'Baleine', 'Requin'], 3),
  ],
  majority: [
    choice('La dernière frite au milieu de la table. La bande fait quoi ?', ['Je la prends discrètement', 'Je demande par politesse', 'On la partage', 'On lance un débat de 20 minutes'], null),
    choice('La soirée parfaite, elle commence par…', ['Une pizza', 'Un jeu', 'Une playlist', 'Quelqu’un qui arrive en retard'], null),
    choice('On vous donne un super-pouvoir pour cette soirée.', ['Ne jamais perdre', 'Téléporter les snacks', 'Lire les pensées', 'Faire la vaisselle en un clic'], null),
    choice('L’excuse la plus crédible après une défaite ?', ['Mon téléphone a laggé', 'Je vous ai laissé gagner', 'J’avais mal lu', 'Je prépare ma revanche'], null),
    choice('Le vrai boss de l’apéro ?', ['Les chips', 'Le fromage', 'Le houmous', 'Le pote qui ramène tout'], null),
    choice('Vous perdez Internet. La suite de la soirée ?', ['Jeux de cartes', 'Karaoké a cappella', 'Histoires gênantes', 'On redémarre la box 12 fois'], null),
  ],
  memory: [
    text('Retrouve les cinq fruits dans le bon ordre.', [0, 2, 1, 4, 3], { sequence: [0, 2, 1, 4, 3] }),
    text('La commande du primeur s’est effacée. Retrouve-la.', [5, 0, 4, 2, 1], { sequence: [5, 0, 4, 2, 1] }),
    text('Cinq fruits et un seul essai. Observe bien.', [3, 1, 3, 0, 5], { sequence: [3, 1, 3, 0, 5] }),
    text('Quel était l’ordre de cette salade de fruits ?', [2, 4, 0, 5, 2], { sequence: [2, 4, 0, 5, 2] }),
  ],
  timing: [5000, 7000, 9000, 11000].map(target_ms => text(`Arrête ton chrono au plus près de ${target_ms / 1000} secondes.`, target_ms, { target_ms })),
};

// Les exemples de démo sont distincts des questions de la BDD, sauf les chronos
// et la mémoire dont l'objectif est forcément présenté aux joueurs.
export const DEMO = {
  size: text('Quelle hauteur fait une feuille A4 ?', 29.7, { target: 'Feuille A4', shape: 'paper', aspect: .707, reference: 'Carré de 10 cm', reference_cm: 10, reference_shape: 'paper', reference_aspect: 1, unit: 'cm', source: paperSource }),
  culture: text('Quel petit monstre jaune dit son propre nom et lance des éclairs ?', ['pikachu'], { reward: 2, theme: 'Pop culture' }),
  timing: BANK.timing[0],
  emoji: text('Quel film raconte cette ligne d’émojis ?', ['le monde de nemo', 'monde de nemo', 'nemo', 'finding nemo'], { clue: '🐠 🌊 🔎', reward: 2 }),
  order: order('Classe ces nombres du plus petit au plus grand.', ['12', '3', '21', '7'], [1, 3, 0, 2]),
  majority: choice('Le meilleur endroit pour un jeu de soirée ?', ['Le canapé', 'La cuisine', 'La terrasse', 'Partout avec les bons potes'], null),
  petitbac: text('Un animal qui commence par L.', ['lion', 'loup', 'lapin', 'loutre', 'lynx', 'leopard', 'lama', 'libellule', 'lezard', 'limace', 'langouste', 'langoustine', 'loir', 'lemurien'], { letter: 'L', theme: 'Animal', reward: 3 }),
  rebus: text('Deux sons se cachent dans un mot. Lequel ?', ['bateau'], { clue: 'BAS + TAUX', reward: 2 }),
  odd: choice('Trois de ces nombres sont pairs. Trouve l’intrus.', ['8', '12', '15', '20'], 2),
  memory: BANK.memory[0],
  estimate: text('Combien de mois y a-t-il dans trois années ?', 36, { unit: 'mois' }),
  quiz: choice('De quelle couleur est le chapeau de Luigi ?', ['Rouge', 'Vert', 'Bleu', 'Jaune'], 1),
};

for (const [type, entries] of Object.entries(BANK)) entries.forEach((entry,index)=>{
  entry.explanation=EXPLANATIONS[type]?.[index] || explanationFor(type,entry);
});
for (const [type, entry] of Object.entries(DEMO)) {
  entry.explanation=DEMO_EXPLANATIONS[type] || entry.explanation || explanationFor(type,entry);
}
