"""Render the website's compact ÉcoNova views from the film's exact geometry.

Offline production only; Blender and Pillow are never website dependencies.
Run all views:
  MESA_SHADER_CACHE_DIR=/tmp/ecoscan-mesa blender -b -t 2 --python tools/render_compact_model.py
Render only the routing close-up:
  MESA_SHADER_CACHE_DIR=/tmp/ecoscan-mesa blender -b -t 2 --python tools/render_compact_model.py -- --view mechanism

The diagrammed geometry is conceptual, not manufacturing CAD. The visual tilt
is intentionally limited to 18 degrees for clearance in this illustration;
gravity, friction, sensing and safe operation still require prototype testing.
"""
from pathlib import Path
import argparse
import math
import sys
import bpy
from mathutils import Vector, Matrix
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/ecoscan-compact-views')
CACHE.mkdir(exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--view', choices=['all', 'studio', 'exterior', 'cutaway', 'mechanism'], default='all')
parser.add_argument('--samples', type=int, default=40)
options = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
if not 8 <= options.samples <= 256:
    raise ValueError('Choose between 8 and 256 render samples.')

# Build once from the film generator rather than duplicating any cabinet,
# sensor or articulated-plate geometry. The marker precedes shot rendering.
source = ROOT / 'tools' / 'render_film_v2_scene.py'
marker = 'from bpy_extras.object_utils import world_to_camera_view'
geometry, found, _ = source.read_text(encoding='utf-8').partition(marker)
if not found:
    raise RuntimeError('Film geometry marker changed; update this production helper.')
namespace = {'__file__': str(source), '__name__': '__ecoscan_compact_geometry__'}
exec(compile(geometry, str(source), 'exec'), namespace)
scene = namespace['scene']
camera = scene.camera
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = options.samples
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_percentage = 100
# Only studio lighting/backdrop and framing differ from the film.
ground = bpy.data.materials['Studio background'].node_tree.nodes.get('Principled BSDF')
ground.inputs['Base Color'].default_value = (.62, .69, .63, 1)
scene.world.color = (.14, .18, .15)

views = [
    ('studio', (3.0, -5.4, 2.8), (0, 0, .96), 53, (1600, 1200), False),
    ('exterior', (2.7, -5.2, 2.55), (0, 0, .97), 53, (1440, 1080), False),
    ('cutaway', (2.7, -5.2, 2.55), (0, 0, .97), 53, (1440, 1080), True),
    ('mechanism', (1.5, -3.1, 2.0), (0, 0, .97), 58, (1440, 1080), True),
]
for name, location, target, lens, size, cut in views:
    if options.view not in ('all', name):
        continue
    for obj in namespace['external']:
        obj.hide_render = cut
    for obj in namespace['shell']:
        obj.hide_render = cut and obj.name.startswith(('Left exterior', 'Right exterior', 'Top'))
    if name == 'mechanism':
        pivot = Vector(namespace['SELECTOR_PIVOT'])
        transform = Matrix.Translation(pivot) @ Matrix.Rotation(math.radians(18), 4, 'Y') @ Matrix.Translation(-pivot)
        for obj in namespace['moving']:
            if obj.name.startswith(('Tilting selector wing', 'Central aluminium trap', 'Selector end frame')):
                obj.matrix_world = transform @ obj.matrix_world
    scene.render.resolution_x, scene.render.resolution_y = size
    camera.location = location
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.lens = lens
    stem = 'econova-compact-' + name
    original = CACHE / (stem + '.png')
    scene.render.filepath = str(original)
    bpy.context.view_layer.update()
    bpy.ops.render.render(write_still=True)
    with Image.open(original) as rendered:
        rgb = rendered.convert('RGB')
        rgb.save(ROOT / 'assets' / (stem + '.webp'), quality=91, method=6)
        if name == 'studio':
            rgb.save(ROOT / 'assets' / (stem + '.png'), optimize=True)
    print('Canonical view ready:', name, size)
