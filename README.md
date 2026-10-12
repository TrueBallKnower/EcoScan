# EcoScan — Un seul geste. Un nouveau cycle.

Projet académique indépendant porté par **Albin Krasniqi**, dans le cadre d’une campagne non lucrative pour réduire le gaspillage des ressources. EcoScan est le projet ; **ÉcoNova** désigne le concept de station ECO-001 : une ouverture commune, un tri interne envisagé et un portefeuille de points.

Site public : https://trueballknower.github.io/EcoScan/

Aucune station réelle, reconnaissance IA, récompense commerciale ni partenariat officiel UNIL/ONU n’est revendiqué. Le site est un démonstrateur statique, pas une application connectée à du matériel.

## Ouvrir et modifier le site

Le site utilise **HTML, CSS et JavaScript natifs**, sans compilation, compte, clé API, framework ou abonnement. Ouvrez `index.html` dans un navigateur ou démarrez un serveur local :

```sh
cd /workspace/EcoScan
python3 tools/serve_local.py --port 8000
```

Sur votre propre ordinateur, consultez `http://localhost:8000`. Dans Codex, le serveur sert uniquement aux tests internes. Le serveur fourni prend en charge les plages d’octets nécessaires aux chapitres MP4 ; la production GitHub Pages les gère directement.

| Fichier | Usage |
| --- | --- |
| `index.html` | Textes, sections, ancres, ordre du récit et liens |
| `styles.css` | Styles des composants, responsive et animations |
| `product.css` | Nouvelle direction visuelle : hero, simulation, laboratoire, marque |
| `script.js` | Session fictive, objets, dépôt, points, quiz, niveaux, vidéo et calculateur |
| `product.js` | Protocoles téléchargeables et reçu de dépôt |
| `experience-navigation.js` / `.css` | Cinq parcours, ancres, historique, focus et transitions |
| `experience-shop.js` / `.css` | Prototype d’app, catalogue et confirmation d’échange |
| `assets/` | Logo, illustrations, blueprint, QR, films et sous-titres locaux |
| `docs/` | Faisabilité, recherche, références, stratégie et transcriptions |
| `tools/` | Serveur local et générateurs hors ligne des médias |
| `tests/` | Vérifications de navigateur, sans dépendance du site en production |

Pour remplacer un texte, modifiez `index.html`. Pour ajouter une image, utilisez un chemin relatif `./assets/nom.webp`, un texte alternatif utile et les dimensions réelles. Les chemins relatifs garantissent le fonctionnement sous `/EcoScan/`.

## Publication gratuite et mises à jour

Le dépôt existe : https://github.com/TrueBallKnower/EcoScan

Dans **Settings → Pages**, sélectionner **Deploy from a branch → main → /(root) → Save**. Aucun workflow personnalisé, dossier `dist/` ou compilation n’est nécessaire. Conserver `.nojekyll` à la racine.

**Chaque commit poussé sur `main` déclenche le déploiement.** Vérifier la coche verte de `pages build and deployment` dans Actions, puis le site public. Si le navigateur conserve une ancienne version, actualiser complètement. L’hébergement gratuit d’un dépôt privé dépend de l’offre GitHub ; un dépôt public est la voie gratuite habituelle après vérification des fichiers.

Vous pouvez demander à Codex : « Modifie EcoScan pour …, teste sur mobile et ordinateur, puis publie sur main ». Sans accès en écriture, téléverser les fichiers via **Add file → Upload files**, puis créer un commit sur `main`. Une petite modification de texte peut aussi se faire avec le crayon GitHub.

## Parcours, app et boutique

La navigation présente cinq parcours : **Découvrir, Essayer, Construire, Mission et Ressources**. Le JavaScript affiche un groupe de sections à la fois ; les anciennes ancres et le précédent/suivant fonctionnent toujours. Les contenus restent tous lisibles sans JavaScript. Pour ajouter une section, donner à son élément `<section>` un `data-view-group` parmi `discover`, `try`, `build`, `mission` et `resources`, puis adapter les raccourcis dans `experience-navigation.js` si nécessaire. Changer de parcours conserve le DOM, la session et le portefeuille ; quitter le film le met en pause. Les transitions courtes respectent la réduction des mouvements. Sur mobile, le bouton de navigation indique le parcours actuel.

L’app dans `#app` est un prototype intégré à la page : Parcours, Portefeuille et Boutique. Elle partage la session et le solde central de `script.js`, sans caméra, géolocalisation, compte ni installation. `#boutique` explore trois concepts utiles : la pochette seconde vie à 20 points, le carnet Loop à 30 points et le sac ReCycle à 40 points fictifs. Les visuels de studio générés illustrent leurs formes et textures ; ce ne sont pas des photographies de produits fabriqués. Choisir un produit ouvre sa fiche en haut, puis une confirmation ; annuler ne débite rien. Un portefeuille vide et un solde insuffisant proposent directement le dépôt fictif existant, sans ajouter de points. La confirmation vérifie le produit, son montant, le solde et l’absence de dépôt en cours ; un même événement ne débite qu’une fois. Il n’existe aucune commande, réservation, livraison ou produit disponible.

Seul le solde survit au rechargement. Le dernier échange et le registre de demandes appartiennent à la visite ; remettre les points à zéro les efface et ferme la confirmation. Les descriptions de matières recyclées sont des intentions à valider. Réemploi et réparation restent prioritaires. Les contrats sont documentés dans `docs/BOUTIQUE_APP.md` et la suite dans `docs/ROADMAP.md`.

## Ce qui fonctionne et ce qui reste conceptuel

**Réel sur le site :** navigation, menu mobile, contenus, QR vers la page, glisser-déposer ou bouton de dépôt, quiz, animations, lecteur vidéo natif, chapitres, protocole Markdown téléchargeable et calculateur de capacité théorique.

**Simulation :** connexion à ECO-001, reconnaissance, routage et validation, niveaux des bacs, portefeuille et échange de points. Aucun appareil, caméra, compte ou serveur n’est connecté. L’objet sélectionné alimente une règle de démo ; il ne demande pas à l’utilisateur de choisir un vrai bac.

PET, canette et papier créditent 10 points fictifs après validation ; le mélange exploratoire en crédite 30. Gobelet ou emballage incertain suit la voie de contrôle, sans points. Chaque opération est créditée une seule fois ; déconnexion, mode hors ligne, bac requis plein ou annulation avant validation empêchent le crédit. Un PET plein ne bloque pas l’aluminium ; un mélange nécessite les trois bacs.

Les niveaux sont réglés manuellement et ne mesurent rien. « Nouveau dépôt » prépare un autre essai. « Remettre les points à zéro » réinitialise le portefeuille et le nombre de dépôts validés. « Recommencer toute la démo » réinitialise aussi connexion, niveaux et sélection. L’échange fictif retire 20 points si le solde suffit, sans bon réel ni partenariat.

Seul le solde est conservé localement sous `ecoscan-demo-points`. Session et compteurs de visite ne survivent pas au rechargement. Si le stockage est bloqué, la démo reste utilisable pour la visite en cours. Quiz, protocoles et gestes ne sont pas transmis. Aucun analytics, police distante ou service tiers n’est chargé par le site.

Le calculateur utilise `capacité = 60 / cycle_en_secondes * disponibilité`. Les entrées sont des hypothèses fictives ; pics, mélanges, pannes et distributions ne sont pas modélisés. Aucun débit matériel ou gain carbone n’en est déduit.

## Identité, blueprint, QR et films

L’identité originale est dans `logo-ecoscan.svg`, `logo-ecoscan-light.svg`, `ecoscan-symbol.svg` et `favicon.svg`. Le symbole associe feuille, boucle et repères de scan. La proposition de nom ÉcoNova n’a pas fait l’objet d’une vérification juridique de disponibilité.

`econova-compact-studio.webp` sert de couverture (1600 × 1200). Les vues `econova-compact-exterior.webp`, `econova-compact-cutaway.webp` et `econova-compact-mechanism.webp` reprennent le modèle Blender du film (1440 × 1080). Le blueprint `econova-blueprint-v2.svg`, `.png` et `.webp` décrit le même modèle compact : entrée haute, séparation, capteurs, plaques articulées vers PET/papier, trappe aluminium et contrôle isolé à l’arrière. Aucune dimension, pièce construite, conformité ou performance n’est validée. Le QR représenté dans ces études est illustratif.

La première image large `econova-studio.webp` apparaît seulement dans « Explorer l’étude grand format » : une variante exploratoire distincte, sans dimensions ni débit validés.

Le QR **réellement scannable** est `ecoscan-station-qr.svg`. Il ouvre `https://trueballknower.github.io/EcoScan/?station=ECO-001#demo`, puis demande une confirmation fictive. Il ne transfère aucun point entre appareils et ne prouve aucune présence ou dépôt. Pour changer l’URL, modifier `tools/generate_qr.py` et régénérer le SVG avec le paquet Python optionnel `qrcode==8.2`.

Le film principal est `econova-film-v2-en.mp4` : **92 secondes**, 720p, H.264/AAC, avec narration anglaise (Kokoro / Heart) et sous-titres français. `econova-film-v2.mp4` est la version française corrigée (SIWIS). Les chapitres sont racontés d’un bloc, à vitesse naturelle, et parlent de bouteilles en plastique sans épellation de PET. Les deux films possèdent le même flux d’images ; seule la voix change. La musique originale baisse pendant les explications. Les plaques latérales, la trappe centrale, le volet de contrôle et leurs actionneurs bougent avant le passage des objets ; cette mise en scène n’est pas une validation mécanique. Les chapitres sont dans `econova-film-v2-chapters.json`, les captions dans `econova-film-v2-fr.vtt` et les transcriptions dans `docs/VIDEO_V2_TRANSCRIPTION.md` et `docs/VIDEO_V2_EN_TRANSCRIPTION.md`. Le sélecteur English / Français conserve la position et l’état de lecture. La version anglaise possède `econova-film-v2-en.vtt` et sa traduction `econova-film-v2-en-fr.vtt`. La vidéo ne démarre pas automatiquement ; `preload="none"` évite de charger le film tant que le visiteur n’interagit pas. Choisir un chapitre autorise son chargement, sans lecture automatique.

Les générateurs `render_film_v2.py` et `render_film_v2_scene.py` utilisent Blender, Python/Pillow et ffmpeg hors ligne. `render_compact_model.py` reprend leur géométrie pour les vues du site. `generate_voiceover.py` produit la narration à partir de `narration_fr.json` et `narration_en.json` ; les fichiers de modèle, l’installation optionnelle et leurs licences sont expliqués dans `docs/VOIX_OFF.md`. Aucune synthèse ne s’exécute lors de la visite du site. Ces outils ne sont **pas nécessaires pour modifier les textes ou publier le site**. Les médias historiques sont conservés sans être la présentation actuelle.

## Faisabilité et sources

- `docs/FAISABILITE.md` : besoin, architecture, périmètre du banc, sécurité, QR/événements uniques, étapes avec critères de passage, coûts complets et mesure environnementale.
- `docs/RECHERCHE_INNOVATION.md` : cinq sources réellement consultées, URLs, auteurs, dates, observations et limites. Des projets expérimentaux ne prouvent pas une capacité industrielle d’ÉcoNova.
- `docs/CONTENT_STRATEGY.md` : mission, slogans, récit et choix éditoriaux.
- `docs/BRIEF_SOURCE.md` : document historique reçu ; il ne constitue pas une liste actuelle de fondateurs.

Un dossier de présentation partageable est disponible dans `assets/EcoScan-dossier-concept.zip` : synthèse, faisabilité, recherche, roadmap, app/boutique, logo, blueprint, QR et transcriptions. Le régénérer avec `python3 tools/make_presentation_kit.py` après changement de ces documents. La vidéo se consulte sur le site pour garder l’archive légère.

Le premier banc proposé vise PET de boisson et canettes connues ; papier et mélanges libres demandent des essais supplémentaires. Une commande moteur ne prouve pas une arrivée : prévoir confirmations de passage et de position avant points. Les 5 ms restent une cible non démontrée de reconnaissance, jamais un temps de tri complet. Les 65 %, 40 % et 2030 restent les objectifs du support initial, pas des résultats.

Les références UNIL/ONU sont un cadre académique et thématique. Aucun partenaire, financement, site pilote ou récompense n’est acquis. Un site gratuit ne rend pas le matériel, la sécurité et l’exploitation gratuits. Un vrai portefeuille demanderait un service authentifié et une validation matérielle ; GitHub Pages seul ne les fournit pas.

## Vérifier avant publication

Les tests utilisent Playwright et `/usr/bin/chromium`, déjà disponibles dans cet environnement cloud. Sur une autre machine, ces outils s’installent séparément uniquement si vous voulez exécuter les suites ; des vérifications manuelles suffisent pour un changement de texte.

Avec le serveur local actif :

```sh
node tests/smoke.cjs
node tests/upgrade.cjs
node tests/vision.cjs
node tests/product.cjs
node tests/media.cjs
node tests/experience.cjs
node tests/workspace.cjs
node tests/shop.cjs
node tests/ergonomics.cjs
```

Pour vérifier le chemin de publication, servir le parent du dépôt puis cibler `/EcoScan` :

```sh
python3 tools/serve_local.py --directory /workspace --port 8011
ECOSCAN_TEST_URL=http://127.0.0.1:8011/EcoScan node tests/media.cjs
```

La simulation affiche un reçu près de l’ouverture, issu du même solde que le téléphone. Le mélange est aiguillé un objet après l’autre ; annulation et réinitialisation masquent le reçu. Le bouton des plaques rejoint leur chapitre vidéo ; le repère actif suit aussi les commandes natives. Le menu mobile conserve des cibles de 44 px et une commande de retour en haut.

Les suites couvrent parcours normal, crédit unique, annulations, objet incertain, échange, stockage bloqué, clavier, tactile, glisser-déposer, QR, calculateur, protocole téléchargé, vrais médias, recherche des chapitres, no-JS et plusieurs largeurs dès 360 px.

Avant de publier : vérifier les liens et images, tester le menu mobile, le quiz complet, les erreurs de la démo et la réduction des animations. Conserver les mentions « concept », « simulation » et « objectif » jusqu’à fourniture de preuves ; ne pas ajouter de contact, récompense ou partenaire opérationnel sans confirmation.
