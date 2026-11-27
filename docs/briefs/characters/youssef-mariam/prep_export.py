# usage: blender -b <char.blend> --python prep_export.py -- <name> <out_dir>
# 1) bakes shape keys + mask modifiers, 2) dumps face-region UV polygons for texture painting, 3) saves <name>_ready.blend
import bpy, sys, json, bmesh
from mathutils import Vector
args = sys.argv[sys.argv.index("--") + 1:]; NAME, OUT = args[0], args[1]
for o in [o for o in bpy.data.objects if o.type in ('CAMERA', 'LIGHT') or o.name == 'Cube']: bpy.data.objects.remove(o)
body = bpy.data.objects[NAME + ".body"]
def centroid(group):
    gi = body.vertex_groups[group].index
    pts = [body.data.vertices[v.index].co for v in body.data.vertices if any(g.group == gi for g in v.groups)]
    return sum(pts, Vector()) / len(pts)
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    bpy.context.view_layer.objects.active = o
    if o.data.shape_keys:
        o.shape_key_add(name="mix", from_mix=True)
        kb = o.data.shape_keys.key_blocks
        for k in list(kb)[:-1]: o.shape_key_remove(k)
        o.shape_key_remove(o.data.shape_keys.key_blocks[0])  # removing the basis-from-mix keeps its shape
# landmarks (after the bake, joint cubes sit at the final shape)
L = {k: centroid(k) for k in ["joint-mouth", "joint-l-eye", "joint-r-eye", "joint-head", "joint-neck", "joint-jaw"]}
if len(args) > 2 and args[2] == 'hijab':
    HIJAB_COLOR = (0.23, 0.12, 0.13, 1)
    exec(open('/opt/chars/hijab.py').read())
    import bmesh as _bm
    gi = body.vertex_groups['ears'].index
    bb = _bm.new(); bb.from_mesh(body.data); dl2 = bb.verts.layers.deform.active
    bad = [v for v in bb.verts if gi in v[dl2] and v[dl2][gi] > 0.02]
    _bm.ops.delete(bb, geom=bad, context='VERTS'); bb.to_mesh(body.data); bb.free(); print('EARS_REMOVED', len(bad))
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        if m.type == 'MASK': bpy.ops.object.modifier_apply(modifier=m.name)
# face polygons with UVs + positions, for the texture painter
me = body.data; uv = me.uv_layers.active.data
polys = []
for p in me.polygons:
    c = p.center
    polys.append({"c": [c.x, c.y, c.z], "n": [p.normal.x, p.normal.y, p.normal.z], "uv": [[uv[i].uv.x, uv[i].uv.y] for i in p.loop_indices]})
lips = set()
if "lips" in body.vertex_groups:
    gi = body.vertex_groups["lips"].index
    lips = {v.index for v in me.vertices if any(g.group == gi and g.weight > 0.3 for g in v.groups)}
for p, d in zip(me.polygons, polys): d["lip"] = any(v in lips for v in p.vertices)
img = [n.image for n in body.active_material.node_tree.nodes if n.type == 'TEX_IMAGE'][0]
json.dump({"landmarks": {k: list(v) for k, v in L.items()}, "polys": polys, "skin": bpy.path.abspath(img.filepath), "size": list(img.size)}, open(f"{OUT}/{NAME}_face.json", "w"))
bpy.ops.wm.save_as_mainfile(filepath=f"{OUT}/{NAME}_ready.blend")
print("PREP_OK", {k: [round(x, 3) for x in v] for k, v in L.items()}, img.size[:])
