# ÉcoNova — Une entrée. Un nouveau cycle.

Film de concept original de 1 min 32 s. Mise en scène 3D de l’architecture envisagée, animation pédagogique et ambiance sonore originale. Voix française de synthèse locale, sous-titres français synchronisés et transcription ci-dessous. Aucune machine réelle ni installation existante ne sont montrées.

## Ce que représente le film

Ce modèle compact est la référence visuelle commune du film, des illustrations et du blueprint ; il reste une étude de concept, et non une définition industrielle du produit final. L’architecture représente un principe à prototyper : entrée unique, présentation des objets un par un, capteurs, plaques articulées motorisées, trois filières et une voie de contrôle. La plaque principale bascule à gauche pour le PET et à droite pour le papier. Sa trappe centrale s’ouvre pour l’aluminium ; un clapet distinct dirige les objets incertains vers un bac arrière isolé. Les plaques se positionnent avant la libération, et les objets suivent ensuite une pente puis une chute dans leur compartiment. Le film représente une cinématique pédagogique : les forces, frottements, temps d’actionnement, rebonds et dégagements exacts restent à mesurer sur un prototype. Les filières PET, aluminium et papier sont un périmètre d’illustration à adapter avec le collecteur local. Le tri autonome, la sécurité mécanique, la cadence, les coûts, l’énergie et la connexion avec une future app restent à démontrer. La cible précédemment évoquée de 5 ms n’est pas une performance mesurée ; le film n’en revendique aucune.

Un QR public identifie une station mais ne prouve pas la présence de l’utilisateur. Une implémentation matérielle devra confirmer la session sur place, lier un dépôt confirmé à un événement unique et protéger le mécanisme contre l’accès, les liquides, les objets dangereux et les obstructions. Le portefeuille montré est une interface fictive.

## Transcription

### 00:00:00 — Une entrée. Un nouveau cycle.

Un seul geste. Un nouveau cycle.

Imaginez ÉcoNova, la station qui veut rendre le recyclage évident.

### 00:00:08 — Ouvrir une session

Scannez le QR code de la station.

Votre future application ouvrirait une session confirmée sur place.

Le dépôt, lui, sera vérifié ensuite.

### 00:00:18 — Une seule ouverture

Bouteille, canette : les recyclables acceptés entrent dans une seule ouverture.

Les consignes s’adaptent aux filières locales.

Sans liquides ni déchets dangereux.

### 00:00:28 — Séparer les objets

À l’intérieur, les objets avanceraient un par un.

Un séparateur doit gérer les mélanges, repérer les blocages et présenter chaque objet correctement.

### 00:00:39 — Observer et décider

Les capteurs observeraient l’objet dans une zone éclairée.

Plusieurs mesures aideraient à identifier la matière.

Un doute ? La station choisit le contrôle.

### 00:00:50 — Aiguiller les matières

La plaque dirige le PET à gauche.

La trappe s’ouvre : l’aluminium descend au centre.

À droite, la plaque dirige le papier.

Un clapet séparé isole les objets incertains.

### 00:01:02 — Confirmer avant de créditer

Le passage confirmé déclencherait vos EcoPoints.

Un dépôt, une validation.

Les points rejoindraient votre portefeuille ; ici, ils restent fictifs.

### 00:01:12 — Entretenir et mesurer

Les matières se collecteraient séparément.

Des modules accessibles faciliteraient le nettoyage et la réparation.

Un pilote mesurera tri, énergie, coût et disponibilité.

### 00:01:23 — De la vision au prototype

ÉcoNova est un concept à prototyper.

Notre mission : simplifier le tri, prouver l’impact.

Prochain pas : un pilote, des résultats vérifiables.

## Production et accessibilité

Vidéo MP4 H.264 / audio AAC, 1280 × 720, 24 images/s. Le film est lancé volontairement par le visiteur, sans lecture automatique. La piste française est fournie séparément au format WebVTT. Les chapitres permettent d’accéder directement à un principe ; cette transcription constitue une alternative textuelle complète.

Les sources de production sont `tools/render_film_v2_scene.py` et `tools/render_film_v2.py`. Elles utilisent des outils hors ligne et ne créent aucune dépendance du site. Les images, animations et ambiance sonore de ce film sont des créations originales réalisées pour EcoScan.

La narration française est produite localement avec le modèle neural Kokoro, voix française SIWIS ; le texte est original et les sources et licences sont détaillées dans [VOIX_OFF.md](VOIX_OFF.md), avec un générateur hors ligne `tools/generate_voiceover.py`. La voix est mixée au premier plan ; la musique baisse pendant les explications.
