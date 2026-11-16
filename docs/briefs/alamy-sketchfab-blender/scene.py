# El-Alamy (Sketchfab body), 2008 crime-game style intro (10 s, vertical). Same street/camera/motion as alamy-gta4-blender.
# Own geometry only (lofted body + clothes), driven by the Mixamo skeleton from incoming/ps3-mixamo-lib.
# Run from repo root:
#   blender -b --factory-startup -P docs/briefs/alamy-gta4-blender/scene.py -- <out_dir> <mode> [width] [height]
#   mode = stills:1,90,180,260  -> PNG stills    |  mode = video -> MP4 (H.264)
import bpy, bmesh, math, os, sys, json
from mathutils import Vector, Matrix, Quaternion

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
ANIM = os.path.join(REPO, "incoming", "ps3-mixamo-lib")
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(args[0] if args else os.path.join(REPO, "incoming", "alamy-sketchfab-blender"))
MODE = args[1] if len(args) > 1 else "stills:1,120,240"
RW = int(args[2]) if len(args) > 2 else 540
RH = int(args[3]) if len(args) > 3 else 960
os.makedirs(OUT, exist_ok=True)
FPS, NF = 30, 300

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.render.fps = FPS; S.frame_start = 1; S.frame_end = NF
S.render.resolution_x, S.render.resolution_y, S.render.resolution_percentage = RW, RH, 100

# ---------------------------------------------------------------- helpers
def inp(node, names, val):
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = val; return

def mat(name, color, rough=0.5, metal=0.0, spec=0.5, emit=None, estr=0.0, sss=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    inp(p, ["Base Color"], (*color, 1)); inp(p, ["Roughness"], rough); inp(p, ["Metallic"], metal)
    inp(p, ["Specular", "Specular IOR Level"], spec)
    if sss:
        inp(p, ["Subsurface", "Subsurface Weight"], sss)
        inp(p, ["Subsurface Color"], (*color, 1)); inp(p, ["Subsurface Radius"], (0.6, 0.25, 0.15))
    if emit:
        inp(p, ["Emission", "Emission Color"], (*emit, 1)); inp(p, ["Emission Strength"], estr)
    m.diffuse_color = (*color, 1)
    return m

def tex_mat(name, build):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes.get("Principled BSDF"); build(nt, p); return m

def link_new(ob, coll=None):
    (coll or S.collection).objects.link(ob); return ob

def mesh_obj(name, verts, faces, m=None, smooth=True):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    ob = link_new(bpy.data.objects.new(name, me))
    if m: me.materials.append(m)
    if smooth:
        for f in me.polygons: f.use_smooth = True
    return ob

def box(name, loc, size, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    if m: o.data.materials.append(m)
    return o

def cyl(name, loc, r, depth, m, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name
    if m: o.data.materials.append(m)
    for f in o.data.polygons: f.use_smooth = True
    return o

def sphere(name, loc, scale, m, seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale
    if m: o.data.materials.append(m)
    for f in o.data.polygons: f.use_smooth = True
    return o

def loft(name, pts, m, n=16, ref=Vector((0, -1, 0)), cap0=True, cap1=True, skip=None, offs=None):
    """pts: list of (center Vector, r_side, r_fwd). Rings perpendicular to the path.
    skip(i_ring, angle) -> True leaves that quad out (for the open jacket front)."""
    verts, faces = [], []
    for i, (c, rs, rf) in enumerate(pts):
        a = pts[min(i + 1, len(pts) - 1)][0]; b = pts[max(i - 1, 0)][0]
        t = (a - b).normalized()
        r = ref if abs(t.dot(ref)) < 0.95 else Vector((0, 0, 1))
        side = t.cross(r).normalized(); fwd = side.cross(t).normalized()
        for k in range(n):
            ang = 2 * math.pi * k / n
            verts.append(tuple(c + side * (math.cos(ang) * rs) + fwd * (math.sin(ang) * rf)))
    R = len(pts)
    for i in range(R - 1):
        for k in range(n):
            ang = 2 * math.pi * (k + 0.5) / n
            if skip and skip(i, ang): continue
            k2 = (k + 1) % n
            faces.append((i * n + k, i * n + k2, (i + 1) * n + k2, (i + 1) * n + k))
    if cap0: verts.append(tuple(pts[0][0])); faces += [((k + 1) % n, k, len(verts) - 1) for k in range(n)]
    if cap1:
        verts.append(tuple(pts[-1][0])); c = len(verts) - 1
        faces += [((R - 1) * n + k, (R - 1) * n + (k + 1) % n, c) for k in range(n)]
    return mesh_obj(name, verts, faces, m)

# ---------------------------------------------------------------- skeleton + animation
def import_action(fname):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=os.path.join(ANIM, fname))
    new = [o for o in bpy.data.objects if o not in before]
    arm = [o for o in new if o.type == "ARMATURE"][0]
    act = arm.animation_data.action
    return arm, new, act

ARM, _, ACT_TALK = import_action("talking.fbx")
ARM.name = "AlamyRig"
_, junk, ACT_BRAG = import_action("shrug.fbx")
for o in junk: bpy.data.objects.remove(o, do_unlink=True)

MW = ARM.matrix_world.copy()
def J(b, tail=False):
    bb = ARM.data.bones["mixamorig:" + b]
    return MW @ (bb.tail_local if tail else bb.head_local)

# NLA: talking 1..180, then shrug (a "what can you do, I'm the best" beat) with a blend, then hold
ad = ARM.animation_data; ad.action = None
tr = ad.nla_tracks.new(); s1 = tr.strips.new("talk", 1, ACT_TALK); s1.extrapolation = "HOLD"
s1.action_frame_start, s1.action_frame_end = 1, 179
tr2 = ad.nla_tracks.new(); s2 = tr2.strips.new("shrug", 168, ACT_BRAG); s2.blend_in = 18
s2.extrapolation = "HOLD"; s2.blend_type = "REPLACE"
s2.scale = 1.6  # slower, cooler shrug

# ---------------------------------------------------------------- body: Sketchfab "Man in Black Bomber Jacket"
# by SidewalkNZ, CC-BY (https://sketchfab.com/3d-models/man-in-black-bomber-jacket-b4bed0f116344be0a752939aa5025b4b)
# Its own skeleton (hashed joint names, A-pose) is driven by the Mixamo rig: per bone we copy the Mixamo
# world-space rotation delta after aligning the rest directions (A-pose -> T-pose), baked to keyframes.
GLB = os.path.join(REPO, "incoming", "sketchfab-bomber", "source", "Man in Black Bomber Jacket.glb")
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=GLB)
newobs = [o for o in bpy.data.objects if o not in before]
TA = [o for o in newobs if o.type == "ARMATURE"][0]
for o in newobs:
    if o.type == "ARMATURE" and o is not TA: bpy.data.objects.remove(o, do_unlink=True)
bpy.context.view_layer.update()
# El-Alamy runs a service centre: drop the belt holsters/gun and the earpiece that come with the model
for o in [x for x in list(newobs) if x.type == "MESH"]:
    if len(o.data.vertices) < 80:          # the earpiece
        newobs.remove(o); bpy.data.objects.remove(o, do_unlink=True); continue
    bm = bmesh.new(); bm.from_mesh(o.data); bm.verts.ensure_lookup_table()
    seen, kill = set(), []
    for v in bm.verts:
        if v.index in seen: continue
        st, comp = [v], []; seen.add(v.index)
        while st:
            x = st.pop(); comp.append(x)
            for e in x.link_edges:
                y = e.other_vert(x)
                if y.index not in seen: seen.add(y.index); st.append(y)
        ws = [o.matrix_world @ x.co for x in comp]
        ax = [abs(p.x) for p in ws]; zz = [p.z for p in ws]
        if len(comp) <= 40 and min(ax) >= 0.145 and max(ax) <= 0.28 and min(zz) >= 0.55 and max(zz) <= 1.09:
            kill += comp
    bmesh.ops.delete(bm, geom=list(set(kill)), context="VERTS"); bm.to_mesh(o.data); bm.free()
    print("HOLSTER_VERTS_REMOVED", o.name, len(set(kill)))
# ---- lip sync: the model has no jaw bone, so a "JawOpen" shape key rotates the lower lip/chin/lower teeth
# about a hinge in front of the ears; its value follows mouth.json (made from vo.wav), like the old body.
MOUTH_LINE, HINGE = 1.600, Vector((0, -0.01, 1.63))     # rest-pose world coords of the imported model
JAW_DEG = 7.0
def ramp(v, a, b):
    t = max(0.0, min(1.0, (v - a) / (b - a))); return t * t * (3 - 2 * t)
JAW_KEYS = []
body_mesh = max([o for o in newobs if o.type == "MESH"], key=lambda o: len(o.data.vertices))
for o in [x for x in newobs if x.type == "MESH" and x is not body_mesh]:
    mw = o.matrix_world.copy(); inv3 = mw.inverted().to_3x3()
    # cut the welded lips apart along the mouth line so the lower lip can separate from the upper one
    bm = bmesh.new(); bm.from_mesh(o.data)
    def wz(f): return (mw @ f.calc_center_median()).z
    import heapq
    bm.verts.ensure_lookup_table()
    W_ = {v.index: mw @ v.co for v in bm.verts}
    reg = [v for v in bm.verts if abs(W_[v.index].z - MOUTH_LINE) < 0.008 and abs(W_[v.index].x) < 0.034
           and W_[v.index].y < -0.100 and not v.is_boundary]
    cut, LINE = [], []
    if len(reg) > 6:
        rs = set(v.index for v in reg)
        def corner(sgn):
            c = [v for v in reg if sgn * W_[v.index].x > 0.018 and abs(W_[v.index].z - MOUTH_LINE) < 0.004]
            return max(c, key=lambda v: sgn * W_[v.index].x - 3 * abs(W_[v.index].z - MOUTH_LINE)) if c else None
        a, b = corner(-1), corner(1)
        if a and b:   # shortest path between the corners that hugs the mouth line
            dist, prev, pq = {a.index: 0.0}, {}, [(0.0, a.index)]
            while pq:
                d, i = heapq.heappop(pq)
                if i == b.index: break
                if d > dist.get(i, 1e9): continue
                for e in bm.verts[i].link_edges:
                    j = e.other_vert(bm.verts[i]).index
                    if j not in rs: continue
                    pm = (W_[i] + W_[j]) / 2
                    nd = d + (W_[i] - W_[j]).length * (1 + 400 * abs(pm.z - MOUTH_LINE))
                    if nd < dist.get(j, 1e9): dist[j] = nd; prev[j] = i; heapq.heappush(pq, (nd, j))
            if b.index in prev:
                path = [b.index]
                while path[-1] != a.index: path.append(prev[path[-1]])
                # straighten the (triangulated, zig-zag) lip line: put its inner vertices on one gentle curve
                zm = sum(W_[i].z for i in path) / len(path)
                ilw = mw.inverted()
                for i in path[1:-1]:
                    p = W_[i].copy(); p.z = zm - 0.0025 * (p.x / 0.03) ** 2   # slight smile at the corners
                    bm.verts[i].co = ilw @ p; W_[i] = p
                LINE = sorted((W_[i].x, W_[i].z) for i in path)
                for i, j in zip(path, path[1:]):
                    e = bm.edges.get((bm.verts[i], bm.verts[j]))
                    if e and len(e.link_faces) == 2: cut.append(e)
                cut = cut[1:-1] if len(cut) > 2 else cut   # keep the corners closed
    def line_z(x):
        if not LINE: return MOUTH_LINE
        if x <= LINE[0][0]: return LINE[0][1]
        for (x0, z0), (x1, z1) in zip(LINE, LINE[1:]):
            if x <= x1: return z0 + (z1 - z0) * ((x - x0) / max(x1 - x0, 1e-9))
        return LINE[-1][1]
    if cut: bmesh.ops.split_edges(bm, edges=cut)
    side = {}
    for v in bm.verts:   # which side of the mouth a (possibly split) vertex belongs to, relative to the cut line
        p = mw @ v.co
        if v.link_faces and abs(p.z - line_z(p.x)) < 0.0025 and abs(p.x) < 0.04:
            side[v.index] = MOUTH_LINE + sum(wz(f) - line_z(p.x) for f in v.link_faces) / len(v.link_faces) * 3
        elif abs(p.x) < 0.04:
            side[v.index] = MOUTH_LINE + (p.z - line_z(p.x))
    bm.to_mesh(o.data); bm.free(); o.data.update()
    print("LIP_CUT_EDGES", o.name, len(cut), "line", [(round(x, 3), round(z, 3)) for x, z in LINE])
    if not o.data.shape_keys: o.shape_key_add(name="Basis", from_mix=False)
    sk = o.shape_key_add(name="JawOpen", from_mix=False)
    rot = Matrix.Rotation(math.radians(JAW_DEG), 3, "X")
    n = 0
    for v in o.data.vertices:
        p = mw @ v.co
        sz = side.get(v.index, p.z)
        w = (1 - ramp(sz, MOUTH_LINE - 0.003, MOUTH_LINE + 0.003)) * ramp(p.z, 1.505, 1.545) \
            * (1 - ramp(abs(p.x), 0.030, 0.068)) * (1 - ramp(p.y, -0.03, 0.01))
        if w <= 0: continue
        q = HINGE + rot @ (p - HINGE)
        sk.data[v.index].co = v.co + inv3 @ ((q - p) * w); n += 1
    if n: JAW_KEYS.append(sk)
    else: o.shape_key_remove(sk)
    print("JAW_VERTS", o.name, n)
MOUTH_JSON = os.path.join(HERE, "mouth.json")
if os.path.exists(MOUTH_JSON) and JAW_KEYS:
    op = json.load(open(MOUTH_JSON))["open"][:NF]
    for k, v in enumerate(op):
        for sk in JAW_KEYS:
            sk.value = max(0.0, min(1.0, float(v))) if os.environ.get("ALAMY_JAW_TEST") != "1" else 1.0
            sk.keyframe_insert("value", frame=k + 1)
    print("LIPSYNC_FRAMES", len(op))
# dark mouth cavity just behind the lips (shows as the opening when the jaw drops); rides on the head joint
CAV = sphere("MouthCavity", (0, -0.098, MOUTH_LINE - 0.006), (0.020, 0.016, 0.016),
             mat("MouthDark", (0.02, 0.005, 0.005), rough=0.9, spec=0.05), 16)
bpy.context.view_layer.update()
CAV.data.transform(CAV.matrix_world); CAV.matrix_world = Matrix.Identity(4)   # bake: mesh in model rest space
CAV.parent = TA
vg = CAV.vertex_groups.new(name="Joint e3849ea1c00d68")   # the model's head joint
vg.add([v.index for v in CAV.data.vertices], 1.0, "REPLACE")
CAV.modifiers.new("Arm", "ARMATURE").object = TA
TA.rotation_mode = "XYZ"; TA.rotation_euler = (0, 0, 0)
P = "Joint "
TMAP = {  # mixamo bone -> sketchfab joint
 "Hips": "fe480fc111184f", "Spine": "328d02b41d39d3", "Spine1": "88760acf4a16f1", "Spine2": "b33d60a2562fad",
 "Neck": "a9d5cca8e0fcd7", "Head": "e3849ea1c00d68",
 "RightShoulder": "cbb8fab88b25b8", "RightArm": "c1f12a2c25e8c4", "RightForeArm": "24332a58b75dd6", "RightHand": "6747209dad3281",
 "RightHandThumb1": "14629bd092d8bc", "RightHandThumb2": "34bdbb03197578", "RightHandThumb3": "ca115e3258f233",
 "RightHandIndex1": "107441aa3b4a21", "RightHandIndex2": "9bfcecd4262e70", "RightHandIndex3": "fdc6ccd0af0ae6",
 "RightHandMiddle1": "0178a28eaec139", "RightHandMiddle2": "75b6ff9eb35e60", "RightHandMiddle3": "cf7545e3a61e8d",
 "RightHandRing1": "2389b1e540fa6c", "RightHandRing2": "c713ea0b0c6fdd", "RightHandRing3": "29309216237a24",
 "RightHandPinky1": "8edc5ce605c1ca", "RightHandPinky2": "bf2c9195fbce97", "RightHandPinky3": "422ef24e4289dc",
 "LeftShoulder": "5bee43831238f2", "LeftArm": "f565b22941d300", "LeftForeArm": "4072b970239f53", "LeftHand": "2ba3c3ce26c453",
 "LeftHandThumb1": "23803d9164da5c", "LeftHandThumb2": "20c8734469b127", "LeftHandThumb3": "38218552b78479",
 "LeftHandIndex1": "98e49c73e82bc1", "LeftHandIndex2": "b8d90865b7b629", "LeftHandIndex3": "e25ddfb1a421ff",
 "LeftHandMiddle1": "3a016c331cd89f", "LeftHandMiddle2": "c99314898ad7ed", "LeftHandMiddle3": "c80c93306f5309",
 "LeftHandRing1": "edc72dde6fac6d", "LeftHandRing2": "cb3eb32bace541", "LeftHandRing3": "b851b0a44c47f2",
 "LeftHandPinky1": "460b3a8a19a33e", "LeftHandPinky2": "f7673cdef3fa57", "LeftHandPinky3": "8885665f2f874a",
 "LeftUpLeg": "75b2d57e11bd68", "LeftLeg": "bef292c823b6a0", "LeftFoot": "49187c75606c98", "LeftToeBase": "66bba0ac9116d0",
 "RightUpLeg": "c14da7dd3b1db9", "RightLeg": "562553c654926a", "RightFoot": "ba03b3fd43bd16", "RightToeBase": "4af74452357e8f",
}
CHILD = {"Hips": "Spine", "Spine": "Spine1", "Spine1": "Spine2", "Spine2": "Neck", "Neck": "Head",
         "UpLeg": "Leg", "Leg": "Foot", "Foot": "ToeBase", "Shoulder": "Arm", "Arm": "ForeArm", "ForeArm": "Hand",
         "Hand": "HandMiddle1"}
def child_of(mb):
    for side in ("Left", "Right"):
        if mb.startswith(side):
            rest = mb[len(side):]
            if rest in CHILD: return side + CHILD[rest]
            if rest.startswith("Hand") and rest[-1] in "12": return mb[:-1] + str(int(mb[-1]) + 1)
            return None
    return CHILD.get(mb)
# scale the model so its hips sit at the Mixamo hips height, place at the origin like the old body
tb = TA.data.bones
hipT = TA.matrix_world @ tb[P + TMAP["Hips"]].head_local
sc = J("Hips").z / max(hipT.z, 1e-6)
TA.scale = (sc, sc, sc); TA.location = (J("Hips").x, J("Hips").y, 0)
bpy.context.view_layer.update()
WT = TA.matrix_world.copy()
def trest(mb): return WT @ tb[P + TMAP[mb]].head_local
SR = {mb: (MW @ ARM.data.bones["mixamorig:" + mb].matrix_local).to_quaternion() for mb in TMAP}
TR = {mb: tb[P + TMAP[mb]].matrix_local.to_quaternion() for mb in TMAP}   # armature space == world rot (TA unrotated)
QA = {}
for mb in TMAP:
    c = child_of(mb)
    if c and c in TMAP:
        dT = (trest(c) - trest(mb)); dS = (J(c) - J(mb))
        QA[mb] = dT.normalized().rotation_difference(dS.normalized()) if dT.length > 1e-4 and dS.length > 1e-4 else None
    else:
        QA[mb] = None
for mb in TMAP:   # leaf bones inherit the parent's alignment
    if QA[mb] is None:
        par = ARM.data.bones["mixamorig:" + mb].parent
        QA[mb] = QA.get(par.name.replace("mixamorig:", "")) if par else None
        if QA[mb] is None: QA[mb] = Quaternion()
INV = {v: k for k, v in TMAP.items()}
order = []
def walk(b):
    order.append(b)
    for c in b.children: walk(c)
for b in tb:
    if b.parent is None: walk(b)
for pb in TA.pose.bones: pb.rotation_mode = "QUATERNION"
hip_rest_S = J("Hips")
for f in range(1, NF + 1):
    S.frame_set(f)
    SP = {mb: (ARM.matrix_world @ ARM.pose.bones["mixamorig:" + mb].matrix).to_quaternion() for mb in TMAP}
    hipS = (ARM.matrix_world @ ARM.pose.bones["mixamorig:Hips"].matrix).to_translation()
    pose = {}
    for b in order:
        key = b.name[len(P):] if b.name.startswith(P) else b.name
        base = (pose[b.parent.name] @ b.parent.matrix_local.inverted() @ b.matrix_local) if b.parent else b.matrix_local.copy()
        mb = INV.get(key)
        if mb:
            rot = SP[mb] @ SR[mb].inverted() @ QA[mb] @ TR[mb]
            loc = base.to_translation()
            if mb == "Hips": loc = loc + (hipS - hip_rest_S) / sc
            want = Matrix.Translation(loc) @ rot.to_matrix().to_4x4()
        else:
            want = base
        pose[b.name] = want
        basis = base.inverted() @ want
        pb = TA.pose.bones[b.name]
        pb.matrix_basis = basis
        if mb:
            pb.keyframe_insert("rotation_quaternion", frame=f)
            if mb == "Hips": pb.keyframe_insert("location", frame=f)
ARM.hide_render = True; ARM.hide_viewport = True
for o in newobs:
    if o.type == "MESH":
        for m in o.data.materials:
            if m and m.node_tree:
                p = m.node_tree.nodes.get("Principled BSDF")
                if p: inp(p, ["Specular", "Specular IOR Level"], 0.35); inp(p, ["Roughness"], 0.6)
print("RETARGET_DONE", len(order), "bones, scale", round(sc, 3))

# ---------------------------------------------------------------- the street (dusk, smog, wet asphalt)
def brick_mat():
    def b(nt, p):
        t = nt.nodes.new("ShaderNodeTexBrick"); t.inputs["Scale"].default_value = 9
        inp(t, ["Color1"], (0.20, 0.085, 0.055, 1)); inp(t, ["Color2"], (0.14, 0.06, 0.04, 1))
        inp(t, ["Mortar"], (0.17, 0.16, 0.15, 1)); inp(t, ["Mortar Size"], 0.012)
        tc = nt.nodes.new("ShaderNodeTexCoord"); nt.links.new(tc.outputs["Object"], t.inputs["Vector"])
        nt.links.new(t.outputs["Color"], p.inputs["Base Color"]); inp(p, ["Roughness"], 0.85)
    return tex_mat("Brick", b)

def asphalt_mat():
    def b(nt, p):
        n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 3.0
        r = nt.nodes.new("ShaderNodeValToRGB"); r.color_ramp.elements[0].position = 0.45
        r.color_ramp.elements[0].color = (0.05, 0.05, 0.05, 1); r.color_ramp.elements[1].position = 0.6
        r.color_ramp.elements[1].color = (0.55, 0.55, 0.55, 1)
        nt.links.new(n.outputs["Fac"], r.inputs["Fac"]); nt.links.new(r.outputs["Color"], p.inputs["Roughness"])
        inp(p, ["Base Color"], (0.035, 0.034, 0.033, 1)); inp(p, ["Specular", "Specular IOR Level"], 0.6)
    return tex_mat("Asphalt", b)

def windows_mat(seed):
    def b(nt, p):
        t = nt.nodes.new("ShaderNodeTexBrick"); t.inputs["Scale"].default_value = 1.0
        inp(t, ["Mortar Size"], 0.06); inp(t, ["Offset"], 0.0)
        inp(t, ["Brick Width"], 0.9); inp(t, ["Row Height"], 0.55)
        inp(t, ["Color1"], (1, 0.55, 0.2, 1)); inp(t, ["Color2"], (0.02, 0.02, 0.025, 1)); inp(t, ["Mortar"], (0.05, 0.045, 0.045, 1))
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Location"].default_value = (seed * 0.37, seed * 0.11, 0)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
        nt.links.new(t.outputs["Color"], p.inputs["Base Color"])
        nt.links.new(t.outputs["Color"], p.inputs["Emission"] if "Emission" in p.inputs else p.inputs["Emission Color"])
        inp(p, ["Emission Strength"], 1.6); inp(p, ["Roughness"], 0.7)
    return tex_mat("Windows%d" % seed, b)

ASPH = asphalt_mat(); BRICK = brick_mat()
SIDEW = mat("Sidewalk", (0.22, 0.21, 0.2), rough=0.6)
SHUT = mat("Shutter", (0.22, 0.23, 0.24), rough=0.5, metal=0.6)
WARM = mat("GarageGlow", (0.3, 0.2, 0.1), emit=(1.0, 0.55, 0.25), estr=0.9)
NEON = mat("Neon", (1, 0.3, 0.1), emit=(1.0, 0.35, 0.08), estr=12.0)
NEONB = mat("NeonBlue", (0.2, 0.5, 1), emit=(0.25, 0.55, 1.0), estr=10.0)
POLE = mat("Pole", (0.05, 0.06, 0.05), rough=0.4, metal=0.7)
LAMP = mat("Lamp", (1, 0.7, 0.35), emit=(1.0, 0.65, 0.3), estr=25.0)
CARY = mat("CarYellow", (0.62, 0.42, 0.04), rough=0.25, spec=0.7)
GLASS = mat("Glass", (0.02, 0.025, 0.03), rough=0.05, spec=0.9)
CHROME = mat("Chrome", (0.8, 0.8, 0.8), rough=0.15, metal=1.0)
TIRE = mat("Tire", (0.02, 0.02, 0.02), rough=0.8)

# character stands on the sidewalk at origin; garage wall 3 m behind (+Y), street towards the camera (-Y)
box("Road", (0, -6, -0.075), (40, 14, 0.05), ASPH)
box("Sidewalk", (0, 2.0, -0.05), (40, 6, 0.1), SIDEW)
box("Curb", (0, -1.0, -0.04), (40, 0.18, 0.13), SIDEW)
box("GarageWall", (0, 5.0, 3.0), (16, 0.4, 6.2), BRICK)
box("ShutterOpening", (0.2, 4.79, 1.45), (4.2, 0.02, 2.9), WARM)          # lit inside
box("ShutterDoor", (0.2, 4.76, 2.35), (4.3, 0.06, 1.15), SHUT)             # rolled half up
for i in range(6):
    box("ShutterRib", (0.2, 4.72, 1.85 + i * 0.18), (4.3, 0.02, 0.02), POLE)
box("SignBack", (0.2, 4.70, 3.55), (4.6, 0.12, 0.75), mat("SignBack", (0.02, 0.02, 0.03), rough=0.6))
txt = bpy.data.curves.new("SignTxt", "FONT"); txt.body = "EL-ALAMY  AUTO SERVICE"; txt.align_x = "CENTER"
txt.size = 0.36; txt.extrude = 0.01
to = link_new(bpy.data.objects.new("Sign", txt)); to.location = (0.2, 4.62, 3.42); to.rotation_euler = (math.radians(90), 0, 0)
to.data.materials.append(NEON)
box("NeonTube", (0.2, 4.62, 3.88), (4.4, 0.03, 0.03), NEONB)
# fire escape-ish ledges and windows above
for z in (4.6, 5.6):
    box("Ledge", (0.2, 4.6, z), (6, 0.5, 0.05), POLE)
    for xx in (-4.5, 4.9):
        box("Win", (xx, 4.79, z + 0.45), (1.2, 0.02, 0.8), windows_mat(int(xx + z)))
# side buildings and distant skyline
for i, (x, w, h, y) in enumerate([(-11, 6, 14, 6), (11.5, 7, 18, 7), (-20, 8, 26, 14), (22, 9, 30, 16), (-4, 10, 34, 30), (8, 9, 40, 34)]):
    b = box("Bldg%d" % i, (x, y, h / 2), (w, 4, h), BRICK if i < 2 else mat("Far%d" % i, (0.05, 0.045, 0.05), rough=0.9))
    box("BldgWin%d" % i, (x, y - 2.01, h / 2 + 1), (w * 0.85, 0.02, h * 0.8), windows_mat(i + 3))
# street lamp (sodium) on the left
cyl("LampPole", (-2.2, -0.75, 2.6), 0.06, 5.2, POLE)
box("LampArm", (-1.65, -0.75, 5.15), (1.1, 0.08, 0.08), POLE)
box("LampHead", (-1.15, -0.75, 5.08), (0.45, 0.22, 0.1), LAMP)
# a boxy yellow 70s sedan parked at the curb on the right (a nod to the series car)
cx, cy = 2.6, -1.9
box("CarBody", (cx, cy, 0.55), (1.6, 4.0, 0.55), CARY)
box("CarCabin", (cx, cy + 0.25, 1.05), (1.45, 2.0, 0.5), CARY)
box("CarWinF", (cx, cy - 0.76, 1.05), (1.38, 0.03, 0.42), GLASS, rot=(math.radians(-25), 0, 0))
box("CarWinS", (cx - 0.73, cy + 0.25, 1.06), (0.02, 1.85, 0.38), GLASS)
box("CarBumper", (cx, cy - 2.02, 0.4), (1.65, 0.08, 0.14), CHROME)
for wx in (-0.78, 0.78):
    for wy in (-1.25, 1.3):
        cyl("Wheel", (cx + wx, cy + wy, 0.32), 0.32, 0.22, TIRE, rot=(0, math.radians(90), 0))
for hx in (-0.55, 0.55):
    cyl("Headlight", (cx + hx, cy - 2.0, 0.62), 0.09, 0.05, mat("HL", (1, 0.9, 0.7), emit=(1, 0.85, 0.6), estr=6), rot=(math.radians(90), 0, 0))

# ---------------------------------------------------------------- lights + world
def light(name, kind, loc, energy, color, size=0.5, rot=None, spot=None):
    ld = bpy.data.lights.new(name, kind); ld.energy = energy; ld.color = color
    if hasattr(ld, "shadow_soft_size"): ld.shadow_soft_size = size
    if spot: ld.spot_size = spot; ld.spot_blend = 0.6
    o = link_new(bpy.data.objects.new(name, ld)); o.location = loc
    if rot: o.rotation_euler = rot
    return o
light("Sodium", "POINT", (-1.15, -0.75, 4.9), 900, (1.0, 0.62, 0.3), size=0.3)
light("Key", "AREA", (-1.6, -2.4, 2.3), 110, (1.0, 0.8, 0.62), size=1.2,
      rot=(math.radians(65), 0, math.radians(-35)))
light("GarageSpill", "AREA", (0.2, 4.2, 1.6), 90, (1.0, 0.6, 0.3), size=4.0, rot=(math.radians(90), 0, math.radians(180)))
light("Rim", "SPOT", (1.8, 2.6, 2.6), 300, (0.45, 0.6, 1.0), size=0.2,
      rot=(math.radians(-60), 0, math.radians(145)), spot=math.radians(40))
light("Moon", "SUN", (0, 0, 10), 0.6, (0.55, 0.65, 1.0), rot=(math.radians(50), 0, math.radians(200)))

W = bpy.data.worlds.new("Dusk"); S.world = W; W.use_nodes = True
wn = W.node_tree.nodes; bg = wn["Background"]
grad = wn.new("ShaderNodeTexGradient"); tc = wn.new("ShaderNodeTexCoord"); sep = wn.new("ShaderNodeSeparateXYZ")
ramp = wn.new("ShaderNodeValToRGB")
W.node_tree.links.new(tc.outputs["Generated"], sep.inputs[0])
W.node_tree.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
ramp.color_ramp.elements[0].position = 0.5; ramp.color_ramp.elements[0].color = (0.30, 0.15, 0.07, 1)
ramp.color_ramp.elements[1].position = 0.75; ramp.color_ramp.elements[1].color = (0.05, 0.06, 0.10, 1)
W.node_tree.links.new(ramp.outputs["Color"], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 0.8
# smog: a big volume box (EEVEE volumetrics)
fog = box("Smog", (0, 0, 6), (60, 60, 14), None)
fm = bpy.data.materials.new("SmogVol"); fm.use_nodes = True; fnt = fm.node_tree
fnt.nodes.remove(fnt.nodes["Principled BSDF"]); pv = fnt.nodes.new("ShaderNodeVolumePrincipled")
pv.inputs["Density"].default_value = 0.006; inp(pv, ["Color"], (0.6, 0.55, 0.5, 1))
fnt.links.new(pv.outputs[0], fnt.nodes["Material Output"].inputs["Volume"])
fog.data.materials.append(fm)

# ---------------------------------------------------------------- camera: slow push-in, slight orbit, handheld drift
cam_d = bpy.data.cameras.new("Cam"); cam_d.lens = 40; cam_d.sensor_fit = "VERTICAL"
cam = link_new(bpy.data.objects.new("Cam", cam_d)); S.camera = cam
tgt = link_new(bpy.data.objects.new("CamTarget", None))
tc_ = cam.constraints.new("TRACK_TO"); tc_.target = tgt; tc_.track_axis = "TRACK_NEGATIVE_Z"; tc_.up_axis = "UP_Y"
keys = [(1, (0.9, -4.6, 1.15), (0, 0, 1.05), 40), (120, (0.55, -3.0, 1.45), (0, 0, 1.30), 45),
        (240, (0.25, -1.55, 1.62), (0, 0, 1.55), 50)]
for f, cl, tl, lens in keys:
    cam.location = cl; cam.keyframe_insert("location", frame=f)
    tgt.location = tl; tgt.keyframe_insert("location", frame=f)
    cam_d.lens = lens; cam_d.keyframe_insert("lens", frame=f)
for f in range(1, NF + 1, 20):   # gentle handheld drift
    tgt.location = tgt.location; tgt.delta_location = (0.01 * math.sin(f * 0.07), 0, 0.008 * math.sin(f * 0.11))
    tgt.keyframe_insert("delta_location", frame=f)
try:
    cam_d.dof.use_dof = True; cam_d.dof.focus_object = tgt; cam_d.dof.aperture_fstop = 2.2
except Exception:
    pass

# ---------------------------------------------------------------- render settings
engines = [e.identifier for e in S.render.bl_rna.properties["engine"].enum_items]
ENGINE = os.environ.get("ALAMY_ENGINE", "EEVEE")
if ENGINE == "EEVEE":
    S.render.engine = next(e for e in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE") if e in engines)
    ee = S.eevee
    for attr, val in (("taa_render_samples", 16), ("use_gtao", True), ("use_ssr", True), ("use_ssr_refraction", False),
                      ("use_bloom", True), ("bloom_intensity", 0.06), ("bloom_threshold", 1.2),
                      ("use_soft_shadows", True), ("volumetric_tile_size", "8"), ("volumetric_samples", 32),
                      ("use_volumetric_shadows", True), ("shadow_cube_size", "2048"), ("shadow_cascade_size", "2048"),
                      ("use_raytracing", True)):
        if hasattr(ee, attr):
            try: setattr(ee, attr, val)
            except Exception: pass
else:
    S.render.engine = "CYCLES"; S.cycles.device = "CPU"; S.cycles.samples = 24
vs = S.view_settings
for vt in ("Filmic", "AgX"):
    try: vs.view_transform = vt; break
    except Exception: pass
for lk in ("Medium High Contrast", "AgX - Medium High Contrast", "Filmic - Medium High Contrast"):
    try: vs.look = lk; break
    except Exception: pass
vs.exposure = -0.2
S.render.film_transparent = False

def save_blend():
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "alamy_sketchfab.blend"), compress=True)

if MODE == "check":
    S.frame_set(200); print("CHECK_OK", len(bpy.data.objects))
elif MODE.startswith("stills"):
    frames = [int(x) for x in MODE.split(":")[1].split(",")] if ":" in MODE else [1, 120, 240]
    S.render.image_settings.file_format = "PNG"
    for f in frames:
        S.frame_set(f); S.render.filepath = os.path.join(OUT, "still_%04d.png" % f)
        bpy.ops.render.render(write_still=True)
    print("STILLS_DONE", frames)
else:
    im = S.render.image_settings
    if hasattr(im, "media_type"): im.media_type = "VIDEO"
    im.file_format = "FFMPEG"; S.render.ffmpeg.format = "MPEG4"; S.render.ffmpeg.codec = "H264"
    S.render.ffmpeg.constant_rate_factor = "PERC_LOSSLESS"; S.render.ffmpeg.gopsize = 30
    VO = os.path.join(HERE, "vo.wav")   # El-Alamy's voice from the last recording
    if os.path.exists(VO) and os.environ.get("ALAMY_NO_VO") != "1":
        se = S.sequence_editor_create(); se.sequences.new_sound("VO", VO, 1, 1)
        S.render.ffmpeg.audio_codec = "AAC"; S.render.ffmpeg.audio_bitrate = 192
    S.render.filepath = os.path.join(OUT, "alamy_sketchfab_")
    bpy.ops.render.render(animation=True)
    save_blend()
    print("VIDEO_DONE")
print("BLENDER_VERSION", bpy.app.version_string)
