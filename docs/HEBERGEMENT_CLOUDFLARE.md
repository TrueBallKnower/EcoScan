# Une adresse gratuite pour EcoScan

Nom proposé : **ecosac**, donc `https://ecosac.pages.dev/` si ce nom est disponible. Le nom n’est pas réservé et aucune nouvelle adresse n’est active tant que Cloudflare n’a pas créé et déployé le projet. Si nécessaire, choisir `ecosac-lab` ou `ecoscan-campus` dans l’interface.

Le projet reste EcoScan. L’adresse peut changer sans renommer le compte GitHub, le dépôt, le logo ou les films. Le site GitHub Pages existant reste accessible pendant la mise en place.

## Création dans Cloudflare

1. Se connecter ou créer un compte gratuit sur https://dash.cloudflare.com/.
2. Ouvrir **Workers & Pages**, créer une application **Pages**, puis choisir la connexion à un dépôt Git.
3. Connecter GitHub et autoriser le dépôt **TrueBallKnower/EcoScan**. Sélectionner ce dépôt.
4. Choisir le nom de projet **ecosac** et la branche de production **main**. Utiliser les paramètres ci-dessous.
5. Lancer le déploiement, puis ouvrir l’adresse HTTPS que Cloudflare affiche après son succès.

| Champ | Valeur |
| --- | --- |
| Framework preset | None |
| Build command | `python3 -m pip install -r requirements-deploy.txt && python3 tools/build_cloudflare.py` |
| Build output directory | `public` |
| Root directory | Racine du dépôt, laisser le réglage par défaut |

Le build peut déduire le domaine principal à partir de `CF_PAGES_URL`, fourni par Cloudflare. Si le journal indique « Adresse manquante », ajouter une variable **SITE_URL** avec l’adresse réellement choisie, par exemple `https://ecosac.pages.dev`, puis relancer. Le nom affiché par Cloudflare fait foi ; une variante ne demande aucun changement du code.

Choisir le plan gratuit. Aucun domaine personnalisé, abonnement, Worker payant, token API ou secret à saisir dans GitHub n’est requis pour cette connexion Git.

## Mises à jour suivantes

La connexion Git publie automatiquement les changements de **main**. On continue donc à modifier le même dépôt GitHub. GitHub Pages et Cloudflare peuvent fonctionner en parallèle.

Le build copie uniquement les fichiers du site, ses médias et ses documents dans `public/`. Il adapte l’adresse canonique, les métadonnées de partage, le QR scannable et le dossier ZIP au domaine de production. Il ne modifie pas les fichiers sources du site GitHub.

`qrcode==8.2` sert uniquement à générer le QR pendant la publication. Le navigateur ne charge aucune nouvelle dépendance ou API externe. Les films restent des MP4 locaux ; les points et échanges restent fictifs, et le solde enregistré sur le domaine GitHub ne se transfère pas automatiquement au nouveau domaine.

## Vérification locale du build

```sh
python3 -m pip install -r requirements-deploy.txt
python3 tools/build_cloudflare.py --site-url https://ecosac.pages.dev --output /tmp/ecoscan-pages
python3 tools/serve_local.py --directory /tmp/ecoscan-pages --port 8022
```

Dans cet exemple, le nom sert à préparer les fichiers ; cela ne le réserve pas et ne crée pas de site Cloudflare. Le dossier généré est distinct du dépôt. Vérifier les images, les deux narrations, les liens et le QR après le premier déploiement réel.
