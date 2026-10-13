// حيازة — دوال الحساب (بدون أي اعتماد على الصفحة، قابلة للاختبار)
(function (root) {
  "use strict";

  // ---------- كسور ----------
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
  function frac(n, d) { const g = gcd(n, d); return [n / g, d / g]; }
  function add(a, b) { return frac(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function sub(a, b) { return frac(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); }
  function mul(a, b) { return frac(a[0] * b[0], a[1] * b[1]); }

  const SON = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
  const DAU = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"];

  // الأنصبة في حالة وجود فرع وارث فيه ابن واحد على الأقل:
  // الزوجة ١/٨، الأم ١/٦، الأب ١/٦، والباقي للأبناء والبنات للذكر مثل حظ الأنثيين
  function heirShares(mix) {
    const sons = Math.min(10, Math.max(1, mix.sons | 0));
    const daughters = Math.min(10, Math.max(0, mix.daughters | 0));
    const out = [];
    let fixed = [0, 1];
    if (mix.wife) { out.push({ label: "الزوجة", kind: "wife", f: [1, 8] }); fixed = add(fixed, [1, 8]); }
    if (mix.mother) { out.push({ label: "الأم", kind: "mother", f: [1, 6] }); fixed = add(fixed, [1, 6]); }
    if (mix.father) { out.push({ label: "الأب", kind: "father", f: [1, 6] }); fixed = add(fixed, [1, 6]); }
    const rest = sub([1, 1], fixed);
    const units = 2 * sons + daughters;
    for (let i = 0; i < sons; i++) out.push({ label: "الابن " + SON[i], kind: "son", f: mul(rest, [2, units]) });
    for (let i = 0; i < daughters; i++) out.push({ label: "البنت " + DAU[i], kind: "daughter", f: mul(rest, [1, units]) });
    return out;
  }

  // توزيع مبلغ بالهللات بحيث يساوي المجموع المبلغ بالضبط
  function distribute(totalHalalas, shares) {
    let used = 0;
    const rows = shares.map(function (s) {
      const h = Math.floor((totalHalalas * s.f[0]) / s.f[1]);
      used += h;
      return Object.assign({}, s, { halalas: h });
    });
    let left = totalHalalas - used;
    let i = rows.findIndex(function (r) { return r.kind === "son"; });
    if (i < 0) i = 0;
    while (left > 0 && rows.length) { rows[i].halalas++; left--; i = (i + 1) % rows.length; }
    return rows;
  }

  // ---------- تجاور القطع ----------
  // قطعتان متجاورتان إذا تشاركتا ضلعاً (رأسين على الأقل)؛ التلامس عند ركن واحد لا يكفي
  function shapesAdjacent(a, b) {
    const eps = 1e-7;
    let shared = 0;
    a.forEach(function (p) {
      if (b.some(function (q) { return Math.abs(p[0] - q[0]) < eps && Math.abs(p[1] - q[1]) < eps; })) shared++;
    });
    return shared >= 2;
  }

  function isContiguous(ids, shapes) {
    if (ids.length < 2) return true;
    const seen = new Set([ids[0]]);
    const queue = [ids[0]];
    while (queue.length) {
      const cur = queue.shift();
      ids.forEach(function (o) {
        if (!seen.has(o) && shapesAdjacent(shapes[cur], shapes[o])) { seen.add(o); queue.push(o); }
      });
    }
    return seen.size === ids.length;
  }

  const api = { heirShares: heirShares, distribute: distribute, isContiguous: isContiguous };
  root.HIYAZAH_CALC = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
