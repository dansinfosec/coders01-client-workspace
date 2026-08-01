"""Autogarage Audit & Sales Review dashboard — payload assembly + HTML/JS.

Extends the existing dashboard architecture (leadfinder/dashboard.py: a
self-contained, dependency-free HTML page with an inline data snapshot and a
live `fetch()` refresh) for a NEW use case the master multi-industry
dashboard was never designed for: reviewing the completed garage audit and
its sales-ready queues, with human decisions persisted server-side (not
browser localStorage) so "Save and next" survives a restart and is usable
from the CLI export too.

This module builds the DATA and the STATIC page shell. The live decision
save / export / first-call-batch actions are served by
`leadfinder/audit_dashboard_server.py` (a stdlib-only local HTTP server) —
this module has no server/socket code and makes no network request itself.
"""

from __future__ import annotations

import json

from . import audit_queues as aq
from . import human_review as hr
from . import config

MENTION_FIELDS = ["mentions_apk", "mentions_maintenance", "mentions_repair", "mentions_tires",
                  "mentions_diagnostics", "mentions_aircon", "mentions_bodywork", "mentions_towing",
                  "mentions_vehicle_sales"]

# Tabs whose rows come straight from one `build_all_queue_rowsets` bucket.
_QUEUE_TABS = {
    "priority": "sales-ready-priority",
    "secondary": "sales-ready-secondary",
    "do_not_contact": "do-not-auto-contact",
    "wrong_industry": "suspected-wrong-industry-review",
    "insufficient_evidence": "insufficient-industry-evidence-review",
    "identity_conflicts": "identity-conflict-review",
    "technical_failures": "technical-failures",
}


def _detected_services(record: dict) -> str:
    return " | ".join(f.replace("mentions_", "") for f in MENTION_FIELDS if record.get(f))


def _suggested_opportunity(record: dict) -> list[str]:
    """Suggested sales angle — ONLY from stored fields, never invented."""
    notes = []
    if not (record.get("has_real_booking_calendar") or record.get("has_appointment_request_form")):
        notes.append("no_online_appointment")
    elif record.get("has_appointment_request_form") and not record.get("has_real_booking_calendar"):
        notes.append("appointment_available_but_no_real_calendar")
    if record.get("has_real_booking_calendar") and not record.get("has_rdw_or_vehicle_data_integration"):
        notes.append("appointment_available_but_no_vehicle_lookup")
    if not record.get("has_contact_form"):
        notes.append("no_clear_contact_form")
    if not record.get("has_whatsapp_link"):
        notes.append("no_whatsapp")
    if not record.get("has_visible_phone"):
        notes.append("missing_visible_phone")
    if not record.get("mobile_viewport"):
        notes.append("weak_mobile_technical_indicators")
    return notes


def _row(pid: str, record: dict, lead: dict, provenance: dict, decisions: dict) -> dict:
    decision = decisions.get(pid, {})
    return {
        "place_id": pid,
        "business_name": record.get("business_name"),
        "city": lead.get("city") or record.get("city"),
        "phone": lead.get("phone"),
        "website_source": record.get("website_source"),
        "source_run": provenance.get(pid, "unknown"),
        "submitted_url": record.get("submitted_url"),
        "final_url": record.get("final_url"),
        "outcome": record.get("outcome"),
        "final_audit_classification": record.get("final_audit_classification"),
        "industry_relevance_status": record.get("industry_relevance_status"),
        "identity_confidence": record.get("identity_confidence"),
        "identity_match_outcome": record.get("identity_match_outcome"),
        "identity_evidence": record.get("identity_evidence") or [],
        "identity_conflicting_evidence": record.get("identity_conflicting_evidence") or [],
        "garage_feature_score": record.get("garage_feature_score"),
        "website_quality_score": record.get("website_quality_score"),
        "manual_review_required": bool(record.get("manual_review_required")),
        "excluded_from_automatic_garage_outreach": bool(record.get("excluded_from_automatic_garage_outreach")),
        "external_redirect": bool(record.get("external_redirect")),
        "has_appointment_request_form": bool(record.get("has_appointment_request_form")),
        "has_real_booking_calendar": bool(record.get("has_real_booking_calendar")),
        "can_enter_license_plate": bool(record.get("can_enter_license_plate")),
        "has_vehicle_lookup_result": bool(record.get("has_vehicle_lookup_result")),
        "has_rdw_or_vehicle_data_integration": bool(record.get("has_rdw_or_vehicle_data_integration")),
        "has_whatsapp_link": bool(record.get("has_whatsapp_link")),
        "has_contact_form": bool(record.get("has_contact_form")),
        "has_visible_phone": bool(record.get("has_visible_phone")),
        "mobile_viewport": bool(record.get("mobile_viewport")),
        "detected_services": _detected_services(record),
        "audit_warnings": record.get("audit_warnings") or [],
        "suggested_opportunity": _suggested_opportunity(record),
        "decision": {k: decision.get(k) for k in hr.DECISION_FIELDS} | {
            "reviewed_at": decision.get("reviewed_at"), "updated_at": decision.get("updated_at"),
        } if decision else None,
    }


def build_payload(industry: str, output_dir=None) -> dict:
    """Assembles everything the dashboard needs in one JSON-serializable
    dict. Read-only: makes no fetch, no write. Every count is DERIVED from
    the current files at call time — nothing here is hardcoded."""
    paths = config.make_industry_paths(industry, output_dir)
    latest, provenance, leads_by_id = aq.load_combined_latest(industry, output_dir)
    built = aq.build_all_queue_rowsets(latest, leads_by_id)
    queues = built["queues"]
    decisions = hr.load_decisions(paths)

    scope_doc = None
    try:
        import leadfinder.storage as storage
        scope_doc = storage.read_json(paths.audit_scope_json, default=None)
    except Exception:  # noqa: BLE001 — overview still renders without it
        scope_doc = None
    audit_ready_total = (scope_doc or {}).get("audit_ready_count", len(latest))

    def rows_for(bucket_key):
        name = _QUEUE_TABS[bucket_key]
        return [_row(pid, r, leads_by_id.get(pid, {}), provenance, decisions) for pid, r in queues[name]]

    tabs = {key: rows_for(key) for key in _QUEUE_TABS}

    sample_rows_raw = hr.load_sample_rows(industry, output_dir)
    sample = []
    for raw in sample_rows_raw:
        pid = raw["place_id"]
        record = latest.get(pid, {})
        lead = leads_by_id.get(pid, {})
        sample.append(_row(pid, record, lead, provenance, decisions))

    reviewed_count = sum(1 for r in sample if r["decision"] and r["decision"].get("verdict"))
    verdict_counts = {"approve": 0, "reject": 0, "manual_review": 0}
    for r in sample:
        v = r["decision"].get("verdict") if r["decision"] else None
        if v in verdict_counts:
            verdict_counts[v] += 1

    first_call_batch = []
    fcb_path = paths.first_call_batch_csv
    if fcb_path.exists():
        import csv
        with open(fcb_path, encoding="utf-8-sig") as f:
            first_call_batch = list(csv.DictReader(f))

    overview = {
        "total_audited": audit_ready_total,
        "sales_ready_priority": len(tabs["priority"]),
        "sales_ready_secondary": len(tabs["secondary"]),
        "strict_sales_ready_total": len(tabs["priority"]) + len(tabs["secondary"]),
        "do_not_auto_contact": len(tabs["do_not_contact"]),
        "human_review_sample_total": len(sample),
        "human_review_sample_completed": reviewed_count,
        "human_review_sample_remaining": len(sample) - reviewed_count,
        "verdict_approve": verdict_counts["approve"],
        "verdict_reject": verdict_counts["reject"],
        "verdict_manual_review": verdict_counts["manual_review"],
        "suspected_wrong_industry": len(tabs["wrong_industry"]),
        "insufficient_evidence": len(tabs["insufficient_evidence"]),
        "identity_conflicts": len(tabs["identity_conflicts"]),
        "page_not_found": sum(1 for r in tabs["technical_failures"] if r["outcome"] == "page_not_found"),
        "transport_failures": sum(1 for r in tabs["technical_failures"]
                                  if r["outcome"] in ("dns_failure", "tls_failure", "timeout", "connection_failure")),
        "first_call_batch_count": len(first_call_batch),
    }

    return {
        "generated_at": _now_iso(),
        "industry": industry,
        "overview": overview,
        "sample": sample,
        "tabs": tabs,
        "first_call_batch": first_call_batch,
    }


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def render(payload: dict) -> str:
    """Renders the full self-contained review page. Data is embedded as a
    JSON snapshot (escaping '<' so a business name containing '</script>' can
    never break out of the inline script — same technique as
    leadfinder/dashboard.py) and re-fetched live from /api/data when served."""
    data_json = json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c")
    return (_TEMPLATE
            .replace("__DATA__", data_json)
            .replace("__GENERATED__", payload.get("generated_at", ""))
            .replace("__INDUSTRY__", payload.get("industry", "")))


_TEMPLATE = r"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>Autogarage Audit &amp; Sales Review</title>
<style>
  :root { --bg:#0f172a; --card:#fff; --line:#e2e8f0; --muted:#64748b; --accent:#256b54; --danger:#b91c1c; --warn:#c2410c; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#f1f5f9; color:#0f172a; }
  header { background:var(--bg); color:#fff; padding:16px 20px; }
  header h1 { margin:0; font-size:18px; }
  header p { margin:4px 0 0; color:#94a3b8; font-size:13px; }
  .conn-badge { display:inline-block; margin-left:10px; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:700; }
  .conn-ok { background:#166534; color:#dcfce7; }
  .conn-bad { background:#991b1b; color:#fee2e2; }
  .conn-unknown { background:#334155; color:#cbd5e1; }
  .file-warning { background:#fef3c7; color:#92400e; padding:10px 20px; font-size:13px; border-bottom:1px solid #f5d98a; }
  .file-warning code { background:#fff7e6; padding:1px 5px; border-radius:4px; }
  nav.tabs { display:flex; flex-wrap:wrap; gap:4px; padding:10px 16px; background:#fff; border-bottom:1px solid var(--line); position:sticky; top:0; z-index:6; }
  nav.tabs button { padding:8px 12px; border:1px solid var(--line); background:#f8fafc; border-radius:8px 8px 0 0; cursor:pointer; font-size:13px; font-weight:600; color:var(--muted); }
  nav.tabs button.active { background:var(--accent); color:#fff; border-color:var(--accent); }
  .wrap { padding:16px; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; margin-bottom:16px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:10px; padding:12px; }
  .card .n { font-size:22px; font-weight:800; }
  .card .l { font-size:12px; color:var(--muted); margin-top:2px; }
  .toolbar { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
  .toolbar input, .toolbar select { padding:7px 9px; border:1px solid var(--line); border-radius:8px; font-size:13px; }
  .toolbar button { padding:7px 12px; border:0; border-radius:8px; background:var(--accent); color:#fff; font-weight:600; cursor:pointer; font-size:13px; }
  .toolbar button.secondary { background:#fff; color:var(--accent); border:1px solid var(--accent); }
  .table-scroll { width:100%; overflow-x:auto; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,.08); background:#fff; }
  table { width:100%; border-collapse:collapse; min-width:900px; }
  th, td { padding:8px 10px; text-align:left; font-size:12.5px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { background:#f8fafc; cursor:pointer; white-space:nowrap; user-select:none; }
  tr.clickable { cursor:pointer; }
  tr.clickable:hover { background:#f8fafc; }
  .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:700; }
  .badge-ok { background:#dcfce7; color:#166534; }
  .badge-warn { background:#fef3c7; color:#92400e; }
  .badge-bad { background:#fee2e2; color:#991b1b; }
  .badge-muted { background:#e2e8f0; color:#475569; }
  .muted { color:var(--muted); font-size:12px; }
  .panel { position:fixed; top:0; right:0; width:min(480px,100vw); height:100vh; background:#fff; box-shadow:-4px 0 20px rgba(0,0,0,.15); overflow-y:auto; padding:18px; transform:translateX(100%); transition:transform .15s ease; z-index:20; }
  .panel.open { transform:translateX(0); }
  .panel h2 { margin-top:0; font-size:16px; }
  .panel section { margin-bottom:14px; border-top:1px solid var(--line); padding-top:10px; }
  .panel section h3 { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin:0 0 6px; }
  .panel dl { margin:0; display:grid; grid-template-columns:auto 1fr; gap:4px 10px; font-size:13px; }
  .panel dt { color:var(--muted); }
  .panel .closebtn { position:absolute; top:14px; right:14px; border:0; background:none; font-size:18px; cursor:pointer; }
  .overlay { position:fixed; inset:0; background:rgba(15,23,42,.35); z-index:19; display:none; }
  .overlay.open { display:block; }
  .review-card { background:#fff; border:1px solid var(--line); border-radius:12px; padding:18px; max-width:760px; }
  .review-card h2 { margin-top:0; }
  .field-row { display:flex; flex-wrap:wrap; gap:16px; margin:10px 0; }
  .field-group { display:flex; flex-direction:column; gap:4px; }
  .field-group label.title { font-size:12px; font-weight:700; color:var(--muted); }
  .tristate { display:flex; gap:4px; }
  .tristate button { padding:5px 10px; border:1px solid var(--line); background:#fff; border-radius:6px; cursor:pointer; font-size:12px; }
  .tristate button.sel-yes.selected { background:#dcfce7; border-color:#166534; }
  .tristate button.sel-no.selected { background:#fee2e2; border-color:#991b1b; }
  .tristate button.sel-unsure.selected { background:#fef3c7; border-color:#92400e; }
  textarea, input[type=text] { width:100%; border:1px solid var(--line); border-radius:6px; padding:6px; font-size:13px; font-family:inherit; }
  .verdictbar { display:flex; gap:8px; margin:14px 0; }
  .verdictbar button { flex:1; padding:10px; border-radius:8px; border:1px solid var(--line); cursor:pointer; font-weight:700; }
  .verdictbar button.approve.selected { background:#166534; color:#fff; border-color:#166534; }
  .verdictbar button.reject.selected { background:#991b1b; color:#fff; border-color:#991b1b; }
  .verdictbar button.manual_review.selected { background:#92400e; color:#fff; border-color:#92400e; }
  .navbar { display:flex; justify-content:space-between; align-items:center; margin-top:14px; }
  .navbar .progress { font-size:13px; color:var(--muted); }
  .kbd { display:inline-block; border:1px solid var(--line); border-radius:4px; padding:0 5px; font-size:11px; background:#f8fafc; }
  .toast { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); background:#0f172a; color:#fff; padding:8px 16px; border-radius:8px; font-size:13px; z-index:30; opacity:0; transition:opacity .2s; pointer-events:none; }
  .toast.show { opacity:1; }
  @media (max-width: 640px) {
    .panel { width:100vw; }
    table { min-width:640px; }
  }
</style>
</head>
<body>
<header>
  <h1>Autogarage Audit &amp; Sales Review</h1>
  <p>Industrie: __INDUSTRY__ · Gegenereerd: __GENERATED__ · lokaal, geen externe netwerkcalls
    <span id="connStatus" class="conn-badge conn-unknown">Server: onbekend</span>
  </p>
</header>

<div id="fileWarning" class="file-warning" style="display:none">
  Deze pagina is geopend als lokaal bestand (file://) — opslaan van reviews
  werkt dan NIET, ook al kun je door de tabbladen bladeren. Start de server
  en open de getoonde URL: <code>py -3 lead_finder.py dashboard --industry __INDUSTRY__ --audit-review --serve</code>
</div>

<nav class="tabs" id="tabs"></nav>

<div class="wrap" id="content"></div>

<div class="overlay" id="overlay" onclick="closePanel()"></div>
<div class="panel" id="panel"></div>
<div class="toast" id="toast"></div>

<script>
const PAYLOAD = __DATA__;
let DATA = PAYLOAD;
const TABS = [
  {key:"overview", label:"Overview"},
  {key:"sample", label:"Human Review Sample"},
  {key:"priority", label:"Sales Ready — Priority"},
  {key:"secondary", label:"Sales Ready — Secondary"},
  {key:"do_not_contact", label:"Do Not Auto Contact"},
  {key:"wrong_industry", label:"Wrong Industry Review"},
  {key:"insufficient_evidence", label:"Insufficient Evidence"},
  {key:"identity_conflicts", label:"Identity Conflicts"},
  {key:"technical_failures", label:"Technical Failures"},
  {key:"first_call_batch", label:"First Call Batch"},
];
let activeTab = "overview";
let sampleIndex = 0;
const filterState = {};

function el(tag, cls, text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
function nstr(v){ return (v==null) ? "" : String(v); }
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"), 1800); }

// ApiError.kind distinguishes WHY a call failed so the UI can show something
// more actionable than the browser's generic "Failed to fetch":
//   unreachable   - fetch() itself threw (no server, wrong port, offline,
//                   or the page was opened via file:// — a relative fetch
//                   from a file:// document can never reach a server)
//   not_found     - HTTP 404 (route doesn't exist on this server version)
//   validation    - HTTP 400 (the request was rejected — e.g. bad field value)
//   server_error  - HTTP >=500 (an exception on the server side)
//   invalid_json  - the response body wasn't valid JSON
//   http_error    - any other non-2xx status
class ApiError extends Error {
  constructor(kind, message, status){ super(message); this.kind = kind; this.status = status; }
}

async function api(path, body){
  const opts = body ? {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)} : {};
  let r;
  try {
    r = await fetch(path, opts);
  } catch(e){
    const hint = (location.protocol === "file:")
      ? " (deze pagina is geopend als lokaal bestand — start de server, zie de melding bovenaan)"
      : "";
    throw new ApiError("unreachable", "Server niet bereikbaar" + hint + ": " + e.message);
  }
  const rawText = await r.text();
  let data = null;
  if(rawText){
    try { data = JSON.parse(rawText); }
    catch(e){ throw new ApiError("invalid_json", "Ongeldig antwoord van de server (geen geldige JSON)"); }
  }
  if(!r.ok){
    const detail = (data && (data.error || data.detail)) || rawText || r.statusText || String(r.status);
    if(r.status === 404) throw new ApiError("not_found", "Route bestaat niet op de server: " + path);
    if(r.status === 400) throw new ApiError("validation", "Ongeldige invoer: " + detail);
    if(r.status >= 500) throw new ApiError("server_error", "Serverfout: " + detail);
    throw new ApiError("http_error", `Onverwachte serverreactie (${r.status}): ${detail}`);
  }
  return data;
}

async function refreshData(){
  try { DATA = await api("/api/data"); } catch(e){ /* file:// fallback keeps PAYLOAD */ }
}

// --- Connectivity indicator ------------------------------------------
async function checkHealth(){
  const badge = document.getElementById("connStatus");
  try {
    const r = await fetch("/api/health", {cache:"no-store"});
    if(!r.ok) throw new Error(String(r.status));
    await r.json();
    badge.textContent = "Server verbonden";
    badge.className = "conn-badge conn-ok";
  } catch(e){
    badge.textContent = "Server niet bereikbaar";
    badge.className = "conn-badge conn-bad";
  }
}

function showFileProtocolWarningIfNeeded(){
  if(location.protocol === "file:"){
    document.getElementById("fileWarning").style.display = "block";
    const badge = document.getElementById("connStatus");
    badge.textContent = "Server niet bereikbaar (file://)";
    badge.className = "conn-badge conn-bad";
  }
}

function renderTabs(){
  const nav = document.getElementById("tabs");
  nav.textContent = "";
  TABS.forEach(t=>{
    const b = el("button", t.key===activeTab?"active":"", t.label);
    b.addEventListener("click", ()=>{ activeTab=t.key; renderAll(); });
    nav.appendChild(b);
  });
}

function badge(text, kind){ return el("span","badge badge-"+kind, text); }

function classificationBadge(cls){
  if(!cls) return badge("—","muted");
  if(cls==="B_basic_website") return badge("B","warn");
  if(cls==="C_manual_appointment_website") return badge("C","warn");
  if(cls==="D_booking_without_vehicle_lookup") return badge("D","ok");
  if(cls==="E_advanced_garage_website") return badge("E","ok");
  return badge(cls, "bad");
}

function verdictBadge(row){
  const v = row.decision && row.decision.verdict;
  if(v==="approve") return badge("approved","ok");
  if(v==="reject") return badge("rejected","bad");
  if(v==="manual_review") return badge("manual review","warn");
  return badge("pending","muted");
}

// ---------------------------------------------------------------------
// Generic queue table (Priority/Secondary/DoNotContact/WrongIndustry/...)
// ---------------------------------------------------------------------
const FILTER_DEFS = [
  {key:"q", label:"Zoek bedrijfsnaam", type:"text"},
  {key:"city", label:"Stad", type:"select", field:"city"},
  {key:"final_audit_classification", label:"Classificatie", type:"select", field:"final_audit_classification"},
  {key:"website_source", label:"Bron", type:"select", field:"website_source"},
  {key:"industry_relevance_status", label:"Relevantie", type:"select", field:"industry_relevance_status"},
  {key:"identity_confidence", label:"Identiteit", type:"select", field:"identity_confidence"},
  {key:"verdict", label:"Reviewstatus", type:"select", field:"__verdict"},
  {key:"has_appointment_request_form", label:"Afspraak", type:"bool", field:"has_appointment_request_form"},
  {key:"can_enter_license_plate", label:"Kenteken lookup", type:"bool", field:"can_enter_license_plate"},
  {key:"has_whatsapp_link", label:"WhatsApp", type:"bool", field:"has_whatsapp_link"},
  {key:"has_contact_form", label:"Contactformulier", type:"bool", field:"has_contact_form"},
  {key:"external_redirect", label:"Externe redirect", type:"bool", field:"external_redirect"},
  {key:"manual_review_required", label:"Handmatige review", type:"bool", field:"manual_review_required"},
];

function rowVerdict(row){ return (row.decision && row.decision.verdict) || ""; }

function uniqueValues(rows, field){
  return [...new Set(rows.map(r=>field==="__verdict"?rowVerdict(r):r[field]).filter(v=>v!==undefined && v!==null && v!==""))].sort();
}

function applyFilters(rows, tabKey){
  const st = filterState[tabKey] || {};
  return rows.filter(r=>{
    if(st.q){ const q=st.q.toLowerCase(); if(!(nstr(r.business_name).toLowerCase().includes(q))) return false; }
    for(const def of FILTER_DEFS){
      if(def.key==="q") continue;
      const v = st[def.key];
      if(v===undefined || v==="") continue;
      if(def.type==="bool"){
        const actual = def.field==="__verdict" ? rowVerdict(r) : !!r[def.field];
        if(String(actual) !== v) return false;
      } else {
        const actual = def.field==="__verdict" ? rowVerdict(r) : r[def.field];
        if(String(actual||"") !== v) return false;
      }
    }
    if(st.minScore && (r.garage_feature_score==null || r.garage_feature_score < Number(st.minScore))) return false;
    if(st.maxScore && (r.garage_feature_score==null || r.garage_feature_score > Number(st.maxScore))) return false;
    return true;
  });
}

let sortState = {};
function applySort(rows, tabKey){
  const s = sortState[tabKey];
  if(!s) return rows;
  const {key, dir} = s;
  const out = rows.slice();
  out.sort((a,b)=>{
    let av = key==="verdict" ? rowVerdict(a) : a[key];
    let bv = key==="verdict" ? rowVerdict(b) : b[key];
    if(av==null) av = (typeof bv==="number") ? -1 : "";
    if(bv==null) bv = (typeof av==="number") ? -1 : "";
    return (av>bv?1:av<bv?-1:0)*dir;
  });
  return out;
}

function renderToolbar(container, tabKey, rows){
  const bar = el("div","toolbar");
  const qInput = el("input"); qInput.placeholder = "Zoek bedrijfsnaam…"; qInput.value = (filterState[tabKey]||{}).q || "";
  qInput.id = "queueSearchInput";
  qInput.addEventListener("input", e=>{ setFilter(tabKey,"q",e.target.value); });
  bar.appendChild(qInput);
  FILTER_DEFS.forEach(def=>{
    if(def.type==="text") return;
    const sel = el("select");
    const optAll = el("option"); optAll.value=""; optAll.textContent = def.label + ": alle"; sel.appendChild(optAll);
    if(def.type==="bool"){
      [["true","Ja"],["false","Nee"]].forEach(([v,l])=>{ const o=el("option");o.value=v;o.textContent=l;sel.appendChild(o); });
    } else {
      uniqueValues(rows, def.field).forEach(v=>{ const o=el("option"); o.value=v; o.textContent=v; sel.appendChild(o); });
    }
    sel.value = (filterState[tabKey]||{})[def.key] || "";
    sel.addEventListener("change", e=>setFilter(tabKey, def.key, e.target.value));
    bar.appendChild(sel);
  });
  const minS = el("input"); minS.type="number"; minS.placeholder="Min garage-score"; minS.style.width="140px";
  minS.value=(filterState[tabKey]||{}).minScore||"";
  minS.addEventListener("input", e=>setFilter(tabKey,"minScore",e.target.value));
  bar.appendChild(minS);
  const maxS = el("input"); maxS.type="number"; maxS.placeholder="Max garage-score"; maxS.style.width="140px";
  maxS.value=(filterState[tabKey]||{}).maxScore||"";
  maxS.addEventListener("input", e=>setFilter(tabKey,"maxScore",e.target.value));
  bar.appendChild(maxS);
  const clearBtn = el("button","secondary","Filters wissen");
  clearBtn.addEventListener("click", ()=>{ filterState[tabKey]={}; renderAll(); });
  bar.appendChild(clearBtn);
  container.appendChild(bar);
}

function setFilter(tabKey, key, val){
  filterState[tabKey] = filterState[tabKey] || {};
  filterState[tabKey][key] = val;
  renderAll();
}

const TABLE_COLUMNS = [
  {key:"business_name", label:"Bedrijf"},
  {key:"city", label:"Stad"},
  {key:"final_audit_classification", label:"Classificatie"},
  {key:"website_source", label:"Bron"},
  {key:"garage_feature_score", label:"Garage-score"},
  {key:"website_quality_score", label:"Kwaliteit-score"},
  {key:"identity_confidence", label:"Identiteit"},
  {key:"verdict", label:"Status"},
];

function renderQueueTable(container, tabKey, allRows){
  renderToolbar(container, tabKey, allRows);
  let rows = applyFilters(allRows, tabKey);
  rows = applySort(rows, tabKey);
  const countP = el("p","muted", `${rows.length} van ${allRows.length} getoond`);
  container.appendChild(countP);
  const scroll = el("div","table-scroll");
  const table = el("table");
  const thead = el("thead"); const htr = el("tr");
  TABLE_COLUMNS.forEach(col=>{
    const th = el("th", null, col.label);
    th.addEventListener("click", ()=>{
      const cur = sortState[tabKey];
      const dir = (cur && cur.key===col.key) ? -cur.dir : 1;
      sortState[tabKey] = {key:col.key, dir};
      renderAll();
    });
    htr.appendChild(th);
  });
  thead.appendChild(htr); table.appendChild(thead);
  const tbody = el("tbody");
  rows.slice(0, 500).forEach(r=>{
    const tr = el("tr","clickable");
    tr.addEventListener("click", ()=>openDetail(r));
    tr.appendChild(el("td",null,nstr(r.business_name)));
    tr.appendChild(el("td",null,nstr(r.city)));
    { const c=el("td"); c.appendChild(classificationBadge(r.final_audit_classification)); tr.appendChild(c); }
    tr.appendChild(el("td",null,nstr(r.website_source)));
    tr.appendChild(el("td",null,r.garage_feature_score==null?"—":String(r.garage_feature_score)));
    tr.appendChild(el("td",null,r.website_quality_score==null?"—":String(r.website_quality_score)));
    tr.appendChild(el("td",null,nstr(r.identity_confidence)));
    { const c=el("td"); c.appendChild(verdictBadge(r)); tr.appendChild(c); }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  scroll.appendChild(table);
  container.appendChild(scroll);
  if(rows.length > 500){
    container.appendChild(el("p","muted", `(eerste 500 van ${rows.length} getoond — gebruik filters om te verfijnen)`));
  }
}

// ---------------------------------------------------------------------
// Detail panel (shared across every tab)
// ---------------------------------------------------------------------
function dl(pairs){
  const d = el("dl");
  pairs.forEach(([k,v])=>{ d.appendChild(el("dt",null,k)); d.appendChild(el("dd",null,v)); });
  return d;
}

function openDetail(r){
  const panel = document.getElementById("panel");
  panel.textContent = "";
  const closeBtn = el("button","closebtn","✕"); closeBtn.addEventListener("click", closePanel);
  panel.appendChild(closeBtn);
  panel.appendChild(el("h2", null, r.business_name || "(onbekend)"));

  let s = el("section");
  s.appendChild(el("h3",null,"Geautomatiseerde audit-bevindingen"));
  s.appendChild(dl([
    ["Stad", nstr(r.city)], ["Telefoon", nstr(r.phone)],
    ["Website-bron", nstr(r.website_source)], ["Ingediende URL", nstr(r.submitted_url)],
    ["Uiteindelijke URL", nstr(r.final_url)], ["Uitkomst", nstr(r.outcome)],
    ["Classificatie", nstr(r.final_audit_classification)],
    ["Garage-score", nstr(r.garage_feature_score)], ["Kwaliteit-score", nstr(r.website_quality_score)],
    ["Identiteit", nstr(r.identity_confidence) + " / " + nstr(r.identity_match_outcome)],
    ["Branche-relevantie", nstr(r.industry_relevance_status)],
    ["Gedetecteerde diensten", nstr(r.detected_services) || "—"],
    ["Afspraak/boeking", r.has_real_booking_calendar ? "echte kalender" : (r.has_appointment_request_form ? "afspraakaanvraag" : "geen")],
    ["Kenteken lookup", r.has_vehicle_lookup_result ? "ja" : (r.can_enter_license_plate ? "veld aanwezig, geen resultaat" : "nee")],
    ["WhatsApp", r.has_whatsapp_link ? "ja" : "nee"],
    ["Contactformulier", r.has_contact_form ? "ja" : "nee"],
    ["Externe redirect", r.external_redirect ? "ja" : "nee"],
    ["Handmatige review vereist", r.manual_review_required ? "ja" : "nee"],
  ]));
  if(r.audit_warnings && r.audit_warnings.length){ s.appendChild(el("p","muted","Waarschuwingen: " + r.audit_warnings.join(", "))); }
  panel.appendChild(s);

  s = el("section");
  s.appendChild(el("h3",null,"Uitsluitingsredenen"));
  const reasons = [];
  if(r.industry_relevance_status==="suspected_wrong_industry") reasons.push("suspected_wrong_industry");
  if(r.industry_relevance_status==="insufficient_evidence") reasons.push("insufficient_industry_evidence");
  if(r.identity_match_outcome==="conflict") reasons.push("identity_conflict");
  if(r.external_redirect) reasons.push("external_redirect");
  if(r.manual_review_required) reasons.push("manual_review_required");
  if(r.final_audit_classification==="E_advanced_garage_website") reasons.push("advanced_website (geen sales-noodzaak)");
  s.appendChild(el("p",null, reasons.length ? reasons.join(", ") : "geen — dit is een veilige kandidaat"));
  panel.appendChild(s);

  s = el("section");
  s.appendChild(el("h3",null,"Voorgestelde verkoopkans (alleen op basis van opgeslagen velden)"));
  s.appendChild(el("p",null, (r.suggested_opportunity||[]).join(", ") || "geen duidelijke kans gevonden"));
  panel.appendChild(s);

  s = el("section");
  s.appendChild(el("h3",null,"Menselijke reviewbeslissing"));
  if(r.decision){
    s.appendChild(dl([
      ["Identiteit correct", nstr(r.decision.business_identity_correct)],
      ["Echte autogarage", nstr(r.decision.real_autogarage)],
      ["Geldige kans", nstr(r.decision.valid_sales_opportunity)],
      ["Telefoon bruikbaar", nstr(r.decision.phone_usable)],
      ["Verdict", nstr(r.decision.verdict)],
      ["Notities", nstr(r.decision.notes)],
      ["Beoordeeld op", nstr(r.decision.reviewed_at)],
    ]));
  } else {
    s.appendChild(el("p","muted","Nog niet beoordeeld."));
  }
  panel.appendChild(s);

  document.getElementById("overlay").classList.add("open");
  panel.classList.add("open");
}
function closePanel(){
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("panel").classList.remove("open");
}

// ---------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------
function renderOverview(container){
  const o = DATA.overview;
  const cards = [
    ["Totaal geaudit", o.total_audited],
    ["Sales-ready priority", o.sales_ready_priority],
    ["Sales-ready secondary", o.sales_ready_secondary],
    ["Strict sales-ready totaal", o.strict_sales_ready_total],
    ["Do not auto contact", o.do_not_auto_contact],
    ["Human review: voltooid", `${o.human_review_sample_completed} / ${o.human_review_sample_total}`],
    ["Human review: resterend", o.human_review_sample_remaining],
    ["Approve", o.verdict_approve],
    ["Reject", o.verdict_reject],
    ["Manual review", o.verdict_manual_review],
    ["Suspected wrong industry", o.suspected_wrong_industry],
    ["Identity conflicts", o.identity_conflicts],
    ["Page not found", o.page_not_found],
    ["Transport failures", o.transport_failures],
    ["First-call batch grootte", o.first_call_batch_count],
  ];
  const grid = el("div","cards");
  cards.forEach(([label, n])=>{
    const c = el("div","card");
    c.appendChild(el("div","n", String(n)));
    c.appendChild(el("div","l", label));
    grid.appendChild(c);
  });
  container.appendChild(grid);

  const bar = el("div","toolbar");
  const genBtn = el("button", null, "Genereer eerste 50-bel batch");
  genBtn.addEventListener("click", generateFirstCallBatch);
  bar.appendChild(genBtn);
  const expBtn = el("button","secondary","Exporteer human review (CSV)");
  expBtn.addEventListener("click", exportHumanReview);
  bar.appendChild(expBtn);
  container.appendChild(bar);
}

async function generateFirstCallBatch(){
  try {
    const res = await api("/api/first-call-batch", {});
    toast(`Eerste-bel batch aangemaakt: ${res.count} leads → ${res.path}`);
    await refreshData(); activeTab = "first_call_batch"; renderAll();
  } catch(e){ toast("Mislukt: " + e.message); }
}
async function exportHumanReview(){
  try {
    const res = await api("/api/export-human-review", {});
    toast(`Export klaar: ${res.total} rijen (${res.reviewed} beoordeeld) → ${res.path}`);
  } catch(e){ toast("Mislukt: " + e.message); }
}

// ---------------------------------------------------------------------
// Human Review Sample tab (one-at-a-time review flow)
// ---------------------------------------------------------------------
function currentSampleRows(){ return DATA.sample; }

function renderSampleReview(container){
  const rows = currentSampleRows();
  if(!rows.length){ container.appendChild(el("p","muted","Geen sample-rijen gevonden.")); return; }
  if(sampleIndex >= rows.length) sampleIndex = rows.length - 1;
  if(sampleIndex < 0) sampleIndex = 0;
  const r = rows[sampleIndex];
  const reviewedCount = rows.filter(x=>x.decision && x.decision.verdict).length;

  const card = el("div","review-card");
  card.appendChild(el("h2", null, `${r.business_name || "(onbekend)"} — ${r.city || ""}`));
  card.appendChild(dl([
    ["Telefoon", nstr(r.phone)], ["Website-bron", nstr(r.website_source)],
    ["Ingediende URL", nstr(r.submitted_url)], ["Uiteindelijke URL", nstr(r.final_url)],
    ["Classificatie", nstr(r.final_audit_classification)],
    ["Garage-score", nstr(r.garage_feature_score)], ["Kwaliteit-score", nstr(r.website_quality_score)],
    ["Identiteit", nstr(r.identity_confidence)], ["Identiteitsbewijs", (r.identity_evidence||[]).join(", ") || "—"],
    ["Branche-relevantie", nstr(r.industry_relevance_status)],
    ["Gedetecteerde diensten", nstr(r.detected_services) || "—"],
    ["Afspraak/boeking", r.has_real_booking_calendar ? "echte kalender" : (r.has_appointment_request_form ? "afspraakaanvraag" : "geen")],
    ["Kenteken lookup", r.has_vehicle_lookup_result ? "ja" : (r.can_enter_license_plate ? "veld, geen resultaat" : "nee")],
    ["WhatsApp", r.has_whatsapp_link ? "ja" : "nee"],
    ["Contactformulier", r.has_contact_form ? "ja" : "nee"],
    ["Waarschuwingen", (r.audit_warnings||[]).join(", ") || "—"],
  ]));

  const d = r.decision || {};
  const state = { business_identity_correct: d.business_identity_correct||"", real_autogarage: d.real_autogarage||"",
                 valid_sales_opportunity: d.valid_sales_opportunity||"", phone_usable: d.phone_usable||"",
                 website_assessment: d.website_assessment||"", verdict: d.verdict||"", notes: d.notes||"" };

  function tristateGroup(fieldKey, title){
    const group = el("div","field-group");
    group.appendChild(el("label","title",title));
    const row = el("div","tristate");
    ["yes","no","unsure"].forEach(val=>{
      const b = el("button","sel-"+val+(state[fieldKey]===val?" selected":""), val==="yes"?"Ja":val==="no"?"Nee":"Onzeker");
      b.addEventListener("click", ()=>{ state[fieldKey] = state[fieldKey]===val ? "" : val; refreshTristateUI(); });
      row.appendChild(b);
    });
    group.appendChild(row);
    return group;
  }
  const fr = el("div","field-row");
  fr.appendChild(tristateGroup("business_identity_correct","Bedrijfsidentiteit correct?"));
  fr.appendChild(tristateGroup("real_autogarage","Echte autogarage?"));
  fr.appendChild(tristateGroup("valid_sales_opportunity","Geldige verkoopkans?"));
  fr.appendChild(tristateGroup("phone_usable","Telefoon bruikbaar?"));
  card.appendChild(fr);

  const waGroup = el("div","field-group"); waGroup.style.marginTop="10px";
  waGroup.appendChild(el("label","title","Website-beoordeling (vrije tekst)"));
  const waInput = el("input"); waInput.type="text"; waInput.value = state.website_assessment;
  waInput.addEventListener("input", e=>{ state.website_assessment = e.target.value; });
  waGroup.appendChild(waInput);
  card.appendChild(waGroup);

  const verdictBar = el("div","verdictbar");
  ["approve","reject","manual_review"].forEach(v=>{
    const b = el("button", v + (state.verdict===v?" selected":""), v==="approve"?"Approve (A)":v==="reject"?"Reject (R)":"Manual review (M)");
    b.addEventListener("click", ()=>setVerdict(v));
    verdictBar.appendChild(b);
  });
  card.appendChild(verdictBar);

  const notesGroup = el("div","field-group");
  notesGroup.appendChild(el("label","title","Notities"));
  const notesArea = el("textarea"); notesArea.rows=3; notesArea.value = state.notes;
  notesArea.addEventListener("input", e=>{ state.notes = e.target.value; });
  notesGroup.appendChild(notesArea);
  card.appendChild(notesGroup);

  function refreshTristateUI(){
    card.querySelectorAll(".tristate button").forEach(btn=>btn.classList.remove("selected"));
    ["business_identity_correct","real_autogarage","valid_sales_opportunity","phone_usable"].forEach((k,i)=>{
      if(!state[k]) return;
      const group = fr.children[i];
      const idx = ["yes","no","unsure"].indexOf(state[k]);
      group.querySelectorAll(".tristate button")[idx].classList.add("selected");
    });
  }

  function setVerdict(v){
    // Confirm before silently overwriting an ALREADY-SAVED final verdict
    // with a different one — never change a recorded decision by accident.
    if(d.verdict && d.verdict !== v && state.verdict !== v){
      const ok = window.confirm(`Deze lead is al beoordeeld als "${d.verdict}". Wijzigen naar "${v}"?`);
      if(!ok) return;
    }
    state.verdict = state.verdict===v ? "" : v;
    card.querySelectorAll(".verdictbar button").forEach(btn=>btn.classList.remove("selected"));
    if(state.verdict){ verdictBar.querySelector("."+state.verdict).classList.add("selected"); }
  }

  async function persist(advance){
    const fields = {};
    ["business_identity_correct","real_autogarage","valid_sales_opportunity","phone_usable",
     "website_assessment","verdict","notes"].forEach(k=>{ if(state[k]!=="") fields[k]=state[k]; });
    try {
      const res = await api("/api/decision", {place_id: r.place_id, fields});
      r.decision = res.decision;
      toast("Opgeslagen: " + r.business_name);
      if(advance) goNext();
      else renderAll();
    } catch(e){
      // Never clear the form or advance on failure — `state` (the in-memory
      // tristate/verdict/notes the user just set) and the DOM are both left
      // exactly as they were; the user can retry without re-entering anything.
      toast("Opslaan mislukt: " + e.message);
      checkHealth();   // refresh the connectivity badge immediately, don't wait for the poll
    }
  }

  const nav = el("div","navbar");
  const left = el("div");
  const prevBtn = el("button","secondary","← Vorige"); prevBtn.addEventListener("click", goPrev);
  const skipBtn = el("button","secondary","Overslaan"); skipBtn.addEventListener("click", goNext);
  left.appendChild(prevBtn); left.appendChild(skipBtn);
  const saveBtn = el("button", null, "Opslaan en volgende →");
  saveBtn.addEventListener("click", ()=>persist(true));
  nav.appendChild(left);
  nav.appendChild(el("div","progress", `${sampleIndex+1} / ${rows.length} bekeken · ${reviewedCount} / ${rows.length} beoordeeld`));
  nav.appendChild(saveBtn);
  card.appendChild(nav);
  card.appendChild(el("p","muted","Sneltoetsen: A = approve, R = reject, M = manual review, ← → = vorige/volgende"));

  container.appendChild(card);

  window._sampleKeyHandler = function(ev){
    if(ev.target.tagName==="TEXTAREA" || ev.target.tagName==="INPUT") return;
    if(ev.key==="a"||ev.key==="A"){ setVerdict("approve"); persist(false); }
    else if(ev.key==="r"||ev.key==="R"){ setVerdict("reject"); persist(false); }
    else if(ev.key==="m"||ev.key==="M"){ setVerdict("manual_review"); persist(false); }
    else if(ev.key==="ArrowRight"){ goNext(); }
    else if(ev.key==="ArrowLeft"){ goPrev(); }
  };
}
function goNext(){ sampleIndex = Math.min(sampleIndex+1, currentSampleRows().length-1); renderAll(); }
function goPrev(){ sampleIndex = Math.max(sampleIndex-1, 0); renderAll(); }

// ---------------------------------------------------------------------
// First Call Batch tab
// ---------------------------------------------------------------------
function renderFirstCallBatch(container){
  const rows = DATA.first_call_batch || [];
  if(!rows.length){
    container.appendChild(el("p","muted","Nog geen batch gegenereerd. Gebruik de knop op het Overview-tabblad."));
    return;
  }
  const scroll = el("div","table-scroll");
  const table = el("table");
  const thead = el("thead"); const htr = el("tr");
  const cols = Object.keys(rows[0]);
  cols.forEach(c=>htr.appendChild(el("th",null,c)));
  thead.appendChild(htr); table.appendChild(thead);
  const tbody = el("tbody");
  rows.forEach(row=>{
    const tr = el("tr");
    cols.forEach(c=>tr.appendChild(el("td",null,nstr(row[c]))));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody); scroll.appendChild(table);
  container.appendChild(el("p","muted", `${rows.length} leads in de huidige batch`));
  container.appendChild(scroll);
}

// ---------------------------------------------------------------------
// Main render dispatch
// ---------------------------------------------------------------------
function renderAll(){
  renderTabs();
  const content = document.getElementById("content");
  // Preserve focus/cursor across a full re-render: the search box is
  // recreated from scratch every keystroke (its value is filter STATE, not
  // DOM state), so without this every character after the first would land
  // on a stale, unfocused input and appear to be silently dropped.
  const active = document.activeElement;
  const restoreId = (active && active.id === "queueSearchInput") ? active.id : null;
  const restoreSelection = restoreId ? [active.selectionStart, active.selectionEnd] : null;

  content.textContent = "";
  if(activeTab==="overview") renderOverview(content);
  else if(activeTab==="sample") renderSampleReview(content);
  else if(activeTab==="first_call_batch") renderFirstCallBatch(content);
  else renderQueueTable(content, activeTab, DATA.tabs[activeTab] || []);

  if(restoreId){
    const el2 = document.getElementById(restoreId);
    if(el2){ el2.focus(); if(restoreSelection) el2.setSelectionRange(...restoreSelection); }
  }
}

document.addEventListener("keydown", ev=>{
  if(activeTab==="sample" && window._sampleKeyHandler) window._sampleKeyHandler(ev);
});

showFileProtocolWarningIfNeeded();
checkHealth();
setInterval(checkHealth, 15000);   // periodic connectivity indicator refresh
refreshData().then(renderAll).catch(renderAll);
</script>
</body>
</html>"""
