// Explications originales, dans le même ordre que les questions de catalog.mjs.
export const EXPLANATIONS = {
  quiz: [
    'La pieuvre a trois cœurs : deux envoient le sang vers les branchies, le troisième vers le reste du corps.',
    'L’étoile rend le pilote temporairement invincible. La banane et les carapaces sont des obstacles ou des projectiles.',
    '29 ne se divise que par 1 et par lui-même. Les autres sont divisibles par 3 : 21 = 3 × 7, 27 = 3 × 9 et 33 = 3 × 11.',
    'La tortilla espagnole classique associe des œufs et des pommes de terre. L’oignon est un ajout possible.',
    'L’Atlantique se trouve entre les côtes de l’Europe et celles de l’Amérique du Nord.',
    'Le S signifie Secure. HTTPS sécurise la communication HTTP grâce à TLS.',
    'La carte Inversion change le sens de circulation du tour. À deux joueurs, elle agit comme une carte Passe ton tour.',
    'Bohemian Rhapsody est une chanson de Queen, écrite par Freddie Mercury.',
  ],
  estimate: [
    'Une semaine compte 7 jours : 7 × 24 heures × 60 minutes = 10 080 minutes.',
    'Un piano standard possède 88 touches : 52 blanches et 36 noires.',
    '24 heures × 60 minutes × 60 secondes = 86 400 secondes.',
    'Un échiquier comporte 8 rangées de 8 cases : 8 × 8 = 64.',
    'Un jeu classique comporte 4 couleurs de 13 cartes chacune : 4 × 13 = 52, sans les jokers.',
    'La réponse est dans la question : un dé à vingt faces, aussi appelé D20, possède 20 faces.',
  ],
  size: [
    'Une feuille A4 mesure 21 × 29,7 cm. Sa hauteur est donc de 29,7 cm, contre 21 cm pour la feuille A5 de référence.',
    'Une feuille A3 mesure 29,7 × 42 cm. Elle est environ 1,41 fois aussi haute que la feuille A4 de référence.',
    'Le diamètre intérieur de référence du cercle est de 45 cm. Cela représente environ 1,52 fois la hauteur d’une feuille A4.',
    'Une feuille A5 mesure 14,8 × 21 cm. Sa hauteur représente un peu moins de la moitié du diamètre de 45 cm du cercle.',
    'Un panneau de basket officiel mesure 180 cm de large et 105 cm de haut. On demandait ici sa hauteur.',
    'Une feuille A6 mesure 10,5 × 14,8 cm. Elle est environ deux fois moins haute qu’une feuille A4.',
  ],
  culture: [
    'Mario est reconnaissable à sa moustache, sa casquette rouge et aux tuyaux de ses aventures.',
    'Harry Potter étudie à Poudlard, appelé Hogwarts dans la version anglaise.',
    'Dans Tetris, les tétriminos s’empilent pour former des lignes complètes, qui disparaissent.',
    'Le ukulélé possède généralement quatre cordes et est associé à Hawaï. Il est plus petit qu’une guitare classique.',
    'La Nuit étoilée est une œuvre de Vincent van Gogh.',
    'Central Perk est le café où les personnages de Friends se retrouvent autour du canapé.',
    'Un palindrome garde le même ordre de lettres quand on le lit à l’envers, comme « kayak » ou « radar ».',
    'Le 221B Baker Street est l’adresse du détective fictif Sherlock Holmes.',
  ],
  emoji: [
    'Le lion et la couronne renvoient au titre Le Roi lion.',
    'Le bateau évoque le Titanic, la glace l’iceberg, et le cœur brisé l’histoire d’amour.',
    'Le rat, le cuisinier et la France évoquent Rémy et la cuisine parisienne de Ratatouille.',
    'L’araignée, l’homme et la toile forment le nom Spider-Man : l’homme-araignée.',
    'La voiture, l’électricité et l’horloge évoquent la DeLorean et les voyages dans le temps de Retour vers le futur.',
    'La pioche, les blocs, les diamants et les zombies sont des éléments caractéristiques de Minecraft.',
  ],
  rebus: [
    '« Chat » + « peau » se prononce « chapeau ». On additionne les sons, pas les lettres.',
    '« Pain » + « seau » donne le son « pinceau ».',
    '« Chat » + « lait » se prononce « chalet ».',
    '« Verre » + « nid » se prononce « vernis ».',
    '« Scie » + « trouille » se prononce « citrouille ».',
    '« Rat » + « d’eau » se prononce « radeau ».',
  ],
  order: [
    '1 cm = 10 mm, 1 m = 100 cm et 1 km = 1 000 m. L’ordre est millimètre, centimètre, mètre, kilomètre.',
    'En partant du Soleil, ces quatre planètes sont Mercure, Vénus, Terre puis Mars.',
    'Dans la série A, plus le numéro augmente, plus la feuille est petite : A6, A5, A4 puis A3.',
    'Un tiers vaut environ 0,33 ; un demi 0,5 ; deux tiers 0,67 ; trois quarts 0,75.',
    'Une heure vaut 60 minutes, deux heures 120 minutes et une journée 1 440 minutes : 60, 90, 120 puis 1 440.',
    'On compare les lettres de gauche à droite : Abricot, Cerise, Citron puis Kiwi. « Ce » précède « Ci ».',
  ],
  odd: [
    'Kayak, radar et ressasser se lisent à l’identique dans les deux sens. À l’envers, « revenir » donne « rinever ».',
    '9 est divisible par 3 : 9 = 3 × 3. Les nombres 2, 3 et 11 ne se divisent que par 1 et par eux-mêmes.',
    'La clarinette est un instrument à vent. Le violon, la harpe et le ukulélé produisent leur son grâce à des cordes.',
    'Fe est le fer, Au l’or et Na le sodium. Xx n’est pas le symbole d’un élément chimique.',
    'Juin compte 30 jours. Mars, mai et juillet en comptent 31.',
    'Le requin est un poisson. Le dauphin, la baleine et la chauve-souris sont des mammifères : ils allaitent leurs petits.',
  ],
};
export const DEMO_EXPLANATIONS = {
  size: 'Une feuille A4 mesure 21 × 29,7 cm. Face au carré de 10 cm, sa hauteur est donc presque trois fois plus grande.',
  culture: 'Pikachu est le Pokémon jaune de type Électrik, reconnaissable à ses joues rouges et à ses éclairs.',
  emoji: 'Le poisson, l’océan et la recherche évoquent Le Monde de Nemo, où un père cherche son fils disparu.',
  order: '3 est plus petit que 7, qui est plus petit que 12, puis 21 : 3 → 7 → 12 → 21.',
  rebus: '« Bas » + « taux » se prononce « bateau ». On assemble les sons.',
  odd: '8, 12 et 20 sont divisibles par 2. Le nombre 15 est impair : c’est l’intrus.',
  estimate: 'Une année compte 12 mois : 3 × 12 = 36 mois.',
  quiz: 'Luigi porte un chapeau vert. Le chapeau rouge est celui de Mario.',
};
export function explanationFor(type, challenge) {
  if (type === 'petitbac') return 'Il fallait trouver une réponse dans la catégorie « ' + challenge.theme + ' », commençant par ' + challenge.letter + '. Plusieurs réponses sont possibles ; l’hôte peut accepter celles qui respectent la consigne.';
  if (type === 'majority') return 'Il n’y a pas de vérité unique : les choix les plus populaires rapportent 3 points, les autres 1. En cas d’égalité, chaque groupe en tête reçoit 3 points.';
  if (type === 'memory') return 'On compare chaque fruit à la même position dans la suite : 5 positions correctes rapportent 3 points, au moins 3 en rapportent 2, au moins 1 rapporte 1 point.';
  if (type === 'timing') return 'L’objectif était de ' + challenge.target_ms / 1000 + ' secondes. Un écart de 250 ms ou moins rapporte 3 points, jusqu’à 750 ms 2 points, jusqu’à 1 500 ms 1 point.';
  throw new Error('Explication manquante pour '+type);
}
