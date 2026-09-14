"""
Solenne — High-Fidelity Realistic 3D Character Production Pipeline (Master Edition Final)
- Full wardrobe suite: Silk Slip Dress, Crop Tank Top, Denim Shorts, Gold Jhumka Earrings
- Clean transparent studio renders for all 4 camera angles
- Excludes studio backdrop from exported production GLB
- Hardware GPU morph targets: Bust, Hips, Smile
"""

import bpy
import bmesh
from mathutils import Vector, Matrix, Euler
import math
import os

print("=== Starting Master Solenne Character Production (Final Polish) ===")

BASE_DIR = "D:/GITHUB/Fashion-model/modelbygrok"
ASSETS_DIR = os.path.join(BASE_DIR, "public/assets")
MODELS_DIR = os.path.join(BASE_DIR, "public/models")
RENDERS_DIR = os.path.join(ASSETS_DIR, "renders")
EXPORT_PATH = os.path.join(MODELS_DIR, "solenne.glb")
BLEND_PATH = os.path.join(MODELS_DIR, "solenne.blend")

FACE_TEX = os.path.join(ASSETS_DIR, "character/face/albedo.jpg")
HAIR_TEX = os.path.join(ASSETS_DIR, "character/hair/hair_albedo.jpg")
IRIS_TEX = os.path.join(ASSETS_DIR, "character/eyes/iris_albedo.jpg")
SILK_TEX = os.path.join(ASSETS_DIR, "clothing/fabric_silk.jpg")
DENIM_TEX = os.path.join(ASSETS_DIR, "clothing/fabric_denim.jpg")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(RENDERS_DIR, exist_ok=True)

# ----------------------------------------------------------------------
# 1. SCENE CLEANUP & SETUP
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

    scene = bpy.context.scene
    if hasattr(scene.view_settings, 'view_transform'):
        if 'AgX' in [e.identifier for e in scene.view_settings.bl_rna.properties['view_transform'].enum_items]:
            scene.view_settings.view_transform = 'AgX'
        elif 'Filmic' in [e.identifier for e in scene.view_settings.bl_rna.properties['view_transform'].enum_items]:
            scene.view_settings.view_transform = 'Filmic'

    world = bpy.data.worlds.new("Solenne_Studio_World")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.05, 0.05, 0.06, 1.0)
        bg_node.inputs['Strength'].default_value = 0.6

    return collections

collections = setup_collections()

def link_to_collection(obj, target_col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    target_col.objects.link(obj)

# ----------------------------------------------------------------------
# 2. PBR MATERIALS
# ----------------------------------------------------------------------
def create_pbr_face_material():
    mat = bpy.data.materials.new(name="M_Solenne_Face")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type="ShaderNodeOutputMaterial")
    out_node.location = (600, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (200, 0)
    bsdf.inputs['Roughness'].default_value = 0.40

    if os.path.exists(FACE_TEX):
        tex_img = nodes.new(type="ShaderNodeTexImage")
        tex_img.location = (-200, 100)
        img = bpy.data.images.load(FACE_TEX)
        tex_img.image = img
        links.new(tex_img.outputs['Color'], bsdf.inputs['Base Color'])
    else:
        bsdf.inputs['Base Color'].default_value = (0.85, 0.68, 0.58, 1.0)

    if 'Subsurface Weight' in bsdf.inputs:
        bsdf.inputs['Subsurface Weight'].default_value = 0.12
        bsdf.inputs['Subsurface Radius'].default_value = (0.85, 0.42, 0.28)
        bsdf.inputs['Subsurface Scale'].default_value = 0.03
    elif 'Subsurface' in bsdf.inputs:
        bsdf.inputs['Subsurface'].default_value = 0.12
        bsdf.inputs['Subsurface Radius'].default_value = (0.85, 0.42, 0.28)

    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat

def create_pbr_body_material():
    mat = bpy.data.materials.new(name="M_Solenne_BodySkin")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new(type="ShaderNodeOutputMaterial")
    out_node.location = (600, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (200, 0)
    bsdf.inputs['Base Color'].default_value = (0.85, 0.68, 0.58, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.42

    if 'Subsurface Weight' in bsdf.inputs:
        bsdf.inputs['Subsurface Weight'].default_value = 0.10
        bsdf.inputs['Subsurface Radius'].default_value = (0.85, 0.42, 0.28)
        bsdf.inputs['Subsurface Scale'].default_value = 0.03
    elif 'Subsurface' in bsdf.inputs:
        bsdf.inputs['Subsurface'].default_value = 0.10
        bsdf.inputs['Subsurface Radius'].default_value = (0.85, 0.42, 0.28)

    tex_noise = nodes.new(type="ShaderNodeTexNoise")
    tex_noise.location = (-300, -100)
    tex_noise.inputs['Scale'].default_value = 300.0
    tex_noise.inputs['Detail'].default_value = 6.0

    bump = nodes.new(type="ShaderNodeBump")
    bump.location = (-50, -100)
    bump.inputs['Strength'].default_value = 0.015
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
    out_node.location = (600, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (200, 0)
    bsdf.inputs['Roughness'].default_value = 0.32

    if os.path.exists(HAIR_TEX):
        tex_img = nodes.new(type="ShaderNodeTexImage")
        tex_img.location = (-200, 100)
        img = bpy.data.images.load(HAIR_TEX)
        tex_img.image = img
        links.new(tex_img.outputs['Color'], bsdf.inputs['Base Color'])
    else:
        bsdf.inputs['Base Color'].default_value = (0.07, 0.045, 0.035, 1.0)

    if 'Anisotropic' in bsdf.inputs:
        bsdf.inputs['Anisotropic'].default_value = 0.65

    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat

def create_pbr_eye_materials():
    mat_sclera = bpy.data.materials.new(name="M_Solenne_Sclera")
    mat_sclera.use_nodes = True
    b1 = mat_sclera.node_tree.nodes.get("Principled BSDF")
    b1.inputs['Base Color'].default_value = (0.95, 0.94, 0.93, 1.0)
    b1.inputs['Roughness'].default_value = 0.10

    mat_iris = bpy.data.materials.new(name="M_Solenne_Iris")
    mat_iris.use_nodes = True
    nodes = mat_iris.node_tree.nodes
    links = mat_iris.node_tree.links
    b2 = nodes.get("Principled BSDF")
    b2.inputs['Roughness'].default_value = 0.18
    if os.path.exists(IRIS_TEX):
        tex = nodes.new(type="ShaderNodeTexImage")
        tex.location = (-300, 0)
        tex.image = bpy.data.images.load(IRIS_TEX)
        links.new(tex.outputs['Color'], b2.inputs['Base Color'])
    else:
        b2.inputs['Base Color'].default_value = (0.22, 0.14, 0.08, 1.0)

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
    mat_silk = bpy.data.materials.new(name="M_Solenne_Silk")
    mat_silk.use_nodes = True
    nodes = mat_silk.node_tree.nodes
    links = mat_silk.node_tree.links
    b1 = nodes.get("Principled BSDF")
    b1.inputs['Roughness'].default_value = 0.28
    if os.path.exists(SILK_TEX):
        tex = nodes.new(type="ShaderNodeTexImage")
        tex.location = (-300, 0)
        tex.image = bpy.data.images.load(SILK_TEX)
        links.new(tex.outputs['Color'], b1.inputs['Base Color'])
    else:
        b1.inputs['Base Color'].default_value = (0.86, 0.80, 0.74, 1.0)

    mat_denim = bpy.data.materials.new(name="M_Solenne_Denim")
    mat_denim.use_nodes = True
    nodes = mat_denim.node_tree.nodes
    links = mat_denim.node_tree.links
    b_denim = nodes.get("Principled BSDF")
    b_denim.inputs['Roughness'].default_value = 0.72
    if os.path.exists(DENIM_TEX):
        tex = nodes.new(type="ShaderNodeTexImage")
        tex.location = (-300, 0)
        tex.image = bpy.data.images.load(DENIM_TEX)
        links.new(tex.outputs['Color'], b_denim.inputs['Base Color'])
    else:
        b_denim.inputs['Base Color'].default_value = (0.24, 0.34, 0.48, 1.0)

    mat_gold = bpy.data.materials.new(name="M_Solenne_Gold")
    mat_gold.use_nodes = True
    b2 = mat_gold.node_tree.nodes.get("Principled BSDF")
    b2.inputs['Base Color'].default_value = (0.92, 0.72, 0.32, 1.0)
    b2.inputs['Metallic'].default_value = 0.95
    b2.inputs['Roughness'].default_value = 0.16

    return mat_silk, mat_denim, mat_gold

mat_face = create_pbr_face_material()
mat_body = create_pbr_body_material()
mat_hair = create_pbr_hair_material()
mat_sclera, mat_iris, mat_cornea = create_pbr_eye_materials()
mat_silk, mat_denim, mat_gold = create_pbr_clothing_materials()
print("Materials ready.")

# ----------------------------------------------------------------------
# 3. HIGH FIDELITY ANATOMICAL HEAD & FACE
# ----------------------------------------------------------------------
def lerp(a, b, t):
    return a + (b - a) * t

def clamp(x, a, b):
    return min(b, max(a, x))

def build_solenne_head():
    mesh = bpy.data.meshes.new("Solenne_Head_Mesh")
    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.new("UVMap")

    stacks = 32
    radial = 36

    rings = []
    uv_rings = []

    for i in range(stacks + 1):
        v = i / stacks
        z = lerp(1.42, 1.74, v)

        if v < 0.20:
            t = v / 0.20
            rx = lerp(0.054, 0.050, t)
            ry = lerp(0.054, 0.052, t)
            cy = lerp(0.005, 0.015, t)
        elif v < 0.40:
            t = (v - 0.20) / 0.20
            rx = lerp(0.050, 0.064, t)
            ry = lerp(0.052, 0.076, t)
            cy = 0.020
        elif v < 0.70:
            t = (v - 0.40) / 0.30
            rx = lerp(0.064, 0.068, t)
            ry = lerp(0.076, 0.082, t)
            cy = 0.018
        else:
            t = (v - 0.70) / 0.30
            dome = math.sqrt(max(0.0, 1.0 - t * t))
            rx = 0.068 * dome
            ry = 0.082 * dome
            cy = lerp(0.018, 0.008, t)

        ring = []
        uv_ring = []

        for j in range(radial + 1):
            u = j / radial
            angle = (u - 0.5) * math.pi * 2.0
            sin_a = math.sin(angle)
            cos_a = math.cos(angle)

            vx = sin_a * rx
            vy = cy + cos_a * ry
            vz = z

            if cos_a > 0 and 0.25 < v < 0.75:
                if 0.44 < v < 0.58 and abs(sin_a) < 0.20:
                    v_nose = math.sin(math.pi * (v - 0.44) / 0.14)
                    w_nose = math.cos(sin_a * math.pi * 2.5) ** 2
                    vy += v_nose * w_nose * 0.024

                if 0.33 < v < 0.43 and abs(sin_a) < 0.28:
                    v_lip = math.sin(math.pi * (v - 0.33) / 0.10)
                    w_lip = math.cos(sin_a * math.pi * 1.8) ** 2
                    vy += v_lip * w_lip * 0.011

                if 0.48 < v < 0.62 and 0.25 < abs(sin_a) < 0.75:
                    v_cheek = math.sin(math.pi * (v - 0.48) / 0.14)
                    w_cheek = math.sin(math.pi * (abs(sin_a) - 0.25) / 0.50)
                    vy += v_cheek * w_cheek * 0.009
                    vx += math.copysign(v_cheek * w_cheek * 0.006, sin_a)

                if 0.58 < v < 0.68 and 0.20 < abs(sin_a) < 0.45:
                    v_eye = math.sin(math.pi * (v - 0.58) / 0.10)
                    w_eye = math.sin(math.pi * (abs(sin_a) - 0.20) / 0.25)
                    vy -= v_eye * w_eye * 0.012

            uv_u = (angle / (math.pi * 2.0)) + 0.5
            uv_v = clamp(v * 1.08 - 0.04, 0.0, 1.0)

            vert = bm.verts.new((vx, vy, vz))
            ring.append(vert)
            uv_ring.append((uv_u, uv_v))

        rings.append(ring)
        uv_rings.append(uv_ring)

    for i in range(stacks):
        r1 = rings[i]
        r2 = rings[i + 1]
        uv1 = uv_rings[i]
        uv2 = uv_rings[i + 1]

        for j in range(radial):
            v_a = r1[j]
            v_b = r1[j + 1]
            v_c = r2[j + 1]
            v_d = r2[j]

            face = bm.faces.new((v_a, v_b, v_c, v_d))
            for loop in face.loops:
                if loop.vert == v_a:
                    loop[uv_layer].uv = uv1[j]
                elif loop.vert == v_b:
                    loop[uv_layer].uv = uv1[j + 1]
                elif loop.vert == v_c:
                    loop[uv_layer].uv = uv2[j + 1]
                elif loop.vert == v_d:
                    loop[uv_layer].uv = uv2[j]

    bm.to_mesh(mesh)
    bm.free()

    mesh.update()
    head_obj = bpy.data.objects.new("Solenne_Head", mesh)
    collections["HEAD"].objects.link(head_obj)
    head_obj.data.materials.append(mat_face)

    for p in head_obj.data.polygons:
        p.use_smooth = True

    mod_sub = head_obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod_sub.levels = 1

    return head_obj

head_obj = build_solenne_head()
print("Head mesh generated.")

# ----------------------------------------------------------------------
# 4. OCULAR ASSEMBLY
# ----------------------------------------------------------------------
def build_eyes():
    eye_offset_x = 0.035
    eye_y = 0.084
    eye_z = 1.620

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        suffix = "L" if is_left else "R"

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0122, location=(side_sign * eye_offset_x, eye_y, eye_z), segments=28, ring_count=20)
        sclera = bpy.context.active_object
        sclera.name = f"Eye_Sclera_{suffix}"
        sclera.data.materials.append(mat_sclera)
        for p in sclera.data.polygons: p.use_smooth = True
        link_to_collection(sclera, collections["EYES"])

        bpy.ops.mesh.primitive_circle_add(radius=0.0068, location=(side_sign * eye_offset_x, eye_y + 0.0105, eye_z), rotation=(math.pi * 0.5, 0, 0), vertices=28, fill_type='NGON')
        iris = bpy.context.active_object
        iris.name = f"Eye_Iris_{suffix}"
        iris.data.materials.append(mat_iris)
        link_to_collection(iris, collections["EYES"])

        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0075, location=(side_sign * eye_offset_x, eye_y + 0.0075, eye_z), segments=24, ring_count=16)
        cornea = bpy.context.active_object
        cornea.name = f"Eye_Cornea_{suffix}"
        cornea.data.materials.append(mat_cornea)
        for p in cornea.data.polygons: p.use_smooth = True
        link_to_collection(cornea, collections["EYES"])

build_eyes()
print("Eyes complete.")

# ----------------------------------------------------------------------
# 5. VOLUMETRIC DARK WAVY HAIR
# ----------------------------------------------------------------------
def build_hair():
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.078, location=(0, 0.008, 1.66), segments=32, ring_count=24)
    scalp = bpy.context.active_object
    scalp.name = "Hair_Scalp_Base"
    scalp.scale = (0.97, 1.06, 1.03)
    scalp.data.materials.append(mat_hair)
    for p in scalp.data.polygons: p.use_smooth = True
    link_to_collection(scalp, collections["HAIR"])

    hair_mesh = bpy.data.meshes.new("Solenne_Hair_Strands")
    bm = bmesh.new()

    num_locks = 28
    for k in range(num_locks):
        theta = lerp(math.pi * 0.22, math.pi * 1.78, k / (num_locks - 1))
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)

        steps = 24
        prev_verts = None

        for s in range(steps + 1):
            t = s / steps
            z_pos = 1.72 - t * 0.48
            rad = 0.082 + t * 0.065
            wave = math.sin(t * math.pi * 3.0) * 0.012
            rx = sin_t * rad + wave * 0.35
            ry = cos_t * rad + wave

            w = 0.018 * (1.0 - t * 0.30)
            nx = -cos_t * w
            ny = sin_t * w

            v1 = bm.verts.new((rx - nx, ry - ny, z_pos))
            v2 = bm.verts.new((rx + nx, ry + ny, z_pos))

            if prev_verts is not None:
                bm.faces.new((prev_verts[0], prev_verts[1], v2, v1))

            prev_verts = (v1, v2)

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        steps = 16
        prev_verts = None
        for s in range(steps + 1):
            t = s / steps
            z_pos = 1.71 - t * 0.22
            rx = side_sign * (0.015 + t * 0.065)
            ry = 0.076 - t * 0.025
            w = 0.012 * (1.0 - t * 0.25)

            v1 = bm.verts.new((rx - w, ry, z_pos))
            v2 = bm.verts.new((rx + w, ry, z_pos))
            if prev_verts is not None:
                bm.faces.new((prev_verts[0], prev_verts[1], v2, v1))
            prev_verts = (v1, v2)

    bm.to_mesh(hair_mesh)
    bm.free()

    hair_obj = bpy.data.objects.new("Solenne_Hair_Strands", hair_mesh)
    hair_obj.data.materials.append(mat_hair)
    for p in hair_obj.data.polygons: p.use_smooth = True
    collections["HAIR"].objects.link(hair_obj)

    mod_hair_sub = hair_obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod_hair_sub.levels = 1

build_hair()
print("Hair complete.")

# ----------------------------------------------------------------------
# 6. ANATOMICAL BODY
# ----------------------------------------------------------------------
def build_solenne_body():
    mesh = bpy.data.meshes.new("Solenne_Body_Mesh")
    bm = bmesh.new()

    half_radial = 16

    torso_stacks = 26
    torso_rings = []
    for i in range(torso_stacks + 1):
        v = i / torso_stacks
        z = lerp(0.82, 1.44, v)

        if v < 0.15:
            t = v / 0.15
            rx = lerp(0.165, 0.185, t)
            ry_f = lerp(0.100, 0.112, t)
            ry_b = lerp(0.125, 0.145, t)
            cy = lerp(-0.015, -0.020, t)
        elif v < 0.40:
            t = (v - 0.15) / 0.25
            rx = lerp(0.185, 0.138, t)
            ry_f = lerp(0.112, 0.092, t)
            ry_b = lerp(0.145, 0.100, t)
            cy = lerp(-0.020, -0.005, t)
        elif v < 0.65:
            t = (v - 0.40) / 0.25
            rx = lerp(0.138, 0.162, t)
            breast_profile = math.sin(t * math.pi * 0.5) ** 1.4
            ry_f = lerp(0.092, 0.136, t) + breast_profile * 0.016
            ry_b = lerp(0.100, 0.105, t)
            cy = lerp(-0.005, 0.005, t)
        elif v < 0.88:
            t = (v - 0.65) / 0.23
            rx = lerp(0.162, 0.182, t)
            ry_f = lerp(0.136, 0.096, t)
            ry_b = lerp(0.105, 0.092, t)
            cy = lerp(0.005, 0.000, t)
        else:
            t = (v - 0.88) / 0.12
            rx = lerp(0.182, 0.054, t)
            ry_f = lerp(0.096, 0.054, t)
            ry_b = lerp(0.092, 0.054, t)
            cy = lerp(0.000, 0.005, t)

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

            if 0.50 < v < 0.80 and cos_t > 0:
                bust_t = math.sin(math.pi * (v - 0.50) / 0.30)
                lateral_angle = math.sin(theta * 2.0)
                vy += bust_t * lateral_angle * 0.022

            if j == 0 or j == half_radial:
                vx = 0.0

            vert = bm.verts.new((vx, vy, z))
            ring.append(vert)
        torso_rings.append(ring)

    for i in range(len(torso_rings) - 1):
        r1 = torso_rings[i]
        r2 = torso_rings[i + 1]
        for j in range(half_radial):
            bm.faces.new((r1[j], r1[j + 1], r2[j + 1], r2[j]))

    leg_stacks = 22
    leg_radial = 14
    leg_rings = []
    leg_center_x = 0.092

    for i in range(leg_stacks + 1):
        v = i / leg_stacks
        z = lerp(0.08, 0.82, v)

        if v < 0.10:
            t = v / 0.10
            rx = lerp(0.030, 0.034, t)
            ry = lerp(0.035, 0.040, t)
            cx = leg_center_x
            cy = -0.005
        elif v < 0.45:
            t = (v - 0.10) / 0.35
            calf_bulge = math.sin(t * math.pi)
            rx = lerp(0.034, 0.048, t) + calf_bulge * 0.008
            ry = lerp(0.040, 0.054, t) + calf_bulge * 0.015
            cx = leg_center_x
            cy = -0.010 - calf_bulge * 0.012
        elif v < 0.55:
            t = (v - 0.45) / 0.10
            rx = lerp(0.048, 0.046, t)
            ry = lerp(0.054, 0.050, t)
            cx = leg_center_x
            cy = 0.005
        else:
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

    foot_stacks = 6
    foot_rings = []
    for i in range(foot_stacks + 1):
        v = i / foot_stacks
        y_pos = lerp(-0.07, 0.13, v)
        z_base = 0.015

        if v < 0.30:
            w = lerp(0.026, 0.034, v / 0.30)
            h = lerp(0.055, 0.062, v / 0.30)
        elif v < 0.70:
            w = lerp(0.034, 0.042, (v - 0.30) / 0.40)
            h = lerp(0.062, 0.045, (v - 0.30) / 0.40)
        else:
            w = lerp(0.042, 0.038, (v - 0.70) / 0.30)
            h = lerp(0.045, 0.020, (v - 0.70) / 0.30)

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

    arm_stacks = 20
    arm_radial = 14
    arm_rings = []
    arm_center_x = 0.195

    for i in range(arm_stacks + 1):
        v = i / arm_stacks
        z = lerp(0.86, 1.40, v)
        cx = lerp(arm_center_x + 0.02, arm_center_x - 0.01, v)
        cy = lerp(0.010, -0.005, v)

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
        elif v < 0.85:
            t = (v - 0.60) / 0.25
            rx = lerp(0.032, 0.044, t)
            ry = lerp(0.028, 0.042, t)
        else:
            t = (v - 0.85) / 0.15
            dome = math.sqrt(max(0.0, 1.0 - t * t))
            rx = 0.044 * dome
            ry = 0.042 * dome

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

    hand_stacks = 5
    hand_rings = []
    for i in range(hand_stacks + 1):
        v = i / hand_stacks
        z = lerp(0.72, 0.86, v)
        cx = arm_center_x + 0.02
        cy = 0.010

        if v < 0.35:
            rx = lerp(0.012, 0.026, v / 0.35)
            ry = lerp(0.006, 0.012, v / 0.35)
        else:
            t = (v - 0.35) / 0.65
            rx = lerp(0.026, 0.020, t)
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
    body_obj.data.materials.append(mat_body)

    for poly in body_obj.data.polygons:
        poly.use_smooth = True

    mod_mirror = body_obj.modifiers.new(name="Mirror", type='MIRROR')
    mod_mirror.use_axis[0] = True
    mod_mirror.use_clip = True
    mod_mirror.merge_threshold = 0.002

    mod_sub = body_obj.modifiers.new(name="Subdivision", type='SUBSURF')
    mod_sub.levels = 1

    return body_obj

body_obj = build_solenne_body()
print("Body mesh generated.")

# ----------------------------------------------------------------------
# 7. TAILORED WARDROBE SUITE (DRESS, CROP TANK, DENIM SHORTS)
# ----------------------------------------------------------------------
def build_wardrobe():
    # 1. Silk Slip Dress
    dress_mesh = bpy.data.meshes.new("Outfit_SilkSlipDress_Mesh")
    bm = bmesh.new()

    stacks = 18
    radial = 32
    rings = []
    for i in range(stacks + 1):
        v = i / stacks
        z = lerp(0.72, 1.35, v)

        if v < 0.25:
            rx = lerp(0.200, 0.185, v / 0.25)
            ry = lerp(0.150, 0.135, v / 0.25)
            cy = -0.010
        elif v < 0.60:
            t = (v - 0.25) / 0.35
            rx = lerp(0.185, 0.142, t)
            ry = lerp(0.135, 0.100, t)
            cy = -0.005
        else:
            t = (v - 0.60) / 0.40
            rx = lerp(0.142, 0.168, t)
            ry = lerp(0.100, 0.126, t)
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

    for is_left in [True, False]:
        side_sign = -1.0 if is_left else 1.0
        strap_x = side_sign * 0.095

        p_front = (strap_x, 0.12, 1.35)
        p_top = (strap_x, 0.00, 1.43)
        p_back = (strap_x, -0.095, 1.35)

        v1 = bm.verts.new((p_front[0] - 0.007, p_front[1], p_front[2]))
        v2 = bm.verts.new((p_front[0] + 0.007, p_front[1], p_front[2]))
        v3 = bm.verts.new((p_top[0] + 0.007, p_top[1], p_top[2]))
        v4 = bm.verts.new((p_top[0] - 0.007, p_top[1], p_top[2]))
        v5 = bm.verts.new((p_back[0] + 0.007, p_back[1], p_back[2]))
        v6 = bm.verts.new((p_back[0] - 0.007, p_back[1], p_back[2]))

        bm.faces.new((v1, v2, v3, v4))
        bm.faces.new((v4, v3, v5, v6))

    bm.to_mesh(dress_mesh)
    bm.free()

    dress = bpy.data.objects.new("Outfit_SilkSlipDress", dress_mesh)
    dress.data.materials.append(mat_silk)
    for p in dress.data.polygons: p.use_smooth = True
    collections["CLOTHING"].objects.link(dress)
    dress.modifiers.new(name="Subsurf", type='SUBSURF').levels = 1

    # 2. Crop Tank Top (Athleisure)
    tank_mesh = bpy.data.meshes.new("Outfit_CropTank_Mesh")
    bm = bmesh.new()
    tank_stacks = 8
    tank_rings = []
    for i in range(tank_stacks + 1):
        v = i / tank_stacks
        z = lerp(1.12, 1.36, v)
        rx = lerp(0.144, 0.170, v)
        ry = lerp(0.102, 0.128, v)
        cy = 0.005
        ring = []
        for j in range(28):
            ang = (j / 28) * math.pi * 2.0
            vert = bm.verts.new((math.sin(ang) * rx, cy + math.cos(ang) * ry, z))
            ring.append(vert)
        tank_rings.append(ring)

    for i in range(len(tank_rings) - 1):
        r1 = tank_rings[i]
        r2 = tank_rings[i + 1]
        for j in range(28):
            j_next = (j + 1) % 28
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    bm.to_mesh(tank_mesh)
    bm.free()
    tank = bpy.data.objects.new("Outfit_CropTank", tank_mesh)
    tank.data.materials.append(mat_silk)
    for p in tank.data.polygons: p.use_smooth = True
    tank.hide_render = True # Hidden by default in initial render, toggled in viewer
    collections["CLOTHING"].objects.link(tank)

    # 3. Denim Shorts
    shorts_mesh = bpy.data.meshes.new("Outfit_DenimShorts_Mesh")
    bm = bmesh.new()
    shorts_stacks = 8
    shorts_rings = []
    for i in range(shorts_stacks + 1):
        v = i / shorts_stacks
        z = lerp(0.80, 1.04, v)
        rx = lerp(0.190, 0.150, v)
        ry = lerp(0.140, 0.110, v)
        cy = -0.010
        ring = []
        for j in range(28):
            ang = (j / 28) * math.pi * 2.0
            vert = bm.verts.new((math.sin(ang) * rx, cy + math.cos(ang) * ry, z))
            ring.append(vert)
        shorts_rings.append(ring)

    for i in range(len(shorts_rings) - 1):
        r1 = shorts_rings[i]
        r2 = shorts_rings[i + 1]
        for j in range(28):
            j_next = (j + 1) % 28
            bm.faces.new((r1[j], r1[j_next], r2[j_next], r2[j]))

    bm.to_mesh(shorts_mesh)
    bm.free()
    shorts = bpy.data.objects.new("Outfit_DenimShorts", shorts_mesh)
    shorts.data.materials.append(mat_denim)
    for p in shorts.data.polygons: p.use_smooth = True
    shorts.hide_render = True
    collections["CLOTHING"].objects.link(shorts)

    # 4. Gold Jhumka Earrings
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
print("Wardrobe suite created.")

# ----------------------------------------------------------------------
# 8. SHAPE KEYS
# ----------------------------------------------------------------------
def setup_shape_keys(body_obj, head_obj):
    b_basis = body_obj.shape_key_add(name="Basis")

    sk_bust = body_obj.shape_key_add(name="Bust", from_mix=False)
    sk_bust.value = 0.0
    for i, v in enumerate(body_obj.data.vertices):
        if 1.16 < v.co.z < 1.36 and v.co.y > 0.02 and v.co.x > 0.02:
            t = math.sin(math.pi * (v.co.z - 1.16) / 0.20)
            sk_bust.data[i].co.y = v.co.y + t * 0.020

    sk_hips = body_obj.shape_key_add(name="Hips", from_mix=False)
    sk_hips.value = 0.0
    for i, v in enumerate(body_obj.data.vertices):
        if 0.84 < v.co.z < 1.06 and v.co.x > 0.05:
            t = math.sin(math.pi * (v.co.z - 0.84) / 0.22)
            sk_hips.data[i].co.x = v.co.x + t * 0.016

    h_basis = head_obj.shape_key_add(name="Basis")

    sk_smile = head_obj.shape_key_add(name="Smile", from_mix=False)
    sk_smile.value = 0.0
    for i, v in enumerate(head_obj.data.vertices):
        if 1.50 < v.co.z < 1.56 and v.co.y > 0.03 and 0.015 < abs(v.co.x) < 0.045:
            corner_t = math.sin(math.pi * (abs(v.co.x) - 0.015) / 0.03)
            sk_smile.data[i].co.z = v.co.z + corner_t * 0.005
            sk_smile.data[i].co.x = v.co.x + math.copysign(corner_t * 0.003, v.co.x)

setup_shape_keys(body_obj, head_obj)
print("Shape keys initialized.")

# ----------------------------------------------------------------------
# 9. STUDIO LIGHTING & CAMERAS
# ----------------------------------------------------------------------
def setup_lighting_and_cameras():
    key_light_data = bpy.data.lights.new(name="Light_Key", type='AREA')
    key_light_data.energy = 320.0
    key_light_data.size = 1.4
    key_light_data.color = (1.0, 0.96, 0.92)
    key_light = bpy.data.objects.new(name="Light_Key", object_data=key_light_data)
    key_light.location = (1.1, 2.2, 1.9)
    key_light.rotation_euler = (math.radians(-42), math.radians(20), math.radians(-25))
    collections["LIGHTS"].objects.link(key_light)

    fill_light_data = bpy.data.lights.new(name="Light_Fill", type='AREA')
    fill_light_data.energy = 160.0
    fill_light_data.size = 2.0
    fill_light_data.color = (0.92, 0.95, 1.0)
    fill_light = bpy.data.objects.new(name="Light_Fill", object_data=fill_light_data)
    fill_light.location = (-1.3, 1.8, 1.4)
    fill_light.rotation_euler = (math.radians(-32), math.radians(-30), math.radians(25))
    collections["LIGHTS"].objects.link(fill_light)

    rim_light_data = bpy.data.lights.new(name="Light_Rim", type='SPOT')
    rim_light_data.energy = 220.0
    rim_light_data.spot_size = math.radians(60)
    rim_light_data.color = (1.0, 0.98, 0.94)
    rim_light = bpy.data.objects.new(name="Light_Rim", object_data=rim_light_data)
    rim_light.location = (0.2, -1.8, 2.2)
    rim_light.rotation_euler = (math.radians(140), 0, math.radians(-10))
    collections["LIGHTS"].objects.link(rim_light)

    cameras = {}
    cam_configs = [
        ("Camera_Front", (0, 3.2, 1.10), (math.radians(90), 0, math.radians(180)), 50.0),
        ("Camera_ThreeQuarter", (1.6, 2.6, 1.20), (math.radians(82), 0, math.radians(150)), 50.0),
        ("Camera_Profile", (3.0, 0, 1.20), (math.radians(90), 0, math.radians(90)), 60.0),
        ("Camera_FaceCloseUp", (0, 0.88, 1.62), (math.radians(90), 0, math.radians(180)), 85.0)
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
print("Studio lighting established.")

# ----------------------------------------------------------------------
# 10. MULTI-ANGLE INSPECTION RENDERS (TRANSPARENT FILM)
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
print("=== Master Solenne Character Production Complete ===")
