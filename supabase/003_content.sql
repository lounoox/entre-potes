-- Généré par npm run content:generate depuis content/catalog.mjs.
-- 72 défis originaux. Rejouable sans doublonner les entrées.
begin;
insert into public.ep_catalog(id, type, challenge)
select value->>'id', value->>'type', value from jsonb_array_elements($content$[
  {
    "prompt": "La pieuvre a un sacré cardio. Combien a-t-elle de cœurs ?",
    "options": [
      "Un",
      "Deux",
      "Trois",
      "Quatre"
    ],
    "expected": 2,
    "type": "quiz",
    "id": "quiz-1"
  },
  {
    "prompt": "Dans Mario Kart, quel objet rend temporairement invincible ?",
    "options": [
      "La banane",
      "L’étoile",
      "La carapace verte",
      "La pièce"
    ],
    "expected": 1,
    "type": "quiz",
    "id": "quiz-2"
  },
  {
    "prompt": "Lequel de ces nombres est premier ?",
    "options": [
      "21",
      "27",
      "29",
      "33"
    ],
    "expected": 2,
    "type": "quiz",
    "id": "quiz-3"
  },
  {
    "prompt": "Quel ingrédient transforme une omelette en tortilla espagnole classique ?",
    "options": [
      "Le riz",
      "La pomme de terre",
      "La semoule",
      "Les pâtes"
    ],
    "expected": 1,
    "type": "quiz",
    "id": "quiz-4"
  },
  {
    "prompt": "Quel océan sépare l’Europe de l’Amérique du Nord ?",
    "options": [
      "Pacifique",
      "Indien",
      "Arctique",
      "Atlantique"
    ],
    "expected": 3,
    "type": "quiz",
    "id": "quiz-5"
  },
  {
    "prompt": "Dans une adresse web, que signifie le S de HTTPS ?",
    "options": [
      "Speed",
      "Secure",
      "Search",
      "Server"
    ],
    "expected": 1,
    "type": "quiz",
    "id": "quiz-6"
  },
  {
    "prompt": "Au Uno classique, que fait une carte Inversion ?",
    "options": [
      "Elle change la couleur",
      "Elle inverse le sens du jeu",
      "Elle fait piocher quatre cartes",
      "Elle échange les mains"
    ],
    "expected": 1,
    "type": "quiz",
    "id": "quiz-7"
  },
  {
    "prompt": "Quel groupe chante Bohemian Rhapsody ?",
    "options": [
      "ABBA",
      "Queen",
      "Oasis",
      "Coldplay"
    ],
    "expected": 1,
    "type": "quiz",
    "id": "quiz-8"
  },
  {
    "prompt": "Combien de minutes dure une semaine entière ?",
    "expected": 10080,
    "unit": "minutes",
    "type": "estimate",
    "id": "estimate-1"
  },
  {
    "prompt": "Combien de touches possède un piano standard ?",
    "expected": 88,
    "unit": "touches",
    "type": "estimate",
    "id": "estimate-2"
  },
  {
    "prompt": "Combien de secondes dure une journée de 24 heures ?",
    "expected": 86400,
    "unit": "secondes",
    "type": "estimate",
    "id": "estimate-3"
  },
  {
    "prompt": "Un échiquier entier, ça fait combien de cases ?",
    "expected": 64,
    "unit": "cases",
    "type": "estimate",
    "id": "estimate-4"
  },
  {
    "prompt": "Combien de cartes dans un jeu classique sans jokers ?",
    "expected": 52,
    "unit": "cartes",
    "type": "estimate",
    "id": "estimate-5"
  },
  {
    "prompt": "Combien de faces a un dé à vingt faces ?",
    "expected": 20,
    "unit": "faces",
    "note": "Parfois, le piège est de chercher un piège.",
    "type": "estimate",
    "id": "estimate-6"
  },
  {
    "prompt": "Redonne sa hauteur à une feuille A4.",
    "expected": 29.7,
    "target": "Feuille A4",
    "shape": "paper",
    "aspect": 0.707,
    "reference": "Feuille A5",
    "reference_cm": 21,
    "reference_shape": "paper",
    "reference_aspect": 0.705,
    "unit": "cm",
    "source": "https://www.adobe.com/uk/creativecloud/design/discover/a4-format.html",
    "type": "size",
    "id": "size-1"
  },
  {
    "prompt": "Une feuille A3, c’est haut comment ?",
    "expected": 42,
    "target": "Feuille A3",
    "shape": "paper",
    "aspect": 0.707,
    "reference": "Feuille A4",
    "reference_cm": 29.7,
    "reference_shape": "paper",
    "reference_aspect": 0.707,
    "unit": "cm",
    "source": "https://www.adobe.com/uk/creativecloud/design/discover/a4-format.html",
    "type": "size",
    "id": "size-2"
  },
  {
    "prompt": "Remets ce cercle de basket à la bonne taille.",
    "expected": 45,
    "target": "Cercle de basket",
    "shape": "ring",
    "aspect": 1,
    "reference": "Feuille A4",
    "reference_cm": 29.7,
    "reference_shape": "paper",
    "reference_aspect": 0.707,
    "unit": "cm",
    "source": "https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-official-basketball-rules-and-basketball-equipment.pdf",
    "note": "On compare le diamètre intérieur du cercle à la hauteur de la feuille.",
    "type": "size",
    "id": "size-3"
  },
  {
    "prompt": "Rends sa hauteur à la petite feuille A5.",
    "expected": 21,
    "target": "Feuille A5",
    "shape": "paper",
    "aspect": 0.705,
    "reference": "Cercle de basket",
    "reference_cm": 45,
    "reference_shape": "ring",
    "reference_aspect": 1,
    "unit": "cm",
    "source": "https://www.adobe.com/uk/creativecloud/design/discover/a4-format.html",
    "type": "size",
    "id": "size-4"
  },
  {
    "prompt": "Un panneau de basket officiel : quelle hauteur ?",
    "expected": 105,
    "target": "Panneau de basket",
    "shape": "backboard",
    "aspect": 1.714,
    "reference": "Cercle de basket",
    "reference_cm": 45,
    "reference_shape": "ring",
    "reference_aspect": 1,
    "unit": "cm",
    "source": "https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-official-basketball-rules-and-basketball-equipment.pdf",
    "type": "size",
    "id": "size-5"
  },
  {
    "prompt": "Ajuste la hauteur de cette feuille A6.",
    "expected": 14.8,
    "target": "Feuille A6",
    "shape": "paper",
    "aspect": 0.709,
    "reference": "Feuille A4",
    "reference_cm": 29.7,
    "reference_shape": "paper",
    "reference_aspect": 0.707,
    "unit": "cm",
    "source": "https://www.adobe.com/uk/creativecloud/design/discover/a4-format.html",
    "type": "size",
    "id": "size-6"
  },
  {
    "prompt": "Quel plombier moustachu porte une casquette rouge et adore les tuyaux ?",
    "expected": [
      "mario",
      "super mario"
    ],
    "reward": 1,
    "theme": "Jeux vidéo",
    "type": "culture",
    "id": "culture-1"
  },
  {
    "prompt": "Quelle école de sorcellerie accueille Harry Potter ?",
    "expected": [
      "poudlard",
      "hogwarts"
    ],
    "reward": 1,
    "theme": "Cinéma & livres",
    "type": "culture",
    "id": "culture-2"
  },
  {
    "prompt": "Dans quel jeu faut-il empiler des tétriminos sans laisser de trou ?",
    "expected": [
      "tetris"
    ],
    "reward": 2,
    "theme": "Jeux vidéo",
    "type": "culture",
    "id": "culture-3"
  },
  {
    "prompt": "Quel instrument à quatre cordes est plus petit qu’une guitare et évoque Hawaï ?",
    "expected": [
      "ukulele",
      "ukulélé"
    ],
    "reward": 2,
    "theme": "Musique",
    "type": "culture",
    "id": "culture-4"
  },
  {
    "prompt": "Quel peintre a signé La Nuit étoilée ?",
    "expected": [
      "vincent van gogh",
      "van gogh"
    ],
    "reward": 3,
    "theme": "Art",
    "type": "culture",
    "id": "culture-5"
  },
  {
    "prompt": "Quel nom porte le café où se retrouve la bande de Friends ?",
    "expected": [
      "central perk"
    ],
    "reward": 3,
    "theme": "Séries",
    "type": "culture",
    "id": "culture-6"
  },
  {
    "prompt": "Quel mot désigne un mot qui se lit de la même façon dans les deux sens ?",
    "expected": [
      "palindrome"
    ],
    "reward": 3,
    "theme": "Langue",
    "type": "culture",
    "id": "culture-7"
  },
  {
    "prompt": "Quel détective habite au 221B Baker Street ?",
    "expected": [
      "sherlock holmes",
      "sherlock"
    ],
    "reward": 2,
    "theme": "Fiction",
    "type": "culture",
    "id": "culture-8"
  },
  {
    "prompt": "Retrouve le film derrière ces émojis.",
    "expected": [
      "le roi lion",
      "roi lion",
      "the lion king"
    ],
    "clue": "🦁 👑",
    "reward": 1,
    "type": "emoji",
    "id": "emoji-1"
  },
  {
    "prompt": "Quel film se cache ici ?",
    "expected": [
      "titanic"
    ],
    "clue": "🚢 🧊 💔",
    "reward": 1,
    "type": "emoji",
    "id": "emoji-2"
  },
  {
    "prompt": "Donne le titre de ce film.",
    "expected": [
      "ratatouille"
    ],
    "clue": "🐀 👨‍🍳 🇫🇷",
    "reward": 2,
    "type": "emoji",
    "id": "emoji-3"
  },
  {
    "prompt": "Quel héros de cinéma vois-tu ?",
    "expected": [
      "spider man",
      "spiderman",
      "spider-man"
    ],
    "clue": "🕷️ 🧑 🕸️",
    "reward": 1,
    "type": "emoji",
    "id": "emoji-4"
  },
  {
    "prompt": "Une saga de films. À toi de la nommer.",
    "expected": [
      "retour vers le futur",
      "back to the future"
    ],
    "clue": "🚗 ⚡ 🕰️",
    "reward": 2,
    "type": "emoji",
    "id": "emoji-5"
  },
  {
    "prompt": "Quel jeu vidéo se cache dans cette ligne ?",
    "expected": [
      "minecraft"
    ],
    "clue": "⛏️ 🧱 💎 🧟",
    "reward": 2,
    "type": "emoji",
    "id": "emoji-6"
  },
  {
    "prompt": "Lis les morceaux à voix haute. Quel mot entends-tu ?",
    "expected": [
      "chapeau"
    ],
    "clue": "CHAT + PEAU",
    "reward": 1,
    "type": "rebus",
    "id": "rebus-1"
  },
  {
    "prompt": "Un mot se cache dans ces deux sons.",
    "expected": [
      "pinceau"
    ],
    "clue": "PAIN + SEAU",
    "reward": 2,
    "type": "rebus",
    "id": "rebus-2"
  },
  {
    "prompt": "Additionne les sons, pas les lettres.",
    "expected": [
      "chalet"
    ],
    "clue": "CHAT + LAIT",
    "reward": 2,
    "type": "rebus",
    "id": "rebus-3"
  },
  {
    "prompt": "Ça se prononce comme un seul mot. Lequel ?",
    "expected": [
      "vernis"
    ],
    "clue": "VERRE + NID",
    "reward": 2,
    "type": "rebus",
    "id": "rebus-4"
  },
  {
    "prompt": "Deux morceaux, un mot.",
    "expected": [
      "citrouille"
    ],
    "clue": "SCIE + TROUILLE",
    "reward": 2,
    "type": "rebus",
    "id": "rebus-5"
  },
  {
    "prompt": "Le sens ne compte pas. Écoute les sons.",
    "expected": [
      "radeau"
    ],
    "clue": "RAT + D’EAU",
    "reward": 2,
    "type": "rebus",
    "id": "rebus-6"
  },
  {
    "prompt": "Un animal qui commence par P.",
    "expected": [
      "panda",
      "panthere",
      "puma",
      "poule",
      "poulet",
      "pigeon",
      "pie",
      "pingouin",
      "perroquet",
      "perruche",
      "poisson",
      "poney",
      "phoque",
      "paon",
      "porc",
      "pelican",
      "python",
      "poulpe",
      "papillon",
      "punaise",
      "porc epic",
      "pangolin"
    ],
    "letter": "P",
    "theme": "Animal",
    "reward": 3,
    "type": "petitbac",
    "id": "petitbac-1"
  },
  {
    "prompt": "Un fruit qui commence par P.",
    "expected": [
      "pomme",
      "poire",
      "peche",
      "prune",
      "pamplemousse",
      "papaye",
      "pitaya",
      "physalis",
      "pasteque",
      "prunelle"
    ],
    "letter": "P",
    "theme": "Fruit",
    "reward": 3,
    "type": "petitbac",
    "id": "petitbac-2"
  },
  {
    "prompt": "Un pays qui commence par C (nom français).",
    "expected": [
      "canada",
      "chine",
      "chili",
      "cameroun",
      "cambodge",
      "chypre",
      "colombie",
      "costa rica",
      "cuba",
      "croatie",
      "comores",
      "cap vert",
      "congo",
      "cote d ivoire",
      "coree du sud",
      "coree du nord"
    ],
    "letter": "C",
    "theme": "Pays",
    "reward": 3,
    "type": "petitbac",
    "id": "petitbac-3"
  },
  {
    "prompt": "Une ville qui commence par B.",
    "expected": [
      "bruxelles",
      "bruges",
      "berlin",
      "bordeaux",
      "barcelone",
      "brest",
      "bristol",
      "boston",
      "belfast",
      "beyrouth",
      "bangkok",
      "brasilia",
      "bucarest",
      "budapest",
      "bologne",
      "bamako",
      "bogota",
      "bern",
      "berne"
    ],
    "letter": "B",
    "theme": "Ville",
    "reward": 3,
    "type": "petitbac",
    "id": "petitbac-4"
  },
  {
    "prompt": "Un sport qui commence par T.",
    "expected": [
      "tennis",
      "tennis de table",
      "triathlon",
      "taekwondo",
      "tir",
      "tir a l arc",
      "trampoline",
      "trail",
      "touch rugby"
    ],
    "letter": "T",
    "theme": "Sport",
    "reward": 3,
    "type": "petitbac",
    "id": "petitbac-5"
  },
  {
    "prompt": "Un aliment qui commence par C.",
    "expected": [
      "carotte",
      "chocolat",
      "chou",
      "courgette",
      "concombre",
      "cerise",
      "clementine",
      "citron",
      "crepe",
      "croissant",
      "camembert",
      "chevre",
      "curry",
      "couscous",
      "champignon",
      "crevette",
      "crabe",
      "chataigne",
      "cassis",
      "cereales",
      "caviar"
    ],
    "letter": "C",
    "theme": "Aliment",
    "reward": 3,
    "type": "petitbac",
    "id": "petitbac-6"
  },
  {
    "prompt": "Remets ces unités de longueur de la plus petite à la plus grande.",
    "options": [
      "Mètre",
      "Kilomètre",
      "Millimètre",
      "Centimètre"
    ],
    "expected": [
      2,
      3,
      0,
      1
    ],
    "type": "order",
    "id": "order-1"
  },
  {
    "prompt": "Range ces planètes de la plus proche à la plus éloignée du Soleil.",
    "options": [
      "Mars",
      "Vénus",
      "Mercure",
      "Terre"
    ],
    "expected": [
      2,
      1,
      3,
      0
    ],
    "type": "order",
    "id": "order-2"
  },
  {
    "prompt": "Remets ces formats de papier du plus petit au plus grand.",
    "options": [
      "A3",
      "A6",
      "A4",
      "A5"
    ],
    "expected": [
      1,
      3,
      2,
      0
    ],
    "type": "order",
    "id": "order-3"
  },
  {
    "prompt": "Du plus petit nombre au plus grand. Attention aux fractions.",
    "options": [
      "Un demi",
      "Trois quarts",
      "Un tiers",
      "Deux tiers"
    ],
    "expected": [
      2,
      0,
      3,
      1
    ],
    "type": "order",
    "id": "order-4"
  },
  {
    "prompt": "Range ces durées de la plus courte à la plus longue.",
    "options": [
      "90 minutes",
      "Une journée",
      "Une heure",
      "Deux heures"
    ],
    "expected": [
      2,
      0,
      3,
      1
    ],
    "type": "order",
    "id": "order-5"
  },
  {
    "prompt": "Dans l’ordre alphabétique, s’il vous plaît.",
    "options": [
      "Kiwi",
      "Cerise",
      "Citron",
      "Abricot"
    ],
    "expected": [
      3,
      1,
      2,
      0
    ],
    "type": "order",
    "id": "order-6"
  },
  {
    "prompt": "Un de ces mots n’est pas un palindrome. Lequel ?",
    "options": [
      "Kayak",
      "Radar",
      "Revenir",
      "Ressasser"
    ],
    "expected": 2,
    "note": "Un palindrome se lit dans les deux sens.",
    "type": "odd",
    "id": "odd-1"
  },
  {
    "prompt": "Trouve l’intrus : les trois autres sont des nombres premiers.",
    "options": [
      "2",
      "3",
      "9",
      "11"
    ],
    "expected": 2,
    "type": "odd",
    "id": "odd-2"
  },
  {
    "prompt": "Lequel n’est pas un instrument à cordes ?",
    "options": [
      "Violon",
      "Harpe",
      "Ukulélé",
      "Clarinette"
    ],
    "expected": 3,
    "type": "odd",
    "id": "odd-3"
  },
  {
    "prompt": "Trois de ces symboles désignent des éléments chimiques. Un est inventé.",
    "options": [
      "Fe",
      "Au",
      "Na",
      "Xx"
    ],
    "expected": 3,
    "type": "odd",
    "id": "odd-4"
  },
  {
    "prompt": "Lequel de ces mois ne compte jamais 31 jours ?",
    "options": [
      "Mars",
      "Mai",
      "Juin",
      "Juillet"
    ],
    "expected": 2,
    "type": "odd",
    "id": "odd-5"
  },
  {
    "prompt": "Trois de ces animaux sont des mammifères. Qui fait bande à part ?",
    "options": [
      "Dauphin",
      "Chauve-souris",
      "Baleine",
      "Requin"
    ],
    "expected": 3,
    "type": "odd",
    "id": "odd-6"
  },
  {
    "prompt": "La dernière frite au milieu de la table. La bande fait quoi ?",
    "options": [
      "Je la prends discrètement",
      "Je demande par politesse",
      "On la partage",
      "On lance un débat de 20 minutes"
    ],
    "expected": null,
    "type": "majority",
    "id": "majority-1"
  },
  {
    "prompt": "La soirée parfaite, elle commence par…",
    "options": [
      "Une pizza",
      "Un jeu",
      "Une playlist",
      "Quelqu’un qui arrive en retard"
    ],
    "expected": null,
    "type": "majority",
    "id": "majority-2"
  },
  {
    "prompt": "On vous donne un super-pouvoir pour cette soirée.",
    "options": [
      "Ne jamais perdre",
      "Téléporter les snacks",
      "Lire les pensées",
      "Faire la vaisselle en un clic"
    ],
    "expected": null,
    "type": "majority",
    "id": "majority-3"
  },
  {
    "prompt": "L’excuse la plus crédible après une défaite ?",
    "options": [
      "Mon téléphone a laggé",
      "Je vous ai laissé gagner",
      "J’avais mal lu",
      "Je prépare ma revanche"
    ],
    "expected": null,
    "type": "majority",
    "id": "majority-4"
  },
  {
    "prompt": "Le vrai boss de l’apéro ?",
    "options": [
      "Les chips",
      "Le fromage",
      "Le houmous",
      "Le pote qui ramène tout"
    ],
    "expected": null,
    "type": "majority",
    "id": "majority-5"
  },
  {
    "prompt": "Vous perdez Internet. La suite de la soirée ?",
    "options": [
      "Jeux de cartes",
      "Karaoké a cappella",
      "Histoires gênantes",
      "On redémarre la box 12 fois"
    ],
    "expected": null,
    "type": "majority",
    "id": "majority-6"
  },
  {
    "prompt": "Retrouve les cinq fruits dans le bon ordre.",
    "expected": [
      0,
      2,
      1,
      4,
      3
    ],
    "sequence": [
      0,
      2,
      1,
      4,
      3
    ],
    "type": "memory",
    "id": "memory-1"
  },
  {
    "prompt": "La commande du primeur s’est effacée. Retrouve-la.",
    "expected": [
      5,
      0,
      4,
      2,
      1
    ],
    "sequence": [
      5,
      0,
      4,
      2,
      1
    ],
    "type": "memory",
    "id": "memory-2"
  },
  {
    "prompt": "Cinq fruits et un seul essai. Observe bien.",
    "expected": [
      3,
      1,
      3,
      0,
      5
    ],
    "sequence": [
      3,
      1,
      3,
      0,
      5
    ],
    "type": "memory",
    "id": "memory-3"
  },
  {
    "prompt": "Quel était l’ordre de cette salade de fruits ?",
    "expected": [
      2,
      4,
      0,
      5,
      2
    ],
    "sequence": [
      2,
      4,
      0,
      5,
      2
    ],
    "type": "memory",
    "id": "memory-4"
  },
  {
    "prompt": "Arrête ton chrono au plus près de 5 secondes.",
    "expected": 5000,
    "target_ms": 5000,
    "type": "timing",
    "id": "timing-1"
  },
  {
    "prompt": "Arrête ton chrono au plus près de 7 secondes.",
    "expected": 7000,
    "target_ms": 7000,
    "type": "timing",
    "id": "timing-2"
  },
  {
    "prompt": "Arrête ton chrono au plus près de 9 secondes.",
    "expected": 9000,
    "target_ms": 9000,
    "type": "timing",
    "id": "timing-3"
  },
  {
    "prompt": "Arrête ton chrono au plus près de 11 secondes.",
    "expected": 11000,
    "target_ms": 11000,
    "type": "timing",
    "id": "timing-4"
  }
]$content$::jsonb)
on conflict(id) do update set type = excluded.type, challenge = excluded.challenge;
commit;
