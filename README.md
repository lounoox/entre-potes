# Entre potes · La tournée des potes

Un jeu de soirée pour 2 à 8 personnes : chacun joue sur son téléphone. Un écran spectateur facultatif affiche le plateau et les résultats sans prendre une place de joueur.

Projet autonome dans `C:\Users\louno\Documents\entre-potes`, indépendant du projet scolaire `veille-web`. La démo est jouable immédiatement. Le multijoueur entre appareils nécessite encore la configuration Supabase et le déploiement Vercel.

## Essayer

Node.js 22.12+ ou 24 recommandé. Depuis ce dossier :

```sh
npm ci
npm run dev
```

Ouvrir l’adresse indiquée par Vite. **Créer une partie** permet de choisir les jeux et 4, 8 ou 12 manches. Sans BDD configurée, cette action lance une démo avec trois adversaires simulés. **Essayer la démo** lance directement le grand mélange.

La démo conserve une partie dans ce navigateur. Son écran spectateur fonctionne dans un autre onglet du même navigateur, pas sur un autre appareil. Elle contient un exemple par jeu ; les 72 défis variés sont dans le catalogue multijoueur.

```sh
npm test
npm run build
```

## Les 12 mini-jeux

| Jeu | Mécanique |
| --- | --- |
| Guess the size | Redimensionner une silhouette à côté d’une référence connue. |
| Culture remix | Réponses libres : séries, musique, jeux vidéo et culture pop. |
| Pile à l’heure | Arrêter un chrono masqué à l’objectif indiqué. |
| Émoji cinéma | Reconnaître un film ou un jeu à partir d’émojis. |
| Dans le bon ordre | Remettre quatre éléments dans l’ordre. |
| Dans la tête des potes | Trouver le choix de la majorité. |
| Petit Bac flash | Une lettre et un thème, proposer une réponse. |
| Rébus tordu | Assembler des syllabes et trouver le mot. |
| L’intrus du groupe | Repérer la proposition qui ne correspond pas aux autres. |
| Mémoire de pote | Observer cinq fruits six secondes, puis reconstruire la suite. |
| À un poil près | Donner une estimation numérique. |
| Quiz express | Une question, quatre propositions. |

La sélection est mélangée sans répétition de type avant d’avoir parcouru tous les types sélectionnés. Les questions d’un même type ne sont réutilisées qu’après épuisement de leur banque.

Les réponses libres sont notées automatiquement en ignorant accents, espaces et ponctuation. Elles passent ensuite devant **le tribunal des potes** : l’hôte peut accepter une variante ou une réponse valide absente du dictionnaire. Les déplacements attendent sa validation. Selon la difficulté, ces questions rapportent 1 à 3 points.

Le chrono aveugle n’affiche **aucun décompte, barre de progression, animation périodique ou compteur de réponses**, sur le téléphone comme sur l’écran commun. Le temps mesuré n’apparaît qu’aux résultats. Une limite technique de manche reste active pour éviter un blocage. La mesure se fait sur le téléphone ; ce jeu vise des amis qui jouent loyalement.

Barèmes : QCM juste = 3 points ; estimation/taille à 5 % = 3, 20 % = 2, 50 % = 1 ; chrono à 250 ms = 3, 750 ms = 2, 1 500 ms = 1 ; mémoire 5 bonnes positions = 3, au moins 3 = 2, au moins 1 = 1. Pour le classement, 6 paires dans le bon ordre = 3 points, au moins 4 = 2, au moins 2 = 1. Au vote, chaque groupe en tête reçoit 3 points, les minoritaires 1. Sans réponse : 0.

## Le plateau : la tournée des potes

Une boucle de 25 cases. Chacun commence avec 3 pièces. Chaque manche fait avancer de **1 + les points obtenus**, et rapporte ces points en pièces.

- Un tour complet : **1 étoile + 3 pièces**.
- Coffres : pièces supplémentaires, au fond du canapé ou dans la cagnotte de l’apéro.
- Bouclier : protège du prochain piège.
- Raccourcis : +3 cases, sans déclencher la case d’arrivée.
- Comptoirs : 6 pièces échangées automatiquement contre une étoile ; avec moins de 6, on reçoit une pièce.
- Pièges : −2 pièces, sauf avec un bouclier. Le solde reste positif ou nul.

Avant chaque manche, on choisit **Tranquille** ou **Coup d’audace**. Avec l’audace, obtenir au moins 2 points ajoute 2 cases et une pièce ; sinon on perd une pièce. Le choix revient à Tranquille après chaque résolution.

Toutes les trois manches, un événement s’annonce : une pièce offerte à chacun ; toutes les six manches, une case de mouvement supplémentaire à la place. Le récapitulatif explique chaque déplacement et chaque gain.

À la fin, le plus d’étoiles gagne. Les pièces, puis les points de mini-jeux départagent les égalités. Une égalité parfaite partage la victoire.

## Connecter Supabase

1. Créer un projet sur [Supabase](https://supabase.com/).
2. Dans SQL Editor, exécuter dans cet ordre, **une fois chacun** : `supabase/001_party.sql`, `supabase/002_party_expansion.sql`, puis `supabase/003_content.sql`. Si la version initiale est déjà installée, exécuter seulement 002 puis 003. Faire cette mise à jour entre deux soirées : les règles du plateau changent pour les salons existants.
3. Activer **Anonymous Sign-Ins** dans Authentication → Sign In / Providers.
4. Copier `.env.example` en `.env.local` et compléter :

```dotenv
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique
```

Utiliser la clé publique publishable (ou ancienne clé `anon`), jamais une clé secrète ou `service_role`. Redémarrer Vite après modification.

Les tables et le catalogue ne sont pas lisibles directement par le navigateur. La fonction `ep_action` contrôle identité, rôle, accès au salon, délais, réponses et scores. Les bonnes réponses restent secrètes jusqu’à la correction ou aux résultats. La suite de mémoire est visible pendant l’observation. Un verrou de salon empêche le double comptage. Realtime avertit les membres ; un rafraîchissement toutes les 15 secondes et au retour sur l’onglet sert de secours.

## Déployer sur Vercel

1. Placer ce dossier dans son propre dépôt et l’importer dans un nouveau projet Vercel.
2. Utiliser la racine du dépôt, preset Vite, build `npm run build`, sortie `dist`.
3. Ajouter les deux variables ci-dessus dans Vercel et déployer.
4. Ouvrir l’URL HTTPS sur chaque téléphone ; l’hôte crée le salon et partage son code.

Consulter les conditions et quotas actuels avant activation : [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Supabase](https://supabase.com/pricing). Le dépôt ne crée aucun compte ni abonnement et n’a encore été déployé sur aucun service.

Dans une partie, **La soirée en grand** ouvre l’écran spectateur. Pour un autre appareil : `https://votre-site/?room=ABC123&screen=1`. Les joueurs répondent sur leurs téléphones.

## Ajouter des questions

Modifier `content/catalog.mjs`, puis lancer :

```sh
npm run content:generate
npm test
npm run build
```

Le générateur produit `supabase/003_content.sql` et les exemples `src/demo-content.json`. Réappliquer 003 actualise les questions par identifiant ; supprimer une entrée du fichier ne supprime pas automatiquement sa ligne en BDD. Les bonnes réponses du catalogue multijoueur ne sont pas incluses dans le bundle client. Le build vérifie que les fichiers générés sont à jour.

Inspirations : [K Culture](https://kculture.kgames.fr) pour la variété des épreuves et la correction collective, [Size It Up](https://sizeitup.games/) pour l’estimation visuelle. Les textes et illustrations du projet sont propres au jeu. Dimensions : [formats papier Adobe](https://www.adobe.com/uk/creativecloud/design/discover/a4-format.html) et [équipements FIBA](https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-official-basketball-rules-and-basketball-equipment.pdf).

## Vérification et limites

Les tests exécutent les migrations dans PostgreSQL via PGlite : accès privés, actions réservées à l’hôte, secrets, 12 types de jeu, scores, correction, stratégie et 200 cas de cohérence du plateau. Un test de rendu vérifie l’absence de repères périodiques pendant le chrono, joueur et spectateur.

Le multijoueur sur des appareils distincts doit encore être vérifié après connexion à Supabase hébergé. Une partie expire après 24 heures ; les données expirées attendent une suppression administrative. Fermer un onglet conserve le joueur pour permettre son retour. L’hôte doit revenir pour lancer les manches suivantes ; transfert de rôle et exclusion ne sont pas encore disponibles.

Pile : React, Vite, Supabase Postgres/Auth/Realtime. Polices locales, illustrations SVG, aucune image distante au chargement.
