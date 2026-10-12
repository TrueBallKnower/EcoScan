# Voix off française du film ÉcoNova

Le film de 1 min 32 s comprend une narration française de synthèse : voix `ff_siwis`, moteur neuronal **Kokoro v1.0**, exécuté localement. Le texte est une création pour EcoScan. Il présente une architecture envisagée, sa séquence de tri et le travail restant avant un pilote. Les gestes mécaniques sont expliqués au moment où ils apparaissent à l’image.

La narration compte 198 mots et 26 phrases sous-titrées. Les mots PET sont prononcés lettre par lettre. Les neuf chapitres du film restent inchangés ; le chapitre d’aiguillage contient quatre explications distinctes à 00:50, 00:53, 00:56 et 00:59. Des pauses laissent lire les images et respirer la musique. La vitesse native est conservée pour toutes les phrases sauf deux ajustements de durée, de 2,13 % et 0,39 %.

## Sources et crédits

Sources vérifiées le 12 octobre 2026 :

| Élément | Source | Licence publiée |
| --- | --- | --- |
| Modèle neural Kokoro, par hexgrad | [Dépôt officiel](https://github.com/hexgrad/kokoro), [présentation consultée](https://github.com/hexgrad/kokoro/blob/dfb907a02bba8152ca444717ca5d78747ccb4bec/README.md), [licence](https://github.com/hexgrad/kokoro/blob/dfb907a02bba8152ca444717ca5d78747ccb4bec/LICENSE) | Apache 2.0 ; le README officiel précise que les poids sont sous licence Apache. |
| Export ONNX et banque de voix | [Release `model-files-v1.0`](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0), fichiers `kokoro-v1.0.onnx` et `voices-v1.0.bin` | Le [README de l’exporteur](https://github.com/thewh1teagle/kokoro-onnx/blob/3596b26764286a7de9d90c363e988d50578918e5/README.md) attribue Apache 2.0 au modèle. |
| Exécution locale `kokoro-onnx` 0.4.9, par thewh1teagle | [Projet](https://github.com/thewh1teagle/kokoro-onnx), [licence](https://github.com/thewh1teagle/kokoro-onnx/blob/3596b26764286a7de9d90c363e988d50578918e5/LICENSE) | MIT. |
| Phonémisation française | [eSpeak NG](https://github.com/espeak-ng/espeak-ng), dépendance de production fournie par `espeakng-loader` | GPL v3 ; sert à transformer le texte en phonèmes avant la synthèse neuronale. |

La voix livrée provient de la banque Kokoro. Aucun modèle vocal ni moteur de synthèse n’est chargé par le navigateur : le site ne reçoit que la vidéo produite, ses sous-titres et sa transcription. La génération ne requiert aucun compte de synthèse vocale, abonnement ou clé API.

Empreintes SHA-256 des fichiers de modèle effectivement utilisés :

```text
kokoro-v1.0.onnx
7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5

voices-v1.0.bin
bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d
```

## Régénérer la narration

Les outils suivants sont facultatifs et réservés à la production du film. Ils n’ajoutent aucune dépendance au site HTML/CSS/JavaScript.

1. Installer `ffmpeg`, puis créer un environnement Python temporaire et y installer `kokoro-onnx==0.4.9`.
2. Télécharger les deux fichiers de modèle depuis la release ci-dessus et vérifier leurs empreintes.
3. Modifier les phrases dans `tools/narration_fr.json`, en conservant les limites de temps correspondant aux scènes.
4. Exécuter :

```bash
python3 tools/generate_voiceover.py \
  --model /tmp/ecoscan-voiceover/kokoro/kokoro-v1.0.onnx \
  --voices /tmp/ecoscan-voiceover/kokoro/voices-v1.0.bin \
  --output /tmp/ecoscan-voiceover
```

Le script produit `narration-fr.wav`, `cues-fr.json`, `narration-fr.vtt` et un `generation-report.json` avec les empreintes, les durées et les éventuels ajustements. Il refuse les phrases qui exigeraient une accélération supérieure à 15 % : il faut alors raccourcir le texte. Le WAV final est une piste mono PCM de 92 secondes à 24 kHz. La narration et la musique sont mixées par `tools/render_film_v2.py`. Pour reconstruire le film complet dans un nouvel environnement de production (Blender et Pillow doivent aussi être installés) :

```bash
MESA_SHADER_CACHE_DIR=/tmp/ecoscan-mesa blender -b -t 2 --python tools/render_film_v2_scene.py
python3 tools/render_film_v2.py --stage-only
python3 tools/render_film_v2.py --mux-only \
  --voice /tmp/ecoscan-voiceover/narration-fr.wav \
  --narration /tmp/ecoscan-voiceover/cues-fr.json
```

Si seule la narration change et que le film intermédiaire existe encore dans `/tmp/ecoscan-film-v2`, la dernière commande suffit après régénération de la voix. Elle actualise aussi les captions et la transcription. Reporter les phrases dans le résumé textuel du lecteur dans `index.html`, puis régénérer le dossier avec `python3 tools/make_presentation_kit.py`. Pour actualiser les vues du même modèle, exécuter `tools/render_compact_model.py` avec Blender.

## Vérification de la livraison

La piste vocale générée possède 2 208 000 échantillons et une durée exacte de 92,000 secondes. Les 26 sous-titres sont ordonnés sans chevauchement. Chaque séquence parlée reste dans les limites de sa scène. Le fichier vocal ne contient aucun échantillon écrêté ; son pic avant mixage est de −1,3 dBFS. Le mixage final maintient la voix devant la musique.
