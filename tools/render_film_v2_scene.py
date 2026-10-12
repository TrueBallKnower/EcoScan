"""Original ÉcoNova studio geometry and explanatory plates (Blender 4.3+).
Offline production only: Blender is never a website/runtime dependency.
All geometry is a conceptual visual, not a validated engineering CAD model.
Run: MESA_SHADER_CACHE_DIR=/tmp/ecoscan-mesa blender -b -t 2 --python tools/render_film_v2_scene.py
"""
from pathlib import Path
import bpy, math, json, re, sys
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/tmp/ecoscan-film-v2');CACHE.mkdir(exist_ok=True)
W,H=1280,720
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples=16
scene.render.resolution_x=W;scene.render.resolution_y=H;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.world.color=(.012,.025,.02)

def material(name,color,metal=0,rough=.45,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
GREEN=material('Forest ceramic powder coating',(.016,.115,.082),.25,.32)
IVORY=material('Warm recycled shell',(.66,.7,.63),.1,.34)
BLACK=material('Graphite',(.014,.019,.017),.15,.37)
STEEL=material('Brushed aluminium',(.29,.34,.31),.75,.28)
MINT=material('Soft status light',(.18,.9,.54),.05,.4,2.5)
BLUE=material('PET internal liner',(.13,.33,.38),.25,.35)
GOLD=material('Paper internal liner',(.45,.32,.12),.1,.45)
AMBER=material('Inspection zone',(.54,.27,.08),.1,.5)
GROUND=material('Studio background',(.009,.026,.02),0,.5)
objects=[];shell=[];external=[];internal=[];qrparts=[]
def cube(name,loc,scale,mat,bevel=.03,group=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  b=o.modifiers.new('Manufactured radii','BEVEL');b.width=bevel;b.segments=4
  o.modifiers.new('Soft normals','WEIGHTED_NORMAL')
 o.data.materials.append(mat)
 if group is not None:group.append(o)
 return o

def cyl(name,loc,r,depth,mat,axis='Z',group=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=depth,location=loc);o=bpy.context.object;o.name=name
 if axis=='Y':o.rotation_euler.x=math.pi/2
 elif axis=='X':o.rotation_euler.y=math.pi/2
 o.data.materials.append(mat);b=o.modifiers.new('Edge radius','BEVEL');b.width=.012;b.segments=3;o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 if group is not None:group.append(o)
 return o

def line(name,a,b,r,mat,group=None):
 v=Vector(b)-Vector(a);o=cyl(name,(Vector(a)+Vector(b))/2,r,v.length,mat,group=group);o.rotation_euler=v.to_track_quat('Z','Y').to_euler();return o

def label(name,text,loc,size,mat,group=None):
 cu=bpy.data.curves.new(name,'FONT');cu.body=text;cu.size=size;cu.align_x='CENTER';cu.extrude=.0002
 o=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(mat)
 if group is not None:group.append(o)
 return o
# Quiet monolithic chassis, a single deposit opening and a serviceable lower door.
cube('Floating base',(0,0,.075),(1.32,.84,.12),BLACK,.06)
cube('Rear chassis',(0,.36,.94),(1.27,.075,1.73),GREEN,.045,shell)
cube('Left exterior',(-.63,0,.96),(.075,.76,1.78),IVORY,.035,shell)
cube('Right exterior',(.63,0,.96),(.075,.76,1.78),IVORY,.035,shell)
cube('Top',(0,0,1.86),(1.3,.8,.095),IVORY,.047,shell)
cube('Front lower door',(0,-.405,.67),(1.2,.06,1.16),GREEN,.04,external)
cube('Front shoulders',(0,-.405,1.745),(1.2,.065,.21),IVORY,.035,external)
cube('Front lower intake edge',(0,-.405,1.35),(1.2,.065,.16),IVORY,.035,external)
for x in [-.565,.565]:cube('Intake side',(x,-.405,1.53),(.07,.065,.25),IVORY,.025,external)
cube('Intake cavity',(0,-.25,1.515),(1.055,.26,.235),BLACK,.08,external)
# Sloped recess and soft light bar stay one opening, not a bank of separate mouths.
cube('Intake floor',(0,-.40,1.41),(1.045,.17,.04),STEEL,.017,external)
line('Ready light',(-.49,-.45,1.66),(.49,-.45,1.66),.006,MINT,external)
label('Brand wordmark','EcoNova',(0,-.447,1.758),.085,GREEN,external)
label('Project signature','E C O S C A N',(0,-.445,.9),.039,IVORY,external)
label('Shared opening','UNE ENTREE. UN NOUVEAU CYCLE.',(0,-.447,.80),.026,IVORY,external)
# Small front identifier and QR plate; pattern is the exact existing station URL QR.
cube('QR plaque',(.36,-.45,1.05),(.22,.012,.22),IVORY,.012,external)
svg=(ROOT/'assets/ecoscan-station-qr.svg').read_text()
for x,y in re.findall(r'M([\d.]+),([\d.]+)H',svg):
 xx,yy=float(x),float(y)
 if 0<=xx<49 and 0<=yy<49:
  cube('QR module',(.36+(xx-24)*.00395,-.458,1.05+(24-yy)*.00395),(.004,.002,.004),GREEN,0,external)
# Service handle / vents / grounding feet.
cube('Service handle',(.43,-.45,.57),(.12,.015,.022),STEEL,.008,external)
for i in range(8):cube('Passive service vent',(-.42+i*.037,-.444,.25),(.019,.012,.068),BLACK,.006,external)
for x in [-.47,.47]:
 for y in [-.28,.28]:cyl('Adjustable foot',(x,y,.023),.045,.045,BLACK)
# Inner single-object stage: metal tray with side rails, a short conveyor, optical tunnel.
# An open presentation throat, not a solid platform hiding the next stage.
for x in [-.32,.32]:cube('Tray side wing',(x,-.04,1.43),(.38,.64,.035),STEEL,.015,internal)
cube('Tray back',(0,.19,1.43),(.29,.18,.035),STEEL,.012,internal)
cube('Presentation throat front lip',(0,-.28,1.43),(.29,.035,.04),STEEL,.012,internal)
for x in [-.51,.51]:cube('Tray rail',(x,-.04,1.47),(.025,.63,.085),STEEL,.008,internal)
cube('Singulation belt',(-.12,.035,1.25),(.63,.45,.055),BLACK,.015,internal)
for i in range(9):cyl('Belt rollers',(-.43+i*.078,.035,1.25),.025,.42,STEEL,'Y',internal)
for y in [-.19,.27]:cube('Belt edge',(-.12,y,1.29),(.7,.025,.08),STEEL,.008,internal)
# Offset separator gate: architecture is a visual principle to prototype.
cube('Singulator guide',(-.02,.10,1.33),(.03,.25,.12),GREEN,.014,internal)
cube('Sensor tunnel',(0,.10,1.09),(.68,.39,.042),BLACK,.015,internal)
for x in [-.32,.32]:cube('Camera arch support',(x,.10,1.2),(.022,.39,.22),STEEL,.008,internal)
line('Sensor top lamp',(-.29,-.08,1.32),(.29,-.08,1.32),.008,MINT,internal)
cyl('Optical sensor',(0,.115,1.31),.045,.036,BLACK,'Z',internal)
cyl('Sensor lens',(0,.115,1.289),.022,.009,BLUE,'Z',internal)
# Tilting diverter with three routes plus quarantine behind; actual mechanism would require validation.
cube('Transfer drop',(0,.04,.98),(.28,.30,.045),STEEL,.025,internal)
cyl('Servo hub',(0,.17,.86),.085,.12,BLACK,'Y',internal)
cube('Rotating chute',(0,-.035,.86),(.47,.40,.045),STEEL,.015,internal).rotation_euler.y=math.radians(-18)
for x,col in [(-.40,BLUE),(0,STEEL),(.40,GOLD)]:
 # Open containers: bottom + four thin walls; fronts short for visible empty volume.
 cube('Compartment bottom',(x,0,.225),(.34,.55,.035),col,.014,internal)
 cube('Compartment back',(x,.25,.44),(.34,.024,.43),col,.009,internal)
 for xx in [-.158,.158]:cube('Compartment side',(x+xx,0,.44),(.024,.55,.43),col,.009,internal)
 cube('Compartment front',(x,-.25,.40),(.34,.024,.35),col,.009,internal)
 label('Compartment category',{-0.4:'PET',0:'ALU',0.4:'PAPIER'}[x],(x,-.267,.405),.032,IVORY,internal)
# Inspection tray is explicitly visible off to the back, never merges with a recyclable stream.
cube('Inspection tray',(0,.27,.765),(.38,.19,.18),AMBER,.019,internal)
# Structural upright rails and removable electronics box.
for x in [-.56,.56]:cube('Internal rail',(x,.28,.94),(.027,.027,1.65),STEEL,.008,internal)
cube('Control box',(.48,.23,1.48),(.12,.19,.31),BLACK,.012,internal)
for z in [1.42,1.47,1.52]:cyl('Control box indicator',(.416,.14,z),.008,.002,MINT,'X',internal)
# Studio with genuinely modeled shadows and reflections.
cube('Studio floor',(0,0,-.065),(200,200,.07),GROUND,0)
for name,loc,power,size,color in [
 ('Soft key',(1.5,-3,5),1200,4.5,(.82,1,.89)),
 ('Warm fill',(-3,-1.5,2.5),800,4,(1,.84,.64)),
 ('Contour',(2.5,2,3.7),1500,3,(.37,1,.68))]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.lens=55
from bpy_extras.object_utils import world_to_camera_view
POINTS={'entry':(0,-.45,1.53),'tray':(-.15,-.1,1.45),'separator':(-.27,.0,1.26),'sensor':(0,-.1,1.16),'diverter':(0,-.05,.86),'pet':(-.4,-.08,.55),'alu':(0,-.08,.55),'paper':(.4,-.08,.55),'hold':(0,.27,.84),'qr':(.36,-.46,1.05)}
SHOTS=[
 ('hero',(3.3,-5,2.8),(-.50,0,1.01),55,False),
 ('connection',(2.65,-4.8,2.3),(-.49,0,1.05),55,False),
 ('entry',(2.35,-3.5,2.5),(-.63,-.1,1.43),64,False),
 ('cutaway',(3.3,-5,2.8),(-.50,0,1.01),55,True),
 ('separator',(2.5,-3.8,3.0),(-.58,.0,1.20),64,True),
 ('sensor',(1.8,-3.0,2.0),(-.66,0,1.18),72,True),
 ('routing',(2.6,-4.4,2.3),(-.67,0,.86),62,True),
 ('service',(3.7,-5.4,2.9),(-.44,0,1),55,True),
 ('final',(2.85,-5.6,2.4),(-.50,0,1.02),55,False),
]
meta={}
existing=json.loads((CACHE/'plates.json').read_text()) if (CACHE/'plates.json').exists() else {}
for name,location,target,lens,cut in SHOTS:
 if '--reuse' in sys.argv and (CACHE/(name+'.png')).exists() and name in existing and existing[name]['target']==list(target):
  meta[name]=existing[name];continue
 for o in external:o.hide_render=cut
 # Side panel is removed for a genuine cutaway view; cabinet rear remains for coherence.
 for o in shell:o.hide_render=cut and o.name.startswith(('Right exterior','Top','Left exterior'))
 cam.location=location;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens
 scene.render.filepath=str(CACHE/(name+'.png'))
 # Camera matrix updates before projection and rendering.
 bpy.context.view_layer.update()
 projected={}
 for key,point in POINTS.items():
  p=world_to_camera_view(scene,cam,Vector(point));projected[key]=[p.x*W,(1-p.y)*H]
 meta[name]={'points':projected,'camera':list(location),'target':list(target),'lens':lens}
 bpy.ops.render.render(write_still=True)
 (CACHE/'plates.json').write_text(json.dumps(meta,indent=2))
print('Original ÉcoNova plate production complete:',CACHE)
