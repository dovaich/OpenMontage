# Smallest Blender -> MP4 example: an orange cube spinning for 2 s (48 frames @ 24 fps, 640x360).
# Run:  blender -b -P scene.py -- <out_dir> [EEVEE|CYCLES]
import bpy, math, os, sys
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_dir = os.path.abspath(args[0] if args else ".")
engine = (args[1] if len(args) > 1 else "EEVEE").upper()
os.makedirs(out_dir, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene
engines = [e.identifier for e in s.render.bl_rna.properties["engine"].enum_items]
if engine == "EEVEE":
    s.render.engine = next(e for e in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE") if e in engines)
else:
    s.render.engine = "CYCLES"; s.cycles.device = "CPU"; s.cycles.samples = 16
s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = 640, 360, 100
s.frame_start, s.frame_end, s.render.fps = 1, 48, 24

bpy.ops.mesh.primitive_cube_add(size=2)
cube = bpy.context.object
mat = bpy.data.materials.new("Orange")
try: mat.use_nodes = True
except Exception: pass
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (1, 0.4, 0.05, 1)
cube.data.materials.append(mat)
cube.rotation_euler = (0, 0, 0); cube.keyframe_insert("rotation_euler", frame=1)
cube.rotation_euler = (math.radians(30), 0, math.radians(360)); cube.keyframe_insert("rotation_euler", frame=48)

bpy.ops.object.light_add(type="SUN", location=(4, -4, 6)); bpy.context.object.data.energy = 4
bpy.ops.object.camera_add(location=(6, -6, 4), rotation=(math.radians(65), 0, math.radians(45)))
s.camera = bpy.context.object
w = bpy.data.worlds.new("W"); s.world = w
try: w.use_nodes = True
except Exception: pass
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.05, 0.07, 0.12, 1)

im = s.render.image_settings
if hasattr(im, "media_type"):  # Blender 5.x
    im.media_type = "VIDEO"
im.file_format = "FFMPEG"
s.render.ffmpeg.format = "MPEG4"
s.render.ffmpeg.codec = "H264"
s.render.ffmpeg.constant_rate_factor = "HIGH"
s.render.filepath = os.path.join(out_dir, "hello_cube_")
bpy.ops.render.render(animation=True)
print("RENDER_DONE", out_dir, "engine", s.render.engine, "blender", bpy.app.version_string)
