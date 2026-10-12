"""Original 92-second concept film: genuine 3D plates, spatial motion, original sound.
Production dependencies: Pillow, NumPy, ffmpeg; no browser/site dependencies.
First render plates with render_film_v2_scene.py. Then python tools/render_film_v2.py.
For French narration, generate_voiceover.py creates a local WAV and timed JSON;
pass them with --voice and --narration. --stage-only stages pictures while audio
is produced; --mux-only adds that narration without re-encoding the pictures.
No measured performance, working hardware or partner affiliation is represented.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, json, subprocess, wave, shutil, argparse
import numpy as np
ROOT=Path(__file__).resolve().parents[1];CACHE=Path('/tmp/ecoscan-film-v2');OUT=ROOT/'assets'
W,H,FPS,DURATION=1280,720,24,92
INK='#071c15';IVORY='#f3f3e8';MINT='#c5edcf';GREEN='#64d59e';AMBER='#ffcb83';MUTED='#a4b9a8'
FONTROOT='/usr/share/fonts/truetype/dejavu/'
fonts={n:ImageFont.truetype(FONTROOT+('DejaVuSans-Bold.ttf' if b else 'DejaVuSans.ttf'),s) for n,s,b in [('hero',76,True),('title',55,True),('body',30,False),('label',20,True),('small',17,False),('phone',25,True),('score',62,True)]}
CHAPTERS=[
 {'start':0,'end':8,'title':'Une entrée. Un nouveau cycle.','shot':'hero','lines':['ÉcoNova.','Le tri, réinventé.'],'sub':'Une station EcoScan à entrée unique.'},
 {'start':8,'end':18,'title':'Ouvrir une session','shot':'connection','lines':['Connectez-vous.','La station vous reconnaît.'],'sub':'Un QR identifie la station, puis ouvre une session.'},
 {'start':18,'end':28,'title':'Une seule ouverture','shot':'entry','lines':['Un seul geste.'],'sub':'Les recyclables acceptés entrent au même endroit.'},
 {'start':28,'end':39,'title':'Séparer les objets','shot':'separator','lines':['Un objet à la fois.'],'sub':'Une présentation contrôlée avant la lecture.'},
 {'start':39,'end':50,'title':'Observer et décider','shot':'sensor','lines':['Observer.','Puis décider.'],'sub':'Les incertitudes suivent une voie de contrôle.'},
 {'start':50,'end':62,'title':'Aiguiller les matières','shot':'routing','lines':['La bonne matière.','Le bon compartiment.'],'sub':'Des flux séparés, jusque dans la collecte.'},
 {'start':62,'end':72,'title':'Confirmer avant de créditer','shot':'connection','lines':['Le geste est confirmé.'],'sub':'La validation précède les points.'},
 {'start':72,'end':83,'title':'Entretenir et mesurer','shot':'service','lines':['Pensée pour durer.'],'sub':'Vider. Nettoyer. Réparer. Mesurer.'},
 {'start':83,'end':92,'title':'De la vision au prototype','shot':'final','lines':['Une entrée.','Un nouveau cycle.'],'sub':'Le prochain pas : un prototype éprouvé sur le terrain.'},
]
CUES=[
 (0,4,'Une mise en scène 3D de l’architecture ÉcoNova envisagée.'),
 (4,8,'Un geste simple à l’extérieur. Des flux séparés à l’intérieur.'),
 (8,11.5,'Le QR code identifie la station que vous souhaitez utiliser.'),
 (11.5,15,'Une future app confirmerait une session et votre présence.'),
 (15,18,'Le QR seul ne confirme ni la présence ni le dépôt.'),
 (18,22,'Vous déposez les recyclables acceptés dans une seule ouverture.'),
 (22,25,'Les matières admises dépendent des filières locales.'),
 (25,28,'Les liquides, sacs fermés et déchets dangereux sont exclus du pilote.'),
 (28,32,'La première étape consiste à présenter les objets un par un.'),
 (32,35.5,'Un mécanisme de séparation devra gérer les mélanges et imbrications.'),
 (35.5,39,'Des contrôles détecteraient les obstructions avant de poursuivre.'),
 (39,42.5,'Une zone éclairée présente l’objet devant les capteurs.'),
 (42.5,46,'Vision et autres mesures pourraient aider à identifier la matière.'),
 (46,50,'Un résultat incertain reste à l’écart des filières recyclables.'),
 (50,53,'La plaque s’incline et se stabilise avant de libérer le PET.'),
 (53,56,'La trappe centrale s’ouvre pour l’aluminium.'),
 (56,59,'La plaque bascule de l’autre côté pour le papier.'),
 (59,62,'Un clapet distinct isole les objets incertains vers le contrôle.'),
 (62,65.5,'Les EcoPoints ne seraient crédités qu’après validation du dépôt.'),
 (65.5,69,'Un événement unique empêcherait les doubles crédits.'),
 (69,72,'Le portefeuille et les points montrés ici sont fictifs.'),
 (72,75.5,'La collecte conserverait les matières séparées.'),
 (75.5,79,'Des modules accessibles faciliteraient nettoyage et réparation.'),
 (79,83,'Un pilote doit mesurer qualité du tri, énergie, coût et disponibilité.'),
 (83,87.5,'ÉcoNova est un concept à prototyper, pas une machine déjà fabriquée.'),
 (87.5,92,'Le prochain pas : un terrain pilote et des résultats vérifiables.'),
]
plates={};meta={}
def ease(x):x=max(0,min(1,x));return x*x*(3-2*x)
def lerp(a,b,t):return a+(b-a)*t
def mixpoint(a,b,t):return tuple(lerp(x,y,t) for x,y in zip(a,b))
def bezier(a,b,c,d,t):
 return tuple((1-t)**3*a[i]+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i] for i in range(len(a)))
def rgba(c,a=255):
 c=c.lstrip('#');return tuple(int(c[i:i+2],16) for i in (0,2,4))+(int(a),)
def txt(draw,xy,s,key='body',color=IVORY,alpha=255):
 draw.text(xy,s,font=fonts[key],fill=rgba(color,alpha))
def rounded(draw,box,color,r=16,outline=None,width=1):draw.rounded_rectangle(box,radius=r,fill=color,outline=outline,width=width)
def camera(name):
 info=meta[name];pos=np.array(info['camera']);target=np.array(info['target']);direction=(target-pos);direction/=np.linalg.norm(direction);right=np.cross(direction,np.array([0.,0.,1.]));right/=np.linalg.norm(right);up=np.cross(right,direction);return pos,direction,right,up, W*info['lens']/36
cameras={}
def project(p,name):
 pos,direction,right,up,f=cameras[name];v=np.array(p)-pos;depth=float(np.dot(v,direction));return (W/2+f*float(np.dot(v,right))/depth,H/2-f*float(np.dot(v,up))/depth,depth)

def cylinder_mesh(kind):
 n=12
 if kind=='PET':rings=[(-.085,.017),(-.075,.028),(.036,.030),(.06,.015),(.091,.012)];base=(.54,.88,.75)
 elif kind=='ALU':rings=[(-.056,.033),(-.048,.034),(.048,.034),(.056,.031)];base=(.68,.77,.80)
 else:return None
 vertices=[]
 for z,r in rings:
  for i in range(n):
   a=2*math.pi*i/n;vertices.append(np.array([r*math.cos(a),r*math.sin(a),z]))
 faces=[]
 for k in range(len(rings)-1):
  for i in range(n):faces.append([k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i])
 faces+=[list(range(n-1,-1,-1)),list(range((len(rings)-1)*n,len(rings)*n))]
 return vertices,faces,base
meshes={k:cylinder_mesh(k) for k in ['PET','ALU']}
def box_mesh(scale,base):
 sx,sy,sz=scale;v=[np.array([x*sx,y*sy,z*sz]) for z in [-1,1] for y in [-1,1] for x in [-1,1]]
 f=[[2,3,1,0],[5,7,6,4],[1,5,4,0],[6,7,3,2],[4,6,2,0],[3,7,5,1]];return v,f,base
meshes['PAPIER']=box_mesh((.065,.044,.012),(.93,.86,.61));meshes['CONTRÔLE']=box_mesh((.042,.013,.055),(.92,.61,.28))

def object3d(draw,name,kind,position,rotation=0,scale=1,fade=1):
 vertices,faces,base=meshes[kind];transformed=[]
 # Local yaw and slight tilt convey rigid-body travel without a claim to actual physics.
 c,s=math.cos(rotation),math.sin(rotation);rot=np.array([[c,0,s],[0,1,0],[-s,0,c]])
 for v in vertices:transformed.append(rot@(v*scale)+np.array(position))
 polys=[]
 light=np.array([-.4,-.7,1.]);light/=np.linalg.norm(light)
 for face in faces:
  pts=[transformed[i] for i in face];normal=np.cross(pts[1]-pts[0],pts[2]-pts[0]);length=np.linalg.norm(normal)
  if length:normal/=length
  shade=.5+.48*max(0,float(np.dot(normal,light)))
  coords=[project(p,name) for p in pts];depth=sum(p[2] for p in coords)/len(coords)
  col=tuple(max(0,min(255,int(v*255*shade))) for v in base)+(int(255*fade),)
  polys.append((depth,[(x,y) for x,y,z in coords],col))
 for dep,points,col in sorted(polys,reverse=True):draw.polygon(points,fill=col)
 # Fine material contour adds a crisp manufactured glint.
 if kind=='PET':
  p=project(position,name);draw.ellipse((p[0]-2,p[1]-3,p[0]+2,p[1]+3),fill=rgba('#eeffef',200*fade))

# The moving assembly uses the very same world coordinates and camera as Blender.
# Rigid plates pivot around their physical hinges; materials travel only after the
# selected configuration has settled. This is a schematic kinematic animation,
# never a simulation of validated forces, speeds or real hardware.
def rotation_matrix(axis,angle):
 c,s=math.cos(angle),math.sin(angle)
 if axis=='X':return np.array([[1,0,0],[0,c,-s],[0,s,c]])
 return np.array([[c,0,s],[0,1,0],[-s,0,c]])

def posed_box(scale,base,centre,pivot,rotation,axis='Y'):
 vertices,faces,col=box_mesh(tuple(v/2 for v in scale),base);r=rotation_matrix(axis,rotation)
 verts=[r@(v+np.array(centre)-np.array(pivot))+np.array(pivot) for v in vertices]
 return verts,faces,col

def posed_object(kind,position,rotation=0,axis='Y',scale=1.15):
 vertices,faces,col=meshes[kind];r=rotation_matrix(axis,rotation)
 return [r@(v*scale)+np.array(position) for v in vertices],faces,col

wall_depth_maps={}
def plane_depth(name,normal,constant,box):
 pos,direction,right,up,f=cameras[name]
 xx=np.arange(box[0],box[2],dtype=np.float32)[None,:]+.5
 yy=np.arange(box[1],box[3],dtype=np.float32)[:,None]+.5
 denominator=float(np.dot(normal,direction))+float(np.dot(normal,right))*(xx-W/2)/f+float(np.dot(normal,up))*(H/2-yy)/f
 with np.errstate(divide='ignore',invalid='ignore'):
  result=(constant-float(np.dot(normal,pos)))/denominator
 return np.where(result>0,result,np.inf)

def bin_wall_depth(name):
 # Real camera-depth occlusion: a wall hides only geometry behind it. This
 # preserves the selector in front of the rear tray while its rejection flap
 # correctly disappears behind that tray's side lip at the end of a passage.
 if name in wall_depth_maps:return wall_depth_maps[name]
 walls=[]
 for x in [-.4,0,.4]:
  walls.append([(x-.17,-.262,.225),(x+.17,-.262,.225),(x+.17,-.262,.575),(x-.17,-.262,.575)])
  walls.append([(x+.17,-.262,.225),(x+.17,.262,.225),(x+.17,.262,.655),(x+.17,-.262,.655)])
 walls += [[(-.19,.146,.715),(.19,.146,.715),(.19,.146,.791),(-.19,.146,.791)],[(.192,.16,.715),(.192,.405,.715),(.192,.405,.867),(.192,.16,.867)]]
 depth=np.full((H,W),np.inf,dtype=np.float32)
 for wall in walls:
  pts=[np.array(p) for p in wall];normal=np.cross(pts[1]-pts[0],pts[2]-pts[0]);normal/=np.linalg.norm(normal)
  mask=Image.new('L',(W,H));ImageDraw.Draw(mask).polygon([project(v,name)[:2] for v in wall],fill=255)
  projected=plane_depth(name,normal,float(np.dot(normal,pts[0])),(0,0,W,H))
  depth=np.minimum(depth,np.where(np.asarray(mask)>0,projected,np.inf))
 wall_depth_maps[name]=depth;return depth

def draw_world_meshes(im,name,geometry):
 polygons=[];light=np.array([-.45,-.7,1.]);light/=np.linalg.norm(light)
 for mesh in geometry:
  vertices,faces,base=mesh[:3]
  for face in faces:
   pts=[vertices[i] for i in face];normal=np.cross(pts[1]-pts[0],pts[2]-pts[0]);length=np.linalg.norm(normal)
   if not length:continue
   normal/=length;shade=.54+.43*max(0,float(np.dot(normal,light)));coords=[project(p,name) for p in pts]
   depth=sum(p[2] for p in coords)/len(coords);col=tuple(max(0,min(255,int(v*255*shade))) for v in base)+(255,)
   polygons.append((depth,[(x,y) for x,y,z in coords],col,normal,float(np.dot(normal,pts[0]))))
 foreground=bin_wall_depth(name)
 for dep,points,col,normal,constant in sorted(polygons,key=lambda p:p[0],reverse=True):
  box=(max(0,math.floor(min(p[0] for p in points))-1),max(0,math.floor(min(p[1] for p in points))-1),min(W,math.ceil(max(p[0] for p in points))+2),min(H,math.ceil(max(p[1] for p in points))+2))
  if box[2]<=box[0] or box[3]<=box[1]:continue
  layer=Image.new('RGBA',(box[2]-box[0],box[3]-box[1]));d=ImageDraw.Draw(layer);local=[(x-box[0],y-box[1]) for x,y in points];d.polygon(local,fill=col)
  # Fine manufactured-edge glints use the same depth test as their faces.
  if len(local)==4:d.line(local+[local[0]],fill=tuple(min(255,int(v*.86+24)) for v in col[:3])+(255,),width=1)
  behind=foreground[box[1]:box[3],box[0]:box[2]]+1e-5<plane_depth(name,normal,constant,box)
  alpha=np.asarray(layer.getchannel('A')).copy();alpha[behind]=0;layer.putalpha(Image.fromarray(alpha));im.alpha_composite(layer,(box[0],box[1]))

def routing(im,name,local):
 step=min(3,int(local/3));phase=local-step*3
 kinds=['PET','ALU','PAPIER','CONTRÔLE'];kind=kinds[step]
 initial=[(0,0,88),(-18,0,88),(0,82,88),(18,0,88)][step]
 final=[(-18,0,88),(0,82,88),(18,0,88),(0,0,-27)][step]
 config=[math.radians(lerp(a,b,ease(phase/.68))) for a,b in zip(initial,final)]
 tilt,trap,reject=config;steel=(.88,.94,.89);dark=(.25,.34,.29);geometry=[]
 selector=(0,-.03,.90)
 for x in [-.275,.275]:geometry.append(posed_box((.35,.30,.026),steel,(x,-.03,.90),selector,tilt))
 for y in [-.195,.135]:geometry.append(posed_box((.90,.025,.026),steel,(0,y,.90),selector,tilt))
 # Trapdoor is first posed about its own hinge, then carried by the selector frame.
 trap_mesh=posed_box((.20,.30,.026),steel,(0,-.03,.90),(-.10,-.03,.90),trap)
 r=rotation_matrix('Y',tilt)
 geometry.append(([r@(v-np.array(selector))+np.array(selector) for v in trap_mesh[0]],trap_mesh[1],trap_mesh[2]))
 geometry.append(posed_box((.23,.49,.024),steel,(0,.065,1.04),(0,-.18,1.04),reject,'X'))
 # The actuator cranks also move, providing a visible link between servo and plate.
 for pivot,angle,axis in [((0,-.236,.90),tilt,'Y'),((-.10,-.206,.90),trap,'Y'),((.162,-.18,1.04),reject,'X')]:
  length=.073 if axis=='Y' else .057
  centre=(pivot[0]+length/2,pivot[1],pivot[2]) if axis=='Y' else (pivot[0],pivot[1]+length/2,pivot[2])
  dimensions=(length,.025,.018) if axis=='Y' else (.018,length,.025)
  geometry.append(posed_box(dimensions,dark,centre,pivot,angle,axis))
 # Prior deposits remain inside their correct container for continuity.
 for previous in range(step):
  past=kinds[previous];end=[(-.44,-.03,.30),(0,-.03,.312),(.44,-.03,.262)][previous]
  geometry.append((*posed_object(past,end,1.30 if past=='PET' else 0),True))
 # Queue/feed, settling configuration, release, guided travel, then an occluded landing.
 if phase<.78:
  position=mixpoint((-.16,-.03,1.16),(0,-.03,1.16),ease(phase/.55));rot=math.pi/2 if kind=='PET' else 0;axis='Y'
 elif kind in ['PET','PAPIER']:
  theta=math.radians(-18 if step==0 else 18);direction=-1 if step==0 else 1
  support=.04 if kind=='PET' else .016
  if phase<1.12:
   q=((phase-.78)/.34)**2;position=(0,-.03,lerp(1.16,.90+support,q))
  elif phase<1.90:
   q=((phase-1.12)/.78)**1.7;x=direction*.44*q;position=(x,-.03,.90-x*math.sin(theta)/math.cos(theta)+support)
  else:
   q=min(1,((phase-1.90)/.57)**2);edge=.90-direction*.44*math.tan(theta)+support
   floor=.30 if kind=='PET' else .262;position=(direction*.44,-.03,lerp(edge,floor,q))
  # A PET bottle lies on the plate; flat paper follows the same incline.
  rot=(math.pi/2 if kind=='PET' else 0)+theta*ease((phase-.78)/.34)
  if phase>2.35:rot=lerp(rot,1.30 if kind=='PET' else 0,ease((phase-2.35)/.25))
  axis='Y'
 elif kind=='ALU':
  q=min(1,((phase-.78)/1.35)**2);position=(0,-.03,lerp(1.16,.312,q));rot=0;axis='Y'
 else:
  theta=math.radians(-27);support=.065
  if phase<1.12:
   q=((phase-.78)/.34)**2;y=-.03;contact=1.04+(y+.18)*math.tan(theta)+support;position=(0,y,lerp(1.16,contact,q))
  elif phase<1.96:
   q=((phase-1.12)/.84)**1.7;y=lerp(-.03,.255,q);position=(0,y,1.04+(y+.18)*math.tan(theta)+support)
  else:
   q=min(1,((phase-1.96)/.48)**2);edge=1.04+.435*math.tan(theta)+support;position=(0,lerp(.255,.28,q),lerp(edge,.790,q))
  rot=0;axis='X'
 geometry.append((*posed_object(kind,position,rot,axis),True))
 draw_world_meshes(im,name,geometry)
 d=ImageDraw.Draw(im);color=AMBER if step==3 else [GREEN,'#a8d2e4','#eed69c'][step]
 titles=['PET · PLAQUE À GAUCHE','ALU · TRAPPE CENTRALE','PAPIER · PLAQUE À DROITE','ISOLATION · VOIE DE CONTRÔLE']
 rounded(d,(65,331,527,420),rgba('#09231a',235),16,rgba(color),1)
 txt(d,(86,349),titles[step],'label',color)
 status='Positionner et stabiliser les plaques' if phase<.78 else ('Passage confirmé dans le compartiment' if phase>2.47 else 'Libérer l’objet vers sa voie dédiée')
 txt(d,(86,385),status,'small',IVORY)
 for k,label in enumerate(['Orienter','Libérer','Confirmer']):
  active=(k==0 and phase<.78) or (k==1 and .78<=phase<2.47) or (k==2 and phase>=2.47)
  x=69+k*145;d.ellipse((x,463,x+8,471),fill=rgba(color if active else '#465d4f'));txt(d,(x+17,455),label,'small',IVORY if active else MUTED)
 txt(d,(67,513),'Plaques articulées. Tri par gravité.','small',MINT)
 txt(d,(67,549),'Cinématique de concept · à valider','small',MUTED)

def glow(im,points,color,width=3,intensity=1):
 layer=Image.new('RGBA',(W,H));dr=ImageDraw.Draw(layer);dr.line(points,fill=rgba(color,180*intensity),width=width*3,joint='curve');im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(width*3)))
 dr=ImageDraw.Draw(im);dr.line(points,fill=rgba(color,235*intensity),width=width,joint='curve')

def pathline(im,points,u,color=GREEN,width=3):
 if len(points)<2:return
 lengths=[math.hypot(b[0]-a[0],b[1]-a[1]) for a,b in zip(points,points[1:])];target=sum(lengths)*max(0,min(1,u));out=[points[0]]
 for a,b,l in zip(points,points[1:],lengths):
  if target>=l:out.append(b);target-=l
  else:out.append(mixpoint(a,b,target/l));break
 if len(out)>1:glow(im,out,color,width)

def ring(im,p,r,u,color=GREEN):
 l=Image.new('RGBA',(W,H));d=ImageDraw.Draw(l);alpha=int(120*(1-u));d.ellipse((p[0]-r,p[1]-r,p[0]+r,p[1]+r),outline=rgba(color,alpha),width=4);im.alpha_composite(l)

def phone(im,x,y,mode,local):
 d=ImageDraw.Draw(im);rounded(d,(x-8,y-8,x+303,y+406),rgba('#d7e1d1'),37);rounded(d,(x,y,x+295,y+398),rgba('#081e18'),31);rounded(d,(x+13,y+15,x+282,y+383),rgba('#f0f3e9'),23)
 rounded(d,(x+106,y+21,x+188,y+31),rgba('#193027'),6)
 txt(d,(x+33,y+56),'EcoScan','phone','#163d2a');txt(d,(x+33,y+90),'STATION ECO-001','small','#4d6c59')
 if mode=='connect':
  stage=min(2,int(local/3.0));titles=['Identifier la station','Confirmer la session','Session ouverte'];txt(d,(x+33,y+138),titles[stage],'label','#1b492f')
  if stage==0:
   # Exact original QR modules from repository SVG; not a decorative fake QR.
   import re
   svg=(ROOT/'assets/ecoscan-station-qr.svg').read_text();unit=2.5;qx=x+85;qy=y+182
   rounded(d,(qx-8,qy-8,qx+130,qy+130),rgba('#ffffff'),9)
   for xx,yy in re.findall(r'M([\d.]+),([\d.]+)H',svg):
    px=qx+float(xx)*unit;py=qy+float(yy)*unit;d.rectangle((px,py,px+unit,py+unit),fill=rgba('#204a32'))
   liney=qy+math.sin(local*2)*50+60;d.line((qx+5,liney,qx+117,liney),fill=rgba(GREEN),width=3)
  elif stage==1:
   d.ellipse((x+103,y+192,x+191,y+280),outline=rgba('#abc3b0'),width=5)
   d.arc((x+103,y+192,x+191,y+280),start=-90,end=-90+360*ease((local-3)/3),fill=rgba('#246c48'),width=5)
   txt(d,(x+34,y+318),'Confirmer ma présence','small','#2f5c42')
  else:
   d.ellipse((x+106,y+197,x+188,y+279),fill=rgba('#2f7d51'));d.line((x+124,y+237,x+141,y+253,x+174,y+218),fill=rgba('#edf8ed'),width=5)
   txt(d,(x+49,y+315),'Prête pour le dépôt','small','#2f5c42')
 else:
  count=int(10*ease((local-2.3)/2.3));txt(d,(x+34,y+138),'Dépôt confirmé','label','#1b492f');txt(d,(x+43,y+195),f'+{count}','score','#286c46');txt(d,(x+42,y+271),'EcoPoints illustratifs','small','#355440')
  rounded(d,(x+32,y+310,x+264,y+349),rgba('#d9e7d7'),12);txt(d,(x+46,y+322),'1 dépôt · 1 crédit','small','#345c41')
 txt(d,(x+82,y+361),'INTERFACE DE CONCEPT','small','#677b69')

def load():
 global plates,meta,cameras
 meta=json.loads((CACHE/'plates.json').read_text());plates={n:Image.open(CACHE/(n+'.png')).convert('RGBA') for n in meta};cameras={n:camera(n) for n in meta}

def render(frame):
 t=frame/FPS;idx=next((i for i,c in enumerate(CHAPTERS) if c['start']<=t<c['end']),len(CHAPTERS)-1);c=CHAPTERS[idx];local=t-c['start'];span=c['end']-c['start'];u=local/span;name=c['shot']
 im=plates[name].copy()
 # Soft editorial cross-dissolves between actual studio/cutaway shots.
 if idx and local<.7:
  prev=plates[CHAPTERS[idx-1]['shot']];im=Image.blend(prev,im,ease(local/.7))
 # Gentle optical push-in, independent of overlay typography; avoids visual stasis.
 zoom=1 if idx in [3,4,5] else 1+.023*ease(u);nw,nh=int(W*zoom),int(H*zoom);left=(nw-W)//2;top=(nh-H)//2
 if zoom>1:im=im.resize((nw,nh),Image.Resampling.BICUBIC).crop((left,top,left+W,top+H))
 # Vignette on left provides clean readable type without covering the mechanical stage.
 shade=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shade)
 for x in range(610):sd.line((x,0,x,H),fill=rgba('#05170f',150*(1-x/610)**1.7))
 im.alpha_composite(shade)
 alpha=int(255*ease(local/.8));d=ImageDraw.Draw(im)
 txt(d,(64,39),'ECOSCAN  /  ÉCONOVA','label',MINT)
 txt(d,(1000,42),'FILM DE CONCEPT','small',MINT)
 # Overlays share a stable spatial camera. Small optical push affects plates only (<3%).
 if idx==0:
  txt(d,(62,172),'ÉcoNova.','hero',IVORY,alpha);txt(d,(67,278),'Le tri, réinventé.','body',MINT,alpha)
  txt(d,(67,344),'Une seule ouverture.','body',IVORY,alpha);txt(d,(67,388),'Un geste qui compte.','body',IVORY,alpha)
  txt(d,(67,465),'VISUALISATION 3D DE CONCEPT','label',MINT,alpha)
 elif idx in [1,6]:
  txt(d,(65,100),'01  /  CONNEXION' if idx==1 else '06  /  VALIDATION','label',MINT,alpha)
  txt(d,(64,139),'Une session.' if idx==1 else 'Dépôt validé.','title',IVORY,alpha)
  phone(im,72,239,'connect' if idx==1 else 'wallet',local)
  qp=meta[name]['points']['qr'];ring(im,qp,30+local%2*22,(local%2)/2)
  if idx==6:
   p=project((0,-.1,.55),name);pathline(im,[(p[0],p[1]),(527,508),(407,476)],ease(local/2),GREEN,3)
 elif idx==2:
  txt(d,(64,108),'02  /  DÉPÔT','label',MINT,alpha);txt(d,(64,150),'Un seul geste.','title',IVORY,alpha)
  txt(d,(68,235),'Une entrée commune.','body',MINT,alpha);txt(d,(68,280),'Les matières admises','body',IVORY,alpha);txt(d,(68,319),'restent à définir.','body',IVORY,alpha)
  entry=(0,-.48,1.53)
  for k,kind in enumerate(['PET','ALU','PAPIER']):
   phase=(local-1.2-k*.85)/2.4
   if 0<=phase<=1:
    pos=bezier((-.55,-1.0,2.0),(-.18,-.9,1.9),(.12,-.65,1.55),entry,ease(phase));object3d(d,name,kind,pos,rotation=phase*1.4-.5,scale=1.5,fade=1-ease((phase-.85)/.15))
  ep=meta[name]['points']['entry'];ring(im,ep,45+(local%2)*30,(local%2)/2)
 elif idx==3:
  txt(d,(64,108),'03  /  SÉPARATION','label',MINT,alpha);txt(d,(64,154),'Un objet','title',IVORY,alpha);txt(d,(64,219),'à la fois.','title',IVORY,alpha)
  txt(d,(68,315),'Isoler. Présenter.','body',MINT,alpha);txt(d,(68,357),'Prévenir le bourrage.','body',IVORY,alpha)
  # Three independently moving materials are spaced on the belt before the sensing chamber.
  for k,kind in enumerate(['PET','ALU','PAPIER']):
   p=((local-1-k*1.75)/5.8)
   if 0<p<1:
    pos=mixpoint((-.46,-.14,1.50),(0,-.14,1.49),ease(p/.62)) if p<.62 else mixpoint((0,-.14,1.49),(0,-.10,1.16),ease((p-.62)/.38));object3d(d,name,kind,pos,rotation=math.pi/2,scale=1.15)
  a=project((-.5,-.12,1.26),name);b=project((.15,-.12,1.26),name);pathline(im,[a[:2],b[:2]],(local%2)/2,GREEN,2)
 elif idx==4:
  txt(d,(64,108),'04  /  IDENTIFICATION','label',MINT,alpha);txt(d,(64,154),'Observer.','title',IVORY,alpha);txt(d,(64,219),'Puis décider.','title',IVORY,alpha)
  uncertain=local>6.8;kind='CONTRÔLE' if uncertain else 'PET';color=AMBER if uncertain else GREEN
  object3d(d,name,kind,(0,-.085,1.16),rotation=math.pi/2,scale=1.4)
  # Two soft sensor sweeps illustrate analysis, not a claimed detection time.
  z=1.16+math.sin(local*2.5)*.085;pa=project((-.16,-.13,z),name);pb=project((.16,-.13,z),name);glow(im,[pa[:2],pb[:2]],color,4)
  rounded(d,(66,329,460,418),rgba('#0b2b1d',230),18,rgba('#6a9776'),1)
  txt(d,(84,344),'À VÉRIFIER' if uncertain else 'MATIÈRE RECONNUE','label',color)
  txt(d,(84,377),'Voie de contrôle' if uncertain else 'Orientation proposée : PET','small',IVORY)
  txt(d,(69,460),'En cas de doute, contrôler.','body',MINT,alpha)
 elif idx==5:
  txt(d,(64,108),'05  /  AIGUILLAGE','label',MINT,alpha);txt(d,(64,154),'Chaque matière,','title',IVORY,alpha);txt(d,(64,219),'sa propre voie.','title',IVORY,alpha)
  routing(im,name,local)
 elif idx==7:
  txt(d,(64,108),'07  /  EXPLOITATION','label',MINT,alpha);txt(d,(64,154),'Pensée','title',IVORY,alpha);txt(d,(64,219),'pour durer.','title',IVORY,alpha)
  checks=[('Collecter séparément',(.4,-.08,.44)),('Nettoyer les capteurs',(0,-.05,1.20)),('Réparer les modules',(.48,.2,1.48))]
  for k,(s,p) in enumerate(checks):
   if local>k*2.5:
    yy=330+k*65;d.ellipse((68,yy+4,85,yy+21),fill=rgba(GREEN));txt(d,(103,yy),s,'label',IVORY)
    pp=project(p,name);ring(im,pp,26+((local-k*2.5)%2)*12,((local-k*2.5)%2)/2,GREEN)
  txt(d,(67,550),'Mesurer l’impact réel.','body',MINT,alpha)
 elif idx==8:
  txt(d,(64,132),'Une entrée.','title',IVORY,alpha);txt(d,(64,205),'Un nouveau','title',IVORY,alpha);txt(d,(64,278),'cycle.','title',MINT,alpha)
  txt(d,(67,355),'NOTRE AMBITION','label',MINT,alpha)
  txt(d,(67,396),'Moins d’erreurs.','body',IVORY,alpha);txt(d,(67,439),'Plus de matière préservée.','body',IVORY,alpha)
  txt(d,(67,534),'DU CONCEPT AU PROTOTYPE','label',MINT,alpha)
 # Stable quiet progress line gives the viewer a grasp of the sequence.
 d=ImageDraw.Draw(im);d.line((64,688,1216,688),fill=rgba('#a6b5a2',60),width=2);d.line((64,688,64+1152*t/DURATION,688),fill=rgba(GREEN),width=3)
 txt(d,(65,653),f'{idx+1:02d} / 09   ·   '+c['title'],'small',MINT)
 # Fade in/out to the product-lit green, never flashes.
 if t<.65:im=Image.blend(Image.new('RGBA',(W,H),INK),im,ease(t/.65))
 if t>90.8:im=Image.blend(im,Image.new('RGBA',(W,H),INK),ease((t-90.8)/1.2))
 return im.convert('RGB')

def sound():
 sr=32000;t=np.arange(sr*DURATION)/sr;s=np.zeros_like(t)
 # Self-composed, restrained studio atmosphere; no third-party music or voice.
 for start in [0,18,39,62,83]:
  tt=t-start;env=np.where(tt>=0,np.exp(-np.maximum(tt,0)/10)*(1-np.exp(-np.maximum(tt,0)/1.6)),0)
  for f in [130.81,196.0,261.63,329.63]:s+=.009*np.sin(2*np.pi*f*t)*env
 for cue in [8,18,28,39,50,53,56,59,62,72,83]:
  tt=t-cue;env=np.where((tt>=0)&(tt<1.5),np.exp(-np.maximum(tt,0)*5)*(1-np.exp(-np.maximum(tt,0)*40)),0);s+=.022*np.sin(2*np.pi*784*t)*env
 fade=np.minimum(np.minimum(t/2,(DURATION-t)/2),1);s*=np.maximum(0,fade)
 data=np.column_stack([s,s*.97]).clip(-1,1);pcm=(data*32767).astype('<i2')
 with wave.open(str(CACHE/'sound.wav'),'wb') as wf:wf.setnchannels(2);wf.setsampwidth(2);wf.setframerate(sr);wf.writeframes(pcm.tobytes())

def fmt(s):
 milliseconds=round(s*1000);h=milliseconds//3600000;m=(milliseconds//60000)%60;se=(milliseconds//1000)%60;ms=milliseconds%1000;return f'{h:02d}:{m:02d}:{se:02d}.{ms:03d}'

def captions_and_docs(voiced=False):
 lines=['WEBVTT',''];
 for a,b,s in CUES:lines += [f'{fmt(a)} --> {fmt(b)}',s,'']
 (OUT/'econova-film-v2-fr.vtt').write_text('\n'.join(lines),encoding='utf-8')
 transcript=['# ÉcoNova — Une entrée. Un nouveau cycle.','',
 ('Film de concept original de 1 min 32 s. Mise en scène 3D de l’architecture envisagée, animation pédagogique et ambiance sonore originale. Voix française de synthèse locale, sous-titres français synchronisés et transcription ci-dessous. Aucune machine réelle ni installation existante ne sont montrées.' if voiced else 'Film de concept original de 1 min 32 s. Mise en scène 3D de l’architecture envisagée, animation pédagogique et ambiance sonore originale. Sous-titres français et transcription ci-dessous. Aucune machine réelle ni installation existante ne sont montrées.'),'',
 '## Ce que représente le film','',
 'Ce modèle compact est la référence visuelle commune du film, des illustrations et du blueprint ; il reste une étude de concept, et non une définition industrielle du produit final. L’architecture représente un principe à prototyper : entrée unique, présentation des objets un par un, capteurs, plaques articulées motorisées, trois filières et une voie de contrôle. La plaque principale bascule à gauche pour le PET et à droite pour le papier. Sa trappe centrale s’ouvre pour l’aluminium ; un clapet distinct dirige les objets incertains vers un bac arrière isolé. Les plaques se positionnent avant la libération, et les objets suivent ensuite une pente puis une chute dans leur compartiment. Le film représente une cinématique pédagogique : les forces, frottements, temps d’actionnement, rebonds et dégagements exacts restent à mesurer sur un prototype. Les filières PET, aluminium et papier sont un périmètre d’illustration à adapter avec le collecteur local. Le tri autonome, la sécurité mécanique, la cadence, les coûts, l’énergie et la connexion avec une future app restent à démontrer. La cible précédemment évoquée de 5 ms n’est pas une performance mesurée ; le film n’en revendique aucune.','',
 'Un QR public identifie une station mais ne prouve pas la présence de l’utilisateur. Une implémentation matérielle devra confirmer la session sur place, lier un dépôt confirmé à un événement unique et protéger le mécanisme contre l’accès, les liquides, les objets dangereux et les obstructions. Le portefeuille montré est une interface fictive.','',
 '## Transcription','']
 for c in CHAPTERS:
  transcript += [f"### {fmt(c['start'])[:8]} — {c['title']}",'']
  for a,b,s in CUES:
   if c['start']<=a<c['end']:transcript+=[s,'']
 transcript += ['## Production et accessibilité','',
 'Vidéo MP4 H.264 / audio AAC, 1280 × 720, 24 images/s. Le film est lancé volontairement par le visiteur, sans lecture automatique. La piste française est fournie séparément au format WebVTT. Les chapitres permettent d’accéder directement à un principe ; cette transcription constitue une alternative textuelle complète.','',
 'Les sources de production sont `tools/render_film_v2_scene.py` et `tools/render_film_v2.py`. Elles utilisent des outils hors ligne et ne créent aucune dépendance du site. Les images, animations et ambiance sonore de ce film sont des créations originales réalisées pour EcoScan.',*( ['', 'La narration française est produite localement avec le modèle neural Kokoro, voix française SIWIS ; le texte est original et les sources et licences sont détaillées dans [VOIX_OFF.md](VOIX_OFF.md), avec un générateur hors ligne `tools/generate_voiceover.py`. La voix est mixée au premier plan ; la musique baisse pendant les explications.'] if voiced else []),'']
 (ROOT/'docs/VIDEO_V2_TRANSCRIPTION.md').write_text('\n'.join(transcript),encoding='utf-8')
 (OUT/'econova-film-v2-chapters.json').write_text(json.dumps({'duration':DURATION,'chapters':[{k:c[k] for k in ['start','end','title']} for c in CHAPTERS]},ensure_ascii=False,indent=2),encoding='utf-8')

def mux_voice(video,voice,out):
 # Normalize narration and duck the original bed only while someone speaks.
 filters='[0:a]volume=0.65[bed];[1:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-18:TP=-2:LRA=7,asplit=2[voice][side];[bed][side]sidechaincompress=threshold=0.025:ratio=8:attack=80:release=500[ducked];[ducked][voice]amix=inputs=2:normalize=0,alimiter=limit=0.95:level=0[mix]'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(video),'-i',str(voice),'-filter_complex',filters,'-map','0:v:0','-map','[mix]','-c:v','copy','-c:a','aac','-b:a','128k','-ar','48000','-movflags','+faststart','-shortest',str(out)],check=True)

def read_narration(path):
 global CUES
 data=json.loads(Path(path).read_text(encoding='utf-8'))
 entries=data if isinstance(data,list) else data.get('cues',data.get('segments',[]))
 if not entries:raise ValueError('Narration contains no timed cues')
 CUES=[(float(c['start']),float(c['end']),c['text']) for c in entries]
 for a,b,text in CUES:
  if not(0<=a<b<=DURATION) or not text.strip():raise ValueError('Invalid narration timing')

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--stage-only',action='store_true');parser.add_argument('--mux-only',action='store_true');parser.add_argument('--voice');parser.add_argument('--narration');args=parser.parse_args()
 if args.voice and not args.narration:parser.error('--voice requires the matching --narration timed JSON')
 if args.narration:read_narration(args.narration)
 if args.mux_only:
  if not args.voice or not args.narration:parser.error('--mux-only requires --voice and --narration')
  final=CACHE/'econova-film-v2-voiced.mp4';mux_voice(CACHE/'econova-film-v2.mp4',Path(args.voice),final)
  staged=OUT/'econova-film-v2.mp4.pending';shutil.copyfile(final,staged);staged.replace(OUT/'econova-film-v2.mp4');captions_and_docs(True);print('Voice integrated, captions and transcription updated.',flush=True);return
 load();sound()
 if not args.stage_only:captions_and_docs(bool(args.voice))
 plates['hero'].convert('RGB').save(OUT/'econova-film-v2-hero.webp',quality=92,method=6)
 poster=render(4*FPS);poster.save(OUT/'econova-film-v2-poster.jpg',quality=92)
 thumbs=[render(int(t*FPS)).resize((480,270)) for t in [4,13,22,33,44,54,60,67,76,87]]
 contact=Image.new('RGB',(1440,540),'#0b1e15')
 for i,thumb in enumerate(thumbs[:6]):contact.paste(thumb,((i%3)*480,(i//3)*270))
 contact.save(OUT/'econova-film-v2-contact-sheet.jpg',quality=92)
 frames=Image.new('RGB',(1920,810),'#0b1e15')
 for i,thumb in enumerate(thumbs):frames.paste(thumb,((i%4)*480,(i//4)*270))
 frames.save(CACHE/'all-shots.jpg',quality=94)
 # Still backgrounds remain low bitrate; actual moving paths stay sharp.
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(CACHE/'sound.wav'),'-c:v','libx264','-threads','2','-preset','fast','-crf','20','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','80k','-movflags','+faststart','-shortest',str(CACHE/'econova-film-v2.mp4')]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 try:
  for frame in range(DURATION*FPS):
   p.stdin.write(render(frame).tobytes())
   if frame%(FPS*8)==0:print(f'Rendering film {frame/FPS:.0f}/{DURATION}s',flush=True)
 finally:p.stdin.close()
 if p.wait():raise RuntimeError('Film encoding failed')
 if args.stage_only:
  print('Picture staged for narration:',CACHE/'econova-film-v2.mp4',flush=True);return
 final=CACHE/'econova-film-v2.mp4'
 if args.voice:
  final=CACHE/'econova-film-v2-voiced.mp4';mux_voice(CACHE/'econova-film-v2.mp4',Path(args.voice),final)
 staged=OUT/'econova-film-v2.mp4.pending'
 shutil.copyfile(final,staged)
 staged.replace(OUT/'econova-film-v2.mp4')
 print('Completed',OUT/'econova-film-v2.mp4',(OUT/'econova-film-v2.mp4').stat().st_size,'bytes',flush=True)
if __name__=='__main__':main()
