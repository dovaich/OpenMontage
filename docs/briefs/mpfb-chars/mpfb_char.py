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
def smooth_edge(mi, it=4, k=0.5):
    """relax the open border of the faces with material mi (removes the stair steps of a grid cut)"""
    fs = {f for f in bm.faces if f.material_index == mi}
    border = [e for e in bm.edges if sum(1 for f in e.link_faces if f in fs) == 1 and (len(e.link_faces) == 1 or not all(f in fs for f in e.link_faces))]
    nb = {}
    for e in border:
        a, b = e.verts; nb.setdefault(a, set()).add(b); nb.setdefault(b, set()).add(a)
    for _ in range(it):
        tgt = {v: sum((u.co for u in n), Vector()) / len(n) for v, n in nb.items() if len(n) == 2}
        for v, t in tgt.items(): move(v, (t - v.co) * k)
SHAPES = list(bm.verts.layers.shape.values())
def move(v, d):   # move a vertex in the mesh AND in every shape key, so the face movements keep working on it
    v.co += d
    for sl in SHAPES: v[sl] += d

# helpers we never use
kill([f for f in bm.faces if any(in_group(v, 'JointCubes') for v in f.verts)])
kill([f for f in bm.faces if any(face_in(f, g) for g in ('helper-genital', 'helper-tongue', 'helper-l-eyelashes-1', 'helper-l-eyelashes-2', 'helper-r-eyelashes-1', 'helper-r-eyelashes-2'))])
if not SPEC.get('dress'): kill([f for f in bm.faces if face_in(f, 'helper-skirt')])
# eyes: the helper eyeballs are too coarse for a close-up -> a smooth sphere per eye (sclera / iris / pupil by angle),
# riding the head bone (copied from the nearest skin vertex), with no shape-key motion
EYES = []
for side in ('helper-l-eye', 'helper-r-eye'):
    fs = [f for f in bm.faces if face_in(f, side)]
    vs = {v for f in fs for v in f.verts}
    c = sum((v.co for v in vs), Vector()) / len(vs); r = max((v.co - c).length for v in vs) * 0.985
    sv = next(iter(vs)); EYES.append((c, r, dict(sv[dl].items())))
    kill(fs)
def eyeball(c, r, src):
    W_, H_ = 40, 24; rows = []
    for i in range(H_ + 1):
        th = math.pi * i / H_; row = []
        for j in range(W_):
            ph = 2 * math.pi * j / W_
            d = Vector((math.sin(th) * math.cos(ph), -math.cos(th), math.sin(th) * math.sin(ph)))   # pole i=0 points to the front (-y)
            p = c + d * r; v = bm.verts.new(p)
            for gk, wt in src.items(): v[dl][gk] = wt
            for sl in SHAPES: v[sl] = p.copy()
            row.append(v)
        rows.append(row)
    I = C.get('iris_deg', 23)
    for i in range(H_):
        for j in range(W_):
            q = (rows[i][j], rows[i][(j + 1) % W_], rows[i + 1][(j + 1) % W_], rows[i + 1][j])
            if i == 0: q = (rows[0][j], rows[1][(j + 1) % W_], rows[1][j])
            try: f = bm.faces.new(q)
            except ValueError: continue
            ang = 180 * (i + 0.5) / H_
            f.material_index = mat('pupil', (0.01, 0.01, 0.01), 0.15) if ang < I * 0.42 else mat('iris', hexrgb(C.get('iris', '#3a2414')), 0.25) if ang < I else mat('sclera', (0.82, 0.8, 0.77), 0.2)
            f.smooth = True
            if f.normal.dot(f.calc_center_median() - c) < 0: f.normal_flip()
for f in bm.faces:
    if face_in(f, 'helper-upper-teeth') or face_in(f, 'helper-lower-teeth'): f.material_index = mat('teeth', (0.8, 0.78, 0.7), 0.3)
    if face_in(f, 'helper-l-eyelashes-1') or face_in(f, 'helper-r-eyelashes-1') or face_in(f, 'helper-l-eyelashes-2') or face_in(f, 'helper-r-eyelashes-2'): f.material_index = mat('hair', hexrgb(C['hair']), 0.8)

for c_, r_, src_ in EYES: eyeball(c_, r_, src_)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
# the long-hair helper is not used: hair is a shell grown from the scalp skin (see 'hair' below, after the clothes)
kill([f for f in bm.faces if face_in(f, 'helper-hair')])

# clothes from the tights helper
tf = [f for f in bm.faces if face_in(f, 'helper-tights')]
bmesh.ops.subdivide_edges(bm, edges=list({e for f in tf for e in f.edges}), cuts=1, use_grid_fill=True)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
tf = [f for f in bm.faces if face_in(f, 'helper-tights')]
def ell(dx, dz, rx, rz): return (dx / rx) ** 2 + (dz / rz) ** 2 < 1
def shirt_zone(p, shrink=0.0):
    if not (PE.z + 0.06 + shrink < p.z < SL.z + 0.06 - shrink): return False
    ax = abs(p.x)
    if ax > SL.x * 1.02 - shrink: return False
    if SPEC['shirt'] == 'tank':
        if ell(ax - SL.x * 1.0, p.z - (SL.z + 0.0), 0.075 + shrink, 0.16 + shrink): return False     # round arm holes
        if ell(ax, p.z - (SL.z + 0.07), 0.095 + shrink, (0.16 if p.y < NE.y - 0.02 else 0.085) + shrink): return False  # neck, deeper scoop in front
    elif ell(ax, p.z - (SL.z + 0.06), 0.075 + shrink, 0.07 + shrink): return False
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
smooth_edge(M_SHIRT); smooth_edge(M_PANTS)
loose = SPEC.get('loose_pants', 0.0)
if loose:
    for v in {v for f in bm.faces if f.material_index == M_PANTS for v in f.verts}: move(v, v.normal * loose)
# body under the clothes goes (no poke-through when the arms/legs move)
under = [f for f in bm.faces if f.material_index == M_SKIN and face_in(f, 'body') and (shirt_zone(cen(f), 0.03) or pants_zone(cen(f), 0.03))]
kill(under)

# facial hair + eyebrows: thin shells duplicated from the face skin
def shell(sel, mi, lift, thick, smooth=True):
    if not sel: return
    r = bmesh.ops.duplicate(bm, geom=sel); nf = [g for g in r['geom'] if isinstance(g, bmesh.types.BMFace)]
    nv = {v for f in nf for v in f.verts}
    nrm = {v: v.normal.copy() for v in nv}
    for v in nv: move(v, nrm[v] * lift)
    fs = set(nf); nb = {}
    for e in {e for f in nf for e in f.edges}:
        if sum(1 for f in e.link_faces if f in fs) == 1:
            a, b = e.verts; nb.setdefault(a, set()).add(b); nb.setdefault(b, set()).add(a)
    for _ in range(4 if smooth else 0):
        tgt = {v: sum((u.co for u in n), Vector()) / len(n) for v, n in nb.items() if len(n) == 2}
        for v, t in tgt.items(): move(v, (t - v.co) * 0.5)
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
    # ears: the outermost skin at eye-to-mouth height on each side
    sk = [v for v in bm.verts if in_group(v, 'body') and MO.z - 0.01 < v.co.z < EL.z + 0.03 and v.co.y > EL.y + 0.05]
    EARS = []
    for sg in (1, -1):
        side = sorted([v for v in sk if v.co.x * sg > 0], key=lambda v: -abs(v.co.x))[:60]
        EARS.append(sum((v.co for v in side), Vector()) / len(side))
    # the ear's real outline: skin that sticks out sideways from the skull around E (|x| beyond the skull surface)
    EARBOX = []
    for E in EARS:
        ev = [v.co for v in bm.verts if in_group(v, 'body') and v.co.x * E.x > 0 and abs(v.co.x) > abs(E.x) - 0.007 and abs(v.co.z - E.z) < 0.05 and abs(v.co.y - E.y) < 0.045]
        ys = [c.y for c in ev]; zs = [c.z for c in ev]
        EARBOX.append(((min(ys) + max(ys)) / 2, (max(ys) - min(ys)) / 2, (min(zs) + max(zs)) / 2, (max(zs) - min(zs)) / 2, abs(E.x)))
    E0 = Vector((EARS[0].x, EARBOX[0][0], EARBOX[0][2]))
    print('ears', [tuple(round(x, 3) for x in b) for b in EARBOX])
    def ear_hole(p, m=0.004):   # the ear itself plus a small margin: hair goes tight around it
        return any(abs(p.x) > ax - 0.022 and ((p.y - cy) / (ry + m)) ** 2 + ((p.z - cz) / (rz + m)) ** 2 < 1 for cy, ry, cz, rz, ax in EARBOX)
    def scalp(f):
        p = cen(f)
        if not face_in(f, 'body') or ear_hole(p): return False
        if hair == 'sides':   # horseshoe: temples + sideburns + around the ears + back, bald on top
            if p.y < EL.y + 0.04: return False                                    # nothing on the forehead / face
            behind = p.y > E0.y + 0.025
            top = TOP - (0.075 if behind else 0.082)
            bottom = HZ - (0.075 if behind else 0.0)                              # nape lower, sideburns to the ear middle
            if p.y < E0.y - 0.015: bottom = max(bottom, E0.z - 0.01)              # sideburn in front of the ear
            return bottom < p.z < top and abs(p.x) > (0.0 if behind else 0.05)
        if p.z < HZ - 0.035: return False
        return (p.y > EL.y + 0.075 and p.z < HZ + 0.2) or p.z > HZ + 0.06
    sel = [f for f in bm.faces if scalp(f) and abs(cen(f).x) < 0.2]
    print('hair faces', len(sel))
    shell(sel, mat('hair', hexrgb(C['hair']), 0.85), 0.002, SPEC.get('hair_thick', 0.012 if hair == 'curly' else 0.006))
# ---- accessories ----
def ring3(center, normal, radius, tube_r, mi, src, sides=6, seg=20):
    """a torus in 3D (e.g. a goggle rim), riding the skin vertex src"""
    n = normal.normalized(); u = n.orthogonal().normalized(); w = n.cross(u)
    rings = []
    for k in range(seg):
        a = 2 * math.pi * k / seg; c = center + (u * math.cos(a) + w * math.sin(a)) * radius; rd = (c - center).normalized(); ring = []
        for j in range(sides):
            b = 2 * math.pi * j / sides; p = c + (rd * math.cos(b) + n * math.sin(b)) * tube_r
            v = bm.verts.new(p)
            for gk, wt in src[dl].items(): v[dl][gk] = wt
            for sl in SHAPES: v[sl] = p + (src[sl] - src.co)
            ring.append(v)
        rings.append(ring)
    for k in range(seg):
        for j in range(sides):
            f = bm.faces.new((rings[k][j], rings[k][(j + 1) % sides], rings[(k + 1) % seg][(j + 1) % sides], rings[(k + 1) % seg][j])); f.material_index = mi; f.smooth = True
    return rings
def disc(center, normal, radius, mi, src, seg=20):
    n = normal.normalized(); u = n.orthogonal().normalized(); w = n.cross(u); vs = []
    for k in range(seg):
        a = 2 * math.pi * k / seg; p = center + (u * math.cos(a) + w * math.sin(a)) * radius; v = bm.verts.new(p)
        for gk, wt in src[dl].items(): v[dl][gk] = wt
        for sl in SHAPES: v[sl] = p + (src[sl] - src.co)
        vs.append(v)
    f = bm.faces.new(vs); f.material_index = mi
    if f.normal.dot(n) < 0: f.normal_flip()
bm.normal_update()
if SPEC.get('sandals'):
    M_SAND = mat('sandals', hexrgb(SPEC['sandals']), 0.7)
    soles = [f for f in bm.faces if face_in(f, 'body') and cen(f).z < AL.z - 0.035 and f.normal.z < -0.4]
    shell(soles, M_SAND, 0.001, 0.016)
    strap = [f for f in bm.faces if face_in(f, 'body') and AL.z - 0.075 < cen(f).z < AL.z - 0.02 and f.normal.z > 0.25 and f.material_index == M_SKIN and abs(cen(f).y - (AL.y - 0.075)) < 0.022]
    shell(strap, M_SAND, 0.002, 0.004, smooth=False)
if SPEC.get('goggles'):
    M_BRASS = mat('brass', hexrgb('#b8902c'), 0.35); M_GLASS = mat('lens', hexrgb('#2c4a3a'), 0.1); M_STRAP = mat('strap', hexrgb('#3a2a1e'), 0.8)
    gz = EL.z + 0.058
    # smooth flat band around the head at goggle height: one ring point per angle on the skull, pushed out over the hair
    HC = Vector((0, (EL.y + EARBOX[0][0]) / 2 + 0.03, gz))
    ring_vs = [v for v in skin_vs if abs(v.co.z - gz) < 0.008 and v.is_valid]
    pts = []
    for k in range(48):
        a = 2 * math.pi * k / 48; d = Vector((math.sin(a), -math.cos(a), 0))
        v = max(ring_vs, key=lambda v: (v.co - HC).normalized().dot(d))
        pts.append((Vector((v.co.x, v.co.y, gz)) + Vector((v.normal.x, v.normal.y, 0)).normalized() * 0.0105, v))
    rings = []
    for k, (c, src) in enumerate(pts):
        t = (pts[(k + 1) % 48][0] - pts[k - 1][0]).normalized(); out = Vector((0, 0, 1)).cross(t).normalized()
        ring = []
        for (du, dz) in ((-0.0015, -0.007), (0.0015, -0.007), (0.0015, 0.007), (-0.0015, 0.007)):
            pnt = c + out * du + Vector((0, 0, dz)); nv = bm.verts.new(pnt)
            for gk, wt in src[dl].items(): nv[dl][gk] = wt
            for sl in SHAPES: nv[sl] = pnt + (src[sl] - src.co)
            ring.append(nv)
        rings.append(ring)
    for k in range(48):
        for j in range(4):
            f = bm.faces.new((rings[k][j], rings[k][(j + 1) % 4], rings[(k + 1) % 48][(j + 1) % 4], rings[(k + 1) % 48][j])); f.material_index = M_STRAP
    bm.normal_update()
    for sx in (1, -1):
        v = on_skin(sx * 0.034, gz, EL.y - 0.1); nrm = (v.normal + Vector((0, 0, 0.35))).normalized()
        c = v.co + nrm * 0.012
        ring3(c, nrm, 0.022, 0.006, M_BRASS, v); disc(c + nrm * 0.004, nrm, 0.02, M_GLASS, v)
    bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
for f in bm.faces: f.smooth = True
bm.to_mesh(me); bm.free()
idx = [p.material_index for p in me.polygons]
me.materials.clear()
for mt in MATS: me.materials.append(mt)
for p, i in zip(me.polygons, idx): p.material_index = i
me.update()
import collections; print('faces per material', {MATS[k].name: n for k, n in collections.Counter(idx).items()})

# vertex colours (multiply the material colour): lips, cheeks, stubble, under-eyes; stripes on the pajama trousers
ca = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
P_SKIN, P_PANTS = MATS.index(bpy.data.materials['skin']), MATS.index(bpy.data.materials['pants'])
P_HAIR = MATS.index(bpy.data.materials['hair'])
GREY = SPEC.get('grey_temples', 0.0)
HB, HG = hexrgb(C['hair']), hexrgb('#9a948e')   # hair = grey material x dark vertex colour (lighter at the temples)
if GREY: bpy.data.materials['hair'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*HG, 1)
s1 = hexrgb(C['pants']); s2 = hexrgb(C.get('pants_stripes', C['pants']))
def sm(a, b, x): x = max(0.0, min(1.0, (x - a) / (b - a))); return x * x * (3 - 2 * x)
def tint(v):
    r = g = b = 1.0
    def mix(t, col, k):
        nonlocal r, g, b; r, g, b = r + (col[0] - r) * k * t, g + (col[1] - g) * k * t, b + (col[2] - b) * k * t
    face = v.y < EL.y + 0.05 and v.z > NE.z
    if face:
        lip = sm(0.022, 0.0, math.hypot(v.x / 1.6, v.z - MO.z)) * sm(MO.y + 0.03, MO.y + 0.005, v.y)
        mix(lip, (0.78, 0.52, 0.52), 0.8)
        for E in (EL, ER):
            ch = sm(0.045, 0.0, math.hypot(v.x - E.x * 1.6, v.z - (E.z - 0.045)))
            mix(ch, (1.05, 0.85, 0.82), 0.5)
            ue = sm(0.016, 0.0, math.hypot(v.x - E.x, v.z - (E.z - 0.016)))
            mix(ue, (0.82, 0.78, 0.82), 0.6)
        if SPEC.get('stubble'):
            st = sm(MO.z + 0.03, MO.z + 0.0, v.z) * sm(NE.z + 0.0, NE.z + 0.05, v.z) * (1 - sm(0.06, 0.08, abs(v.x)) * sm(MO.z - 0.02, MO.z + 0.01, v.z))
            mix(st * (1 - lip), (0.72, 0.74, 0.8), SPEC['stubble'])
    if v.z > EL.z + 0.06: mix(1, (1.04, 0.95, 0.92), 0.4)     # scalp/forehead a bit warmer/shinier
    return (min(r, 1), min(g, 1), min(b, 1))
for poly in me.polygons:
    for li in poly.loop_indices:
        v = me.vertices[me.loops[li].vertex_index].co; col = (1, 1, 1)
        if poly.material_index == P_SKIN: col = tint(v)
        elif poly.material_index == P_HAIR and GREY:
            k = 0.0
            if v.z > MO.z + 0.03 and abs(v.x) > 0.05:   # salt-and-pepper temples (not the mustache/brows)
                k = GREY * sm(EL.y + 0.03, EL.y + 0.09, v.y) * (1 - sm(EL.y + 0.13, EL.y + 0.2, v.y)) * (0.55 + 0.45 * ((int(v.x * 900) + int(v.z * 700)) % 3 == 0))
            col = tuple(HB[i] / HG[i] + (1 - HB[i] / HG[i]) * k for i in range(3))
        elif poly.material_index == P_PANTS and C.get('pants_stripes'):
            cx = 0.09 if v.x > 0 else -0.09; ang = math.atan2(v.y, v.x - cx)
            col = s2 if int((ang + math.pi) / (2 * math.pi) * 16) % 2 else s1
        ca.data[li].color = (*[min(1.0, c) for c in col], 1)
if C.get('pants_stripes'): bpy.data.materials['pants'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (1, 1, 1, 1)
me.color_attributes.active_color = ca
import statistics; _c=[tuple(round(x,2) for x in ca.data[li].color[:3]) for poly in me.polygons if poly.material_index==P_SKIN for li in poly.loop_indices]; print('skin tint samples', sum(1 for c in _c if c!=(1.0,1.0,1.0)), 'of', len(_c), min(_c))

# ---------- 6. export ----------
h.name = CHAR; rig.name = CHAR + '_rig'
for o in bpy.data.objects: o.select_set(o in (h, rig))
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_format='GLB', export_skins=True, export_morph=True, export_morph_normal=True,
                          export_animations=False, export_yup=True, export_apply=False,
                          export_vertex_color='ACTIVE')
print('EXPORTED', OUT, len(me.vertices), 'verts', len(me.materials), 'materials')
