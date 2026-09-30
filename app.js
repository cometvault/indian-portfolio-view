/* Portfolio View India — shared app */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&")
  .replace(/</g, "<")
  .replace(/>/g, ">")
  .replace(/"/g, """)
  .replace(/'/g, "&#39;");

const DAY = 864e5;
const T = Date.now();
const inr = (n, d = 0) => n == null || n === "" ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: d });
const fd = (v) => {
  if (v == null || v === "" || v === "—") return "—";
  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  return String(v);
};

const NAV = [
  { href: "index.html", label: "Overview", page: "home" },
  { href: "new-to-finance.html", label: "New To Finance", page: "n2f", cta: true },
  { href: "ipo.html", label: "IPOs", page: "ipo" },
  { href: "gold-etf.html", label: "Gold & ETF", page: "gold" },
  { href: "mutual-funds.html", label: "Mutual Funds", page: "mf" },
  { href: "equity.html", label: "Equity", page: "eq" },
];

const MARK = `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect width="34" height="34" rx="10" fill="url(#bm)"/><path d="M10 18c2-4 4-6 7-6s5 2 7 6" stroke="#04140d" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="12" r="2.2" fill="#04140d"/><defs><linearGradient id="bm" x1="0" y1="0" x2="34" y2="34"><stop stop-color="#00F0DC"/><stop offset=".45" stop-color="#3DF5A0"/><stop offset=".75" stop-color="#9BFF5A"/><stop offset="1" stop-color="#DFFF66"/></linearGradient></defs></svg>`;

const LOGO_SRC = "data:image/png;base64,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";
