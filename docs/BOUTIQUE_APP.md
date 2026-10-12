# Prototype app et catalogue circulaire

EcoScan présente une interface de démonstration intégrée à son site. Elle permet de comprendre la future application sans installation, compte, service payant ou backend.

## Parcours choisi

1. **Parcours** : fiche de la station fictive ECO-001, confirmation de session, accès à la simulation. L’app ne dépose pas un objet à distance.
2. **Portefeuille** : miroir du solde existant, état du dernier dépôt et dernier échange de la visite. Aucune monnaie supplémentaire.
3. **Boutique** : accès aux concepts, filtrés par réemploi, réparation ou usage quotidien.

La connexion et la fermeture utilisent le gestionnaire central de session du site. Aucune géolocalisation, caméra, création de compte ou permission n’est demandée.

## La ressource avant la récompense

Réparer, emprunter ou réutiliser ce que l’on possède déjà doit précéder toute nouvelle fabrication. Les EcoPoints ne devraient jamais encourager à consommer, produire ou collecter davantage de déchets uniquement pour une récompense.

Les quatre idées sont des pistes à évaluer, sans fabrication, stock, commande ou livraison :

| Identifiant | Concept | Débit de démonstration | À vérifier |
| --- | --- | ---: | --- |
| `repair-pouch` | Pochette seconde vie | 20 | Origine et composition des chutes textiles, couture, fermeture, lavage |
| `loop-notebook` | Carnet Loop | 30 | Fibres, encres, part recyclée, reliure, intérêt face aux carnets disponibles |
| `carry-bag` | Sac ReCycle | 40 | Traçabilité, nettoyage, résistance, réparation, durée d’utilisation |
| `repair-kit` | Kit Réparer | 60 | Besoin, sécurité des outils, pièces adaptées, contenu et conseils |

Aucun pourcentage recyclé, bilan carbone, partenaire ou fournisseur n’est annoncé. Les illustrations sont des concepts originaux du site. Les montants ne sont ni des prix commerciaux ni une estimation du coût de fabrication.

## Contrat entre l’interface et le portefeuille

`experience-shop.js` ne modifie jamais le solde ni son stockage. `script.js` garde la source unique des EcoPoints.

- `ecoscan:wallet` : état central `{points, deposits, earned, phase, connected, busy, offline}`. Le module n’affiche que cet état. Si les nouveaux champs sont absents, il lit l’état de phase ; il ne peut pas accorder un crédit.
- `ecoscan:phase` : avancement du dépôt `{phase, route}`.
- `ecoscan:state-request` : demande l’état initial au gestionnaire central.
- `ecoscan:command` : demande `{command: 'connect-station', stationId: 'ECO-001'}` ou `{command: 'end-session', stationId: 'ECO-001'}`. La logique de session reste centrale.
- `ecoscan:exchange-request` : `{id, productId, cost, label}` seulement après clic explicite sur la confirmation. Le gestionnaire central doit valider l’identifiant du produit et son coût dans sa propre liste, vérifier le solde et l’absence de dépôt en cours, puis débiter une seule fois.
- `ecoscan:exchange-result` : `{id, ok, message, points}`. Le module affiche un succès seulement pour une réponse `ok` correspondant à la demande en cours.
- `ecoscan:wallet-reset` : efface le dernier échange affiché et ferme toute confirmation. Le gestionnaire central remet son registre d’échanges à zéro avec la démonstration.

Le contrat d’échange est synchrone et local, sans serveur. Un identifiant de demande déjà traité doit être idempotent : un second événement identique ne débite pas à nouveau. Un catalogue modifié dans le navigateur ne peut pas imposer son coût au gestionnaire central. Un échec ou un gestionnaire manquant n’affiche pas de commande réussie.

## Confirmation et accessibilité

Le bouton d’un produit ouvre son détail et une confirmation native `dialog`. Le solde après échange est expliqué avant le débit. Annuler, fermer ou appuyer sur Échap ne retire aucun point. Un solde insuffisant ou un dépôt en cours désactive la confirmation. Le catalogue est lisible sans JavaScript ; seule la simulation d’échange en dépend.

Les onglets ont les rôles `tablist`, `tab` et `tabpanel`, ainsi qu’une navigation par flèches, Début et Fin. Les actions font au moins 44 pixels. Les filtres annoncent le nombre de résultats ; les messages de session, solde et échange utilisent des régions de statut. Les entrées d’écran respectent `prefers-reduced-motion`.

## Passer d’un prototype à une app

La prochaine étape utile serait un test d’usage avec des participants : comprend-on la station choisie, la confirmation, un refus de dépôt et le caractère fictif des points ? Une app réelle demanderait ensuite un dispositif matériel validé, une identité de station fiable, des événements de dépôt vérifiables, un compte sécurisé, une prévention du double crédit et une politique de données adaptée. Un programme d’offres devrait confirmer son financement, son fonctionnement et son utilité avant toute promesse de récompense.
