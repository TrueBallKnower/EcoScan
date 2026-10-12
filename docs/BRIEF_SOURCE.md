# ECOSCAN — PROMPT AUTONOME A COPIER DANS CODEX

**Ce fichier contient toutes les consignes de codage, le contenu original des neuf slides, et le cadre UNIL.**
Si les illustrations sont disponibles dans un dossier `assets`, utilise-les ; sinon réalise les visuels avec des formes CSS et des médias librement utilisables, sans bloquer le développement.

---

# CODEX — MISSION DE CREATION DU SITE ECOSCAN

**Tu es chargé de DÉVELOPPER et TESTER le site, pas de produire seulement un plan ni un PowerPoint.**

Lis avant de coder :
1. `CONSIGNES_UNIL.md` — priorités universitaires.
2. `CONTENU_POWERPOINT.md` — transcription complète des 9 slides originales.
3. `CONTENU_POWERPOINT.json` — même contenu en format machine-readable.
4. `assets/` — 6 images originales optimisées, à intégrer si disponibles.

Si tu ne peux pas accéder à ces fichiers, lis `PROMPT_UNIQUE_ECOSCAN_CODEX.md` qui contient tout le brief textuel. Ne prétends pas avoir lu un fichier absent.

## 1. RESULTAT RECHERCHE

Créer **EcoScan**, un vrai site web gratuit, beau, réactif, professionnel, complet et facilement modifiable. Son identité doit associer :
- une campagne environnementale internationale (impact émotionnel et sérieux),
- la précision d'un site Apple (typographie, fluidité, hiérarchie),
- une dimension cinématographique « sauver notre planète » (Terre, nature, défis),
- l'identité d'EcoScan (vert/turquoise/bleu et illustrations d'origine),
- **UNIL comme cadre de campagne à but non lucratif**, pas un partenariat signé.

**Conserver le fond et remixer la forme.** Garder les concepts de **chaque slide**, enrichir les explications et ne pas réduire le site à 3 cartes. Raconter l’histoire : planète → enjeu ressources → défis UNIL → EcoScan → gestes concrets → impact envisagé → mobilisation.

### Slogans possibles (discrets, en complément du texte français)
- ONE PLANET. ONE FUTURE.
- CHANGE THE HABIT. CHANGE THE FUTURE.
- SMALL ACTIONS. GLOBAL IMPACT.
- WE DON'T JUST RECYCLE WASTE. WE RECYCLE HABITS.
- THE REVOLUTION STARTS HERE.

## 2. TECHNIQUE — SIMPLE ET SANS FRAIS

Site **statique uniquement** : `index.html`, `styles.css`, `script.js`, `assets/`, `README.md`, idéalement sans compilation.

- HTML/CSS/JavaScript natif. Pas de React/Next, backend, base de données, authentification, abonnement, API payante ou variables secrètes.
- Animations CSS et `IntersectionObserver`, éventuellement GSAP par CDN **facultatif**, avec une version fonctionnelle sans la bibliothèque.
- Liens relatifs `./assets/...` pour GitHub Pages sous `/EcoScan/`.
- Projet accessible à la souris, au tactile, au clavier et sur mobile. Respecte `prefers-reduced-motion`.
- Les visuels et les contenus doivent s'afficher même si une animation ne peut pas se charger.
- Les démos peuvent utiliser `localStorage` et doivent être indiquées comme **simulations**.
- Aucun appel à un backend fictif, aucun bouton inactif, aucun contact fictif présenté comme opérationnel.
- Construire directement dans la racine du dépôt GitHub. **Pas de dossiers `dist/`, `public/` ou `site/` à publier**, sauf nécessité expliquée.
- Prévoir `.nojekyll` vide pour publication statique simple.

## 3. DIRECTION ARTISTIQUE

Style premium, cinématographique, institutionnel, émotionnel, mais clair et crédible. Ajouter un hero spectaculaire inspiré de la Terre / nature / océan, un mouvement de caméra léger si réalisable en CSS, parallaxe modérée, grands messages, sections éditoriales alternées, animations au scroll, effets de profondeur subtils, cartes et compteurs lisibles.

Palette indicatrice : vert profond `#075F55`, turquoise `#13A89E`, pastel `#B9DFC9`, bleu clair `#A8D9E9`, blanc cassé `#F7FAF8`, texte sombre `#172522`.

Ne pas modifier le logo EcoScan original et ne pas copier le logo de l’ONU. Utiliser `assets/slide_01.webp` comme identité source si disponible. Les images source sont **verticales** : leur mise en page doit respecter le recadrage.

## 4. SECTIONS EXIGEES

1. **Hero / grande introduction** : EcoScan, logo original, slogan « Smart Recycling for a Sustainable Future », lien « Découvrir » et « Agir à l'UNIL ».
2. **Notre planète / gaspillage des ressources** : enjeux, matériaux, extraction, pollution, énergie, comparaison prévention/réemploi/recyclage.
3. **Le problème initial** : confusion du tri, contamination, manque de mesure, motivation faible. Représenter les trois problèmes de la slide 2.
4. **Pourquoi l'UNIL ?** : affiches, cafétérias, campus, rôle des étudiants, campagne non lucrative, sans prétendre à un déploiement autorisé.
5. **Scan → Sort → Earn** : présenter clairement les 3 étapes du produit selon la slide 3, avec illustrations ou simulation d'interface.
6. **Technologies envisagées** : reconnaissance visuelle IA, limites de la reconnaissance d'un matériau, codes-barres, consignes locales, IoT/capteurs, données agrégées et protection des données (slide 4).
7. **EcoPoints** : compteur local de démonstration, participation, défis et récompenses écologiques hypothétiques. Aucun partenariat inventé (slide 5).
8. **Réduire avant de recycler** : réduire, réemployer, réparer, recycler ; écogestes adaptés au campus ; limiter gaspillage alimentaire, impressions, emballages et produits jetables.
9. **Démo EcoScan interactive** : sélectionner bouteille PET, canette, papier, gobelet de café et emballage alimentaire ; présenter des conseils généraux prudents et un moyen de réduire le déchet. Bouton de points fictifs avec stockage local + reset. **Pas de vraie reconnaissance IA prétendue**.
10. **Mini-quiz** : au moins 5 questions interactives, feedback explicatif, résultat + bouton recommencer.
11. **Impact et ambitions** : **65 %** de réduction des erreurs de tri et **40 %** de participation sont des **objectifs du PowerPoint, pas des mesures** ; horizon **2030** est une ambition théorique, jamais un déploiement acquis. Ajouter une proposition de KPI et mesure avant/après ; toutes données d'exemple = « simulation » (slide 6).
12. **Notre mission** : « We don't just recycle waste. We recycle habits. », développer une vision convaincante ancrée dans le réel (slide 7).
13. **Campagne campus / feuille de route** : affiches, QR codes, communication, pilotage, tests utilisateurs, évaluation, extension éventuelle ; idées prospectives.
14. **Participer / pied de page / sources** : appel à agir sans inscription factice, « Projet académique — HEC Lausanne, Université de Lausanne », Albin Krasniqi et Romain Nauer ; partenaires et investissement présents dans la slide 8 doivent être recontextualisés vers une **mobilisation non lucrative** ; conserver une conclusion visuelle « Thank you » (slide 9).

Chaque section doit contenir des textes explicatifs détaillés, mais élégamment mis en page : pas uniquement des slogans.

## 5. FIDELITE, SOURCES, PRUDENCE

- La source de référence **principale** est `CONTENU_POWERPOINT.md` / `.json`. Les textes y sont verbatim ; ne pas en corriger silencieusement les chiffres.
- Un chiffre « nearly one in three items » est mentionné à la slide 2 **sans source** ; ne pas le reprendre comme vérité scientifique vérifiée.
- Un logo « M » présent sur la slide 5 n'est pas une preuve de partenariat officiel.
- Pas de vraie application déployée, vérification automatisée réelle, récompenses réelles, données d'utilisateurs, ou KPI réels sans preuve fournie.
- Si tu ajoutes des faits extérieurs, donne **source, URL, organisme et année** ; si tu ne peux pas vérifier, préfère des explications qualitatives et des exemples sans chiffres.
- Les 3 aspects détaillés de l'évaluation universitaire ne sont pas disponibles dans les consignes transmises : ne pas les inventer.
- Respecter le cadre **campagne non lucrative à l'UNIL**, tout en présentant EcoScan comme un concept technologique ambitieux.

## 6. CHECKLIST FONCTIONNELLE ET LIVRABLES

**Produis des fichiers, pas seulement une description.** Après création :

- Tester l'ouverture du menu mobile, CTA, scroll fluide, navigation clavier.
- Tester « sélection d'un déchet → fiche », compteur EcoPoints fictifs → sauvegarde locale → remise à zéro, quiz → score → recommencer.
- Tester desktop et mobile, responsive à 360px, images et chemins relatifs, animations scroll, reduced motion.
- Prévoir la robustesse si JavaScript est désactivé (contenu principal visible).
- Créer un README simple : où sont les fichiers, comment remplacer un texte / image, comment ouvrir le site, comment activer GitHub Pages.
- Vérifier que `index.html` se trouve à la racine, que tous les fichiers requis sont ajoutés au dépôt et qu'aucune dépendance payante n'est nécessaire.
- Si tu as les permissions GitHub adéquates, prépare un commit ou PR et explique comment l'intégrer à `main`; n'affirme pas avoir publié si tu ne peux pas vérifier.
- Explique quelles fonctions sont réelles et lesquelles sont des démonstrations.

**Important pour le déploiement** : publication GitHub Pages via `Settings` → `Pages` → `Deploy from a branch` → `main` → `/(root)` → `Save` lorsque les fichiers ont été intégrés à `main`. Ne pas publier avant validation du code.

**Commence immédiatement le développement et crée une première version complète.**


---

# Brief universitaire — captures fournies

## Texte des consignes reçues

> Travail à fournir
>
> Vous êtes chargé(e)s de développer une campagne publicitaire à but non lucratif visant à encourager les comportements pro-environnementaux sur le campus de l'UNIL. Vous devez développer trois aspects de la campagne pour lesquels des instructions claires et un modèle Powerpoint seront fournis ces prochaines semaines.

> Thématique 3 — la consommation de ressources, par exemple :
>
> Réduire le gaspillage des ressources sous d'autres formes.

## Contraintes impératives

- Campagne **à but non lucratif** ; public-cible principal : communauté de l'UNIL.
- Contribuer à la **réduction du gaspillage des ressources**, pas seulement au tri.
- EcoScan est le **concept présenté** ; l'UNIL ou l'ONU ne doivent jamais apparaître comme partenaires officiels sans preuve.
- Les trois aspects détaillés annoncés par les enseignants **n'étaient pas présents** dans les captures communiquées ; ne pas inventer ces exigences.
- Les applications, vérifications IA, équipements IoT, comptes, partenariats, chiffres d'impact doivent être décrits comme concept/prototypes/projections selon les informations disponibles.


---

# EcoScan — contenu exact du PowerPoint (9 slides)

> Transcription fidèle du contenu textuel fourni, sans corriger les erreurs de frappe d’origine. Les images locales optimisées sont référencées sous chaque slide.
> Les termes « 65 % », « 40 % », « 2030 » décrivent des objectifs/ambitions, non des résultats vérifiés.

## Slide 01 — EcoScan Corporation

**Bloc 1**

EcoScan Corporation

**Bloc 2**

Smart Recycling for a Sustainable Future

**Bloc 3**

Innovating for a cleaner tomorrow.

**Bloc 4**

Presented by Albin Krasniqi and Romain Nauer

**Bloc 5**

EcoScan Corporation | www.ecoscan.ch

**Illustration issue de la slide :** `assets/slide_01.webp`

## Slide 02 — The heat of the Problem: Inefficient Recycling Systems

**Bloc 1**

The heat of the Problem: Inefficient Recycling Systems

**Bloc 2**

Despite growing environmental awareness, current recycling infrastructures are confusing, inefficient, and fail to provide meaningful feedback or rewards, leading to systemic waste contamination.

**Bloc 3**

Confusion & Contamination

**Bloc 4**

People aspire to recycle correctly, but confusing local guidelines mean nearly one in three items ends up in the wrong bin, undermining the entire process.

**Bloc 5**

Lack of Accountability

**Bloc 6**

Cities and corporate waste managers struggle with opaque systems, unable to accurately track waste streams or quantify the impact of community initiatives.

**Bloc 7**

Low Motivation

**Bloc 8**

There is minimal incentive for citizens to invest time and effort in proper sorting beyond civic duty, resulting in low long-term engagement.

**Bloc 9**

EcoScan Corporation | www.ecoscan.ch

**Illustration issue de la slide :** `assets/slide_02.webp`

## Slide 03 — The Solution: , Verified Recycling

**Bloc 1**

The Solution: , Verified Recycling

**Bloc 2**

EcoScan transforms a confusing chore into a rewarding daily habit by leveraging consumer technology to verify correct sorting in real-time.

**Bloc 3**

Scan

**Bloc 4**

Users scan the item's barcode or packaging via the EcoScan app to instantly receive precise, local sorting instructions.

**Bloc 5**

Sort

**Bloc 6**

The item is correctly deposited. EcoScan technology (AI recognition) verifies the sorting decision at the point of action.

**Bloc 7**

Earn

**Bloc 8**

Successful verification triggers the distribution of EcoPoints, making every correct action instantly rewarding.

**Bloc 9**

EcoScan Corporation | www.ecoscan.ch

**Illustration issue de la slide :** `assets/slide_03.webp`

## Slide 04 — Proprietary Technology Stack

**Bloc 1**

Proprietary Technology Stack

**Bloc 2**

EcoScan uses a powerful blend of cutting-edge technologies to ensure accuracy, transparency, and scalable data generation for our partners.

**Bloc 3**

AI-Powered Verification

**Bloc 4**

Advanced image recognition and machine learning verify material composition and sorting compliance in real-time, drastically reducing mis-sorting.

**Bloc 5**

IoT Integration

**Bloc 6**

Seamless integration with smart bins and public waste infrastructure (current and future) provides a smooth user experience and accurate data capture.

**Bloc 7**

Data & Sustainability Analytics

**Bloc 8**

Our platform generates granular data on waste streams, citizen engagement, and verified environmental impact for corporate and municipal partners.

**Bloc 9**

EcoScan Corporation | www.ecoscan.ch

**Illustration issue de la slide :** `assets/slide_04.webp`

## Slide 05 — EcoPoints: Driving Value Through Partnerships

**Bloc 1**

EcoPoints: Driving Value Through Partnerships

**Bloc 2**

Our rewards system is built on strong partnerships, creating a circular economy where correct sorting benefits both the consumer and eco-conscious businesses.

**Bloc 3**

The Rewards Ecosystem

**Bloc 4**

EcoPoints are earned for every successfully verified recycling action.

**Bloc 5**

Points are accumulated in the user's digital wallet.

**Bloc 6**

Redemption options focus on sustainable goods and services.

**Bloc 7**

Each correct action creates measurable, verifiable value for the planet and partners' sustainability reports.

**Bloc 8**

Premier Retail Partners (Initial Phase)

**Bloc 9**

EcoScan Corporation | www.ecoscan.ch

**Illustration principale extraite :** aucune pour cette slide dans ce kit.

## Slide 06 — Verified Impact and Growth Trajectory

**Bloc 1**

Verified Impact and Growth Trajectory

**Bloc 2**

EcoScan is poised to deliver significant environmental and economic benefits, starting with a robust foundation in Switzerland and expanding across Europe.

**Bloc 3**

65%

**Bloc 4**

Reduction in Mis-sorting

**Bloc 5**

Targeted reduction in waste contamination, leading to higher quality recycled materials.

**Bloc 6**

40%

**Bloc 7**

Increase in Citizen Engagement

**Bloc 8**

Projected increase in active participation in recycling programmes within partner municipalities.

**Bloc 9**

2030

**Bloc 10**

European Expansion Goal

**Bloc 11**

Scalable model ready for deployment across core European markets by the end of the decade.

**Bloc 12**

EcoScan Corporation | www.ecoscan.ch

**Illustration principale extraite :** aucune pour cette slide dans ce kit.

## Slide 07 — Our Mission

**Bloc 1**

Our Mission

**Bloc 2**

We don’t just recycle waste — we recycle habits.

**Bloc 3**

Our core purpose is to leverage technology to redefine the relationship between individuals and their environment, fostering conscious consumption and responsibility at a global scale.

**Bloc 4**

EcoScan Corporation | www.ecoscan.ch

**Illustration issue de la slide :** `assets/slide_07.webp`

## Slide 08 — Join Us: Invest in Sustainable Habits

**Bloc 1**

Join Us: Invest in Sustainable Habits

**Bloc 2**

Let’s turn recycling from a necessary chore into a rewarding, impactful daily habit for millions.

**Bloc 3**

Partnership Opportunities

**Bloc 4**

Collaborate on rewards programmes and access unique, verified sustainability data.

**Bloc 5**

Investment Potential

**Bloc 6**

Support a high-growth, scalable platform addressing a critical global waste management issue.

**Bloc 7**

EcoScan Corporation — HEC Lausanne

**Bloc 8**

contact@ecoscan.ch | www.ecoscan.ch

**Bloc 9**

EcoScan Corporation | www.ecoscan.ch

**Illustration principale extraite :** aucune pour cette slide dans ce kit.

## Slide 09 — Thank You For Your Attention.

**Bloc 1**

Thank You For Your Attention.

**Bloc 2**

We look forward to building a cleaner tomorrow, together.

**Bloc 3**

EcoScan Corporation | www.ecoscan.ch

**Illustration issue de la slide :** `assets/slide_09.webp`
