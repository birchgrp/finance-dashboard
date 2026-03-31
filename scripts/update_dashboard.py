from __future__ import annotations

import argparse
import json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
MANUAL_PATH = DATA_DIR / "manual.json"
AUTO_PATH = DATA_DIR / "auto.json"
FINAL_PATH = DATA_DIR / "final.json"


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def build_badges(label: str) -> list[str]:
    return [label]


def summarise_gold(items: list[dict[str, Any]]) -> dict[str, str]:
    if not items:
        return {
            "latestReserves": "--",
            "ytdChange": "--",
            "buyingStreak": "--",
        }

    latest = items[0]
    first_year = None
    ytd_change = 0.0
    streak = 0

    for item in items:
        date_text = item.get("date") or ""
        if not date_text:
            continue
        year = date_text[:4]
        if first_year is None:
            first_year = year
        if year == first_year:
            ytd_change += float(item.get("tonnes") or 0)
        if item.get("status") == "bought":
            streak += 1
        elif streak > 0:
            break

    latest_reserves = float(latest.get("totalReserves") or 0)
    return {
        "latestReserves": f"{latest_reserves:.1f}t" if latest_reserves else "--",
        "ytdChange": f"{ytd_change:+.1f}t",
        "buyingStreak": f"{streak} mo",
    }


def format_gold_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    formatted: list[dict[str, Any]] = []
    for item in items:
        tonnes = float(item.get("tonnes") or 0)
        total_reserves = float(item.get("totalReserves") or 0)
        tonnes_display = f"{tonnes:+.1f}t" if tonnes else "0.0t"
        formatted.append(
            {
                "id": item.get("id"),
                "month": item.get("month"),
                "date": item.get("date"),
                "tonnesDisplay": tonnes_display,
                "totalReservesDisplay": f"{total_reserves:.1f}t" if total_reserves else "--",
                "status": item.get("status", "paused"),
            }
        )
    return formatted


def build_final_payload(manual: dict[str, Any], auto: dict[str, Any]) -> dict[str, Any]:
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    manual_sections = manual["sections"]
    auto_sections = auto["sections"]

    payload = {
        "title": manual.get("title", "Finance Dashboard"),
        "summary": manual.get(
            "summary",
            "Static dashboard built for GitHub Pages, manual refreshes, and future AI-friendly maintenance.",
        ),
        "generatedAt": generated_at,
        "sources": {
            "manualUpdatedAt": manual.get("updatedAt", "Unknown"),
            "autoUpdatedAt": auto.get("updatedAt", "Unknown"),
        },
        "refresh": {
            "mode": "Manual only",
            "notes": [
                "Edit manual.json for hand-maintained sections.",
                "Edit auto.json or extend update_dashboard.py for refresh-generated sections.",
                "Regenerate final.json after updates.",
            ],
        },
        "sections": {},
    }

    payload["sections"]["s1"] = {
        "number": "01",
        "title": manual_sections["s1"]["title"],
        "subtitle": manual_sections["s1"].get("subtitle", ""),
        "badges": build_badges("Manual"),
        "columns": deepcopy(manual_sections["s1"]["columns"]),
        "rows": deepcopy(manual_sections["s1"]["rows"]),
    }
    payload["sections"]["s2"] = {
        "number": "02",
        "title": manual_sections["s2"]["title"],
        "subtitle": manual_sections["s2"].get("subtitle", ""),
        "badges": build_badges("Manual"),
        "columns": deepcopy(manual_sections["s2"]["columns"]),
        "rows": deepcopy(manual_sections["s2"]["rows"]),
    }
    payload["sections"]["s3"] = {
        "number": "03",
        "title": manual_sections["s3"]["title"],
        "subtitle": manual_sections["s3"].get("subtitle", ""),
        "badges": build_badges("Manual"),
        "columns": deepcopy(manual_sections["s3"]["columns"]),
        "rows": deepcopy(manual_sections["s3"]["rows"]),
    }
    payload["sections"]["s4"] = {
        "number": "04",
        "title": auto_sections["s4"]["title"],
        "subtitle": auto_sections["s4"].get("subtitle", ""),
        "badges": build_badges("Auto"),
        "sourceNote": auto_sections["s4"].get("sourceNote", ""),
        "items": deepcopy(auto_sections["s4"]["items"]),
    }
    payload["sections"]["s5"] = {
        "number": "05",
        "title": auto_sections["s5"]["title"],
        "subtitle": auto_sections["s5"].get("subtitle", ""),
        "badges": build_badges("Auto"),
        "sourceNote": auto_sections["s5"].get("sourceNote", ""),
        "items": deepcopy(auto_sections["s5"]["items"]),
    }
    payload["sections"]["s6"] = {
        "number": "06",
        "title": auto_sections["s6"]["title"],
        "subtitle": auto_sections["s6"].get("subtitle", ""),
        "badges": build_badges("Auto"),
        "sourceNote": auto_sections["s6"].get("sourceNote", ""),
        "items": deepcopy(auto_sections["s6"]["items"]),
    }
    payload["sections"]["s8"] = {
        "number": "08",
        "title": auto_sections["s8"]["title"],
        "subtitle": auto_sections["s8"].get("subtitle", ""),
        "badges": build_badges("Auto"),
        "sourceNote": auto_sections["s8"].get("sourceNote", ""),
        "summary": summarise_gold(auto_sections["s8"]["items"]),
        "items": format_gold_items(auto_sections["s8"]["items"]),
    }
    payload["sections"]["notes"] = {
        "number": "99",
        "title": manual_sections["notes"]["title"],
        "subtitle": manual_sections["notes"].get("subtitle", ""),
        "badges": build_badges("Manual"),
        "items": deepcopy(manual_sections["notes"]["items"]),
    }
    return payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Merge dashboard data into final.json")
    parser.add_argument("--manual", default=str(MANUAL_PATH), help="Path to manual.json")
    parser.add_argument("--auto", default=str(AUTO_PATH), help="Path to auto.json")
    parser.add_argument("--final", default=str(FINAL_PATH), help="Path to output final.json")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manual = load_json(Path(args.manual))
    auto = load_json(Path(args.auto))
    final_payload = build_final_payload(manual, auto)
    save_json(Path(args.final), final_payload)
    print(f"Wrote {Path(args.final)}")


if __name__ == "__main__":
    main()
