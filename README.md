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

## Station EcoScan et nouvelle simulation

Le site présente désormais une station modulaire à trois compartiments (PET, aluminium et papier) dessinée en CSS. C’est un design de concept, pas un plan de fabrication ni un équipement installé. La section « Comment ça fonctionnerait » explique l’orientation des objets, la collecte séparée, les niveaux de remplissage et le fonctionnement hors ligne. Une FAQ et une liste des conditions d’un pilote complètent la présentation.

La démo suit trois étapes : sélectionner un objet, cliquer sur « Simuler la lecture », puis choisir un compartiment. Un choix incorrect affiche une explication sans points. Pour le gobelet et l’emballage alimentaire, la réponse attendue est « Vérifier la consigne » car leur composition est incertaine. Une bonne réponse débloque la validation de 10 points fictifs, une seule fois par parcours ; « Recommencer un geste » permet un nouvel essai. Ces points ne prouvent aucune action réelle.

Le curseur de remplissage et la case « connexion coupée » ne pilotent aucun matériel. Le seuil de 85 % est choisi uniquement pour illustrer la démo. Tous les compteurs de station sont fictifs et aucune alerte n’est envoyée. Pour changer ces scénarios, modifiez `updateStation()` dans `script.js`. Pour adapter le design, modifiez les classes `.station-*` et `.physical-bin` dans `styles.css`.

Les mentions publiques du projet sont attribuées à Albin Krasniqi. Le brief d’origine dans `docs/BRIEF_SOURCE.md` reste conservé comme document historique de référence, sans servir de liste actuelle de fondateurs.
