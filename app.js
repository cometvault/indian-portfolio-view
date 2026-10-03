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
    .replace(/"/g, a + "quot;");
};

/* PLACEHOLDER - full content in next push */
console.log('app v19 partial');
