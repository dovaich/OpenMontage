# El-Alamy, 2008 crime-game style character intro (10 s, vertical). Blender 3.6+ (also runs on 4.x/5.x).
# Own geometry only (lofted body + clothes), driven by the Mixamo skeleton from incoming/ps3-mixamo-lib.
# Run from repo root:
#   blender -b --factory-startup -P docs/briefs/alamy-gta4-blender/scene.py -- <out_dir> <mode> [width] [height]
#   mode = stills:1,90,180,260  -> PNG stills    |  mode = video -> MP4 (H.264)
import bpy, bmesh, math, os, sys, json
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
ANIM = os.path.join(REPO, "incoming", "ps3-mixamo-lib")
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(args[0] if args else os.path.join(REPO, "incoming", "alamy-gta4-blender"))
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

# ---------------------------------------------------------------- materials
SKIN = mat("Skin", (0.40, 0.235, 0.15), rough=0.55, spec=0.35, sss=0.08)
LEATHER = mat("Leather", (0.018, 0.017, 0.017), rough=0.28, spec=0.6)
KNIT = mat("Knit", (0.025, 0.025, 0.027), rough=0.9, spec=0.2)
TROUSER = mat("Trouser", (0.16, 0.16, 0.165), rough=0.75, spec=0.3)
SHOE = mat("Shoe", (0.01, 0.01, 0.01), rough=0.15, spec=0.8)
HAIR = mat("Hair", (0.010, 0.008, 0.007), rough=0.85, spec=0.25)
METAL = mat("Metal", (0.6, 0.6, 0.6), rough=0.25, metal=1.0)
EYEW = mat("EyeWhite", (0.75, 0.72, 0.68), rough=0.2)
IRIS = mat("Iris", (0.05, 0.03, 0.02), rough=0.1)
MOUTH = mat("Mouth", (0.08, 0.02, 0.02), rough=0.6)
LIP = mat("Lip", (0.42, 0.22, 0.18), rough=0.5, sss=0.05)
BROW = mat("Brow", (0.015, 0.012, 0.01), rough=0.9)

# ---------------------------------------------------------------- body (built in the T-pose rest)
parts = []   # (object, allowed bones or a single bone)
SPINE = ["Hips", "Spine", "Spine1", "Spine2", "Neck"]
hip, sp, sp1, sp2, nk, hd = J("Hips"), J("Spine"), J("Spine1"), J("Spine2"), J("Neck"), J("Head")
top = J("HeadTop_End")
def V(x, y, z): return Vector((x, y, z))

# torso under the jacket (black turtleneck) + neck
tors = [(V(0, hip.y, hip.z - 0.02), 0.150, 0.100), (V(0, sp.y, sp.z), 0.148, 0.098),
        (V(0, sp1.y, sp1.z), 0.152, 0.100), (V(0, sp2.y, sp2.z), 0.168, 0.108),
        (V(0, sp2.y, nk.z - 0.04), 0.160, 0.100), (V(0, nk.y, nk.z + 0.005), 0.070, 0.066),
        (V(0, hd.y, hd.z - 0.005), 0.060, 0.060)]
parts.append((loft("Turtleneck", tors, KNIT, n=20, ref=V(0, 1, 0)), SPINE + ["Head", "LeftShoulder", "RightShoulder"]))

# jacket: torso shell open at the front, band collar, sleeves
def open_front(i, ang):  # fwd axis = sin(ang)>0 points to -Y? we test both: gap where |x| small and in front
    return False
jt = [(V(0, hip.y, hip.z - 0.06), 0.172, 0.122), (V(0, sp.y, sp.z), 0.168, 0.118),
      (V(0, sp1.y, sp1.z), 0.172, 0.120), (V(0, sp2.y, sp2.z), 0.180, 0.126),
      (V(0, sp2.y, nk.z - 0.035), 0.168, 0.116), (V(0, nk.y, nk.z + 0.01), 0.082, 0.078)]
jacket = loft("JacketBody", jt, LEATHER, n=24, ref=V(0, 1, 0), cap0=False, cap1=False,
              skip=lambda i, ang: (math.sin(ang) < -0.93 and i < 4))
parts.append((jacket, SPINE + ["LeftShoulder", "RightShoulder"]))
collar = loft("Collar", [(V(0, nk.y, nk.z + 0.0), 0.083, 0.080), (V(0, nk.y, nk.z + 0.055), 0.078, 0.075)],
              LEATHER, n=24, ref=V(0, 1, 0), cap0=False, cap1=False, skip=lambda i, ang: math.sin(ang) < -0.85)
parts.append((collar, ["Neck", "Spine2"]))

for side in ("Left", "Right"):
    sh, ua, fa, hn = J(side + "Shoulder"), J(side + "Arm"), J(side + "ForeArm"), J(side + "Hand")
    sgn = 1 if side == "Left" else -1
    sl = [(ua - (fa - ua).normalized() * 0.03, 0.064, 0.062), (ua, 0.066, 0.064),
          (ua.lerp(fa, 0.5), 0.056, 0.054), (fa, 0.048, 0.046), (fa.lerp(hn, 0.6), 0.043, 0.040),
          (hn - (hn - fa).normalized() * 0.035, 0.044, 0.041)]
    parts.append((loft(side + "Sleeve", sl, LEATHER, n=16, ref=V(0, 0, 1), cap0=False, cap1=False),
                  [side + "Shoulder", side + "Arm", side + "ForeArm", side + "Hand"]))
    # cuff (turtleneck sleeve peeking) + hand
    parts.append((loft(side + "Cuff", [(hn - (hn - fa).normalized() * 0.03, 0.036, 0.033),
                                       (hn + (hn - fa).normalized() * 0.005, 0.034, 0.030)], KNIT, n=12, ref=V(0, 0, 1)),
                  [side + "ForeArm", side + "Hand"]))
    m1 = J(side + "HandMiddle1"); d = (m1 - hn)
    palm = [(hn, 0.030, 0.018), (hn + d * 0.5, 0.040, 0.016), (m1, 0.042, 0.013)]
    parts.append((loft(side + "Palm", palm, SKIN, n=12, ref=V(0, 0, 1)), [side + "Hand"]))
    for fng, r in (("Thumb", 0.0105), ("Index", 0.0095), ("Middle", 0.0098), ("Ring", 0.0092), ("Pinky", 0.008)):
        ch = [J(f"{side}Hand{fng}{k}") for k in range(1, 5)]
        pts = [(ch[0], r * 1.15, r * 1.05)] + [(c, r * (1 - 0.1 * k), r * (0.95 - 0.1 * k)) for k, c in enumerate(ch[1:])]
        parts.append((loft(f"{side}{fng}", pts, SKIN, n=8, ref=V(0, 0, 1)),
                      [side + "Hand"] + [f"{side}Hand{fng}{k}" for k in range(1, 4)]))

# trousers, belt, shoes
pel = [(V(0, hip.y, hip.z + 0.05), 0.150, 0.100), (V(0, hip.y, hip.z - 0.03), 0.158, 0.106),
       (V(0, hip.y + 0.005, hip.z - 0.11), 0.150, 0.098)]
parts.append((loft("Pelvis", pel, TROUSER, n=20, ref=V(0, 1, 0)), ["Hips", "Spine", "LeftUpLeg", "RightUpLeg"]))
parts.append((loft("Belt", [(V(0, hip.y, hip.z + 0.03), 0.153, 0.103), (V(0, hip.y, hip.z + 0.06), 0.152, 0.102)],
                   SHOE, n=20, ref=V(0, 1, 0)), ["Hips"]))
for side in ("Left", "Right"):
    ul, lg, ft, toe, te = J(side + "UpLeg"), J(side + "Leg"), J(side + "Foot"), J(side + "ToeBase"), J(side + "Toe_End")
    leg = [(ul + V(0, 0, 0.03), 0.088, 0.088), (ul.lerp(lg, 0.45), 0.075, 0.075), (lg, 0.058, 0.060),
           (lg.lerp(ft, 0.55), 0.052, 0.054), (ft + V(0, 0, 0.01), 0.052, 0.054)]
    parts.append((loft(side + "TrouserLeg", leg, TROUSER, n=16, ref=V(0, -1, 0), cap0=False),
                  ["Hips", side + "UpLeg", side + "Leg", side + "Foot"]))
    heel = V(ft.x, ft.y + 0.055, 0.035)
    shoe = [(heel, 0.040, 0.032), (V(ft.x, ft.y, 0.06), 0.047, 0.050), (toe + V(0, 0, 0.02), 0.047, 0.030),
            (V(te.x, te.y + 0.01, 0.025), 0.040, 0.022)]
    parts.append((loft(side + "Shoe", shoe, SHOE, n=14, ref=V(0, 0, 1)), [side + "Foot", side + "ToeBase"]))

# ---------------------------------------------------------------- head (rigid on the Head bone)
hc = V(0, hd.y - 0.005, hd.z + 0.105)   # skull centre
head_objs = []
skull = [(hc + V(0, 0.010, -0.150), 0.045, 0.050),   # chin bottom
         (hc + V(0, 0.000, -0.135), 0.058, 0.070),
         (hc + V(0, 0.005, -0.100), 0.070, 0.088),   # jaw
         (hc + V(0, 0.010, -0.050), 0.076, 0.095),   # cheekbones
         (hc + V(0, 0.012, 0.000), 0.079, 0.100),    # brow line
         (hc + V(0, 0.015, 0.050), 0.077, 0.098),
         (hc + V(0, 0.018, 0.090), 0.062, 0.080),
         (hc + V(0, 0.020, 0.112), 0.035, 0.045)]
head = loft("Head", skull, SKIN, n=24, ref=V(0, 1, 0))
head_objs.append(head)
fy = hc.y - 0.093   # face front plane (character faces -Y)
nose = loft("Nose", [(V(0, fy + 0.004, hc.z - 0.005), 0.009, 0.006), (V(0, fy - 0.010, hc.z - 0.040), 0.013, 0.012),
                     (V(0, fy - 0.022, hc.z - 0.062), 0.017, 0.012), (V(0, fy - 0.008, hc.z - 0.070), 0.014, 0.008)],
            SKIN, n=10, ref=V(0, 0, 1))
head_objs.append(nose)
for sx in (1, -1):
    head_objs.append(sphere("Ear", V(sx * 0.079, hc.y + 0.012, hc.z - 0.035), (0.012, 0.022, 0.030), SKIN, 12))
    ew = sphere("Eye", V(sx * 0.033, fy + 0.012, hc.z - 0.012), (0.0145, 0.010, 0.0105), EYEW, 16); head_objs.append(ew)
    ir = sphere("Iris", V(sx * 0.033, fy + 0.0025, hc.z - 0.012), (0.0068, 0.004, 0.0068), IRIS, 12); head_objs.append(ir)
    lid = sphere("Lid" + ("L" if sx > 0 else "R"), V(sx * 0.033, fy + 0.010, hc.z - 0.004), (0.0165, 0.0125, 0.006), SKIN, 16)
    head_objs.append(lid)
    br = box("Brow", V(sx * 0.034, fy + 0.002, hc.z + 0.012), (0.034, 0.008, 0.0065), BROW,
             rot=(0, sx * math.radians(-8), 0)); head_objs.append(br)
# mouth: dark opening + lips; the opening scales with the voice (lip flap)
MZ = hc.z - 0.088
mouthO = sphere("MouthOpen", V(0, fy + 0.008, MZ), (0.020, 0.008, 0.0035), MOUTH, 16); head_objs.append(mouthO)
lipU = sphere("LipUpper", V(0, fy + 0.006, MZ + 0.005), (0.022, 0.008, 0.0045), LIP, 16); head_objs.append(lipU)
lipL = sphere("LipLower", V(0, fy + 0.006, MZ - 0.006), (0.020, 0.008, 0.005), LIP, 16); head_objs.append(lipL)
# hair: short black, all one colour; cap over the top/back + a slightly swept front
hair = loft("Hair", [(hc + V(0, 0.022, -0.045), 0.0805, 0.090), (hc + V(0, 0.014, 0.010), 0.0815, 0.1035),
                     (hc + V(0, 0.015, 0.048), 0.0800, 0.1020), (hc + V(0, 0.018, 0.088), 0.066, 0.084),
                     (hc + V(0, 0.020, 0.118), 0.030, 0.040)], HAIR, n=24, ref=V(0, 1, 0), cap0=False,
            skip=lambda i, ang: (i == 0 and math.sin(ang) < -0.35) or (i == 1 and math.sin(ang) < -0.75))
head_objs.append(hair)
for o in head_objs:
    parts.append((o, ["Head"]))

# ---------------------------------------------------------------- weights (distance to bone segments)
def seg_dist(p, a, b):
    ab = b - a; t = max(0.0, min(1.0, (p - a).dot(ab) / max(ab.length_squared, 1e-9)))
    return (a + ab * t - p).length

bpy.context.view_layer.update()
for ob, bones in parts:
    # bake object transform into the mesh so world = local
    ob.data.transform(ob.matrix_world); ob.matrix_world = Matrix.Identity(4)
    segs = []
    for b in bones:
        bb = ARM.data.bones["mixamorig:" + b]
        segs.append((b, MW @ bb.head_local, MW @ bb.tail_local))
    groups = {b: ob.vertex_groups.new(name="mixamorig:" + b) for b in bones}
    for v in ob.data.vertices:
        p = v.co
        if len(segs) == 1:
            groups[segs[0][0]].add([v.index], 1.0, "REPLACE"); continue
        ws = sorted(((1.0 / (seg_dist(p, a, b) + 0.01) ** 5, n) for n, a, b in segs), reverse=True)[:3]
        tot = sum(w for w, _ in ws)
        for w, n in ws:
            groups[n].add([v.index], w / tot, "REPLACE")
    md = ob.modifiers.new("Arm", "ARMATURE"); md.object = ARM
    if ob.name.startswith(("Jacket", "Collar")):
        so = ob.modifiers.new("Thick", "SOLIDIFY"); so.thickness = 0.008; so.offset = 1
        bpy.context.view_layer.objects.active = ob
        while ob.modifiers[0].name != "Thick":
            bpy.ops.object.modifier_move_up(modifier="Thick")
    if not ob.name.startswith(("Eye", "Iris", "Lid", "Brow", "Mouth", "Lip", "Ear")):
        sd = ob.modifiers.new("Sub", "SUBSURF"); sd.levels = 1; sd.render_levels = 2

# ---------------------------------------------------------------- lip flap + blinks
MOUTH_JSON = os.path.join(HERE, "mouth.json")
def mouth_open(o):
    for k, v in enumerate(o):
        f = k + 1
        mouthO.scale = (0.020, 0.008, 0.0035 + 0.011 * v); mouthO.keyframe_insert("scale", frame=f)
        lipL.location = V(0, fy + 0.006, MZ - 0.006 - 0.010 * v); lipL.keyframe_insert("location", frame=f)
if os.path.exists(MOUTH_JSON):
    mouth_open(json.load(open(MOUTH_JSON))["open"][:NF])
for o in [x for x in head_objs if x.name.startswith("Lid")]:
    base = o.scale.copy()
    for f0 in (40, 132, 205, 268):
        for df, sz in ((0, base.z), (3, base.z * 2.6), (6, base.z)):
            o.scale = (base.x, base.y, sz); o.keyframe_insert("scale", frame=f0 + df)
    o.location.z += 0.0  # lids sit just above the eye; scaled taller they cover it

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
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "alamy_gta4.blend"), compress=True)

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
    S.render.filepath = os.path.join(OUT, "alamy_raw_")
    bpy.ops.render.render(animation=True)
    save_blend()
    print("VIDEO_DONE")
print("BLENDER_VERSION", bpy.app.version_string)
