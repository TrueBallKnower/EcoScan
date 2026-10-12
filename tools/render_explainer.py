"""Offline original motion-graphics film. Requires Pillow + ffmpeg; no site dependency."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess, math, textwrap
ROOT=Path(__file__).resolve().parents[1]
W,H,FPS,DURATION=1280,720,20,108
GREEN='#075f55';MINT='#b9dfc9';WHITE='#edf6ef';INK='#052d29';AQUA='#3bd5b4'
fontroot='/usr/share/fonts/truetype/dejavu/'
fonts={k:ImageFont.truetype(fontroot+('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'),size) for k,size,bold in [('title',38,True),('heading',28,True),('body',21,False),('label',17,True),('small',14,False)]}
SCENES=[
('Une seule ouverture','ÉcoNova est une poubelle automatique envisagée par EcoScan. Vous déposez les recyclables acceptés dans une entrée commune. Les compartiments sont à l’intérieur.', 'Concept de station — aucune machine installée.'),
('1. Connecter la station','Le QR identifie la station ECO-001. Dans une app future, vous confirmeriez une session reliée à votre portefeuille. Un QR seul ne prouve ni votre présence ni un dépôt.', 'Sur le site : connexion et portefeuille fictifs.'),
('2. Déposer les recyclables','Une ouverture reçoit le dépôt. Un mélange nécessite une séparation mécanique. Les sacs fermés, liquides et déchets dangereux ne sont pas supposés pris en charge.', 'Le périmètre des matières doit être défini et testé.'),
('3. Isoler chaque objet','Un dispositif envisagé présente les objets un par un devant les capteurs. Il faudrait détecter les objets imbriqués, le bourrage et les obstructions.', 'Séparation et cadence encore à prototyper.'),
('4. Observer et décider','Éclairage et capteurs internes aideraient à identifier une catégorie. Une image seule ne certifie pas toutes les compositions. Les filières locales guident la décision.', '5 ms : cible de reconnaissance, jamais performance mesurée.'),
('5. Aiguiller automatiquement','Un mécanisme motorisé dirigerait l’objet vers PET, aluminium ou papier. Un contrôle de position et de passage devrait confirmer le routage.', 'Illustration du principe — mécanisme non validé.'),
('6. Isoler les incertains','Un objet inconnu ou composite ne doit pas contaminer une filière. Un chemin de contrôle séparé est envisagé. Bac plein ou panne : suspendre le dépôt concerné.', 'Aucun point lorsque le dépôt n’est pas validé.'),
('7. Créditer les EcoPoints','Après confirmation matérielle, un événement unique créditerait l’app. La session doit se fermer et les doubles crédits être empêchés. Ici, tout reste local et fictif.', 'Les récompenses réelles nécessiteraient des accords.'),
('8. Collecter et évaluer','Les bacs resteraient séparés jusqu’aux filières adaptées. Nettoyage, sécurité, énergie et réparabilité doivent être évalués. Un pilote UNIL nécessiterait les autorisations.', 'Projet académique indépendant — aucun partenariat officiel.')]
def text(draw,xy,content,key='body',fill=WHITE):draw.text(xy,content,font=fonts[key],fill=fill)
def wrapped(draw,x,y,content,width=37,key='body',fill=WHITE,line=32):
 for row in textwrap.wrap(content,width=width):text(draw,(x,y),row,key,fill);y+=line
 return y

def render(frame):
 t=frame/FPS;scene=min(int(t/12),8);u=(t%12)/12
 im=Image.new('RGB',(W,H),INK);d=ImageDraw.Draw(im)
 for x in range(0,W,64):d.line((x,0,x,H),fill='#103a32')
 for y in range(0,H,64):d.line((0,y,W,y),fill='#103a32')
 text(d,(50,30),'EcoScan / ÉcoNova','title');text(d,(52,84),'FILM DE CONCEPT · SIMULATION · PAS UN PRODUIT FABRIQUÉ','small',MINT)
 d.rounded_rectangle((770,150,1230,588),radius=24,fill='#0b4238',outline='#4b8f76',width=2)
 text(d,(797,175),f'{scene+1:02d} / 09','label',MINT)
 wrapped(d,797,213,SCENES[scene][0],25,'heading',WHITE,38)
 wrapped(d,797,310,SCENES[scene][1],34,'body',WHITE,30)
 # Single shell and intake. Cutaway is a pedagogical view.
 d.rounded_rectangle((140,150,670,584),radius=30,fill=GREEN,outline='#83bca1',width=3)
 text(d,(170,167),'ÉcoNova · ECO-001','heading')
 d.rounded_rectangle((180,218,630,276),radius=20,fill='#021b17',outline='#b9dfc9',width=3)
 text(d,(280,235),'OUVERTURE UNIQUE','label',MINT)
 d.rounded_rectangle((172,299,638,551),radius=14,fill='#082e28',outline='#75a98f',width=2)
 text(d,(192,308),'VUE INTERNE / PRINCIPES À TESTER','small',MINT)
 # Isolating belt.
 d.rounded_rectangle((221,341,590,372),radius=8,fill='#4e8d72')
 for x in range(230,580,24):
  x2=x+int(u*24);d.line((x2,344,x2,369),fill='#b9dfc9',width=2)
 d.rounded_rectangle((307,386,504,420),radius=8,fill='#0a6957',outline=AQUA,width=2)
 text(d,(329,394),'ZONE DE LECTURE','small')
 if scene==4:
  beam=387+int(u*29);d.line((310,beam,501,beam),fill='#ccffe8',width=3)
 # Motor routing plus rejection line.
 for x in [247,405,559]:d.line((405,429,x,465),fill=AQUA if scene in [5,8] else '#3b7260',width=4)
 d.line((510,405,708,405,708,490),fill='#d4b584' if scene==6 else '#476f59',width=3)
 d.rounded_rectangle((675,491,744,541),radius=6,fill='#79542e',outline='#d4b584');text(d,(679,506),'Contrôle','small')
 for x,label,color in [(192,'PET',GREEN),(350,'Alu','#294b60'),(508,'Papier','#745531')]:
  d.rounded_rectangle((x,470,x+118,534),radius=9,fill=color,outline=MINT,width=2)
  text(d,(x+15,492),label,'label')
 # Moving object follows the corresponding conceptual stage.
 if scene in [2,3,4,5,6]:
  if scene==2:x,y=70+335*u,185+61*u
  elif scene==3:x,y=234+320*u,351
  elif scene==4:x,y=405,402
  elif scene==5:x,y=405+(247-405)*u,432+60*u
  else:x,y=510+197*u,405+96*u
  d.rounded_rectangle((x-10,y-14,x+10,y+14),radius=4,fill=MINT,outline=WHITE,width=2)
 # Phone, stationary label plus wallet confirmation.
 if scene in [1,7]:
  d.rounded_rectangle((27,310,133,507),radius=16,fill='#f7faf8',outline='#b9dfc9',width=3)
  text(d,(39,335),'EcoScan','small',GREEN)
  if scene==1:
   text(d,(41,382),'Session','small',GREEN);text(d,(45,415),'ECO-001','small',GREEN)
   d.ellipse((67,463,89,485),fill=GREEN)
  else:
   text(d,(42,385),'+10','heading',GREEN);text(d,(37,425),'EcoPoints','small',GREEN);text(d,(43,453),'fictifs','small',GREEN)
 text(d,(157,559),'UNE ENTRÉE · DES FLUX INTERNES SÉPARÉS','small',MINT)
 wrapped(d,52,615,SCENES[scene][2],100,'body',MINT,30)
 for i in range(9):d.rounded_rectangle((52+i*131,678,171+i*131,684),radius=3,fill=AQUA if i<=scene else '#3a6755')
 # Gentle transitions, no flashes: dark-to-scene at chapter changes.
 fade=max(0,(0.35-(t%12))/.35) if frame else 1
 if fade>0:im=Image.blend(im,Image.new('RGB',(W,H),INK),fade*.8)
 return im

def main():
 out=ROOT/'assets/econova-explainer.mp4'
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','2','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
 process=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 try:
  for frame in range(FPS*DURATION):process.stdin.write(render(frame).tobytes())
 finally:process.stdin.close()
 if process.wait()!=0:raise RuntimeError('Video encoding failed')
 render(2*FPS).save(ROOT/'assets/econova-video-poster.jpg',quality=90)
 lines=['WEBVTT',''];transcript=['# ÉcoNova — vidéo explicative du concept','', 'Film animé sans voix off : textes intégrés, sous-titres français et transcription. Aucun matériel réel filmé.','']
 for i,(title,body,note) in enumerate(SCENES):
  start,end=i*12,(i+1)*12
  fmt=lambda sec:f'00:{sec//60:02d}:{sec%60:02d}.000'
  lines.extend([f'{fmt(start)} --> {fmt(end)}',title+' — '+body,''])
  transcript.extend([f'## {fmt(start)[:8]} — {title}',body,'',note,''])
 (ROOT/'assets/econova-explainer-fr.vtt').write_text('\n'.join(lines))
 (ROOT/'docs/VIDEO_TRANSCRIPTION.md').write_text('\n'.join(transcript))
 print(out, out.stat().st_size, 'bytes; duration',DURATION,'seconds')
if __name__=='__main__':main()
