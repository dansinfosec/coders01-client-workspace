// Interne RDW-proxy (Vercel serverless function) — herbruikbaar in de automotive starter.
// Centraliseert alle RDW Open Data-toegang: in-memory caching (per cold start), best-effort
// rate limiting per IP, CDN-cache-headers en centrale foutafhandeling. De client
// (src/services/rdwService.ts) roept /api/rdw?kenteken=XX aan en valt terug op directe RDW
// (CORS-enabled) wanneer deze route niet draait (bijv. lokale `vite dev`).

const VEHICLES = "https://opendata.rdw.nl/resource/m9d7-ebf2.json";
const FUEL = "https://opendata.rdw.nl/resource/8ys7-d773.json";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24u
const RATE_LIMIT = 60; // requests per minuut per IP
const cache = new Map(); // kenteken -> { at, data }
const hits = new Map(); // ip -> { count, resetAt }

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`RDW ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  const kenteken = String(req.query.kenteken || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  if (kenteken.length < 4) {
    res.status(400).json({ error: "invalid_kenteken" });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({ error: "rate_limited" });
    return;
  }

  const cached = cache.get(kenteken);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json(cached.data);
    return;
  }

  const signal =
    typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined;

  try {
    const q = `?kenteken=${encodeURIComponent(kenteken)}`;
    const [vehicle, fuel] = await Promise.all([
      fetchJson(VEHICLES + q, signal),
      fetchJson(FUEL + q, signal).catch(() => []), // brandstof is niet kritiek
    ]);
    const data = { vehicle, fuel };
    cache.set(kenteken, { at: Date.now(), data });
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json(data);
  } catch (err) {
    const aborted = err && err.name === "AbortError";
    res.status(aborted ? 504 : 502).json({ error: aborted ? "rdw_timeout" : "rdw_unavailable" });
  }
}
