# EcoScan / ÉcoNova — direction éditoriale

Proposition de contenu pour le site. Elle décrit une vision de produit et un programme d’essais, sans annoncer de matériel construit, de reconnaissance réelle, de pilote autorisé, de partenariat ou de performance mesurée.

## Une idée que l’on comprend en une phrase

**EcoScan** est le projet et l’interface envisagée. **ÉcoNova** est le nom proposé pour sa station de tri automatique. Les noms ne font pas l’objet d’une vérification juridique de disponibilité.

**Signature recommandée : « Un seul geste. Un nouveau cycle. »**

Version anglaise : **« One gesture. A new cycle. »**

Alternative plus sensible : **« Vous déposez. La matière continue. »** / **« You let go. Materials go on. »**

Mission : **Rendre le bon geste plus simple et la fin de vie des objets plus transparente — en réduisant d’abord, puis en triant ce qui reste.**

Phrase descriptive immédiatement sous le titre : **Une ouverture pour les recyclables autorisés. Un tri automatique envisagé à l’intérieur. Un retour compréhensible sur votre téléphone.**

Une ambition mondiale doit apparaître comme une direction, jamais comme une capacité actuelle. L’UNIL est le contexte d’une proposition académique ; l’ONU est une référence thématique à l’Agenda 2030. Les logos, labels et formulations « soutenu par » ne conviennent pas en l’absence d’accord.

## Parcours de lecture

Le site actuel contient beaucoup de sections. La prochaine amélioration doit surtout créer une hiérarchie, pas une deuxième page de slogans.

1. Comprendre l’objet en dix secondes : le problème, l’entrée unique, la coupe interne.
2. Voir une seule démonstration guidée : identifier la station, déposer, comprendre le résultat.
3. Explorer le mécanisme et ses limites : séparation, lecture, aiguillage, confirmation.
4. Comprendre le service réel : refus, entretien, collecte, récompenses non incitatives au gaspillage.
5. Lire le programme d’essais : comparaison, critères d’arrêt, budget à chiffrer.
6. Retrouver le projet académique, ses sources et ses ressources téléchargeables.

Réserver les textes détaillés aux accordéons et documents. Les états « Démo disponible », « Mécanique à prototyper » et « Pilote proposé » doivent être visibles dans leurs sections, sans répéter la même réserve après chaque phrase.

## Quatre fragments HTML prêts à intégrer

Les classes `section`, `eyebrow`, `lead`, `grid`, `three`, `note` et `button` sont déjà présentes dans le site. Les fragments sont autonomes et utilisent des titres explicites. Leur ordre suggéré est : `difference` après l’introduction de la station ; `parcours-responsable` après le fonctionnement ; `exploitation` après l’architecture ; `preuves` avec le programme de développement. Fusionner les parties anciennes qui recouvrent ces fragments pour éviter les répétitions.

### 1. La différence se trouve à l’intérieur

```html
<section class="section" id="difference" aria-labelledby="difference-title">
  <div class="eyebrow">LE CHANGEMENT DE GESTE</div>
  <h2 id="difference-title">Une seule ouverture.<br>Plusieurs nouvelles vies.</h2>
  <p class="lead">Aujourd’hui, on demande à chacun de reconnaître le matériau et de trouver le bon bac. ÉcoNova explore une autre répartition du travail : vous déposez les recyclables autorisés, la station prendrait en charge leur orientation.</p>
  <div class="grid three">
    <article>
      <span class="eyebrow">CÔTÉ UTILISATEUR</span>
      <h3>Moins de décisions.</h3>
      <p>Une entrée commune et des consignes visibles avant le dépôt. L’utilisateur ne choisit pas le compartiment. Les sacs fermés, liquides, batteries et objets dangereux ne font pas partie du parcours envisagé.</p>
    </article>
    <article>
      <span class="eyebrow">CÔTÉ STATION</span>
      <h3>Une décision expliquée.</h3>
      <p>Isoler l’objet, observer, comparer aux filières locales, puis l’aiguiller. Si l’objet est ambigu, le mettre à part pour contrôle plutôt que contaminer un lot de matière.</p>
    </article>
    <article>
      <span class="eyebrow">CÔTÉ COLLECTE</span>
      <h3>Des matières séparées.</h3>
      <p>Les compartiments resteraient distincts jusqu’à leur collecte. Un tri à l’entrée n’a d’utilité que si la séparation est conservée et si une filière accepte réellement les matières.</p>
    </article>
  </div>
  <p class="note">Principe de conception, pas fonctionnement matériel démontré. La séparation des objets est l’un des premiers verrous à tester : un mélange de recyclables n’est pas une simple somme d’images.</p>
  <a class="button" href="#demo">Comprendre avec la démo</a>
</section>
```

### 2. Une technologie utile sait aussi dire non

```html
<section class="section tint" id="parcours-responsable" aria-labelledby="responsable-title">
  <div class="eyebrow">DÉCISIONS DE CONCEPTION</div>
  <h2 id="responsable-title">Le bon résultat.<br>Même quand elle dit non.</h2>
  <p class="lead">L’automatisme ne doit pas masquer l’incertitude. Nous voulons un système qui explique ce qu’il accepte, protège les matières déjà triées et indique un autre chemin lorsque c’est nécessaire.</p>
  <div class="grid three">
    <article>
      <h3>Un matériau reconnu</h3>
      <p>L’objet serait envoyé vers une filière compatible. Les points éventuels n’arriveraient qu’après confirmation du passage, jamais au simple scan du QR code.</p>
    </article>
    <article>
      <h3>Un objet incertain</h3>
      <p>Un emballage composite ou un objet mal présenté demanderait un contrôle séparé. Aucun crédit ne devrait transformer une reconnaissance incertaine en validation.</p>
    </article>
    <article>
      <h3>Une station indisponible</h3>
      <p>Un bac plein, un blocage ou une panne devraient fermer le dépôt et afficher une consigne claire. L’utilisateur doit pouvoir annuler sa session et rejoindre un point de collecte adapté.</p>
    </article>
  </div>
  <details>
    <summary>Et si l’on n’a pas de téléphone ?</summary>
    <p>Le dépôt et ses instructions devraient rester accessibles sans smartphone. Le QR servirait au parcours de session et aux avantages éventuels ; il ne devrait pas conditionner l’accès au geste de tri. Cette possibilité doit être étudiée et testée sur le prototype.</p>
  </details>
  <details>
    <summary>Des points pour jeter davantage ?</summary>
    <p>Ce serait le mauvais signal. Un programme réel devrait limiter les abus, éviter d’encourager l’achat d’emballages et valoriser aussi la prévention ou le réemploi. La pertinence écologique des récompenses doit être évaluée ; les points de ce site restent fictifs.</p>
  </details>
</section>
```

### 3. Le produit continue après le dépôt

```html
<section class="section" id="exploitation" aria-labelledby="exploitation-title">
  <div class="eyebrow">LE SERVICE DERRIÈRE LA STATION</div>
  <h2 id="exploitation-title">Pensée pour le geste.<br>Et pour ceux qui la font vivre.</h2>
  <p class="lead">Une station ne se résume pas à un écran et un moteur. Elle doit être compréhensible pour les usagers, entretenue sans difficulté et raccordée au travail des équipes de collecte.</p>
  <div class="grid three">
    <article>
      <span class="eyebrow">AVANT L’OUVERTURE</span>
      <h3>Vérifier et préparer.</h3>
      <p>Contrôler les bacs, l’ouverture, la propreté des capteurs et les consignes. Un QR lisible devrait afficher le domaine EcoScan et l’identifiant de la station pour aider à repérer une étiquette remplacée.</p>
    </article>
    <article>
      <span class="eyebrow">PENDANT LE SERVICE</span>
      <h3>Voir les vrais besoins.</h3>
      <p>Suivre les niveaux et les anomalies utiles, plutôt qu’une surveillance des personnes. Documenter les refus, les blocages et le temps d’intervention pour identifier ce qui doit être amélioré.</p>
    </article>
    <article>
      <span class="eyebrow">À LA COLLECTE</span>
      <h3>Préserver la séparation.</h3>
      <p>Identifier chaque compartiment, vérifier sa destination et consigner les anomalies. Prévoir un accès technique sécurisé et des pièces remplaçables ; les interventions sur les mécanismes exigeraient une procédure adaptée.</p>
    </article>
  </div>
  <p class="note">Parcours d’exploitation proposé. L’accès technique, la sécurité des pièces mobiles, le nettoyage, les matériaux et la collecte doivent être définis avec des professionnels avant toute utilisation publique.</p>
</section>
```

### 4. Un projet crédible a le droit de changer d’avis

```html
<section class="section tint" id="preuves" aria-labelledby="preuves-title">
  <div class="eyebrow">LE PROGRAMME DE PREUVES</div>
  <h2 id="preuves-title">Construire une preuve.<br>Puis décider de la suite.</h2>
  <p class="lead">Nous ne voulons pas imposer une machine parce qu’elle paraît innovante. Nous voulons vérifier si elle rend le tri plus compréhensible, conserve les matières et peut être exploitée raisonnablement.</p>
  <div class="grid three">
    <article>
      <span class="eyebrow">01 / L’USAGE</span>
      <h3>Faire comprendre avant de fabriquer.</h3>
      <p>Observer des volontaires devant une maquette et la démo. Peuvent-ils repérer les objets autorisés, lancer un dépôt et comprendre un refus sans aide ? Comparer aussi à des bacs existants accompagnés d’une meilleure signalétique.</p>
    </article>
    <article>
      <span class="eyebrow">02 / LA MÉCANIQUE</span>
      <h3>Tester ce qui résiste au quotidien.</h3>
      <p>Utiliser un ensemble d’objets défini : déformés, humides, imbriqués ou mal présentés. Mesurer le cycle entier, les erreurs, les refus et les interventions. Un modèle rapide ne suffit pas si la séparation bloque.</p>
    </article>
    <article>
      <span class="eyebrow">03 / LE PILOTE</span>
      <h3>Décider à partir des résultats.</h3>
      <p>Si la sécurité et la faisabilité le permettent, proposer un pilote limité sous réserve d’autorisations. Comparer l’avant et l’après, la consommation d’énergie, la collecte et la maintenance. Publier aussi ce qui ne fonctionne pas.</p>
    </article>
  </div>
  <details>
    <summary>Qu’est-ce qui pourrait arrêter le projet ?</summary>
    <p>Une contamination supérieure à la solution de référence, une maintenance disproportionnée, des objets mal pris en charge ou un bénéfice insuffisant au regard des ressources consommées. Les critères et la méthode doivent être définis avant les essais ; aucun seuil de réussite n’est présenté comme déjà validé.</p>
  </details>
  <details>
    <summary>Qui porte le projet aujourd’hui ?</summary>
    <p>EcoScan est une proposition académique d’Albin Krasniqi — HEC Lausanne, Université de Lausanne. Les compétences à réunir pour la suite sont la conception mécanique, les filières de recyclage, la sécurité, l’accessibilité et l’exploitation. Il n’existe pas d’équipe industrielle ou de partenariat revendiqué ici.</p>
  </details>
  <a class="button" href="./docs/FAISABILITE.md" download>Télécharger le dossier de concept</a>
</section>
```

## Simplifier la simulation

Objectif : une personne doit comprendre l’entrée unique sans lire de notice, et garder la même compréhension sur téléphone.

- **Une seule action principale à la fois.** Au départ : « Commencer la démo ». Ensuite : « Déposer cet objet ». Après : « Faire un autre essai ». Les boutons d’échange, de remise à zéro et de test avancé sont secondaires.
- **Une démonstration guidée fonctionne avec un clic.** Préparer un scénario simple de canette, expliquer en une phrase qu’il est simulé, puis lancer session et dépôt successivement. Le glisser-déposer reste un bonus ; il ne doit jamais être nécessaire.
- **L’objet choisi précède la zone de dépôt.** « Choisir un objet pour la démo » évite de faire croire que le produit réel demande de déclarer son matériau. Commencer par un objet ; proposer le dépôt mélangé ensuite.
- **Le rendu montre la cause et le résultat.** Objet reçu → analyse → aiguillage → passage confirmé. Afficher un seul message d’étape en clair, une ouverture unique et le compartiment actif. Ne pas multiplier les panneaux techniques montrant le même état.
- **Deux couches de lecture.** Parcours simple pour tous, puis « Voir les détails techniques » pour le journal, la latence théorique, les scénarios d’incertitude et les niveaux simulés.
- **Le téléphone est un résultat, pas une étape à chercher ailleurs.** La connexion initiale se fait près de l’ouverture. Le reçu « Canette orientée vers l’aluminium · points fictifs ajoutés » apparaît immédiatement après validation.
- **Refus = résultat compréhensible.** Le gobelet composite peut illustrer le contrôle séparé. Le dire directement et afficher zéro point, sans signal rouge alarmiste ou faux diagnostic.
- **Pas de déplacement automatique de focus pendant un traitement.** Conserver la position, annoncer l’étape dans un statut sobre. Après une action explicite, proposer le nouveau résultat ou l’étape suivante.
- **Respecter toutes les capacités d’usage.** Touches Entrée/Espace, cibles tactiles généreuses, contrastes lisibles, sens jamais transmis par la seule couleur. Réduire les mouvements sans supprimer l’explication ; un texte et une coupe statique suffisent.
- **Vidéo + alternative de même qualité.** Une explication écrite en étapes reste visible sous la vidéo. Le lecteur indique la durée, permet une pause, propose une navigation par chapitre et n’oblige pas au plein écran. Une animation sans voix doit être nommée « film explicatif animé » plutôt que laisser attendre une narration audio.

## L’identité doit montrer le produit

Une composition originale peut évoquer un passage ouvert, une feuille et un cycle sans reprendre le logo de l’ONU ni fabriquer un emblème d’université. L’icône de recyclage universelle peut être utilisée comme signe pédagogique, pas comme certification. Le logo source du brief n’a pas été fourni : toute identité nouvelle doit être explicitement présentée comme une proposition, avec sa version monochrome et son texte de remplacement « EcoScan ».

La station n’a pas besoin de paraître invincible. Une coupe lisible, une ouverture humaine, une signalétique simple, un compartiment de contrôle et un accès de maintenance lui donnent plus de crédibilité qu’une surface couverte de lumières.

## Les formules à remplacer

| Formulation trop large | Formulation utile |
| --- | --- |
| « Révolutionner le monde du recyclage » | « Simplifier le dépôt et vérifier la séparation des matières » |
| « Une IA qui sait tout trier » | « Une reconnaissance à tester sur un périmètre d’objets défini » |
| « Sauvez la planète en gagnant des points » | « Réduire d’abord. Trier ce qui reste. Comprendre ce qui devient matière. » |
| « Scan en 5 ms » | « Cible de reconnaissance à étudier ; cycle complet à mesurer » |
| « Projet UNIL / ONU » | « Proposition académique dans le contexte UNIL ; référence aux thèmes de l’Agenda 2030 » |
| « Vos données sont sécurisées » | « La démo conserve le solde dans ce navigateur ; une app réelle exigerait un système distinct » |

## Ce que le site peut livrer et ce que le projet doit prouver

**Livrable immédiat :** site statique, design original proposé, film pédagogique, coupe conceptuelle, simulation accessible, exemples de QR ouvrant une URL, quiz, plan d’essais et documents téléchargeables.

**À développer séparément :** appareil physique, séparation des déchets, reconnaissance des matériaux, sûreté mécanique, capteurs et commande, application et serveur authentifiés, association fiable d’une session et d’un dépôt, récompenses, collecte, maintenance et validation environnementale.

Le site n’est pas une démonstration de ces performances. Il doit donner envie de les tester et rendre ces tests plus compréhensibles.
