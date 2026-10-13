// حيازة — منطق الواجهة
(function () {
  "use strict";
  const D = window.HIYAZAH, C = window.HIYAZAH_CALC;
  const hasL = typeof window.L !== "undefined";
  const hasTurf = typeof window.turf !== "undefined";

  // ---------- تنسيق ----------
  const nf0 = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const nf2 = new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const AR = "٠١٢٣٤٥٦٧٨٩";
  const ar = (s) => String(s).replace(/[0-9]/g, (d) => AR[d]);
  const m2 = (v) => nf0.format(Math.round(v)) + " م²";
  const ha = (v) => nf1.format(v / 10000) + " هكتار";
  const sar = (v) => nf0.format(Math.round(v)) + " ريال";
  const sar2 = (v) => nf2.format(v) + " ريال";
  const nfp = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });
  const pct = (r) => nfp.format(r * 100) + "٪";
  const rs = (v) => nf0.format(Math.round(v)) + " ر.س";
  const $ = (id) => document.getElementById(id);

  // ---------- بيانات ----------
  const byId = {};
  D.assets.forEach((a) => (byId[a.id] = a));
  const mergeIds = D.merge.rows.flat();
  const shapes = {};
  mergeIds.forEach((id) => (shapes[id] = byId[id].shape));
  const rentOf = (a) => a.area * D.rentPerM2[a.type];

  const state = {
    typeF: "الكل", reasonF: "الكل",
    selected: [], activated: {}, blockFormed: false,
    distId: mergeIds[0], mix: null, gross: 0
  };
  const isActive = (a) => !!state.activated[a.id];

  // ---------- جغرافيا ----------
  const LAT_M = 110800;
  const shapeOf = (a) => a.shape;
  function centerOf(a) {
    const p = shapeOf(a);
    return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
  }

  // الألوان تُقرأ من متغيرات CSS في index.html
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue("--" + name).trim();
  const COL = { idle: v("idle"), active: v("active"), sel: v("sand"), dim: v("dim"), line: v("map-line") };

  const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/";
  function thumbURL(a) {
    const c = centerOf(a), half = Math.max(Math.sqrt(a.area), 160);
    const dLat = half / LAT_M, dLon = (half * 16 / 9) / (111320 * Math.cos((c[0] * Math.PI) / 180));
    return ESRI + "export?bbox=" + [c[1] - dLon, c[0] - dLat, c[1] + dLon, c[0] + dLat].join(",") +
      "&bboxSR=4326&imageSR=3857&size=480,270&format=jpg&f=image";
  }

  function makeMap(el) {
    if (!hasL) {
      el.classList.add("map-fallback");
      el.innerHTML = '<p class="map-msg">تعذّر تحميل الخريطة. تأكد من الاتصال بالإنترنت ثم أعد تحميل الصفحة.</p>';
      return null;
    }
    const map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false });
    const t = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19, attribution: "Imagery © Esri"
    });
    t.on("tileerror", () => el.classList.add("tiles-off"));
    t.addTo(map);
    return map;
  }

  function tip(a) {
    return "<b>" + ar(a.id) + "</b> · " + a.type + " · " + (a.city || D.merge.city) +
      "<br>" + m2(a.area) + " · " + nf0.format(a.heirs) + " ورثة<br>معطل منذ " + ar(a.since) + " · " + a.reason;
  }

  // =====================================================
  //  ١ — لوحة الرصد
  // =====================================================
  const TYPES = ["الكل"].concat(D.types);
  const REASONS = ["الكل"].concat(D.reasons);
  const TAGC = { "أرض بيضاء": "t-land", "مبنى قديم": "t-old", "مستودع": "t-wh", "زراعي": "t-agr" };
  let dashMap = null, dashLayer = null;

  const matches = (a, t, r) => (t === "الكل" || a.type === t) && (r === "الكل" || a.reason === r);

  function chipRow(el, values, key) {
    el.innerHTML = "";
    values.forEach((v) => {
      const t = key === "typeF" ? v : state.typeF;
      const r = key === "reasonF" ? v : state.reasonF;
      const n = D.assets.filter((a) => matches(a, t, r) && !isActive(a)).length;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.setAttribute("aria-pressed", state[key] === v ? "true" : "false");
      b.innerHTML = v + '<span class="n">' + nf0.format(n) + "</span>";
      b.addEventListener("click", () => { state[key] = v; renderDashboard(); });
      el.appendChild(b);
    });
  }

  function renderDashboard() {
    chipRow($("fType"), TYPES, "typeF");
    chipRow($("fReason"), REASONS, "reasonF");

    const list = D.assets.filter((a) => matches(a, state.typeF, state.reasonF));
    const idle = list.filter((a) => !isActive(a));
    const act = D.assets.filter(isActive);
    const area = idle.reduce((s, a) => s + a.area, 0);

    $("kCount").textContent = nf0.format(idle.length);
    $("kArea").textContent = m2(area);
    $("kAreaHa").textContent = ha(area);
    $("kLost").textContent = sar(idle.reduce((s, a) => s + rentOf(a), 0));

    const note = $("activeNote");
    if (act.length) {
      note.hidden = false;
      note.textContent = "فُعّل عبر حيازة: " + nf0.format(act.length) + " أصول · " + sar(act.reduce((s, a) => s + rentOf(a), 0)) + " سنوياً";
    } else note.hidden = true;

    const rows = list.slice().sort((a, b) => (isActive(b) - isActive(a)) || a.id.localeCompare(b.id));
    $("assetCount").textContent = nf0.format(rows.length) + " أصول";
    $("assetCards").innerHTML = rows.length
      ? rows.map((a) => {
          const on = isActive(a);
          return '<article class="acard' + (on ? " on" : "") + '">' +
            '<div class="acard-media" style="background-image:url(\'' + thumbURL(a) + '\')"><span class="tag ' + TAGC[a.type] + '">' + a.type + "</span></div>" +
            '<div class="acard-body"><div class="acard-id">قطعة ' + ar(a.id) + " · " + (a.city || D.merge.city) + '</div><div class="acard-area">' + m2(a.area) + "</div>" +
            '<p class="acard-meta">' + nf0.format(a.heirs) + " ورثة · معطل منذ " + ar(a.since) + "<br>السبب: " + a.reason + "</p>" +
            '<div class="acard-status">' + (on ? "مفعّل عبر حيازة" : "معطل") + "</div></div></article>";
        }).join("")
      : '<div class="empty">لا توجد أصول مطابقة لهذا التصنيف</div>';

    if (dashMap) {
      dashLayer.clearLayers();
      D.assets.forEach((a) => {
        const on = matches(a, state.typeF, state.reasonF);
        const col = isActive(a) ? COL.active : COL.idle;
        const style = on
          ? { color: COL.line, weight: 1.5, fillColor: col, fillOpacity: isActive(a) ? 0.7 : 0.6 }
          : { color: COL.dim, weight: 1, opacity: 0.45, fillColor: COL.dim, fillOpacity: 0.12 };
        L.polygon(shapeOf(a), style).bindTooltip(tip(a), { direction: "top" }).addTo(dashLayer);
        // على مقياس المنطقة تبدو القطع نقاطاً، فنرسم علامة ظاهرة فوق كل أصل
        L.circleMarker(centerOf(a), {
          radius: a.type === "زراعي" ? 8 : 6,
          color: COL.line, weight: 1.5, opacity: on ? 1 : 0.4,
          fillColor: on ? col : COL.dim, fillOpacity: on ? 0.95 : 0.25
        }).bindTooltip(tip(a), { direction: "top" }).addTo(dashLayer);
      });
    }
  }

  // =====================================================
  //  ٢ — الدمج
  // =====================================================
  let mergeMap = null, blockLayer = null;
  const mergeLayers = {};

  function buildMergeMap() {
    mergeMap = makeMap($("mergeMap"));
    if (!mergeMap) return;
    mergeIds.forEach((id) => {
      const p = L.polygon(shapeOf(byId[id]), {}).addTo(mergeMap);
      p.on("click", () => toggle(id));
      p.bindTooltip(ar(id), { permanent: true, direction: "center", className: "plabel" });
      mergeLayers[id] = p;
    });
  }

  function toggle(id) {
    if (state.blockFormed) return;
    const i = state.selected.indexOf(id);
    if (i >= 0) state.selected.splice(i, 1);
    else state.selected.push(id);
    renderMerge();
  }

  function mergeStats() {
    const ids = state.selected;
    let area = 0, heirs = 0;
    ids.forEach((id) => { area += byId[id].area; heirs += byId[id].heirs; });
    const contiguous = C.isContiguous(ids, shapes);
    const viable = area >= D.viabilityMinM2;
    const income = area * D.rentPerM2[byId[mergeIds[0]].type];
    const brokerage = income * D.brokerageRate, mgmt = income * D.managementRate;
    return { ids, area, heirs, contiguous, viable, ok: viable && contiguous && ids.length > 0, income, brokerage, mgmt, firstYear: brokerage + mgmt };
  }

  function renderMerge() {
    const s = mergeStats();

    const list = $("parcelList");
    list.innerHTML = "";
    mergeIds.forEach((id) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pbtn" + (state.blockFormed && s.ids.includes(id) ? " formed" : "");
      b.setAttribute("aria-pressed", s.ids.includes(id) ? "true" : "false");
      b.disabled = state.blockFormed;
      b.innerHTML = "<b>قطعة " + ar(id) + "</b><span>" + m2(byId[id].area) + "</span>";
      b.addEventListener("click", () => toggle(id));
      list.appendChild(b);
    });

    $("mCount").textContent = nf0.format(s.ids.length);
    $("mHeirs").textContent = nf0.format(s.heirs);
    $("mArea").textContent = m2(s.area);
    $("mAreaHa").textContent = ha(s.area);

    const bar = $("mBar");
    bar.style.width = Math.min(100, (s.area / D.viabilityMinM2) * 100) + "%";
    bar.classList.toggle("ok", s.ok);
    $("mThreshold").textContent = m2(D.viabilityMinM2);

    let cls, txt;
    if (state.blockFormed) { cls = "ok"; txt = "تكوّنت الكتلة — جاهزة للطرح على مشغّل"; }
    else if (!s.ids.length) { cls = "neutral"; txt = "اختر القطع من الخريطة أو من القائمة"; }
    else if (!s.contiguous) { cls = "warn"; txt = "القطع المحددة غير متجاورة"; }
    else if (!s.viable) { cls = "bad"; txt = "دون حد الجدوى — ينقص " + m2(D.viabilityMinM2 - s.area); }
    else { cls = "ok"; txt = "كتلة قابلة للطرح"; }
    const st = $("mStatus");
    st.className = "status " + cls;
    st.textContent = txt;

    $("cBefore").textContent = rs(0) + " لقطعة معطلة";
    $("cAfter").textContent = s.ok ? rs(s.income) + " إيجار سنوي ككتلة" : "كتلة متصلة تتجاوز حد الجدوى";
    $("cAfter").classList.toggle("none", !s.ok);
    $("revenue").hidden = !s.ok;
    $("rContract").textContent = rs(s.income);
    $("rPhase1").textContent = rs(D.blockFeePhase1);
    $("rBrokerageLbl").textContent = "عمولة وساطة (" + pct(D.brokerageRate) + " من إيجار السنة الأولى)";
    $("rBrokerage").textContent = rs(s.brokerage);
    $("rMgmtLbl").textContent = "رسم إدارة أملاك (" + pct(D.managementRate) + " سنوياً، مقترح)";
    $("rMgmt").textContent = rs(s.mgmt);
    $("rFirst").textContent = rs(s.firstYear);
    $("rRecurring").textContent = rs(s.mgmt) + " سنوياً";

    $("mForm").hidden = !(s.ok && !state.blockFormed);
    $("mReset").hidden = !(state.blockFormed || s.ids.length);

    if (mergeMap) {
      mergeIds.forEach((id) => {
        const on = s.ids.includes(id), lyr = mergeLayers[id];
        if (state.blockFormed && on) lyr.setStyle({ color: COL.line, weight: 1.2, opacity: 0.9, dashArray: "5 6", fillColor: COL.active, fillOpacity: 0.55 });
        else if (on) lyr.setStyle({ color: COL.sel, weight: 3, opacity: 1, dashArray: null, fillColor: COL.sel, fillOpacity: 0.3 });
        else lyr.setStyle({ color: COL.line, weight: 1.5, opacity: 0.9, dashArray: null, fillColor: COL.idle, fillOpacity: 0.4 });
      });
    }
  }

  function formBlock() {
    const s = mergeStats();
    if (!s.ok) return;
    state.blockFormed = true;
    state.activated = {};
    s.ids.forEach((id) => (state.activated[id] = true));

    if (mergeMap && hasTurf) {
      try {
        const polys = s.ids.map((id) => {
          const ring = shapeOf(byId[id]).map((p) => [p[1], p[0]]);
          ring.push(ring[0]);
          return turf.polygon([ring]);
        });
        const u = polys.reduce((acc, p) => turf.union(acc, p));
        blockLayer = L.geoJSON(u, {
          style: { color: COL.line, weight: 4, fill: false },
          interactive: false
        }).addTo(mergeMap);
      } catch (e) { /* الحد الخارجي زخرفي فقط */ }
    }
    renderMerge();
    renderDashboard();
  }

  function resetMerge() {
    state.blockFormed = false;
    state.selected = [];
    state.activated = {};
    if (blockLayer && mergeMap) { mergeMap.removeLayer(blockLayer); blockLayer = null; }
    renderMerge();
    renderDashboard();
  }

  // =====================================================
  //  ٣ — توزيع العائد
  // =====================================================
  const KCOL = { wife: v("heir-wife"), mother: v("heir-mother"), father: v("heir-father"), son: v("heir-son"), daughter: v("heir-daughter") };

  function initDist() {
    const sel = $("dParcel");
    mergeIds.forEach((id) => {
      const o = document.createElement("option");
      o.value = id;
      o.textContent = "قطعة " + ar(id) + " — " + m2(byId[id].area);
      sel.appendChild(o);
    });
    sel.addEventListener("change", () => loadParcel(sel.value));
    ["dWife", "dMother", "dFather"].forEach((id) => $(id).addEventListener("change", readInputs));
    ["dSons", "dDaughters", "dGross"].forEach((id) => {
      $(id).addEventListener("input", readInputs);
      $(id).addEventListener("change", () => { readInputs(); writeInputs(); });
    });
    loadParcel(state.distId);
  }

  function loadParcel(id) {
    const a = byId[id];
    state.distId = id;
    state.mix = Object.assign({}, a.mix);
    state.gross = Math.round(rentOf(a));
    writeInputs();
    renderDist();
  }

  function writeInputs() {
    $("dParcel").value = state.distId;
    $("dWife").checked = !!state.mix.wife;
    $("dMother").checked = !!state.mix.mother;
    $("dFather").checked = !!state.mix.father;
    $("dSons").value = state.mix.sons;
    $("dDaughters").value = state.mix.daughters;
    $("dGross").value = state.gross;
  }

  const clamp = (v, lo, hi, dflt) => { const n = parseInt(v, 10); return isNaN(n) ? dflt : Math.min(hi, Math.max(lo, n)); };

  function readInputs() {
    state.mix = {
      wife: $("dWife").checked, mother: $("dMother").checked, father: $("dFather").checked,
      sons: clamp($("dSons").value, 1, 10, 1),
      daughters: clamp($("dDaughters").value, 0, 10, 0)
    };
    const g = parseFloat($("dGross").value);
    state.gross = isFinite(g) && g >= 0 ? g : 0;
    renderDist();
  }

  function renderDist() {
    const gross = state.gross;
    // السنة الأولى: عمولة الوساطة + رسوم الإدارة السنوية
    const fee = (Math.round(gross * D.brokerageRate * 100) + Math.round(gross * D.managementRate * 100)) / 100;
    const net = Math.round((gross - fee) * 100) / 100;
    $("dFeeLabel").textContent = "رسوم السنة الأولى (وساطة " + pct(D.brokerageRate) + " + إدارة " + pct(D.managementRate) + ")";
    $("dGrossOut").textContent = sar2(gross);
    $("dFee").textContent = "− " + sar2(fee);
    $("dNet").textContent = sar2(net);

    const rows = C.distribute(Math.round(net * 100), C.heirShares(state.mix));
    $("dHeirCount").textContent = nf0.format(rows.length) + " ورثة";

    const total = rows.reduce((s, r) => s + r.halalas, 0);
    $("dRows").innerHTML =
      rows.map((r) =>
        '<tr><td><i class="sw" style="background:' + KCOL[r.kind] + '"></i>' + r.label +
        '</td><td><span dir="ltr">' + ar(r.f[0] + "/" + r.f[1]) + "</span></td><td>" +
        nf2.format((r.f[0] / r.f[1]) * 100) + "٪</td><td>" + sar2(r.halalas / 100) + "</td></tr>"
      ).join("") +
      '<tr class="total"><td>المجموع</td><td><span dir="ltr">' + ar("1") + "</span></td><td>" + nf2.format(100) + "٪</td><td>" + sar2(total / 100) + "</td></tr>";

    $("dBar").innerHTML = rows.map((r) =>
      '<div class="seg" style="flex:' + r.f[0] / r.f[1] + ";background:" + KCOL[r.kind] + '" title="' + r.label + '"></div>'
    ).join("");
  }

  // =====================================================
  //  التبويبات
  // =====================================================
  const TABS = ["dashboard", "merge", "distribute"];
  const fitted = {};

  function showTab(name) {
    TABS.forEach((t) => {
      $("panel-" + t).hidden = t !== name;
      $("tab-" + t).setAttribute("aria-selected", t === name ? "true" : "false");
    });
    if (name === "dashboard" && dashMap) {
      dashMap.invalidateSize();
      if (!fitted.d) { dashMap.fitBounds(L.latLngBounds(D.assets.flatMap(shapeOf)).pad(0.08)); fitted.d = true; }
    }
    if (name === "merge" && mergeMap) {
      mergeMap.invalidateSize();
      if (!fitted.m) { mergeMap.fitBounds(L.latLngBounds(mergeIds.flatMap((id) => shapeOf(byId[id]))).pad(0.2)); fitted.m = true; }
    }
    if (location.hash.slice(1) !== name) history.replaceState(null, "", "#" + name);
  }

  // ---------- تشغيل ----------
  $("scopeTitle").textContent = D.scope.name;
  $("mergeCity").textContent = D.merge.city;
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
  dashMap = makeMap($("dashMap"));
  if (dashMap) dashLayer = L.layerGroup().addTo(dashMap);
  buildMergeMap();
  $("mForm").addEventListener("click", formBlock);
  $("mReset").addEventListener("click", resetMerge);
  initDist();
  renderDashboard();
  renderMerge();
  const h = location.hash.slice(1);
  showTab(TABS.includes(h) ? h : "dashboard");
})();
