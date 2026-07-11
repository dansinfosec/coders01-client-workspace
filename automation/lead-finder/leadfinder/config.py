"""Configuration: .env loading, paths and the request budget.

The API key is read ONLY from the environment / a local .env file. It is never
hardcoded, never logged and never written to any output file.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

# lead-finder/ root (two levels up from this file: leadfinder/config.py).
TOOL_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = TOOL_ROOT / ".env"
DEFAULT_OUTPUT_DIR = TOOL_ROOT / "output"

API_KEY_ENV = "GOOGLE_MAPS_API_KEY"


def load_env(path: Path = ENV_PATH) -> dict:
    """Minimal .env parser (KEY=VALUE per line). No dependency on python-dotenv.

    Values already present in the real environment take precedence, so CI/shell
    exports override the file. Lines starting with '#' and blanks are ignored.
    """
    values: dict[str, str] = {}
    if path.exists():
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key:
                values[key] = val
    # Real environment wins.
    for key in list(values):
        if os.environ.get(key):
            values[key] = os.environ[key]
    return values


def get_api_key(required: bool = True) -> str | None:
    """Return the Google Maps/Places API key from env or .env, or None."""
    key = os.environ.get(API_KEY_ENV) or load_env().get(API_KEY_ENV)
    key = (key or "").strip()
    if not key and required:
        raise RuntimeError(
            f"{API_KEY_ENV} is not set. Copy .env.example to .env and add your key, "
            f"or set the environment variable. (Never hardcode or commit the key.)"
        )
    return key or None


@dataclass
class Paths:
    output: Path

    @property
    def leads_json(self) -> Path:
        return self.output / "leads.json"

    @property
    def leads_csv(self) -> Path:
        return self.output / "leads.csv"

    @property
    def audits_json(self) -> Path:
        return self.output / "website-audits.json"

    @property
    def run_report(self) -> Path:
        return self.output / "run-report.json"

    @property
    def dashboard_html(self) -> Path:
        return self.output / "dashboard.html"

    @property
    def review_state(self) -> Path:
        return self.output / "review-state.json"

    @property
    def screenshots_desktop(self) -> Path:
        return self.output / "screenshots" / "desktop"

    @property
    def screenshots_mobile(self) -> Path:
        return self.output / "screenshots" / "mobile"

    def ensure(self) -> None:
        self.screenshots_desktop.mkdir(parents=True, exist_ok=True)
        self.screenshots_mobile.mkdir(parents=True, exist_ok=True)


def make_paths(output_dir: str | Path | None = None) -> Paths:
    return Paths(output=Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR)


@dataclass
class Budget:
    """Caps the number of billable Places API requests for a run."""
    max_requests: int = 200
    used: int = 0

    def remaining(self) -> int:
        return max(0, self.max_requests - self.used)

    def can_spend(self, n: int = 1) -> bool:
        return self.used + n <= self.max_requests

    def spend(self, n: int = 1) -> None:
        self.used += n
