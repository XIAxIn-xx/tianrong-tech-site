#!/usr/bin/env python3
"""Read-only audit for the currently opened Tianrong robot-dog Blender scene.

Run from Blender's Scripting workspace with the target .blend open. The script
does not create, delete, select, rename, transform, or modify scene objects.
It writes only reports/robot-dog-audit.json (or ROBOT_DOG_AUDIT_OUTPUT when
that environment variable is set).
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import struct
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


REPORT_RELATIVE_PATH = Path("reports/robot-dog-audit.json")
FLOAT_EPSILON = 1e-4
MAX_SAMPLE_ITEMS = 40


def number(value):
    """Return JSON-safe finite numbers."""
    value = float(value)
    return value if math.isfinite(value) else str(value)


def vector_values(value):
    return [number(item) for item in value]


def json_safe(value, depth=0):
    """Convert common Blender RNA values without recursively dumping datablocks."""
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, (bytes, bytearray)):
        return {"encoding": "hex", "value": bytes(value).hex()}
    if isinstance(value, float):
        return number(value)
    if isinstance(value, (Vector, Matrix)):
        return [json_safe(row, depth + 1) for row in value]
    if isinstance(value, bpy.types.ID):
        return {"type": type(value).__name__, "name": value.name}
    if isinstance(value, (list, tuple)):
        return [json_safe(item, depth + 1) for item in value]
    if depth < 2 and hasattr(value, "__iter__"):
        try:
            return [json_safe(item, depth + 1) for item in value]
        except Exception:
            pass
    if hasattr(value, "name"):
        try:
            return {"type": type(value).__name__, "name": value.name}
        except Exception:
            pass
    return str(value)


def object_world_bounds(obj):
    """Return world-space AABB from the object's bound box, without evaluation."""
    if not hasattr(obj, "bound_box") or len(obj.bound_box) == 0:
        return None
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def bounds_record(obj):
    bounds = object_world_bounds(obj)
    if bounds is None:
        return {"available": False}
    minimum, maximum = bounds
    return {
        "available": True,
        "min": vector_values(minimum),
        "max": vector_values(maximum),
        "dimensions": vector_values(maximum - minimum),
        "center": vector_values((minimum + maximum) / 2),
    }


def transform_record(obj):
    local_scale = vector_values(obj.scale)
    world_matrix = obj.matrix_world
    try:
        world_determinant = number(world_matrix.to_3x3().determinant())
    except Exception:
        world_determinant = None
    return {
        "location": vector_values(obj.location),
        "world_location": vector_values(world_matrix.to_translation()),
        "rotation_mode": obj.rotation_mode,
        "rotation_euler": vector_values(obj.rotation_euler),
        "rotation_quaternion": vector_values(obj.rotation_quaternion),
        "scale": local_scale,
        "dimensions": vector_values(obj.dimensions),
        "has_unapplied_scale": any(abs(value - 1.0) > FLOAT_EPSILON for value in obj.scale),
        "has_negative_scale": any(value < -FLOAT_EPSILON for value in obj.scale),
        "world_matrix_determinant": world_determinant,
        "world_has_negative_determinant": world_determinant is not None and world_determinant < -FLOAT_EPSILON,
    }


def topology_record(mesh):
    """Count boundary, loose, and over-connected edges from mesh face loops."""
    edge_face_counts = [0] * len(mesh.edges)
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            edge_index = mesh.loops[loop_index].edge_index
            if 0 <= edge_index < len(edge_face_counts):
                edge_face_counts[edge_index] += 1

    open_edges = [index for index, count in enumerate(edge_face_counts) if count <= 1]
    boundary_edges = [index for index, count in enumerate(edge_face_counts) if count == 1]
    loose_edges = [index for index, count in enumerate(edge_face_counts) if count == 0]
    over_connected_edges = [index for index, count in enumerate(edge_face_counts) if count > 2]
    non_manifold_edges = sorted(set(loose_edges + over_connected_edges))

    return {
        "open_edge_count": len(open_edges),
        "boundary_edge_count": len(boundary_edges),
        "loose_edge_count": len(loose_edges),
        "over_connected_edge_count": len(over_connected_edges),
        "non_manifold_edge_count": len(non_manifold_edges),
        "has_open_edges": bool(open_edges),
        "has_non_manifold_edges": bool(non_manifold_edges),
        "open_edge_sample": open_edges[:MAX_SAMPLE_ITEMS],
        "non_manifold_edge_sample": non_manifold_edges[:MAX_SAMPLE_ITEMS],
    }


def mesh_signature(mesh):
    """Exact, order-sensitive geometry signature for duplicate-object screening."""
    digest = hashlib.sha1()
    digest.update(struct.pack("<III", len(mesh.vertices), len(mesh.edges), len(mesh.polygons)))
    for vertex in mesh.vertices:
        digest.update(struct.pack("<3d", *[float(value) for value in vertex.co]))
    for edge in mesh.edges:
        digest.update(struct.pack("<2I", *[int(value) for value in edge.vertices]))
    for polygon in mesh.polygons:
        digest.update(struct.pack("<I", len(polygon.vertices)))
        digest.update(struct.pack("<%dI" % len(polygon.vertices), *[int(value) for value in polygon.vertices]))
    return digest.hexdigest()


def modifier_parameters(modifier):
    """Read modifier RNA properties, keeping pointer and collection values compact."""
    parameters = {}
    failures = []
    try:
        properties = modifier.bl_rna.properties
    except Exception as exc:
        return {"_read_error": str(exc)}

    for prop in properties:
        identifier = prop.identifier
        if identifier in {"rna_type", "name", "type"}:
            continue
        try:
            value = getattr(modifier, identifier)
            if prop.type == "COLLECTION":
                parameters[identifier] = {"collection_length": len(value)}
            else:
                parameters[identifier] = json_safe(value)
        except Exception as exc:
            failures.append({"property": identifier, "error": str(exc)})
    if failures:
        parameters["_read_failures"] = failures
    return parameters


def modifier_record(modifier):
    return {
        "name": modifier.name,
        "type": modifier.type,
        "show_viewport": bool(modifier.show_viewport),
        "show_render": bool(modifier.show_render),
        "show_in_editmode": bool(modifier.show_in_editmode),
        "show_on_cage": bool(modifier.show_on_cage),
        "parameters": modifier_parameters(modifier),
    }


def mesh_record(obj):
    mesh = obj.data
    topology = topology_record(mesh)
    return {
        "data_name": mesh.name,
        "vertices": len(mesh.vertices),
        "edges": len(mesh.edges),
        "faces": len(mesh.polygons),
        "materials_slots": [slot.material.name if slot.material else None for slot in obj.material_slots],
        "vertex_groups": [group.name for group in obj.vertex_groups],
        "armature_modifiers": [
            {
                "name": modifier.name,
                "object": modifier.object.name if modifier.object else None,
            }
            for modifier in obj.modifiers
            if modifier.type == "ARMATURE"
        ],
        "topology": topology,
        "geometry_signature": mesh_signature(mesh),
    }


def object_record(obj):
    record = {
        "name": obj.name,
        "type": obj.type,
        "parent": obj.parent.name if obj.parent else None,
        "parent_type": obj.parent_type if obj.parent else None,
        "collection_names": [collection.name for collection in obj.users_collection],
        "transform": transform_record(obj),
        "world_bounds": bounds_record(obj),
        "modifiers": [modifier_record(modifier) for modifier in obj.modifiers],
        "animation": animation_data_record(obj),
    }
    if obj.type == "MESH":
        record["mesh"] = mesh_record(obj)
    elif obj.type == "ARMATURE":
        record["armature"] = armature_record(obj)
    return record


def action_record(action):
    if action is None:
        return None
    try:
        frame_range = vector_values(action.frame_range)
    except Exception:
        frame_range = None
    return {
        "name": action.name,
        "users": action.users,
        "frame_range": frame_range,
        "fcurve_count": len(action.fcurves),
        "groups": [group.name for group in action.groups],
    }


def animation_data_record(obj):
    animation_data = getattr(obj, "animation_data", None)
    if animation_data is None:
        return {"has_animation_data": False}
    nla_tracks = []
    for track in animation_data.nla_tracks:
        nla_tracks.append({
            "name": track.name,
            "mute": bool(track.mute),
            "is_solo": bool(track.is_solo),
            "strips": [
                {
                    "name": strip.name,
                    "action": strip.action.name if strip.action else None,
                    "frame_start": number(strip.frame_start),
                    "frame_end": number(strip.frame_end),
                }
                for strip in track.strips
            ],
        })
    return {
        "has_animation_data": True,
        "action": action_record(animation_data.action),
        "nla_tracks": nla_tracks,
        "driver_count": len(animation_data.drivers),
    }


def armature_record(obj):
    armature = obj.data
    return {
        "data_name": armature.name,
        "bone_count": len(armature.bones),
        "bones": [
            {
                "name": bone.name,
                "parent": bone.parent.name if bone.parent else None,
                "use_deform": bool(bone.use_deform),
                "head": vector_values(bone.head_local),
                "tail": vector_values(bone.tail_local),
            }
            for bone in armature.bones
        ],
    }


def material_usage(scene_objects):
    usage = {material.name: [] for material in bpy.data.materials}
    for obj in scene_objects:
        if not hasattr(obj, "material_slots"):
            continue
        for slot_index, slot in enumerate(obj.material_slots):
            if slot.material is None:
                continue
            usage.setdefault(slot.material.name, []).append({
                "object": obj.name,
                "slot_index": slot_index,
            })

    return [
        {
            "name": material.name,
            "use_nodes": bool(material.use_nodes),
            "users": material.users,
            "usage": usage.get(material.name, []),
        }
        for material in bpy.data.materials
    ]


def all_actions_record():
    return [action_record(action) for action in bpy.data.actions]


def duplicate_record(scene_objects, object_records):
    mesh_data_users = {}
    object_signatures = {}
    records_by_name = {record["name"]: record for record in object_records}

    for obj in scene_objects:
        if obj.type != "MESH":
            continue
        data_key = obj.data.as_pointer()
        mesh_data_users.setdefault(str(data_key), []).append(obj.name)
        geometry_hash = records_by_name[obj.name]["mesh"]["geometry_signature"]
        transform_key = tuple(round(float(value), 6) for row in obj.matrix_world for value in row)
        object_key = (geometry_hash, transform_key)
        object_signatures.setdefault(str(object_key), []).append(obj.name)

    linked_data_groups = [names for names in mesh_data_users.values() if len(names) > 1]
    identical_object_groups = [names for names in object_signatures.values() if len(names) > 1]
    return {
        "has_shared_mesh_data": bool(linked_data_groups),
        "shared_mesh_data_groups": linked_data_groups,
        "has_potential_identical_objects": bool(identical_object_groups),
        "potential_identical_object_groups": identical_object_groups,
        "interpretation": "这些是筛查结果，不等于应当删除；镜像、实例和左右腿可能是有意重复。",
    }


def modifier_presence(scene_objects):
    target_types = {
        "MIRROR": "Mirror",
        "SOLIDIFY": "Solidify",
        "SUBSURF": "Subdivision Surface",
        "BEVEL": "Bevel",
    }
    result = {}
    type_summary = {}
    for obj in scene_objects:
        for modifier in obj.modifiers:
            type_summary.setdefault(modifier.type, []).append({"object": obj.name, "modifier": modifier.name})

    for modifier_type, label in target_types.items():
        entries = type_summary.get(modifier_type, [])
        result[modifier_type] = {
            "label": label,
            "present": bool(entries),
            "count": len(entries),
            "objects": entries,
        }
    return result, type_summary


PART_KEYWORDS = {
    "body": [("机身", 8), ("躯干", 8), ("chassis", 7), ("torso", 7), ("body", 6), ("main_body", 7), ("shell", 3)],
    "upper_cover": [("上盖", 8), ("顶盖", 8), ("cover", 6), ("lid", 6), ("top", 3), ("cap", 3)],
    "front_leg": [("前腿", 9), ("foreleg", 9), ("fore_leg", 9), ("front_leg", 9), ("front", 4), ("leg", 2)],
    "rear_leg": [("后腿", 9), ("hindleg", 9), ("hind_leg", 9), ("rear_leg", 9), ("back_leg", 9), ("rear", 4), ("hind", 4), ("leg", 2)],
    "thigh": [("大腿", 9), ("thigh", 9), ("upper_leg", 8), ("upperleg", 8), ("femur", 8)],
    "shin": [("小腿", 9), ("shin", 9), ("lower_leg", 8), ("lowerleg", 8), ("tibia", 8)],
    "joint": [("关节", 9), ("joint", 8), ("servo", 7), ("actuator", 7), ("motor", 5), ("hip", 5), ("knee", 5), ("ankle", 5), ("髋", 7), ("膝", 7), ("踝", 7)],
    "foot": [("脚端", 9), ("足端", 9), ("脚掌", 9), ("foot", 8), ("paw", 8), ("sole", 6), ("toe", 6), ("wheel", 5), ("轮足", 8)],
    "payload": [("背包", 9), ("载荷", 9), ("payload", 9), ("backpack", 9), ("platform", 7), ("rack", 5), ("top_mount", 7), ("inspection_pod", 7)],
}


def object_spatial_features(obj, scene_bounds):
    bounds = object_world_bounds(obj)
    if bounds is None:
        return None
    minimum, maximum = bounds
    center = (minimum + maximum) / 2
    dimensions = maximum - minimum
    scene_minimum, scene_maximum = scene_bounds
    scene_dimensions = scene_maximum - scene_minimum
    horizontal_axis = "Y" if scene_dimensions.y >= scene_dimensions.x else "X"
    horizontal_span = scene_dimensions.y if horizontal_axis == "Y" else scene_dimensions.x
    horizontal_position = center.y if horizontal_axis == "Y" else center.x
    scene_horizontal_minimum = scene_minimum.y if horizontal_axis == "Y" else scene_minimum.x
    z_span = scene_dimensions.z
    volume = max(float(dimensions.x * dimensions.y * dimensions.z), 0.0)
    scene_volume = max(float(scene_dimensions.x * scene_dimensions.y * scene_dimensions.z), 0.0)
    return {
        "center": center,
        "dimensions": dimensions,
        "volume_ratio": volume / scene_volume if scene_volume else 0.0,
        "z_normalized": (center.z - scene_minimum.z) / z_span if z_span else 0.5,
        "horizontal_normalized": (horizontal_position - scene_horizontal_minimum) / horizontal_span if horizontal_span else 0.5,
        "horizontal_axis": horizontal_axis,
        "is_flat": max(float(dimensions.x), float(dimensions.y)) > max(float(dimensions.z), FLOAT_EPSILON) * 2.5,
        "is_compact": max(dimensions) <= max(scene_dimensions) * 0.3 if max(scene_dimensions) else False,
    }


def part_candidate(category, obj, features):
    lowered_name = obj.name.lower()
    score = 0
    evidence = []
    hits = []
    for term, weight in PART_KEYWORDS[category]:
        if term.lower() in lowered_name:
            score += weight
            hits.append(term)
    if hits:
        evidence.append("名称命中: " + ", ".join(hits))

    if features is None:
        return score, evidence

    if category == "body":
        if features["volume_ratio"] >= 0.18:
            score += 3
            evidence.append("相对场景体积较大")
        if 0.25 <= features["z_normalized"] <= 0.72:
            score += 1
            evidence.append("位于场景中部高度")
    elif category == "upper_cover":
        if features["z_normalized"] >= 0.62:
            score += 2
            evidence.append("位于较高位置")
        if features["is_flat"]:
            score += 2
            evidence.append("几何外形较扁平")
    elif category in {"front_leg", "rear_leg"}:
        if "leg" in lowered_name or "腿" in lowered_name:
            score += 2
            evidence.append("名称含腿部线索")
        if features["z_normalized"] <= 0.60:
            score += 1
            evidence.append("位于较低位置")
        if category == "front_leg" and not any(term in lowered_name for term in ["front", "fore", "前"]):
            evidence.append("未命中明确前向命名，前腿含义未确认")
        if category == "rear_leg" and not any(term in lowered_name for term in ["rear", "hind", "back", "后"]):
            evidence.append("未命中明确后向命名，后腿含义未确认")
    elif category in {"thigh", "shin"}:
        if "leg" in lowered_name or "腿" in lowered_name:
            score += 1
            evidence.append("名称含腿部线索，但未命中明确分段词")
    elif category == "joint":
        if features["is_compact"]:
            score += 1
            evidence.append("相对场景尺寸较小")
    elif category == "foot":
        if features["z_normalized"] <= 0.35:
            score += 1
            evidence.append("位于较低位置")
    elif category == "payload":
        if features["z_normalized"] >= 0.60:
            score += 2
            evidence.append("位于机身上方区域")
        if features["is_flat"]:
            score += 1
            evidence.append("几何外形较扁平")
    return score, evidence


def preliminary_part_identification(scene_objects):
    mesh_objects = [obj for obj in scene_objects if obj.type == "MESH"]
    bounds = [object_world_bounds(obj) for obj in mesh_objects]
    bounds = [item for item in bounds if item is not None]
    if not bounds:
        return {
            "status": "unresolved",
            "method": "对象名称关键词 + 世界空间位置/尺寸的弱启发式筛查",
            "spatial_assumptions": ["没有可用网格包围盒，无法进行空间筛查。"],
            "categories": {category: {"status": "unresolved", "candidates": []} for category in PART_KEYWORDS},
        }

    scene_minimum = Vector((min(item[0].x for item in bounds), min(item[0].y for item in bounds), min(item[0].z for item in bounds)))
    scene_maximum = Vector((max(item[1].x for item in bounds), max(item[1].y for item in bounds), max(item[1].z for item in bounds)))
    scene_bounds = (scene_minimum, scene_maximum)
    feature_map = {obj.name: object_spatial_features(obj, scene_bounds) for obj in mesh_objects}
    category_results = {}

    for category in PART_KEYWORDS:
        candidates = []
        for obj in mesh_objects:
            score, evidence = part_candidate(category, obj, feature_map[obj.name])
            if score < 2:
                continue
            candidates.append({
                "object": obj.name,
                "score": score,
                "evidence": evidence,
                "position": vector_values(feature_map[obj.name]["center"]),
                "dimensions": vector_values(feature_map[obj.name]["dimensions"]),
            })
        candidates.sort(key=lambda item: (-item["score"], item["object"]))
        candidates = candidates[:8]

        if not candidates:
            category_results[category] = {
                "status": "unresolved",
                "reason": "没有足够名称或空间证据，不做对象语义猜测。",
                "candidates": [],
            }
            continue

        top_score = candidates[0]["score"]
        tied = [item for item in candidates if item["score"] == top_score]
        has_explicit_direction = any(
            term.lower() in candidates[0]["object"].lower()
            for term in (["front", "fore", "前"] if category == "front_leg" else ["rear", "hind", "back", "后"])
        ) if category in {"front_leg", "rear_leg"} else True
        if not has_explicit_direction:
            status = "ambiguous"
            reason = "存在腿部线索，但对象名称没有确认前后方向。"
        elif len(tied) > 1:
            status = "ambiguous"
            reason = "最高分候选并列，无法确认唯一对象。"
        elif top_score >= 8:
            status = "likely_candidate"
            reason = "名称证据较强；仍需在 Blender 视图中人工确认。"
        else:
            status = "ambiguous"
            reason = "证据偏弱，仅作初步候选。"
        category_results[category] = {"status": status, "reason": reason, "candidates": candidates}

    return {
        "status": "preliminary_only",
        "method": "对象名称关键词 + 世界空间位置/尺寸的弱启发式筛查",
        "spatial_assumptions": [
            "仅将 Z 轴作为暂定高度轴，未确认模型是否以 Z-up 建模。",
            "按 X/Y 较长方向暂定纵向轴；纵向正方向未知，因此前后方向不由位置单独推断。",
            "分类不读取材质外观、不改变对象、不替用户确认对象语义。",
        ],
        "scene_bounds": {
            "min": vector_values(scene_minimum),
            "max": vector_values(scene_maximum),
            "dimensions": vector_values(scene_maximum - scene_minimum),
            "tentative_longitudinal_axis": "Y" if (scene_maximum - scene_minimum).y >= (scene_maximum - scene_minimum).x else "X",
        },
        "categories": category_results,
    }


def resolve_project_root():
    """Prefer this script's repo; fall back to the saved blend directory."""
    candidate_paths = []
    try:
        candidate_paths.append(Path(__file__).resolve())
    except NameError:
        pass

    for text in bpy.data.texts:
        if not text.filepath:
            continue
        try:
            candidate_paths.append(Path(bpy.path.abspath(text.filepath)).resolve())
        except Exception:
            continue

    if bpy.data.filepath:
        candidate_paths.append(Path(bpy.data.filepath).resolve())
    candidate_paths.append(Path.cwd().resolve())

    for path in candidate_paths:
        start = path.parent if path.suffix else path
        for parent in [start, *start.parents]:
            if (parent / "package.json").exists() and (parent / "public").exists():
                return parent

    if bpy.data.filepath:
        return Path(bpy.data.filepath).resolve().parent
    return Path.cwd().resolve()


def resolve_report_path():
    override = os.environ.get("ROBOT_DOG_AUDIT_OUTPUT")
    if override:
        return Path(override).expanduser().resolve()
    return resolve_project_root() / REPORT_RELATIVE_PATH


def build_report():
    scene = bpy.context.scene
    scene_objects = list(scene.objects)
    object_records = [object_record(obj) for obj in scene_objects]
    unlinked_objects = [obj.name for obj in bpy.data.objects if obj.name not in {item.name for item in scene_objects}]
    modifier_targets, modifier_types = modifier_presence(scene_objects)
    mesh_objects = [obj for obj in scene_objects if obj.type == "MESH"]
    mesh_records = [record for record in object_records if record["type"] == "MESH"]
    open_edge_objects = [record["name"] for record in mesh_records if record["mesh"]["topology"]["has_open_edges"]]
    non_manifold_objects = [record["name"] for record in mesh_records if record["mesh"]["topology"]["has_non_manifold_edges"]]
    linked_animation = any(record["animation"]["has_animation_data"] for record in object_records)

    return {
        "audit": {
            "name": "robot-dog-read-only-audit",
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "read_only_scene_audit": True,
            "report_path_is_only_write": True,
        },
        "blender": {
            "version": bpy.app.version_string,
            "version_tuple": list(bpy.app.version),
            "build_branch": getattr(bpy.app, "build_branch", None),
        },
        "blend_file": {
            "path": bpy.data.filepath or None,
            "is_saved": bool(bpy.data.filepath),
            "scene_name": scene.name,
            "frame_current": scene.frame_current,
            "frame_start": scene.frame_start,
            "frame_end": scene.frame_end,
            "unit_system": scene.unit_settings.system,
            "unit_scale": number(scene.unit_settings.scale_length),
        },
        "scene_summary": {
            "object_count": len(scene_objects),
            "mesh_object_count": len(mesh_objects),
            "armature_object_count": sum(obj.type == "ARMATURE" for obj in scene_objects),
            "objects_not_linked_to_active_scene": unlinked_objects,
        },
        "objects": object_records,
        "materials": {
            "material_count": len(bpy.data.materials),
            "items": material_usage(scene_objects),
        },
        "animation": {
            "has_armature": any(obj.type == "ARMATURE" for obj in scene_objects),
            "armature_objects": [obj.name for obj in scene_objects if obj.type == "ARMATURE"],
            "has_linked_object_or_armature_animation": linked_animation,
            "has_action_datablocks": bool(bpy.data.actions),
            "actions": all_actions_record(),
        },
        "modifiers": {
            "all_types": {
                modifier_type: {
                    "count": len(entries),
                    "items": entries,
                }
                for modifier_type, entries in sorted(modifier_types.items())
            },
            "required_type_checks": modifier_targets,
        },
        "mesh_checks": {
            "objects_with_open_edges": open_edge_objects,
            "objects_with_non_manifold_edges": non_manifold_objects,
            "has_open_edges": bool(open_edge_objects),
            "has_non_manifold_meshes": bool(non_manifold_objects),
            "has_unapplied_scale": any(record["transform"]["has_unapplied_scale"] for record in object_records),
            "has_negative_scale": any(record["transform"]["has_negative_scale"] for record in object_records),
        },
        "duplicates": duplicate_record(scene_objects, object_records),
        "preliminary_part_identification": preliminary_part_identification(scene_objects),
    }


def main():
    report_path = resolve_report_path()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report = build_report()
    report["audit"]["report_path"] = str(report_path)
    report_json = json.dumps(report, ensure_ascii=False, indent=2, default=json_safe)
    report_path.write_text(report_json + "\n", encoding="utf-8")

    print("\n=== Tianrong robot-dog Blender audit ===")
    print("Read-only scene audit complete.")
    print("Report: %s" % report_path)
    print(report_json)
    print("=== End audit ===\n")


if __name__ == "__main__":
    main()
