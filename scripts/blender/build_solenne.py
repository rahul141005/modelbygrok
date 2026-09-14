"""
Solenne — High-Fidelity 3D Character Production Pipeline for Blender
Executes in Blender 5.2.1 LTS to build, inspect, iterate, and export Solenne.
"""

import bpy
import bmesh
import mathutils
from mathutils import Vector, Matrix, Euler
import math
import os

print("=== Starting Complete Solenne Character Production in Blender ===")

# Paths
BASE_DIR = "D:/GITHUB/Fashion-model/modelbygrok"
ASSETS_DIR = os.path.join(BASE_DIR, "public/assets")
MODELS_DIR = os.path.join(BASE_DIR, "public/models")
RENDERS_DIR = os.path.join(ASSETS_DIR, "renders")
EXPORT_PATH = os.path.join(MODELS_DIR, "solenne.glb")
BLEND_PATH = os.path.join(MODELS_DIR, "solenne.blend")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(RENDERS_DIR, exist_ok=True)

# ----------------------------------------------------------------------
# 1. SCENE CLEANUP & COLLECTIONS
# ----------------------------------------------------------------------
def setup_collections():
    # Deselect all and delete objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    master_col = bpy.context.scene.collection
    collections = {}
    col_names = ["SOLENNE", "BODY", "HEAD", "EYES", "HAIR", "CLOTHING", "ACCESSORIES", "RIG", "LIGHTS", "CAMERAS"]

    solenne_col = bpy.data.collections.new("SOLENNE")
    master_col.children.link(solenne_col)
    collections["SOLENNE"] = solenne_col

    for name in col_names[1:]:
        c = bpy.data.collections.new(name)
        solenne_col.children.link(c)
        collections[name] = c

    return collections

collections = setup_collections()

def link_to_collection(obj, target_col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    target_col.objects.link(obj)

print("Scene cleared and collections initialized.")

# ----------------------------------------------------------------------
# 2. PBR MATERIALS
# ----------------------------------------------------------------------
def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), roughness=0.5, metallic=0.0, sss=0.0, transmission=0.0, clearcoat=0.0, image_path=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")

    # Compatibility across Blender versions
    if "Base Color" in bsdf.inputs:
        bsdf.inputs["Base Color"].default_value = base_color
    if "Roughness" in bsdf.inputs:
        bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = metallic

    if sss > 0:
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = sss
        elif "Subsurface" in bsdf.inputs:
            bsdf.inputs["Subsurface"].default_value = sss
        if "Subsurface Radius" in bsdf.inputs:
            bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.15)

    if transmission > 0:
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = transmission

    if clearcoat > 0:
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = clearcoat
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat

    if image_path and os.path.exists(image_path):
        try:
            img = bpy.data.images.load(image_path)
            tex_node = nodes.new(type="ShaderNodeTexImage")
            tex_node.image = img
            tex_node.location = (-320, 200)
            links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
        except Exception as e:
            print(f"Texture load failed for {image_path}: {e}")

    return mat

materials = {
    "Skin": create_pbr_material("M_Solenne_Skin", base_color=(0.86, 0.72, 0.63, 1.0), roughness=0.42, sss=0.08, clearcoat=0.05, image_path=os.path.join(ASSETS_DIR, "character/face/albedo.jpg")),
    "Face": create_pbr_material("M_Solenne_Face", base_color=(0.86, 0.72, 0.63, 1.0), roughness=0.38, sss=0.10, clearcoat=0.08, image_path=os.path.join(ASSETS_DIR, "character/face/albedo.jpg")),
    "EyeSclera": create_pbr_material("M_Solenne_Sclera", base_color=(0.96, 0.95, 0.94, 1.0), roughness=0.12, clearcoat=0.9),
    "EyeIris": create_pbr_material("M_Solenne_Iris", base_color=(0.42, 0.45, 0.27, 1.0), roughness=0.22, image_path=os.path.join(ASSETS_DIR, "character/eyes/iris_albedo.jpg")),
    "EyeCornea": create_pbr_material("M_Solenne_Cornea", base_color=(1.0, 1.0, 1.0, 1.0), roughness=0.02, transmission=0.95, clearcoat=1.0),
    "Hair": create_pbr_material("M_Solenne_Hair", base_color=(0.16, 0.10, 0.07, 1.0), roughness=0.32, image_path=os.path.join(ASSETS_DIR, "character/hair/hair_albedo.jpg")),
    "FabricSilk": create_pbr_material("M_Solenne_Silk", base_color=(0.88, 0.82, 0.75, 1.0), roughness=0.26, clearcoat=0.4, image_path=os.path.join(ASSETS_DIR, "clothing/fabric_silk.jpg")),
    "FabricDenim": create_pbr_material("M_Solenne_Denim", base_color=(0.28, 0.38, 0.52, 1.0), roughness=0.74, image_path=os.path.join(ASSETS_DIR, "clothing/fabric_denim.jpg")),
    "FabricTraditional": create_pbr_material("M_Solenne_Traditional", base_color=(0.48, 0.12, 0.16, 1.0), roughness=0.40, metallic=0.15, image_path=os.path.join(ASSETS_DIR, "clothing/fabric_traditional.jpg")),
    "JewelryGold": create_pbr_material("M_Solenne_Gold", base_color=(0.87, 0.69, 0.36, 1.0), roughness=0.16, metallic=0.96, clearcoat=0.3)
}
print("PBR Material definitions compiled.")

# ----------------------------------------------------------------------
# 3. ANATOMICAL BODY & HEAD (BMESH MODELING)
# ----------------------------------------------------------------------
def lerp(a, b, t):
    return a + (b - a) * t

def clamp(x, a, b):
    return min(b, max(a, x))

def smoothstep(e0, e1, x):
    t = clamp((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def build_solenne_body_mesh():
    mesh = bpy.data.meshes.new("Solenne_Body_Mesh")
    bm = bmesh.new()

    radial = 48
    torso_stacks = 60
    head_stacks = 40

    # 1. TORSO (Pelvis to neck base)
    y_min_torso = 0.76
    y_max_torso = 1.48
    h_torso = y_max_torso - y_min_torso

    torso_rings = []
    for i in range(torso_stacks + 1):
        v = i / torso_stacks
        z_pos = y_min_torso + v * h_torso

        if v < 0.18:
            t = v / 0.18
            rx = lerp(0.125, 0.178, t)
            ry = lerp(0.095, 0.128, t)
            cy = lerp(-0.012, -0.018, t)
        elif v < 0.36:
            t = (v - 0.18) / 0.18
            rx = lerp(0.178, 0.142, t)
            ry = lerp(0.128, 0.104, t)
            cy = lerp(-0.018, -0.005, t)
        elif v < 0.52:
            t = (v - 0.36) / 0.16
            rx = lerp(0.142, 0.138, t)
            ry = lerp(0.104, 0.096, t)
            cy = lerp(-0.005, 0.008, t)
        elif v < 0.74:
            t = (v - 0.52) / 0.22
            rx = lerp(0.138, 0.162, t)
            ry = lerp(0.096, 0.118, t)
            cy = lerp(0.008, -0.006, t)
        elif v < 0.88:
            t = (v - 0.74) / 0.14
            rx = lerp(0.162, 0.188, t)
            ry = lerp(0.118, 0.088, t)
            cy = lerp(-0.006, -0.002, t)
        else:
            t = (v - 0.88) / 0.12
            rx = lerp(0.188, 0.052, t)
            ry = lerp(0.088, 0.054, t)
            cy = lerp(-0.002, 0.012, t)

        ring = []
        for j in range(radial):
            u = j / radial
            angle = u * math.pi * 2.0
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)

            is_back = max(0.0, -sin_a)
            glute_mask = smoothstep(0.02, 0.14, v) * (1.0 - smoothstep(0.14, 0.35, v))
            glute = is_back * glute_mask * abs(cos_a) * 0.035

            is_front = max(0.0, sin_a)
            clavicle_mask = smoothstep(0.81, 0.85, v) * (1.0 - smoothstep(0.86, 0.91, v))
            clavicle = is_front * clavicle_mask * (abs(cos_a) ** 0.7) * 0.011

            breast_mask = smoothstep(0.56, 0.66, v) * (1.0 - smoothstep(0.72, 0.82, v))
            breast_sep = math.sin(math.pi * clamp((abs(cos_a) - 0.08) / 0.52, 0.0, 1.0))
            breast = is_front * breast_mask * breast_sep * 0.042

            spine_mask = smoothstep(0.25, 0.40, v) * (1.0 - smoothstep(0.85, 0.95, v))
            spine = (1.0 - min(1.0, abs(cos_a) * 6.0)) * is_back * spine_mask * 0.009

            vx = cos_a * rx
            vy = cy + sin_a * (ry + breast + clavicle) - glute - spine
            vz = z_pos

            vert = bm.verts.new((vx, vy, vz))
            ring.append(vert)
        torso_rings.append(ring)

    for i in range(len(torso_rings) - 1):
        r1 = torso_rings[i]
        r2 = torso_rings[i + 1]
        for j in range(radial):
            j_next = (j + 1) % radial
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    # 2. ANATOMICAL HEAD & FACE (Welded to neck top)
    neck_top_ring = torso_rings[-1]
    head_rings = [neck_top_ring]
    z_neck_top = y_max_torso
    z_head_top = z_neck_top + 0.23

    for i in range(1, head_stacks + 1):
        v = i / head_stacks
        z_pos = z_neck_top + v * 0.23
        y_center = lerp(0.012, 0.018, v)

        if v < 0.25:
            t = v / 0.25
            rx = lerp(0.052, 0.066, t)
            ry = lerp(0.054, 0.074, t)
            y_center = lerp(0.012, 0.024, t)
        elif v < 0.55:
            t = (v - 0.25) / 0.30
            rx = lerp(0.066, 0.070, t)
            ry = lerp(0.074, 0.086, t)
            y_center = 0.024
        elif v < 0.85:
            t = (v - 0.55) / 0.30
            rx = lerp(0.070, 0.066, t)
            ry = lerp(0.086, 0.082, t)
            y_center = lerp(0.024, 0.014, t)
        else:
            t = (v - 0.85) / 0.15
            rx = lerp(0.066, 0.015, t)
            ry = lerp(0.082, 0.020, t)
            y_center = 0.010

        ring = []
        for j in range(radial):
            u = j / radial
            angle = u * math.pi * 2.0
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)

            vx = cos_a * rx
            vy = y_center + sin_a * ry
            vz = z_pos

            # Sculpted nose bridge and tip
            if v > 0.30 and v < 0.48 and sin_a > 0.7:
                nose_t = math.sin(math.pi * (v - 0.30) / 0.18)
                center_t = clamp((sin_a - 0.7) / 0.3, 0.0, 1.0)
                vy += nose_t * center_t * 0.024

            # Sculpted chin
            if v > 0.14 and v < 0.28 and sin_a > 0.6:
                chin_t = math.sin(math.pi * (v - 0.14) / 0.14)
                center_t = clamp((sin_a - 0.6) / 0.4, 0.0, 1.0)
                vy += chin_t * center_t * 0.014

            # Recessed eye sockets
            if v > 0.38 and v < 0.54 and sin_a > 0.4:
                eye_x_dist = min(abs(vx - 0.035), abs(vx + 0.035))
                if eye_x_dist < 0.022:
                    eye_t = math.sin(math.pi * (v - 0.38) / 0.16)
                    eye_h = (0.022 - eye_x_dist) / 0.022
                    vy -= eye_t * eye_h * 0.012

            vert = bm.verts.new((vx, vy, vz))
            ring.append(vert)
        head_rings.append(ring)

    for i in range(len(head_rings) - 1):
        r1 = head_rings[i]
        r2 = head_rings[i + 1]
        for j in range(radial):
            j_next = (j + 1) % radial
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    # Crown closure
    top_center = bm.verts.new((0.0, 0.010, z_head_top + 0.005))
    top_ring = head_rings[-1]
    for j in range(radial):
        j_next = (j + 1) % radial
        bm.faces.new((top_ring[j], top_ring[j_next], top_center))

    # 3. LEGS & FEET
    leg_stacks = 36
    leg_radial = 20
    z_pelvis = 0.78
    z_ankle = 0.08
    h_leg = z_pelvis - z_ankle

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        leg_rings = []
        for i in range(leg_stacks + 1):
            v = i / leg_stacks
            z_pos = z_ankle + v * h_leg
            cx = side_sign * lerp(0.076, 0.098, v)
            cy = 0.0

            if v > 0.55:
                t = (v - 0.55) / 0.45
                rx = lerp(0.048, 0.082, t)
                ry = lerp(0.052, 0.088, t)
            elif v > 0.45:
                t = (v - 0.45) / 0.10
                rx = lerp(0.042, 0.048, t)
                ry = lerp(0.046, 0.052, t)
            elif v > 0.18:
                t = (v - 0.18) / 0.27
                calf_peak = math.sin(t * math.pi)
                rx = lerp(0.028, 0.042, t) + calf_peak * 0.009
                ry = lerp(0.030, 0.046, t) + calf_peak * 0.016
                cy = -calf_peak * 0.012
            else:
                t = v / 0.18
                rx = lerp(0.024, 0.028, t)
                ry = lerp(0.026, 0.030, t)

            ring = []
            for j in range(leg_radial):
                u = j / leg_radial
                angle = u * math.pi * 2.0
                cos_a = math.cos(angle)
                sin_a = math.sin(angle)

                is_front = max(0.0, sin_a)
                knee_mask = smoothstep(0.44, 0.49, v) * (1.0 - smoothstep(0.51, 0.56, v))
                patella = is_front * knee_mask * (abs(cos_a) ** 0.5) * 0.010

                vx = cx + cos_a * rx
                vy = cy + sin_a * ry + patella
                vz = z_pos

                vert = bm.verts.new((vx, vy, vz))
                ring.append(vert)
            leg_rings.append(ring)

        for i in range(len(leg_rings) - 1):
            r1 = leg_rings[i]
            r2 = leg_rings[i + 1]
            for j in range(leg_radial):
                j_next = (j + 1) % leg_radial
                bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    # 4. ARMS & HANDS
    arm_stacks = 30
    arm_radial = 18
    z_shoulder = 1.34
    z_wrist = 0.82
    h_arm = z_shoulder - z_wrist

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        arm_rings = []
        for i in range(arm_stacks + 1):
            v = i / arm_stacks
            z_pos = z_wrist + v * h_arm
            cx = side_sign * (0.30 - math.sin(0.18) * (z_pos - z_wrist))
            cy = lerp(0.015, -0.010, v)

            if v > 0.80:
                t = (v - 0.80) / 0.20
                rx = lerp(0.038, 0.054, t)
                ry = lerp(0.040, 0.056, t)
            elif v > 0.45:
                t = (v - 0.45) / 0.35
                rx = lerp(0.030, 0.038, t)
                ry = lerp(0.032, 0.040, t)
            elif v > 0.35:
                rx = 0.028
                ry = 0.030
            else:
                t = v / 0.35
                rx = lerp(0.019, 0.028, t)
                ry = lerp(0.021, 0.029, t)

            ring = []
            for j in range(arm_radial):
                u = j / arm_radial
                angle = u * math.pi * 2.0
                cos_a = math.cos(angle)
                sin_a = math.sin(angle)

                vx = cx + cos_a * rx
                vy = cy + sin_a * ry
                vz = z_pos

                vert = bm.verts.new((vx, vy, vz))
                ring.append(vert)
            arm_rings.append(ring)

        for i in range(len(arm_rings) - 1):
            r1 = arm_rings[i]
            r2 = arm_rings[i + 1]
            for j in range(arm_radial):
                j_next = (j + 1) % arm_radial
                bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    bm.to_mesh(mesh)
    bm.free()

    mesh.update()
    obj = bpy.data.objects.new("Solenne_Body", mesh)
    collections["BODY"].objects.link(obj)
    obj.data.materials.append(materials["Skin"])

    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True

    return obj

body_obj = build_solenne_body_mesh()
print("Body mesh generated.")

# ----------------------------------------------------------------------
# 4. OCULAR ASSEMBLY (EYES)
# ----------------------------------------------------------------------
def build_eyes():
    eye_offset_x = 0.034
    eye_y = 0.088
    eye_z = 1.576

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        suffix = "L" if is_left else "R"

        # Sclera
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0125, location=(side_sign * eye_offset_x, eye_y, eye_z), segments=24, ring_count=18)
        sclera = bpy.context.active_object
        sclera.name = f"Eye_Sclera_{suffix}"
        sclera.data.materials.append(materials["EyeSclera"])
        link_to_collection(sclera, collections["EYES"])

        # Iris Disc
        bpy.ops.mesh.primitive_circle_add(radius=0.0068, location=(side_sign * eye_offset_x, eye_y + 0.0105, eye_z), rotation=(math.pi * 0.5, 0, 0), vertices=24, fill_type='NGON')
        iris = bpy.context.active_object
        iris.name = f"Eye_Iris_{suffix}"
        iris.data.materials.append(materials["EyeIris"])
        link_to_collection(iris, collections["EYES"])

        # Cornea Dome
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0075, location=(side_sign * eye_offset_x, eye_y + 0.0070, eye_z), segments=20, ring_count=14)
        cornea = bpy.context.active_object
        cornea.name = f"Eye_Cornea_{suffix}"
        cornea.data.materials.append(materials["EyeCornea"])
        link_to_collection(cornea, collections["EYES"])

build_eyes()
print("Eyes created.")

# ----------------------------------------------------------------------
# 5. VOLUMETRIC HAIR (SCALP & STRAND WAVES)
# ----------------------------------------------------------------------
def build_hair():
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.116, location=(0, 0.014, 1.62), segments=32, ring_count=20)
    scalp = bpy.context.active_object
    scalp.name = "Hair_Scalp_Base"
    scalp.scale = (0.92, 1.05, 1.15)
    scalp.data.materials.append(materials["Hair"])
    link_to_collection(scalp, collections["HAIR"])

    hair_mesh = bpy.data.meshes.new("Solenne_Hair_Waves")
    bm = bmesh.new()

    num_locks = 14
    for k in range(num_locks):
        theta = (k / num_locks) * math.pi * 1.6 + 0.2
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)

        ribbon_pts = []
        steps = 16
        for s in range(steps + 1):
            t = s / steps
            rz = 1.70 - t * 0.50
            rad = 0.118 + t * 0.035
            wave = math.sin(t * math.pi * 3.0) * 0.015
            rx = cos_t * rad + wave * 0.5
            ry = -abs(sin_t) * rad * 0.95 + wave
            ribbon_pts.append((rx, ry, rz))

        for s in range(steps):
            p1 = ribbon_pts[s]
            p2 = ribbon_pts[s + 1]
            w = 0.018 * (1.0 - (s / steps) * 0.4)

            v1 = bm.verts.new((p1[0] - w, p1[1], p1[2]))
            v2 = bm.verts.new((p1[0] + w, p1[1], p1[2]))
            v3 = bm.verts.new((p2[0] + w, p2[1], p2[2]))
            v4 = bm.verts.new((p2[0] - w, p2[1], p2[2]))
            bm.faces.new((v1, v2, v3, v4))

    bm.to_mesh(hair_mesh)
    bm.free()

    hair_obj = bpy.data.objects.new("Solenne_Hair_Waves", hair_mesh)
    hair_obj.data.materials.append(materials["Hair"])
    collections["HAIR"].objects.link(hair_obj)

build_hair()
print("Hair system built.")

# ----------------------------------------------------------------------
# 6. WARDROBE & ACCESSORIES
# ----------------------------------------------------------------------
def build_wardrobe():
    # 1. Silk Slip Dress
    bpy.ops.mesh.primitive_cylinder_add(radius=0.17, depth=0.74, location=(0, 0, 1.10), vertices=28)
    dress = bpy.context.active_object
    dress.name = "Outfit_SilkSlipDress"
    dress.scale = (1.02, 0.78, 1.0)
    dress.data.materials.append(materials["FabricSilk"])
    link_to_collection(dress, collections["CLOTHING"])

    # 2. Crop Tank Top
    bpy.ops.mesh.primitive_cylinder_add(radius=0.165, depth=0.32, location=(0, 0, 1.28), vertices=28)
    tank = bpy.context.active_object
    tank.name = "Outfit_CropTank"
    tank.scale = (1.02, 0.80, 1.0)
    tank.data.materials.append(materials["FabricSilk"])
    link_to_collection(tank, collections["CLOTHING"])

    # 3. Denim Shorts
    bpy.ops.mesh.primitive_cylinder_add(radius=0.175, depth=0.28, location=(0, 0, 0.94), vertices=28)
    shorts = bpy.context.active_object
    shorts.name = "Outfit_DenimShorts"
    shorts.scale = (1.04, 0.82, 1.0)
    shorts.data.materials.append(materials["FabricDenim"])
    link_to_collection(shorts, collections["CLOTHING"])

    # 4. Gold Jhumka Earrings
    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        suffix = "L" if is_left else "R"
        bpy.ops.mesh.primitive_cone_add(radius1=0.012, radius2=0.002, depth=0.018, location=(side_sign * 0.082, 0.014, 1.54))
        jhumka = bpy.context.active_object
        jhumka.name = f"Accessory_Jhumka_{suffix}"
        jhumka.data.materials.append(materials["JewelryGold"])
        link_to_collection(jhumka, collections["ACCESSORIES"])

build_wardrobe()
print("Wardrobe and accessories created.")

# ----------------------------------------------------------------------
# 7. SHAPE KEYS (BODY MORPHS & EXPRESSIONS)
# ----------------------------------------------------------------------
def setup_shape_keys(obj):
    basis = obj.shape_key_add(name="Basis")

    # 1. Bust
    sk_bust = obj.shape_key_add(name="Bust")
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        y = vert.co.y
        x = vert.co.x
        if 1.14 < z < 1.34 and y > 0:
            v_t = math.sin(math.pi * (z - 1.14) / 0.20)
            x_sep = math.sin(math.pi * clamp((abs(x) - 0.03) / 0.12, 0.0, 1.0))
            sk_bust.data[i].co.y += v_t * x_sep * 0.038
            sk_bust.data[i].co.x += math.copysign(v_t * x_sep * 0.008, x)

    # 2. Hips
    sk_hips = obj.shape_key_add(name="Hips")
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        y = vert.co.y
        x = vert.co.x
        if 0.82 < z < 1.06:
            v_t = math.sin(math.pi * (z - 0.82) / 0.24)
            side_factor = (abs(x) / 0.16) ** 1.5
            sk_hips.data[i].co.x += math.copysign(v_t * side_factor * 0.032, x)
            if y < 0:
                sk_hips.data[i].co.y -= v_t * abs(y / 0.12) * 0.024

    # 3. Waist
    sk_waist = obj.shape_key_add(name="Waist")
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        x = vert.co.x
        if 1.02 < z < 1.16:
            v_t = math.sin(math.pi * (z - 1.02) / 0.14)
            sk_waist.data[i].co.x -= math.copysign(v_t * 0.018, x)

    # 4. Smile
    sk_smile = obj.shape_key_add(name="Smile")
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        y = vert.co.y
        x = vert.co.x
        if 1.51 < z < 1.56 and y > 0.05 and abs(x) < 0.045:
            corner_t = (abs(x) / 0.035) ** 1.6
            sk_smile.data[i].co.z += corner_t * 0.006
            sk_smile.data[i].co.x += math.copysign(corner_t * 0.004, x)

    # 5. Playful (Asymmetric Smirk)
    sk_smirk = obj.shape_key_add(name="Playful")
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        y = vert.co.y
        x = vert.co.x
        if 1.51 < z < 1.56 and y > 0.05 and abs(x) < 0.045:
            corner_t = (abs(x) / 0.035) ** 1.6
            side_scale = 1.4 if x > 0 else 0.5
            sk_smirk.data[i].co.z += corner_t * 0.007 * side_scale

setup_shape_keys(body_obj)
print("Shape keys defined.")

# ----------------------------------------------------------------------
# 8. ARMATURE RIGGING
# ----------------------------------------------------------------------
def build_armature(body_obj):
    arm_data = bpy.data.armatures.new("Solenne_Armature_Data")
    arm_obj = bpy.data.objects.new("Solenne_Rig", arm_data)
    collections["RIG"].objects.link(arm_obj)

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='EDIT')

    edit_bones = arm_data.edit_bones

    root = edit_bones.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 0.78)

    pelvis = edit_bones.new("Pelvis")
    pelvis.head = (0, 0, 0.78)
    pelvis.tail = (0, 0, 0.98)
    pelvis.parent = root

    spine = edit_bones.new("Spine")
    spine.head = (0, 0, 0.98)
    spine.tail = (0, 0, 1.20)
    spine.parent = pelvis

    chest = edit_bones.new("Chest")
    chest.head = (0, 0, 1.20)
    chest.tail = (0, 0, 1.42)
    chest.parent = spine

    neck = edit_bones.new("Neck")
    neck.head = (0, 0, 1.42)
    neck.tail = (0, 0, 1.52)
    neck.parent = chest

    head = edit_bones.new("Head")
    head.head = (0, 0, 1.52)
    head.tail = (0, 0, 1.70)
    head.parent = neck

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        suffix = "L" if is_left else "R"

        sh = edit_bones.new(f"Shoulder.{suffix}")
        sh.head = (0, 0, 1.38)
        sh.tail = (side_sign * 0.18, 0, 1.34)
        sh.parent = chest

        uarm = edit_bones.new(f"UpperArm.{suffix}")
        uarm.head = (side_sign * 0.18, 0, 1.34)
        uarm.tail = (side_sign * 0.25, 0.01, 1.05)
        uarm.parent = sh

        farm = edit_bones.new(f"Forearm.{suffix}")
        farm.head = (side_sign * 0.25, 0.01, 1.05)
        farm.tail = (side_sign * 0.30, 0.015, 0.82)
        farm.parent = uarm

        hand = edit_bones.new(f"Hand.{suffix}")
        hand.head = (side_sign * 0.30, 0.015, 0.82)
        hand.tail = (side_sign * 0.32, 0.020, 0.72)
        hand.parent = farm

        thigh = edit_bones.new(f"Thigh.{suffix}")
        thigh.head = (side_sign * 0.09, 0, 0.78)
        thigh.tail = (side_sign * 0.08, 0, 0.44)
        thigh.parent = pelvis

        calf = edit_bones.new(f"Calf.{suffix}")
        calf.head = (side_sign * 0.08, 0, 0.44)
        calf.tail = (side_sign * 0.076, 0, 0.08)
        calf.parent = thigh

        foot = edit_bones.new(f"Foot.{suffix}")
        foot.head = (side_sign * 0.076, 0, 0.08)
        foot.tail = (side_sign * 0.076, 0.14, 0.02)
        foot.parent = calf

    bpy.ops.object.mode_set(mode='OBJECT')

    body_obj.parent = arm_obj
    mod = body_obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm_obj

    return arm_obj

rig_obj = build_armature(body_obj)
print("Armature rig built.")

# ----------------------------------------------------------------------
# 9. STUDIO LIGHTING & CAMERAS
# ----------------------------------------------------------------------
def setup_lighting_and_cameras():
    key_light_data = bpy.data.lights.new(name="Light_Key", type='AREA')
    key_light_data.energy = 800.0
    key_light_data.size = 1.8
    key_light = bpy.data.objects.new(name="Light_Key", object_data=key_light_data)
    key_light.location = (1.5, 2.2, 2.4)
    key_light.rotation_euler = (math.radians(-35), math.radians(25), math.radians(-30))
    collections["LIGHTS"].objects.link(key_light)

    fill_light_data = bpy.data.lights.new(name="Light_Fill", type='AREA')
    fill_light_data.energy = 350.0
    fill_light_data.size = 2.4
    fill_light = bpy.data.objects.new(name="Light_Fill", object_data=fill_light_data)
    fill_light.location = (-1.8, 1.8, 1.6)
    fill_light.rotation_euler = (math.radians(-25), math.radians(-35), math.radians(30))
    collections["LIGHTS"].objects.link(fill_light)

    rim_light_data = bpy.data.lights.new(name="Light_Rim", type='SPOT')
    rim_light_data.energy = 550.0
    rim_light_data.spot_size = math.radians(45)
    rim_light = bpy.data.objects.new(name="Light_Rim", object_data=rim_light_data)
    rim_light.location = (0.4, -1.8, 2.3)
    rim_light.rotation_euler = (math.radians(145), 0, math.radians(-10))
    collections["LIGHTS"].objects.link(rim_light)

    cameras = {}
    cam_configs = [
        ("Camera_Front", (0, 3.2, 1.15), (math.radians(90), 0, math.radians(180)), 50.0),
        ("Camera_ThreeQuarter", (1.6, 2.6, 1.25), (math.radians(82), 0, math.radians(150)), 50.0),
        ("Camera_Profile", (3.0, 0, 1.25), (math.radians(90), 0, math.radians(90)), 65.0),
        ("Camera_FaceCloseUp", (0, 1.1, 1.60), (math.radians(90), 0, math.radians(180)), 85.0)
    ]

    for name, loc, rot, fov in cam_configs:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = fov
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        collections["CAMERAS"].objects.link(cam_obj)
        cameras[name] = cam_obj

    bpy.context.scene.camera = cameras["Camera_Front"]
    return cameras

cameras = setup_lighting_and_cameras()
print("Studio lighting and cameras established.")

# ----------------------------------------------------------------------
# 10. VISUAL QA RENDERS
# ----------------------------------------------------------------------
def render_inspection_views(cameras):
    scene = bpy.context.scene
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.image_settings.file_format = 'PNG'

    render_targets = [
        ("Camera_Front", "solenne_render_front.png"),
        ("Camera_ThreeQuarter", "solenne_render_three_quarter.png"),
        ("Camera_Profile", "solenne_render_profile.png"),
        ("Camera_FaceCloseUp", "solenne_render_face_closeup.png")
    ]

    for cam_name, filename in render_targets:
        if cam_name in cameras:
            scene.camera = cameras[cam_name]
            out_path = os.path.join(RENDERS_DIR, filename)
            scene.render.filepath = out_path
            print(f"Rendering {cam_name} to {out_path}...")
            bpy.ops.render.render(write_still=True)
            print(f"Rendered {filename} ({os.path.getsize(out_path)} bytes)")

render_inspection_views(cameras)

# ----------------------------------------------------------------------
# 11. SAVE BLEND & EXPORT PRODUCTION GLB
# ----------------------------------------------------------------------
def export_production_assets():
    print(f"Saving Blender source file to {BLEND_PATH}...")
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

    print(f"Exporting production GLB asset to {EXPORT_PATH}...")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=EXPORT_PATH,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_morph=True,
        export_skins=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False
    )
    print(f"GLB Export Complete: {EXPORT_PATH} ({os.path.getsize(EXPORT_PATH)} bytes)")

export_production_assets()
print("=== Solenne Character Production Complete ===")
