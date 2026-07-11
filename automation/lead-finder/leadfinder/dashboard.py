"""Generates a single self-contained HTML review dashboard.

No server, no build step, no dependencies: leads + audits + scores are embedded
as JSON and vanilla JS provides sorting, filtering, screenshot viewing, and
per-lead approve/reject + notes. Review state is saved to the browser's
localStorage and can be exported as review-state.json (drop it in output/ so the
CLI `export` picks up statuses) or as an approved-leads CSV.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone


def build_dashboard(leads, audits, scores) -> str:
    """Return the full HTML document for the dashboard."""
    audits_by = {a.get("place_id"): a for a in audits}
    scores_by = scores  # {place_id: {score, reasons, top_problems}}

    rows = []
    for lead in leads:
        pid = lead.get("place_id")
        audit = audits_by.get(pid, {})
        score = scores_by.get(pid, {})
        rows.append({
            "place_id": pid,
            "business_name": lead.get("business_name"),
            "category": lead.get("category"),
            "city": lead.get("city"),
            "region": lead.get("region"),
            "phone": lead.get("phone"),
            "website": lead.get("website"),
            "business_status": lead.get("business_status"),
            "google_maps_uri": lead.get("google_maps_uri"),
            "score": score.get("score"),
            "reasons": score.get("reasons", []),
            "screenshot_desktop": audit.get("screenshot_desktop"),
            "screenshot_mobile": audit.get("screenshot_mobile"),
        })

    data_json = json.dumps(rows, ensure_ascii=False)
    generated = datetime.now(timezone.utc).isoformat()
    return _TEMPLATE.replace("__DATA__", data_json).replace("__GENERATED__", generated)


_TEMPLATE = r"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
  table { width:100%; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.08); }
  th, td { padding:10px 12px; text-align:left; font-size:13px; border-bottom:1px solid var(--line); vertical-align:top; }
  th { background:#f8fafc; cursor:pointer; user-select:none; white-space:nowrap; }
  .score { font-weight:800; padding:2px 8px; border-radius:999px; color:#fff; display:inline-block; }
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
  <select id="fCity" onchange="render()"><option value="">Alle steden</option></select>
  <select id="fRegion" onchange="render()"><option value="">Alle regio's</option></select>
  <select id="fCat" onchange="render()"><option value="">Alle categorieën</option></select>
  <select id="fStatus" onchange="render()">
    <option value="">Alle statussen</option>
    <option value="pending">Nog te beoordelen</option>
    <option value="approved">Goedgekeurd</option>
    <option value="rejected">Afgewezen</option>
  </select>
  <input id="fMin" type="number" placeholder="Min. score" style="width:100px" oninput="render()">
  <button onclick="exportApprovedCsv()">Export goedgekeurd (CSV)</button>
  <button onclick="exportReviewState()">Export review-state.json</button>
</div>

<div class="wrap">
  <table>
    <thead><tr>
      <th onclick="sortBy('score')">Score ▾</th>
      <th onclick="sortBy('business_name')">Bedrijf</th>
      <th onclick="sortBy('city')">Stad</th>
      <th>Contact</th>
      <th>Problemen</th>
      <th>Screenshots</th>
      <th>Beoordeling</th>
    </tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <p id="count" class="muted"></p>
</div>

<dialog id="lightbox" onclick="this.close()"><img id="lightimg" alt=""></dialog>

<script>
const DATA = __DATA__;
const REVIEW_KEY = "leadfinder_review_state_v1";
let sortKey = "score", sortDir = -1;

function loadReview(){ try { return JSON.parse(localStorage.getItem(REVIEW_KEY)) || {}; } catch { return {}; } }
function saveReview(s){ localStorage.setItem(REVIEW_KEY, JSON.stringify(s)); }
let review = loadReview();

function scoreColor(s){ if(s==null) return "#94a3b8"; if(s>=80) return "#b91c1c"; if(s>=60) return "#c2410c"; if(s>=40) return "#a16207"; return "#256b54"; }

function fillFilter(id, key){
  const sel = document.getElementById(id);
  const vals = [...new Set(DATA.map(r=>r[key]).filter(Boolean))].sort();
  vals.forEach(v=>{ const o=document.createElement("option"); o.value=v; o.textContent=v; sel.appendChild(o); });
}
["fCity","fRegion","fCat"].forEach((id,i)=>fillFilter(id,["city","region","category"][i]));

function setStatus(pid, status){
  review[pid] = review[pid] || {};
  review[pid].status = review[pid].status === status ? "pending" : status;
  saveReview(review); render();
}
function setNotes(pid, val){ review[pid]=review[pid]||{}; review[pid].notes=val; saveReview(review); }

function filtered(){
  const q=document.getElementById("q").value.toLowerCase();
  const city=document.getElementById("fCity").value, region=document.getElementById("fRegion").value;
  const cat=document.getElementById("fCat").value, status=document.getElementById("fStatus").value;
  const min=parseInt(document.getElementById("fMin").value,10);
  return DATA.filter(r=>{
    const st=(review[r.place_id]||{}).status||"pending";
    if(q && !((r.business_name||"").toLowerCase().includes(q) || (r.website||"").toLowerCase().includes(q))) return false;
    if(city && r.city!==city) return false;
    if(region && r.region!==region) return false;
    if(cat && r.category!==cat) return false;
    if(status && st!==status) return false;
    if(!isNaN(min) && (r.score==null || r.score<min)) return false;
    return true;
  }).sort((a,b)=>{
    let av=a[sortKey], bv=b[sortKey];
    if(av==null) av = sortKey==="score" ? -1 : "";
    if(bv==null) bv = sortKey==="score" ? -1 : "";
    return (av>bv?1:av<bv?-1:0)*sortDir;
  });
}

function render(){
  const rows=filtered(); const tb=document.getElementById("rows"); tb.innerHTML="";
  rows.forEach(r=>{
    const st=(review[r.place_id]||{}).status||"pending";
    const notes=(review[r.place_id]||{}).notes||"";
    const probs=(r.reasons||[]).map(x=>x.reason).join(" · ")||"—";
    const tr=document.createElement("tr");
    tr.innerHTML = `
      <td><span class="score" style="background:${scoreColor(r.score)}">${r.score==null?"—":r.score}</span></td>
      <td><strong>${r.business_name||""}</strong><div class="muted">${r.category||""} · ${r.business_status||""}</div>
          ${r.google_maps_uri?`<a href="${r.google_maps_uri}" target="_blank" rel="noopener">Maps ↗</a>`:""}</td>
      <td>${r.city||""}<div class="muted">${r.region||""}</div></td>
      <td>${r.phone?`<div>${r.phone}</div>`:""}${r.website?`<a href="${r.website}" target="_blank" rel="noopener">${r.website}</a>`:'<span class="muted">geen website</span>'}</td>
      <td class="prob">${probs}</td>
      <td>${shot(r.screenshot_desktop,"desktop")}${shot(r.screenshot_mobile,"mobiel")}</td>
      <td>
        <div class="status-${st}">${st}</div>
        <button class="btn-sm approve" onclick="setStatus('${r.place_id}','approved')">✓</button>
        <button class="btn-sm reject" onclick="setStatus('${r.place_id}','rejected')">✗</button>
        <textarea placeholder="Notitie…" oninput="setNotes('${r.place_id}', this.value)">${notes.replace(/</g,"&lt;")}</textarea>
      </td>`;
    tb.appendChild(tr);
  });
  document.getElementById("count").textContent = `${rows.length} van ${DATA.length} leads`;
}
function shot(path,label){ return path ? `<img class="shot" src="${path}" alt="${label}" onclick="zoom('${path}')">` : `<div class="muted">${label}: —</div>`; }
function zoom(src){ const d=document.getElementById("lightbox"); document.getElementById("lightimg").src=src; d.showModal(); }
function sortBy(k){ if(sortKey===k) sortDir*=-1; else { sortKey=k; sortDir = k==="score"?-1:1; } render(); }

function exportReviewState(){ download("review-state.json", JSON.stringify(review,null,2), "application/json"); }
function exportApprovedCsv(){
  const cols=["place_id","business_name","category","city","region","phone","website","business_status","opportunity_score","top_problems","google_maps_uri","review_status","notes"];
  const approved=DATA.filter(r=>(review[r.place_id]||{}).status==="approved");
  const lines=[cols.join(",")];
  approved.forEach(r=>{
    const rv=review[r.place_id]||{};
    const row=[r.place_id,r.business_name,r.category,r.city,r.region,r.phone,r.website,r.business_status,r.score,
      (r.reasons||[]).map(x=>x.reason).join(" | "),r.google_maps_uri,"approved",rv.notes||""];
    lines.push(row.map(v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`).join(","));
  });
  download("approved-leads.csv", lines.join("\n"), "text/csv");
}
function download(name, text, type){
  const blob=new Blob([text],{type}); const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href);
}
render();
</script>
</body>
</html>"""
