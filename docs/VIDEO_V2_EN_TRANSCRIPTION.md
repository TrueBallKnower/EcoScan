# ÉcoNova — Film en anglais, transcription bilingue

Film de concept de 1 min 32 s. Voix anglaise de synthèse Kokoro `af_heart`, avec sous-titres français traduits et sous-titres anglais disponibles. La version française reste accessible au choix ; voir [sa transcription](VIDEO_V2_TRANSCRIPTION.md). Aucune machine réelle ni installation existante ne sont montrées.

## Ce que représente le film

Ce modèle compact est la référence visuelle commune du film, des illustrations et du blueprint ; il reste une étude de concept, et non une définition industrielle du produit final. L’architecture représente un principe à prototyper : entrée unique, présentation des objets un par un, capteurs, plaques articulées motorisées, trois filières et une voie de contrôle. La plaque principale bascule à gauche pour le PET et à droite pour le papier. Sa trappe centrale s’ouvre pour l’aluminium ; un clapet distinct dirige les objets incertains vers un bac arrière isolé. Les plaques se positionnent avant la libération, et les objets suivent ensuite une pente puis une chute dans leur compartiment. Le film représente une cinématique pédagogique : les forces, frottements, temps d’actionnement, rebonds et dégagements exacts restent à mesurer sur un prototype. Les filières PET, aluminium et papier sont un périmètre d’illustration à adapter avec le collecteur local. Le tri autonome, la sécurité mécanique, la cadence, les coûts, l’énergie et la connexion avec une future app restent à démontrer. La cible précédemment évoquée de 5 ms n’est pas une performance mesurée ; le film n’en revendique aucune.

Un QR public identifie une station mais ne prouve pas la présence de l’utilisateur. Une implémentation matérielle devra confirmer la session sur place, lier un dépôt confirmé à un événement unique et protéger le mécanisme contre l’accès, les liquides, les objets dangereux et les obstructions. Le portefeuille montré est une interface fictive.

Les « bouteilles en plastique » désignent ici la filière PET illustrée, selon les consignes locales. Le film ne propose pas de mélanger tous les plastiques. Le papier représente une extension du concept à valider ; le premier banc de test vise des bouteilles PET et des canettes connues.

## Transcription bilingue

### 00:00:00 — Une entrée. Un nouveau cycle.

**EN —** A simple gesture. A new cycle. Meet EcoNova, a concept designed to make recycling feel effortless.

**FR —** Un geste simple. Un nouveau cycle. Voici ÉcoNova, un concept conçu pour rendre le recyclage plus facile.

### 00:00:08 — Ouvrir une session

**EN —** Scan the station’s code to begin. A future app would confirm your session on site, ready for a verified deposit.

**FR —** Scannez le code de la station pour commencer. Une future application confirmerait votre session sur place, avant la validation du dépôt.

### 00:00:18 — Une seule ouverture

**EN —** Plastic bottles, cans, and accepted paper share one opening. Local collection rules guide every deposit: no liquids or hazardous waste.

**FR —** Bouteilles en plastique, canettes et papiers acceptés partagent une seule ouverture. Les consignes locales guident chaque dépôt : aucun liquide ni déchet dangereux.

### 00:00:28 — Séparer les objets

**EN —** Inside, a separator would present each object on its own, giving the sensors a clear view while checking for jams.

**FR —** À l’intérieur, un séparateur présenterait les objets un par un, pour dégager la vue des capteurs tout en surveillant les blocages.

### 00:00:39 — Observer et décider

**EN —** Light, cameras, and additional sensors would help identify the material. When confidence is low, EcoNova would hold the item for review.

**FR —** Un éclairage, des caméras et d’autres capteurs aideraient à identifier la matière. En cas de doute, ÉcoNova isolerait l’objet pour contrôle.

### 00:00:50 — Aiguiller les matières

**EN —** Plastic bottles slide to the left.

**FR —** Les bouteilles en plastique glissent à gauche.

**EN —** Cans fall through the central hatch.

**FR —** Les canettes passent par la trappe centrale.

**EN —** Paper follows the plate to the right.

**FR —** La plaque dirige le papier à droite.

**EN —** Uncertain items enter a separate holding bay.

**FR —** Les objets incertains rejoignent un compartiment séparé.

### 00:01:02 — Confirmer avant de créditer

**EN —** Only a verified deposit would add EcoPoints to your app. One deposit, one credit; this wallet is a demonstration.

**FR —** Seul un dépôt validé déclencherait des EcoPoints dans votre application. Un dépôt, un crédit ; ce portefeuille est une démonstration.

### 00:01:12 — Entretenir et mesurer

**EN —** Separate compartments keep materials apart. Accessible modules support cleaning and repair. A pilot would measure sorting accuracy, energy, cost, and reliability.

**FR —** Les compartiments maintiennent les matières séparées. Des modules accessibles facilitent le nettoyage et la réparation. Un pilote mesurerait la précision du tri, l’énergie, les coûts et la fiabilité.

### 00:01:23 — De la vision au prototype

**EN —** Our mission: make recycling simpler, then prove the impact. Next comes a prototype, and results everyone can inspect.

**FR —** Notre mission : simplifier le recyclage, puis démontrer l’impact. Prochaine étape : un prototype et des résultats vérifiables par tous.

## Production et accessibilité

Vidéo MP4 H.264 / audio AAC, 1280 × 720, 24 images/s. Les deux versions durent 1 min 32 s et utilisent exactement les mêmes images et les neuf mêmes chapitres. La lecture est volontaire, sans démarrage automatique. Les fichiers WebVTT et les transcriptions offrent une alternative textuelle.

Les images, animations et ambiance musicale sont des créations originales pour EcoScan. Les textes français et anglais sont originaux. Les voix de synthèse sont produites localement avec Kokoro ; les sources, licences et commandes de régénération figurent dans [VOIX_OFF.md](VOIX_OFF.md). Chaque chapitre est synthétisé d’un bloc pour conserver l’intonation et les pauses naturelles. La musique baisse pendant les explications.

Sources de production : `tools/render_film_v2_scene.py`, `tools/render_film_v2.py`, `tools/generate_voiceover.py`, `tools/narration_fr.json` et `tools/narration_en.json`. Aucun moteur vocal ni modèle n’est téléchargé par les visiteurs.
