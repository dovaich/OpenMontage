import bpy, addon_utils, sys, json
addon_utils.enable("bl_ext.user_default.mpfb", default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
info = HumanService._create_default_human_info_dict()
info["name"] = "Mariam"
info["phenotype"].update({"gender": 0.0, "age": 0.45, "muscle": 0.4, "weight": 0.45, "height": 0.67, "proportions": 0.7, "cupsize": 0.45,
                          "race": {"asian": 0.05, "caucasian": 0.9, "african": 0.05}})
info["rig"] = "mixamo"
info["eyes"] = "high-poly/high-poly.mhclo"; info["eyebrows"] = "eyebrow010/eyebrow010.mhclo"; info["eyelashes"] = "eyelashes03/eyelashes03.mhclo"
info["teeth"] = "teeth_base/teeth_base.mhclo"; info["tongue"] = "tongue01/tongue01.mhclo"
info["hair"] = ""
info["clothes"] = ["toigo_fisherman_sweater/toigo_fisherman_sweater.mhclo", "toigo_long_full_skirt/toigo_long_full_skirt.mhclo", "shoes06/shoes06.mhclo"]
info["skin_mhmat"] = "young_caucasian_female/young_caucasian_female.mhmat"; info["skin_material_type"] = "MAKESKIN"
st = HumanService.get_default_deserialization_settings(); st["subdiv_levels"] = 0
bm = HumanService.deserialize_from_dict(info, st)
for o in bpy.data.objects: print("OBJ", o.type, o.name, len(o.data.vertices) if o.type == 'MESH' else '', [m.type for m in o.modifiers] if o.type=='MESH' else '')
bpy.ops.wm.save_as_mainfile(filepath="/opt/chars/mariam.blend")
