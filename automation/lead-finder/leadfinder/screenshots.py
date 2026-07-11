"""Optional desktop + mobile screenshots of audited websites.

Screenshots need a headless browser. To keep the tool dependency-light and fully
runnable without one, Playwright is OPTIONAL and imported lazily:

  * If Playwright is installed AND screenshots are enabled AND we're not in
    mock/dry-run mode, real screenshots are captured.
  * Otherwise capture is skipped gracefully and the audit records `None` paths
    with a `screenshot_status` note.

Install (optional):  pip install playwright  &&  python -m playwright install chromium
"""

from __future__ import annotations

from pathlib import Path

from .logging_setup import get_logger

LOGGER = get_logger()

DESKTOP_VIEWPORT = {"width": 1280, "height": 800}
MOBILE_VIEWPORT = {"width": 390, "height": 844}


def playwright_available() -> bool:
    try:
        import playwright  # noqa: F401
        return True
    except ImportError:
        return False


def capture(place_id: str, url: str, paths, timeout_ms: int = 15000) -> dict:
    """Capture desktop + mobile screenshots. Returns {'desktop':..,'mobile':..}.

    Paths are relative to the output dir (for the dashboard/CSV). If capture is
    unavailable or fails, returns {'desktop': None, 'mobile': None, 'status': ..}.
    """
    if not playwright_available():
        return {"desktop": None, "mobile": None, "status": "playwright_not_installed"}

    try:
        from playwright.sync_api import sync_playwright
    except Exception as exc:  # noqa: BLE001
        return {"desktop": None, "mobile": None, "status": f"import_failed:{exc}"}

    paths.ensure()
    desktop_path = paths.screenshots_desktop / f"{place_id}.png"
    mobile_path = paths.screenshots_mobile / f"{place_id}.png"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for viewport, out in ((DESKTOP_VIEWPORT, desktop_path), (MOBILE_VIEWPORT, mobile_path)):
                page = browser.new_page(viewport=viewport)
                page.goto(url, timeout=timeout_ms, wait_until="load")
                page.screenshot(path=str(out), full_page=False)
                page.close()
            browser.close()
    except Exception as exc:  # noqa: BLE001 - never let a screenshot fail the run
        LOGGER.warning("Screenshot failed for %s: %s", url, exc)
        return {"desktop": None, "mobile": None, "status": f"capture_failed:{exc}"}

    return {
        "desktop": str(desktop_path.relative_to(paths.output)).replace("\\", "/"),
        "mobile": str(mobile_path.relative_to(paths.output)).replace("\\", "/"),
        "status": "captured",
    }
