# builds a hijab mesh from the body's head/neck/shoulder faces; exec'd inside prep_export.py (needs body, L, bpy)
import bmesh, math
from mathutils import Vector
arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
me = body.data
gidx = {g.name: g.index for g in body.vertex_groups}
def w(v, name):
    gi = gidx.get(name)
    for g in v.groups:
        if g.group == gi: return g.weight
    return 0.0
eyeZ = L["joint-l-eye"].z; chin = L["joint-jaw"]; neck = L["joint-neck"]
browZ = eyeZ + 0.03; chinZ = chin.z - 0.004
zc = (browZ + chinZ) / 2; hz = (browZ - chinZ) / 2 + 0.012
headC = Vector((0, L["joint-head"].y, L["joint-head"].z))
shZ = neck.z - 0.19          # how far the drape comes down the chest/back
sel = set()
for v in me.vertices:
    c = v.co
    if w(v, "HelperGeometry") > 0 or w(v, "JointCubes") > 0: continue
    if any(w(v, k) > 0.1 for k in ("helper-hair", "helper-l-eye", "helper-r-eye", "helper-tongue", "helper-upper-teeth", "helper-lower-teeth", "helper-l-eyelashes-1", "helper-l-eyelashes-2", "helper-r-eyelashes-1", "helper-r-eyelashes-2", "helper-genital", "helper-skirt", "helper-tights")): continue
    if c.z < shZ: continue
    if abs(c.x) > 0.2 - max(0, (neck.z - 0.08 - c.z)) * 0.6: continue                              # not down the arms
    face = (c.y < headC.y - 0.035) and ((c.x / 0.066) ** 2 + ((c.z - zc) / hz) ** 2 < 1.0)
    if face: continue
    sel.add(v.index)
ear = {v.index for v in me.vertices if w(v, "ears") > 0.05}
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
for v in bm.verts:   # flatten the ears so the fabric goes smoothly over them
    if v.index in ear:
        sx = 1 if v.co.x > 0 else -1; v.co.x = sx * min(abs(v.co.x), 0.071)
dl = bm.verts.layers.deform.verify()
faces = [f for f in bm.faces if all(v.index in sel for v in f.verts)]
keep = set(faces)
bmesh.ops.delete(bm, geom=[f for f in bm.faces if f not in keep], context='FACES')
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
# keep the largest connected piece only (drops eye/mouth leftovers)
bm.verts.ensure_lookup_table(); seen, parts = set(), []
for v0 in bm.verts:
    if v0 in seen: continue
    st, comp = [v0], []
    seen.add(v0)
    while st:
        v = st.pop(); comp.append(v)
        for e in v.link_edges:
            o = e.other_vert(v)
            if o not in seen: seen.add(o); st.append(o)
    parts.append(comp)
parts.sort(key=len)
for comp in parts[:-1]: bmesh.ops.delete(bm, geom=comp, context='VERTS')
bm.normal_update()
# shape: puff outward, round off ears/nose/neck into a loose fabric shell
for v in bm.verts:
    c = v.co.copy()
    off = 0.02
    if abs(c.x) > 0.052 and c.z < browZ + 0.01 and c.z > chinZ: off = 0.042                       # cover the ears
    if c.z < chinZ + 0.01:                      # neck + shoulders: fabric hangs from the chin outwards
        k = max(0.0, min(1.0, (chinZ + 0.01 - c.z) / (chinZ - shZ)))
        off = 0.03 + 0.045 * math.sin(k * math.pi * 0.5)
    if c.z > browZ: off = 0.024 + 0.018 * max(0, (c.z - browZ) / 0.08)   # volume on top (bun shape at the back)
    if c.z > eyeZ and c.y > headC.y + 0.03: off += 0.02
    f = (c.x / 0.066) ** 2 + ((c.z - zc) / hz) ** 2
    if c.y < headC.y + 0.01 and f < 2.2:          # hug the face around the opening
        k = max(0.0, min(1.0, (f - 1.0) / 1.2)); off = 0.004 + (off - 0.004) * k * k
    v.co = c + v.normal * off
inner = [v for v in bm.verts if not ((v.co.x / 0.07) ** 2 + ((v.co.z - zc) / (hz + 0.01)) ** 2 < 1.3 and v.co.y < headC.y)]
for _ in range(24):
    bmesh.ops.smooth_vert(bm, verts=inner, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=True)
# smooth the face opening edge (keeps it round instead of following the mesh steps)
fe = [v for v in bm.verts if v.is_boundary and v.co.z >= chinZ - 0.02]
for _ in range(30):
    for v in fe:
        nb = [e.other_vert(v) for e in v.link_edges if e.other_vert(v).is_boundary]
        if len(nb) == 2:
            m = (nb[0].co + nb[1].co) / 2; v.co = v.co.lerp(m, 0.5)
# round off the jagged lower edge: smooth the outer boundary loop hard
low = [v for v in bm.verts if v.is_boundary and v.co.z < chinZ - 0.02]
ring = set(low)
for v in low:
    for e in v.link_edges: ring.add(e.other_vert(v))
for _ in range(60):
    bmesh.ops.smooth_vert(bm, verts=list(ring), factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
# re-inflate after smoothing so it never cuts into the head
bm.normal_update()
hm = bpy.data.meshes.new("hijab"); bm.to_mesh(hm); bm.free()
hj = bpy.data.objects.new(body.name.split('.')[0] + ".hijab", hm); bpy.context.collection.objects.link(hj)
for g in body.vertex_groups:
    if g.name.startswith("mixamorig"): hj.vertex_groups.new(name=g.name)
# copy skin weights from the body with a Data Transfer (nearest face interpolated)
hj.parent = arm
dt = hj.modifiers.new("dt", 'DATA_TRANSFER'); dt.object = body; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
bpy.context.view_layer.objects.active = hj; bpy.ops.object.modifier_apply(modifier="dt")
# drop non-rig groups, add thickness + armature
for g in list(hj.vertex_groups):
    if not g.name.startswith("mixamorig"): hj.vertex_groups.remove(g)
so = hj.modifiers.new("thick", 'SOLIDIFY'); so.thickness = 0.004; so.offset = 1.0
bpy.ops.object.modifier_apply(modifier="thick")
sm = hj.modifiers.new("sub", 'SUBSURF'); sm.levels = 1; bpy.ops.object.modifier_apply(modifier="sub")
am = hj.modifiers.new("Armature", 'ARMATURE'); am.object = arm
mat = bpy.data.materials.new("hijab"); mat.use_nodes = True
bs = mat.node_tree.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = HIJAB_COLOR; bs.inputs["Roughness"].default_value = 0.92
try: bs.inputs["Sheen Weight"].default_value = 0.4
except Exception: pass
hm.materials.append(mat)
for p in hm.polygons: p.use_smooth = True
print("HIJAB_OK", len(hm.vertices))
