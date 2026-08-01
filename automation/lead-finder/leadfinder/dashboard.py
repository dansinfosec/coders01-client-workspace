"""Generates the self-contained HTML review dashboard.

Multi-industry: one master dashboard shows leads from every industry. It reads a
combined ``dashboard-data.json`` (built from ``output/industries/<slug>/`` folders)
at load time, with an inline snapshot as a file:// fallback. Existing behaviour —
sorting, filtering, screenshots, approve/reject, notes (localStorage) — is
preserved; an Industry filter + column are added.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

# Industries that always appear in the dropdown even before they have data.
BASE_INDUSTRIES = ["dakdekkers", "thuiszorg", "makelaars"]


def _rows_from(leads, audits, scores) -> list:
    """Build dashboard row dicts from leads + audits + scores."""
    audits_by = {a.get("place_id"): a for a in audits}
    rows = []
    for lead in leads:
        pid = lead.get("place_id")
        audit = audits_by.get(pid, {})
        score = scores.get(pid, {})
        rows.append({
            "place_id": pid,
            "industry": lead.get("industry"),
            "business_name": lead.get("business_name"),
            "category": lead.get("category"),
            "city": lead.get("city"),
            "region": lead.get("region"),
            "phone": lead.get("phone"),
            "website": lead.get("website"),
            "business_status": lead.get("business_status"),
            "google_maps_uri": lead.get("google_maps_uri"),
            "google_rating": lead.get("google_rating"),
            "google_review_count": lead.get("google_review_count"),
            "score": score.get("score"),
            "reasons": score.get("reasons", []),
            "screenshot_desktop": audit.get("screenshot_desktop"),
            "screenshot_mobile": audit.get("screenshot_mobile"),
            # Garage (autogarage) booking + kenteken/RDW facts. None for every
            # non-garage industry (audit_lead never adds these keys for them).
            "website_opportunity_category": score.get("website_opportunity_category"),
            "has_basic_contact_form": audit.get("has_basic_contact_form"),
            "has_appointment_request_form": audit.get("has_appointment_request_form"),
            "has_real_booking_calendar": audit.get("has_real_booking_calendar"),
            "can_select_service": audit.get("can_select_service"),
            "can_select_branch": audit.get("can_select_branch"),
            "can_select_date": audit.get("can_select_date"),
            "can_select_available_time_slot": audit.get("can_select_available_time_slot"),
            "can_enter_license_plate": audit.get("can_enter_license_plate"),
            "has_vehicle_lookup_result": audit.get("has_vehicle_lookup_result"),
            "has_rdw_or_vehicle_data_integration": audit.get("has_rdw_or_vehicle_data_integration"),
            "booking_gap_reason": score.get("booking_gap_reason"),
            "vehicle_lookup_gap_reason": score.get("vehicle_lookup_gap_reason"),
            "sales_reason": score.get("sales_reason"),
            "recommended_opening_line": score.get("recommended_opening_line"),
        })
    return rows


def _payload(rows) -> dict:
    industries = sorted({r["industry"] for r in rows if r.get("industry")})
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "industries": industries,
        "rows": rows,
    }


def build_dashboard(leads, audits, scores) -> str:
    """Backward-compatible single-industry dashboard (embeds its own data)."""
    return render(_payload(_rows_from(leads, audits, scores)))


def build_combined_data(paths, extra_industries=BASE_INDUSTRIES) -> dict:
    """Combine every industry folder under output/industries/ into one payload.

    Reads each ``<industry>/leads.json`` + ``website-audits.json`` and scores
    every audit via `evaluate_lead()` — identical to `score_audit()` for every
    non-garage industry, and adds the opportunity category/gap-reasons/sales
    copy for garage audits. Tags each row with its industry.
    """
    from .garage_messages import evaluate_lead  # local import: avoids a cycle
    from . import config

    base = paths.output
    rows = []
    seen_industries = set()
    for slug in config.list_industries(base):
        idir = base / "industries" / slug
        leads = _read(idir / "leads.json", "leads")
        audits = _read(idir / "website-audits.json", "audits")
        scores = {a.get("place_id"): evaluate_lead(a) for a in audits}
        for lead in leads:
            lead.setdefault("industry", slug)  # ensure tagged
        rows.extend(_rows_from(leads, audits, scores))
        seen_industries.add(slug)

    payload = _payload(rows)
    # Merge in the base industries so they always show in the dropdown.
    payload["industries"] = sorted(set(payload["industries"]) | set(extra_industries) | seen_industries)
    return payload


def _read(path, key):
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get(key, []) if isinstance(data, dict) else (data or [])


def render(payload: dict) -> str:
    """Render the dashboard HTML around a payload {generated_at, industries, rows}."""
    # Escape "<" as < so a business name containing "</script>" can never
    # break out of the inline <script> fallback data (still valid JSON/JS).
    data_json = json.dumps(payload, ensure_ascii=False).replace("<", "\\u003c")
    base_json = json.dumps(BASE_INDUSTRIES)
    return (_TEMPLATE
            .replace("__DATA__", data_json)
            .replace("__BASE_INDUSTRIES__", base_json)
            .replace("__GENERATED__", payload.get("generated_at", "")))


_TEMPLATE = r"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Never serve a stale cached dashboard: the browser must reload the fresh
     file each time (prevents old-render bugs lingering after a rebuild). -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>Lead Finder — Review dashboard</title>
<style>
  :root { --bg:#0f172a; --card:#fff; --line:#e2e8f0; --muted:#64748b; --accent:#256b54; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:#f1f5f9; color:#0f172a; }
  header { background:var(--bg); color:#fff; padding:16px 20px; }
  header h1 { margin:0; font-size:18px; }
  header p { margin:4px 0 0; color:#94a3b8; font-size:13px; }
  .toolbar { display:flex; flex-wrap:wrap; gap:8px; padding:14px 20px; background:#fff; border-bottom:1px solid var(--line); position:sticky; top:0; z-index:5; }
  .toolbar input, .toolbar select { padding:8px 10px; border:1px solid var(--line); border-radius:8px; font-size:13px; }
  .toolbar button { padding:8px 12px; border:0; border-radius:8px; background:var(--accent); color:#fff; font-weight:600; cursor:pointer; }
  .wrap { padding:16px 20px; }
  /* Horizontal-scroll wrapper: the 14-column table is wider than the viewport,
     so wrap it and let the wrapper scroll instead of pushing columns off-screen. */
  .table-scroll { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
  table { width:100%; min-width:2050px; border-collapse:collapse; background:#fff; overflow:visible; }
  th, td { padding:10px 12px; text-align:left; font-size:13px; border-bottom:1px solid var(--line); vertical-align:top; }
  td { max-width:260px; overflow-wrap:anywhere; }        /* long URLs/names wrap, never widen the table */
  th { background:#f8fafc; cursor:pointer; user-select:none; white-space:nowrap; }
  /* Keep the identifying columns visible while scrolling right. */
  th:nth-child(1), td:nth-child(1) { position:sticky; left:0; z-index:2; }
  th:nth-child(2), td:nth-child(2) { position:sticky; left:64px; z-index:2; }
  th:nth-child(3), td:nth-child(3) { position:sticky; left:172px; z-index:2; min-width:200px; }
  tbody td:nth-child(1), tbody td:nth-child(2), tbody td:nth-child(3) { background:#fff; }
  thead th:nth-child(1), thead th:nth-child(2), thead th:nth-child(3) { background:#f8fafc; z-index:3; }
  .score { font-weight:800; padding:2px 8px; border-radius:999px; color:#fff; display:inline-block; }
  .branche { display:inline-block; padding:2px 8px; border-radius:999px; background:#eef2ff; color:#3730a3; font-size:12px; font-weight:600; }
  .prob { color:var(--muted); font-size:12px; }
  .status-approved { color:#166534; font-weight:700; }
  .status-rejected { color:#991b1b; font-weight:700; }
  .btn-sm { padding:4px 8px; border:1px solid var(--line); background:#fff; border-radius:6px; cursor:pointer; font-size:12px; }
  .btn-sm.approve:hover { background:#dcfce7; }
  .btn-sm.reject:hover { background:#fee2e2; }
  textarea { width:100%; min-height:38px; border:1px solid var(--line); border-radius:6px; padding:6px; font-size:12px; }
  a { color:var(--accent); }
  img.shot { max-width:120px; border:1px solid var(--line); border-radius:6px; cursor:zoom-in; display:block; margin-bottom:4px; }
  .muted { color:var(--muted); font-size:12px; }
  dialog { border:0; border-radius:12px; padding:0; max-width:95vw; }
  dialog img { max-width:90vw; max-height:85vh; display:block; }
</style>
</head>
<body>
<header>
  <h1>Lead Finder — Review dashboard</h1>
  <p>Gegenereerd: __GENERATED__ · lokaal · reviewstatus wordt in je browser (localStorage) bewaard</p>
</header>

<div class="toolbar">
  <input id="q" placeholder="Zoek naam / website…" oninput="render()">
  <select id="fIndustry" onchange="render()"><option value="">Alle branches</option></select>
  <select id="fCity" onchange="render()"><option value="">Alle steden</option></select>
  <select id="fRegion" onchange="render()"><option value="">Alle regio's</option></select>
  <select id="fStatus" onchange="render()">
    <option value="">Alle statussen</option>
    <option value="pending">Nog te beoordelen</option>
    <option value="approved">Goedgekeurd</option>
    <option value="rejected">Afgewezen</option>
  </select>
  <select id="fReviews" onchange="render()">
    <option value="">Alle reviews</option>
    <option value="with">Met reviews</option>
    <option value="without">Zonder reviews</option>
  </select>
  <select id="fGarage" onchange="render()">
    <option value="">Alle garage-kansen</option>
    <option value="no_website">1. Geen website</option>
    <option value="basic_form">2. Alleen contactformulier</option>
    <option value="appointment_no_calendar">3. Afspraakaanvraag zonder kalender</option>
    <option value="no_time_slots">4. Geen selecteerbare tijdstippen</option>
    <option value="no_kenteken">5. Geen kentekenveld</option>
    <option value="kenteken_no_lookup">6. Kenteken zonder voertuiglookup</option>
    <option value="booking_no_rdw">7. Boeken zonder RDW-koppeling</option>
    <option value="advanced_no_opportunity">8. Geavanceerd — geen duidelijke kans</option>
  </select>
  <select id="fSort" onchange="render()">
    <option value="">Sorteer: standaard (score)</option>
    <option value="rating_desc">Hoogste rating</option>
    <option value="rating_asc">Laagste rating</option>
    <option value="reviews_desc">Meeste reviews</option>
    <option value="reviews_asc">Minste reviews</option>
    <option value="no_reviews">Geen reviews eerst</option>
  </select>
  <input id="fMin" type="number" placeholder="Min. score" style="width:100px" oninput="render()">
  <button onclick="exportApprovedCsv()">Export goedgekeurd (CSV)</button>
  <button onclick="exportReviewState()">Export review-state.json</button>
</div>

<div class="wrap">
  <div class="table-scroll">
  <table>
    <thead><tr>
      <th onclick="sortBy('score')">Score</th>
      <th onclick="sortBy('industry')">Branche</th>
      <th onclick="sortBy('business_name')">Bedrijf</th>
      <th onclick="sortBy('city')">Stad</th>
      <th>Contact</th>
      <th>Website</th>
      <th onclick="sortBy('google_rating')">Google rating</th>
      <th onclick="sortBy('google_review_count')">Review count</th>
      <th>Belangrijkste problemen</th>
      <th onclick="sortBy('website_opportunity_category')">Garage-kans</th>
      <th>Verkoopreden</th>
      <th>Review status</th>
      <th>Notities</th>
      <th>Acties</th>
    </tr></thead>
    <tbody id="rows"></tbody>
  </table>
  </div>
  <p id="count" class="muted"></p>
</div>

<dialog id="lightbox" onclick="this.close()"><img id="lightimg" alt=""></dialog>

<script>
const PAYLOAD = __DATA__;
const BASE_INDUSTRIES = __BASE_INDUSTRIES__;
let DATA = PAYLOAD.rows || [];
let INDUSTRIES = PAYLOAD.industries || [];
const REVIEW_KEY = "leadfinder_review_state_v1";
const LABELS = { dakdekkers:"Dakdekkers", thuiszorg:"Thuiszorg", makelaars:"Makelaars" };
const CATEGORY_LABELS = {
  A_no_website: "Geen website",
  B_basic_website: "Basiswebsite",
  C_manual_appointment_website: "Handmatige afspraak",
  D_booking_without_vehicle_lookup: "Boeken zonder kenteken",
  E_advanced_garage_website: "Geavanceerd",
};
let sortKey = "score", sortDir = -1;

function ilabel(slug){ return LABELS[slug] || (slug ? slug.charAt(0).toUpperCase()+slug.slice(1) : "Onbekend"); }
function loadReview(){ try { return JSON.parse(localStorage.getItem(REVIEW_KEY)) || {}; } catch { return {}; } }
function saveReview(s){ localStorage.setItem(REVIEW_KEY, JSON.stringify(s)); }
let review = loadReview();

function scoreColor(s){ if(s==null) return "#94a3b8"; if(s>=80) return "#b91c1c"; if(s>=60) return "#c2410c"; if(s>=40) return "#a16207"; return "#256b54"; }

function fillFilter(id, key){
  const sel = document.getElementById(id);
  const cur = sel.value;
  // keep the first (All) option, rebuild the rest
  sel.length = 1;
  const vals = [...new Set(DATA.map(r=>r[key]).filter(Boolean))].sort();
  vals.forEach(v=>{ const o=document.createElement("option"); o.value=v; o.textContent=v; sel.appendChild(o); });
  sel.value = cur;
}
function fillIndustry(){
  const sel = document.getElementById("fIndustry");
  const cur = sel.value;
  sel.length = 1;
  const vals = [...new Set([...BASE_INDUSTRIES, ...INDUSTRIES, ...DATA.map(r=>r.industry).filter(Boolean)])].sort();
  vals.forEach(v=>{ const o=document.createElement("option"); o.value=v; o.textContent=ilabel(v); sel.appendChild(o); });
  sel.value = cur;
}

function setStatus(pid, status){
  review[pid] = review[pid] || {};
  review[pid].status = review[pid].status === status ? "pending" : status;
  saveReview(review); render();
}
function setNotes(pid, val){ review[pid]=review[pid]||{}; review[pid].notes=val; saveReview(review); }

function hasReviews(r){ return r.google_review_count!=null && r.google_review_count>0; }

// The 8 required garage-opportunity filters. Rows from non-garage industries
// carry `null` for every garage field, so a strict `===true/false` check
// naturally excludes them from every one of these filters (no separate
// "is this a garage row" guard needed).
const GARAGE_PREDICATES = {
  no_website: r => r.website_opportunity_category === "A_no_website",
  basic_form: r => r.has_basic_contact_form === true,
  appointment_no_calendar: r => r.has_appointment_request_form === true && r.has_real_booking_calendar === false,
  no_time_slots: r => r.can_select_available_time_slot === false,
  no_kenteken: r => r.can_enter_license_plate === false,
  kenteken_no_lookup: r => r.can_enter_license_plate === true && r.has_vehicle_lookup_result === false,
  booking_no_rdw: r => r.has_real_booking_calendar === true && r.has_rdw_or_vehicle_data_integration === false,
  advanced_no_opportunity: r => r.website_opportunity_category === "E_advanced_garage_website",
};

function filtered(){
  const q=document.getElementById("q").value.toLowerCase();
  const industry=document.getElementById("fIndustry").value;
  const city=document.getElementById("fCity").value, region=document.getElementById("fRegion").value;
  const status=document.getElementById("fStatus").value;
  const reviews=document.getElementById("fReviews").value;
  const garage=document.getElementById("fGarage").value;
  const min=parseInt(document.getElementById("fMin").value,10);
  let out = DATA.filter(r=>{
    const st=(review[r.place_id]||{}).status||"pending";
    if(q && !((r.business_name||"").toLowerCase().includes(q) || (r.website||"").toLowerCase().includes(q))) return false;
    if(industry && r.industry!==industry) return false;
    if(city && r.city!==city) return false;
    if(region && r.region!==region) return false;
    if(status && st!==status) return false;
    if(reviews==="with" && !hasReviews(r)) return false;
    if(reviews==="without" && hasReviews(r)) return false;
    if(garage){ const pred=GARAGE_PREDICATES[garage]; if(pred && !pred(r)) return false; }
    if(!isNaN(min) && (r.score==null || r.score<min)) return false;
    return true;
  });
  const sort=document.getElementById("fSort").value;
  const num=(v,lo)=> v==null ? lo : Number(v);
  const cmp = {
    rating_desc:(a,b)=>num(b.google_rating,-1)-num(a.google_rating,-1),
    rating_asc:(a,b)=>num(a.google_rating,1e9)-num(b.google_rating,1e9),
    reviews_desc:(a,b)=>num(b.google_review_count,-1)-num(a.google_review_count,-1),
    reviews_asc:(a,b)=>num(a.google_review_count,1e9)-num(b.google_review_count,1e9),
    no_reviews:(a,b)=>(hasReviews(a)?1:0)-(hasReviews(b)?1:0),
  }[sort];
  if(cmp){ out.sort(cmp); }
  else {
    out.sort((a,b)=>{
      let av=a[sortKey], bv=b[sortKey];
      if(av==null) av = (sortKey==="score"||sortKey.startsWith("google_")) ? -1 : "";
      if(bv==null) bv = (sortKey==="score"||sortKey.startsWith("google_")) ? -1 : "";
      return (av>bv?1:av<bv?-1:0)*sortDir;
    });
  }
  return out;
}

// --- Defensive normalizers: coerce ANY field shape to a display-safe value ---
function nstr(v){ return (v==null) ? "" : String(v); }                 // null/obj/num -> string
function nphone(r){ const s=nstr(r.phone).trim(); return s || null; }
function nweb(r){ const s=nstr(r.website).trim(); return s || null; }
function nproblems(r){
  const arr = Array.isArray(r.reasons) ? r.reasons : [];
  const parts = arr.map(x => (x && x.reason!=null) ? nstr(x.reason) : nstr(x)).filter(Boolean);
  return parts.join(" · ") || "—";
}
function ratingText(r){ const v=Number(r.google_rating);
  return (r.google_rating!=null && isFinite(v)) ? `${v.toFixed(1)} ★` : "—"; }
function reviewsText(r){ const c=Number(r.google_review_count);
  return (isFinite(c) && c>0) ? `${c} reviews` : "geen reviews"; }

function categoryLabel(cat){ return cat ? (CATEGORY_LABELS[cat] || cat) : null; }

// --- Defensive DOM row renderer -------------------------------------------
// Rows are built with createElement + textContent, so a bad field value can
// never break the table structure: every row ALWAYS gets exactly 14 <td> cells,
// and textContent auto-escapes all data. This replaces the fragile
// string-parsed row HTML that could drop later columns (the Thuiszorg symptom).
function td(cls){ const e=document.createElement("td"); if(cls) e.className=cls; return e; }
function el(tag, cls, text){ const e=document.createElement(tag); if(cls) e.className=cls;
  if(text!=null) e.textContent=text; return e; }
function muted(text){ return el("span","muted",text); }
function link(href, text){ const a=el("a",null,text); a.href=href||"#"; a.target="_blank"; a.rel="noopener"; return a; }

function makeRow(r){
  const tr=document.createElement("tr");
  const st=(review[r.place_id]||{}).status||"pending";
  const notes=(review[r.place_id]||{}).notes||"";

  // 1 Score
  let c=td(); const sp=el("span","score", r.score==null?"—":r.score);
  sp.style.background=scoreColor(r.score); c.appendChild(sp); tr.appendChild(c);
  // 2 Branche
  c=td(); c.appendChild(el("span","branche", ilabel(r.industry))); tr.appendChild(c);
  // 3 Bedrijf
  c=td(); c.appendChild(el("strong",null, nstr(r.business_name)));
  c.appendChild(el("div","muted", `${nstr(r.category)} · ${nstr(r.business_status)}`));
  if(r.google_maps_uri){ const a=link(nstr(r.google_maps_uri),"Maps ↗"); a.style.display="block"; c.appendChild(a); }
  tr.appendChild(c);
  // 4 Stad
  c=td(); c.appendChild(document.createTextNode(nstr(r.city))); c.appendChild(el("div","muted", nstr(r.region))); tr.appendChild(c);
  // 5 Contact (phone)  — normalized to a string or em-dash
  { const p=nphone(r); c=td(); c.appendChild(p ? document.createTextNode(p) : muted("—")); tr.appendChild(c); }
  // 6 Website — normalized to a link or "geen website"
  { const wsite=nweb(r); c=td(); c.appendChild(wsite ? link(wsite, wsite) : muted("geen website")); tr.appendChild(c); }
  // 7 Google rating
  c=td(); c.textContent=ratingText(r); tr.appendChild(c);
  // 8 Review count
  { const c8=Number(r.google_review_count); c=td();
    c.appendChild((isFinite(c8) && c8>0) ? document.createTextNode(reviewsText(r)) : muted("geen reviews")); tr.appendChild(c); }
  // 9 Belangrijkste problemen — normalized joined string
  c=td("prob"); c.textContent=nproblems(r); tr.appendChild(c);
  // 10 Garage-kans — category badge (empty for non-garage industries)
  c=td(); const catLabel=categoryLabel(r.website_opportunity_category);
  c.appendChild(catLabel ? el("span","branche", catLabel) : muted("—")); tr.appendChild(c);
  // 11 Verkoopreden — factual sales-gap sentence(s)
  c=td("prob"); c.textContent = r.sales_reason ? nstr(r.sales_reason) : "—"; tr.appendChild(c);
  // 12 Review status
  c=td(); c.appendChild(el("div","status-"+st, st)); tr.appendChild(c);
  // 13 Notities
  c=td(); const ta=el("textarea"); ta.placeholder="Notitie…"; ta.value=notes;
  ta.addEventListener("input", e=>setNotes(r.place_id, e.target.value)); c.appendChild(ta); tr.appendChild(c);
  // 14 Acties
  c=td(); const ap=el("button","btn-sm approve","✓"); ap.addEventListener("click",()=>setStatus(r.place_id,"approved"));
  const rj=el("button","btn-sm reject","✗"); rj.addEventListener("click",()=>setStatus(r.place_id,"rejected"));
  c.appendChild(ap); c.appendChild(rj); tr.appendChild(c);

  return tr;
}

function render(){
  const rows=filtered();
  const tb=document.getElementById("rows");
  tb.textContent="";                       // clear (no innerHTML)
  const frag=document.createDocumentFragment();
  rows.forEach(r=>{
    try { frag.appendChild(makeRow(r)); }
    catch(err){                            // one bad record can never stop the loop
      console.error("Row render failed for", r && r.place_id, err);
      const tr=document.createElement("tr"); tr.appendChild(el("td",null,"⚠ render error"));
      frag.appendChild(tr);
    }
  });
  tb.appendChild(frag);
  updateCounters(rows);
}

function updateCounters(rows){
  const hi = rows.filter(r=>r.score!=null && r.score>=10).length;
  const withRev = rows.filter(r=>r.google_review_count!=null && r.google_review_count>0);
  const without = rows.length - withRev.length;
  const rated = rows.filter(r=>r.google_rating!=null);
  const avg = rated.length ? (rated.reduce((s,r)=>s+Number(r.google_rating),0)/rated.length).toFixed(2) : "—";
  const totalReviews = withRev.reduce((s,r)=>s+Number(r.google_review_count),0);
  const scope = document.getElementById("fIndustry").value;
  const scopeLabel = scope ? ilabel(scope) : "alle branches";
  document.getElementById("count").textContent =
    `${rows.length} leads getoond (${scopeLabel}) · ${hi} met score ≥ 10 · `
    + `${withRev.length} met reviews · ${without} zonder reviews · `
    + `gem. rating ${avg} · ${totalReviews} reviews totaal · ${DATA.length} totaal in dataset`;
}
function shot(path,label){ return path ? `<img class="shot" src="${path}" alt="${label}" onclick="zoom('${path}')">` : `<div class="muted">${label}: —</div>`; }
function zoom(src){ const d=document.getElementById("lightbox"); document.getElementById("lightimg").src=src; d.showModal(); }
function sortBy(k){ if(sortKey===k) sortDir*=-1; else { sortKey=k; sortDir = k==="score"?-1:1; } render(); }

function exportReviewState(){ download("review-state.json", JSON.stringify(review,null,2), "application/json"); }
function exportApprovedCsv(){
  const cols=["place_id","industry","business_name","category","city","region","phone","website","business_status","google_rating","google_review_count","opportunity_score","top_problems","google_maps_uri","review_status","notes",
    "website_opportunity_category","has_basic_contact_form","has_appointment_request_form","has_real_booking_calendar","can_select_service","can_select_branch","can_select_date","can_select_available_time_slot","can_enter_license_plate","has_vehicle_lookup_result","has_rdw_or_vehicle_data_integration","booking_gap_reason","vehicle_lookup_gap_reason","website_score","sales_reason","recommended_opening_line"];
  const approved=DATA.filter(r=>(review[r.place_id]||{}).status==="approved");
  const lines=[cols.join(",")];
  approved.forEach(r=>{
    const rv=review[r.place_id]||{};
    const row=[r.place_id,r.industry,r.business_name,r.category,r.city,r.region,r.phone,r.website,r.business_status,r.google_rating,r.google_review_count,r.score,
      (r.reasons||[]).map(x=>x.reason).join(" | "),r.google_maps_uri,"approved",rv.notes||"",
      r.website_opportunity_category,r.has_basic_contact_form,r.has_appointment_request_form,r.has_real_booking_calendar,r.can_select_service,r.can_select_branch,r.can_select_date,r.can_select_available_time_slot,r.can_enter_license_plate,r.has_vehicle_lookup_result,r.has_rdw_or_vehicle_data_integration,r.booking_gap_reason,r.vehicle_lookup_gap_reason,r.score,r.sales_reason,r.recommended_opening_line];
    lines.push(row.map(v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`).join(","));
  });
  download("approved-leads.csv", lines.join("\n"), "text/csv");
}
function download(name, text, type){
  const blob=new Blob([text],{type}); const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href);
}

function init(){
  fillIndustry();
  fillFilter("fCity","city"); fillFilter("fRegion","region");
  render();
}

// Read the combined data file when served; fall back to the inline snapshot
// (so opening the file directly via file:// still works).
// Cache-bust the data fetch so a rebuild is always picked up immediately.
fetch("dashboard-data.json?v=" + Date.now(), {cache:"no-store"}).then(r=>{ if(!r.ok) throw 0; return r.json(); })
  .then(d=>{ DATA = d.rows || DATA; INDUSTRIES = d.industries || INDUSTRIES; init(); })
  .catch(()=>{ init(); });
</script>
</body>
</html>"""
