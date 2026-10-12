// =====================================================================
//  حيازة — بيانات النموذج الأولي
//  كل الأرقام هنا افتراضية لأغراض العرض. عدّلها من هذا الملف فقط،
//  وكل الشاشات تتحدث تلقائياً.
// =====================================================================
window.HIYAZAH = {
  // النطاق المعروض في لوحة الرصد
  // لنقل الخريطة إلى منطقة مزارع أخرى: غيّر center و merge.origin بنفس المقدار
  scope: {
    name: "نطاق عنيزة",
    region: "القصيم",
    center: [26.07, 43.96]
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

  // تخطيط القطع الست في شاشة الدمج: صفّان من القطع المتلاصقة
  // عرض كل قطعة يُحسب من مساحتها ÷ ارتفاع الصف
  // origin = الركن الشمالي الغربي للكتلة، فوق بساتين النخيل القديمة المتجزئة جنوب غرب عنيزة
  merge: {
    city: "عنيزة",
    origin: [26.0527, 43.9531],
    rowHeightM: 350,
    rows: [
      ["042", "043", "044"],
      ["045", "046", "047"]
    ]
  },

  // الأصول المعطلة في النطاق (١٨ أصلاً)
  // mix = تركيبة الورثة الافتراضية لشاشة التوزيع
  // pos = موقع الأصل بالمتر من مركز النطاق (dx شرقاً، dy شمالاً)
  assets: [
    // —— قطع شاشة الدمج (زراعي) ——
    { id: "042", type: "زراعي", area: 124000, heirs: 6, since: 2019, reason: "ورثة",
      mix: { wife: true, mother: true, father: false, sons: 2, daughters: 2 } },
    { id: "043", type: "زراعي", area: 86000, heirs: 4, since: 2021, reason: "ورثة",
      mix: { wife: true, mother: false, father: false, sons: 2, daughters: 1 } },
    { id: "044", type: "زراعي", area: 152000, heirs: 9, since: 2017, reason: "ورثة",
      mix: { wife: true, mother: true, father: false, sons: 4, daughters: 3 } },
    { id: "045", type: "زراعي", area: 68000, heirs: 3, since: 2022, reason: "عدم اهتمام",
      mix: { wife: true, mother: false, father: false, sons: 1, daughters: 1 } },
    { id: "046", type: "زراعي", area: 115000, heirs: 7, since: 2020, reason: "ورثة",
      mix: { wife: true, mother: true, father: true, sons: 2, daughters: 2 } },
    { id: "047", type: "زراعي", area: 90000, heirs: 5, since: 2018, reason: "ورثة",
      mix: { wife: true, mother: false, father: false, sons: 2, daughters: 2 } },

    // —— أصول زراعية أخرى ——
    { id: "031", type: "زراعي", area: 142000, heirs: 8, since: 2015, reason: "مياه", pos: { dx: -3100, dy: 1400 } },
    { id: "033", type: "زراعي", area: 96000, heirs: 5, since: 2016, reason: "مياه", pos: { dx: -4000, dy: 1070 } },
    { id: "035", type: "زراعي", area: 178000, heirs: 11, since: 2014, reason: "مياه", pos: { dx: -1100, dy: 765 } },
    { id: "038", type: "زراعي", area: 74000, heirs: 4, since: 2018, reason: "مياه", pos: { dx: 1460, dy: -875 } },
    { id: "051", type: "زراعي", area: 131000, heirs: 7, since: 2019, reason: "ورثة", pos: { dx: -1550, dy: -1420 } },

    // —— أصول سكنية ——
    { id: "112", type: "سكني", area: 3200, heirs: 9, since: 2016, reason: "ورثة", pos: { dx: 1090, dy: 400 } },
    { id: "115", type: "سكني", area: 2400, heirs: 6, since: 2020, reason: "ورثة", pos: { dx: 1640, dy: 120 } },
    { id: "118", type: "سكني", area: 4800, heirs: 12, since: 2013, reason: "ورثة", pos: { dx: 540, dy: 850 } },
    { id: "121", type: "سكني", area: 2900, heirs: 3, since: 2021, reason: "عدم اهتمام", pos: { dx: 2370, dy: -1610 } },

    // —— أصول تجارية ——
    { id: "205", type: "تجاري", area: 6500, heirs: 7, since: 2017, reason: "ورثة", pos: { dx: 2140, dy: 400 } },
    { id: "208", type: "تجاري", area: 4200, heirs: 5, since: 2019, reason: "ورثة", pos: { dx: -90, dy: 1850 } },
    { id: "211", type: "تجاري", area: 8100, heirs: 4, since: 2022, reason: "عدم اهتمام", pos: { dx: 3740, dy: -420 } }
  ]
};
