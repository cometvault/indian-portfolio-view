/* Portfolio View India — shared app */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const inr = (n) => {
  if (n == null || n === "" || Number.isNaN(+n)) return "—";
  return "₹" + Math.round(+n).toLocaleString("en-IN");
};
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const DAY = 864e5;
const T = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })();
const dt = (offsetDays) => new Date(T + offsetDays * DAY);
const fd = (d) => {
  if (d == null || d === "") return "—";
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(+x)) return String(d);
  return x.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const IC = {
  start: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="13" stroke="url(#g)" stroke-width="2"/><path d="M10 14h8M14 10v8" stroke="url(#g)" stroke-width="2" stroke-linecap="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="28" y2="28"><stop stop-color="#00F0DC"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`,
  ipo: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><rect x="4" y="6" width="20" height="16" rx="3" stroke="url(#g2)" stroke-width="2"/><path d="M9 12h10M9 16h6" stroke="url(#g2)" stroke-width="1.75" stroke-linecap="round"/><defs><linearGradient id="g2" x1="0" y1="0" x2="28" y2="28"><stop stop-color="#00F0DC"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`,
  gold: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="9" stroke="url(#g3)" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="url(#g3)" opacity=".5"/><defs><linearGradient id="g3" x1="0" y1="0" x2="28" y2="28"><stop stop-color="#00F0DC"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`,
  mf: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M6 20V10l8-4 8 4v10" stroke="url(#g4)" stroke-width="2" stroke-linejoin="round"/><path d="M14 6v14" stroke="url(#g4)" stroke-width="1.5"/><defs><linearGradient id="g4" x1="0" y1="0" x2="28" y2="28"><stop stop-color="#00F0DC"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`,
  eq: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M5 19l6-7 5 4 7-9" stroke="url(#g5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="g5" x1="0" y1="0" x2="28" y2="28"><stop stop-color="#00F0DC"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`
};
const ic = (name) => IC[name] || "";

const MARK = `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect width="34" height="34" rx="10" fill="url(#bm)"/><path d="M10 18c2-4 4-6 7-6s5 2 7 6" stroke="#04140d" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="12" r="2.2" fill="#04140d"/><defs><linearGradient id="bm" x1="0" y1="0" x2="34" y2="34"><stop stop-color="#00F0DC"/><stop offset=".45" stop-color="#3DF5A0"/><stop offset=".75" stop-color="#9BFF5A"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`;

const NAV = [
  { href: "index.html", label: "Home", page: "home" },
  { href: "new-to-finance.html", label: "Start here", page: "start", cta: true },
  { href: "ipo.html", label: "IPOs", page: "ipo" },
  { href: "gold-etf.html", label: "Gold & ETF", page: "gold" },
  { href: "mutual-funds.html", label: "Mutual Funds", page: "mf" },
  { href: "equity.html", label: "Equity", page: "eq" }
];

function layout() {
  const page = document.body.dataset.page || "";
  const hdr = $("#hdr");
  if (hdr) {
    hdr.innerHTML = `<header class="hdr"><div class="hdr-in">
      <a class="logo" href="index.html" aria-label="Portfolio View India home">
        <img src="assets/logo.png" width="34" height="34" alt="" class="logo-img">
        <span class="logo-txt">Portfolio View<span>India</span></span>
      </a>
      <nav class="nav" aria-label="Primary">${NAV.map(n => {
        const cur = n.page === page ? ' aria-current="page"' : "";
        const cls = n.cta ? ' class="cta"' : "";
        return `<a href="${n.href}"${cls}${cur}>${n.label}</a>`;
      }).join("")}</nav>
    </div></header>`;
  }
  const img = hdr && hdr.querySelector(".logo-img");
  if (img) img.onerror = function () { this.outerHTML = MARK; };
  const ftr = $("#ftr");
  if (ftr) {
    ftr.innerHTML = `<footer class="ftr"><div class="ftr-in">
      <div><h4>Start</h4><a href="new-to-finance.html">New To Finance</a></div>
      <div><h4>Markets today</h4><a href="ipo.html">IPOs</a><a href="gold-etf.html">Gold &amp; ETF</a></div>
      <div><h4>Learn</h4><a href="mutual-funds.html">Mutual Funds</a><a href="equity.html">Equity</a></div>
    </div>
    <p class="ftr-legal">Educational only. Not investment advice. Not SEBI-registered. Investments carry risk and returns are not guaranteed.</p></footer>`;
  }
}
layout();

/* Age mixes: [label, equity, debt, gold] */
const AGES = [
  ["20–24", 75, 15, 10],
  ["25–29", 70, 20, 10],
  ["30–39", 60, 30, 10],
  ["40–49", 50, 40, 10],
  ["50+", 35, 50, 15]
];
const MIXC = ["var(--c2)", "var(--blue)", "var(--c4)"];
const MIXN = ["Equity", "Debt", "Gold"];

function mixFor(ageIndex, riskShift) {
  const row = AGES[ageIndex] || AGES[1];
  let eq = row[1] + (+riskShift || 0);
  eq = Math.max(10, Math.min(90, eq));
  const gold = row[3];
  const debt = 100 - eq - gold;
  return [eq, debt, gold];
}

function drawMix(donutEl, legendEl, values) {
  if (!donutEl) return;
  const [e, d, g] = values;
  const stops = [
    `${MIXC[0]} 0% ${e}%`,
    `${MIXC[1]} ${e}% ${e + d}%`,
    `${MIXC[2]} ${e + d}% 100%`
  ];
  donutEl.style.background = `conic-gradient(${stops.join(",")})`;
  if (legendEl) {
    legendEl.innerHTML = MIXN.map((n, i) =>
      `<div class="row"><span><span class="dot" style="background:${MIXC[i]}"></span>${n}</span><b class="num">${values[i]}%</b></div>`
    ).join("");
  }
}

function segs(container, cb) {
  if (!container) return;
  container.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !container.contains(b)) return;
    $$("button", container).forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    cb(b.dataset.v);
  });
}

/* Demo IPO data — relative dates so open/upcoming/closed stay valid */
function dmo(offset) { return T + offset * DAY; }
const IPO_DEMO = [
  { name: "Demo Solar Ltd", sector: "Renewable Energy", seg: "main", band: "₹95–100", min: 14000, lot: 140, issue: 850, gmp: 22, gmpPct: 22, sub: 4.2, opens: dmo(-1), closes: dmo(2), listing: dmo(7), status: "open" },
  { name: "Demo Pharma Ltd", sector: "Healthcare", seg: "main", band: "₹420–440", min: 14850, lot: 34, issue: 1200, gmp: 55, gmpPct: 12.5, sub: 8.1, opens: dmo(-2), closes: dmo(1), listing: dmo(6), status: "open" },
  { name: "Demo Fintech Ltd", sector: "Financial Services", seg: "main", band: "₹210–220", min: 14520, lot: 66, issue: 2100, gmp: 18, gmpPct: 8.2, sub: 2.4, opens: dmo(3), closes: dmo(5), listing: dmo(12), status: "upcoming" },
  { name: "Demo Foods Ltd", sector: "FMCG", seg: "main", band: "₹160–170", min: 13600, lot: 80, issue: 600, gmp: 12, gmpPct: 7.1, sub: null, opens: dmo(8), closes: dmo(10), listing: dmo(17), status: "upcoming" },
  { name: "Demo Logistics Ltd", sector: "Logistics", seg: "main", band: "₹280–295", min: 14750, lot: 50, issue: 980, gmp: -5, gmpPct: -1.7, sub: 1.1, opens: dmo(-10), closes: dmo(-7), listing: dmo(-2), status: "closed" },
  { name: "Demo Chemicals Ltd", sector: "Chemicals", seg: "main", band: "₹500–525", min: 15750, lot: 30, issue: 1500, gmp: 40, gmpPct: 7.6, sub: 12.5, opens: dmo(-14), closes: dmo(-11), listing: dmo(-5), status: "closed" },
  { name: "Demo Retail Ltd", sector: "Retail", seg: "main", band: "₹110–118", min: 14160, lot: 120, issue: 720, gmp: 8, gmpPct: 6.8, sub: 3.0, opens: dmo(0), closes: dmo(3), listing: dmo(9), status: "open" },
  { name: "Demo Power Ltd", sector: "Power", seg: "main", band: "₹340–360", min: 14400, lot: 40, issue: 1800, gmp: 25, gmpPct: 6.9, sub: null, opens: dmo(12), closes: dmo(14), listing: dmo(21), status: "upcoming" },
  { name: "Demo Tech SME", sector: "IT Services", seg: "sme", band: "₹80–85", min: 136000, lot: 1600, issue: 45, gmp: 15, gmpPct: 17.6, sub: 6.2, opens: dmo(-1), closes: dmo(1), listing: dmo(6), status: "open" },
  { name: "Demo Textiles SME", sector: "Textiles", seg: "sme", band: "₹55–58", min: 116000, lot: 2000, issue: 28, gmp: 4, gmpPct: 6.9, sub: 1.8, opens: dmo(4), closes: dmo(6), listing: dmo(13), status: "upcoming" },
  { name: "Demo Agri SME", sector: "Agriculture", seg: "sme", band: "₹72–76", min: 121600, lot: 1600, issue: 32, gmp: -2, gmpPct: -2.6, sub: 0.9, opens: dmo(-12), closes: dmo(-9), listing: dmo(-3), status: "closed" },
  { name: "Demo Packaging SME", sector: "Packaging", seg: "sme", band: "₹90–95", min: 142500, lot: 1500, issue: 38, gmp: 10, gmpPct: 10.5, sub: 3.5, opens: dmo(0), closes: dmo(2), listing: dmo(8), status: "open" }
];

const GOLD_DEMO = {
  updated_at: new Date().toISOString(),
  source: "demo",
  source_url: "#",
  cities: [
    { city: "Mumbai", k24: 7470, k22: 6850 },
    { city: "Delhi", k24: 7465, k22: 6845 },
    { city: "Bengaluru", k24: 7460, k22: 6840 },
    { city: "Chennai", k24: 7455, k22: 6835 },
    { city: "Hyderabad", k24: 7465, k22: 6845 },
    { city: "Kolkata", k24: 7455, k22: 6835 }
  ]
};

function parseDate(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  if (v instanceof Date) return +v;
  const s = String(v).trim();
  const iso = Date.parse(s);
  if (!Number.isNaN(iso)) return iso;
  const m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})/);
  if (m) {
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const mon = months[m[2].toLowerCase().slice(0, 3)];
    if (mon != null) {
      const y = new Date().getFullYear();
      return new Date(y, mon, +m[1]).getTime();
    }
  }
  return null;
}

function ipoStatus(opens, closes) {
  const o = parseDate(opens);
  const c = parseDate(closes);
  if (o != null && o > T) return "upcoming";
  if (c != null && c < T) return "closed";
  if (o != null || c != null) return "open";
  return "open";
}

function normIPO(raw) {
  if (!raw) return null;
  const rows = [];
  const push = (arr, seg) => {
    (arr || []).forEach((r) => {
      const name = r.name || r.company || "—";
      const opens = parseDate(r.opens ?? r.open);
      const closes = parseDate(r.closes ?? r.close);
      const listing = parseDate(r.listing_date ?? r.listing);
      let status = (r.status || "").toLowerCase();
      if (!status || status === "live") status = ipoStatus(opens, closes);
      if (!["open", "upcoming", "closed"].includes(status)) status = "open";
      rows.push({
        name,
        sector: r.sector || "—",
        seg: seg || r.seg || "main",
        band: r.price_band || r.priceBand || r.band || "—",
        min: r.min_amount ?? r.minAmount ?? r.min ?? null,
        lot: r.lot_size ?? r.lotSize ?? r.lot ?? null,
        issue: r.issue_size ?? r.issueSize ?? r.issue ?? null,
        gmp: r.gmp ?? null,
        gmpPct: r.gmp_pct ?? r.gmpPct ?? null,
        sub: r.subscription_x ?? r.subscription ?? r.sub ?? null,
        opens: opens ?? r.opens,
        closes: closes ?? r.closes,
        listing: listing ?? r.listing_date ?? r.listing,
        status
      });
    });
  };
  if (Array.isArray(raw.mainboard) || Array.isArray(raw.sme)) {
    push(raw.mainboard, "main");
    push(raw.sme, "sme");
  } else if (Array.isArray(raw.rows)) {
    push(raw.rows, null);
  } else if (Array.isArray(raw)) {
    push(raw, null);
  }
  return rows.length ? rows : null;
}

async function getJSON(file) {
  try {
    const res = await fetch("data/" + file + "?v=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function getIPO() {
  const raw = await getJSON("ipo.json");
  const rows = normIPO(raw);
  if (rows && rows.length) {
    return {
      rows,
      live: true,
      updated: raw.updated_at || raw.updated,
      source: raw.source || "ipowatch.in",
      source_url: raw.source_url || raw.sourceUrl || "https://ipowatch.in/",
      file: "ipo.json"
    };
  }
  return {
    rows: IPO_DEMO,
    live: false,
    updated: new Date().toISOString(),
    source: "demo",
    source_url: "#",
    file: "ipo.json"
  };
}

async function getGold() {
  const raw = await getJSON("gold.json");
  if (raw && Array.isArray(raw.cities) && raw.cities.length) {
    const cities = raw.cities.map((c) => ({
      city: c.city,
      k24: c.k24 ?? c.rate24k ?? c.rate_24k ?? 0,
      k22: c.k22 ?? c.rate22k ?? c.rate_22k ?? 0
    }));
    return {
      j: { cities, updated_at: raw.updated_at || raw.updated, source: raw.source, source_url: raw.source_url || raw.sourceUrl },
      live: true,
      updated: raw.updated_at || raw.updated,
      source: raw.source || "goodreturns.in",
      source_url: raw.source_url || raw.sourceUrl || "#",
      file: "gold.json"
    };
  }
  return {
    j: GOLD_DEMO,
    live: false,
    updated: GOLD_DEMO.updated_at,
    source: "demo",
    source_url: "#",
    file: "gold.json"
  };
}

function statusBar(el, result, retryFn) {
  if (!el) return;
  const live = result && result.live;
  const updated = result && (result.updated || (result.j && result.j.updated_at));
  const src = (result && result.source) || "—";
  const srcUrl = (result && result.source_url) || "#";
  let ageH = 0;
  if (updated) {
    const t = Date.parse(updated);
    if (!Number.isNaN(t)) ageH = (Date.now() - t) / 36e5;
  }
  const stale = live && ageH > 36;
  let html = "";
  if (!live) {
    el.className = "status warn";
    html = `◐ Demo data shown. Add data/${result.file || "…"} from the update script to go live.`;
  } else if (stale) {
    el.className = "status warn";
    html = `⚠ Data may be out of date · Updated ${fmtIST(updated)} · Source: <a href="${esc(srcUrl)}" target="_blank" rel="noopener">${esc(src)} ↗</a>`;
  } else {
    el.className = "status";
    html = `● Live · Updated ${fmtIST(updated)} · Source: <a href="${esc(srcUrl)}" target="_blank" rel="noopener">${esc(src)} ↗</a>`;
  }
  if (typeof retryFn === "function") {
    html += ` <button type="button" id="rf">↻ Refresh</button>`;
  }
  el.innerHTML = html;
  const btn = $("#rf", el);
  if (btn && retryFn) btn.onclick = () => retryFn(true);
}

function fmtIST(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return String(iso);
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: false
  }) + " IST";
}
