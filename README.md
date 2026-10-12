# EcoScan

Site statique en français pour une campagne académique non lucrative sur le gaspillage des ressources à l’UNIL. Projet d’Albin Krasniqi — HEC Lausanne, Université de Lausanne. Aucun partenariat officiel ni déploiement sur le campus n’est revendiqué.

## Ouvrir le site

Aucune installation, compilation ou clé API n’est nécessaire. Ouvrez `index.html` dans votre navigateur. Pour tester avec un serveur local et une origine stable pour les points :

```sh
cd /workspace/EcoScan
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000` sur votre propre ordinateur. Dans Codex, le serveur sert aux tests internes ; aucun aperçu public n’est nécessaire.

## Où modifier quoi ?

- `index.html` : textes, sections, liens, objectifs et mentions de transparence.
- `styles.css` : couleurs (variables au début), typographie, animations et mise en page mobile.
- `script.js` : conseils des cinq objets (`items`), questions du quiz (`questions`), compteur fictif et menu mobile.
- `assets/` : ressources locales. Le favicon est une création abstraite, pas le logo original.
- `.nojekyll` : fichier vide à conserver pour l’hébergement statique.
- `docs/BRIEF_SOURCE.md` : brief original fourni, conservé comme référence et distingué des faits vérifiés.

Pour remplacer un texte, modifiez le passage dans `index.html`. Pour ajouter une image, déposez-la dans `assets/`, puis utilisez par exemple `<img src="./assets/mon-image.webp" alt="Description utile" width="800" height="1000">`. Conservez les chemins relatifs `./assets/...` pour fonctionner sous `/EcoScan/`. Les images et le logo d’origine mentionnés dans le brief ne sont pas inclus dans les fichiers transmis ; ils pourront être ajoutés sans les redessiner ni les déformer.

## Publication gratuite : quelques clics, une seule fois

Le dépôt existe déjà : https://github.com/TrueBallKnower/EcoScan

1. Vérifiez que `index.html`, `styles.css`, `script.js`, `assets/` et `.nojekyll` sont intégrés à la branche `main`.
2. Dans le dépôt GitHub, cliquez sur **Settings → Pages**.
3. Dans **Build and deployment**, choisissez **Source → Deploy from a branch**.
4. Choisissez **main** et **/(root)**, puis cliquez sur **Save**.
5. Consultez le statut de déploiement dans **Actions**, puis l’adresse affichée dans **Settings → Pages**. L’adresse attendue est `https://trueballknower.github.io/EcoScan/` ; elle ne fonctionne qu’après activation et déploiement réussis.

Si l’option Pages est indisponible pour un dépôt privé sur votre offre, un dépôt public est la solution gratuite la plus simple. Vérifiez les fichiers avant de changer leur visibilité.

**Le déploiement est automatique** : après activation, chaque nouveau commit publié sur `main` déclenche la mise à jour Pages. Aucun workflow YAML, service payant ou dépendance n’est requis. Attendez la fin du déploiement avant de vérifier la nouvelle version.

## Mettre à jour ensuite

Vous pouvez demander à Codex : « Modifie EcoScan pour …, teste sur mobile et ordinateur, puis prépare/publie la modification sur main ». Codex devra disposer d’un accès en écriture pour pousser le commit ; sinon, téléversez les fichiers modifiés depuis **Add file → Upload files**, puis validez le commit sur `main`. Vous pouvez aussi utiliser le crayon **Edit this file** sur GitHub pour un petit changement de texte.

Avant une mise à jour : vérifiez les liens, le menu mobile, les cinq objets de la démo, l’ajout de points, le rechargement, la remise à zéro et le quiz complet. Contrôlez les largeurs 360 px et ordinateur, la navigation au clavier et le mode de réduction des animations. Les modifications doivent être testées avant publication.

## Fonctions réelles et simulations

Réel : navigation, menu responsive, conseils pédagogiques, quiz de cinq questions avec correction et score, sélection de gestes, animations adaptées à `prefers-reduced-motion`.

Simulation : aucune reconnaissance IA, aucun scan de caméra, aucun capteur IoT, aucune vérification de tri. Les EcoPoints sont fictifs, sans récompense ni valeur financière. Seul le compteur est conservé localement sous la clé `ecoscan-demo-points` ; « Remettre les points à zéro » le réinitialise. Si le stockage est bloqué, la démo fonctionne pour la visite en cours. Le quiz et les gestes ne sont pas transmis ou conservés. Le contenu principal reste lisible sans JavaScript ; les interactions nécessitent JavaScript.

65 %, 40 % et 2030 sont des objectifs du support original, pas des résultats. Le site n’utilise aucun service tiers, police distante, outil analytique, formulaire, authentification ou backend. L’hébergement GitHub reste soumis à ses propres conditions et journaux techniques.

## Cadre de maintenance

Conservez les qualificatifs « concept », « simulation » et « objectif » tant qu’aucune preuve nouvelle n’est fournie. Remplacez les consignes générales seulement par des consignes locales vérifiées. N’ajoutez pas de contact, récompense ou partenariat présenté comme opérationnel sans confirmation.

## Tests automatisés (optionnels pour modifier le site)

`tests/smoke.cjs` conserve les tests de navigateur exécutés pendant la création. Ils utilisent Playwright et le Chromium système (`/usr/bin/chromium`) déjà disponibles dans cet environnement cloud ; ils ne sont pas des dépendances du site. Avec le serveur local lancé, exécutez :

```sh
node tests/smoke.cjs
```

Sur une autre machine, Playwright et Chromium doivent être installés séparément pour exécuter ces tests. Vous pouvez aussi utiliser les vérifications manuelles ci-dessus sans rien installer. `ECOSCAN_TEST_URL` permet de cibler une autre URL, y compris un chemin `/EcoScan`.

## ÉcoNova : la poubelle automatique EcoScan

ÉcoNova est le nom proposé pour la poubelle, avec la signature « Le tri entre dans une nouvelle ère ». EcoScan reste le nom du projet et de l’app envisagée. Il s’agit d’une proposition de nom, sans recherche juridique de disponibilité.

Le concept présente UNE ouverture pour l’utilisateur. À l’intérieur : séparation des objets, zone de reconnaissance, aiguillage vers des compartiments distincts et contrôle isolé pour les objets incertains. L’utilisateur n’a pas à choisir un bac. Les matières acceptées et la capacité à séparer un mélange doivent être définies et testées ; les sacs fermés et déchets dangereux ne sont pas supposés pris en charge.

Le parcours envisagé est : scan du QR de la station dans l’app → session identifiée → dépôt → reconnaissance et tri mécanique → confirmation → points sur le portefeuille → fin de session. La cible de 5 ms concerne une ambition de reconnaissance non démontrée, jamais le temps total de tri ou d’envoi des points.

### Blueprint

- `assets/econova-concept.png` : illustration générée du concept en coupe, avec annotations et téléphone ; pas un plan certifié.
- `assets/econova-blueprint.svg` : schéma vectoriel des étapes et du flux, modifiable et téléchargeable depuis le site.
- Aucun dimensionnement, coût, débit, précision ou performance matérielle n’est validé. La vue en coupe rend les bacs visibles pour expliquer l’intérieur ; ils ne sont pas des ouvertures utilisateur.

### Simulation web

Cliquez « Simuler la connexion à ECO-001 », choisissez un objet pour alimenter le scénario, puis « Déposer dans l’ouverture unique ». Pour PET, canette et papier, la démo sélectionne automatiquement la destination et crédite 10 points fictifs une seule fois par dépôt. Le scénario de dépôt mélangé montre trois objets séparés et routés en une seule action, avec 30 points fictifs. Pour un gobelet ou emballage incertain, elle montre le contrôle requis sans créditer de points.

« Préparer un nouveau dépôt » recommence un parcours. « Terminer la session simulée » déconnecte le téléphone de démonstration. Le rechargement ferme toujours la session mais conserve le solde local si le navigateur autorise le stockage. Une station pleine ou hors ligne bloque les nouveaux dépôts dans cette démo. Les objets déjà traités ne sont jamais recrédités en changeant ces options.

« Simuler un échange » retire 20 points uniquement si le solde suffit. Aucun cadeau, coupon, avantage réel ou partenariat n’est créé. Le compteur reste local au navigateur : pas de vraie connexion entre appareils, QR, compte, API, paiement ou app mobile.

La connexion réelle d’une poubelle à une app demanderait du matériel, des capteurs et moteurs, des essais de sécurité, un protocole authentifié, une validation des dépôts, une gestion des événements sans double crédit et un portefeuille côté serveur. Ce site gratuit reste une démonstration statique du concept.

Pour adapter les scénarios, modifier `updateAvailability()`, les données `items`, le traitement du bouton `scan` et `updateStation()` dans `script.js`. Le seuil de 85 % est un choix de démo. Pour le design, modifier les classes `.machine-*`, `.internal-bins`, `.phone-demo` et `.route-*` dans `styles.css`.

Les mentions publiques du projet sont attribuées à Albin Krasniqi. Le brief d’origine dans `docs/BRIEF_SOURCE.md` reste un document historique ; cette évolution vers le tri automatique suit la nouvelle demande du porteur du projet.

## Amélioration V2 — interaction et blueprint

Le site conserve son HTML/CSS/JavaScript natif, ses 18 sections et ses ressources PNG/SVG. Le blueprint PNG conserve l’illustration existante ; le SVG précise désormais caméra/éclairage, contrôle des inconnus, capteurs de remplissage et porte de collecte. Les vues « Extérieur / Coupe / Mécanisme » changent la présentation du même concept CSS, sans créer une preuve de produit réel. Les boutons de repères et de trajet sont utilisables au clavier.

La simulation permet le glisser-déposer à la souris, avec les événements natifs et une alternative par pointeur pour les navigateurs qui ne déclenchent pas le drag natif sur une carte. Au tactile et au clavier, sélectionner une carte d’objet puis utiliser le bouton « Déposer », ou focaliser l’ouverture et appuyer sur Entrée/Espace. Le scénario mélangé reste disponible dans la liste. Les étapes affichées sont : objet détecté → analyse simulée → routage simulé → validation ou contrôle requis. Aucun chronométrage matériel n’est affiché ; les animations ne sont pas une mesure de performance.

Un identifiant local d’opération protège la séquence asynchrone : chaque dépôt est crédité après validation et une seule fois. Déconnexion, mise hors ligne, remplissage d’un bac requis, nouveau dépôt et remise à zéro annulent toute opération non validée. Les callbacks d’animation annulés n’attribuent aucun point. La réduction des animations accélère la présentation tout en conservant les règles.

Le tableau de bord et le téléphone partagent le même solde. Les compteurs de dépôts validés sont locaux à la visite, la session se ferme au rechargement, et seul le portefeuille est conservé si le stockage est autorisé. Les trois niveaux sont réglés manuellement : ils ne constituent pas des mesures et ne changent pas automatiquement après un dépôt. PET plein ne bloque pas aluminium ; un mélange nécessite les trois bacs. Pour un objet inconnu, le chemin de contrôle n’est pas une filière recyclée et n’attribue aucun point.

« Nouveau dépôt » annule le traitement en cours et prépare un autre objet. « Remettre les points à zéro » réinitialise le portefeuille et le compteur de dépôts sans changer les niveaux. « Recommencer toute la démo » réinitialise aussi session, connexion, niveaux et sélection.

### Vérification V2

Avec un serveur Python actif, exécuter les deux suites :

```sh
node tests/smoke.cjs
node tests/upgrade.cjs
```

Pour tester le sous-chemin de publication, servir le parent du dépôt puis utiliser `ECOSCAN_TEST_URL=http://127.0.0.1:8010/EcoScan` devant chaque commande. La suite V2 vérifie aussi un glisser-déposer réel, le parcours avec écran tactile émulé, les interruptions pendant l’animation, le crédit unique, les remplissages distincts et les commandes du blueprint. Playwright/Chromium servent uniquement aux tests, sans dépendance ajoutée au site.

## Vision, QR et faisabilité — V3

Les sections `#vision-monde`, `#qr-session`, `#architecture`, `#faisabilite`, `#campus-pilote` et `#objectifs-mondiaux` explicitent le projet. Les références UNIL et ODD/ONU sont thématiques, sans partenariat officiel. Le dossier `docs/FAISABILITE.md` rassemble les limites techniques, les questions de sécurité, le protocole QR envisagé et les étapes avant un pilote.

Le QR local `assets/ecoscan-station-qr.svg` ouvre réellement `https://trueballknower.github.io/EcoScan/?station=ECO-001#demo`. La page confirme l’identifiant fictif mais ne connecte pas automatiquement une session. Aucun portefeuille entre appareils, caméra, authentification ou machine réelle. Un code copié ne constitue pas une preuve de présence.

Pour changer l’adresse du QR, modifier `URL` dans `tools/generate_qr.py` et régénérer le SVG avec le paquet Python optionnel `qrcode==8.2`. Le paquet est uniquement un outil de génération hors ligne : aucune dépendance ajoutée au site ou au déploiement.

La simulation propose maintenant une entrée guidée avec un seul bouton qui reflète l’état partagé de la station. Le calculateur de faisabilité compare des hypothèses de flux et de cycle complet ; sa formule et ses limites sont visibles. Ses chiffres ne sont jamais des performances mesurées ni des économies de CO₂.

Vérification supplémentaire : `node tests/vision.cjs`, avec `ECOSCAN_TEST_URL` pour choisir l’adresse du serveur comme pour les autres suites. Les tests de navigateur vérifient le parcours guidé, les hypothèses de capacité et l’arrivée par l’URL QR.

## Film explicatif et animations

La section `#video-explicative` héberge un vrai MP4 H.264 de 1 min 48 (1280 × 720), créé pour le concept ÉcoNova. Neuf chapitres expliquent session QR, dépôt, séparation, scan, aiguillage, contrôle, points et collecte. Le film est animé, sans voix off, avec textes intégrés et sous-titres français optionnels. `docs/VIDEO_TRANSCRIPTION.md` conserve la transcription complète ; une version lisible est également disponible directement sous le lecteur.

La vidéo ne démarre pas automatiquement, utilise `preload="none"` et s’affiche avec une image d’attente. Choisir un chapitre charge les métadonnées et positionne le lecteur sans lancer la lecture. Les contrôles natifs permettent pause, plein écran et réglages selon le navigateur. Aucun hébergement vidéo payant ni lecteur tiers.

Pour modifier le film, adapter `SCENES` dans `tools/render_explainer.py`, puis exécuter ce générateur hors ligne avec Python/Pillow et ffmpeg. Le site et GitHub Pages n’ont besoin d’aucun de ces outils : les fichiers MP4/JPEG/VTT préproduits sont conservés dans `assets/`. Le film utilise des schémas originaux ; il ne documente pas une machine fabriquée et ne mesure aucune performance.

Les apparitions au scroll, les cartes décalées et les interactions des boutons respectent `prefers-reduced-motion`. Le contenu principal reste visible sans JavaScript, et la lecture vidéo reste manuelle même quand les animations sont activées. La progression de lecture est décorative et ne collecte aucune donnée.

Vérification : `node tests/media.cjs` (même configuration Playwright/Chromium et `ECOSCAN_TEST_URL` que les autres suites). La suite vérifie lecture réelle, durée, recherche des chapitres, sous-titres, téléchargements, absence d’autoplay et affichage responsive.
