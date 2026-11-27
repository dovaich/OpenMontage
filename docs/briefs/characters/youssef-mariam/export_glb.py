# usage: blender -b <name>_ready.blend --python export_glb.py -- <name> <skin.png> <out.glb>
import bpy, sys
args = sys.argv[sys.argv.index("--") + 1:]; NAME, SKIN, OUT = args[:3]
EYE = args[3] if len(args) > 3 else '/opt/chars/darkbrown_eye.png'
import json
SWAP = json.loads(args[4]) if len(args) > 4 else {}
for o in bpy.data.objects:
    for k, p in SWAP.items():
        if o.type == 'MESH' and k in o.name:
            for m in o.data.materials:
                for n in m.node_tree.nodes:
                    if n.type == 'TEX_IMAGE' and n.image and 'NORM' not in n.image.name.upper() and 'normal' not in n.image.name.lower(): n.image = bpy.data.images.load(p)
body = bpy.data.objects[NAME + ".body"]
for n in body.active_material.node_tree.nodes:
    if n.type == 'TEX_IMAGE': n.image = bpy.data.images.load(SKIN)
for o in bpy.data.objects:
    if o.type == 'MESH' and o.name.endswith('high-poly'):
        for m in o.data.materials:
            nt = m.node_tree; bs = [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'][0]
            tex = [n for n in nt.nodes if n.type == 'TEX_IMAGE']
            tex = tex[0] if tex else nt.nodes.new('ShaderNodeTexImage')
            tex.image = bpy.data.images.load(EYE)
            for l in list(bs.inputs['Base Color'].links): nt.links.remove(l)
            nt.links.new(tex.outputs['Color'], bs.inputs['Base Color'])
            bs.inputs['Roughness'].default_value = 0.15
ALPHA = ('high-poly', 'eyebrow', 'eyelash', 'hair', 'short0', 'long0', 'bob0', 'afro', 'braid', 'ponytail', 'beard')
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    keep = any(k in o.name.lower() for k in ALPHA)
    for m in o.data.materials:
        if not (m and m.node_tree): continue
        for n in m.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED' and not keep:
                for l in list(n.inputs['Alpha'].links): m.node_tree.links.remove(l)
                n.inputs['Alpha'].default_value = 1.0
        if keep:
            try: m.surface_render_method = 'DITHERED'
            except Exception: pass
            m.blend_method = 'CLIP'
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_skins=True, export_animations=False, export_morph=False,
                          export_yup=True, export_image_format='AUTO', use_visible=False)
print("GLB_OK", OUT)
