// User-facing safety copy for the nutrition targets, in one place so every
// screen says the same thing. Owner decision 2026-10-28, MVP-1 PROVISIONAL —
// REVISIT AFTER QA-1 (worth a dietitian's read before a public launch).

// DEC-012: populations outside the app's safe automated scope.
export const SCOPE_QUESTION =
  "18 yaşın altındayım, hamileyim, emziriyorum ya da yeme bozukluğu tedavisi görüyorum.";

export const OUT_OF_SCOPE_MESSAGE =
  "Bu durumda otomatik kalori ve makro hedefi göstermiyoruz. Hedeflerini bir diyetisyen ya da hekimle belirle. Liste, yemek planı ve tarifler kullanılmaya devam eder.";

// DEC-013: the app collects no symptoms, so it can only name the red flags.
export const RED_FLAG_NOTE =
  "Baş dönmesi, bayılma, adetin kesilmesi, hızlı ya da istemsiz kilo kaybı veya yemekle ilgili yoğun kaygı yaşıyorsan bir hekime ya da diyetisyene başvur.";

// DEC-020: there is no weight-trend loop yet, so say the target is a start.
export const TARGET_ESTIMATE_NOTE =
  "Bu hedefler bir başlangıç tahmini. 2-3 hafta boyunca kilonu izle; beklediğin yönde değişmiyorsa hedefi ayarla.";
