# EcoScan / ÉcoNova — de l’idée au premier pilote

**Dossier de concept, version du 12 octobre 2026.** Projet académique indépendant d’Albin Krasniqi — HEC Lausanne, Université de Lausanne. Les illustrations expliquent une architecture envisagée ; elles ne constituent pas des plans de fabrication. Aucun équipement installé, partenariat UNIL/ONU, récompense réelle ni performance matérielle validée.

## La mission

Rendre le bon geste simple et préserver la valeur des matières. ÉcoNova reçoit des recyclables autorisés par **une seule ouverture**, sépare les objets à l’intérieur, choisit une filière locale et confirme leur arrivée dans des compartiments distincts. EcoScan est le parcours sur téléphone et le retour pédagogique envisagés. L’utilisateur ne choisit pas un bac interne.

Réduire, réemployer et réparer restent prioritaires. Un équipement sophistiqué n’a de sens que si son bénéfice mesuré justifie sa fabrication, son énergie et son entretien.

## Ce qui existe, et ce qui reste à construire

| Niveau | État actuel | Prochaine preuve nécessaire |
| --- | --- | --- |
| Présentation | Site statique, film pédagogique, plans de concept | Compréhension du parcours par des utilisateurs |
| Démonstration | Scénarios de tri, QR public, EcoPoints fictifs locaux | Aucun dépôt physique vérifié par cette démo |
| Prototype matériel | Architecture proposée uniquement | Séparation, reconnaissance et routage sur un banc fermé |
| App connectée | Parcours et écrans de démonstration | Station authentifiée, sessions et registre serveur |
| Impact | Hypothèses et objectifs | Mesure avant/après, destination des matières et bilan complet |

Le QR ECO-001 ouvre réellement la page publique. Il ne prouve ni la présence d’un utilisateur, ni l’existence d’une station, ni un droit à des points. Le site n’analyse pas de photos et ne commande aucun moteur.

## Le périmètre qui rend un premier prototype crédible

L’ambition reste le **dépôt mélangé par une ouverture unique**. Le premier banc doit toutefois travailler sur un mélange connu, limité et reproductible. Proposition à discuter avec les collecteurs : bouteilles de boisson PET et canettes admises par la filière locale, vides, en vrac et dans une enveloppe de formats définie. Un aspect visuel « plastique » ne suffit pas à autoriser n’importe quel emballage dans la filière PET-boisson.

Le papier/carton est une extension à tester séparément : humidité, plis, formats et contact avec des contenants sales changent les contraintes. Un troisième compartiment représenté dans un blueprint ne démontre pas la capacité à recycler ces matières.

**À exclure du premier périmètre :** sacs fermés, restes alimentaires, liquides, verre, piles/batteries, déchets électriques, objets coupants, déchets médicaux et produits chimiques. Une liste visible à côté de l’ouverture doit présenter les formats autorisés et les alternatives de dépôt. Les objets incertains ne doivent jamais être déclarés recyclés par défaut.

## L’intérieur, étape par étape

| Module | Fonction envisagée | Essai qui doit la démontrer |
| --- | --- | --- |
| Réception protégée | Recevoir un petit lot sans accès aux pièces mobiles | Objets à plat/de travers, chevauchements, accès accidentel |
| Séparation interne | Doser et espacer les objets avant lecture | Mélanges, contenants écrasés, objets imbriqués, blocage |
| Zone de lecture | Éclairage stable, caméra et pesée éventuelle | Salissure, étiquette absente, couleur, contenu résiduel |
| Décision | Croiser observations et filières locales | Inconnus, classes proches, capteur en panne, faible confiance |
| Aiguillage | Diriger vers un compartiment autorisé | Position atteinte et passage réellement confirmés |
| Contrôle isolé | Retenir les cas incertains sans crédit | Bac de contrôle plein, traitement par un opérateur |
| Collecte | Sortir des contenants séparés et identifiés | Temps, manutention, nettoyage, traçabilité de destination |

La séparation d’un mélange est le premier risque technique : une caméra ne peut pas identifier correctement un objet caché sous un autre. On compare d’abord plusieurs mécanismes simples sur un banc ; on choisit celui qui résiste aux objets représentatifs avant de dessiner une belle coque. Aucun compacteur ni broyeur n’est nécessaire pour démontrer le premier cycle de tri.

Une caméra reconnaît des apparences. Elle ne certifie pas, à elle seule, une composition chimique, une matière multicouche ou l’acceptation locale. La pesée peut détecter une incohérence ; elle ne prouve pas l’absence de tout liquide. D’autres capteurs deviennent pertinents seulement si les essais montrent leur utilité. Les seuils de confiance doivent être calibrés sur des exemples indépendants, pas affichés comme des pourcentages de certitude absolue.

Les prototypes publics étudiés associent déjà vision, pesée, moteurs ou confirmation par capteur. Ils fournissent des pistes et des méthodes d’essai, sans prouver la fiabilité d’ÉcoNova. Les observations et leurs sources sont détaillées dans [RECHERCHE_INNOVATION.md](./RECHERCHE_INNOVATION.md).

## Les 5 millisecondes : mesurer le cycle complet

Les 5 ms sont une ambition initiale non démontrée. Il faut distinguer capture, calcul de reconnaissance, séparation, mouvement mécanique, confirmation de passage et synchronisation des points. Même une inférence rapide ne supprime pas le temps physique de déplacement d’un déchet.

Le banc doit horodater chaque étape, publier le temps typique **et** les cycles lents, puis mesurer les files lors de dépôts successifs. Le calculateur du site illustre seulement `capacité = 60 / secondes_par_objet × disponibilité`. Il ne prédit pas les pointes d’affluence, les objets imbriqués, les pannes ou la cadence d’une machine réelle.

## QR, session et portefeuille : un chemin précis

1. **Identifier.** Le QR fixe contient une URL HTTPS et un identifiant de station, sans identifiants secrets. Le téléphone affiche clairement le domaine et la station avant confirmation. L’étiquette doit être inspectée pour limiter les substitutions.
2. **Associer.** Une station réelle et un service authentifiés délivrent une confirmation locale et une session courte, réservée à une personne. Un code fixe photographié ne suffit pas. La confirmation de présence doit être choisie puis testée, avec une alternative accessible.
3. **Déposer.** Le contrôleur suit les objets du lot ; la fermeture de session doit empêcher d’attribuer les déchets de l’utilisateur suivant au précédent.
4. **Vérifier.** Un événement unique n’est émis qu’après un passage physiquement confirmé. Il associe station, session, identifiant de dépôt et statut. Il ne contient pas de photo ou d’identité supplémentaire par défaut.
5. **Créditer.** Le service vérifie l’authenticité et l’unicité de l’événement. Le même événement reçu deux fois ne produit qu’un crédit. Une requête envoyée par le navigateur ne suffit jamais à créer des points.
6. **Clore.** Expiration, annulation, panne et fin de dépôt sont explicites. Hors ligne, l’état des points reste « en attente » jusqu’à vérification ; aucune promesse de crédit instantané n’est faite.

Ce protocole est à construire. Il ne fonctionne pas sur GitHub Pages seul. Le site de présentation peut rester gratuit et statique ; une station et un portefeuille réels demandent un contrôleur, un service sécurisé, des sauvegardes et une exploitation. Un serveur local peut servir au banc de test, sans abonnement imposé. Cela ne garantit pas une exploitation publique gratuite.

## Sécurité, inclusion et vie privée dès le prototype

Avant un accès public, un spécialiste doit évaluer les risques liés aux moteurs, pincements, électricité, liquides, feu, manutention et entretien. L’ouverture doit empêcher l’accès aux pièces mobiles. Une porte de maintenance ouverte doit mettre les mouvements dans un état sûr ; nettoyage et déblocage se font hors énergie par une personne formée. L’arrêt et la reprise après coupure doivent être testés. Ce dossier ne certifie aucune conformité.

Les indications doivent être compréhensibles sans couleur seule, sans animation et sans smartphone. Le concept doit prévoir un dépôt sans compte : l’accès au tri ne devrait pas dépendre de l’obtention de points. Hauteur, force nécessaire, espace d’approche et lisibilité se valident avec des usagers représentatifs.

Une caméra doit viser l’intérieur de la zone de lecture. Traitement local envisagé, conservation minimale et journaux limités : ne pas filmer les visages, enregistrer les téléphones ou suivre les trajets pour trier une canette. Définir qui accède aux données, leur conservation, leur suppression et la gestion d’un incident avant une vraie app. La démo actuelle conserve uniquement des points fictifs dans le navigateur, sans compte ni analytics tiers.

## Construire dans le bon ordre

Les durées ne sont pas promises. Chaque phase débloque la suivante seulement si ses critères sont convenus et démontrés.

| Phase | Travail concret | Condition de passage |
| --- | --- | --- |
| 0 — Besoin et filières | Observer le tri actuel, tester la signalétique, confirmer matières et collecte avec les responsables | Un besoin réel et une destination acceptée pour chaque matière |
| 1 — Parcours | Tester la page, le QR, les consignes, le dépôt sans téléphone et l’attente avec des volontaires | Les participants comprennent quoi déposer et quoi faire en cas d’erreur |
| 2 — Séparation | Banc fermé, petit mélange connu, essais de mécanismes, arrêt sûr | Les objets sont réellement présentés un par un ; les blocages sont détectés |
| 3 — Lecture et aiguillage | Jeu de test indépendant, inconnus, pesée, confirmations de passage, bacs pleins | Résultats par matière documentés ; aucun crédit sans passage confirmé |
| 4 — Exploitation | Nettoyage, porte de maintenance, coupure courant/réseau, changement de bac, réparation | Procédures reproductibles et risques évalués par les responsables compétents |
| 5 — Pilote autorisé | Un site limité, opérateur identifié, collecte existante et comparaison avant/après | Autorisations obtenues, mesures transparentes et décision d’arrêt possible |
| 6 — Extension éventuelle | Revoir données, coûts et impact ; ajouter une difficulté à la fois | Bénéfice supérieur à une solution plus simple et maintenance soutenable |

**Décision d’arrêt :** si une signalétique claire et des bacs existants font aussi bien avec moins de ressources, choisir cette solution. Si la séparation ne résiste pas aux vrais dépôts, revoir le mécanisme avant de promettre une nouvelle filière. Si la sécurité ou la collecte ne sont pas assurées, ne pas ouvrir le pilote.

## Mesurer sans fabriquer un succès

Avant les essais, convenir du protocole, des erreurs acceptables et d’un état initial. Conserver les objets de test et faire vérifier leur destination par une observation indépendante.

| Indicateur | Définition à fixer avant l’essai |
| --- | --- |
| Qualité des matières | Proportion des bonnes matières dans chaque bac, avec une mesure en masse adaptée au collecteur |
| Acceptation à tort | Objets non admissibles néanmoins dirigés vers une filière de recyclage |
| Refus à tort | Objets admissibles envoyés au contrôle, rapportés aux objets admissibles testés |
| Séparation | Lots entièrement séparés, objets doubles, objets restant dans le mécanisme |
| Cycle et attente | Début/fin explicites, distribution des durées et attente des personnes |
| Exploitation | Blocages, minutes d’intervention, nettoyage, disponibilité et nombre de collectes |
| Compréhension | Réussite du parcours, erreurs, besoin d’aide, accès avec/sans téléphone |
| Points | Doubles événements, interruption de session et attribution à la mauvaise personne |
| Ressources | Électricité en veille/en cycle, pièces remplacées, eau/consommables et transport de collecte |

Rapporter tous les dépôts observés, y compris refus et pannes. Une excellente pureté obtenue en refusant presque tout ne suffit pas. Comparer la station à des bacs avec de bonnes consignes sur une période et un contexte comparables ; documenter fréquentation, menus, événements et autres changements qui pourraient expliquer les écarts.

Le jeu d’images doit être séparé par **objets physiques** entre apprentissage et test : des vues de la même bouteille dans les deux ensembles gonfleraient les résultats. Tester orientation, écrasement, salissure, lumière et marques inconnues. Prévoir une classe de contrôle et communiquer les limites par famille d’objets.

## Budget et entretien : ce qu’il faut vraiment chiffrer

Aucun prix n’est présenté comme acquis. Demander des devis après le choix du mécanisme, en réutilisant si possible un banc et du matériel disponibles. Distinguer prix des composants, conception et exploitation.

| Poste | Ce qui peut manquer dans une simple liste de composants |
| --- | --- |
| Structure et mécanique | Fabrication, protections, guidages, assemblage, pièces d’usure et reprises |
| Capteurs et commande | Éclairage, calibration, alimentation protégée, câblage, confirmation de position/passage |
| Informatique | Développement, sécurité, sauvegardes, connectivité et mises à jour |
| Validation | Essais, avis spécialisés, autorisations, assurance applicable et documentation |
| Exploitation | Personnel, nettoyage, énergie, consommables, vidange, transport et refus |
| Fin de vie | Démontage, récupération des pièces, filière des électroniques et matériaux |

Les choix circulaires proposés sont une coque démontable, des fixations accessibles, des modules remplaçables et des matériaux choisis selon réparabilité, nettoyage et filière réelle. Une apparence verte ou l’impression 3D ne prouvent pas un moindre impact. La teneur en matière recyclée doit être documentée par le fournisseur avant d’être annoncée.

## Évaluer le bénéfice environnemental

Comparer deux systèmes rendant le même service : quantité, qualité et destination des matières sur une période donnée. Inclure fabrication et fin de vie de la station, électricité en veille, réparations, nettoyage, collecte supplémentaire et traitement des refus. Vérifier que les matières mieux triées sont réellement reprises par une filière, sans confondre « dans le bac » et « effectivement recyclées ».

Ne pas transformer un nombre de points ou d’objets en CO₂ économisé. Une estimation carbone future demande méthode, périmètre, facteurs identifiés, hypothèses visibles et incertitudes. Mesurer les déchets évités ou le réemploi séparément. Les récompenses ne devraient pas pousser à produire davantage d’emballages : tester des plafonds et des défis de réduction sans leur attribuer aujourd’hui de valeur réelle.

## Premier pilote : dossier à préparer

Avant de demander une installation, préparer une page précisant lieu envisagé, matières, présence de l’opérateur, collecte, accès, procédures d’arrêt/nettoyage, protection des données, métriques et critères d’arrêt. Associer les personnes qui vidangeront et répareront l’équipement dès la conception. Aucun contact, autorisation ou financement n’est déjà obtenu.

L’UNIL est le public-cible d’une proposition académique. Les ODD 12, 9 et 13 sont des thèmes de réflexion de l’Agenda 2030, pas un label ou partenariat ONU. Les objectifs initiaux de 65 %, 40 % et 2030 restent non validés. ÉcoNova est une proposition de nom sans recherche juridique de disponibilité.

**Documentation :** [recherche et sources consultées](./RECHERCHE_INNOVATION.md) ; [brief historique](./BRIEF_SOURCE.md). Consignes locales, autorisations et conformité devront être vérifiées auprès des organismes compétents avant toute réalisation physique.
