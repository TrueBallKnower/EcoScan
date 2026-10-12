"""Create a static, non-secret presentation kit from reviewed project assets."""
from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
files=['docs/PRESENTATION.md','docs/FAISABILITE.md','docs/RECHERCHE_INNOVATION.md','docs/VIDEO_V2_TRANSCRIPTION.md','docs/VIDEO_V2_EN_TRANSCRIPTION.md','docs/VOIX_OFF.md','docs/ROADMAP.md','docs/BOUTIQUE_APP.md','assets/logo-ecoscan.svg','assets/logo-ecoscan-light.svg','assets/ecoscan-symbol.svg','assets/econova-blueprint-v2.svg','assets/econova-blueprint-v2.png','assets/ecoscan-station-qr.svg','assets/econova-film-v2-poster.jpg']
with zipfile.ZipFile(root/'assets/EcoScan-dossier-concept.zip','w',zipfile.ZIP_DEFLATED) as archive:
 for name in files:archive.write(root/name,'EcoScan-dossier/'+name)
print('Dossier de présentation créé ; film accessible sur le site public.')
