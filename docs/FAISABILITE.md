# EcoScan / ÉcoNova — dossier de concept et de faisabilité

Projet académique indépendant porté par Albin Krasniqi — HEC Lausanne, Université de Lausanne. Aucun équipement installé, partenariat UNIL ou ONU, récompense réelle ou performance matérielle validée. Version du 12 octobre 2026.

## Vision

Une seule ouverture reçoit les recyclables autorisés. Une mécanique envisagée isole les objets, les présente aux capteurs, décide d’une filière locale et actionne un aiguillage vers des bacs distincts. Les objets incertains sont isolés pour contrôle. La prévention et le réemploi restent prioritaires sur le recyclage.

## Ce qui fonctionne aujourd’hui

Site statique gratuit, simulation guidée, QR vers une page publique, animations pédagogiques, portefeuille fictif local, mini-quiz et réglage de niveaux simulés. La démo ne lit aucune photo et ne commande aucun matériel. Le QR ECO-001 ouvre le site avec un identifiant fictif et demande une confirmation de session. Il ne donne pas de droits de crédit.

## Architecture à prototyper

1. Réception : définir les matières et formats autorisés, exclure les liquides, déchets dangereux et sacs fermés sans dispositif validé.
2. Séparation : présenter un objet à la fois ; tester objets imbriqués, emballages déformés et débit variable.
3. Captation : éclairage stable et capteurs adaptés ; une image seule ne certifie pas les matériaux composites.
4. Décision : filières locales configurées, seuils de confiance, contrôle des inconnus.
5. Aiguillage : mécanisme motorisé, confirmation de position et de passage, détection des blocages.
6. Collecte : bacs séparés et identifiés, capteurs de niveau à valider, accès technique verrouillable et procédures de nettoyage.

La cible de 5 ms est une ambition de reconnaissance non démontrée. Capture, séparation, inférence, mouvement mécanique et synchronisation du portefeuille ont des durées différentes. Ne pas confondre latence de modèle et cadence totale de la station.

## QR et sécurité du portefeuille envisagé

Un QR fixe peut être copié : il identifie la station, sans prouver la présence d’un utilisateur ni un dépôt. Une app réelle devrait confirmer la session avec un protocole local et serveur authentifié à définir. Vérifier le domaine et l’identifiant affichés, protéger l’étiquette et prévoir son remplacement.

La station devrait envoyer des événements uniques après confirmation matérielle. Empêcher le rejeu, les doubles crédits, la falsification, les sessions laissées ouvertes et les dépôts attribués à la personne suivante. Prévoir expiration, clôture, consentement, minimisation des données et traitement des interruptions réseau. Rien de cela n’est déployé par la démo statique.

## Plan de développement proposé

- Tester les consignes et le parcours avec des volontaires, sans équipement.
- Définir le périmètre de matières avec les responsables des filières.
- Construire un banc de test de séparation/lecture, sans exposition du public aux pièces mobiles.
- Tester l’aiguillage, les refus, les salissures et blocages avec confirmation indépendante.
- Évaluer sécurité, nettoyage, consommation électrique, réparation et accessibilité.
- Définir le budget réel : structure, pièces mobiles, capteurs, contrôle électronique, logiciel, essais, maintenance, connectivité et collecte. Aucun montant n’est estimé comme acquis.
- Demander les autorisations pour un éventuel pilote limité, comparer à un état initial et à une solution simple de signalétique, publier les limites.

## Évaluation avant/après proposée

Mesurer les erreurs de tri parmi les objets effectivement observés, le taux de refus, les blocages, les interventions de maintenance, la cadence du cycle complet et la compréhension des usagers. Mesurer les déchets évités séparément des objets recyclés. Ne pas convertir des EcoPoints en carbone économisé sans méthode appropriée.

Le calculateur web utilise `capacité = 60 / secondes_par_objet * disponibilité`. Il illustre un flux moyen hypothétique ; il ne modélise ni files d’attente stochastiques, ni pics, ni contamination, ni mécanique de séparation. Ses résultats ne sont pas une étude d’ingénierie.

## Cadre et limites

UNIL : public-cible d’une proposition académique, aucun emplacement ni installation autorisés. ONU : référence thématique à l’Agenda 2030 (2015), sans logo, label ou affiliation. ODD 12 (consommation/production responsables), ODD 9 (industrie/innovation/infrastructure), ODD 13 (action pour le climat) sont des thèmes de réflexion, sans contribution chiffrée revendiquée.

Ressources officielles : https://sdgs.un.org/goals ; https://www.unil.ch/durable ; https://www.bafu.admin.ch/

Les objectifs 65 %, 40 % et 2030 proviennent du support initial et restent non validés. Le nom ÉcoNova est une proposition créative sans vérification juridique de disponibilité. Les plans et illustrations sont conceptuels et ne peuvent pas servir directement à fabriquer une machine sûre.
