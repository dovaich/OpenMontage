import bpy, addon_utils, sys, json
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
info = HumanService._create_default_human_info_dict()
info["name"] = "Youssef"
info["phenotype"].update({"gender": 1.0, "age": 0.47, "muscle": 0.45, "weight": 0.28, "height": 0.58, "proportions": 0.75,
                          "race": {"asian": 0.1, "caucasian": 0.55, "african": 0.35}})
info["rig"] = "mixamo"
info["eyes"] = "high-poly/high-poly.mhclo"; info["eyebrows"] = "eyebrow001/eyebrow001.mhclo"; info["eyelashes"] = "eyelashes01/eyelashes01.mhclo"
info["teeth"] = "teeth_base/teeth_base.mhclo"; info["tongue"] = "tongue01/tongue01.mhclo"
info["hair"] = "short01/short01.mhclo"
info["clothes"] = ["male_casualsuit01/male_casualsuit01.mhclo", "shoes05/shoes05.mhclo"]
info["skin_mhmat"] = "young_caucasian_male/young_caucasian_male.mhmat"; info["skin_material_type"] = "MAKESKIN"
st = HumanService.get_default_deserialization_settings(); st["subdiv_levels"] = 0
bm = HumanService.deserialize_from_dict(info, st)
for o in bpy.data.objects: print("OBJ", o.type, o.name, len(o.data.vertices) if o.type == 'MESH' else '', [m.type for m in o.modifiers] if o.type=='MESH' else '')
bpy.ops.wm.save_as_mainfile(filepath="/opt/chars/youssef.blend")
