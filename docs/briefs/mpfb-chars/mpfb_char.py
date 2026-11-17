"""Build a series character with MPFB2 (MakeHuman for Blender) and export a rigged GLB with face shape keys. EXPERIMENT.

usage:  /home/user/mh/bvenv/bin/python mpfb_char.py <character> <out.glb>        (characters.json holds every character)
Setup:  bpy 5.3 from PyPI in a venv + the MPFB2 source (git clone github.com/makehumancommunity/mpfb2), see README.md.
Output: one skinned mesh on MPFB's Mixamo skeleton (bones mixamorig:*), bound in T-pose so Mixamo clips play directly, with
        face shape keys for lip sync / acting: open, round, wide, press, smile, frown, blinkL, blinkR, browsUp, browsDown.
        Clothes are built from MPFB's helper geometry (bodysuit "tights", ankle-length "skirt") and shells grown from the skin;
        each piece copies the skin's bone weights AND shape-key motion, so it follows the body and the face.
        Fabric patterns are generated textures on cylindrical UVs (stripes, floral, ...); skin detail is added at runtime.
"""
import sys, os, math, importlib, json, collections
import numpy as np
import bpy, bmesh, addon_utils
from mathutils import Vector
from mathutils.kdtree import KDTree

CHAR, OUT = sys.argv[-2], sys.argv[-1]
HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = json.load(open(os.path.join(HERE, 'characters.json')))[CHAR]
WEAR = SPEC.get('wear', {})

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
for t, w in SPEC.get('targets', {}).items(): TS.load_target(h, os.path.join(TARGETS, t + '.target.gz'), weight=w)
TS.bake_targets(h)
if h.data.shape_keys: h.shape_key_clear()
for m in list(h.modifiers):
    if m.type == 'MASK': h.modifiers.remove(m)

# ---------- 2. Mixamo skeleton, re-bound in T-pose ----------
rig = HS.add_builtin_rig(h, 'mixamo_unity')
pose = json.load(open(os.path.join(LS.get_mpfb_data('poses'), 'mixamo_unity_fk', 't-pose.json')))['bone_rotations']
for name, r in pose.items():
    pb = rig.pose.bones.get(name)
    if pb: pb.rotation_mode = 'XYZ'; pb.rotation_euler = r
bpy.context.view_layer.update(); bpy.context.view_layer.objects.active = h
bpy.ops.object.modifier_apply(modifier=next(m for m in h.modifiers if m.type == 'ARMATURE').name)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(); bpy.ops.object.mode_set(mode='OBJECT')
h.modifiers.new('Armature', 'ARMATURE').object = rig

# ---------- 3. face shape keys (MPFB expression units) ----------
units = os.path.join(TARGETS, 'expression', 'units', SPEC.get('face_units', 'caucasian'))
h.shape_key_add(name='Basis', from_mix=False)
for k, f in {'open': 'mouth-open', 'round': 'mouth-pursing', 'wide': 'mouth-retraction', 'press': 'mouth-compression',
             'smile': 'mouth-corner-puller', 'frown': 'mouth-depression', 'blinkL': 'eye-left-closure', 'blinkR': 'eye-right-closure'}.items():
    TS.load_target(h, os.path.join(units, f + '.target.gz'), weight=0.0, name=k)
for k, parts in (('browsUp', ('eyebrows-left-up', 'eyebrows-right-up')), ('browsDown', ('eyebrows-left-down', 'eyebrows-right-down'))):
    for i, part in enumerate(parts): TS.load_target(h, os.path.join(units, part + '.target.gz'), weight=0.0, name=f'{k}_{i}')
    kb = h.data.shape_keys.key_blocks; base = kb['Basis']; new = h.shape_key_add(name=k, from_mix=False)
    for i in range(len(new.data)): new.data[i].co = base.data[i].co + (kb[k + '_0'].data[i].co - base.data[i].co) + (kb[k + '_1'].data[i].co - base.data[i].co)
    h.shape_key_remove(kb[k + '_0']); h.shape_key_remove(kb[k + '_1'])
me = h.data

# ---------- 4. landmarks ----------
co = np.array([v.co[:] for v in me.vertices]); gi = {g.name: g.index for g in h.vertex_groups}
memb = {}
for v in me.vertices:
    for g in v.groups: memb.setdefault(g.group, []).append(v.index)
def grp(name): return np.array(memb.get(gi[name], []), int)
def J(name): return Vector(co[grp(name)].mean(0))
EL, ER, NE, PE = J('joint-l-eye'), J('joint-r-eye'), J('joint-neck'), J('joint-pelvis')
SL, WL, KL, AL = J('joint-l-shoulder'), J('joint-l-hand'), J('joint-l-knee'), J('joint-l-ankle')
TOP = float(co[grp('body')][:, 2].max())
mid = sorted([i for i in grp('body') if abs(co[i, 0]) < 0.004 and EL.z - 0.13 < co[i, 2] < EL.z - 0.055 and co[i, 1] < EL.y + 0.06], key=lambda i: co[i, 2])
prof = [(co[i, 2], co[i, 1]) for i in mid]
fronts = [k for k in range(1, len(prof) - 1) if prof[k][1] <= prof[k - 1][1] and prof[k][1] <= prof[k + 1][1]]
dents = [k for k in range(1, len(prof) - 1) if prof[k][1] >= prof[k - 1][1] and prof[k][1] >= prof[k + 1][1]]
two = sorted(sorted(fronts, key=lambda k: prof[k][1])[:2], key=lambda k: prof[k][0]) if len(fronts) >= 2 else [0, len(prof) - 1]
dd = [k for k in dents if prof[two[0]][0] < prof[k][0] < prof[two[1]][0]]
MZ = prof[max(dd, key=lambda k: prof[k][1])][0] if dd else (prof[two[0]][0] + prof[two[1]][0]) / 2
MO = Vector((0, min(prof[two[0]][1], prof[two[1]][1]), MZ))
print(f'landmarks eye z {EL.z:.3f} mouth z {MO.z:.3f} neck z {NE.z:.3f} shoulder {SL.x:.3f},{SL.z:.3f} pelvis z {PE.z:.3f} top {TOP:.3f}')

# ---------- 5. bmesh helpers ----------
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
dl = bm.verts.layers.deform.active
SHAPES = list(bm.verts.layers.shape.values())
def in_group(v, name): return gi[name] in v[dl]
def face_in(f, name): return all(in_group(v, name) for v in f.verts)
def cen(f): return f.calc_center_median()
def refresh(): bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table(); bm.normal_update()
def kill(faces):
    bmesh.ops.delete(bm, geom=list(set(faces)), context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS'); refresh()
def move(v, d):          # move a vertex in the mesh AND in every shape key
    v.co += d
    for sl in SHAPES: v[sl] += d
def adopt(v, src):       # a new vertex rides the skin vertex src: same weights, same shape-key motion
    for gk, w in src[dl].items(): v[dl][gk] = w
    for sl in SHAPES: v[sl] = v.co + (src[sl] - src.co)
def hexrgb(s): s = s.lstrip('#'); return tuple((int(s[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))
MATS = []
def mat(name, rgb=None, rough=0.6, metal=0.0):
    mt = bpy.data.materials.get(name)
    if not mt:
        mt = bpy.data.materials.new(name); mt.use_nodes = True
        b = mt.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*(rgb or (1, 1, 1)), 1)
        b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if mt not in MATS: MATS.append(mt)
    return MATS.index(mt)
def boundary_relax(faces, it=4, k=0.5):
    fs = set(faces); nb = {}
    for e in {e for f in faces for e in f.edges}:
        if sum(1 for f in e.link_faces if f in fs) == 1:
            a, b = e.verts; nb.setdefault(a, set()).add(b); nb.setdefault(b, set()).add(a)
    for _ in range(it):
        tgt = {v: sum((u.co for u in n), Vector()) / len(n) for v, n in nb.items() if len(n) == 2}
        for v, t in tgt.items(): move(v, (t - v.co) * k)
def laplace(verts, it, k=0.5, fixed=()):
    vs = [v for v in verts if v not in fixed]
    for _ in range(it):
        tgt = {}
        for v in vs:
            nb = [e.other_vert(v) for e in v.link_edges]
            if nb: tgt[v] = sum((u.co for u in nb), Vector()) / len(nb)
        for v, t in tgt.items(): move(v, (t - v.co) * k)
def flatten_ears(verts, out):
    """fabric / hair over an ear: no ear shape under the cloth, just a smooth bulge"""
    for v in verts:
        for cy, ry, cz, rz, ax in EARBOX:
            q = ((v.co.y - cy) / (ry + 0.02)) ** 2 + ((v.co.z - cz) / (rz + 0.02)) ** 2
            if q < 1 and abs(v.co.x) > ax - 0.04:
                want = (ax + out) * (1 if v.co.x > 0 else -1); k = (1 - q) ** 0.5
                if abs(want) > abs(v.co.x): move(v, Vector(((want - v.co.x) * k, 0, 0)))
def keep_out(verts, minlift):
    for v in verts:
        sv = skin_vs[kd.find(v.co)[1]]; d = (v.co - sv.co).dot(sv.normal)
        if d < minlift: move(v, sv.normal * (minlift - d))
def shell(sel, mi, lift, thick, smooth=True, taper=False, soften=0, ear_flat=False):
    """thin solid shell copied from faces sel (hair, shoes, gloves, scarves ...).
    taper: the edge comes down to the skin (no wall, no gap); soften: smooth the whole shell like fabric; ear_flat: hide the ears under it"""
    if not sel: return []
    r = bmesh.ops.duplicate(bm, geom=sel); nf = [g for g in r['geom'] if isinstance(g, bmesh.types.BMFace)]
    nv = {v for f in nf for v in f.verts}; nrm = {v: v.normal.copy() for v in nv}
    fs = set(nf); border = {v for e in {e for f in nf for e in f.edges} if sum(1 for f in e.link_faces if f in fs) == 1 for v in e.verts}
    for v in nv: move(v, nrm[v] * (lift * 0.25 if taper and v in border else lift))
    if smooth: boundary_relax(nf)
    if ear_flat: flatten_ears(nv, lift)
    if soften:
        laplace(nv, soften, 0.5, fixed=border if taper else ())
        keep_out([v for v in nv if not (taper and v in border)], lift * 0.85)
    ex = bmesh.ops.extrude_face_region(bm, geom=nf)
    newv = [g for g in ex['geom'] if isinstance(g, bmesh.types.BMVert)]
    for v in newv:
        edge_v = any(e.other_vert(v) in border for e in v.link_edges)
        move(v, (nrm.get(v) or v.normal) * (thick * 0.1 if taper and edge_v else thick))
    if ear_flat: flatten_ears(newv, lift + thick)
    if soften:
        fx = [v for v in newv if any(e.other_vert(v) in border for e in v.link_edges)] if taper else []
        laplace(newv, max(2, soften // 2), 0.5, fixed=fx)
        keep_out([v for v in newv if v not in fx], (lift + thick) * 0.85)
    out = [g for g in ex['geom'] if isinstance(g, bmesh.types.BMFace)] + nf
    for f in out: f.material_index = mi
    refresh(); return out
def offset(faces, d):
    for v in {v for f in faces for v in f.verts}: move(v, v.normal * d)

C = SPEC['colors']
M_SKIN = mat('skin', hexrgb(C['skin']), 0.5)
for f in bm.faces: f.material_index = M_SKIN

# helpers we never use
kill([f for f in bm.faces if any(in_group(v, 'JointCubes') for v in f.verts)])
kill([f for f in bm.faces if any(face_in(f, g) for g in ('helper-genital', 'helper-tongue', 'helper-hair',
      'helper-l-eyelashes-1', 'helper-l-eyelashes-2', 'helper-r-eyelashes-1', 'helper-r-eyelashes-2'))])
def skin_index():
    global skin_vs, kd
    skin_vs = [v for v in bm.verts if v.is_valid and in_group(v, 'body') and any(f.material_index == M_SKIN for f in v.link_faces)]
    kd = KDTree(len(skin_vs))
    for i, v in enumerate(skin_vs): kd.insert(v.co, i)
    kd.balance()
skin_index()
def nearest_skin(p): return skin_vs[kd.find(p)[1]]

# ---------- 6. eyes: smooth eyeballs ----------
EYES = []
for side in ('helper-l-eye', 'helper-r-eye'):
    fs = [f for f in bm.faces if face_in(f, side)]; vs = {v for f in fs for v in f.verts}
    c = sum((v.co for v in vs), Vector()) / len(vs); r = max((v.co - c).length for v in vs) * 0.985
    EYES.append((c, r, dict(next(iter(vs))[dl].items()))); kill(fs)
IRIS = hexrgb(C.get('iris', '#3a2414'))
for c, r, wts in EYES:
    W_, H_ = 40, 24; rows = []
    for i in range(H_ + 1):
        th = math.pi * i / H_; row = []
        for j in range(W_):
            ph = 2 * math.pi * j / W_
            p = c + Vector((math.sin(th) * math.cos(ph), -math.cos(th), math.sin(th) * math.sin(ph))) * r
            v = bm.verts.new(p)
            for gk, w in wts.items(): v[dl][gk] = w
            for sl in SHAPES: v[sl] = p.copy()
            row.append(v)
        rows.append(row)
    for i in range(H_):
        for j in range(W_):
            q = (rows[0][j], rows[1][(j + 1) % W_], rows[1][j]) if i == 0 else (rows[i][j], rows[i][(j + 1) % W_], rows[i + 1][(j + 1) % W_], rows[i + 1][j])
            try: f = bm.faces.new(q)
            except ValueError: continue
            ang = 180 * (i + 0.5) / H_
            f.material_index = mat('pupil', (0.01, 0.01, 0.01), 0.15) if ang < 9.5 else mat('iris', IRIS, 0.25) if ang < 23 else mat('sclera', (0.8, 0.78, 0.75), 0.2)
            if f.normal.dot(f.calc_center_median() - c) < 0: f.normal_flip()
for f in bm.faces:
    if face_in(f, 'helper-upper-teeth') or face_in(f, 'helper-lower-teeth'): f.material_index = mat('teeth', (0.62, 0.58, 0.5), 0.4)
for v in [v for v in bm.verts if in_group(v, 'helper-upper-teeth') or in_group(v, 'helper-lower-teeth')]: move(v, Vector((0, 0.004, 0)))
refresh()
# mouth cavity: a dark ball behind the lips, so an open mouth shows a dark inside instead of the back of the head
_up = [v for v in bm.verts if in_group(v, 'helper-upper-teeth')]
if _up:
    tc = sum((v.co for v in _up), Vector()) / len(_up); rad = 0.026
    cav_c = Vector((0, tc.y + 0.012, MO.z - 0.006)); src = _up[0]
    seg, rings = 16, []
    for i in range(1, 8):
        th = math.pi * i / 8; ring = []
        for j in range(seg):
            ph = 2 * math.pi * j / seg; p = cav_c + Vector((math.sin(th) * math.cos(ph) * rad * 1.15, math.sin(th) * math.sin(ph) * rad * 0.9, math.cos(th) * rad * 0.8))
            v = bm.verts.new(p); adopt(v, src); ring.append(v)
        rings.append(ring)
    mcav = mat('mouth', (0.06, 0.015, 0.015), 0.9)
    for i in range(len(rings) - 1):
        for j in range(seg): bm.faces.new((rings[i][j], rings[i][(j + 1) % seg], rings[i + 1][(j + 1) % seg], rings[i + 1][j])).material_index = mcav
    refresh()

# ---------- 7. ears (needed by hair, scarves, caps) ----------
sk = [v for v in skin_vs if MO.z - 0.01 < v.co.z < EL.z + 0.03 and v.co.y > EL.y + 0.05]
EARBOX = []
for sg in (1, -1):
    side = sorted([v for v in sk if v.co.x * sg > 0], key=lambda v: -abs(v.co.x))[:60]
    E = sum((v.co for v in side), Vector()) / len(side)
    ev = [v.co for v in sk if v.co.x * E.x > 0 and abs(v.co.x) > abs(E.x) - 0.007 and abs(v.co.z - E.z) < 0.05 and abs(v.co.y - E.y) < 0.045]
    ys = [p.y for p in ev]; zs = [p.z for p in ev]
    EARBOX.append(((min(ys) + max(ys)) / 2, (max(ys) - min(ys)) / 2, (min(zs) + max(zs)) / 2, (max(zs) - min(zs)) / 2, abs(E.x)))
EY, EZ = EARBOX[0][0], EARBOX[0][2]
def ear_hole(p, m=0.004):
    return any(abs(p.x) > ax - 0.022 and ((p.y - cy) / (ry + m)) ** 2 + ((p.z - cz) / (rz + m)) ** 2 < 1 for cy, ry, cz, rz, ax in EARBOX)
def face_oval(p, m=0.0):   # the face opening of a hijab / headscarf / bob (forehead hairline to under the chin, cheek to cheek)
    ztop, zbot = EL.z + 0.04, MO.z - 0.043
    cz, rz = (ztop + zbot) / 2, (ztop - zbot) / 2
    return p.y < EL.y + 0.045 + m and ((p.x / (0.061 + m)) ** 2 + ((p.z - cz) / (rz + m)) ** 2) < 1

# ---------- 8. clothes from the bodysuit + skirt helpers ----------
tf = [f for f in bm.faces if face_in(f, 'helper-tights')]
bmesh.ops.subdivide_edges(bm, edges=list({e for f in tf for e in f.edges}), cuts=1, use_grid_fill=True); refresh()
tf = [f for f in bm.faces if face_in(f, 'helper-tights')]
def ell(dx, dz, rx, rz): return (dx / rx) ** 2 + (dz / rz) ** 2 < 1
ARMX = SL.x                             # where the arm starts (T-pose: arms along x)
def is_arm(p): return abs(p.x) > ARMX * 0.98 and p.z > SL.z - 0.2
def top_zone(p, style, shrink=0.0):
    """torso + sleeves: tank / tshirt / long / turtleneck / shirt / coverall / robe"""
    ax = abs(p.x)
    if is_arm(p):
        reach = {'tank': -1, 'tshirt': 0.3, 'long': 1.0, 'turtleneck': 1.0, 'shirt': 1.0, 'coverall': 1.0, 'robe': 1.0}[style]
        if reach < 0: return False
        lim = ARMX + reach * (abs(WL.x) - 0.035 - ARMX)
        return ax < lim - shrink
    if not (PE.z + 0.05 + shrink < p.z < NE.z + 0.1): return False
    if style == 'tank':
        if ell(ax - ARMX, p.z - SL.z, 0.075 + shrink, 0.16 + shrink): return False
        if ell(ax, p.z - (SL.z + 0.07), 0.095 + shrink, (0.16 if p.y < NE.y - 0.02 else 0.085) + shrink): return False
        return True
    if style == 'turtleneck': return p.z < NE.z + 0.03 - shrink
    nr = 0.072
    deep = 0.1 if style in ('robe', 'shirt') and p.y < NE.y - 0.02 and ax < 0.028 else 0.0     # neck slit at the front
    if ell(ax, p.z - (SL.z + 0.065), nr + shrink, nr + deep + shrink): return False
    return p.z < SL.z + 0.09
def bottom_zone(p, style, shrink=0.0):
    if is_arm(p): return False
    bot = {'long': AL.z + 0.03, 'slim': AL.z + 0.035, 'shorts': KL.z + 0.06, 'coverall': AL.z + 0.03}[style]
    return bot + shrink < p.z < PE.z + 0.11 - shrink
CLOTH = []    # (material index, faces, pattern)
def make_garment(name, zone, faces, color, pattern=None, extra=0.0, relax=True, rough=0.85, soften=0):
    mi = mat(name, hexrgb(color), rough)
    sel = [f for f in faces if f.is_valid and zone(cen(f))]
    r = bmesh.ops.duplicate(bm, geom=sel); nf = [g for g in r['geom'] if isinstance(g, bmesh.types.BMFace)]
    for f in nf: f.material_index = mi
    refresh()
    if extra: offset(nf, extra)
    if soften: laplace({v for f in nf for v in f.verts}, soften, 0.4)
    if relax: boundary_relax(nf)
    CLOTH.append((mi, nf, pattern)); return nf
top, bot = WEAR.get('top'), WEAR.get('bottom')
if WEAR.get('coverall'):
    cv = WEAR['coverall']
    make_garment('coverall', lambda p: top_zone(p, 'coverall') or bottom_zone(p, 'coverall'), tf, cv['color'], cv.get('pattern'), 0.013, soften=3)
if WEAR.get('robe'):
    rb = WEAR['robe']
    nf = make_garment('robe', lambda p: top_zone(p, 'robe') and p.z > PE.z + 0.02, tf, rb['color'], rb.get('pattern'), 0.01, soften=4)
    skirt = [f for f in bm.faces if face_in(f, 'helper-skirt')]
    mi = MATS.index(bpy.data.materials['robe'])
    for f in skirt: f.material_index = mi
    offset(skirt, 0.014 + rb.get('wide', 0.0))
    sv = {v for f in skirt for v in f.verts}
    laplace(sv, 3, 0.4)
    for v in sv:   # A-line: the galabiya falls straight from the hips instead of following the legs
        h_ = max(0.0, (PE.z + 0.02) - v.co.z); r = Vector((v.co.x, v.co.y - PE.y, 0))
        if r.length > 1e-5: move(v, r.normalized() * h_ * 0.075)
    CLOTH.append((mi, skirt, rb.get('pattern')))
if top: make_garment('top', lambda p: top_zone(p, top['style']), tf, top['color'], top.get('pattern'), 0.003 + top.get('extra', 0.0))
if bot: make_garment('bottom', lambda p: bottom_zone(p, bot['style']), tf, bot['color'], bot.get('pattern'), 0.004 + bot.get('loose', 0.0) + (0.006 if bot['style'] in ('long', 'shorts') else 0.0), soften=2)
if WEAR.get('jacket'):   # open jacket / blazer over the top: further out, open at the front
    jk = WEAR['jacket']
    def jzone(p):
        if not top_zone(p, 'long'): return False
        if not is_arm(p) and p.y < NE.y - 0.03 and abs(p.x) < jk.get('open', 0.045) and p.z < SL.z + 0.03: return False
        return p.z > PE.z + jk.get('hem', 0.02)
    make_garment('jacket', jzone, tf, jk['color'], jk.get('pattern'), 0.012, rough=jk.get('rough', 0.6))
if WEAR.get('apron'):
    ap = WEAR['apron']
    src = [f for f in bm.faces if face_in(f, 'helper-skirt') and f.material_index != M_SKIN] if WEAR.get('robe') else tf
    make_garment('apron', lambda p: p.y < -0.02 and abs(p.x) < 0.15 and (ap.get('bottom', KL.z) < p.z < PE.z + 0.15), src, ap['color'], None, 0.02)
# skin under the clothes goes (no poke-through), and the unused helper parts
def covered(p):
    if top and top_zone(p, top['style'], 0.03): return True
    if bot and bottom_zone(p, bot['style'], 0.03): return True
    if WEAR.get('coverall') and (top_zone(p, 'coverall', 0.03) or bottom_zone(p, 'coverall', 0.03)): return True
    if WEAR.get('robe') and top_zone(p, 'robe', 0.03) and p.z > PE.z + 0.05: return True
    return False
cloth_faces = {f for _, fs, _ in CLOTH for f in fs}
kill([f for f in bm.faces if f.material_index == M_SKIN and face_in(f, 'body') and covered(cen(f))])
kill([f for f in bm.faces if f.is_valid and (face_in(f, 'helper-tights') or face_in(f, 'helper-skirt')) and f not in cloth_faces])
CLOTH = [(mi, [f for f in fs if f.is_valid], p) for mi, fs, p in CLOTH]
skin_index()

# ---------- 9. tubes (mustache, brows, straps, chains): ride the nearest skin vertex ----------
def on_face(x, z):
    best = None
    for (_, i, _) in kd.find_n(Vector((x, EL.y - 0.1, z)), 12):
        v = skin_vs[i]
        if v.normal.y < -0.1 and (best is None or abs(v.co.x - x) + abs(v.co.z - z) < abs(best.co.x - x) + abs(best.co.z - z)): best = v
    return best or nearest_skin(Vector((x, EL.y - 0.05, z)))
def tube(pts, rad, mi, flat=0.6, sides=8, closed=False, srcs=None, normals=None):
    rings = []
    for k, p in enumerate(pts):
        src = srcs[k] if srcs else nearest_skin(p)
        n = (normals[k] if normals else src.normal).normalized()
        t = (pts[(k + 1) % len(pts)] - pts[k - 1]).normalized() if closed else (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
        b = t.cross(n).normalized(); n2 = b.cross(t).normalized(); ring = []
        for j in range(sides):
            a = 2 * math.pi * j / sides; q = p + b * math.cos(a) * rad[k] + n2 * math.sin(a) * rad[k] * flat
            v = bm.verts.new(q); adopt(v, src); ring.append(v)
        rings.append(ring)
    n_ = len(rings)
    for k in range(n_ if closed else n_ - 1):
        for j in range(sides):
            bm.faces.new((rings[k][j], rings[k][(j + 1) % sides], rings[(k + 1) % n_][(j + 1) % sides], rings[(k + 1) % n_][j])).material_index = mi
    if not closed:
        for ring in (rings[0][::-1], rings[-1]): bm.faces.new(ring).material_index = mi
    refresh()
def face_tube(path, rad, mi, lift, flat=0.6, sides=8):
    pts, srcs, nrms = [], [], []
    for (x, z), r in zip(path, rad):
        v = on_face(x, z); n = v.normal.normalized()
        pts.append(Vector((x, v.co.y, z)) + n * (lift + r * flat)); srcs.append(v); nrms.append(n)
    tube(pts, rad, mi, flat, sides, False, srcs, nrms)
def head_ring(z, push, rad_w, rad_h, mi, n=48, front_dip=0.0, pool=None, round_=False, push_front=None, wave=None):
    """closed flat band around the head at height z (goggle strap, headband, turban wraps ...)"""
    HC = Vector((0, (EL.y + EY) / 2 + 0.03, z))
    ring_vs = [v for v in (pool or skin_vs) if abs(v.co.z - z) < 0.01 and abs(v.co.x) < 0.16 and EL.y - 0.06 < v.co.y < EY + 0.16]
    if len(ring_vs) < 8: return
    pts, srcs = [], []
    for k in range(n):
        a = 2 * math.pi * k / n; d = Vector((math.sin(a), -math.cos(a), 0))
        v = max(ring_vs, key=lambda v: (v.co - HC).normalized().dot(d))
        nh = Vector((v.normal.x, v.normal.y, 0)).normalized()
        pk = push if push_front is None else push_front + (push - push_front) * min(1.0, max(0.0, (d.y + 0.7) / 0.9))
        wz = wave[0] * math.sin(wave[1] * a + wave[2]) if wave else 0.0
        pts.append(Vector((v.co.x, v.co.y, z + wz - front_dip * max(0, -d.y))) + nh * pk); srcs.append(nearest_skin(v.co))
    prof = [(math.cos(2 * math.pi * j / 8) * rad_w, math.sin(2 * math.pi * j / 8) * rad_h) for j in range(8)] if round_ else \
           [(-rad_w, -rad_h), (rad_w, -rad_h), (rad_w, rad_h), (-rad_w, rad_h)]
    m_ = len(prof); rings = []
    for k, p in enumerate(pts):
        t = (pts[(k + 1) % n] - pts[k - 1]).normalized(); out = Vector((0, 0, 1)).cross(t).normalized(); ring = []
        for (du, dz) in prof:
            q = p + out * du + Vector((0, 0, dz)); v = bm.verts.new(q); adopt(v, srcs[k]); ring.append(v)
        rings.append(ring)
    for k in range(n):
        for j in range(m_): bm.faces.new((rings[k][j], rings[k][(j + 1) % m_], rings[(k + 1) % n][(j + 1) % m_], rings[(k + 1) % n][j])).material_index = mi
    refresh()

# ---------- 10. hair ----------
HZ = EL.z
hair = SPEC.get('hair', {'style': 'none'})
HSTY = hair.get('style', 'none'); HAIR_T = 0.0
M_HAIR = mat('hair', hexrgb(C['hair']), 0.85)
CAP_Z = {'knit_cap': WEAR.get('head', {}).get('low', 0.05), 'baseball': 0.045, 'turban': 0.035}.get(WEAR.get('head', {}).get('type'))
def scalp_sel(style):
    def ok(f):
        p = cen(f)
        if not face_in(f, 'body') or f.material_index != M_SKIN: return False
        if CAP_Z is not None and p.z > HZ + CAP_Z + 0.012: return False      # under the cap: no hair
        if style != 'bob' and ear_hole(p): return False
        behind = p.y > EY + 0.025
        if style == 'sides':
            if p.y < EL.y + 0.04: return False
            top_ = TOP - (0.075 if behind else 0.074); bottom = HZ - (0.075 if behind else 0.0)
            if p.y < EY - 0.015: bottom = max(bottom, EZ - 0.01)
            return bottom < p.z < top_ and abs(p.x) > (0.0 if behind else 0.05)
        hairline = HZ + hair.get('hairline', 0.058) + (0.016 * min(1.0, abs(p.x) / 0.065) ** 2 if style != 'bob' else 0.0)   # temples sit higher
        if p.y < EL.y + 0.035 and p.z < hairline: return False          # the face
        if style == 'bob':
            if face_oval(p, 0.008) or p.z < MO.z - 0.05: return False
            return True
        bottom = HZ - (0.08 if behind else 0.0)
        if EY - 0.012 > p.y > EY - 0.04: bottom = EZ - 0.012              # sideburns, just in front of the ear
        elif p.y <= EY - 0.04: bottom = max(bottom, HZ + 0.02)
        return p.z > bottom
    return [f for f in bm.faces if ok(f)]
def bob_loft(mi, bottom_z, thick=0.014, fringe_z=None):
    """a bob as a smooth surface around the head: follows the skull above the ears, hangs straight below, open for the face"""
    from mathutils.bvhtree import BVHTree
    tree = BVHTree.FromBMesh(bm)
    HCy = (EL.y + EY) / 2 + 0.02; NA, nz = 96, 34
    zt = TOP - 0.0012
    rows_z = [zt - (zt - bottom_z) * (i / nz) ** 1.6 for i in range(nz + 1)]
    R = []
    for z in rows_z:
        row = []
        for k in range(NA):
            a = 2 * math.pi * k / NA; d = Vector((math.sin(a), -math.cos(a), 0)); C0 = Vector((0, HCy, z))
            hit = tree.ray_cast(C0 + d * 0.4, -d, 0.4)
            row.append((hit[0] - C0).length if hit[0] is not None else None)
        R.append(row)
    # per column: never narrower than the widest skull point above the ear line (straight hang), then smooth
    for k in range(NA):
        col = [R[i][k] for i in range(len(R))]
        j = next((i for i, c in enumerate(col) if c is not None), 0)
        for i in range(j): col[i] = col[j] * (0.6 + 0.4 * i / max(1, j))      # crown: rays that miss the top close in
        best = 0.0
        for i, z in enumerate(rows_z):
            if col[i] is None: col[i] = best or 0.06
            if z >= EZ + 0.03: best = max(best, col[i]) if z < EL.z + 0.04 else best
            else: col[i] = max(best, col[i] if z > NE.z + 0.02 else 0.0)
        for _ in range(3): col = [col[0]] + [(col[i - 1] + 2 * col[i] + col[i + 1]) / 4 for i in range(1, len(col) - 1)] + [col[-1]]
        for i in range(len(R)): R[i][k] = col[i]
    for i in range(len(R)):
        row = R[i]
        for _ in range(2): row = [(row[k - 1] + 2 * row[k] + row[(k + 1) % NA]) / 4 for k in range(NA)]
        R[i] = row
    V, Vi, P = [], [], []
    for i, z in enumerate(rows_z):
        vr, vi, pr = [], [], []
        tuck = 0.985 if i >= nz - 1 else 1.0
        for k in range(NA):
            a = 2 * math.pi * k / NA; d = Vector((math.sin(a), -math.cos(a), 0)); C0 = Vector((0, HCy, z))
            p = C0 + d * (R[i][k] + thick) * tuck; q = C0 + d * (R[i][k] + thick * 0.2) * tuck
            src = nearest_skin(p); a1 = bm.verts.new(p); adopt(a1, src); a2 = bm.verts.new(q); adopt(a2, src)
            vr.append(a1); vi.append(a2); pr.append(p)
        V.append(vr); Vi.append(vi); P.append(pr)
    top = bm.verts.new(Vector((0, HCy, rows_z[0] + thick * 0.45))); adopt(top, nearest_skin(top.co))
    topi = bm.verts.new(Vector((0, HCy, rows_z[0] + thick * 0.1))); adopt(topi, nearest_skin(topi.co))
    for k in range(NA):
        bm.faces.new((top, V[0][k], V[0][(k + 1) % NA])).material_index = mi
        bm.faces.new((topi, Vi[0][(k + 1) % NA], Vi[0][k])).material_index = mi
    fz = fringe_z if fringe_z is not None else EL.z + 0.03
    def open_(p): return p.y < EL.y + 0.055 and abs(p.x) < 0.066 and p.z < fz
    for i in range(len(P) - 1):
        for k in range(NA):
            q = [P[i][k], P[i][(k + 1) % NA], P[i + 1][(k + 1) % NA], P[i + 1][k]]
            if any(open_(p) for p in q): continue
            bm.faces.new((V[i][k], V[i + 1][k], V[i + 1][(k + 1) % NA], V[i][(k + 1) % NA])).material_index = mi
            bm.faces.new((Vi[i][k], Vi[i][(k + 1) % NA], Vi[i + 1][(k + 1) % NA], Vi[i + 1][k])).material_index = mi
    bmesh.ops.delete(bm, geom=[v for row in V + Vi for v in row if not v.link_faces], context='VERTS')
    refresh()
if HSTY == 'bob':
    bob_loft(M_HAIR, MO.z - hair.get('length', 0.045), hair.get('thick', 0.014), EL.z + hair.get('fringe', 0.032))
    HSTY = 'done'
if HSTY not in ('none', 'done'):
    HAIR_T = hair.get('thick', {'sides': 0.0045, 'short': 0.006, 'curly': 0.014, 'bob': 0.016, 'spiky': 0.008}[HSTY])
    out = shell(scalp_sel(HSTY), M_HAIR, 0.001 if HSTY != 'bob' else 0.008, HAIR_T, taper=True, soften=4 if HSTY == 'bob' else 1, ear_flat=HSTY == 'bob')
    if HSTY == 'bob':   # hangs straight down from the widest part of the head
        hv = {v for f in out for v in f.verts}; HCy = (EL.y + EY) / 2 + 0.02
        ref = [v for v in hv if abs(v.co.z - (EZ + 0.02)) < 0.01]
        def r_at(a):
            best = [v for v in ref if abs(math.atan2(v.co.x, v.co.y - HCy) - a) < 0.25] or ref
            return max(Vector((v.co.x, v.co.y - HCy, 0)).length for v in best)
        for v in hv:
            if v.co.z < EZ + 0.02:
                a = math.atan2(v.co.x, v.co.y - HCy); rv = Vector((v.co.x, v.co.y - HCy, 0)); want = r_at(a) * 0.98
                if rv.length < want and v.co.y > EY - 0.035: move(v, rv.normalized() * (want - rv.length) * min(1.0, (v.co.y - (EY - 0.035)) / 0.03))
    if HSTY in ('curly', 'bob'):
        for v in {v for f in out for v in f.verts}:
            p = v.co; up = max(0.0, (p.z - HZ) / (TOP - HZ))
            d = (0.005 * math.sin(p.x * 260) * math.sin(p.z * 240) * math.sin(p.y * 220) + 0.008 * up) if HSTY == 'curly' else (0.006 * up)
            move(v, v.normal * d)
    if HSTY == 'spiky':
        tops = [v for v in skin_vs if v.co.z > TOP - 0.04]; rng = np.random.default_rng(3)
        tops = [v for v in skin_vs if v.co.z > TOP - 0.05 and v.co.y < EY + 0.05]
        for k in range(30):
            src = tops[int(rng.integers(len(tops)))]; base = src.co + src.normal * 0.006
            tipdir = (src.normal * 0.9 + Vector((0, 0.45, 0.25)) + Vector(((rng.random() - 0.5) * 0.4, 0, 0))).normalized()
            L = 0.011 + 0.008 * rng.random()
            tube([base, base + tipdir * L * 0.6, base + tipdir * L], [0.014, 0.008, 0.003], M_HAIR, 1.0, 7, False, [src] * 3, [Vector((0, -1, 0))] * 3)
fh = SPEC.get('mustache')
if fh:
    W, D, T, UP = fh.get('w', 0.03), fh.get('droop', 0.012), fh.get('thick', 0.006), fh.get('up', 0.013)
    mi = mat('mustache', hexrgb(fh.get('color', C['hair'])), 0.85)
    path, rad = [], []
    for k in range(15):
        u = -1 + 2 * k / 14
        path.append((u * W, MO.z + UP - D * max(0, abs(u) - 0.45) / 0.55 * (1.6 if abs(u) > 0.8 else 1))); rad.append(T * (1 - 0.65 * abs(u) ** 2))
    face_tube(path, rad, mi, 0.002)
brow = SPEC.get('brows', 0.0045) * 0.72
if brow:
    mi = mat('brows', hexrgb(SPEC.get('brow_color', C['hair'])), 0.85)
    for E in (EL, ER):
        sgn = 1 if E.x > 0 else -1; path, rad = [], []
        for k in range(9):
            u = k / 8; x = E.x + sgn * (-0.017 + 0.038 * u)
            path.append((x, E.z + 0.022 + 0.006 * math.sin(math.pi * min(1, u * 1.2)) - 0.004 * u)); rad.append(brow * (0.55 + 0.75 * math.sin(math.pi * (0.15 + 0.8 * u))) * (1.1 - 0.4 * u))
        face_tube(path, rad, mi, 0.001, 0.35, 6)

# ---------- 11. head wear ----------
hw = WEAR.get('head')
allv_kd = None
def nearest_any(p):
    """nearest vertex of the body or its clothes (for pieces that hang over clothes, e.g. a hijab cape)"""
    global allv_kd, allv
    if allv_kd is None:
        allv = [v for v in bm.verts if v.is_valid and (in_group(v, 'body') or in_group(v, 'helper-tights') or in_group(v, 'helper-skirt'))
                and not is_arm(v.co) and abs(v.co.x) < SL.x * 0.85]   # torso / neck only: a cape must not follow the arms
        allv_kd = KDTree(len(allv))
        for i, v in enumerate(allv): allv_kd.insert(v.co, i)
        allv_kd.balance()
    return allv[allv_kd.find(p)[1]]
def body_loft(zs, pushes, mi, n=48, cx=0.0):
    """a closed skirt-like surface around the body (hijab cape, collar ...): rows at heights zs, pushed out from the outermost surface"""
    pool = [v for v in bm.verts if v.is_valid and not is_arm(v.co) and abs(v.co.x) < SL.x * 1.05]
    rows = []
    for z, push in zip(zs, pushes):
        ring = [v for v in pool if abs(v.co.z - z) < 0.012]
        cy = sum(v.co.y for v in ring) / len(ring); C0 = Vector((cx, cy, z)); row = []
        for k in range(n):
            a = 2 * math.pi * k / n; d = Vector((math.sin(a), -math.cos(a), 0))
            cone = [v for v in ring if (v.co - C0).normalized().dot(d) > 0.92] or ring
            rad = max(0.02, max((v.co - C0).dot(d) for v in cone)) + push
            q = C0 + d * rad; v = bm.verts.new(q); adopt(v, nearest_any(q)); row.append(v)
        rows.append(row)
    for i in range(len(rows) - 1):
        for k in range(n): bm.faces.new((rows[i][k], rows[i][(k + 1) % n], rows[i + 1][(k + 1) % n], rows[i + 1][k])).material_index = mi
    refresh(); return rows
if hw:
    kind = hw['type']; mi = mat('headwear', hexrgb(hw['color']), hw.get('rough', 0.8))
    if kind in ('hijab', 'scarf'):
        sel = [f for f in bm.faces if face_in(f, 'body') and f.material_index == M_SKIN and cen(f).z > NE.z - 0.045 and not face_oval(cen(f))]
        out = shell(sel, mi, hw.get('lift', 0.012), 0.004, taper=True, soften=8, ear_flat=True)
        # below the chin the fabric falls in a cone instead of hugging the neck
        HCy = (EL.y + EY) / 2 + 0.02
        for v in {v for f in out for v in f.verts}:
            dz = (MO.z - 0.035) - v.co.z
            if dz > 0:
                rd = Vector((v.co.x, v.co.y - HCy, 0)); rd = rd.normalized() if rd.length > 1e-6 else Vector((0, -1, 0))
                move(v, rd * min(0.05, dz * 0.55))
        # the cape: from under the chin over the shoulders and the upper chest/back, an elliptic cone (not the shoulder shape)
        z0, z1 = NE.z - 0.02, SL.z - hw.get('drop', 0.06)
        zs = [z0 + (z1 - z0) * t for t in (0, 0.2, 0.4, 0.6, 0.8, 1.0)]
        pool = [v for v in bm.verts if v.is_valid and not is_arm(v.co) and abs(v.co.x) < SL.x * 1.05]
        rows, n = [], 48
        for t, z in zip((0, 0.2, 0.4, 0.6, 0.8, 1.0), zs):
            row = []
            ax_, ay_ = 0.08 + 0.07 * t ** 0.8, 0.085 + 0.045 * t ** 0.8
            for k in range(n):
                a = 2 * math.pi * k / n; d = Vector((math.sin(a), -math.cos(a), 0))
                zk = z - t * 0.07 * abs(math.cos(a)) ** 1.5             # front and back hang lower
                ring = [v for v in pool if abs(v.co.z - zk) < 0.012]; cy = sum(v.co.y for v in ring) / len(ring); C0 = Vector((0, cy, zk))
                cone = [v for v in ring if (v.co - C0).normalized().dot(d) > 0.92] or ring
                body_r = max((v.co - C0).dot(d) for v in cone if not is_arm(v.co) and abs(v.co.x) < SL.x * 0.95) + 0.018 if any(not is_arm(v.co) and abs(v.co.x) < SL.x * 0.95 for v in cone) else 0.0
                ell_r = 1 / math.sqrt((d.x / ax_) ** 2 + (d.y / ay_) ** 2)
                q = C0 + d * max(body_r, ell_r); v = bm.verts.new(q); adopt(v, nearest_any(q)); row.append(v)
            rows.append(row)
        for i in range(len(rows) - 1):
            for k in range(n): bm.faces.new((rows[i][k], rows[i][(k + 1) % n], rows[i + 1][(k + 1) % n], rows[i + 1][k])).material_index = mi
        refresh()
        CLOTH.append((mi, [f for f in bm.faces if f.material_index == mi], hw.get('pattern')))
    elif kind == 'knit_cap':
        shell([f for f in bm.faces if face_in(f, 'body') and f.material_index == M_SKIN and cen(f).z > HZ + hw.get('low', 0.05) and not ear_hole(cen(f))], mi, 0.006, 0.007, taper=True, soften=4)
    elif kind == 'baseball':
        shell([f for f in bm.faces if face_in(f, 'body') and f.material_index in (M_SKIN,) and cen(f).z > HZ + 0.045 and not ear_hole(cen(f))], mi, 0.009, 0.006, taper=True, soften=6)
        fz = HZ + 0.05; xs = [math.sin(a) * 0.078 for a in [math.pi * (k / 12 - 0.5) * 0.8 for k in range(13)]]
        inner, outer = [], []
        for k, x in enumerate(xs):
            v = on_face(x, fz); yi = v.co.y - 0.012
            a = math.pi * (k / 12 - 0.5) * 0.8
            bend = 0.012 * (x / 0.078) ** 2
            inner.append((Vector((x, yi, fz - bend * 0.4)), v)); outer.append(Vector((x * 1.04, yi - 0.07 * math.cos(a) - 0.006, fz - 0.014 - bend)))
        layers = []
        for dz in (0.0, 0.007):
            vi = [bm.verts.new(p + Vector((0, 0, dz))) for p, _ in inner]; vo = [bm.verts.new(p + Vector((0, 0, dz))) for p in outer]
            for (p, src), a_, b_ in zip(inner, vi, vo): adopt(a_, src); adopt(b_, src)
            layers.append((vi, vo))
        (vi, vo), (vi2, vo2) = layers
        for k in range(12):
            bm.faces.new((vi[k], vo[k], vo[k + 1], vi[k + 1])).material_index = mi
            bm.faces.new((vi2[k], vi2[k + 1], vo2[k + 1], vo2[k])).material_index = mi
            bm.faces.new((vo[k], vo2[k], vo2[k + 1], vo[k + 1])).material_index = mi
        refresh()
    elif kind == 'turban':
        shell([f for f in bm.faces if face_in(f, 'body') and f.material_index == M_SKIN and cen(f).z > HZ + 0.04 and not ear_hole(cen(f))], mi, 0.012, 0.008, taper=True, soften=6)
        span = TOP - HZ
        for i, (z, push, r_) in enumerate(((HZ + 0.044, 0.0, 0.0095), (HZ + 0.064, 0.002, 0.0105), (HZ + 0.083, 0.0, 0.01), (HZ + span * 0.8, -0.006, 0.009))):
            head_ring(z, 0.008 + push + r_, r_ * 1.1, r_ * 0.95, mi, round_=True, wave=(0.005, 1 + i % 2, i * 1.3))
if WEAR.get('headband'):   # rays from outside find the outermost surface (hair or forehead) all around the head
    from mathutils.bvhtree import BVHTree
    tree = BVHTree.FromBMesh(bm)
    zb = HZ + 0.068; HCy = (EL.y + EY) / 2 + 0.02; C0 = Vector((0, HCy, zb)); n = 48; pts = []
    for k in range(n):
        a = 2 * math.pi * k / n; d = Vector((math.sin(a), -math.cos(a), 0))
        hit = tree.ray_cast(C0 + d * 0.4, -d, 0.4)
        r = (hit[0] - C0).length if hit[0] is not None else 0.09
        pts.append(C0 + d * (r + 0.001) - Vector((0, 0, 0.004 * max(0, -d.y))))
    tube(pts, [0.0062] * n, mat("headband", hexrgb(WEAR["headband"]), 0.8), 0.5, 8, True, [nearest_skin(p) for p in pts], [Vector((0, 0, 1))] * n)
if WEAR.get('goggles'):
    M_BRASS = mat('brass', hexrgb('#b8902c'), 0.35, 0.6); M_GLASS = mat('lens', hexrgb('#2c4a3a'), 0.1); M_STRAP = mat('strap', hexrgb('#3a2a1e'), 0.8)
    gz = EL.z + 0.058
    head_ring(gz, 0.0105, 0.0015, 0.007, M_STRAP)
    for sx in (1, -1):
        v = on_face(sx * 0.034, gz); nrm = (v.normal + Vector((0, 0, 0.35))).normalized(); c = v.co + nrm * 0.012
        u = nrm.orthogonal().normalized(); w = nrm.cross(u)
        tube([c + (u * math.cos(2 * math.pi * k / 20) + w * math.sin(2 * math.pi * k / 20)) * 0.022 for k in range(20)], [0.006] * 20, M_BRASS, 1.0, 6, True, [v] * 20, [nrm] * 20)
        lv = [bm.verts.new(c + nrm * 0.004 + (u * math.cos(2 * math.pi * k / 20) + w * math.sin(2 * math.pi * k / 20)) * 0.02) for k in range(20)]
        for q in lv: adopt(q, v)
        lf = bm.faces.new(lv); lf.material_index = M_GLASS
        if lf.normal.dot(nrm) < 0: lf.normal_flip()
        refresh()

# ---------- 12. neck / hands / feet ----------
def neck_loop(z, push, rad, mi, sag=0.0, n=40, sides=6, flat=1.0):
    ring_vs = [v for v in bm.verts if v.is_valid and abs(v.co.z - z) < 0.012 and not is_arm(v.co) and abs(v.co.x) < 0.2]
    HC = Vector((0, sum(v.co.y for v in ring_vs) / len(ring_vs), z)); pts, srcs = [], []
    for k in range(n):
        a = 2 * math.pi * k / n; d = Vector((math.sin(a), -math.cos(a), 0))
        v = max(ring_vs, key=lambda v: (v.co - HC).normalized().dot(d))
        pts.append(Vector((v.co.x, v.co.y, z - sag * max(0, -d.y) ** 2)) + d * push); srcs.append(nearest_skin(v.co))
    tube(pts, [rad] * n, mi, flat, sides, True, srcs, [Vector((0, 0, 1))] * n)
    return HC
if WEAR.get('coverall'):   # collar, belt and zip so it reads as a work coverall
    dk = mat('coverall_trim', tuple(c * 0.55 for c in hexrgb(WEAR['coverall']['color'])), 0.8)
    body_loft([NE.z - 0.055, NE.z - 0.035, NE.z - 0.02], [0.016, 0.02, 0.024], dk, 40)
    body_loft([PE.z + 0.05, PE.z + 0.085], [0.016, 0.016], mat('belt', hexrgb('#1c1a18'), 0.5), 48)
    pts, srcs = [], []
    for k in range(14):
        z = NE.z - 0.06 - (NE.z - 0.06 - (PE.z - 0.02)) * k / 13
        ring = [v for v in bm.verts if v.is_valid and abs(v.co.z - z) < 0.01 and abs(v.co.x) < 0.02]
        fv = min(ring, key=lambda v: v.co.y); pts.append(Vector((0, fv.co.y - 0.004, z))); srcs.append(nearest_any(fv.co))
    tube(pts, [0.0035] * 14, mat('zip', hexrgb('#9a9a9a'), 0.3, 0.8), 0.4, 6, False, srcs, [Vector((0, -1, 0))] * 14)
if WEAR.get('headphones'):   # resting around the neck: band behind the neck, round cups at both sides of the neck under the jaw
    mi = mat('headphones', hexrgb(WEAR['headphones']), 0.4)
    z = NE.z - 0.035
    ring = [v for v in bm.verts if v.is_valid and abs(v.co.z - z) < 0.01 and abs(v.co.x) < 0.1 and not is_arm(v.co)]
    cy = sum(v.co.y for v in ring) / len(ring); C0 = Vector((0, cy, z)); pts, srcs = [], []
    for k in range(25):
        a = math.pi * (0.5 + 1.0 * k / 24); d = Vector((math.sin(a), -math.cos(a), 0))
        cone = [v for v in ring if (v.co - C0).normalized().dot(d) > 0.9] or ring
        q = C0 + d * (max((v.co - C0).dot(d) for v in cone) + 0.012) + Vector((0, 0, 0.012 * math.sin(math.pi * k / 24)))
        pts.append(q); srcs.append(nearest_any(q))
    tube(pts, [0.007] * 25, mi, 0.5, 6, False, srcs, [Vector((0, 0, 1))] * 25)
    for end in (pts[0], pts[-1]):
        sx = 1 if end.x > 0 else -1; c = end + Vector((sx * 0.008, -0.012, -0.004)); src = nearest_any(c); ax = Vector((sx, -0.25, 0)).normalized()
        tube([c - ax * 0.011, c + ax * 0.011], [0.031, 0.029], mi, 1.0, 20, False, [src, src], [Vector((0, 0, 1))] * 2)
if WEAR.get('chain'): neck_loop(NE.z - 0.06, 0.01, 0.003, mat('gold', hexrgb('#d4a72c'), 0.25, 1.0), 0.05, 40, 5)
if WEAR.get('gloves'):
    shell([f for f in bm.faces if face_in(f, 'body') and f.material_index == M_SKIN and abs(cen(f).x) > abs(WL.x) - 0.03], mat('gloves', hexrgb(WEAR['gloves']), 0.35), 0.002, 0.003)
if WEAR.get('tag'):
    p = Vector((0.07, 0, SL.z - 0.07))
    shell([f for f in bm.faces if f.material_index != M_SKIN and abs(cen(f).x - p.x) < 0.035 and abs(cen(f).z - p.z) < 0.018 and f.normal.y < -0.5], mat('tag', hexrgb(WEAR['tag']), 0.5), 0.002, 0.002, smooth=False)
shoes = WEAR.get('shoes')
if shoes:
    st = shoes['style']; mi = mat('shoes', hexrgb(shoes['color']), shoes.get('rough', 0.6))
    feet = [f for f in bm.faces if face_in(f, 'body') and f.material_index == M_SKIN and cen(f).z < AL.z + 0.12]
    if st in ('sandals', 'slippers'):
        shell([f for f in feet if cen(f).z < AL.z - 0.035 and f.normal.z < -0.4], mi, 0.001, 0.016)
        if st == 'sandals':
            shell([f for f in feet if AL.z - 0.075 < cen(f).z < AL.z - 0.02 and f.normal.z > 0.25 and abs(cen(f).y - (AL.y - 0.075)) < 0.022], mi, 0.002, 0.004, smooth=False)
        else:
            shell([f for f in feet if cen(f).z < AL.z - 0.03 and f.normal.z > 0.2 and cen(f).y < AL.y - 0.07], mi, 0.002, 0.005)
    else:
        hi = {'sneakers': 0.015, 'shoes': 0.0, 'boots': 0.09}[st]
        shell([f for f in feet if cen(f).z < AL.z + hi], mi, 0.003, 0.004)
        if shoes.get('sole'): shell([f for f in feet if cen(f).z < AL.z - 0.055], mat('sole', hexrgb(shoes['sole']), 0.7), 0.008, 0.005)

for f in bm.faces: f.smooth = True
bm.to_mesh(me); bm.free()
idx = [p.material_index for p in me.polygons]
me.materials.clear()
for mt in MATS: me.materials.append(mt)
for p, i in zip(me.polygons, idx): p.material_index = i
me.update()
print('faces per material', {MATS[k].name: n for k, n in collections.Counter(idx).items()})
for k in set(idx):
    vs = [me.vertices[i].co for p in me.polygons if p.material_index == k for i in p.vertices]
    if MATS[k].name in ('headwear', 'headband', 'hair'): print('bbox', MATS[k].name, [round(min(v[a] for v in vs), 3) for a in range(3)], [round(max(v[a] for v in vs), 3) for a in range(3)])

# ---------- 13. fabric UVs + pattern textures ----------
def make_tex(name, kind, c1, c2, size=256):
    y, x = np.mgrid[0:size, 0:size] / size
    A, B = np.array(hexrgb(c1)), np.array(hexrgb(c2))
    if kind == 'stripes_v': m = ((x * 4) % 1 < 0.33).astype(float)
    elif kind == 'stripes_h': m = ((y * 4) % 1 < 0.3).astype(float)
    elif kind == 'pinstripe': m = ((x * 8) % 1 < 0.12).astype(float)
    elif kind == 'floral':
        m = np.zeros_like(x); rng = np.random.default_rng(5)
        for _ in range(11):
            cx, cy = rng.random(2); r = 0.06 + rng.random() * 0.035
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    dxs, dys = x - cx - dx, y - cy - dy
                    m = np.maximum(m, (np.hypot(dxs, dys) < r * (0.65 + 0.35 * np.cos(5 * np.arctan2(dys, dxs)))).astype(float))
    elif kind == 'stains':
        rng = np.random.default_rng(9); m = np.zeros_like(x)
        for _ in range(9):
            cx, cy = rng.random(2); r = 0.02 + rng.random() * 0.05
            m = np.maximum(m, np.clip(1 - np.hypot(x - cx, y - cy) / r, 0, 1) * 0.55)
    else: m = np.zeros_like(x)
    a = A * (1 - m[..., None]) + B * m[..., None]
    weave = 1 + 0.05 * (np.sin(x * size * math.pi) * np.sin(y * size * math.pi)) + 0.03 * np.random.default_rng(1).standard_normal((size, size))
    a = np.clip(a * weave[..., None], 0, 1) ** (1 / 2.2)
    img = bpy.data.images.new(name, size, size); px = np.concatenate([a, np.ones((size, size, 1))], 2)[::-1].astype(np.float32)
    img.pixels.foreach_set(px.ravel()); img.pack(); return img
uv = me.uv_layers.active.data
cloth_mi = {mi: p for mi, _, p in CLOTH}
for mi, pat in cloth_mi.items():
    mt = MATS[mi]
    if pat:
        tn = mt.node_tree.nodes.new('ShaderNodeTexImage'); tn.image = make_tex(mt.name + '_tex', pat['kind'], pat['c1'], pat['c2'])
        mt.node_tree.links.new(tn.outputs['Color'], mt.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
for poly in me.polygons:
    if poly.material_index not in cloth_mi: continue
    rep = (cloth_mi[poly.material_index] or {}).get('repeat', 3.0); us = []
    for li in poly.loop_indices:
        p = me.vertices[me.loops[li].vertex_index].co
        if abs(p.x) > ARMX * 0.98 and p.z > SL.z - 0.2: ang = math.atan2(p.z - SL.z, p.y); vv = abs(p.x)
        elif p.z < PE.z - 0.04 and not WEAR.get('robe'): ang = math.atan2(p.y, p.x - (0.09 if p.x > 0 else -0.09)); vv = p.z
        else: ang = math.atan2(p.y, p.x); vv = p.z
        us.append([(ang + math.pi) / (2 * math.pi) * rep * 2, vv * rep])
    u0 = [u[0] for u in us]
    if max(u0) - min(u0) > rep:
        for u in us:
            if u[0] < rep: u[0] += rep * 2
    for li, u in zip(poly.loop_indices, us): uv[li].uv = u

# ---------- 14. vertex colours: skin tint (lips, cheeks, stubble, under-eyes), grey temples ----------
ca = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
P_SKIN, P_HAIR = MATS.index(bpy.data.materials['skin']), MATS.index(bpy.data.materials['hair'])
def sm(a, b, x): x = max(0.0, min(1.0, (x - a) / (b - a))); return x * x * (3 - 2 * x)
def tint(v):
    r = g = b = 1.0
    def mix(t, col, k):
        nonlocal r, g, b; r, g, b = r + (col[0] - r) * k * t, g + (col[1] - g) * k * t, b + (col[2] - b) * k * t
    if v.y < EL.y + 0.05 and v.z > NE.z:
        lip = sm(0.022, 0.0, math.hypot(v.x / 1.6, v.z - MO.z)) * sm(MO.y + 0.03, MO.y + 0.005, v.y)
        mix(lip, SPEC.get('lip_tint', (0.78, 0.52, 0.52)), 0.8)
        for E in (EL, ER):
            mix(sm(0.045, 0.0, math.hypot(v.x - E.x * 1.6, v.z - (E.z - 0.045))), (1.0, 0.82, 0.8), SPEC.get('blush', 0.5))
            mix(sm(0.016, 0.0, math.hypot(v.x - E.x, v.z - (E.z - 0.016))), (0.82, 0.78, 0.82), 0.6)
        if SPEC.get('stubble'):
            st = sm(MO.z + 0.03, MO.z, v.z) * sm(NE.z, NE.z + 0.05, v.z) * (1 - sm(0.06, 0.08, abs(v.x)) * sm(MO.z - 0.02, MO.z + 0.01, v.z))
            mix(st * (1 - lip), (0.72, 0.74, 0.8), SPEC['stubble'])
    if v.z > EL.z + 0.06: mix(1, (1.0, 0.94, 0.9), 0.3)
    return (min(r, 1), min(g, 1), min(b, 1))
GREY = SPEC.get('grey_temples', 0.0); HB, HG = hexrgb(C['hair']), hexrgb('#9a948e')
if GREY: bpy.data.materials['hair'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*HG, 1)
for poly in me.polygons:
    for li in poly.loop_indices:
        v = me.vertices[me.loops[li].vertex_index].co; col = (1, 1, 1)
        if poly.material_index == P_SKIN: col = tint(v)
        elif poly.material_index == P_HAIR and GREY:
            k = 0.0
            if abs(v.x) > 0.05: k = GREY * sm(EL.y + 0.03, EL.y + 0.09, v.y) * (1 - sm(EL.y + 0.13, EL.y + 0.2, v.y)) * (0.55 + 0.45 * ((int(v.x * 900) + int(v.z * 700)) % 3 == 0))
            col = tuple(HB[i] / HG[i] + (1 - HB[i] / HG[i]) * k for i in range(3))
        ca.data[li].color = (*[min(1.0, c) for c in col], 1)
me.color_attributes.active_color = ca

# ---------- 15. export ----------
h.name = CHAR; rig.name = CHAR + '_rig'
for o in bpy.data.objects: o.select_set(o in (h, rig))
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_format='GLB', export_skins=True, export_morph=True, export_morph_normal=True,
                          export_animations=False, export_yup=True, export_apply=False, export_vertex_color='ACTIVE')
print('EXPORTED', OUT, len(me.vertices), 'verts', len(me.materials), 'materials')
