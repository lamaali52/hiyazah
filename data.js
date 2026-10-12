// =====================================================================
//  حيازة — بيانات النموذج الأولي
//  كل الأرقام هنا افتراضية لأغراض العرض. عدّلها من هذا الملف فقط،
//  وكل الشاشات تتحدث تلقائياً.
// =====================================================================
window.HIYAZAH = {
  // النطاق المعروض في لوحة الرصد: منطقة القصيم كاملة
  scope: {
    name: "منطقة القصيم",
    region: "المملكة العربية السعودية",
    center: [26.2, 43.8]
  },

  // العائد السنوي المقدّر لكل متر مربع حسب نوع الأصل (ريال) — افتراض
  rentPerM2: {
    "زراعي": 0.3,
    "سكني": 8,
    "تجاري": 15
  },

  // الحد الأدنى لمساحة الكتلة الزراعية حتى تكون مجدية للمشغّل (م²) — افتراض
  viabilityMinM2: 400000,

  // نسبة حيازة من قيمة عقد التشغيل — افتراض
  feeRate: 0.08,

  // كتلة الدمج: ست قطع متجاورة في البدائع
  // صفّان من القطع المتلاصقة، وعرض كل قطعة يُحسب من مساحتها ÷ ارتفاع الصف
  merge: {
    city: "البدائع",
    origin: [26.3232, 43.7318],
    rowHeightM: 350,
    rows: [
      ["042", "043", "044"],
      ["045", "046", "047"]
    ]
  },

  // الأصول المعطلة في المنطقة (١٨ أصلاً)
  // mix = تركيبة الورثة الافتراضية لشاشة التوزيع
  // pos = موقع الأصل بالمتر من مركز المنطقة (dx شرقاً، dy شمالاً)
  assets: [
    // —— قطع كتلة الدمج (البدائع، زراعي) ——
    { id: "042", city: "البدائع", type: "زراعي", area: 124000, heirs: 6, since: 2019, reason: "ورثة",
      mix: { wife: true, mother: true, father: false, sons: 2, daughters: 2 } },
    { id: "043", city: "البدائع", type: "زراعي", area: 86000, heirs: 4, since: 2021, reason: "ورثة",
      mix: { wife: true, mother: false, father: false, sons: 2, daughters: 1 } },
    { id: "044", city: "البدائع", type: "زراعي", area: 152000, heirs: 9, since: 2017, reason: "ورثة",
      mix: { wife: true, mother: true, father: false, sons: 4, daughters: 3 } },
    { id: "045", city: "البدائع", type: "زراعي", area: 68000, heirs: 3, since: 2022, reason: "عدم اهتمام",
      mix: { wife: true, mother: false, father: false, sons: 1, daughters: 1 } },
    { id: "046", city: "البدائع", type: "زراعي", area: 115000, heirs: 7, since: 2020, reason: "ورثة",
      mix: { wife: true, mother: true, father: true, sons: 2, daughters: 2 } },
    { id: "047", city: "البدائع", type: "زراعي", area: 90000, heirs: 5, since: 2018, reason: "ورثة",
      mix: { wife: true, mother: false, father: false, sons: 2, daughters: 2 } },

    // —— أصول زراعية في بقية المنطقة ——
    { id: "031", city: "عيون الجواء", type: "زراعي", area: 142000, heirs: 8, since: 2015, reason: "مياه", pos: { dx: -9990, dy: -3325 } },
    { id: "033", city: "النبهانية", type: "زراعي", area: 96000, heirs: 5, since: 2016, reason: "مياه", pos: { dx: -69930, dy: -44320 } },
    { id: "035", city: "الأسياح", type: "زراعي", area: 178000, heirs: 11, since: 2014, reason: "مياه", pos: { dx: 49950, dy: 44320 } },
    { id: "038", city: "قصيباء", type: "زراعي", area: 74000, heirs: 4, since: 2018, reason: "مياه", pos: { dx: -9990, dy: 66480 } },
    { id: "051", city: "المذنب", type: "زراعي", area: 131000, heirs: 7, since: 2019, reason: "ورثة", pos: { dx: 41960, dy: -37700 } },

    // —— أصول سكنية ——
    { id: "112", city: "بريدة", type: "سكني", area: 3200, heirs: 9, since: 2016, reason: "ورثة", pos: { dx: 16980, dy: 14400 } },
    { id: "115", city: "عنيزة", type: "سكني", area: 2400, heirs: 6, since: 2020, reason: "ورثة", pos: { dx: 18980, dy: -12200 } },
    { id: "118", city: "بريدة", type: "سكني", area: 4800, heirs: 12, since: 2013, reason: "ورثة", pos: { dx: 14200, dy: 16900 } },
    { id: "121", city: "الرس", type: "سكني", area: 2900, heirs: 3, since: 2021, reason: "عدم اهتمام", pos: { dx: -29970, dy: -36600 } },

    // —— أصول تجارية ——
    { id: "205", city: "بريدة", type: "تجاري", area: 6500, heirs: 7, since: 2017, reason: "ورثة", pos: { dx: 19400, dy: 12100 } },
    { id: "208", city: "البكيرية", type: "تجاري", area: 4200, heirs: 5, since: 2019, reason: "ورثة", pos: { dx: -14985, dy: -6650 } },
    { id: "211", city: "الشماسية", type: "تجاري", area: 8100, heirs: 4, since: 2022, reason: "عدم اهتمام", pos: { dx: 0, dy: 41000 } }
  ]
};
