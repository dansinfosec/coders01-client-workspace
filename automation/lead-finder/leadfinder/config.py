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
BRAVE_API_KEY_ENV = "BRAVE_SEARCH_API_KEY"


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


def get_brave_api_key(required: bool = True) -> str | None:
    """Return the Brave Search API key from env or .env, or None.

    Used ONLY by the website-discovery enrichment phase. Like the Places key it
    is read only from the environment / a local .env file and is NEVER logged,
    printed, or written to any output artifact.
    """
    key = os.environ.get(BRAVE_API_KEY_ENV) or load_env().get(BRAVE_API_KEY_ENV)
    key = (key or "").strip()
    if not key and required:
        raise RuntimeError(
            f"{BRAVE_API_KEY_ENV} is not set. Add it to .env or set the environment "
            f"variable before running real website discovery. (Never hardcode or commit it.)"
        )
    return key or None


@dataclass
class Paths:
    output: Path
    # Optional run tag isolating a website-discovery run's state/output files
    # (e.g. "pilot2") so a second pilot never touches the first's progress,
    # cost-state or results. None => the original, untagged filenames.
    run_tag: str | None = None

    def _wd(self, stem: str, ext: str = ".json") -> Path:
        return self.output / (f"{stem}-{self.run_tag}{ext}" if self.run_tag else f"{stem}{ext}")

    @property
    def leads_json(self) -> Path:
        return self.output / "leads.json"

    @property
    def leads_csv(self) -> Path:
        return self.output / "leads.csv"

    @property
    def audits_json(self) -> Path:
        # Tag-aware but backward-compatible: untagged still resolves to the
        # exact legacy "website-audits.json" the full-dataset audit has always
        # used. A run_tag (e.g. an isolated pilot) gets its own separate file.
        return self._wd("website-audits")

    # --- Isolated website-audit pilot (direct-HTTP-only, sampled scope) -----
    @property
    def audit_pilot_results_json(self) -> Path:
        return self._wd("website-audit")

    @property
    def audit_pilot_progress_json(self) -> Path:
        return self._wd("website-audit-progress")

    @property
    def audit_pilot_report_json(self) -> Path:
        return self._wd("website-audit-report")

    @property
    def audit_pilot_csv(self) -> Path:
        return self._wd("website-audit", ".csv")

    @property
    def audit_pilot_fingerprint_json(self) -> Path:
        # Scope/config fingerprint locking in exactly what a --run-tag'd audit
        # run covers, so a later resume can be refused if scope or config drift.
        return self._wd("website-audit-fingerprint")

    @property
    def audit_scope_tagged_json(self) -> Path:
        # A persistent, tag-specific scope (e.g. the full remaining production
        # scope after excluding an already-audited pilot's place_ids) —
        # separate from the untagged, shared `audit_scope_json`.
        return self._wd("website-audit-scope")

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
    def dashboard_data(self) -> Path:
        # Combined multi-industry data the master dashboard reads.
        return self.output / "dashboard-data.json"

    @property
    def industries_dir(self) -> Path:
        return self.output / "industries"

    @property
    def batch_progress(self) -> Path:
        # Checkpoint of completed/failed category × location combinations.
        return self.output / "batch-progress.json"

    @property
    def cost_state(self) -> Path:
        # Cumulative USD spend for the CostGuard (survives crashes/resumes).
        return self.output / "cost-state.json"

    # --- Website-discovery enrichment (phase 1) --------------------------
    # A SEPARATE, self-contained set of files so this phase never reads or
    # writes the Google Places cost-state.json / batch-progress.json above.
    @property
    def website_discovery_json(self) -> Path:
        return self._wd("website-discovery")

    @property
    def website_discovery_progress(self) -> Path:
        # Resume checkpoint keyed by place_id (independent of batch-progress).
        return self._wd("website-discovery-progress")

    @property
    def website_discovery_cost_state(self) -> Path:
        # USD spend for the search provider ONLY — never the Places cost-state.
        return self._wd("website-discovery-cost-state")

    @property
    def discovered_websites_csv(self) -> Path:
        return self._wd("discovered-websites", ".csv")

    @property
    def manual_website_review_csv(self) -> Path:
        return self._wd("manual-website-review", ".csv")

    @property
    def website_not_found_csv(self) -> Path:
        return self._wd("website-not-found", ".csv")

    @property
    def rejected_candidates_json(self) -> Path:
        return self._wd("rejected-candidates")

    @property
    def website_discovery_report(self) -> Path:
        return self._wd("website-discovery-report")

    @property
    def website_discovery_reeval(self) -> Path:
        # Offline re-evaluation of an existing discovery run (no network).
        return self._wd("website-discovery-reeval")

    @property
    def website_fetch_retry_report(self) -> Path:
        # Retry of known candidate-fetch failures (no Brave, no new queries).
        return self._wd("website-fetch-retry-report")

    @property
    def manual_review_queue_csv(self) -> Path:
        # Human-review queue for fetch_failed leads (unresolved website status).
        return self._wd("manual-review-queue", ".csv")

    # --- Preparation-split review outputs (wrong-industry / adjacent) --------
    @property
    def wrong_industry_review_csv(self) -> Path:
        return self.output / "wrong-industry-review-full1.csv"

    @property
    def wrong_industry_review_json(self) -> Path:
        return self.output / "wrong-industry-review-full1.json"

    @property
    def adjacent_industry_review_csv(self) -> Path:
        return self.output / "adjacent-industry-review-full1.csv"

    @property
    def adjacent_industry_review_json(self) -> Path:
        return self.output / "adjacent-industry-review-full1.json"

    # --- Canonical latest-status consolidation + operational queues ----------
    @property
    def discovery_canonical_json(self) -> Path:
        return self.output / "website-discovery-canonical.json"

    @property
    def discovery_canonical_csv(self) -> Path:
        return self.output / "website-discovery-canonical.csv"

    @property
    def discovery_canonical_summary(self) -> Path:
        return self.output / "website-discovery-canonical-summary.json"

    @property
    def accepted_website_review_csv(self) -> Path:
        return self.output / "accepted-website-review.csv"

    @property
    def accepted_website_review_json(self) -> Path:
        return self.output / "accepted-website-review.json"

    @property
    def confirmed_discovered_websites_csv(self) -> Path:
        return self.output / "confirmed-discovered-websites.csv"

    @property
    def identity_manual_review_csv(self) -> Path:
        return self.output / "identity-manual-review.csv"

    @property
    def fetch_failed_manual_review_csv(self) -> Path:
        return self.output / "fetch-failed-manual-review.csv"

    @property
    def no_reliable_official_website_csv(self) -> Path:
        return self.output / "no-reliable-official-website-found.csv"

    @property
    def rejected_candidate_review_csv(self) -> Path:
        return self.output / "rejected-candidate-review.csv"

    @property
    def audit_scope_json(self) -> Path:
        # Prepared (not executed) website-audit scope: Google-supplied + confirmed
        # discovered websites, deduplicated. Read-only until an audit is authorized.
        return self.output / "website-audit-scope.json"

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


def make_industry_paths(industry: str, output_dir: str | Path | None = None,
                        run_tag: str | None = None) -> Paths:
    """Paths rooted at output/industries/<industry>/ so industries stay separate.

    `run_tag` isolates a website-discovery run's state/output files (e.g. a second
    pilot) without affecting leads.json or the untagged run's files."""
    base = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
    return Paths(output=base / "industries" / industry, run_tag=run_tag)


def list_industries(output_dir: str | Path | None = None) -> list[str]:
    """Slugs of industries that have data (a leads.json) under output/industries/."""
    base = Path(output_dir) if output_dir else DEFAULT_OUTPUT_DIR
    idir = base / "industries"
    if not idir.exists():
        return []
    return sorted(p.name for p in idir.iterdir()
                  if p.is_dir() and (p / "leads.json").exists())


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
