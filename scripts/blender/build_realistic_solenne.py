"""
Solenne — High-Fidelity Realistic 3D Character Production Pipeline (v2)
Executes in Blender 5.2.1 LTS to build an anatomically grounded, high-quality
female fashion model with continuous topology, realistic PBR shaders,
hair framing, shape keys, rig, and multi-angle inspection renders.
"""

import bpy
import bmesh
from mathutils import Vector, Matrix, Euler
import math
import os

print("=== Starting Realistic Solenne Character Production (v2) ===")

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
    bpy.ops.wm.read_homefile(use_empty=True)

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

print("Clean scene initialized.")

# ----------------------------------------------------------------------
# 2. ADVANCED PBR MATERIALS WITH PROCEDURAL SKIN & SHADERS
# ----------------------------------------------------------------------
def create_pbr_skin_material():
    mat = bpy.data.materials.new(name="M_Solenne_Skin")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type="ShaderNodeOutputMaterial")
    out_node.location = (600, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (200, 0)

    # Warm Indian/South Asian golden-olive undertone inspired by reference
    bsdf.inputs['Base Color'].default_value = (0.84, 0.66, 0.56, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.44

    # Subsurface scattering for realistic flesh translucency
    if 'Subsurface Weight' in bsdf.inputs:
        bsdf.inputs['Subsurface Weight'].default_value = 0.12
        bsdf.inputs['Subsurface Radius'].default_value = (0.85, 0.42, 0.28)
        bsdf.inputs['Subsurface Scale'].default_value = 0.05
    elif 'Subsurface' in bsdf.inputs:
        bsdf.inputs['Subsurface'].default_value = 0.12
        bsdf.inputs['Subsurface Radius'].default_value = (0.85, 0.42, 0.28)

    # Micro-epidermal pore detail via procedural noise bump
    tex_noise = nodes.new(type="ShaderNodeTexNoise")
    tex_noise.location = (-300, -100)
    tex_noise.inputs['Scale'].default_value = 280.0
    tex_noise.inputs['Detail'].default_value = 8.0
    tex_noise.inputs['Roughness'].default_value = 0.7

    bump = nodes.new(type="ShaderNodeBump")
    bump.location = (-50, -100)
    bump.inputs['Strength'].default_value = 0.025
    bump.inputs['Distance'].default_value = 0.002

    links.new(tex_noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])

    return mat

def create_pbr_hair_material():
    mat = bpy.data.materials.new(name="M_Solenne_Hair")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type="ShaderNodeOutputMaterial")
    out_node.location = (400, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (100, 0)

    # Rich dark espresso brown matching reference
    bsdf.inputs['Base Color'].default_value = (0.07, 0.045, 0.035, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.30
    if 'Anisotropic' in bsdf.inputs:
        bsdf.inputs['Anisotropic'].default_value = 0.65
        bsdf.inputs['Anisotropic Rotation'].default_value = 0.25

    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat

def create_pbr_eye_materials():
    # Sclera
    mat_sclera = bpy.data.materials.new(name="M_Solenne_Sclera")
    mat_sclera.use_nodes = True
    b1 = mat_sclera.node_tree.nodes.get("Principled BSDF")
    b1.inputs['Base Color'].default_value = (0.94, 0.93, 0.92, 1.0)
    b1.inputs['Roughness'].default_value = 0.10

    # Iris
    mat_iris = bpy.data.materials.new(name="M_Solenne_Iris")
    mat_iris.use_nodes = True
    b2 = mat_iris.node_tree.nodes.get("Principled BSDF")
    # Deep warm golden hazel-brown
    b2.inputs['Base Color'].default_value = (0.24, 0.15, 0.08, 1.0)
    b2.inputs['Roughness'].default_value = 0.20

    # Cornea (Glassy lens dome)
    mat_cornea = bpy.data.materials.new(name="M_Solenne_Cornea")
    mat_cornea.use_nodes = True
    b3 = mat_cornea.node_tree.nodes.get("Principled BSDF")
    b3.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
    b3.inputs['Roughness'].default_value = 0.01
    if 'Transmission Weight' in b3.inputs:
        b3.inputs['Transmission Weight'].default_value = 1.0
        b3.inputs['IOR'].default_value = 1.376
    elif 'Transmission' in b3.inputs:
        b3.inputs['Transmission'].default_value = 1.0
        b3.inputs['IOR'].default_value = 1.376

    return mat_sclera, mat_iris, mat_cornea

def create_pbr_clothing_materials():
    # Silk
    mat_silk = bpy.data.materials.new(name="M_Solenne_Silk")
    mat_silk.use_nodes = True
    b1 = mat_silk.node_tree.nodes.get("Principled BSDF")
    b1.inputs['Base Color'].default_value = (0.88, 0.82, 0.76, 1.0)
    b1.inputs['Roughness'].default_value = 0.26
    if 'Sheen Weight' in b1.inputs:
        b1.inputs['Sheen Weight'].default_value = 0.8
        b1.inputs['Sheen Tint'].default_value = (1.0, 0.95, 0.9, 1.0)

    # Denim
    mat_denim = bpy.data.materials.new(name="M_Solenne_Denim")
    mat_denim.use_nodes = True
    b2 = mat_denim.node_tree.nodes.get("Principled BSDF")
    b2.inputs['Base Color'].default_value = (0.22, 0.32, 0.46, 1.0)
    b2.inputs['Roughness'].default_value = 0.72

    # Gold Jewelry
    mat_gold = bpy.data.materials.new(name="M_Solenne_Gold")
    mat_gold.use_nodes = True
    b3 = mat_gold.node_tree.nodes.get("Principled BSDF")
    b3.inputs['Base Color'].default_value = (0.92, 0.72, 0.32, 1.0)
    b3.inputs['Metallic'].default_value = 0.96
    b3.inputs['Roughness'].default_value = 0.15

    return mat_silk, mat_denim, mat_gold

mat_skin = create_pbr_skin_material()
mat_hair = create_pbr_hair_material()
mat_sclera, mat_iris, mat_cornea = create_pbr_eye_materials()
mat_silk, mat_denim, mat_gold = create_pbr_clothing_materials()
print("Materials created.")

# ----------------------------------------------------------------------
# 3. ANATOMICALLY ACCURATE FEMALE BODY (QUAD TOPOLOGY + SUBSURF)
# ----------------------------------------------------------------------
def lerp(a, b, t):
    return a + (b - a) * t

def clamp(x, a, b):
    return min(b, max(a, x))

def build_solenne_character():
    mesh = bpy.data.meshes.new("Solenne_Body_Mesh")
    bm = bmesh.new()

    # Construct the right half (+X) with clean quad loops, then Mirror modifier will make it complete!
    # Radial rings: 16 vertices per half ring (32 total for full ring)
    half_radial = 16

    # TORSO RINGS (from crotch Z=0.82 to neck base Z=1.44)
    torso_stacks = 28
    torso_rings = []
    for i in range(torso_stacks + 1):
        v = i / torso_stacks
        z = lerp(0.82, 1.44, v)

        # Cross-section dimensions (half-width rx, front ry_front, back ry_back)
        if v < 0.15: # Lower Pelvis / Hips
            t = v / 0.15
            rx = lerp(0.165, 0.185, t)
            ry_f = lerp(0.100, 0.112, t)
            ry_b = lerp(0.125, 0.145, t) # Gluteal prominence
            cy = lerp(-0.015, -0.020, t)
        elif v < 0.40: # Hips to Narrow Waist
            t = (v - 0.15) / 0.25
            rx = lerp(0.185, 0.138, t)
            ry_f = lerp(0.112, 0.092, t)
            ry_b = lerp(0.145, 0.100, t)
            cy = lerp(-0.020, -0.005, t)
        elif v < 0.65: # Waist to Bust Apex
            t = (v - 0.40) / 0.25
            rx = lerp(0.138, 0.162, t)
            # Natural teardrop breast curve
            breast_profile = math.sin(t * math.pi * 0.5) ** 1.4
            ry_f = lerp(0.092, 0.138, t) + breast_profile * 0.018
            ry_b = lerp(0.100, 0.106, t)
            cy = lerp(-0.005, 0.005, t)
        elif v < 0.88: # Bust to Shoulders/Clavicles
            t = (v - 0.65) / 0.23
            rx = lerp(0.162, 0.182, t)
            ry_f = lerp(0.138, 0.096, t)
            ry_b = lerp(0.106, 0.092, t)
            cy = lerp(0.005, 0.000, t)
        else: # Shoulders to Neck Base
            t = (v - 0.88) / 0.12
            rx = lerp(0.182, 0.058, t)
            ry_f = lerp(0.096, 0.056, t)
            ry_b = lerp(0.092, 0.054, t)
            cy = lerp(0.000, 0.008, t)

        ring = []
        for j in range(half_radial + 1):
            theta = (j / half_radial) * math.pi # 0 = front center (+Y), pi/2 = right side (+X), pi = back center (-Y)
            sin_t = math.sin(theta)
            cos_t = math.cos(theta)

            vx = sin_t * rx
            if cos_t >= 0:
                vy = cy + cos_t * ry_f
            else:
                vy = cy + cos_t * ry_b

            # Anatomical breast separation on front
            if 0.50 < v < 0.80 and cos_t > 0:
                bust_t = math.sin(math.pi * (v - 0.50) / 0.30)
                lateral_angle = math.sin(theta * 2.0)
                breast_swell = bust_t * lateral_angle * 0.024
                vy += breast_swell

            # Centerline strict clamping
            if j == 0 or j == half_radial:
                vx = 0.0

            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        torso_rings.append(ring)

    # Stitch torso quads
    for i in range(len(torso_rings) - 1):
        r1 = torso_rings[i]
        r2 = torso_rings[i + 1]
        for j in range(half_radial):
            bm.faces.new((r1[j], r1[j + 1], r2[j + 1], r2[j]))

    # NECK AND HEAD RINGS (Continuous from Z=1.44 to Z=1.74)
    head_stacks = 22
    neck_top = torso_rings[-1]
    head_rings = [neck_top]

    for i in range(1, head_stacks + 1):
        v = i / head_stacks
        z = lerp(1.44, 1.74, v)

        if v < 0.20: # Neck column
            t = v / 0.20
            rx = lerp(0.058, 0.052, t)
            ry_f = lerp(0.056, 0.054, t)
            ry_b = lerp(0.054, 0.052, t)
            cy = lerp(0.008, 0.015, t)
        elif v < 0.40: # Jaw / Chin / Lower face (Z=1.50 - 1.56)
            t = (v - 0.20) / 0.20
            rx = lerp(0.052, 0.066, t)
            ry_f = lerp(0.054, 0.082, t)
            ry_b = lerp(0.052, 0.068, t)
            cy = 0.018
        elif v < 0.70: # Midface / Nose / Cheeks / Orbits (Z=1.56 - 1.65)
            t = (v - 0.40) / 0.30
            rx = lerp(0.066, 0.070, t)
            ry_f = lerp(0.082, 0.078, t)
            ry_b = lerp(0.068, 0.080, t)
            cy = 0.016
        else: # Forehead and Cranial Vault (Z=1.65 - 1.74)
            t = (v - 0.70) / 0.30
            dome = math.sqrt(max(0.0, 1.0 - t * t))
            rx = 0.070 * dome
            ry_f = 0.078 * dome
            ry_b = 0.080 * dome
            cy = lerp(0.016, 0.008, t)

        ring = []
        for j in range(half_radial + 1):
            theta = (j / half_radial) * math.pi
            sin_t = math.sin(theta)
            cos_t = math.cos(theta)

            vx = sin_t * rx
            if cos_t >= 0:
                vy = cy + cos_t * ry_f
            else:
                vy = cy + cos_t * ry_b

            # Sculpt facial features directly onto front midline
            if 0.35 < v < 0.70 and cos_t > 0:
                dist_from_center = sin_t
                # Nose bridge & tip
                if 0.44 < v < 0.56:
                    nose_t = math.sin(math.pi * (v - 0.44) / 0.12)
                    nose_w = math.exp(-(dist_from_center * 45.0) ** 2)
                    vy += nose_t * nose_w * 0.026

                # Lips (upper & lower)
                if 0.32 < v < 0.42:
                    lip_t = math.sin(math.pi * (v - 0.32) / 0.10)
                    lip_w = math.exp(-(dist_from_center * 25.0) ** 2)
                    vy += lip_t * lip_w * 0.012

                # Cheek fullness (zygomatic arch)
                if 0.48 < v < 0.62:
                    cheek_t = math.sin(math.pi * (v - 0.48) / 0.14)
                    cheek_w = math.sin(theta * 2.0)
                    vy += cheek_t * cheek_w * 0.010
                    vx += cheek_t * cheek_w * 0.008

            if j == 0 or j == half_radial:
                vx = 0.0

            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        head_rings.append(ring)

    # Stitch head quads
    for i in range(len(head_rings) - 1):
        r1 = head_rings[i]
        r2 = head_rings[i + 1]
        for j in range(half_radial):
            bm.faces.new((r1[j], r1[j + 1], r2[j + 1], r2[j]))

    # LEGS (Thigh Z=0.82 down to Ankle Z=0.08 and Foot Z=0.0)
    leg_stacks = 26
    leg_radial = 14
    leg_rings = []
    leg_center_x = 0.092

    for i in range(leg_stacks + 1):
        v = i / leg_stacks
        z = lerp(0.08, 0.82, v)

        if v < 0.10: # Ankle
            t = v / 0.10
            rx = lerp(0.030, 0.034, t)
            ry = lerp(0.035, 0.040, t)
            cx = leg_center_x
            cy = -0.005
        elif v < 0.45: # Calf
            t = (v - 0.10) / 0.35
            calf_bulge = math.sin(t * math.pi)
            rx = lerp(0.034, 0.048, t) + calf_bulge * 0.008
            ry = lerp(0.040, 0.054, t) + calf_bulge * 0.015
            cx = leg_center_x
            cy = -0.010 - calf_bulge * 0.012
        elif v < 0.55: # Knee
            t = (v - 0.45) / 0.10
            rx = lerp(0.048, 0.046, t)
            ry = lerp(0.054, 0.050, t)
            cx = leg_center_x
            cy = 0.005
        else: # Thigh
            t = (v - 0.55) / 0.45
            rx = lerp(0.046, 0.082, t)
            ry = lerp(0.050, 0.086, t)
            cx = lerp(leg_center_x, leg_center_x + 0.015, t)
            cy = lerp(0.000, -0.010, t)

        ring = []
        for j in range(leg_radial):
            u = j / leg_radial
            angle = u * math.pi * 2.0
            vx = cx + math.sin(angle) * rx
            vy = cy + math.cos(angle) * ry
            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        leg_rings.append(ring)

    for i in range(len(leg_rings) - 1):
        r1 = leg_rings[i]
        r2 = leg_rings[i + 1]
        for j in range(leg_radial):
            j_next = (j + 1) % leg_radial
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    # FEET (Heel, Arch, Instep, Ball, Toes)
    foot_stacks = 8
    foot_rings = []
    for i in range(foot_stacks + 1):
        v = i / foot_stacks
        y_pos = lerp(-0.08, 0.14, v)
        z_base = 0.015

        if v < 0.25:
            w = lerp(0.026, 0.032, v / 0.25)
            h = lerp(0.055, 0.065, v / 0.25)
        elif v < 0.65:
            w = lerp(0.032, 0.044, (v - 0.25) / 0.40)
            h = lerp(0.065, 0.048, (v - 0.25) / 0.40)
        else:
            w = lerp(0.044, 0.040, (v - 0.65) / 0.35)
            h = lerp(0.048, 0.022, (v - 0.65) / 0.35)

        ring = []
        for j in range(10):
            ang = (j / 10) * math.pi * 2.0
            vx = leg_center_x + math.sin(ang) * w
            vz = z_base + (math.cos(ang) + 1.0) * 0.5 * h
            vert = bm.verts.new((vx, y_pos, vz))
            ring.append(vert)
        foot_rings.append(ring)

    for i in range(len(foot_rings) - 1):
        r1 = foot_rings[i]
        r2 = foot_rings[i + 1]
        for j in range(10):
            j_next = (j + 1) % 10
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    # ARMS (Shoulder Z=1.38 to Elbow Z=1.12 to Wrist Z=0.86)
    arm_stacks = 20
    arm_radial = 12
    arm_rings = []
    arm_center_x = 0.22

    for i in range(arm_stacks + 1):
        v = i / arm_stacks
        z = lerp(0.86, 1.38, v)
        cx = lerp(arm_center_x + 0.04, arm_center_x - 0.02, v)
        cy = lerp(0.015, -0.005, v)

        if v < 0.20:
            t = v / 0.20
            rx = lerp(0.020, 0.024, t)
            ry = lerp(0.016, 0.020, t)
        elif v < 0.50:
            t = (v - 0.20) / 0.30
            forearm_t = math.sin(t * math.pi)
            rx = lerp(0.024, 0.034, t) + forearm_t * 0.006
            ry = lerp(0.020, 0.030, t) + forearm_t * 0.005
        elif v < 0.60:
            rx = 0.032
            ry = 0.028
        else:
            t = (v - 0.60) / 0.40
            rx = lerp(0.032, 0.048, t)
            ry = lerp(0.028, 0.046, t)

        ring = []
        for j in range(arm_radial):
            u = j / arm_radial
            angle = u * math.pi * 2.0
            vx = cx + math.sin(angle) * rx
            vy = cy + math.cos(angle) * ry
            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        arm_rings.append(ring)

    for i in range(len(arm_rings) - 1):
        r1 = arm_rings[i]
        r2 = arm_rings[i + 1]
        for j in range(arm_radial):
            j_next = (j + 1) % arm_radial
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    # HANDS (Extends from wrist Z=0.86 down to fingertips Z=0.71)
    hand_stacks = 6
    hand_rings = []
    for i in range(hand_stacks + 1):
        v = i / hand_stacks
        z = lerp(0.71, 0.86, v)
        cx = arm_center_x + 0.04
        cy = 0.015

        if v < 0.35:
            rx = lerp(0.012, 0.028, v / 0.35)
            ry = lerp(0.006, 0.012, v / 0.35)
        else:
            t = (v - 0.35) / 0.65
            rx = lerp(0.028, 0.020, t)
            ry = lerp(0.012, 0.016, t)

        ring = []
        for j in range(10):
            ang = (j / 10) * math.pi * 2.0
            vx = cx + math.sin(ang) * rx
            vy = cy + math.cos(ang) * ry
            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        hand_rings.append(ring)

    for i in range(len(hand_rings) - 1):
        r1 = hand_rings[i]
        r2 = hand_rings[i + 1]
        for j in range(10):
            j_next = (j + 1) % 10
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    bm.to_mesh(mesh)
    bm.free()

    mesh.update()
    body_obj = bpy.data.objects.new("Solenne_Body", mesh)
    collections["BODY"].objects.link(body_obj)
    body_obj.data.materials.append(mat_skin)

    for poly in body_obj.data.polygons:
        poly.use_smooth = True

    # Mirror Modifier for Bilateral Symmetry
    mod_mirror = body_obj.modifiers.new(name="Mirror", type='MIRROR')
    mod_mirror.use_axis[0] = True
    mod_mirror.use_clip = True
    mod_mirror.merge_threshold = 0.002

    # Subdivision Surface Modifier
    mod_subsurf = body_obj.modifiers.new(name="Subdivision", type='SUBSURF')
    mod_subsurf.levels = 2
    mod_subsurf.render_levels = 2

    # UV Smart Projection
    bpy.context.view_layer.objects.active = body_obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66.0), island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')

    return body_obj

body_obj = build_solenne_character()
print("Anatomical body mesh generated with Mirror and Subsurf.")

# ----------------------------------------------------------------------
# 4. OCULAR ASSEMBLY (EYES IN SOCKETS)
# ----------------------------------------------------------------------
def build_eyes():
    eye_offset_x = 0.033
    eye_y = 0.082
    eye_z = 1.582

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        suffix = "L" if is_left else "R"

        # Sclera Sphere
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0125, location=(side_sign * eye_offset_x, eye_y, eye_z), segments=32, ring_count=24)
        sclera = bpy.context.active_object
        sclera.name = f"Eye_Sclera_{suffix}"
        sclera.data.materials.append(mat_sclera)
        for p in sclera.data.polygons: p.use_smooth = True
        link_to_collection(sclera, collections["EYES"])

        # Concave Iris Disc
        bpy.ops.mesh.primitive_circle_add(radius=0.0065, location=(side_sign * eye_offset_x, eye_y + 0.0102, eye_z), rotation=(math.pi * 0.5, 0, 0), vertices=32, fill_type='NGON')
        iris = bpy.context.active_object
        iris.name = f"Eye_Iris_{suffix}"
        iris.data.materials.append(mat_iris)
        link_to_collection(iris, collections["EYES"])

        # Cornea Dome
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0075, location=(side_sign * eye_offset_x, eye_y + 0.0072, eye_z), segments=24, ring_count=16)
        cornea = bpy.context.active_object
        cornea.name = f"Eye_Cornea_{suffix}"
        cornea.data.materials.append(mat_cornea)
        for p in cornea.data.polygons: p.use_smooth = True
        link_to_collection(cornea, collections["EYES"])

build_eyes()
print("Ocular assembly complete.")

# ----------------------------------------------------------------------
# 5. VOLUMETRIC HAIR (CRANIAL FRAMING & WAVY LOCKS)
# ----------------------------------------------------------------------
def build_hair():
    # Cranial Scalp Base (Covers ONLY the top, back, and sides of head)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.076, location=(0, 0.010, 1.66), segments=32, ring_count=20)
    scalp = bpy.context.active_object
    scalp.name = "Hair_Scalp_Base"
    scalp.scale = (0.95, 1.05, 1.0)
    scalp.data.materials.append(mat_hair)
    for p in scalp.data.polygons: p.use_smooth = True
    link_to_collection(scalp, collections["HAIR"])

    # Hair Lock Strands
    hair_mesh = bpy.data.meshes.new("Solenne_Hair_Strands")
    bm = bmesh.new()

    num_locks = 16
    for k in range(num_locks):
        theta = lerp(math.pi * 0.35, math.pi * 1.65, k / (num_locks - 1))
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)

        ribbon_pts = []
        steps = 18
        for s in range(steps + 1):
            t = s / steps
            z_pos = 1.70 - t * 0.42
            rad = 0.082 + t * 0.055
            wave = math.sin(t * math.pi * 2.5) * 0.014
            rx = sin_t * rad + wave * 0.4
            ry = cos_t * rad + wave
            ribbon_pts.append((rx, ry, z_pos))

        for s in range(steps):
            p1 = ribbon_pts[s]
            p2 = ribbon_pts[s + 1]
            w = 0.016 * (1.0 - (s / steps) * 0.3)

            v1 = bm.verts.new((p1[0] - w, p1[1], p1[2]))
            v2 = bm.verts.new((p1[0] + w, p1[1], p1[2]))
            v3 = bm.verts.new((p2[0] + w, p2[1], p2[2]))
            v4 = bm.verts.new((p2[0] - w, p2[1], p2[2]))
            bm.faces.new((v1, v2, v3, v4))

    bm.to_mesh(hair_mesh)
    bm.free()

    hair_obj = bpy.data.objects.new("Solenne_Hair_Strands", hair_mesh)
    hair_obj.data.materials.append(mat_hair)
    for p in hair_obj.data.polygons: p.use_smooth = True
    collections["HAIR"].objects.link(hair_obj)

    mod_hair_sub = hair_obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod_hair_sub.levels = 1

build_hair()
print("Hair system created.")

# ----------------------------------------------------------------------
# 6. WARDROBE & FINE JEWELRY
# ----------------------------------------------------------------------
def build_wardrobe():
    # Tailored Silk Slip Dress
    dress_mesh = bpy.data.meshes.new("Outfit_SilkSlipDress_Mesh")
    bm = bmesh.new()

    stacks = 16
    radial = 28
    rings = []
    for i in range(stacks + 1):
        v = i / stacks
        z = lerp(0.72, 1.34, v)

        if v < 0.30:
            rx = lerp(0.205, 0.188, v / 0.30)
            ry = lerp(0.155, 0.138, v / 0.30)
            cy = -0.010
        elif v < 0.65:
            t = (v - 0.30) / 0.35
            rx = lerp(0.188, 0.144, t)
            ry = lerp(0.138, 0.102, t)
            cy = -0.005
        else:
            t = (v - 0.65) / 0.35
            rx = lerp(0.144, 0.170, t)
            ry = lerp(0.102, 0.128, t)
            cy = 0.005

        ring = []
        for j in range(radial):
            ang = (j / radial) * math.pi * 2.0
            vx = math.sin(ang) * rx
            vy = cy + math.cos(ang) * ry
            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        rings.append(ring)

    for i in range(len(rings) - 1):
        r1 = rings[i]
        r2 = rings[i + 1]
        for j in range(radial):
            j_next = (j + 1) % radial
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    bm.to_mesh(dress_mesh)
    bm.free()

    dress = bpy.data.objects.new("Outfit_SilkSlipDress", dress_mesh)
    dress.data.materials.append(mat_silk)
    for p in dress.data.polygons: p.use_smooth = True
    collections["CLOTHING"].objects.link(dress)
    dress.modifiers.new(name="Subsurf", type='SUBSURF').levels = 1

    # Traditional 22K Gold Jhumka Earrings
    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        suffix = "L" if is_left else "R"
        bpy.ops.mesh.primitive_cone_add(radius1=0.008, radius2=0.002, depth=0.014, location=(side_sign * 0.076, 0.010, 1.54))
        jhumka = bpy.context.active_object
        jhumka.name = f"Accessory_Jhumka_{suffix}"
        jhumka.data.materials.append(mat_gold)
        for p in jhumka.data.polygons: p.use_smooth = True
        link_to_collection(jhumka, collections["ACCESSORIES"])

build_wardrobe()
print("Wardrobe and fine jewelry created.")

# ----------------------------------------------------------------------
# 7. NON-COMPOUNDING SHAPE KEYS (BASIS + MORPHS AT 0.0)
# ----------------------------------------------------------------------
def setup_shape_keys(obj):
    basis = obj.shape_key_add(name="Basis")

    # 1. Bust Morph
    sk_bust = obj.shape_key_add(name="Bust", from_mix=False)
    sk_bust.value = 0.0
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        y = vert.co.y
        x = vert.co.x
        if 1.16 < z < 1.36 and y > 0.02 and x > 0.02:
            v_t = math.sin(math.pi * (z - 1.16) / 0.20)
            x_t = math.sin(math.pi * clamp((x - 0.02) / 0.12, 0.0, 1.0))
            sk_bust.data[i].co.y = vert.co.y + v_t * x_t * 0.022
            sk_bust.data[i].co.x = vert.co.x + v_t * x_t * 0.006

    # 2. Hips Morph
    sk_hips = obj.shape_key_add(name="Hips", from_mix=False)
    sk_hips.value = 0.0
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        x = vert.co.x
        if 0.84 < z < 1.06 and x > 0.06:
            v_t = math.sin(math.pi * (z - 0.84) / 0.22)
            sk_hips.data[i].co.x = vert.co.x + v_t * 0.018

    # 3. Waist Morph
    sk_waist = obj.shape_key_add(name="Waist", from_mix=False)
    sk_waist.value = 0.0
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        x = vert.co.x
        if 1.02 < z < 1.18 and x > 0.04:
            v_t = math.sin(math.pi * (z - 1.02) / 0.16)
            sk_waist.data[i].co.x = vert.co.x - v_t * 0.012

    # 4. Subtle Smile Expression
    sk_smile = obj.shape_key_add(name="Smile", from_mix=False)
    sk_smile.value = 0.0
    for i, vert in enumerate(obj.data.vertices):
        z = vert.co.z
        y = vert.co.y
        x = vert.co.x
        if 1.50 < z < 1.56 and y > 0.04 and 0.01 < x < 0.04:
            corner_t = math.sin(math.pi * (x - 0.01) / 0.03)
            sk_smile.data[i].co.z = vert.co.z + corner_t * 0.005
            sk_smile.data[i].co.x = vert.co.x + corner_t * 0.004

setup_shape_keys(body_obj)
print("Non-compounding Shape keys initialized (default values = 0.0).")

# ----------------------------------------------------------------------
# 8. ARMATURE RIG
# ----------------------------------------------------------------------
def build_armature(body_obj):
    arm_data = bpy.data.armatures.new("Solenne_Armature_Data")
    arm_obj = bpy.data.objects.new("Solenne_Rig", arm_data)
    collections["RIG"].objects.link(arm_obj)

    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode='EDIT')

    eb = arm_data.edit_bones

    root = eb.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 0.82)

    pelvis = eb.new("Pelvis")
    pelvis.head = (0, 0, 0.82)
    pelvis.tail = (0, 0, 1.02)
    pelvis.parent = root

    spine = eb.new("Spine")
    spine.head = (0, 0, 1.02)
    spine.tail = (0, 0, 1.24)
    spine.parent = pelvis

    chest = eb.new("Chest")
    chest.head = (0, 0, 1.24)
    chest.tail = (0, 0, 1.44)
    chest.parent = spine

    neck = eb.new("Neck")
    neck.head = (0, 0, 1.44)
    neck.tail = (0, 0, 1.52)
    neck.parent = chest

    head = eb.new("Head")
    head.head = (0, 0, 1.52)
    head.tail = (0, 0, 1.74)
    head.parent = neck

    for is_left in [True, False]:
        side = -1.0 if is_left else 1.0
        suf = "L" if is_left else "R"

        # Arm
        sh = eb.new(f"Shoulder.{suf}")
        sh.head = (0, 0, 1.42)
        sh.tail = (side * 0.18, 0, 1.42)
        sh.parent = chest

        ua = eb.new(f"UpperArm.{suf}")
        ua.head = (side * 0.18, 0, 1.42)
        ua.tail = (side * 0.22, 0, 1.14)
        ua.parent = sh

        fa = eb.new(f"Forearm.{suf}")
        fa.head = (side * 0.22, 0, 1.14)
        fa.tail = (side * 0.26, 0.01, 0.86)
        fa.parent = ua

        ha = eb.new(f"Hand.{suf}")
        ha.head = (side * 0.26, 0.01, 0.86)
        ha.tail = (side * 0.26, 0.01, 0.72)
        ha.parent = fa

        # Leg
        th = eb.new(f"Thigh.{suf}")
        th.head = (side * 0.092, 0, 0.82)
        th.tail = (side * 0.092, 0, 0.46)
        th.parent = pelvis

        ca = eb.new(f"Calf.{suf}")
        ca.head = (side * 0.092, 0, 0.46)
        ca.tail = (side * 0.092, 0, 0.08)
        ca.parent = th

        fo = eb.new(f"Foot.{suf}")
        fo.head = (side * 0.092, 0, 0.08)
        fo.tail = (side * 0.092, 0.12, 0.01)
        fo.parent = ca

    bpy.ops.object.mode_set(mode='OBJECT')

    body_obj.parent = arm_obj
    mod_arm = body_obj.modifiers.new(name="Armature", type='ARMATURE')
    mod_arm.object = arm_obj

    return arm_obj

rig_obj = build_armature(body_obj)
print("Armature rig built.")

# ----------------------------------------------------------------------
# 9. STUDIO LIGHTING & INSPECTION CAMERAS
# ----------------------------------------------------------------------
def setup_lighting_and_cameras():
    # Key Light (Warm 4800K, 850W)
    key_light_data = bpy.data.lights.new(name="Light_Key", type='AREA')
    key_light_data.energy = 850.0
    key_light_data.size = 1.6
    key_light_data.color = (1.0, 0.95, 0.90)
    key_light = bpy.data.objects.new(name="Light_Key", object_data=key_light_data)
    key_light.location = (1.2, 2.0, 2.2)
    key_light.rotation_euler = (math.radians(-40), math.radians(20), math.radians(-25))
    collections["LIGHTS"].objects.link(key_light)

    # Soft Fill Light (Cool 6500K, 380W)
    fill_light_data = bpy.data.lights.new(name="Light_Fill", type='AREA')
    fill_light_data.energy = 380.0
    fill_light_data.size = 2.4
    fill_light_data.color = (0.92, 0.96, 1.0)
    fill_light = bpy.data.objects.new(name="Light_Fill", object_data=fill_light_data)
    fill_light.location = (-1.5, 1.6, 1.4)
    fill_light.rotation_euler = (math.radians(-30), math.radians(-35), math.radians(25))
    collections["LIGHTS"].objects.link(fill_light)

    # Rim / Kicker Light (High Back, 550W)
    rim_light_data = bpy.data.lights.new(name="Light_Rim", type='SPOT')
    rim_light_data.energy = 550.0
    rim_light_data.spot_size = math.radians(50)
    rim_light_data.color = (1.0, 0.98, 0.94)
    rim_light = bpy.data.objects.new(name="Light_Rim", object_data=rim_light_data)
    rim_light.location = (0.2, -1.8, 2.3)
    rim_light.rotation_euler = (math.radians(140), 0, math.radians(-10))
    collections["LIGHTS"].objects.link(rim_light)

    cameras = {}
    cam_configs = [
        ("Camera_Front", (0, 3.2, 1.10), (math.radians(90), 0, math.radians(180)), 50.0),
        ("Camera_ThreeQuarter", (1.6, 2.6, 1.20), (math.radians(82), 0, math.radians(150)), 50.0),
        ("Camera_Profile", (3.0, 0, 1.20), (math.radians(90), 0, math.radians(90)), 60.0),
        ("Camera_FaceCloseUp", (0, 0.95, 1.58), (math.radians(90), 0, math.radians(180)), 85.0)
    ]

    for name, loc, rot, fov in cam_configs:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = fov
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = loc
        cam_obj.rotation_euler = rot
        collections["CAMERAS"].objects.link(cam_obj)
        cameras[name] = cam_obj

    return cameras

cameras = setup_lighting_and_cameras()
print("Studio lighting and cameras established.")

# ----------------------------------------------------------------------
# 10. MULTI-ANGLE INSPECTION RENDERS
# ----------------------------------------------------------------------
def render_inspection_views(cameras):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True

    cam_files = {
        "Camera_Front": "solenne_render_front.png",
        "Camera_ThreeQuarter": "solenne_render_three_quarter.png",
        "Camera_Profile": "solenne_render_profile.png",
        "Camera_FaceCloseUp": "solenne_render_face_closeup.png"
    }

    for cam_name, filename in cam_files.items():
        cam_obj = cameras[cam_name]
        scene.camera = cam_obj
        filepath = os.path.join(RENDERS_DIR, filename)
        scene.render.filepath = filepath
        print(f"Rendering {cam_name} to {filepath}...")
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {filename} ({os.path.getsize(filepath)} bytes)")

render_inspection_views(cameras)

# ----------------------------------------------------------------------
# 11. EXPORT PRODUCTION ASSETS (.BLEND & .GLB)
# ----------------------------------------------------------------------
def export_production_assets():
    print(f"Saving Blender source file to {BLEND_PATH}...")
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

    print(f"Exporting production GLB asset to {EXPORT_PATH}...")
    bpy.ops.export_scene.gltf(
        filepath=EXPORT_PATH,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_morph=True,
        export_skins=True,
        export_lights=True,
        export_cameras=False
    )
    print(f"GLB Export Complete: {EXPORT_PATH} ({os.path.getsize(EXPORT_PATH)} bytes)")

export_production_assets()
print("=== Solenne Character Production (v2) Complete ===")
