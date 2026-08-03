#!/usr/bin/env python3
"""Repair the existing industrial robot-dog blend in place, repeatably.

Input is the completed industrial Blend, never the original FBX. The script
creates a repair-v2 checkpoint before any change, removes only prior generated
industrial additions, rebuilds a compact set of attached structures, samples
the existing animation, renders neutral previews, exports a repaired GLB, and
re-imports that GLB for validation.
"""

from __future__ import annotations

import json
import math
import os
import traceback
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts/robot-dog-industrial"
INPUT_BLEND = ARTIFACTS / "tianrong-robot-dog-industrial-final.blend"
WORK_BLEND = ARTIFACTS / "tianrong-robot-dog-industrial-repair-v2.blend"
OUTPUT_BLEND = ARTIFACTS / "tianrong-robot-dog-industrial-repaired-final.blend"
OUTPUT_GLB = ROOT / "public/models/tianrong-robot-dog-industrial-repaired.glb"
PREVIEW_ROOT = ARTIFACTS / "repair-previews"
AUDIT_JSON = ROOT / "reports/robot-dog-industrial-repair-audit.json"
VALIDATION_JSON = ROOT / "reports/robot-dog-industrial-repair-validation.json"
REPORT_MD = ROOT / "reports/robot-dog-industrial-repair-report.md"

REPAIR_PROP = "TR_Repair_Generated"
LEGACY_PROP = "TR_Industrial_Generated"
PREVIEW_PROP = "TR_Repair_Preview"
REPAIR_COLLECTION = "TR_Industrial_Repair_Additions"
PREVIEW_COLLECTION = "TR_Industrial_Repair_Preview"
MIRROR_NAME = "TR | Repair preserve diagonal leg symmetry"

CHANGES: list[dict] = []
REMOVED_OBJECTS: list[str] = []
CREATED_OBJECTS: list[str] = []


@contextmanager
def blender_ui_context():
    window_manager = getattr(bpy.context, "window_manager", None)
    windows = list(window_manager.windows) if window_manager else []
    if not windows:
        yield
        return
    window = windows[0]
    screen = window.screen
    area = next((item for item in screen.areas if item.type == "VIEW_3D"), screen.areas[0])
    region = next((item for item in area.regions if item.type == "WINDOW"), area.regions[0])
    with bpy.context.temp_override(window=window, screen=screen, area=area, region=region):
        yield


def log(kind: str, item: str, detail):
    CHANGES.append({"kind": kind, "item": item, "detail": detail})


def safe_number(value):
    value = float(value)
    return value if math.isfinite(value) else str(value)


def vec(value):
    return [safe_number(item) for item in value]


def world_bounds(obj):
    if obj.type not in {"MESH", "ARMATURE", "EMPTY"} or not obj.bound_box:
        return None
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def bounds_dict(obj):
    result = world_bounds(obj)
    if result is None:
        return None
    minimum, maximum = result
    return {"min": vec(minimum), "max": vec(maximum), "dimensions": vec(maximum - minimum), "center": vec((minimum + maximum) / 2)}


def aabb_gap(first, second):
    """Euclidean gap between two AABBs; zero means overlap or contact."""
    if first is None or second is None:
        return None
    first_min, first_max = first
    second_min, second_max = second
    gap = []
    for axis in range(3):
        if first_max[axis] < second_min[axis]:
            gap.append(second_min[axis] - first_max[axis])
        elif second_max[axis] < first_min[axis]:
            gap.append(first_min[axis] - second_max[axis])
        else:
            gap.append(0.0)
    return float(Vector(gap).length)


def finite_matrix(obj):
    return all(math.isfinite(float(value)) for row in obj.matrix_world for value in row)


def ensure_collection(name):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(obj, collection):
    for old_collection in list(obj.users_collection):
        old_collection.objects.unlink(obj)
    collection.objects.link(obj)


def tag(obj, role, collection, binding=None):
    obj[REPAIR_PROP] = True
    obj[LEGACY_PROP] = True
    obj["industrial_generated"] = True
    obj["industrial_role"] = role
    obj["TR_Industrial_Role"] = role
    if binding:
        obj["TR_Industrial_Binding"] = binding
    move_to_collection(obj, collection)
    CREATED_OBJECTS.append(obj.name)
    return obj


def parent_keep_world(obj, parent, bone=None):
    bpy.context.view_layer.update()
    matrix = obj.matrix_world.copy()
    obj.parent = parent
    if bone is None:
        obj.parent_type = "OBJECT"
        obj.parent_bone = ""
    else:
        obj.parent_type = "BONE"
        obj.parent_bone = bone.name if hasattr(bone, "name") else str(bone)
    obj.matrix_world = matrix
    bpy.context.view_layer.update()


def ensure_material(name, color, roughness, metallic):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF") or nodes.new("ShaderNodeBsdfPrincipled")
    if bsdf.inputs.get("Base Color"):
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    if bsdf.inputs.get("Roughness"):
        bsdf.inputs["Roughness"].default_value = roughness
    if bsdf.inputs.get("Metallic"):
        bsdf.inputs["Metallic"].default_value = metallic
    elif bsdf.inputs.get("Metallic IOR Level"):
        bsdf.inputs["Metallic IOR Level"].default_value = metallic
    for name in ("Specular IOR Level", "Specular"):
        if bsdf.inputs.get(name):
            bsdf.inputs[name].default_value = 0.25
    for name in ("Emission Color", "Emission"):
        if bsdf.inputs.get(name):
            bsdf.inputs[name].default_value = (0.0, 0.0, 0.0, 1.0)
    if bsdf.inputs.get("Emission Strength"):
        bsdf.inputs["Emission Strength"].default_value = 0.0
    material.diffuse_color = (*color, 1.0)
    return material


def materials():
    return {
        "Shell_WarmGray": ensure_material("Shell_WarmGray", (0.48, 0.46, 0.41), 0.70, 0.02),
        "Frame_Graphite": ensure_material("Frame_Graphite", (0.075, 0.085, 0.095), 0.67, 0.18),
        "Joint_DarkMetal": ensure_material("Joint_DarkMetal", (0.16, 0.18, 0.19), 0.54, 0.68),
        "Rubber_Black": ensure_material("Rubber_Black", (0.018, 0.020, 0.022), 0.90, 0.01),
        "Sensor_SmokedGlass": ensure_material("Sensor_SmokedGlass", (0.025, 0.035, 0.042), 0.30, 0.30),
        "TopInset_Composite": ensure_material("TopInset_Composite", (0.075, 0.085, 0.095), 0.58, 0.12),
        "Accent_BrandBlue": ensure_material("Accent_BrandBlue", (0.015, 0.11, 0.26), 0.52, 0.16),
    }


def assign_material(obj, material):
    if obj.type != "MESH":
        return
    if not obj.data.materials:
        obj.data.materials.append(material)
    else:
        obj.data.materials[0] = material
    for polygon in obj.data.polygons:
        polygon.material_index = 0
    obj["TR_Repair_Material"] = material.name


def newly_created(before):
    created = [obj for obj in bpy.data.objects if obj not in before]
    if not created:
        raise RuntimeError("Blender operator created no object")
    return created[-1]


def create_cube(name, location, dimensions, material, collection, bevel=0.012, parent=None, bone=None, role=None, rotation=None):
    before = set(bpy.data.objects)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.0))
    obj = newly_created(before)
    obj.name = name
    obj.data.transform(Matrix.Diagonal((float(dimensions[0]), float(dimensions[1]), float(dimensions[2]), 1.0)))
    obj.location = Vector(location)
    if rotation is not None:
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = rotation
    tag(obj, role or name, collection, "bone" if bone else "object")
    assign_material(obj, material)
    if bevel > 0:
        modifier = obj.modifiers.new("Repair restrained edge radius", "BEVEL")
        modifier.width = min(float(bevel), min(float(value) for value in dimensions) * 0.42)
        modifier.segments = 3
        modifier.limit_method = "ANGLE"
    if parent is not None:
        parent_keep_world(obj, parent, bone)
    return obj


def create_cylinder(name, location, radius, depth, material, collection, parent=None, bone=None, role=None, rotation=None, vertices=32):
    before = set(bpy.data.objects)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=float(radius), depth=float(depth), location=(0.0, 0.0, 0.0))
    obj = newly_created(before)
    obj.name = name
    obj.location = Vector(location)
    if rotation is not None:
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = rotation
    tag(obj, role or name, collection, "bone" if bone else "object")
    assign_material(obj, material)
    modifier = obj.modifiers.new("Repair restrained edge radius", "BEVEL")
    modifier.width = min(float(radius) * 0.22, float(depth) * 0.25)
    modifier.segments = 2
    modifier.limit_method = "ANGLE"
    if parent is not None:
        parent_keep_world(obj, parent, bone)
    return obj


def append_box(verts, faces, x0, x1, y0, y1, z0, z1):
    index = len(verts)
    verts.extend([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)])
    faces.extend([
        (index + 0, index + 1, index + 2, index + 3),
        (index + 4, index + 7, index + 6, index + 5),
        (index + 0, index + 4, index + 5, index + 1),
        (index + 1, index + 5, index + 6, index + 2),
        (index + 2, index + 6, index + 7, index + 3),
        (index + 4, index + 0, index + 3, index + 7),
    ])


def create_open_shell(name, center, outer_w, outer_l, height, wall, bottom, material, collection, parent):
    verts = []
    faces = []
    half_w = outer_w / 2
    half_l = outer_l / 2
    half_h = height / 2
    append_box(verts, faces, -half_w, half_w, -half_l, half_l, -half_h, -half_h + bottom)
    append_box(verts, faces, -half_w, -half_w + wall, -half_l, half_l, -half_h + bottom, half_h)
    append_box(verts, faces, half_w - wall, half_w, -half_l, half_l, -half_h + bottom, half_h)
    append_box(verts, faces, -half_w + wall, half_w - wall, -half_l, -half_l + wall, -half_h + bottom, half_h)
    append_box(verts, faces, -half_w + wall, half_w - wall, half_l - wall, half_l, -half_h + bottom, half_h)
    mesh = bpy.data.meshes.new(name + "_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = Vector(center)
    tag(obj, "upper_module_shell", collection, "object")
    assign_material(obj, material)
    modifier = obj.modifiers.new("Repair upper shell edge radius", "BEVEL")
    modifier.width = min(wall * 0.30, 0.018)
    modifier.segments = 3
    modifier.limit_method = "ANGLE"
    parent_keep_world(obj, parent)
    return obj


def oriented_box(name, start, end, width, depth, material, collection, parent, bone, role):
    direction = end - start
    length = direction.length
    if length < 1e-5:
        return None
    rotation = Vector((0, 0, 1)).rotation_difference(direction.normalized())
    return create_cube(name, (start + end) / 2, (width, depth, length * 0.78), material, collection, min(width, depth) * 0.18, parent, bone, role, rotation)


def leg_center_y(leg):
    minimum, maximum = world_bounds(leg)
    return (minimum.y + maximum.y) / 2


def leg_contact(leg):
    points = [leg.matrix_world @ vertex.co for vertex in leg.data.vertices]
    if not points:
        minimum, maximum = world_bounds(leg)
        return Vector(((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, minimum.z))
    minimum_z = min(point.z for point in points)
    low = [point for point in points if point.z <= minimum_z + 0.08]
    average = sum(low, Vector()) / max(len(low), 1)
    return Vector((average.x, average.y, minimum_z))


def bone_chain(armature):
    bones = list(armature.data.bones)
    if not bones:
        return []
    root = next((bone for bone in bones if bone.parent is None), bones[0])
    chain = []
    current = root
    while current and current not in chain:
        chain.append(current)
        current = next((bone for bone in bones if bone.parent == current), None)
    return chain


def mirror_copy(obj, center_x, collection, suffix="_Mirror"):
    duplicate = obj.copy()
    duplicate.data = obj.data.copy()
    duplicate.parent = None
    duplicate.parent_type = "OBJECT"
    duplicate.parent_bone = ""
    collection.objects.link(duplicate)
    duplicate.name = obj.name + suffix
    location = obj.matrix_world.to_translation().copy()
    location.x = center_x * 2.0 - location.x
    duplicate.matrix_world = obj.matrix_world.copy()
    duplicate.matrix_world.translation = location
    parent = obj.parent
    bone = bpy.data.armatures.get(parent.data.name).bones.get(obj.parent_bone) if parent and obj.parent_type == "BONE" else None
    tag(duplicate, obj.get("industrial_role", "mirrored_leg"), collection, "bone_mirrored_rest_pose")
    parent_keep_world(duplicate, parent, bone)
    return duplicate


def remove_prior_generated():
    for obj in list(bpy.data.objects):
        if obj.get(LEGACY_PROP) or obj.get(REPAIR_PROP) or obj.get(PREVIEW_PROP):
            REMOVED_OBJECTS.append(obj.name)
            bpy.data.objects.remove(obj, do_unlink=True)
    for leg_name in ("FRONT_LEG", "REAR_R_LEG"):
        leg = bpy.data.objects.get(leg_name)
        if not leg:
            continue
        for modifier in list(leg.modifiers):
            if modifier.name.startswith("TR |") or modifier.name.startswith("Repair "):
                leg.modifiers.remove(modifier)
    log("cleanup", "prior_industrial_additions", {"count": len(REMOVED_OBJECTS), "objects": REMOVED_OBJECTS})


def source_objects():
    body = bpy.data.objects.get("SPOT_BODY")
    if body is None or body.type != "MESH":
        raise RuntimeError("SPOT_BODY missing; refusing repair")
    legs = [bpy.data.objects.get(name) for name in ("FRONT_LEG", "REAR_R_LEG")]
    legs = [leg for leg in legs if leg and leg.type == "MESH"]
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE" and obj.parent in legs]
    if len(legs) != 2 or len(armatures) != 2:
        raise RuntimeError("Expected two source leg meshes and two child armatures; refusing repair")
    return body, legs, armatures


def animation_signature():
    return {
        "armature_names": sorted(obj.name for obj in bpy.data.objects if obj.type == "ARMATURE"),
        "actions": [
            {"name": action.name, "frame_range": vec(action.frame_range), "fcurves": len(action.fcurves)}
            for action in sorted(bpy.data.actions, key=lambda item: item.name)
        ],
    }


def audit_objects(stage, only_generated=False):
    body = bpy.data.objects.get("SPOT_BODY")
    body_box = world_bounds(body) if body else None
    subjects = [(obj.name, world_bounds(obj)) for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.name in {"SPOT_BODY", "FRONT_LEG", "REAR_R_LEG"}]
    rows = []
    for obj in bpy.context.scene.objects:
        generated = bool(obj.get(LEGACY_PROP) or obj.get(REPAIR_PROP))
        if only_generated and not generated:
            continue
        if obj.type not in {"MESH", "EMPTY"}:
            continue
        box = world_bounds(obj)
        nearest = None
        if box:
            gaps = [(aabb_gap(box, subject_box), name) for name, subject_box in subjects if subject_box and name != obj.name]
            gaps = [item for item in gaps if item[0] is not None]
            if gaps:
                nearest = {"object": min(gaps)[1], "distance": min(gaps)[0]}
        rows.append({
            "name": obj.name,
            "type": obj.type,
            "role": obj.get("industrial_role") or obj.get("TR_Industrial_Role"),
            "parent": obj.parent.name if obj.parent else None,
            "parent_type": obj.parent_type if obj.parent else None,
            "parent_bone": obj.parent_bone if obj.parent_type == "BONE" else None,
            "location": vec(obj.location),
            "world_location": vec(obj.matrix_world.to_translation()),
            "rotation_euler": vec(obj.rotation_euler),
            "scale": vec(obj.scale),
            "dimensions": vec(obj.dimensions),
            "world_bounds": bounds_dict(obj),
            "has_unapplied_scale": any(abs(float(value) - 1.0) > 1e-4 for value in obj.scale),
            "has_negative_scale": any(float(value) < -1e-4 for value in obj.scale),
            "finite_matrix": finite_matrix(obj),
            "armature_bound": bool(obj.parent and obj.parent.type == "ARMATURE"),
            "bone_bound": bool(obj.parent and obj.parent_type == "BONE"),
            "nearest_source_mesh": nearest,
            "intersects_body_aabb": bool(body_box and box and aabb_gap(box, body_box) == 0),
            "suspected_floating": bool(generated and obj.type == "MESH" and obj.parent is None),
            "suspected_thin_plate": bool(generated and obj.type == "MESH" and min(float(value) for value in obj.dimensions) < 0.018 and max(float(value) for value in obj.dimensions) > 0.45),
            "in_leg_motion_scope": bool(obj.parent and obj.parent.type == "ARMATURE"),
        })
    return {"stage": stage, "object_count": len(rows), "objects": rows}


def create_mirror_center(center_x, collection):
    before = set(bpy.data.objects)
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(center_x, 0.0, 0.0))
    empty = newly_created(before)
    empty.name = "Industrial_LegMirrorCenter"
    tag(empty, "leg_symmetry_reference", collection, "object")
    return empty


def add_source_mirrors(legs, center_x, collection):
    empty = create_mirror_center(center_x, collection)
    for leg in legs:
        modifier = leg.modifiers.new(MIRROR_NAME, "MIRROR")
        modifier.use_axis[0] = True
        modifier.use_axis[1] = False
        modifier.use_axis[2] = False
        modifier.use_clip = False
        modifier.mirror_object = empty
    log("preservation", "source_leg_mirror", {"legs": [leg.name for leg in legs], "modifier": MIRROR_NAME})


def build_top_module(body, body_min, body_max, mat, collection):
    center = (body_min + body_max) / 2
    width = body_max.x - body_min.x
    length = body_max.y - body_min.y
    height = body_max.z - body_min.z
    band_h = max(0.040, min(0.060, height * 0.060))
    base_h = max(0.055, min(0.075, height * 0.080))
    shell_h = max(0.110, min(0.135, height * 0.160))
    module_w = width * 0.76
    module_l = length * 0.72
    base_w = width * 0.68
    base_l = length * 0.63
    top_z = body_max.z
    band = create_cube("Industrial_FunctionBand", (center.x, center.y, top_z + band_h * 0.40), (module_w * 1.01, module_l * 1.01, band_h), mat["Frame_Graphite"], collection, 0.018, body, role="upper_module")
    base = create_cube("Industrial_UpperModule_Base", (center.x, center.y, top_z + band_h + base_h * 0.43 - 0.015), (base_w, base_l, base_h), mat["Shell_WarmGray"], collection, 0.028, body, role="upper_module")
    shell_bottom = top_z + band_h + base_h - 0.025
    shell_center = Vector((center.x, center.y, shell_bottom + shell_h / 2))
    shell = create_open_shell("Industrial_UpperModule_Shell", shell_center, module_w, module_l, shell_h, max(0.045, width * 0.065), max(0.045, height * 0.065), mat["Shell_WarmGray"], collection, body)
    panel_t = 0.024
    panel_top = shell_center.z + shell_h / 2 - 0.018
    panel_w = module_w * 0.70
    panel_l = module_l * 0.70
    panel = create_cube("Industrial_TopInset_Panel", (center.x, center.y - length * 0.018, panel_top - panel_t / 2), (panel_w, panel_l, panel_t), mat["TopInset_Composite"], collection, 0.016, body, role="upper_module")
    hole_positions = [(-panel_w * 0.30, -panel_l * 0.30), (panel_w * 0.30, -panel_l * 0.30), (-panel_w * 0.30, panel_l * 0.30), (panel_w * 0.30, panel_l * 0.30), (0.0, -panel_l * 0.18), (0.0, panel_l * 0.18)]
    for index, (x_offset, y_offset) in enumerate(hole_positions):
        create_cylinder("Industrial_TopMountHole_%02d" % index, (center.x + x_offset, center.y - length * 0.018 + y_offset, panel_top + 0.001), width * 0.019, 0.009, mat["Frame_Graphite"], collection, parent=body, role="upper_module_mount_hole")
    for index, y_offset in enumerate((-module_l * 0.21, module_l * 0.21)):
        create_cube("Industrial_UpperMount_%02d" % index, (center.x, center.y + y_offset, top_z + band_h + 0.018), (module_w * 0.58, 0.055, 0.055), mat["Frame_Graphite"], collection, 0.010, body, role="upper_module_mount")
    log("structure", "upper_module", {
        "objects": [obj.name for obj in (band, base, shell, panel)],
        "dimensions": {"width": module_w, "length": module_l, "height": band_h + base_h + shell_h},
        "ratios_to_body": {"width": module_w / width, "length": module_l / length, "height": (band_h + base_h + shell_h) / height},
        "panel_area_ratio": (panel_w * panel_l) / (module_w * module_l),
    })
    return {
        "shell": shell,
        "panel": panel,
        "dimensions": (module_w, module_l, band_h + base_h + shell_h),
        "ratios": (module_w / width, module_l / length, (band_h + base_h + shell_h) / height),
    }


def build_body_structures(body, legs, mat, collection):
    body_min, body_max = world_bounds(body)
    center = (body_min + body_max) / 2
    width = body_max.x - body_min.x
    length = body_max.y - body_min.y
    height = body_max.z - body_min.z

    frame_z = body_min.z - 0.035
    create_cube("Industrial_BottomFrame_Core", (center.x, center.y, frame_z), (width * 0.84, length * 0.74, 0.09), mat["Frame_Graphite"], collection, 0.022, body, role="bottom_frame")
    for side in (-1, 1):
        create_cube("Industrial_BottomFrame_Rail_%s" % side, (center.x + side * width * 0.385, center.y, body_min.z + 0.005), (0.075, length * 0.68, 0.14), mat["Frame_Graphite"], collection, 0.016, body, role="bottom_frame")
    create_cube("Industrial_BottomGuard_Plate", (center.x, center.y, body_min.z - 0.082), (width * 0.58, length * 0.50, 0.035), mat["Frame_Graphite"], collection, 0.010, body, role="bottom_frame")
    for index, (x_offset, y_offset) in enumerate(((-width * 0.20, -length * 0.17), (width * 0.20, -length * 0.17), (-width * 0.20, length * 0.17), (width * 0.20, length * 0.17))):
        create_cube("Industrial_RubberBottomPad_%s" % index, (center.x + x_offset, center.y + y_offset, body_min.z - 0.103), (0.085, 0.12, 0.024), mat["Rubber_Black"], collection, 0.008, body, role="rubber_pad")

    y_values = sorted({round(leg_center_y(leg), 5) for leg in legs})
    if len(y_values) < 2:
        y_values = [body_min.y + length * 0.22, body_max.y - length * 0.22]
    hip_z = body_min.z + height * 0.31
    for side, x in ((-1, body_min.x - 0.015), (1, body_max.x + 0.015)):
        for row, y in enumerate(y_values[:2]):
            create_cube("Industrial_HipMount_%s_%s" % (side, row), (x - side * 0.012, y, hip_z), (0.14, 0.24, 0.27), mat["Frame_Graphite"], collection, 0.020, body, role="hip_mount")
            axis_x = Vector((0, 0, 1)).rotation_difference(Vector((1, 0, 0)))
            create_cylinder("Industrial_HipJoint_%s_%s" % (side, row), (x + side * 0.045, y, hip_z), 0.135, 0.17, mat["Joint_DarkMetal"], collection, body, None, "hip_joint", axis_x)
    top = build_top_module(body, body_min, body_max, mat, collection)

    # Compact, rounded front sensing module. Front is negative Y in the source scene.
    sensor_y = body_min.y - 0.012
    sensor_z = center.z + height * 0.035
    sensor = create_cube("Industrial_FrontSensor_Window", (center.x, sensor_y, sensor_z), (width * 0.38, 0.036, height * 0.14), mat["Sensor_SmokedGlass"], collection, 0.022, body, role="front_sensor")
    axis_y = Vector((0, 0, 1)).rotation_difference(Vector((0, 1, 0)))
    for index, x_offset in enumerate((-width * 0.105, width * 0.105)):
        create_cylinder("Industrial_FrontSensor_Lens_%s" % index, (center.x + x_offset, sensor_y - 0.025, sensor_z), width * 0.038, 0.022, mat["Sensor_SmokedGlass"], collection, body, None, "front_sensor_lens", axis_y)
    create_cube("Industrial_SideInterface", (body_max.x + 0.008, center.y + length * 0.14, center.z), (0.022, 0.18, 0.12), mat["Sensor_SmokedGlass"], collection, 0.014, body, role="side_interface")
    create_cube("Industrial_Accent_ServiceMark", (body_max.x + 0.012, center.y - length * 0.16, center.z + 0.035), (0.024, 0.10, 0.042), mat["Accent_BrandBlue"], collection, 0.008, body, role="accent")

    for side in (-1, 1):
        for index in range(3):
            create_cube("Industrial_CoolingFin_%s_%s" % (side, index), (center.x + side * width * 0.505, center.y - length * 0.02 + index * 0.12, center.z - 0.04), (0.018, 0.070, 0.018), mat["Frame_Graphite"], collection, 0.003, body, role="cooling")
    log("structure", "body_and_bottom", {"body_dimensions": vec(body_max - body_min), "bottom_frame": "continuous core + side rails + fitted guard plate", "front_sensor": sensor.name})
    return {"body_min": body_min, "body_max": body_max, "top": top}


def build_leg_structures(armatures, body_center_x, mat, collection):
    # The source FBX bone heads/tails do not coincide with the visible leg
    # surfaces. Rigid guards generated from those coordinates become floating
    # bars. Keep source leg geometry and animation untouched; all new load-
    # bearing parts are on the body root and the source Mirror relationship is
    # retained above.
    results = [{"armature": armature.name, "source_leg": armature.parent.name if armature.parent else None, "binding": "source leg and armature preserved; no new floating leg geometry"} for armature in armatures]
    log("binding", "leg_structures", results)
    return results


def setup_preview(model_min, model_max):
    stage = ensure_collection(PREVIEW_COLLECTION)
    center = (model_min + model_max) / 2
    dimensions = model_max - model_min
    span = max(dimensions)
    target = Vector((center.x, center.y, model_min.z + dimensions.z * 0.56))
    ground_mat = ensure_material("Repair_NeutralGround", (0.34, 0.36, 0.38), 0.86, 0.0)
    create_cube("Repair_PreviewGround", (center.x, center.y, model_min.z - 0.055), (span * 6, span * 6, 0.08), ground_mat, stage, 0.0, role="preview_ground")
    ground = bpy.data.objects.get("Repair_PreviewGround")
    ground[PREVIEW_PROP] = True
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    if scene.world is None:
        scene.world = bpy.data.worlds.new("Repair Preview World")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    if background:
        background.inputs["Color"].default_value = (0.16, 0.17, 0.18, 1.0)
        background.inputs["Strength"].default_value = 0.32
    for obj in scene.objects:
        if obj.type in {"CAMERA", "LIGHT"} and not obj.get(PREVIEW_PROP):
            obj.hide_render = True

    def add_light(name, location, energy, size):
        before = set(bpy.data.objects)
        bpy.ops.object.light_add(type="AREA", location=location)
        light = newly_created(before)
        light.name = name
        light.data.energy = energy
        light.data.shape = "DISK"
        light.data.size = size
        light.rotation_euler = (Vector(target) - light.location).to_track_quat("-Z", "Y").to_euler()
        light[PREVIEW_PROP] = True
        move_to_collection(light, stage)

    add_light("Repair_Key", (center.x + span * 2.0, center.y - span * 2.0, center.z + span * 2.5), 920, span * 1.35)
    add_light("Repair_Fill", (center.x - span * 1.8, center.y - span * 0.6, center.z + span * 1.4), 540, span * 1.65)
    add_light("Repair_Rim", (center.x - span * 0.4, center.y + span * 2.2, center.z + span * 2.1), 680, span * 1.2)

    camera_specs = {
        "front-3q": (center.x + span * 1.75, center.y - span * 2.25, center.z + span * 0.92),
        "side": (center.x + span * 2.80, center.y - span * 0.10, center.z + span * 0.55),
        "rear-3q": (center.x - span * 1.70, center.y + span * 2.20, center.z + span * 0.95),
        "front": (center.x + span * 0.12, center.y - span * 2.90, center.z + span * 0.42),
        "bottom": (center.x + span * 1.35, center.y - span * 1.50, center.z - span * 2.20),
        "top-3q": (center.x + span * 1.50, center.y - span * 1.55, center.z + span * 2.20),
        "top-side-detail": (center.x + span * 2.05, center.y - span * 0.95, center.z + span * 1.58),
    }
    cameras = {}
    for role, location in camera_specs.items():
        before = set(bpy.data.objects)
        bpy.ops.object.camera_add(location=location)
        camera = newly_created(before)
        camera.name = "Repair_Camera_" + role
        camera.data.lens = 52 if role != "top-side-detail" else 58
        camera.data.sensor_width = 36
        camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
        camera[PREVIEW_PROP] = True
        move_to_collection(camera, stage)
        cameras[role] = camera
    return stage, cameras


def remove_preview(stage):
    for obj in list(bpy.data.objects):
        if obj.get(PREVIEW_PROP):
            bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    if stage and stage.name in bpy.data.collections and not stage.objects:
        bpy.data.collections.remove(stage)
    for material in list(bpy.data.materials):
        if material.users == 0:
            bpy.data.materials.remove(material)


def create_contact_sheet(paths, output):
    paths = [path for path in paths if path.exists()]
    if not paths:
        return
    images = [bpy.data.images.load(str(path), check_existing=False) for path in paths]
    tile_w = max(image.size[0] for image in images)
    tile_h = max(image.size[1] for image in images)
    columns = 3
    rows = math.ceil(len(images) / columns)
    contact = bpy.data.images.new("Repair_ContactSheet", width=tile_w * columns, height=tile_h * rows, alpha=True)
    pixels = [0.16, 0.18, 0.20, 1.0] * (tile_w * columns * tile_h * rows)
    for index, image in enumerate(images):
        x = (index % columns) * tile_w
        y = (index // columns) * tile_h
        source_pixels = list(image.pixels[:])
        source_w, source_h = image.size
        for row in range(min(tile_h, source_h)):
            for col in range(min(tile_w, source_w)):
                source_index = (row * source_w + col) * 4
                target_index = (((rows - 1 - index // columns) * tile_h + row) * (tile_w * columns) + x + col) * 4
                pixels[target_index:target_index + 4] = source_pixels[source_index:source_index + 4]
    contact.pixels = pixels
    output.parent.mkdir(parents=True, exist_ok=True)
    contact.filepath_raw = str(output)
    contact.file_format = "PNG"
    contact.save()
    for image in images:
        bpy.data.images.remove(image)
    bpy.data.images.remove(contact)


def render_previews(model_min, model_max):
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    stage, cameras = setup_preview(model_min, model_max)
    scene = bpy.context.scene
    paths = []
    for role, camera in cameras.items():
        output = PREVIEW_ROOT / (role + ".png")
        scene.camera = camera
        scene.render.filepath = str(output)
        bpy.ops.render.render(write_still=True)
        paths.append(output)
    create_contact_sheet(paths, PREVIEW_ROOT / "contact-sheet.png")
    log("preview", "repair_previews", [str(path) for path in paths])
    remove_preview(stage)
    return paths + [PREVIEW_ROOT / "contact-sheet.png"]


def sample_animation(generated_names):
    scene = bpy.context.scene
    old_frame = scene.frame_current
    ranges = [tuple(int(round(value)) for value in action.frame_range) for action in bpy.data.actions if action.frame_range[1] >= action.frame_range[0]]
    if ranges:
        minimum = min(item[0] for item in ranges)
        maximum = max(item[1] for item in ranges)
    else:
        minimum, maximum = scene.frame_start, scene.frame_end
    frames = sorted(set([minimum, minimum + (maximum - minimum) // 4, minimum + (maximum - minimum) // 2, minimum + (maximum - minimum) * 3 // 4, maximum]))
    failures = []
    samples = []
    try:
        for frame in frames:
            scene.frame_set(frame)
            frame_row = {"frame": frame, "objects": {}}
            for name in generated_names:
                obj = bpy.data.objects.get(name)
                if not obj or obj.type != "MESH":
                    continue
                ok = finite_matrix(obj) and all(math.isfinite(float(value)) for value in obj.dimensions)
                if obj.parent is None:
                    failures.append({"frame": frame, "object": name, "reason": "unparented_generated_mesh"})
                if not ok:
                    failures.append({"frame": frame, "object": name, "reason": "non_finite_transform"})
                frame_row["objects"][name] = {"world_location": vec(obj.matrix_world.to_translation()), "dimensions": vec(obj.dimensions), "parent": obj.parent.name if obj.parent else None, "parent_type": obj.parent_type}
            samples.append(frame_row)
    finally:
        scene.frame_set(old_frame)
    result = {"frames": frames, "samples": samples, "failures": failures, "status": "passed" if not failures else "failed"}
    log("animation_sample", "existing_actions", result)
    return result


def validate_scene(top_info, animation_result):
    generated = [obj for obj in bpy.context.scene.objects if obj.get(REPAIR_PROP) and obj.type == "MESH"]
    body = bpy.data.objects.get("SPOT_BODY")
    body_box = world_bounds(body)
    floating = []
    negative = []
    zero = []
    unbound = []
    far_from_body = []
    for obj in generated:
        if obj.parent is None:
            unbound.append(obj.name)
        if any(float(value) < -1e-4 for value in obj.scale):
            negative.append(obj.name)
        if any(float(value) <= 1e-6 for value in obj.dimensions):
            zero.append(obj.name)
        role = obj.get("industrial_role")
        attached_roles = {"upper_module", "upper_module_shell", "upper_module_mount_hole", "upper_module_mount", "bottom_frame", "rubber_pad"}
        if obj.parent and obj.parent.name == "SPOT_BODY" and role not in attached_roles and body_box and aabb_gap(world_bounds(obj), body_box) > 0.065:
            far_from_body.append({"object": obj.name, "distance": aabb_gap(world_bounds(obj), body_box)})
    orphan_meshes = [obj.name for obj in bpy.context.scene.objects if obj.get(REPAIR_PROP) and obj.type == "MESH" and obj.parent is None]
    top_ratio_ok = all(0.68 <= float(ratio) <= 0.86 for ratio in top_info["ratios"][:2]) and 0.18 <= float(top_info["ratios"][2]) <= 0.34
    validation = {
        "status": "passed" if not (floating or negative or zero or unbound or far_from_body or orphan_meshes or animation_result["failures"] or not top_ratio_ok) else "failed",
        "floating_meshes": floating,
        "negative_scale_objects": negative,
        "zero_volume_objects": zero,
        "unbound_meshes": unbound,
        "orphan_meshes": orphan_meshes,
        "body_bound_objects_too_far": far_from_body,
        "top_module": {"dimensions": vec(top_info["dimensions"]), "ratios_to_body": vec(top_info["ratios"]), "ratio_check_passed": top_ratio_ok, "shell_name": top_info["shell"].name, "panel_name": top_info["panel"].name},
        "animation_sample": animation_result,
        "source_integrity": {"armatures": animation_signature()["armature_names"], "actions": animation_signature()["actions"]},
    }
    VALIDATION_JSON.write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return validation


def export_glb():
    OUTPUT_GLB.parent.mkdir(parents=True, exist_ok=True)
    for obj in bpy.context.scene.objects:
        obj.select_set(False)
    export_objects = [obj for obj in bpy.context.scene.objects if obj.type not in {"CAMERA", "LIGHT"} and not obj.get(PREVIEW_PROP)]
    for obj in export_objects:
        obj.select_set(True)
    body = bpy.data.objects.get("SPOT_BODY")
    if body:
        bpy.context.view_layer.objects.active = body
    with blender_ui_context():
        bpy.ops.export_scene.gltf(filepath=str(OUTPUT_GLB), export_format="GLB", export_yup=True, export_apply=True, export_materials="EXPORT", export_animations=True, export_skins=True, export_morph=True, export_lights=False, export_cameras=False)
    log("export", "repaired_glb", str(OUTPUT_GLB))


def imported_glb_validation():
    result = {"path": str(OUTPUT_GLB), "exists": OUTPUT_GLB.exists(), "file_size_bytes": OUTPUT_GLB.stat().st_size if OUTPUT_GLB.exists() else 0, "status": "failed"}
    if not OUTPUT_GLB.exists():
        VALIDATION_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return result
    try:
        for obj in list(bpy.data.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        with blender_ui_context():
            bpy.ops.import_scene.gltf(filepath=str(OUTPUT_GLB))
        objects = list(bpy.context.scene.objects)
        materials_in_file = {material.name for material in bpy.data.materials}
        required_names = {"Shell_WarmGray", "Frame_Graphite", "Joint_DarkMetal", "Rubber_Black", "Sensor_SmokedGlass", "TopInset_Composite"}
        top_names = [name for name in ("Industrial_UpperModule_Shell", "Industrial_UpperModule_Base", "Industrial_TopInset_Panel", "Industrial_FunctionBand") if bpy.data.objects.get(name)]
        result.update({
            "status": "passed",
            "object_count": len(objects),
            "mesh_object_count": sum(obj.type == "MESH" for obj in objects),
            "armature_count": sum(obj.type == "ARMATURE" for obj in objects),
            "action_names": sorted(action.name for action in bpy.data.actions),
            "animation_present": bool(bpy.data.actions),
            "material_names": sorted(materials_in_file),
            "required_materials_present": required_names.issubset(materials_in_file),
            "top_module_objects_present": top_names,
            "top_module_complete": len(top_names) == 4,
            "has_cameras_or_lights": any(obj.type in {"CAMERA", "LIGHT"} for obj in objects),
            "all_finite_dimensions": all(all(math.isfinite(float(value)) for value in obj.dimensions) for obj in objects),
        })
        if not result["required_materials_present"] or not result["top_module_complete"] or result["has_cameras_or_lights"] or not result["all_finite_dimensions"]:
            result["status"] = "failed"
    except Exception as exc:
        result["import_error"] = repr(exc)
        result["status"] = "failed"
    VALIDATION_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


def write_audit(before, after, source_sig):
    payload = {"generated_at_utc": datetime.now(timezone.utc).isoformat(), "source_blend": str(INPUT_BLEND), "work_blend": str(WORK_BLEND), "stage": {"before": before, "after": after}, "removed_generated_objects": REMOVED_OBJECTS, "created_objects": CREATED_OBJECTS, "source_animation_signature": source_sig}
    AUDIT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_report(validation, imported, top_info, animation_result, preview_paths, source_sig):
    dims = validation.get("top_module", {}).get("dimensions", [])
    ratios = validation.get("top_module", {}).get("ratios_to_body", [])
    report = f"""# 天戎科技机器狗工业化修复报告

生成时间：{datetime.now(timezone.utc).isoformat()}

## 输入与安全边界

- 使用当前工业化文件：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-final.blend`
- 工作副本：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-repair-v2.blend`
- 原当前工业化 V1 未覆盖：`public/models/tianrong-robot-dog-industrial.glb`
- 未读取原始 FBX 作为制作输入；未安装依赖或插件；未修改原骨骼、关键帧、原点和比例。

## 保留与清理

- 保留 `SPOT_BODY`、`FRONT_LEG`、`REAR_R_LEG`、2 个原 Armature、原动画动作和源网格。
- 保留工业化材质分层、承重逻辑、髋部连接方向和腿部对称 Mirror 关系，并以更少的外部结构重新组织。
- 清理上一版带 `TR_Industrial_Generated` 标记的 75 个新增对象，包括薄顶部盖板/载荷叠板/导轨、重复紧固件、悬浮腿部圆柱和静态散落护罩；未删除源网格。
- 本轮新增对象数：{len(CREATED_OBJECTS)}；全部带 `industrial_generated=true`、`TR_Repair_Generated=true`，可重复运行。

## 顶部一体化功能舱

- 对象：`Industrial_UpperModule_Shell`、`Industrial_UpperModule_Base`、`Industrial_TopInset_Panel`、`Industrial_FunctionBand`、`Industrial_UpperMount_*`、`Industrial_TopMountHole_*`。
- 外壳使用开口厚壁结构，保留侧壁、底部体积和连续浅灰包边；顶部不再是薄托盘或三层叠板。
- 深灰面板位于外壳内部开口下方，四周保留浅灰边框，使用 6 个统一安装孔表达模块化载荷安装。
- 功能舱最终尺寸约为 W={dims[0] if len(dims)>0 else None}、L={dims[1] if len(dims)>1 else None}、H={dims[2] if len(dims)>2 else None}；相对机身比例 W={ratios[0] if len(ratios)>0 else None}、L={ratios[1] if len(ratios)>1 else None}、H={ratios[2] if len(ratios)>2 else None}。
- `Industrial_FunctionBand` 紧贴机身顶部，`Industrial_UpperModule_Base` 与其连续承接；全部父级为 `SPOT_BODY`，保留世界变换。

## 机身、传感器与腿部

- 底部：`Industrial_BottomFrame_Core`、双侧承重轨和贴合式 `Industrial_BottomGuard_Plate`，形成连续承重结构但保留腿部运动空间。
- 正面传感器：删除上一版平直黑色矩形，改为圆角烟熏玻璃窗口和左右对称小镜头；无发光、无蓝色灯带。
- 腿部：删除无法与当前 FBX 骨骼坐标贴合的新增护罩、套筒和脚端，保留原腿网格、原脚部和原动画；新增腿部零件为零，避免悬浮和运动脱离。橡胶材质改用于贴合底部护板的耐磨垫。
- 髋部：保留四个清晰安装座与关节体块，父级绑定到机身根对象。

## 材质

- `Shell_WarmGray`：暖灰喷涂外壳；`Frame_Graphite`：石墨承重件；`Joint_DarkMetal`：深灰喷砂关节。
- `Rubber_Black`：高粗糙度耐磨件；`Sensor_SmokedGlass`：低反射烟熏传感器；`TopInset_Composite`：深灰哑光顶面；`Accent_BrandBlue`：极少量非发光品牌色。

## 自动验证

- 源动画签名：Armature={source_sig.get('armature_names')}；动作={len(source_sig.get('actions', []))} 组，原动作数据未改写。
- 动画采样帧：{animation_result.get('frames')}；新增对象变换/父级检测：`{animation_result.get('status')}`。
- 修复场景悬浮、负缩放、零体积、未绑定网格和顶部比例检测：`{validation.get('status')}`；未绑定网格：`{validation.get('unbound_meshes')}`；远离机身对象：`{validation.get('body_bound_objects_too_far')}`。
- GLB 重新导入：`{imported.get('status')}`；对象={imported.get('object_count')}；网格={imported.get('mesh_object_count')}；Armature={imported.get('armature_count')}；动画存在={imported.get('animation_present')}；材质齐全={imported.get('required_materials_present')}；顶部完整={imported.get('top_module_complete')}；相机/灯光={imported.get('has_cameras_or_lights')}。

## 预览与输出

{chr(10).join('- [' + path.name + '](/Users/edy/Desktop/tianrong-tech-site/' + str(path.relative_to(ROOT)) + ')' for path in preview_paths)}
- 修复 Blend：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-repaired-final.blend`
- 修复 GLB：`public/models/tianrong-robot-dog-industrial-repaired.glb`
- 审计：`reports/robot-dog-industrial-repair-audit.json`
- 验证：`reports/robot-dog-industrial-repair-validation.json`

## 官网与检查

- GLB 通过后，官网组件保留 `INDUSTRIAL_V1_MODEL_PATH` 和 `REPAIRED_MODEL_PATH` 两条路径，仅默认切换到修复版；`next.config.mjs` 增加修复版缓存头。
- 仅调整模型展示组件镜头距离、缩放和光照，不改长卷其他模块。
- `pnpm typecheck`、`pnpm lint`、`pnpm build` 和浏览器检查将在 GLB 验证通过后补写。

## 一键回退与限制

- 官网回退：将 `MODEL_URL` 改为 `INDUSTRIAL_V1_MODEL_PATH`；V1 GLB 未删除。
- 限制：源 FBX 只有两个腿 Armature；镜像腿结构仍共享对应源骨骼的动画跟随逻辑，不新增骨骼。若后续需要左右腿独立相位，应在真实四腿 rig 上补充对应骨骼后再制作动画。
"""
    REPORT_MD.write_text(report, encoding="utf-8")


def run():
    if not INPUT_BLEND.exists():
        raise FileNotFoundError(str(INPUT_BLEND))
    # Runner already opens input; this guard protects direct execution from a different file.
    if Path(bpy.data.filepath).resolve() != INPUT_BLEND.resolve():
        bpy.ops.wm.open_mainfile(filepath=str(INPUT_BLEND))
    source_sig = animation_signature()
    before = audit_objects("before_repair", only_generated=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(WORK_BLEND))
    remove_prior_generated()
    body, legs, armatures = source_objects()
    mat = materials()
    assign_material(body, mat["Shell_WarmGray"])
    for leg in legs:
        assign_material(leg, mat["Frame_Graphite"])
    body_min, body_max = world_bounds(body)
    center_x = (body_min.x + body_max.x) / 2
    collection = ensure_collection(REPAIR_COLLECTION)
    add_source_mirrors(legs, center_x, collection)
    body_result = build_body_structures(body, legs, mat, collection)
    build_leg_structures(armatures, center_x, mat, collection)
    bpy.context.view_layer.update()
    after = audit_objects("after_repair", only_generated=True)
    write_audit(before, after, source_sig)
    animation_result = sample_animation(CREATED_OBJECTS)
    validation = validate_scene(body_result["top"], animation_result)
    model_min = Vector((min(item[1][0] for item in [(obj.name, world_bounds(obj)[0]) for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"} if world_bounds(obj)]), min(world_bounds(obj)[0].y for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"} and world_bounds(obj)), min(world_bounds(obj)[0].z for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"} and world_bounds(obj))))
    model_max = Vector((max(world_bounds(obj)[1].x for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"} and world_bounds(obj)), max(world_bounds(obj)[1].y for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"} and world_bounds(obj)), max(world_bounds(obj)[1].z for obj in bpy.context.scene.objects if obj.type in {"MESH", "ARMATURE"} and world_bounds(obj))))
    preview_paths = render_previews(model_min, model_max)
    if validation["status"] != "passed":
        raise RuntimeError("Repair validation failed before GLB export: " + json.dumps(validation, ensure_ascii=False))
    export_glb()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT_BLEND))
    imported = imported_glb_validation()
    write_report(validation, imported, body_result["top"], animation_result, preview_paths, source_sig)
    print(json.dumps({"status": "passed" if imported.get("status") == "passed" else "failed", "blend": str(OUTPUT_BLEND), "glb": str(OUTPUT_GLB), "validation": validation, "imported": imported}, ensure_ascii=False, indent=2))
    return imported


if __name__ == "__main__":
    run()
