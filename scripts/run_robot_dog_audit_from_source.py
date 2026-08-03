#!/usr/bin/env python3
"""Automated source import + read-only audit runner.

This runner is launched by Blender in GUI mode because the installed Blender
build crashes during background Metal initialization on this machine.
"""

from pathlib import Path
import os
import traceback

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_FBX = PROJECT_ROOT / "public/models/source/robot-dog-4k.fbx"
SOURCE_GLB = PROJECT_ROOT / "public/models/source/robot-dog-4k.glb"
IMPORTED_BLEND = PROJECT_ROOT / "artifacts/robot-dog-industrial/source-imported.blend"
AUDIT_SCRIPT = PROJECT_ROOT / "scripts/audit_robot_dog.py"


def run():
    source_path = Path(os.environ.get("ROBOT_DOG_AUDIT_SOURCE", str(SOURCE_FBX))).expanduser().resolve()
    imported_blend = Path(os.environ.get("ROBOT_DOG_AUDIT_BLEND", str(IMPORTED_BLEND))).expanduser().resolve()
    imported_blend.parent.mkdir(parents=True, exist_ok=True)
    # The factory startup file can still contain default objects. This is a
    # fresh temporary scene, so unlink only those scene datablocks before import.
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)

    if source_path.suffix.lower() == ".fbx" and source_path.exists():
        print("Importing FBX source: %s" % source_path)
        bpy.ops.import_scene.fbx(filepath=str(source_path), automatic_bone_orientation=False)
    elif source_path.suffix.lower() in {".glb", ".gltf"} and source_path.exists():
        print("Importing GLB source: %s" % source_path)
        bpy.ops.import_scene.gltf(filepath=str(source_path))
    elif SOURCE_GLB.exists():
        print("Requested source unavailable; importing fallback GLB: %s" % SOURCE_GLB)
        bpy.ops.import_scene.gltf(filepath=str(SOURCE_GLB))
    else:
        raise FileNotFoundError("No robot-dog FBX or GLB source found")

    bpy.ops.wm.save_as_mainfile(filepath=str(imported_blend))
    print("Saved imported source blend: %s" % imported_blend)

    namespace = {"__name__": "__main__", "__file__": str(AUDIT_SCRIPT)}
    exec(compile(AUDIT_SCRIPT.read_text(encoding="utf-8"), str(AUDIT_SCRIPT), "exec"), namespace)
    print("Source audit completed.")


def run_and_quit():
    try:
        run()
    except Exception:
        traceback.print_exc()
    finally:
        bpy.ops.wm.quit_blender()
    return None


# Blender's GUI context is not ready when --python executes during startup.
# Delay the operator call so the built-in FBX importer has a valid active view.
bpy.app.timers.register(run_and_quit, first_interval=2.0)
