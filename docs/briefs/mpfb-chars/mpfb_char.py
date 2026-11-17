"""Build a series character with MPFB2 (MakeHuman for Blender) and export a rigged GLB with face shape keys. EXPERIMENT.

usage:  /home/user/mh/bvenv/bin/python mpfb_char.py <character> <out.glb>
        (bpy 5.3 from PyPI + the MPFB2 source from github.com/makehumancommunity/mpfb2 — see README.md for the setup)
Output: one skinned mesh (body + hair + mustache + eyebrows + clothes, one material per part) on MPFB's Mixamo skeleton
        (bone names mixamorig:*), bound in T-pose so Mixamo clips play directly, plus face shape keys for lip sync:
        open, round (pursing), wide (retraction), press (compression), smile, blinkL/R, browsUp, browsDown.
"""
import sys, os, math, importlib, json
import numpy as np
import bpy, bmesh, addon_utils
from mathutils import Vector

CHAR, OUT = sys.argv[-2], sys.argv[-1]
HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = json.load(open(os.path.join(HERE, 'characters.json')))[CHAR]

# ---------- MPFB as an extension ----------
ext = bpy.utils.user_resource('EXTENSIONS', path='user_default', create=True)
if not os.path.exists(os.path.join(ext, 'mpfb')): os.symlink(os.environ.get('MPFB_SRC', '/home/user/mh/mpfb2/src/mpfb'), os.path.join(ext, 'mpfb'))
addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
def imp(mod, key):
    for m in list(sys.modules):
        if m.endswith(mod): return getattr(importlib.import_module(m), key)
HS = imp('mpfb.services.humanservice', 'HumanService')
TS = imp('mpfb.services.targetservice', 'TargetService')
HOP = imp('mpfb.entities.objectproperties', 'HumanObjectProperties')
LS = imp('mpfb.services.locationservice', 'LocationService')
TARGETS = LS.get_mpfb_data('targets')

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)

# ---------- 1. body: macros + detail targets, baked ----------
h = HS.create_human()
for k, v in SPEC['macro'].items(): HOP.set_value(k, v, entity_reference=h)
TS.reapply_macro_details(h)
for t, w in SPEC.get('targets', {}).items():
    TS.load_target(h, os.path.join(TARGETS, t + '.target.gz'), weight=w)   # e.g. "nose/nose-volume-incr": 0.5
TS.bake_targets(h)
if h.data.shape_keys:
    h.shape_key_clear()
for m in list(h.modifiers):
    if m.type == 'MASK': h.modifiers.remove(m)

# ---------- 2. Mixamo skeleton, re-bound in T-pose ----------
rig = HS.add_builtin_rig(h, 'mixamo_unity')
pose = json.load(open(os.path.join(LS.get_mpfb_data('poses'), 'mixamo_unity_fk', 't-pose.json')))['bone_rotations']
for name, r in pose.items():
    pb = rig.pose.bones.get(name)
    if pb: pb.rotation_mode = 'XYZ'; pb.rotation_euler = r
bpy.context.view_layer.update()
bpy.context.view_layer.objects.active = h
arm_mod = next(m for m in h.modifiers if m.type == 'ARMATURE')
bpy.ops.object.modifier_apply(modifier=arm_mod.name)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(); bpy.ops.object.mode_set(mode='OBJECT')
m = h.modifiers.new('Armature', 'ARMATURE'); m.object = rig

# ---------- 3a. face shape keys (expression units, relative to the T-pose bind) ----------
units = os.path.join(TARGETS, 'expression', 'units', SPEC.get('face_units', 'caucasian'))
KEYS = {'open': 'mouth-open', 'round': 'mouth-pursing', 'wide': 'mouth-retraction', 'press': 'mouth-compression', 'smile': 'mouth-corner-puller',
        'frown': 'mouth-depression', 'blinkL': 'eye-left-closure', 'blinkR': 'eye-right-closure', 'browsUp': None, 'browsDown': None}
h.shape_key_add(name='Basis', from_mix=False)
for k, f in KEYS.items():
    if f: TS.load_target(h, os.path.join(units, f + '.target.gz'), weight=0.0, name=k)
# both brows at once
for k, parts in (('browsUp', ('eyebrows-left-up', 'eyebrows-right-up')), ('browsDown', ('eyebrows-left-down', 'eyebrows-right-down'))):
    a = TS.load_target(h, os.path.join(units, parts[0] + '.target.gz'), weight=0.0, name=k + '_a')
    b = TS.load_target(h, os.path.join(units, parts[1] + '.target.gz'), weight=0.0, name=k + '_b')
    kb = h.data.shape_keys.key_blocks; base = kb['Basis']
    new = h.shape_key_add(name=k, from_mix=False)
    for i in range(len(new.data)): new.data[i].co = base.data[i].co + (kb[k + '_a'].data[i].co - base.data[i].co) + (kb[k + '_b'].data[i].co - base.data[i].co)
    h.shape_key_remove(kb[k + '_a']); h.shape_key_remove(kb[k + '_b'])
print('shape keys', h.data.shape_keys.key_blocks.keys())
me = h.data

# ---------- 3. landmarks ----------
me = h.data
co = np.array([v.co[:] for v in me.vertices]); gi = {g.name: g.index for g in h.vertex_groups}
memb = {}
for v in me.vertices:
    for g in v.groups: memb.setdefault(g.group, []).append(v.index)
def grp(name): return np.array(memb.get(gi[name], []), int)
def J(name): return Vector(co[grp(name)].mean(0))
EL, ER, MO, NE, PE = J('joint-l-eye'), J('joint-r-eye'), J('joint-mouth'), J('joint-neck'), J('joint-pelvis')
SL, KL, AL = J('joint-l-shoulder'), J('joint-l-knee'), J('joint-l-ankle')
TOP = co[grp('body')][:, 2].max()
# mouth line: on the face midline, the deepest point between the two lip fronts (below the nose)
mid = [i for i in grp('body') if abs(co[i, 0]) < 0.004 and EL.z - 0.13 < co[i, 2] < EL.z - 0.055 and co[i, 1] < EL.y + 0.06]
mid = sorted(mid, key=lambda i: co[i, 2]); prof = [(co[i, 2], co[i, 1]) for i in mid]
lips = [k for k in range(1, len(prof) - 1) if prof[k][1] <= prof[k - 1][1] and prof[k][1] <= prof[k + 1][1]]   # local fronts
cand = [k for k in range(1, len(prof) - 1) if prof[k][1] >= prof[k - 1][1] and prof[k][1] >= prof[k + 1][1]]   # local dents
lo, up = (sorted(lips, key=lambda k: prof[k][1])[:2] + [0, 0])[:2]
lo, up = min(lo, up, key=lambda k: prof[k][0]), max(lo, up, key=lambda k: prof[k][0])
dent = [k for k in cand if prof[lo][0] < prof[k][0] < prof[up][0]]
MZ = prof[max(dent, key=lambda k: prof[k][1])][0] if dent else (prof[lo][0] + prof[up][0]) / 2
MO = Vector((0, prof[up][1], MZ))
print('mouth line z', round(MZ, 4), 'upper lip front', [round(x, 3) for x in prof[up]], 'lower', [round(x, 3) for x in prof[lo]])
print('landmarks eye', EL, 'mouth', MO, 'neck', NE, 'shoulder', SL, 'pelvis', PE, 'top', round(float(TOP), 3))

# ---------- 4. parts (bmesh keeps weights; no shape keys yet) ----------
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
dl = bm.verts.layers.deform.active
def in_group(v, name): return gi[name] in v[dl]
MATS = []
def mat(name, rgb, rough=0.6):
    mt = bpy.data.materials.get(name) or bpy.data.materials.new(name); mt.use_nodes = True
    b = mt.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    if mt.name not in [x.name for x in MATS]: MATS.append(mt)
    return MATS.index(mt)
def hexrgb(s): s = s.lstrip('#'); return tuple((int(s[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))
C = SPEC['colors']
M_SKIN = mat('skin', hexrgb(C['skin']), 0.55)
for f in bm.faces: f.material_index = M_SKIN
def face_in(f, name): return all(in_group(v, name) for v in f.verts)
def kill(faces):
    faces = list(set(faces)); bmesh.ops.delete(bm, geom=faces, context='FACES')
    loose = [v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
def cen(f): return f.calc_center_median()
SHAPES = list(bm.verts.layers.shape.values())
def move(v, d):   # move a vertex in the mesh AND in every shape key, so the face movements keep working on it
    v.co += d
    for sl in SHAPES: v[sl] += d

# helpers we never use
kill([f for f in bm.faces if any(in_group(v, 'JointCubes') for v in f.verts)])
kill([f for f in bm.faces if any(face_in(f, g) for g in ('helper-genital', 'helper-tongue', 'helper-l-eyelashes-1', 'helper-l-eyelashes-2', 'helper-r-eyelashes-1', 'helper-r-eyelashes-2'))])
if not SPEC.get('dress'): kill([f for f in bm.faces if face_in(f, 'helper-skirt')])
# eyes: sclera / iris / pupil by direction from the eyeball centre
for side in ('helper-l-eye', 'helper-r-eye'):
    fs = [f for f in bm.faces if face_in(f, side)]
    c = sum((v.co for f in fs for v in f.verts), Vector()) / sum(len(f.verts) for f in fs)
    for f in fs:
        d = (cen(f) - c).normalized(); a = -d.y
        f.material_index = mat('pupil', (0.01, 0.01, 0.01), 0.2) if a > math.cos(math.radians(9)) else mat('iris', hexrgb(C.get('iris', '#3a2414')), 0.3) if a > math.cos(math.radians(21)) else mat('sclera', (0.85, 0.83, 0.8), 0.25)
for f in bm.faces:
    if face_in(f, 'helper-upper-teeth') or face_in(f, 'helper-lower-teeth'): f.material_index = mat('teeth', (0.8, 0.78, 0.7), 0.3)
    if face_in(f, 'helper-l-eyelashes-1') or face_in(f, 'helper-r-eyelashes-1') or face_in(f, 'helper-l-eyelashes-2') or face_in(f, 'helper-r-eyelashes-2'): f.material_index = mat('hair', hexrgb(C['hair']), 0.8)

# the long-hair helper is not used: hair is a shell grown from the scalp skin (see 'hair' below, after the clothes)
kill([f for f in bm.faces if face_in(f, 'helper-hair')])

# clothes from the tights helper
tf = [f for f in bm.faces if face_in(f, 'helper-tights')]
def shirt_zone(p, shrink=0.0):
    if not (PE.z + 0.06 + shrink < p.z < SL.z + 0.05 - shrink): return False
    ax = abs(p.x)
    if ax > SL.x * 0.98 - shrink: return False
    if SPEC['shirt'] == 'tank' and p.z > SL.z - 0.13 and ax > SL.x * 0.62 - shrink: return False     # arm holes
    if p.z > SL.z - 0.02 - shrink and ax < 0.075 + shrink: return False                                # neck hole
    if SPEC['shirt'] == 'tank' and p.y < NE.y - 0.04 and p.z > SL.z - 0.09 - shrink and ax < 0.10 + shrink: return False  # front scoop
    return True
def sleeve_zone(p, shrink=0.0):
    return SPEC['shirt'] == 'tshirt' and SL.z - 0.16 < p.z < SL.z + 0.05 and SL.x * 0.9 < abs(p.x) < SL.x * 1.0 + 0.22 - shrink
def pants_zone(p, shrink=0.0):
    top = PE.z + 0.12 - shrink; bot = (KL.z + 0.04) if SPEC['pants'] == 'shorts' else (AL.z + 0.03)
    return bot + shrink < p.z < top
keep_shirt, keep_pants, drop = [], [], []
for f in tf:
    p = cen(f)
    if shirt_zone(p) or sleeve_zone(p): keep_shirt.append(f)
    elif pants_zone(p): keep_pants.append(f)
    else: drop.append(f)
M_SHIRT = mat('shirt', hexrgb(C['shirt']), 0.85); M_PANTS = mat('pants', hexrgb(C['pants']), 0.85)
for f in keep_shirt: f.material_index = M_SHIRT
for f in keep_pants: f.material_index = M_PANTS
kill(drop)
loose = SPEC.get('loose_pants', 0.0)
if loose:
    for v in {v for f in bm.faces if f.material_index == M_PANTS for v in f.verts}: move(v, v.normal * loose)
# body under the clothes goes (no poke-through when the arms/legs move)
under = [f for f in bm.faces if f.material_index == M_SKIN and face_in(f, 'body') and (shirt_zone(cen(f), 0.03) or pants_zone(cen(f), 0.03))]
kill(under)

# facial hair + eyebrows: thin shells duplicated from the face skin
def shell(sel, mi, lift, thick):
    if not sel: return
    r = bmesh.ops.duplicate(bm, geom=sel); nf = [g for g in r['geom'] if isinstance(g, bmesh.types.BMFace)]
    nv = {v for f in nf for v in f.verts}
    nrm = {v: v.normal.copy() for v in nv}
    for v in nv: move(v, nrm[v] * lift)
    ex = bmesh.ops.extrude_face_region(bm, geom=nf)
    for v in [g for g in ex['geom'] if isinstance(g, bmesh.types.BMVert)]: move(v, (nrm.get(v) or v.normal) * thick)
    for f in [g for g in ex['geom'] if isinstance(g, bmesh.types.BMFace)] + nf: f.material_index = mi
    bm.faces.ensure_lookup_table(); bm.verts.ensure_lookup_table()
front = lambda f: f.normal.y < -0.35 and face_in(f, 'body')
bm.normal_update()
# smooth facial hair: a tapered tube laid on the skin along a curve; every tube vertex copies the weights and the
# shape-key motion of the nearest skin vertex, so it rides the lip / brow when the face moves
from mathutils.kdtree import KDTree
skin_vs = [v for v in bm.verts if in_group(v, 'body') and not in_group(v, 'HelperGeometry')]
kd = KDTree(len(skin_vs))
for i, v in enumerate(skin_vs): kd.insert(v.co, i)
kd.balance()
def on_skin(x, z, front_y):
    """skin point at (x, z) on the front of the face: nearest skin vertex to a probe in front of it, then its normal"""
    best = None
    for (co_, i, d) in kd.find_n(Vector((x, front_y, z)), 12):
        v = skin_vs[i]
        if v.normal.y < -0.1 and (best is None or abs(v.co.x - x) + abs(v.co.z - z) < abs(best.co.x - x) + abs(best.co.z - z)): best = v
    return best
def tube(path, radius, mi, lift=0.003, sides=8, flat=0.55):
    """path: list of (x, z); radius: list of radii; the tube is flattened against the skin (flat < 1)"""
    rings = []
    for (x, z), r in zip(path, radius):
        v = on_skin(x, z, EL.y - 0.1)
        n = v.normal.copy().normalized(); c = Vector((x, v.co.y, z)) + n * (lift + r * flat)
        rings.append((c, n, r, v))
    new = []
    for k, (c, n, r, src) in enumerate(rings):
        t = (rings[min(k + 1, len(rings) - 1)][0] - rings[max(k - 1, 0)][0]).normalized()
        b = t.cross(n).normalized(); ring = []
        for j in range(sides):
            a = 2 * math.pi * j / sides
            p = c + b * math.cos(a) * r + n * math.sin(a) * r * flat
            nv = bm.verts.new(p); nv[dl].clear()
            for gk, w in src[dl].items(): nv[dl][gk] = w
            for sl in SHAPES: nv[sl] = p + (src[sl] - src.co)
            ring.append(nv)
        new.append(ring)
    for k in range(len(new) - 1):
        for j in range(sides):
            f = bm.faces.new((new[k][j], new[k][(j + 1) % sides], new[k + 1][(j + 1) % sides], new[k + 1][j])); f.material_index = mi; f.smooth = True
    for ring in (new[0], new[-1][::-1]):
        f = bm.faces.new(ring[::-1] if ring is new[0] else ring); f.material_index = mi
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
M_HAIR = mat('hair', hexrgb(C['hair']), 0.85)
mus = SPEC.get('mustache')
if mus:
    W, D, T = mus.get('w', 0.03), mus.get('droop', 0.012), mus.get('thick', 0.006)
    n = 15; path, rad = [], []
    for k in range(n):
        u = -1 + 2 * k / (n - 1); x = u * W
        z = MO.z + mus.get('up', 0.012) - D * max(0, abs(u) - 0.45) / 0.55 * (1.6 if abs(u) > 0.8 else 1)
        path.append((x, z)); rad.append(T * (1 - 0.65 * abs(u) ** 2))
    tube(path, rad, M_HAIR, lift=0.002, flat=0.6)
brow = SPEC.get('brows', 0.004)
if brow:
    for E in (EL, ER):
        sgn = 1 if E.x > 0 else -1; n = 9; path, rad = [], []
        for k in range(n):
            u = k / (n - 1); x = E.x + sgn * (-0.017 + 0.038 * u)
            z = E.z + 0.022 + 0.006 * math.sin(math.pi * min(1, u * 1.2)) - 0.004 * u
            path.append((x, z)); rad.append(brow * (1.15 - 0.6 * u))
        tube(path, rad, M_HAIR, lift=0.0015, flat=0.45, sides=6)

hair = SPEC.get('hair', 'full')
if hair != 'none':
    HZ = EL.z   # eye height
    def scalp(f):
        p = cen(f)
        if not face_in(f, 'body') or p.z < HZ - 0.035: return False
        back = p.y > EL.y + 0.075            # behind the ears' front edge
        if hair == 'sides': return back and p.z < HZ + 0.085 and not (p.z < HZ + 0.0 and p.y > EL.y + 0.17 and abs(p.x) < 0.04) or (p.y > EL.y + 0.13 and p.z < HZ + 0.075)
        return (back and p.z < HZ + 0.2) or p.z > HZ + 0.06
    sel = [f for f in bm.faces if scalp(f) and abs(cen(f).x) < 0.2]
    print('hair faces', len(sel))
    shell(sel, mat('hair', hexrgb(C['hair']), 0.85), 0.002, SPEC.get('hair_thick', 0.012 if hair == 'curly' else 0.006))
bm.to_mesh(me); bm.free()
idx = [p.material_index for p in me.polygons]
me.materials.clear()
for mt in MATS: me.materials.append(mt)
for p, i in zip(me.polygons, idx): p.material_index = i
me.update()
import collections; print('faces per material', {MATS[k].name: n for k, n in collections.Counter(idx).items()})

# stripes (vertex colours) on pajama trousers
if C.get('pants_stripes'):
    ca = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
    s1, s2 = hexrgb(C['pants']), hexrgb(C['pants_stripes'])
    for poly in me.polygons:
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index].co; col = (1, 1, 1)
            if poly.material_index == M_PANTS:
                cx = PE.x + (0.09 if v.x > 0 else -0.09); a = math.atan2(v.y - 0.0, v.x - cx)
                col = s2 if int((a + math.pi) / (2 * math.pi) * 16) % 2 else s1
            ca.data[li].color = (*col, 1)
    bpy.data.materials['pants'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (1, 1, 1, 1)

# ---------- 6. export ----------
h.name = CHAR; rig.name = CHAR + '_rig'
for o in bpy.data.objects: o.select_set(o in (h, rig))
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_format='GLB', export_skins=True, export_morph=True, export_morph_normal=True,
                          export_animations=False, export_yup=True, export_apply=False,
                          export_vertex_color='ACTIVE')
print('EXPORTED', OUT, len(me.vertices), 'verts', len(me.materials), 'materials')
