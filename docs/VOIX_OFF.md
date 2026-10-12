# Voix française et anglaise du film ÉcoNova

Le film de 1 min 32 s est disponible en **anglais avec sous-titres français**, ainsi qu’en **français au choix**. Les voix de synthèse `af_heart` (anglais américain) et `ff_siwis` (français) sont produites avec **Kokoro v1.0**, exécuté localement. Les textes sont des créations pour EcoScan. Ils présentent une architecture envisagée, sa séquence de tri et le travail restant avant un pilote. Les gestes mécaniques sont expliqués au moment où ils apparaissent à l’image.

La narration anglaise compte 181 mots et la française 194 mots. Chaque version possède 26 sous-titres. Un chapitre est synthétisé comme un paragraphe complet pour conserver l’intonation, au lieu de relancer la voix à chaque phrase. Les deux narrations finales conservent entièrement la vitesse native, sans accélération. Les objets sont nommés simplement : bouteilles en plastique, canettes, papier. Les neuf chapitres restent identiques ; l’aiguillage contient quatre explications distinctes à 00:50, 00:53, 00:56 et 00:59. Les deux fichiers MP4 utilisent exactement le même flux d’images H.264 : seule la narration change.

## Sources et crédits

Sources vérifiées le 12 octobre 2026 :

| Élément | Source | Licence publiée |
| --- | --- | --- |
| Modèle neural Kokoro, par hexgrad | [Dépôt officiel](https://github.com/hexgrad/kokoro), [présentation consultée](https://github.com/hexgrad/kokoro/blob/dfb907a02bba8152ca444717ca5d78747ccb4bec/README.md), [licence](https://github.com/hexgrad/kokoro/blob/dfb907a02bba8152ca444717ca5d78747ccb4bec/LICENSE) | Apache 2.0 ; le README officiel précise que les poids sont sous licence Apache. |
| Export ONNX et banque de voix | [Release `model-files-v1.0`](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0), fichiers `kokoro-v1.0.onnx` et `voices-v1.0.bin` | Le [README de l’exporteur](https://github.com/thewh1teagle/kokoro-onnx/blob/3596b26764286a7de9d90c363e988d50578918e5/README.md) attribue Apache 2.0 au modèle. |
| Exécution locale `kokoro-onnx` 0.4.9, par thewh1teagle | [Projet](https://github.com/thewh1teagle/kokoro-onnx), [licence](https://github.com/thewh1teagle/kokoro-onnx/blob/3596b26764286a7de9d90c363e988d50578918e5/LICENSE) | MIT. |
| Phonémisation anglaise Misaki 0.9.4, par hexgrad | [Projet et licence](https://github.com/hexgrad/misaki) | Apache 2.0. |
| Modèle linguistique anglais `en_core_web_sm` 3.8.0 | [Release officielle spaCy](https://github.com/explosion/spacy-models/releases/tag/en_core_web_sm-3.8.0) | MIT. |
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
3. Pour l’anglais, installer aussi `misaki==0.9.4`, `num2words`, `spacy==3.8.11` et le modèle `en_core_web_sm` 3.8.0 depuis la release officielle. Le petit modèle sert à la prononciation ; aucun serveur vocal n’est appelé.
4. Modifier les phrases dans `tools/narration_fr.json` et `tools/narration_en.json`, en conservant les limites de temps. Chaque entrée anglaise contient aussi sa traduction française pour les sous-titres.
5. Exécuter la génération de la voix souhaitée :

```bash
python3 tools/generate_voiceover.py \
  --model /tmp/ecoscan-voiceover/kokoro/kokoro-v1.0.onnx \
  --voices /tmp/ecoscan-voiceover/kokoro/voices-v1.0.bin \
  --voice ff_siwis --language fr-fr \
  --script tools/narration_fr.json \
  --output /tmp/ecoscan-voiceover/french

python3 tools/generate_voiceover.py \
  --model /tmp/ecoscan-voiceover/kokoro/kokoro-v1.0.onnx \
  --voices /tmp/ecoscan-voiceover/kokoro/voices-v1.0.bin \
  --voice af_heart --language en-us \
  --script tools/narration_en.json \
  --output /tmp/ecoscan-voiceover/english
```

Le script produit une piste `narration-fr.wav` ou `narration-en.wav`, les cues JSON, les sous-titres WebVTT et un `generation-report.json` avec les empreintes et les durées. Pour l’anglais, il produit aussi `narration-en-fr.vtt`, traduction française synchronisée. Il refuse un texte qui exigerait une accélération supérieure à 10 % ; mieux vaut raccourcir la narration. Le WAV final est une piste mono PCM de 92 secondes à 24 kHz.

Pour reconstruire les images dans un environnement de production avec Blender et Pillow :

```bash
MESA_SHADER_CACHE_DIR=/tmp/ecoscan-mesa blender -b -t 2 --python tools/render_film_v2_scene.py
python3 tools/render_film_v2.py --stage-only
```

Ajouter ces paramètres à la commande française ci-dessus pour générer le film et ses captions publiques :

```bash
  --video-base /tmp/ecoscan-film-v2/econova-film-v2.mp4 \
  --film-output assets/econova-film-v2.mp4 \
  --captions-output assets/econova-film-v2-fr.vtt
```

Pour la version anglaise, utiliser :

```bash
  --video-base /tmp/ecoscan-film-v2/econova-film-v2.mp4 \
  --film-output assets/econova-film-v2-en.mp4 \
  --captions-output assets/econova-film-v2-en.vtt \
  --translation-output assets/econova-film-v2-en-fr.vtt
```

Le générateur copie les images existantes sans les réencoder et mixe la voix au premier plan, avec une musique abaissée pendant les explications. Si seule la narration change, le film intermédiaire contenant la musique suffit. Actualiser les deux transcriptions, le résumé textuel du lecteur dans `index.html`, puis régénérer le dossier avec `python3 tools/make_presentation_kit.py`. Pour les vues du même modèle, exécuter `tools/render_compact_model.py` avec Blender.

## Vérification de la livraison

Chaque piste vocale possède 2 208 000 échantillons et une durée exacte de 92,000 secondes. Les sous-titres sont ordonnés sans chevauchement ; la traduction française du film anglais reprend les mêmes instants que ses captions anglaises. Chaque séquence parlée reste dans sa scène. Les contrôles vérifient l’absence d’écrêtage, le décodage intégral des deux MP4 et l’identité du flux d’images avec le film validé.
