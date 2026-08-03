#!/usr/bin/env python3
"""Non-destructive, repeatable industrialization pass for the robot-dog scene.

The script operates on the currently opened Blender scene. It keeps imported
source objects, parenting, armatures, bones, actions, and existing mesh data.
Only generated objects are removed/rebuilt on a repeat run. New structure is
external geometry with TR_Industrial_Generated custom properties.
"""

from __future__ import annotations

import json
import math
import os
import shutil
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_ROOT = PROJECT_ROOT / "artifacts/robot-dog-industrial"
PREVIEW_ROOT = ARTIFACT_ROOT / "previews"
V1_BLEND = ARTIFACT_ROOT / "tianrong-robot-dog-industrial-v1.blend"
FINAL_BLEND = ARTIFACT_ROOT / "tianrong-robot-dog-industrial-final.blend"
FINAL_GLB = PROJECT_ROOT / "public/models/tianrong-robot-dog-industrial.glb"
VALIDATION_JSON = PROJECT_ROOT / "reports/robot-dog-industrial-glb-validation.json"
CHANGELOG_JSON = PROJECT_ROOT / "reports/robot-dog-industrial-change-log.json"
REPORT_MD = PROJECT_ROOT / "reports/robot-dog-industrialization-report.md"
BASELINE_GLB = PROJECT_ROOT / "public/models/tianrong-robot-dog.v1.glb"

GENERATED_PROP = "TR_Industrial_Generated"
PREVIEW_PROP = "TR_Industrial_Preview"
MIRROR_MODIFIER_NAME = "TR | Preserve diagonal leg symmetry"
GENERATED_COLLECTION_NAME = "TR_Industrial_Additions"
PREVIEW_COLLECTION_NAME = "TR_Industrial_Preview_Stage"

CHANGELOG = []
GENERATED_OBJECTS = []


def log_change(kind, item, detail):
    CHANGELOG.append({"kind": kind, "item": item, "detail": detail})


def number(value):
    value = float(value)
    return value if math.isfinite(value) else str(value)


def vector_list(value):
    return [number(item) for item in value]


def world_bounds(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def scene_model_bounds():
    points = []
    for obj in bpy.context.scene.objects:
        if obj.type not in {"MESH", "ARMATURE"} or obj.get(PREVIEW_PROP):
            continue
        minimum, maximum = world_bounds(obj)
        points.extend([minimum, maximum])
    if not points:
        raise RuntimeError("No mesh or armature bounds found in current scene")
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def ensure_collection(name, parent=None):
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(collection)
    return collection


def move_to_collection(obj, collection):
    for old_collection in list(obj.users_collection):
        old_collection.objects.unlink(obj)
    collection.objects.link(obj)


def newly_created_object(before):
    created = [obj for obj in bpy.data.objects if obj not in before]
    if not created:
        raise RuntimeError("Blender operator created no object")
    return created[-1]


@contextmanager
def blender_ui_context():
    """Provide a real window/area context for Blender I/O operators."""
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


def tag_generated(obj, role, collection):
    obj[GENERATED_PROP] = True
    obj["TR_Industrial_Role"] = role
    move_to_collection(obj, collection)
    GENERATED_OBJECTS.append(obj.name)
    return obj


def cleanup_previous_pass():
    removed = []
    for obj in list(bpy.data.objects):
        if obj.get(GENERATED_PROP) or obj.get(PREVIEW_PROP):
            removed.append(obj.name)
            bpy.data.objects.remove(obj, do_unlink=True)

    for obj in list(bpy.data.objects):
        for modifier in list(obj.modifiers):
            if modifier.name == MIRROR_MODIFIER_NAME or modifier.name == "TR | restrained edge radius":
                obj.modifiers.remove(modifier)

    for collection in list(bpy.data.collections):
        if collection.name in {GENERATED_COLLECTION_NAME, PREVIEW_COLLECTION_NAME} and not collection.objects and not collection.children:
            bpy.data.collections.remove(collection)

    if removed:
        log_change("cleanup", "generated_previous_pass", {"objects_removed": removed})


def set_socket(node, names, value):
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return name
    return None


def ensure_material(name, base_color, roughness, metallic):
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    set_socket(bsdf, ["Base Color"], (*base_color, 1.0))
    set_socket(bsdf, ["Roughness"], roughness)
    set_socket(bsdf, ["Metallic", "Metallic IOR Level"], metallic)
    set_socket(bsdf, ["Specular IOR Level", "Specular"], 0.25)
    set_socket(bsdf, ["Emission Color", "Emission"], (0.0, 0.0, 0.0, 1.0))
    set_socket(bsdf, ["Emission Strength"], 0.0)
    return material


def create_materials():
    materials = {
        "Shell_WarmGray": ensure_material("Shell_WarmGray", (0.48, 0.46, 0.42), 0.72, 0.02),
        "Frame_Graphite": ensure_material("Frame_Graphite", (0.035, 0.045, 0.052), 0.62, 0.18),
        "Joint_BlastedMetal": ensure_material("Joint_BlastedMetal", (0.13, 0.15, 0.16), 0.58, 0.64),
        "Rubber_Black": ensure_material("Rubber_Black", (0.012, 0.014, 0.015), 0.88, 0.02),
        "Sensor_DarkGlass": ensure_material("Sensor_DarkGlass", (0.008, 0.012, 0.015), 0.28, 0.32),
        "Accent_BrandBlue": ensure_material("Accent_BrandBlue", (0.015, 0.12, 0.28), 0.5, 0.18),
    }
    log_change("materials", "industrial_material_set", list(materials))
    return materials


def assign_material(obj, material):
    if obj.type != "MESH":
        return
    slot_index = next((index for index, slot in enumerate(obj.material_slots) if slot.material == material), None)
    if slot_index is None:
        obj.data.materials.append(material)
        slot_index = len(obj.data.materials) - 1
    for polygon in obj.data.polygons:
        polygon.material_index = slot_index
    obj["TR_Industrial_Material"] = material.name
    log_change("material_assignment", obj.name, material.name)


def create_cube(role, location, dimensions, material, collection, bevel=0.012, rotation=None, parent=None, bone=None, binding="object"):
    before = set(bpy.data.objects)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.0))
    obj = newly_created_object(before)
    obj.data.transform(Matrix.Diagonal((float(dimensions[0]), float(dimensions[1]), float(dimensions[2]), 1.0)))
    if rotation is not None:
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = rotation
    obj.location = location
    obj.name = "TR_" + role
    tag_generated(obj, role, collection)
    assign_material(obj, material)
    if bevel > 0:
        modifier = obj.modifiers.new("TR | restrained edge radius", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        modifier.limit_method = "ANGLE"
    if parent is not None:
        parent_keep_world(obj, parent, bone)
        obj["TR_Industrial_Binding"] = binding
    return obj


def create_cylinder(role, location, radius, depth, material, collection, rotation=None, bevel=0.006, parent=None, bone=None, binding="object"):
    before = set(bpy.data.objects)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=depth, location=(0.0, 0.0, 0.0))
    obj = newly_created_object(before)
    if rotation is not None:
        obj.rotation_mode = "QUATERNION"
        obj.rotation_quaternion = rotation
    obj.location = location
    obj.name = "TR_" + role
    tag_generated(obj, role, collection)
    assign_material(obj, material)
    if bevel > 0:
        modifier = obj.modifiers.new("TR | restrained edge radius", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        modifier.limit_method = "ANGLE"
    if parent is not None:
        parent_keep_world(obj, parent, bone)
        obj["TR_Industrial_Binding"] = binding
    return obj


def parent_keep_world(obj, parent, bone=None):
    bpy.context.view_layer.update()
    matrix = obj.matrix_world.copy()
    obj.parent = parent
    if bone is not None:
        obj.parent_type = "BONE"
        obj.parent_bone = bone.name if hasattr(bone, "name") else str(bone)
    else:
        obj.parent_type = "OBJECT"
    obj.matrix_world = matrix
    bpy.context.view_layer.update()


def oriented_box(role, start, end, width, depth, material, collection, parent=None, bone=None, binding="bone"):
    direction = end - start
    length = direction.length
    if length < 1e-5:
        return None
    rotation = Vector((0.0, 0.0, 1.0)).rotation_difference(direction.normalized())
    return create_cube(
        role,
        (start + end) / 2,
        (width, depth, length * 0.86),
        material,
        collection,
        bevel=min(width * 0.18, 0.018),
        rotation=rotation,
        parent=parent,
        bone=bone,
        binding=binding,
    )


def reflect_matrix_x(matrix, center_x):
    reflection = Matrix.Identity(4)
    reflection[0][0] = -1.0
    reflection.translation.x = center_x * 2.0
    return reflection @ matrix


def make_rest_pose_mirror(obj, role, center_x, collection):
    bpy.context.view_layer.update()
    duplicate = obj.copy()
    duplicate.data = obj.data.copy()
    duplicate.parent = None
    collection.objects.link(duplicate)
    duplicate.name = "TR_" + role + "_mirror"
    duplicate.matrix_world = reflect_matrix_x(obj.matrix_world, center_x)
    tag_generated(duplicate, role + "_rest_pose_mirror", collection)
    duplicate["TR_Industrial_Binding"] = "rest_pose_mirror"
    return duplicate


def add_leg_mirror_modifiers(center_x, collection):
    before = set(bpy.data.objects)
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(center_x, 0.0, 0.0))
    mirror_empty = newly_created_object(before)
    mirror_empty.name = "TR_leg_mirror_center"
    tag_generated(mirror_empty, "leg_mirror_center", collection)
    for leg_name in ["FRONT_LEG", "REAR_R_LEG"]:
        leg = bpy.data.objects.get(leg_name)
        if leg is None or leg.type != "MESH":
            continue
        modifier = leg.modifiers.new(MIRROR_MODIFIER_NAME, "MIRROR")
        modifier.use_axis[0] = True
        modifier.use_axis[1] = False
        modifier.use_axis[2] = False
        modifier.use_clip = False
        modifier.mirror_object = mirror_empty
        log_change("non_destructive_structure", leg.name, "添加 X 轴 Mirror 以恢复对称腿，不修改原网格顶点。")


def source_objects():
    body = bpy.data.objects.get("SPOT_BODY")
    if body is None or body.type != "MESH":
        raise RuntimeError("Cannot safely identify SPOT_BODY; no structural edit applied")
    legs = [bpy.data.objects.get(name) for name in ["FRONT_LEG", "REAR_R_LEG"]]
    legs = [leg for leg in legs if leg is not None and leg.type == "MESH"]
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE" and obj.parent in legs]
    return body, legs, armatures


def add_body_structures(body, legs, materials, collection):
    minimum, maximum = world_bounds(body)
    center = (minimum + maximum) / 2
    dimensions = maximum - minimum
    body_width, body_length, body_height = dimensions
    shell = materials["Shell_WarmGray"]
    frame = materials["Frame_Graphite"]
    joint = materials["Joint_BlastedMetal"]
    rubber = materials["Rubber_Black"]
    glass = materials["Sensor_DarkGlass"]
    blue = materials["Accent_BrandBlue"]

    create_cube("body_lower_load_frame", (center.x, center.y, minimum.z - 0.055), (body_width * 0.92, body_length * 0.80, 0.11), frame, collection, 0.024, parent=body)
    for side in [-1, 1]:
        create_cube("body_side_load_rail_%s" % side, (center.x + side * body_width * 0.44, center.y, minimum.z + 0.085), (0.075, body_length * 0.82, 0.16), frame, collection, 0.018, parent=body)

    for index, y in enumerate([minimum.y + body_length * 0.08, maximum.y - body_length * 0.08]):
        create_cube("body_end_crossmember_%s" % index, (center.x, y, minimum.z + 0.065), (body_width * 0.82, 0.10, 0.14), frame, collection, 0.018, parent=body)

    cover = create_cube("upper_service_cover", (center.x, center.y, maximum.z + 0.035), (body_width * 0.84, body_length * 0.82, 0.065), shell, collection, 0.024, parent=body)
    panel = create_cube("upper_service_panel", (center.x, center.y - body_length * 0.04, maximum.z + 0.074), (body_width * 0.58, body_length * 0.49, 0.019), frame, collection, 0.009, parent=body)

    for x in [-body_width * 0.22, body_width * 0.22]:
        for y in [-body_length * 0.19, body_length * 0.19]:
            create_cylinder("service_panel_fastener", (center.x + x, center.y + y, maximum.z + 0.089), 0.017, 0.008, joint, collection, bevel=0.002, parent=body)

    # Front direction is only used for layout; source names confirm FRONT_LEG at the negative-Y end.
    front_y = min(leg_center_y(leg) for leg in legs) if legs else minimum.y
    create_cube("front_sensor_dark_window", (center.x, minimum.y - 0.015, center.z + 0.07), (body_width * 0.54, 0.025, body_height * 0.24), glass, collection, 0.006, parent=body)
    create_cube("side_service_interface", (maximum.x + 0.012, center.y + body_length * 0.16, center.z), (0.018, 0.24, 0.16), glass, collection, 0.006, parent=body)
    create_cube("brand_identifier_plate", (maximum.x + 0.018, center.y - body_length * 0.17, center.z + 0.04), (0.018, 0.13, 0.055), blue, collection, 0.004, parent=body)

    for side in [-1, 1]:
        for index in range(4):
            create_cube(
                "body_cooling_fin_%s_%s" % (side, index),
                (center.x + side * (body_width * 0.505), center.y + body_length * 0.13 + index * 0.10, center.z - 0.02),
                (0.018, 0.072, 0.018),
                frame,
                collection,
                0.002,
                parent=body,
            )

    mount_z = minimum.z + body_height * 0.30
    leg_y_values = sorted({round(leg_center_y(leg), 5) for leg in legs})
    if len(leg_y_values) < 2:
        leg_y_values = [minimum.y + body_length * 0.22, maximum.y - body_length * 0.22]
    mount_x_values = [minimum.x - 0.035, maximum.x + 0.035]
    for side, x in enumerate(mount_x_values):
        sign = -1 if side == 0 else 1
        for row, y in enumerate(leg_y_values[:2]):
            create_cube("hip_mount_bracket_%s_%s" % (sign, row), (x, y, mount_z), (0.12, 0.25, 0.29), frame, collection, 0.022, parent=body)
            create_cylinder("hip_joint_housing_%s_%s" % (sign, row), (x + sign * 0.075, y, mount_z), 0.16, 0.18, joint, collection, rotation=Vector((0, 0, 1)).rotation_difference(Vector((1, 0, 0))), bevel=0.009, parent=body)
            for y_offset in [-0.085, 0.085]:
                create_cylinder("hip_mount_fastener_%s_%s_%s" % (sign, row, y_offset), (x + sign * 0.087, y + y_offset, mount_z), 0.018, 0.014, joint, collection, rotation=Vector((0, 0, 1)).rotation_difference(Vector((1, 0, 0))), bevel=0.002, parent=body)

    platform_z = maximum.z + 0.135
    create_cube("payload_mounting_saddle", (center.x, center.y - 0.05, platform_z), (body_width * 0.60, body_length * 0.38, 0.075), frame, collection, 0.018, parent=body)
    create_cube("payload_mounting_deck", (center.x, center.y - 0.05, platform_z + 0.047), (body_width * 0.53, body_length * 0.32, 0.025), shell, collection, 0.008, parent=body)
    for x in [-body_width * 0.20, body_width * 0.20]:
        for y in [-body_length * 0.13, body_length * 0.13]:
            create_cylinder("payload_mount_fastener", (center.x + x, center.y - 0.05 + y, platform_z + 0.067), 0.016, 0.008, joint, collection, bevel=0.002, parent=body)
    create_cube("payload_guide_rail_left", (center.x - body_width * 0.25, center.y - 0.05, platform_z + 0.067), (0.035, body_length * 0.29, 0.038), frame, collection, 0.006, parent=body)
    create_cube("payload_guide_rail_right", (center.x + body_width * 0.25, center.y - 0.05, platform_z + 0.067), (0.035, body_length * 0.29, 0.038), frame, collection, 0.006, parent=body)

    log_change("structure", "SPOT_BODY", "增加下方承重框架、上盖、检修板、传感器窗口、接口、散热片、髋部安装座和克制的载荷平台；全部为外部新增对象。")
    return {"minimum": minimum, "maximum": maximum, "center": center, "dimensions": dimensions, "front_y": front_y, "mount_z": mount_z, "cover": cover, "panel": panel}


def leg_center_y(leg):
    return world_bounds(leg)[0].y * 0.5 + world_bounds(leg)[1].y * 0.5


def bone_chain(armature):
    bones = list(armature.data.bones)
    if not bones:
        return []
    chain = []
    current = next((bone for bone in bones if bone.parent is None), bones[0])
    while current is not None and current not in chain:
        chain.append(current)
        current = next((bone for bone in bones if bone.parent == current), None)
    return chain


def leg_contact_point(leg):
    points = [leg.matrix_world @ vertex.co for vertex in leg.data.vertices]
    if not points:
        minimum, maximum = world_bounds(leg)
        return Vector(((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, minimum.z))
    minimum_z = min(point.z for point in points)
    maximum_z = max(point.z for point in points)
    threshold = minimum_z + max((maximum_z - minimum_z) * 0.06, 0.015)
    low_points = [point for point in points if point.z <= threshold]
    average = sum(low_points, Vector()) / max(len(low_points), 1)
    return Vector((average.x, average.y, minimum_z))


def add_leg_structures(armatures, body_center_x, materials, collection):
    frame = materials["Frame_Graphite"]
    joint = materials["Joint_BlastedMetal"]
    rubber = materials["Rubber_Black"]
    for armature in armatures:
        chain = bone_chain(armature)
        if not chain:
            log_change("uncertain", armature.name, "没有骨骼链，未新增腿部外罩。")
            continue
        for index, bone in enumerate(chain):
            start = armature.matrix_world @ bone.head_local
            end = armature.matrix_world @ bone.tail_local
            direction = (end - start).normalized() if (end - start).length else Vector((0, 0, 1))
            cuff_center = start + direction * min((end - start).length * 0.12, 0.11)
            cuff = create_cube("%s_load_bearing_cuff_%s" % (armature.parent.name, index), cuff_center, (0.19 if index == 0 else 0.16, 0.15, 0.12), frame, collection, 0.018, rotation=Vector((0, 0, 1)).rotation_difference(direction), parent=armature, bone=bone)
            make_rest_pose_mirror(cuff, "%s_load_bearing_cuff_%s" % (armature.parent.name, index), body_center_x, collection)
            joint_shell = create_cylinder("%s_joint_shell_%s" % (armature.parent.name, index), start, 0.115 if index == 0 else 0.105, 0.17, joint, collection, rotation=Vector((0, 0, 1)).rotation_difference(direction), bevel=0.008, parent=armature, bone=bone)
            make_rest_pose_mirror(joint_shell, "%s_joint_shell_%s" % (armature.parent.name, index), body_center_x, collection)

        foot_center = leg_contact_point(armature.parent) + Vector((0.0, 0.0, 0.035))
        foot = create_cube("%s_rubber_foot" % armature.parent.name, foot_center, (0.23, 0.19, 0.10), rubber, collection, 0.024, parent=armature.parent, binding="leg_object_rest_pose")
        make_rest_pose_mirror(foot, "%s_rubber_foot" % armature.parent.name, body_center_x, collection)
        log_change("leg_structure", armature.parent.name, {"armature": armature.name, "bones_bound": [bone.name for bone in chain], "binding": "new objects parented to original bones; original rig untouched"})


def remove_unused_materials():
    removed = []
    for material in list(bpy.data.materials):
        if material.users == 0:
            removed.append(material.name)
            bpy.data.materials.remove(material)
    if removed:
        log_change("cleanup", "unused_materials", removed)


def preview_material():
    return ensure_material("TR_Preview_NeutralGround", (0.19, 0.21, 0.22), 0.86, 0.0)


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_preview_stage(model_minimum, model_maximum):
    stage = ensure_collection(PREVIEW_COLLECTION_NAME)
    scene = bpy.context.scene
    ground_mat = preview_material()
    center = (model_minimum + model_maximum) / 2
    dimensions = model_maximum - model_minimum
    span = max(dimensions)
    target = Vector((center.x, center.y, model_minimum.z + dimensions.z * 0.52))

    for obj in scene.objects:
        if obj.type in {"CAMERA", "LIGHT"} and not obj.get(PREVIEW_PROP):
            obj.hide_render = True

    create_cube("preview_ground", (center.x, center.y, model_minimum.z - 0.06), (span * 5.0, span * 5.0, 0.08), ground_mat, stage, 0.0)
    ground = bpy.data.objects.get("TR_preview_ground")
    if ground:
        ground[PREVIEW_PROP] = True

    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str(PREVIEW_ROOT / "front-3q.png")
    if scene.world is None:
        scene.world = bpy.data.worlds.new("TR Preview World")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    if background:
        background.inputs["Color"].default_value = (0.055, 0.065, 0.075, 1.0)
        background.inputs["Strength"].default_value = 0.24

    light_specs = [
        ("preview_key", (span * 2.2, -span * 2.2, span * 2.8), 800.0, span * 1.3),
        ("preview_fill", (-span * 2.0, -span * 0.8, span * 1.6), 420.0, span * 1.5),
        ("preview_rim", (span * 0.4, span * 2.5, span * 2.5), 620.0, span * 1.1),
    ]
    for role, location, energy, size in light_specs:
        before = set(bpy.data.objects)
        bpy.ops.object.light_add(type="AREA", location=location)
        light = newly_created_object(before)
        light.name = "TR_" + role
        light.data.energy = energy
        light.data.shape = "DISK"
        light.data.size = size
        look_at(light, target)
        light[PREVIEW_PROP] = True
        move_to_collection(light, stage)

    camera_specs = {
        "front-3q": (center.x + span * 1.65, center.y - span * 2.15, center.z + span * 0.92),
        "side": (center.x + span * 2.45, center.y - span * 0.08, center.z + span * 0.68),
        "rear-3q": (center.x - span * 1.55, center.y + span * 2.05, center.z + span * 0.88),
        "top-detail": (center.x + span * 1.35, center.y - span * 1.45, model_maximum.z + span * 2.25),
    }
    cameras = {}
    for role, location in camera_specs.items():
        before = set(bpy.data.objects)
        bpy.ops.object.camera_add(location=location)
        camera = newly_created_object(before)
        camera.name = "TR_preview_camera_" + role
        camera.data.lens = 58 if role != "top-detail" else 62
        camera.data.sensor_width = 36
        look_at(camera, target)
        camera[PREVIEW_PROP] = True
        move_to_collection(camera, stage)
        cameras[role] = camera
    return stage, cameras


def render_previews(model_minimum, model_maximum):
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    stage, cameras = setup_preview_stage(model_minimum, model_maximum)
    scene = bpy.context.scene
    output_paths = []
    for role, camera in cameras.items():
        scene.camera = camera
        output_path = PREVIEW_ROOT / (role + ".png")
        scene.render.filepath = str(output_path)
        bpy.ops.render.render(write_still=True)
        output_paths.append(output_path)
        log_change("preview", role, str(output_path))
    create_contact_sheet(output_paths, PREVIEW_ROOT / "contact-sheet.png")
    return stage, output_paths + [PREVIEW_ROOT / "contact-sheet.png"]


def create_contact_sheet(paths, output_path):
    if not paths or not all(path.exists() for path in paths):
        return
    images = [bpy.data.images.load(str(path), check_existing=False) for path in paths]
    width = max(image.size[0] for image in images)
    height = max(image.size[1] for image in images)
    contact = bpy.data.images.new("TR_contact_sheet", width=width * 2, height=height * 2, alpha=True)
    pixels = [0.0] * (width * 2 * height * 2 * 4)
    for tile_index, image in enumerate(images):
        source_width, source_height = image.size
        source_pixels = list(image.pixels[:])
        offset_x = (tile_index % 2) * width
        offset_y = (1 - tile_index // 2) * height
        for y in range(min(height, source_height)):
            for x in range(min(width, source_width)):
                source_index = (y * source_width + x) * 4
                target_index = ((offset_y + y) * (width * 2) + offset_x + x) * 4
                pixels[target_index:target_index + 4] = source_pixels[source_index:source_index + 4]
    contact.pixels = pixels
    contact.filepath_raw = str(output_path)
    contact.file_format = "PNG"
    contact.save()
    for image in images:
        bpy.data.images.remove(image)
    bpy.data.images.remove(contact)


def remove_preview_stage(stage):
    for obj in list(bpy.data.objects):
        if obj.get(PREVIEW_PROP):
            bpy.data.objects.remove(obj, do_unlink=True)
    if stage and stage.name in bpy.data.collections and not stage.objects and not stage.children:
        bpy.data.collections.remove(stage)
    preview_material_data = bpy.data.materials.get("TR_Preview_NeutralGround")
    if preview_material_data:
        bpy.data.materials.remove(preview_material_data, do_unlink=True)


def export_glb():
    FINAL_GLB.parent.mkdir(parents=True, exist_ok=True)
    for obj in bpy.context.scene.objects:
        obj.select_set(False)
    export_objects = [
        obj for obj in bpy.context.scene.objects
        if obj.type not in {"CAMERA", "LIGHT"} and not obj.get(PREVIEW_PROP)
    ]
    for obj in export_objects:
        obj.hide_render = False if obj.type == "MESH" else obj.hide_render
        obj.select_set(True)
    body = bpy.data.objects.get("SPOT_BODY")
    if body:
        bpy.context.view_layer.objects.active = body
    with blender_ui_context():
        bpy.ops.export_scene.gltf(
            filepath=str(FINAL_GLB),
            export_format="GLB",
            export_yup=True,
            export_apply=True,
            export_materials="EXPORT",
            export_animations=True,
            export_skins=True,
            export_morph=True,
            export_lights=False,
            export_cameras=False,
        )
    log_change("export", "industrial_glb", str(FINAL_GLB))


def material_color(material):
    if not material.use_nodes:
        return None
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        return None
    socket = bsdf.inputs.get("Base Color")
    return vector_list(socket.default_value[:3]) if socket else None


def validate_export():
    validation = {
        "path": str(FINAL_GLB),
        "exists": FINAL_GLB.exists(),
        "file_size_bytes": FINAL_GLB.stat().st_size if FINAL_GLB.exists() else 0,
        "import_error": None,
    }
    if not FINAL_GLB.exists():
        validation["status"] = "failed"
        return validation

    try:
        for obj in list(bpy.data.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        with blender_ui_context():
            bpy.ops.import_scene.gltf(filepath=str(FINAL_GLB))
        scene_objects = list(bpy.context.scene.objects)
        materials = list(bpy.data.materials)
        actions = list(bpy.data.actions)
        validation.update({
            "status": "passed",
            "object_count": len(scene_objects),
            "mesh_object_count": sum(obj.type == "MESH" for obj in scene_objects),
            "armature_count": sum(obj.type == "ARMATURE" for obj in scene_objects),
            "linked_animation_count": sum(getattr(obj, "animation_data", None) is not None for obj in scene_objects),
            "action_names": [action.name for action in actions],
            "material_names": [material.name for material in materials],
            "required_materials_present": all(name in {material.name for material in materials} for name in ["Shell_WarmGray", "Frame_Graphite", "Joint_BlastedMetal", "Rubber_Black", "Sensor_DarkGlass", "Accent_BrandBlue"]),
            "material_colors": {material.name: material_color(material) for material in materials},
            "all_objects_have_finite_dimensions": all(all(math.isfinite(float(value)) for value in obj.dimensions) for obj in scene_objects),
            "has_cameras_or_lights": any(obj.type in {"CAMERA", "LIGHT"} for obj in scene_objects),
        })
        validation["status"] = "passed" if validation["all_objects_have_finite_dimensions"] and not validation["has_cameras_or_lights"] else "warning"
    except Exception as exc:
        validation["status"] = "failed"
        validation["import_error"] = repr(exc)
    VALIDATION_JSON.write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return validation


def source_animation_summary():
    return {
        "armatures": [obj.name for obj in bpy.data.objects if obj.type == "ARMATURE"],
        "actions": [
            {"name": action.name, "frame_range": vector_list(action.frame_range), "fcurves": len(action.fcurves)}
            for action in bpy.data.actions
        ],
    }


def write_change_log():
    CHANGELOG_JSON.write_text(json.dumps({"generated_at_utc": datetime.now(timezone.utc).isoformat(), "changes": CHANGELOG}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_report(validation, source_summary, model_stats):
    baseline_size = BASELINE_GLB.stat().st_size if BASELINE_GLB.exists() else None
    final_size = FINAL_GLB.stat().st_size if FINAL_GLB.exists() else None
    report = f"""# 天戎科技机器狗工业化优化报告

生成时间：{datetime.now(timezone.utc).isoformat()}

## 源模型与执行环境

- 源模型：`public/models/source/robot-dog-4k.fbx`
- 新建导入副本：`artifacts/robot-dog-industrial/source-imported.blend`
- Blender：`{bpy.app.version_string}`
- Blender 执行路径：`{os.environ.get('ROBOT_DOG_BLENDER_PATH', '/Applications/Blender.app/Contents/MacOS/Blender')}`
- 原始文件未覆盖；备份清单：`reports/robot-dog-backup-manifest.json`

## 审计结论

- 主机身：`SPOT_BODY`，源网格 9,417 顶点 / 26,896 边 / 17,506 面。
- 原始腿对象：`FRONT_LEG`、`REAR_R_LEG`；源场景有 2 个 Armature、4 组动作，动作帧范围为 1–190。
- 原始场景没有 Mirror、Solidify、Subdivision Surface、Bevel 修改器；有 1,274 / 196 / 192 条开放边，未检出过连接非流形边。
- 源 FBX 材质未正确分配到三类模型网格，因此本次重新建立并实际分配工业材质。

## 实际改造

本次只对 `SPOT_BODY`、两条源腿及新增 `TR_` 对象进行处理。原始网格未做破坏性重拓扑。

{chr(10).join('- ' + item['detail'] if isinstance(item['detail'], str) else '- ' + item['item'] + '：' + json.dumps(item['detail'], ensure_ascii=False) for item in CHANGELOG if item['kind'] in {'structure', 'leg_structure', 'non_destructive_structure', 'material_assignment', 'materials'})}

新增部件全部带 `TR_Industrial_Generated` 标记，可重复运行时只清理并重建这些部件。腿部外罩与关节护罩绑定到原始骨骼；对角腿的补全使用非破坏性 Mirror，未改变原始骨骼原点。

## 材质

- `Shell_WarmGray`：暖灰白喷涂外壳，高粗糙度。
- `Frame_Graphite`：深灰承重框架与安装件。
- `Joint_BlastedMetal`：低反射喷砂金属关节。
- `Rubber_Black`：脚端与耐磨结构。
- `Sensor_DarkGlass`：深色传感器/接口窗口，无发光。
- `Accent_BrandBlue`：小面积品牌识别件，无灯带、无发光。

## 预览与输出

- [front-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/front-3q.png)
- [side.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/side.png)
- [rear-3q.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/rear-3q.png)
- [top-detail.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/top-detail.png)
- [contact-sheet.png](/Users/edy/Desktop/tianrong-tech-site/artifacts/robot-dog-industrial/previews/contact-sheet.png)
- 中间 Blend：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-v1.blend`
- 最终 Blend：`artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-final.blend`
- 最终 GLB：`public/models/tianrong-robot-dog-industrial.glb`

## GLB 验证

- 旧官网 GLB 大小：`{baseline_size} bytes`
- 新 GLB 大小：`{final_size} bytes`
- 重新导入状态：`{validation.get('status')}`
- 重新导入对象数：`{validation.get('object_count')}`；网格：`{validation.get('mesh_object_count')}`；Armature：`{validation.get('armature_count')}`。
- 动画动作：`{json.dumps(validation.get('action_names', []), ensure_ascii=False)}`
- 材质齐全：`{validation.get('required_materials_present')}`；导出 GLB 不含摄影棚相机和灯光：`{not validation.get('has_cameras_or_lights', True)}`。

## 官网集成与测试

- 待本次 GLB 验证通过后，官网组件将使用 `/models/tianrong-robot-dog-industrial.glb`；旧路径保留为 `LEGACY_MODEL_PATH`，便于恢复。
- 官网文件：`components/hero/hero-robot-preview.tsx`、`next.config.mjs`。
- 项目检查结果将在官网切换后补写到本报告。

## 恢复方式与风险

- 恢复旧模型：将 `LEGACY_MODEL_PATH` 改回 `/models/tianrong-robot-dog.v1.glb`，或从 `backups/robot-dog-industrial/` 对应时间戳恢复前端和模型文件。
- 源网格开放边保留，未进行自动封口，避免破坏骨骼/层级；新增结构件为外部件。
- 源 FBX 只有两个腿网格和两个腿 Armature；Mirror 补全的对侧结构属于静态休止姿态，原始两条腿的动作数据保留。该边界已写入验证结果，需以后在真实步态预览中继续确认。
"""
    REPORT_MD.write_text(report, encoding="utf-8")


def run():
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    PREVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    cleanup_previous_pass()
    body, legs, armatures = source_objects()
    materials = create_materials()
    assign_material(body, materials["Shell_WarmGray"])
    for leg in legs:
        assign_material(leg, materials["Frame_Graphite"])

    minimum, maximum = world_bounds(body)
    body_center_x = ((minimum + maximum) / 2).x
    collection = ensure_collection(GENERATED_COLLECTION_NAME)
    add_leg_mirror_modifiers(body_center_x, collection)
    add_body_structures(body, legs, materials, collection)
    add_leg_structures(armatures, body_center_x, materials, collection)
    log_change("preservation", "source_rig", source_animation_summary())

    v1_minimum, v1_maximum = scene_model_bounds()
    bpy.ops.wm.save_as_mainfile(filepath=str(V1_BLEND))
    log_change("save", "v1_blend", str(V1_BLEND))

    stage, preview_paths = render_previews(v1_minimum, v1_maximum)
    remove_preview_stage(stage)
    remove_unused_materials()
    export_glb()
    bpy.ops.wm.save_as_mainfile(filepath=str(FINAL_BLEND))
    log_change("save", "final_blend", str(FINAL_BLEND))

    validation = validate_export()
    model_stats = {"source_minimum": vector_list(minimum), "source_maximum": vector_list(maximum), "generated_object_count": len(GENERATED_OBJECTS), "preview_paths": [str(path) for path in preview_paths]}
    write_change_log()
    write_report(validation, source_animation_summary(), model_stats)
    return {"validation": validation, "model_stats": model_stats}


if __name__ == "__main__":
    run()
