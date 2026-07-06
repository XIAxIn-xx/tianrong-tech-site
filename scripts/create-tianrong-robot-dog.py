#!/usr/bin/env python3
"""Generate Tianrong customized inspection robot dog GLB.

Run from project root:
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/create-tianrong-robot-dog.py

Optional args:
-- --fbx public/models/source/robot-dog-4k.fbx --glb public/models/source/robot-dog-4k.glb --out public/models/tianrong-robot-dog.glb
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FBX = PROJECT_ROOT / "public/models/source/robot-dog-4k.fbx"
DEFAULT_GLB = PROJECT_ROOT / "public/models/source/robot-dog-4k.glb"
DEFAULT_OUT = PROJECT_ROOT / "public/models/tianrong-robot-dog.glb"


def parse_args():
    raw = sys.argv
    extra = raw[raw.index("--") + 1 :] if "--" in raw else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--fbx", default=str(DEFAULT_FBX))
    parser.add_argument("--glb", default=str(DEFAULT_GLB))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    return parser.parse_args(extra)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def material(name, color, roughness=0.55, metallic=0.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if emission:
            bsdf.inputs["Emission Color"].default_value = emission
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


MAT_BODY = None
MAT_DARK = None
MAT_PANEL = None
MAT_LIGHT = None
MAT_BLUE = None
MAT_TEXT = None


def setup_materials():
    global MAT_BODY, MAT_DARK, MAT_PANEL, MAT_LIGHT, MAT_BLUE, MAT_TEXT
    MAT_BODY = material("TR shell warm white", (0.88, 0.9, 0.88, 1), 0.48, 0.02)
    MAT_DARK = material("TR graphite armor", (0.045, 0.055, 0.065, 1), 0.62, 0.12)
    MAT_PANEL = material("TR dark top cover", (0.09, 0.105, 0.12, 1), 0.5, 0.08)
    MAT_LIGHT = material("TR status light", (0.78, 0.95, 1.0, 1), 0.22, 0.0, (0.55, 0.88, 1.0, 1), 1.25)
    MAT_BLUE = material("TR industrial blue", (0.02, 0.34, 0.68, 1), 0.42, 0.0)
    MAT_TEXT = material("TR marking dark", (0.025, 0.035, 0.045, 1), 0.5, 0.0)


def import_base(fbx_path: Path, glb_path: Path):
    before = set(bpy.data.objects)
    try:
        if fbx_path.exists():
            bpy.ops.import_scene.fbx(filepath=str(fbx_path), automatic_bone_orientation=True)
        else:
            raise FileNotFoundError(fbx_path)
    except Exception as exc:
        print(f"FBX import failed, fallback to GLB: {exc}")
        if not glb_path.exists():
            raise FileNotFoundError(f"No source model found: {fbx_path} or {glb_path}")
        bpy.ops.import_scene.gltf(filepath=str(glb_path))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    if not imported:
        imported = list(bpy.context.scene.objects)
    return imported


def scene_bounds(objects):
    points = []
    for obj in objects:
        if obj.type not in {"MESH", "EMPTY", "ARMATURE"}:
            continue
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))
    if not points:
        return Vector((-1, -1, -1)), Vector((1, 1, 1))
    min_v = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    max_v = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return min_v, max_v


def mirror_missing_legs(objects):
    min_v, max_v = scene_bounds(objects)
    center_x = (min_v.x + max_v.x) / 2
    mirror_empty = bpy.data.objects.new("ARGOS_leg_mirror_center", None)
    bpy.context.collection.objects.link(mirror_empty)
    mirror_empty.location = (center_x, 0, 0)

    for obj in objects:
        if obj.type != "MESH":
            continue
        name = obj.name.lower()
        if "leg" not in name:
            continue
        mod = obj.modifiers.new("ARGOS mirrored opposite leg", "MIRROR")
        mod.use_axis[0] = True
        mod.use_axis[1] = False
        mod.use_axis[2] = False
        mod.use_clip = False
        mod.mirror_object = mirror_empty


def normalize_model(objects):
    min_v, max_v = scene_bounds(objects)
    center = (min_v + max_v) / 2
    size = max(max_v.x - min_v.x, max_v.y - min_v.y, max_v.z - min_v.z)
    scale = 3.2 / size if size else 1
    root = bpy.data.objects.new("Tianrong_Robot_Dog_Root", None)
    bpy.context.collection.objects.link(root)
    for obj in objects:
        if obj.parent is None:
            obj.parent = root
    root.location = -center * scale
    root.scale = (scale, scale, scale)
    bpy.context.view_layer.objects.active = root
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return root


def assign_base_materials():
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        name = obj.name.lower()
        if any(token in name for token in ["leg", "joint", "foot", "wheel", "tire", "black", "arm"]):
            obj.data.materials.clear(); obj.data.materials.append(MAT_DARK)
        else:
            obj.data.materials.clear(); obj.data.materials.append(MAT_BODY)


def mesh_objects():
    return [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]


def body_mesh_objects():
    bodies = [obj for obj in mesh_objects() if "body" in obj.name.lower() or "spot_body" in obj.name.lower()]
    return bodies or mesh_objects()


def add_body_leg_mounts():
    body_min, body_max = scene_bounds(body_mesh_objects())
    all_min, all_max = scene_bounds(mesh_objects())
    center_x = (body_min.x + body_max.x) / 2
    body_w = body_max.x - body_min.x
    length = body_max.y - body_min.y
    mount_z = body_min.z + (body_max.z - body_min.z) * 0.38
    front_y = body_min.y + length * 0.20
    rear_y = body_max.y - length * 0.20

    for side in [-1, 1]:
        side_x = body_min.x if side < 0 else body_max.x
        for y in [front_y, rear_y]:
            cyl_obj("ARGOS clean hip axle", (side_x + side * 0.08, y, mount_z), 0.095, 0.22, MAT_DARK, rotation=(0, math.radians(90), 0), vertices=28)
            cube_obj("ARGOS subtle hip fairing", (side_x + side * 0.035, y, mount_z), (0.12, 0.18, 0.16), MAT_BODY, 0.025)



def cube_obj(name, loc, scale, mat, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("soft product bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.affect = "EDGES"
        obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    return obj


def cyl_obj(name, loc, radius, depth, mat, rotation=(0, 0, 0), vertices=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")
    return obj


def add_brand_text(text, loc, size, rot=(0, 0, 0), mat=None):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = f"ARGOS product marking {text}"
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    obj.data.extrude = 0.003
    if mat:
        obj.data.materials.append(mat)
    return obj


def add_custom_inspection_shell(base_objects):
    min_v, max_v = scene_bounds(body_mesh_objects())
    width = max_v.x - min_v.x
    length = max_v.y - min_v.y
    height = max_v.z - min_v.z
    center_x = (min_v.x + max_v.x) / 2
    center_y = (min_v.y + max_v.y) / 2
    top_z = max_v.z

    cabin_w = min(width * 0.48, 0.62)
    cabin_l = min(length * 0.54, 1.64)
    cabin_h = min(height * 0.072, 0.135)
    cabin_z = top_z + cabin_h * 0.50 - 0.002
    cabin_y = center_y + length * 0.04

    # Integrated long inspection pod on the upper back. X is width, Y is length, Z is height.
    cube_obj("ARGOS low mounted inspection pod white shell", (center_x, cabin_y, cabin_z), (cabin_w, cabin_l, cabin_h), MAT_BODY, 0.026)
    cube_obj("ARGOS shallow mounting saddle", (center_x, cabin_y, top_z + 0.002), (cabin_w * 0.74, cabin_l * 0.68, 0.012), MAT_BODY, 0.006)
    cube_obj("ARGOS front integrated fairing", (center_x, cabin_y + cabin_l * 0.36, cabin_z + cabin_h * 0.03), (cabin_w * 0.78, cabin_l * 0.12, cabin_h * 0.20), MAT_BODY, 0.012)

    # Large dark service cover with white edge left visible around it.
    cover_z = cabin_z + cabin_h * 0.52 + 0.008
    cube_obj("ARGOS dark top service cover inset", (center_x, cabin_y, cover_z), (cabin_w * 0.78, cabin_l * 0.78, 0.014), MAT_PANEL, 0.008)
    cube_obj("ARGOS top cover front bevel insert", (center_x, cabin_y + cabin_l * 0.40, cover_z + 0.002), (cabin_w * 0.56, cabin_l * 0.05, 0.010), MAT_PANEL, 0.006)

    # Front status light and graphite sensor face sit on the pod, not below the body.
    front_y = cabin_y + cabin_l * 0.52
    cube_obj("ARGOS front graphite sensor band", (center_x, front_y, cabin_z + cabin_h * 0.02), (cabin_w * 0.82, 0.05, cabin_h * 0.50), MAT_DARK, 0.014)
    cube_obj("ARGOS front cool white status light bar", (center_x, front_y + 0.032, cabin_z + cabin_h * 0.26), (cabin_w * 0.38, 0.016, cabin_h * 0.20), MAT_LIGHT, 0.008)
    cube_obj("ARGOS top forward status light strip", (center_x, cabin_y + cabin_l * 0.28, cover_z + 0.014), (cabin_w * 0.36, 0.026, 0.010), MAT_LIGHT, 0.004)

    # Side armor rails, recessed interface panels and vents attached to the pod sides.
    for side in [-1, 1]:
        side_x = center_x + side * (cabin_w * 0.53)
        cube_obj(f"ARGOS side graphite armor rail {side}", (side_x, cabin_y, cabin_z - cabin_h * 0.04), (0.038, cabin_l * 0.84, cabin_h * 0.50), MAT_DARK, 0.012)
        cube_obj(f"ARGOS recessed side interface panel {side} A", (side_x + side * 0.012, cabin_y - cabin_l * 0.18, cabin_z - cabin_h * 0.03), (0.022, cabin_l * 0.24, cabin_h * 0.32), MAT_PANEL, 0.008)
        cube_obj(f"ARGOS recessed side interface panel {side} B", (side_x + side * 0.012, cabin_y + cabin_l * 0.10, cabin_z - cabin_h * 0.03), (0.022, cabin_l * 0.24, cabin_h * 0.32), MAT_PANEL, 0.008)
        for i in range(4):
            cube_obj(f"ARGOS side cooling grille fin {side}-{i}", (side_x + side * 0.016, cabin_y + cabin_l * 0.30 + i * cabin_l * 0.032, cabin_z), (0.012, cabin_l * 0.010, cabin_h * 0.34), MAT_DARK, 0.001)

    # Top fasteners, small and restrained.
    for y in [-0.26, 0.0, 0.26]:
        for x in [-0.18, 0.18]:
            cyl_obj("ARGOS flush top fastener", (center_x + x, cabin_y + y, cover_z + 0.022), 0.014, 0.005, MAT_DARK, vertices=18)

    # Remove the previous floating wheel idea: keep the standard-foot source model clean for this version.
    add_brand_text("ARGOS", (center_x + cabin_w * 0.54, cabin_y - cabin_l * 0.18, cabin_z + cabin_h * 0.026), 0.064, rot=(math.radians(90), 0, math.radians(90)), mat=MAT_TEXT)


def setup_camera_and_light():
    bpy.ops.object.light_add(type="AREA", location=(0, -4.5, 4.5))
    light = bpy.context.object
    light.name = "TR softbox key light"
    light.data.energy = 450
    light.data.size = 4
    bpy.ops.object.camera_add(location=(3.6, -4.2, 2.4), rotation=(math.radians(62), 0, math.radians(40)))
    bpy.context.scene.camera = bpy.context.object


def export_glb(out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(out_path),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
        export_animations=False,
        export_lights=False,
        export_cameras=False,
    )


def main():
    args = parse_args()
    reset_scene()
    setup_materials()
    imported = import_base(Path(args.fbx), Path(args.glb))
    mirror_missing_legs(imported)
    normalize_model(imported)
    assign_base_materials()
    add_body_leg_mounts()
    add_custom_inspection_shell(imported)
    setup_camera_and_light()
    export_glb(Path(args.out))
    print(f"Exported Tianrong robot dog to {args.out}")


if __name__ == "__main__":
    main()
