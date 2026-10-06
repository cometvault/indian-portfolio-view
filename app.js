/* build: 2026-10-06T14:25 IST strict-ipo-status */
/* Easy Nivesh — shared app */
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
const fd = (d) => {
  if (d == null || d === "") return "—";
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(+x)) return String(d);
  return x.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

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
  if (btn) { btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Open menu"); }
}
function openNav() {
  document.body.classList.add("nav-open");
  const btn = $("#navToggle");
  if (btn) { btn.setAttribute("aria-expanded", "true"); btn.setAttribute("aria-label", "Close menu"); }
}
function toggleNav() {
  if (document.body.classList.contains("nav-open")) closeNav(); else openNav();
}

function layout() {
  const page = document.body.dataset.page || "";
  const hdr = $("#hdr");
  if (hdr) {
    hdr.innerHTML = `<header class="hdr"><div class="hdr-in">
        <a class="logo" href="index.html" aria-label="Easy Nivesh home">
          <img src="assets/logo.svg?v=20" width="36" height="36" alt="Easy Nivesh" class="logo-img" id="brandLogo" style="object-fit:contain;background:#000;display:block">
          <span class="logo-txt">Easy <span>Nivesh</span></span>
        </a>
        <button type="button" class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="primaryNav">
          <svg class="ico-open" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <svg class="ico-close" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div></header>
      <nav class="nav" id="primaryNav" aria-label="Primary">${NAV.map(n =>
        `<a href="${n.href}" class="${n.cta ? "start" : ""}" ${n.page === page ? 'aria-current="page"' : ""}>${n.label}</a>`
      ).join("")}</nav>
      <div class="mkt-ribbon" id="mktRibbon" role="region" aria-label="Live market ticker"><div class="mkt-track"></div></div>`;
  }
  const img = hdr && hdr.querySelector(".logo-img");
  if (img) {
    img.style.display = "block";
    img.onerror = function () {
      this.onerror = null;
      if (window.PV_LOGO) this.src = window.PV_LOGO;
      else this.src = "assets/logo.svg?v=20";
    };
    (function () {
      var s = document.createElement("script");
      s.src = "assets/logo-data.js?v=20";
      s.onload = function () { if (window.PV_LOGO && img) img.src = window.PV_LOGO; };
      document.head.appendChild(s);
    })();
  }
  const toggle = $("#navToggle");
  if (toggle) toggle.addEventListener("click", toggleNav);
  const backdrop = $(".nav-backdrop") || document.createElement("div");
  if (!backdrop.classList.contains("nav-backdrop")) {
    backdrop.className = "nav-backdrop";
    document.body.appendChild(backdrop);
  }
  backdrop.addEventListener("click", closeNav);
  $$("#primaryNav a").forEach(function (a) { a.addEventListener("click", closeNav); });

  const ftr = $("#ftr");
  if (ftr) {
    ftr.innerHTML = `<footer class="ftr"><div class="ftr-in">
      <div><h4>Start</h4><a href="new-to-finance.html">New To Finance</a></div>
      <div><h4>Markets today</h4><a href="ipo.html">IPOs</a><a href="gold-etf.html">Gold &amp; ETF</a></div>
      <div><h4>Learn</h4><a href="mutual-funds.html">Mutual Funds</a><a href="equity.html">Equity</a></div>
    </div>
    <p class="ftr-legal">Educational only. Not investment advice. Not SEBI-registered. Investments carry risk and returns are not guaranteed.</p></footer>`;
  }

  if (document.title && document.title.indexOf("Portfolio View India") >= 0) {
    document.title = document.title.split("Portfolio View India").join("Easy Nivesh");
  }
  fillMarketRibbon();
}

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

async function fillMarketRibbon() {
  const el = document.getElementById("mktRibbon") || document.querySelector(".mkt-ribbon");
  if (!el) return;
  let mkt = null, gold = null, ipo = null;
  try { mkt = await getJSON("markets.json"); } catch (e) {}
  try { gold = await getGold(); } catch (e) {}
  try { ipo = await getIPO(); } catch (e) {}
  const items = [];
  if (mkt && mkt.j) {
    const n = mkt.j.nifty50, b = mkt.j.bank_nifty;
    if (n && n.price != null) items.push(`<a class="mkt-item" href="equity.html"><b>NIFTY 50</b> ${Number(n.price).toLocaleString("en-IN")} ${fmtChg(n.change, n.change_pct)}</a>`);
    if (b && b.price != null) items.push(`<a class="mkt-item" href="equity.html"><b>BANK NIFTY</b> ${Number(b.price).toLocaleString("en-IN")} ${fmtChg(b.change, b.change_pct)}</a>`);
  }
  if (ipo && ipo.rows) {
    const open = ipo.rows.filter(r => r.status === "open").sort((a,b) => (b.gmpPct||0)-(a.gmpPct||0));
    const pick = open[0] || ipo.rows.filter(r => r.status === "upcoming")[0];
    if (pick) items.push(`<a class="mkt-item" href="ipo.html"><b>${esc(pick.name)}</b> GMP ${pick.gmp != null ? "₹"+pick.gmp : "—"} ${pick.gmpPct != null ? "(" + pick.gmpPct + "%)" : ""} · ${pick.status}</a>`);
    if (open[1]) items.push(`<a class="mkt-item" href="ipo.html"><b>${esc(open[1].name)}</b> GMP ${open[1].gmp != null ? "₹"+open[1].gmp : "—"} · ${open[1].status}</a>`);
  }
  if (gold && gold.j && gold.j.cities && gold.j.cities[0]) {
    const c = gold.j.cities[0];
    const rate = c.k24 || c.rate24k;
    items.push(`<a class="mkt-item" href="gold-etf.html"><b>GOLD 24K</b> ${rate != null ? "₹" + Number(rate).toLocaleString("en-IN") + "/g" : "—"} ${c.city || ""}</a>`);
  }
  items.push(`<a class="mkt-item" href="new-to-finance.html"><b>Easy Nivesh</b> Free guide to investing in India</a>`);
  if (!items.length) return;
  const track = items.join("") + items.join("");
  el.innerHTML = `<div class="mkt-track">${track}</div>`;
}

async function getJSON(file, demo) {
  try {
    const url = "data/" + file + "?t=" + Date.now() + "&r=" + Math.random().toString(36).slice(2, 8);
    const r = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" }
    });
    if (!r.ok) throw new Error("missing");
    const j = await r.json();
    return {
      live: true,
      j,
      file,
      source: j.source || "data",
      source_url: j.source_url || j.sourceUrl || "#",
      updated: j.updated_at || j.updated
    };
  } catch (e) {
    return { live: false, j: demo, file, source: "demo", source_url: "#" };
  }
}

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
  if (o != null || c != null) return "open";
  return null;
}

function normIPO(raw) {
  if (!raw) return null;
  const rows = [];
  const push = (arr, seg) => {
    (arr || []).forEach((r) => {
      let name = r.name || r.company || "—";
      name = String(name).replace(/\s+(Open|Closed|Upcoming|Listed)\s*$/i, "").trim();
      const opens = r.opens ?? r.open;
      const closes = r.closes ?? r.close;
      const rawSt = (r.status || "").toLowerCase().trim();
      const dateSt = ipoStatus(opens, closes);
      // Dates win when available (keeps Open/Upcoming/Closed accurate over time)
      let status = dateSt || (["open", "upcoming", "closed"].includes(rawSt) ? rawSt : "upcoming");
      if (!["open", "upcoming", "closed"].includes(status)) status = "upcoming";
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
        sub: r.sub ?? r.subscription ?? null,
        opens: parseDate(opens),
        closes: parseDate(closes),
        listing: parseDate(r.listing_date ?? r.listing),
        status,
        opensRaw: opens,
        closesRaw: closes
      });
    });
  };
  if (raw.mainboard || raw.sme) {
    push(raw.mainboard, "main");
    push(raw.sme, "sme");
  } else if (raw.open || raw.upcoming || raw.closed) {
    push(raw.open, null); push(raw.upcoming, null); push(raw.closed, null);
  } else if (raw.rows) push(raw.rows, null);
  else if (Array.isArray(raw)) push(raw, null);
  return rows.length ? rows : null;
}

const IPO_DEMO = [{ name: "Demo Solar Ltd", sector: "Renewable Energy", seg: "main", band: "₹95–100", min: 14000, lot: 140, issue: 850, gmp: 22, gmpPct: 22, sub: 4.2, opens: T - DAY, closes: T + 2 * DAY, listing: T + 7 * DAY, status: "open" }];
const GOLD_DEMO = { updated_at: null, cities: [{ city: "Mumbai", k24: 14918, k22: 13675 }, { city: "Delhi", k24: 14933, k22: 13690 }] };
const DEMO_IPO = { open: [], upcoming: [], updated_at: null };

function normCityRate(c) {
  let k24 = c.k24;
  let k22 = c.k22;
  if (k24 == null && c.rate24k != null) k24 = +c.rate24k > 50000 ? +c.rate24k / 10 : +c.rate24k;
  if (k22 == null && c.rate22k != null) k22 = +c.rate22k > 50000 ? +c.rate22k / 10 : +c.rate22k;
  return { city: c.city || "—", k24: k24 != null ? +k24 : 0, k22: k22 != null ? +k22 : 0, change24k: c.change24k ?? null };
}

async function getGold() {
  const res = await getJSON("gold.json", GOLD_DEMO);
  const citiesRaw = (res.j && res.j.cities) || GOLD_DEMO.cities;
  const cities = citiesRaw.map(normCityRate);
  return {
    live: res.live,
    j: { cities, updated_at: res.updated || (res.j && res.j.updated_at), source: res.source, source_url: res.source_url },
    file: "gold.json",
    source: res.source,
    source_url: res.source_url,
    updated: res.updated || (res.j && res.j.updated_at)
  };
}

async function getIpo() { return getIPO(); }

async function getIPO() {
  const res = await getJSON("ipo.json", DEMO_IPO);
  const rows = normIPO(res.j) || (res.live ? null : IPO_DEMO);
  if (rows && rows.length) {
    return { rows, live: res.live, updated: res.updated || (res.j && (res.j.updated_at || res.j.updated)), source: res.source || "ipowatch.in", source_url: res.source_url || "https://ipowatch.in/", file: "ipo.json", j: res.j };
  }
  return { rows: IPO_DEMO, live: false, updated: null, source: "demo", source_url: "#", file: "ipo.json", j: DEMO_IPO };
}

function fmtIST(updated) {
  if (!updated) return "—";
  const t = Date.parse(updated);
  if (Number.isNaN(t)) return String(updated);
  return new Date(t).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function setStatus(el, result, retryFn) {
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
  if (typeof retryFn === "function") html += ` <button type="button" id="rf">↻ Refresh</button>`;
  el.innerHTML = html;
  const btn = $("#rf", el);
  if (btn && retryFn) btn.onclick = () => retryFn(true);
}
function statusBar(el, result, retryFn) { return setStatus(el, result, retryFn); }

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

const AGES = [["20–24", 75, 15, 10], ["25–29", 70, 20, 10], ["30–39", 60, 30, 10], ["40–49", 50, 40, 15], ["50+", 35, 50, 15]];
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
    legendEl.innerHTML = MIXN.map((n, i) => `<div class="row"><span><span class="dot" style="background:${MIXC[i]}"></span>${n}</span><b class="num">${values[i]}%</b></div>`).join("");
  }
}

function enRefreshLiveData() {
  try { fillMarketRibbon(); } catch (e) {}
  try { if (typeof window.load === "function") window.load(); } catch (e) {}
}
window.addEventListener("pageshow", function (ev) {
  if (ev.persisted) enRefreshLiveData();
});
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    try { fillMarketRibbon(); } catch (e) {}
  }
});

document.addEventListener("DOMContentLoaded", function () {
  layout();
  var s = document.createElement("script");
  s.src = "disclaimer.js?v=1";
  s.async = false;
  document.body.appendChild(s);
});
