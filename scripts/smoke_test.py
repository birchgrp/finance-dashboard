from __future__ import annotations

import json
import sys
import time
from html.parser import HTMLParser
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


MARKERS = ["Finance Dashboard", 'id="app"', "dashboard-title"]


class CheckFailure(RuntimeError):
    pass


class MarkerParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.seen_app_id = False
        self.text_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "main":
            return
        for key, value in attrs:
            if key == "id" and value == "app":
                self.seen_app_id = True

    def handle_data(self, data: str) -> None:
        self.text_parts.append(data)


def fetch(url: str) -> tuple[int, str, bytes]:
    request = Request(url, headers={"User-Agent": "finance-dashboard-smoke-test"})
    with urlopen(request, timeout=20) as response:
        status = response.getcode()
        final_url = response.geturl()
        body = response.read()
    return status, final_url, body


def fetch_with_retry(url: str, label: str, attempts: int = 12, delay_seconds: int = 5) -> tuple[int, str, bytes]:
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return fetch(url)
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            print(f"[retry {attempt}/{attempts}] {label} not ready yet: {exc}", file=sys.stderr)
            if attempt < attempts:
                time.sleep(delay_seconds)
    raise CheckFailure(f"{label} failed after {attempts} attempts: {last_error}")


def require_success(status: int, label: str, url: str) -> None:
    if not 200 <= status < 300:
        raise CheckFailure(f"{label} returned HTTP {status} for {url}")


def require_root_lands_on_app(final_url: str) -> None:
    path = urlparse(final_url).path.rstrip("/")
    if not path.endswith("/app"):
        raise CheckFailure(f"Root URL did not land on /app/. Final URL was {final_url}")


def require_dashboard_html(body: bytes, label: str) -> None:
    html = body.decode("utf-8", errors="replace")
    parser = MarkerParser()
    parser.feed(html)
    visible_text = " ".join(parser.text_parts)
    missing = [marker for marker in MARKERS if marker != 'id="app"' and marker not in html and marker not in visible_text]
    if not parser.seen_app_id:
        missing.append('id="app"')
    if missing:
        raise CheckFailure(f"{label} HTML missing expected marker(s): {', '.join(missing)}")


def require_json(body: bytes, label: str) -> dict[str, Any]:
    try:
        return json.loads(body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise CheckFailure(f"{label} was not valid JSON: {exc}") from exc


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/smoke_test.py <base_url>", file=sys.stderr)
        return 2

    base_url = sys.argv[1].rstrip("/") + "/"
    checks = {
        "root": base_url,
        "app": urljoin(base_url, "app/"),
        "final_json": urljoin(base_url, "data/final.json"),
        "manual_json": urljoin(base_url, "data/manual.json"),
        "auto_json": urljoin(base_url, "data/auto.json"),
    }

    try:
        root_status, root_final_url, root_body = fetch_with_retry(checks["root"], "Root URL")
        require_success(root_status, "Root URL", checks["root"])
        require_root_lands_on_app(root_final_url)
        require_dashboard_html(root_body, "Root URL")

        app_status, app_final_url, app_body = fetch_with_retry(checks["app"], "/app/")
        require_success(app_status, "/app/", checks["app"])
        if not urlparse(app_final_url).path.rstrip("/").endswith("/app"):
            raise CheckFailure(f"/app/ did not resolve to the dashboard page. Final URL was {app_final_url}")
        require_dashboard_html(app_body, "/app/")

        final_status, _, final_body = fetch_with_retry(checks["final_json"], "/data/final.json")
        require_success(final_status, "/data/final.json", checks["final_json"])
        final_payload = require_json(final_body, "/data/final.json")
        if "sections" not in final_payload:
            raise CheckFailure("/data/final.json parsed successfully but is missing 'sections'")

        manual_status, _, _ = fetch_with_retry(checks["manual_json"], "/data/manual.json")
        require_success(manual_status, "/data/manual.json", checks["manual_json"])

        auto_status, _, _ = fetch_with_retry(checks["auto_json"], "/data/auto.json")
        require_success(auto_status, "/data/auto.json", checks["auto_json"])
    except CheckFailure as exc:
        print(f"Smoke test failed: {exc}", file=sys.stderr)
        return 1

    print(f"Smoke test passed for {base_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
