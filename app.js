/* Portfolio View India — shared app */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const inr = (n) => {
  if (n == null || n === "" || Number.isNaN(+n)) return "—";
  return "₹" + Math.round(+n).toLocaleString("en-IN");
};
const esc = (s) => {
  const a = String.fromCharCode(38);
  return String(s ?? "")
    .replace(/&/g, a + "amp;")
    .replace(/</g, a + "lt;")
    .replace(/>/g, a + "gt;")
    .replace(/"/g, a + "quot;")
    .replace(/'/g, a + "#39;");
};

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

function closeNav() {
  document.body.classList.remove("nav-open");
  const btn = $("#navToggle");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function openNav() {
  document.body.classList.add("nav-open");
  const btn = $("#navToggle");
  if (btn) btn.setAttribute("aria-expanded", "true");
}

function toggleNav() {
  if (document.body.classList.contains("nav-open")) closeNav();
  else openNav();
}

function layout() {
  const page = document.body.dataset.page || "";
  const hdr = $("#hdr");
  if (hdr) {
    hdr.innerHTML = `<div class="hdr-stack">
      <header class="hdr"><div class="hdr-in">
        <a class="logo" href="index.html" aria-label="Portfolio View India home">
          <img src="assets/logo.svg" width="34" height="34" alt="Portfolio View India" class="logo-img" id="brandLogo" style="object-fit:contain;background:#000">
          <span class="logo-txt">Portfolio View<span>India</span></span>
        </a>
        <button type="button" class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="primaryNav">
          <svg class="ico-open" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <svg class="ico-close" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <nav class="nav" id="primaryNav" aria-label="Primary">${NAV.map(n => {
          const cur = n.page === page ? ' aria-current="page"' : "";
          const cls = n.cta ? ' class="cta"' : "";
          return `<a href="${n.href}"${cls}${cur}>${n.label}</a>`;
        }).join("")}</nav>
      </div></header>
      <div class="mkt-ribbon" id="mktRibbon" aria-label="Market ribbon">
        <div class="mkt-track" id="mktTrack"><span class="mkt-item"><span class="lbl">Markets</span><span class="val">Loading…</span></span></div>
      </div>
    </div>`;
  }
  /* Backdrop on body so it always covers the full viewport solid black */
  let backdrop = $("#navBackdrop");
  if (!backdrop) {
    backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "nav-backdrop";
    backdrop.id = "navBackdrop";
    backdrop.setAttribute("aria-label", "Close menu");
    backdrop.tabIndex = -1;
    document.body.appendChild(backdrop);
  }
  const img = hdr && hdr.querySelector(".logo-img");
  if (img) {
    img.onerror = function () { this.outerHTML = MARK; };
    if (window.PV_LOGO) img.src = window.PV_LOGO;
    else {
      var s = document.createElement("script");
      s.src = "assets/logo-data.js?v=1";
      s.onload = function () { if (window.PV_LOGO) img.src = window.PV_LOGO; };
      document.head.appendChild(s);
    }
  }
  const toggle = $("#navToggle");
  if (toggle) toggle.addEventListener("click", toggleNav);
  if (backdrop) backdrop.addEventListener("click", closeNav);
  $$("#primaryNav a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) closeNav();
  });
  const ftr = $("#ftr");
  if (ftr) {
    ftr.innerHTML = `<footer class="ftr"><div class="ftr-in">
      <div><h4>Start</h4><a href="new-to-finance.html">New To Finance</a></div>
      <div><h4>Markets today</h4><a href="ipo.html">IPOs</a><a href="gold-etf.html">Gold & ETF</a></div>
      <div><h4>Learn</h4><a href="mutual-funds.html">Mutual Funds</a><a href="equity.html">Equity</a></div>
    </div>
    <p class="ftr-legal">Educational only. Not investment advice. Not SEBI-registered. Investments carry risk and returns are not guaranteed.</p></footer>`;
  }
  fillMarketRibbon();
}
layout();

function fmtChg(chg, pct) {
  if (chg == null && pct == null) return "";
  const n = pct != null ? pct : chg;
  const cls = n >= 0 ? "up" : "dn";
  const sign = n >= 0 ? "+" : "";
  const parts = [];
  if (chg != null) parts.push(sign + Number(chg).toLocaleString("en-IN", { maximumFractionDigits: 2 }));
  if (pct != null) parts.push("(" + sign + Number(pct).toFixed(2) + "%)");
  return `<span class="${cls}">${parts.join(" ")}</span>`;
}

function isClosingToday(d) {
  const c = d.closes;
  if (c == null || c === "") return false;
  if (typeof c === "number") {
    const a = new Date(c), b = new Date();
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  const s = String(c).toLowerCase();
  const now = new Date();
  const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  return s.includes(String(now.getDate())) && s.includes(months[now.getMonth()]);
}

async function fillMarketRibbon() {
  const track = $("#mktTrack");
  if (!track) return;
  let mkt = null, ipo = null, gold = null;
  try { mkt = await getJSON("markets.json"); } catch (e) {}
  try { ipo = await getIPO(); } catch (e) {}
  try { gold = await getGold(); } catch (e) {}
  const items = [];
  if (ipo && ipo.rows) {
    const open = ipo.rows.filter(d => d.status === "open" && (d.gmpPct != null || d.gmp != null)).sort((a, c) => (c.gmpPct ?? -1e9) - (a.gmpPct ?? -1e9));
    if (open[0]) {
      const d = open[0];
      const gmp = d.gmp != null ? "₹" + Math.round(d.gmp) : "—";
      const pct = d.gmpPct != null ? d.gmpPct.toFixed(1) + "%" : "—";
      items.push(`<a class="mkt-item" href="ipo.html"><span class="lbl">Best open IPO</span><span class="val">${esc(d.name)}</span><span class="val">GMP ${gmp} (${pct})</span><span class="tag">Open</span></a>`);
    }
    const closing = ipo.rows.filter(d => d.status === "open" && isClosingToday(d));
    let pick = closing.sort((a, c) => (c.gmpPct ?? -1e9) - (a.gmpPct ?? -1e9))[0];
    if (!pick) pick = ipo.rows.filter(d => d.status === "open").sort((a, c) => {
      const ac = typeof a.closes === "number" ? a.closes : Number.MAX_SAFE_INTEGER;
      const cc = typeof c.closes === "number" ? c.closes : Number.MAX_SAFE_INTEGER;
      return ac - cc;
    })[0];
    if (pick) {
      const gmp = pick.gmp != null ? "₹" + Math.round(pick.gmp) : "—";
      const pct = pick.gmpPct != null ? pick.gmpPct.toFixed(1) + "%" : "—";
      const closes = pick.closes != null ? (typeof pick.closes === "number" ? fd(pick.closes) : String(pick.closes)) : "today";
      items.push(`<a class="mkt-item" href="ipo.html"><span class="lbl">Closing soon</span><span class="val">${esc(pick.name)}</span><span class="val">GMP ${gmp} (${pct})</span><span class="tag">Closes ${esc(closes)}</span></a>`);
    }
  }
  const n = mkt && mkt.nifty50;
  if (n && n.price != null) {
    items.push(`<a class="mkt-item" href="equity.html"><span class="lbl">Nifty 50</span><span class="val">${Number(n.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>${fmtChg(n.change, n.change_pct)}</a>`);
  } else {
    items.push(`<a class="mkt-item" href="equity.html"><span class="lbl">Nifty 50</span><span class="val">—</span></a>`);
  }
  if (gold && gold.j && gold.j.cities && gold.j.cities[0]) {
    const c = gold.j.cities[0];
    items.push(`<a class="mkt-item" href="gold-etf.html"><span class="lbl">Gold 24K</span><span class="val">${inr((c.k24 || 0) * 10)}/10g</span><span class="val">${esc(c.city)}</span></a>`);
  } else {
    items.push(`<a class="mkt-item" href="gold-etf.html"><span class="lbl">Gold 24K</span><span class="val">—</span></a>`);
  }
  if (!items.length) {
    track.innerHTML = `<span class="mkt-item"><span class="lbl">Markets</span><span class="val">Updating…</span></span>`;
    return;
  }
  track.innerHTML = items.join("") + items.join("");
}

const AGES = [["20–24", 75, 15, 10], ["25–29", 70, 20, 10], ["30–39", 60, 30, 10], ["40–49", 50, 40, 10], ["50+", 35, 50, 15]];
const MIXC = ["var(--c2)", "var(--blue)", "var(--c4)"];
const MIXN = ["Equity", "Debt", "Gold"];

function mixFor(ageIndex, riskShift) {
  const row = AGES[ageIndex] || AGES[1];
  let eq = Math.max(10, Math.min(90, row[1] + (+riskShift || 0)));
  const gold = row[3];
  return [eq, 100 - eq - gold, gold];
}

function drawMix(donutEl, legendEl, values) {
  if (!donutEl) return;
  const [e, d, g] = values;
  donutEl.style.background = `conic-gradient(${MIXC[0]} 0% ${e}%, ${MIXC[1]} ${e}% ${e + d}%, ${MIXC[2]} ${e + d}% 100%)`;
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

function dmo(offset) { return T + offset * DAY; }
const IPO_DEMO = [
  { name: "Demo Solar Ltd", sector: "Renewable Energy", seg: "main", band: "₹95–100", min: 14000, lot: 140, issue: 850, gmp: 22, gmpPct: 22, sub: 4.2, opens: dmo(-1), closes: dmo(2), listing: dmo(7), status: "open" }
];
const GOLD_DEMO = {
  updated_at: new Date().toISOString(), source: "demo", source_url: "#",
  cities: [{ city: "Mumbai", k24: 7470, k22: 6850 }, { city: "Delhi", k24: 7465, k22: 6845 }]
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
    if (mon != null) return new Date(new Date().getFullYear(), mon, +m[1]).getTime();
  }
  return null;
}

function ipoStatus(opens, closes) {
  const o = parseDate(opens), c = parseDate(closes);
  if (o != null && o > T) return "upcoming";
  if (c != null && c < T) return "closed";
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
        estListing: r.est_listing ?? r.estListing ?? null,
        sub: r.subscription_x ?? r.subscription ?? r.sub ?? null,
        subQib: r.sub_qib ?? r.subQib ?? null,
        subNii: r.sub_nii ?? r.subNii ?? null,
        subRetail: r.sub_retail ?? r.subRetail ?? null,
        subUpdated: r.sub_updated ?? r.subUpdated ?? null,
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
  } else if (Array.isArray(raw.rows)) push(raw.rows, null);
  else if (Array.isArray(raw)) push(raw, null);
  return rows.length ? rows : null;
}

async function getJSON(file) {
  try {
    const res = await fetch("data/" + file + "?v=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

async function getIPO() {
  const raw = await getJSON("ipo.json");
  const rows = normIPO(raw);
  if (rows && rows.length) {
    return { rows, live: true, updated: raw.updated_at || raw.updated, source: raw.source || "ipowatch.in", source_url: raw.source_url || raw.sourceUrl || "https://ipowatch.in/", file: "ipo.json" };
  }
  return { rows: IPO_DEMO, live: false, updated: new Date().toISOString(), source: "demo", source_url: "#", file: "ipo.json" };
}

async function getGold() {
  const raw = await getJSON("gold.json");
  if (raw && Array.isArray(raw.cities) && raw.cities.length) {
    const cities = raw.cities.map((c) => ({ city: c.city, k24: c.k24 ?? c.rate24k ?? 0, k22: c.k22 ?? c.rate22k ?? 0 }));
    return { j: { cities, updated_at: raw.updated_at || raw.updated, source: raw.source, source_url: raw.source_url || raw.sourceUrl }, live: true, updated: raw.updated_at || raw.updated, source: raw.source || "goodreturns.in", source_url: raw.source_url || raw.sourceUrl || "#", file: "gold.json" };
  }
  return { j: GOLD_DEMO, live: false, updated: GOLD_DEMO.updated_at, source: "demo", source_url: "#", file: "gold.json" };
}

function statusBar(el, result, retryFn) {
  if (!el) return;
  const live = result && result.live;
  const updated = result && (result.updated || (result.j && result.j.updated_at));
  const src = (result && result.source) || "—";
  const srcUrl = (result && result.source_url) || "#";
  let ageH = 0;
  if (updated) { const t = Date.parse(updated); if (!Number.isNaN(t)) ageH = (Date.now() - t) / 36e5; }
  const stale = live && ageH > 36;
  let html = "";
  if (!live) { el.className = "status warn"; html = `◐ Demo data shown. Add data/${result.file || "…"} from the update script to go live.`; }
  else if (stale) { el.className = "status warn"; html = `⚠ Data may be out of date · Updated ${fmtIST(updated)} · Source: <a href="${esc(srcUrl)}" target="_blank" rel="noopener">${esc(src)} ↗</a>`; }
  else { el.className = "status"; html = `● Live · Updated ${fmtIST(updated)} · Source: <a href="${esc(srcUrl)}" target="_blank" rel="noopener">${esc(src)} ↗</a>`; }
  if (typeof retryFn === "function") html += ` <button type="button" id="rf">↻ Refresh</button>`;
  el.innerHTML = html;
  const btn = $("#rf", el);
  if (btn && retryFn) btn.onclick = () => retryFn(true);
}

function fmtIST(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return String(iso);
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }) + " IST";
}
