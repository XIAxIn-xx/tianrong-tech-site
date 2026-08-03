#!/usr/bin/env python3
"""Dump generated object world transforms from final blend for pipeline QA."""

from pathlib import Path
import json

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
FINAL_BLEND = ROOT / "artifacts/robot-dog-industrial/tianrong-robot-dog-industrial-final.blend"
OUT = ROOT / "reports/robot-dog-industrial-generated-objects.json"


def bounds(obj):
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return {"min": list(minimum), "max": list(maximum), "dimensions": list(maximum - minimum), "center": list((minimum + maximum) / 2)}


def quit_later():
    bpy.ops.wm.quit_blender()
    return None


def run():
    bpy.ops.wm.open_mainfile(filepath=str(FINAL_BLEND))
    rows = []
    for obj in bpy.context.scene.objects:
        if not obj.get("TR_Industrial_Generated"):
            continue
        rows.append({
            "name": obj.name,
            "role": obj.get("TR_Industrial_Role"),
            "parent": obj.parent.name if obj.parent else None,
            "local_location": list(obj.location),
            "location": list(obj.matrix_world.to_translation()),
            "bounds": bounds(obj) if obj.type == "MESH" else None,
        })
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    bpy.app.timers.register(quit_later, first_interval=1.0)
    return None


bpy.app.timers.register(run, first_interval=2.0)
