# ÉcoNova — Transcription de la version française

Film de concept de 1 min 32 s. Voix française de synthèse Kokoro `ff_siwis`, narration continue par chapitre et sous-titres français fidèles. La version anglaise avec sous-titres français est aussi disponible ; voir [sa transcription bilingue](VIDEO_V2_EN_TRANSCRIPTION.md). Aucune machine réelle ni installation existante ne sont montrées.

## Ce que représente le film

Ce modèle compact est la référence visuelle commune du film, des illustrations et du blueprint ; il reste une étude de concept, et non une définition industrielle du produit final. L’architecture représente un principe à prototyper : entrée unique, présentation des objets un par un, capteurs, plaques articulées motorisées, trois filières et une voie de contrôle. La plaque principale bascule à gauche pour le PET et à droite pour le papier. Sa trappe centrale s’ouvre pour l’aluminium ; un clapet distinct dirige les objets incertains vers un bac arrière isolé. Les plaques se positionnent avant la libération, et les objets suivent ensuite une pente puis une chute dans leur compartiment. Le film représente une cinématique pédagogique : les forces, frottements, temps d’actionnement, rebonds et dégagements exacts restent à mesurer sur un prototype. Les filières PET, aluminium et papier sont un périmètre d’illustration à adapter avec le collecteur local. Le tri autonome, la sécurité mécanique, la cadence, les coûts, l’énergie et la connexion avec une future app restent à démontrer. La cible précédemment évoquée de 5 ms n’est pas une performance mesurée ; le film n’en revendique aucune.

Un QR public identifie une station mais ne prouve pas la présence de l’utilisateur. Une implémentation matérielle devra confirmer la session sur place, lier un dépôt confirmé à un événement unique et protéger le mécanisme contre l’accès, les liquides, les objets dangereux et les obstructions. Le portefeuille montré est une interface fictive.

## Transcription

### 00:00:00 — Une entrée. Un nouveau cycle.

Un geste simple. Un nouveau cycle. Voici ÉcoNova, un concept conçu pour rendre le recyclage plus facile.

### 00:00:08 — Ouvrir une session

Vous scannez le code de la station pour commencer. Votre application ouvrirait une session confirmée sur place, avant de vérifier chaque dépôt.

### 00:00:18 — Une seule ouverture

Bouteilles et canettes acceptées entreraient au même endroit. Vous suivez les consignes locales, sans liquides ni déchets dangereux.

### 00:00:28 — Séparer les objets

À l’intérieur, un séparateur présenterait chaque objet un par un, pour dégager la vue des capteurs tout en surveillant les blocages.

### 00:00:39 — Observer et décider

Dans une zone éclairée, plusieurs mesures aideraient à reconnaître la matière. Si le résultat est incertain, la station choisit une voie de contrôle.

### 00:00:50 — Aiguiller les matières

Les bouteilles en plastique glissent à gauche.

Les canettes passent par la trappe centrale.

La plaque dirige le papier à droite.

Un bac séparé recueille les objets incertains.

### 00:01:02 — Confirmer avant de créditer

Seul un dépôt validé déclencherait des points dans votre application. Un dépôt, une validation ; ici, les points sont fictifs.

### 00:01:12 — Entretenir et mesurer

Les matières seraient collectées séparément. Des modules accessibles faciliteraient le nettoyage et la réparation. Un pilote mesurera tri, énergie, coût et disponibilité.

### 00:01:23 — De la vision au prototype

Notre mission : rendre le tri plus simple, puis en démontrer l’impact. Prochaine étape : un prototype et des résultats vérifiables par tous.

## Production et accessibilité

Vidéo MP4 H.264 / audio AAC, 1280 × 720, 24 images/s. Les deux versions durent 1 min 32 s et utilisent exactement les mêmes images et les neuf mêmes chapitres. La lecture est volontaire, sans démarrage automatique. Les fichiers WebVTT et les transcriptions offrent une alternative textuelle.

Les images, animations et ambiance musicale sont des créations originales pour EcoScan. Les textes français et anglais sont originaux. Les voix de synthèse sont produites localement avec Kokoro ; les sources, licences et commandes de régénération figurent dans [VOIX_OFF.md](VOIX_OFF.md). Chaque chapitre est synthétisé d’un bloc pour conserver l’intonation et les pauses naturelles. La musique baisse pendant les explications.

Sources de production : `tools/render_film_v2_scene.py`, `tools/render_film_v2.py`, `tools/generate_voiceover.py`, `tools/narration_fr.json` et `tools/narration_en.json`. Aucun moteur vocal ni modèle n’est téléchargé par les visiteurs.
