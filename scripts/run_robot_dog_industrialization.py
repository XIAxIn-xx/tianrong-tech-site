#!/usr/bin/env python3
"""Load imported source blend and run the industrialization pass automatically."""

from pathlib import Path
import os
import traceback

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_BLEND = PROJECT_ROOT / "artifacts/robot-dog-industrial/source-imported.blend"
INDUSTRIAL_SCRIPT = PROJECT_ROOT / "scripts/industrialize_robot_dog.py"


def run():
    if not INPUT_BLEND.exists():
        raise FileNotFoundError("Missing source-imported.blend: %s" % INPUT_BLEND)
    bpy.ops.wm.open_mainfile(filepath=str(INPUT_BLEND))
    namespace = {"__name__": "__main__", "__file__": str(INDUSTRIAL_SCRIPT)}
    exec(compile(INDUSTRIAL_SCRIPT.read_text(encoding="utf-8"), str(INDUSTRIAL_SCRIPT), "exec"), namespace)


def run_and_quit():
    try:
        run()
    except Exception:
        traceback.print_exc()
    finally:
        bpy.ops.wm.quit_blender()
    return None


bpy.app.timers.register(run_and_quit, first_interval=2.0)
