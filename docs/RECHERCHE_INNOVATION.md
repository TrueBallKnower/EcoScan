# EcoScan — inspirations étudiées, preuves et décisions

**Recherche consultée le 12 octobre 2026, Europe/Zurich.** L’objectif est de retenir des principes utiles au prototype, au récit et à l’interface. Aucun projet cité n’est partenaire d’EcoScan. Nous ne reprenons ni leurs logos, ni leur code, ni leurs performances comme des résultats d’ÉcoNova.

Les pages commerciales de TOMRA, Bin-e et AMP, ainsi que les pages Apple et Ellen MacArthur visées pour cette recherche, ont été inaccessibles : le proxy réseau répondait « 403 Forbidden ». Nous ne prétendons pas les avoir consultées. La recherche a donc porté sur des sources publiques accessibles : dépôts originaux, documentation et code lus via GitHub. Les témoignages des auteurs restent des descriptions de leurs projets, sans validation industrielle indépendante.

## 1. Un prototype concret vaut mieux qu’une promesse globale

**Source lue :** *Cost Effective Reverse Vending Machine*, dépôt de `xTRam1`, README modifié le 4 janvier 2021 et fichiers de commande/reconnaissance. Le README identifie caméra Raspberry Pi, modèle TensorFlow Lite, cellule de pesée avec amplificateur HX711 et moteurs. Il propose des tests séparés puis un parcours intégré.

**Observation dans le code :** `recycle_flow()` classe un objet, rejette une classification absente ou une masse hors intervalle, commande les moteurs puis ajoute un montant local. L’envoi d’une commande moteur n’y constitue pas, à lui seul, la preuve d’un passage physiquement confirmé.

**Pour EcoScan :** tester chaque module, croiser les observations, prévoir un contrôle et créditer seulement après confirmation indépendante de passage. Rendre lisible « dépôt → traitement → validation » dans la démo.

**Limite :** aucune preuve d’une séparation de mélange libre, d’une reconnaissance universelle ou d’une exploitation publique sûre. Nous ne reprenons pas sa tarification ou ses hypothèses réglementaires.

- Auteurs : équipe publiée par `xTRam1`, contributeur Lütfi Eren Erdoğan.
- Année vérifiée : version du README **2021**.
- [README consulté, version figée](https://github.com/xTRam1/Cost-Effective-Reverse-Vending-Machine-Project/blob/e8620eff3dc35ae8b158222f521e6e6e61d20f6d/README.md).
- [Commande du cycle consultée](https://github.com/xTRam1/Cost-Effective-Reverse-Vending-Machine-Project/blob/main/main_main_flow.py).
- [Tests du modèle consultés](https://github.com/xTRam1/Cost-Effective-Reverse-Vending-Machine-Project/blob/main/ai_training/test.py).

## 2. La fiabilité vient de boucles confirmées et de calibration

**Sources lues :** *WALL-F Waste Sorting Robot*, README, `design-process.md` et `waste-sorting-algorithm.md`. Le dépôt présente un projet étudiant pour DESN1000, filière ELEC, à l’UNSW. Les objets triés sont des **balles colorées représentant des déchets**, dans une arène. Une caméra suit les couleurs ; un capteur infrarouge confirme la capture.

Le processus documente plusieurs mécanismes explorés, une pince contrôlable, des essais avant intégration, une coque démontable et des problèmes d’alimentation/masse commune corrigés. Il demande de refaire les calibrations selon les conditions physiques.

**Pour EcoScan :** comparer les mécanismes avant de figer le dessin ; détecter réellement prise et passage ; rendre la coque démontable ; traiter calibration, alimentation et maintenance comme des fonctions du produit. Montrer les capteurs de confirmation et l’accès opérateur dans le blueprint.

**Limite :** un succès en arène avec des balles connues ne démontre pas le tri de déchets sales, écrasés, composites ou imbriqués. Les résultats de compétition annoncés par les auteurs ne sont pas ceux d’ÉcoNova.

- Auteurs : équipe du dépôt `elegantmonark/Wall-F` ; cadre UNSW indiqué par les auteurs.
- Année vérifiée : documentation **2026**.
- [README consulté, version figée](https://github.com/elegantmonark/Wall-F/blob/3853bd558fdf0a5c5dac425ac1489736d36b0778/README.md).
- [Processus consulté, version figée](https://github.com/elegantmonark/Wall-F/blob/ec70f1a6b2e4a000c538861b184e2d85c0e0759a/design-process.md).
- [Algorithme consulté](https://github.com/elegantmonark/Wall-F/blob/main/waste-sorting-algorithm.md).

## 3. Des images de déchets ne suffisent pas à reconnaître la matière

**Source lue :** documentation de **TACO — Trash Annotations in Context for Litter Detection**, Pedro F. Proença et Pedro Simões. Le README cite leur publication de **2020**, précise des images prises en rues, forêts et plages, et indique des classes peu annotées. Il distingue aussi les annotations non révisées.

**Pour EcoScan :** un dataset ouvert aide à explorer la détection ; il faut ensuite un jeu représentatif de la vraie zone de lecture. Couvrir marques, déformations, lumière, salissures et inconnus. Séparer les objets physiques entre apprentissage et test, pas seulement deux vues du même objet.

**Limite :** détecter une bouteille sur une plage ne certifie ni son polymère, ni son admissibilité locale, ni sa reconnaissance sur un convoyeur. Aucune précision d’ÉcoNova n’est déduite de TACO. La licence du logiciel ne dispense pas de vérifier les droits des images. Aucune image du dataset n’a été intégrée au site pour cette recherche.

- Auteurs : Pedro F. Proença et Pedro Simões, dépôt original `pedropro/TACO`.
- Années vérifiées : publication citée **2020**, version du README **2021**.
- [README consulté, version figée](https://github.com/pedropro/TACO/blob/ab244072f9f04304fb01d9316a76a3054d04afe1/README.md).
- Publication référencée : [arXiv:2003.06975](https://arxiv.org/abs/2003.06975). La page externe et l’article n’ont pas été consultés ici.
- [Licence du logiciel consultée](https://github.com/pedropro/TACO/blob/master/LICENSE).

## 4. Une inconnue doit garder une place dans le système

**Source lue :** README de *MechaSort*, version du 19 février **2023**. Les auteurs décrivent caméra, capteur ultrasonique, bras et interface, avec un opérateur dans la boucle. Ils documentent des difficultés de modèle et des objets de substitution dans certains exemples de déchets dangereux.

**Pour EcoScan :** prévoir une voie de contrôle et des états utiles à l’opérateur. Le parcours complet doit fonctionner aussi quand la reconnaissance échoue. Expliquer refus, maintenance et nettoyage dans la vidéo, en plus du scénario idéal.

**Limite :** un prototype et des objets de substitution ne prouvent pas une reconnaissance sûre des déchets dangereux. Les chiffres et promesses d’impact du README ne sont pas repris comme faits vérifiés.

- Auteurs : équipe `Gaurang-1402/MechaSort`, contributeur Gaurang Ruparelia.
- Année vérifiée : documentation **2023**.
- [README consulté, version figée](https://github.com/Gaurang-1402/MechaSort/blob/ca532f8c0e765d5cb9394e6e0ca12bb588e930db/README.md).

## 5. Une interface spectaculaire doit rester choisie et compréhensible

**Source lue :** documentation explicative du **W3C**, dépôt `w3c/wcag`, instantané `23bad5904949904275a08f1c6e395b78a02aa6f3`. Les documents expliquent le besoin de désactiver les mouvements non essentiels et de proposer une alternative par simple clic/toucher au glisser-déposer. Une alternative au clavier seule ne suffit pas à cette dernière exigence.

**Pour EcoScan :** `prefers-reduced-motion`, lecture explicite, étapes visibles, sélection puis bouton de dépôt, clavier et états exprimés par texte. Le film doit avoir une transcription. Le visiteur doit comprendre la machine sans regarder toutes les animations.

**Limite :** ces choix ne valent pas certification d’accessibilité. Les critères physiques d’une poubelle publique se vérifient également avec les usagers.

- Organisme : **World Wide Web Consortium (W3C)**.
- Consultation attestée en **2026** ; aucune date normative déduite de la date du dépôt.
- [Animation from Interactions, source consultée](https://github.com/w3c/wcag/blob/23bad5904949904275a08f1c6e395b78a02aa6f3/understanding/21/animation-from-interactions.html).
- [Dragging Movements, source consultée](https://github.com/w3c/wcag/blob/23bad5904949904275a08f1c6e395b78a02aa6f3/understanding/22/dragging-movements.html).

## Décisions proposées pour ÉcoNova

| Principe observé | Traduction dans notre projet | Statut |
| --- | --- | --- |
| Tester chaque sous-système | Séparation → lecture → aiguillage → maintenance → pilote | Plan à exécuter |
| Croiser vision et observation physique | Pesée éventuelle, passage, contrôle des incohérences | Hypothèse à valider |
| Confirmer avant de créditer | Dépôt confirmé ; événement unique | Exigence du futur système |
| Prévoir opérateur et erreurs | Contrôle, messages clairs, nettoyage et reprise | Concept documenté |
| Calibrer avec les conditions réelles | Jeu de test indépendant et résultats par matière | Protocole proposé |
| Retirer les gestes imposés | Boutons, clavier, réduction des animations | À vérifier dans les tests |
| Démontrer le bénéfice | Comparaison avec de bons bacs et ressources complètes | Étude future |

Mission, slogan et identité sont des créations pour EcoScan. Les références à Apple, Steve Jobs ou Elon Musk expriment une ambition de clarté et d’initiative demandée par le porteur du projet. Elles ne suggèrent pas leur approbation, n’attribuent aucune citation inventée et ne prouvent pas une invention sans antériorité.

**À lire avec :** [dossier de faisabilité](./FAISABILITE.md). Ces enseignements sont des choix proposés, dont l’application matérielle demande essais et expertise adaptés au contexte.
