#!/usr/bin/env python3
"""GUI Blender runner for the existing industrial repair pass."""

from pathlib import Path
import json
import traceback

import bpy


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/repair_robot_dog.py"
STATUS = ROOT / "reports/robot-dog-industrial-repair-run.json"


def run():
    namespace = {"__name__": "__main__", "__file__": str(SCRIPT)}
    exec(compile(SCRIPT.read_text(encoding="utf-8"), str(SCRIPT), "exec"), namespace)
    result = namespace["run"]()
    STATUS.write_text(json.dumps({"status": "passed", "result": result}, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")


def run_and_quit():
    try:
        run()
    except Exception as exc:
        traceback.print_exc()
        STATUS.write_text(json.dumps({"status": "failed", "error": repr(exc)}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    finally:
        bpy.app.timers.register(quit_later, first_interval=2.0)
    return None


def quit_later():
    bpy.ops.wm.quit_blender()
    return None


bpy.app.timers.register(run_and_quit, first_interval=2.0)
