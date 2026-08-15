import { newStemmer } from "snowball-stemmers";

/**
 * Turkish grocery category taxonomy. Structure and slot names follow the
 * aisle layout used by Migros and CarrefourSA online, so the mapping feels
 * familiar to anyone who shops those stores.
 *
 * Matching pipeline for both keywords and user input:
 *   lowercase (tr) → split on whitespace → Snowball Turkish stem each word
 *
 * A keyword hits if its stemmed form appears in the stemmed query as a
 * substring, or if any word in the query shares a 4+ char prefix with the
 * keyword (needed because Snowball can leave stray consonants on some
 * inflections, e.g. "elması" → "elmas" while "elma" stays "elma").
 * Short keywords (<=3 chars) require whole-word matches to avoid noise.
 */

const snowball = newStemmer("turkish");

export type CategoryId =
  | "meyve-sebze"
  | "sut-kahvalti"
  | "et-tavuk-balik"
  | "sarkuteri"
  | "firin"
  | "temel-gida"
  | "kahvaltilik"
  | "atistirmalik"
  | "icecek"
  | "sicak-icecek"
  | "dondurulmus"
  | "hazir-gida"
  | "bebek"
  | "temizlik"
  | "kisisel-bakim"
  | "ev-mutfak"
  | "evcil-hayvan"
  | "diger";

export type CategoryDef = {
  id: CategoryId;
  label: string; // Turkish display name
  order: number; // stable sort order in the grouped view
  emoji: string; // quick visual scan aid in the grouped list and settings
};

export const CATEGORIES: CategoryDef[] = [
  { id: "meyve-sebze", label: "Meyve & Sebze", order: 1, emoji: "🥦" },
  { id: "sut-kahvalti", label: "Süt Ürünleri", order: 2, emoji: "🥛" },
  { id: "et-tavuk-balik", label: "Et, Tavuk & Balık", order: 3, emoji: "🍗" },
  { id: "sarkuteri", label: "Şarküteri", order: 4, emoji: "🥓" },
  { id: "firin", label: "Fırın & Pastane", order: 5, emoji: "🥖" },
  { id: "kahvaltilik", label: "Kahvaltılık", order: 6, emoji: "🍯" },
  { id: "temel-gida", label: "Temel Gıda", order: 7, emoji: "🌾" },
  { id: "hazir-gida", label: "Hazır & Konserve", order: 8, emoji: "🥫" },
  { id: "dondurulmus", label: "Dondurulmuş", order: 9, emoji: "❄️" },
  { id: "atistirmalik", label: "Atıştırmalık", order: 10, emoji: "🍿" },
  { id: "sicak-icecek", label: "Kahve & Çay", order: 11, emoji: "☕" },
  { id: "icecek", label: "İçecek", order: 12, emoji: "🥤" },
  { id: "bebek", label: "Bebek", order: 13, emoji: "🍼" },
  { id: "kisisel-bakim", label: "Kişisel Bakım", order: 14, emoji: "🧴" },
  { id: "temizlik", label: "Temizlik", order: 15, emoji: "🧽" },
  { id: "ev-mutfak", label: "Ev & Mutfak", order: 16, emoji: "🍽️" },
  { id: "evcil-hayvan", label: "Evcil Hayvan", order: 17, emoji: "🐾" },
  { id: "diger", label: "Diğer", order: 99, emoji: "🗂️" },
];

export const CATEGORY_BY_ID: Record<CategoryId, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, CategoryDef>;

export function categoryLabel(id: CategoryId | undefined): string {
  if (!id) return CATEGORY_BY_ID.diger.label;
  return CATEGORY_BY_ID[id]?.label ?? CATEGORY_BY_ID.diger.label;
}

function stemPhrase(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .split(/\s+/)
    .map((w) => (w ? snowball.stem(w) : ""))
    .filter(Boolean)
    .join(" ");
}

const KEYWORDS: Record<CategoryId, string[]> = {
  "meyve-sebze": [
    // sebze
    "domates", "cherry domates", "kokteyl domates", "salatalık", "biber",
    "sivri biber", "çarliston biber", "kapya biber", "dolmalık biber",
    "kırmızı biber", "yeşil biber", "sarı biber", "patlıcan", "kabak",
    "sakız kabağı", "bal kabağı", "havuç", "patates", "tatlı patates",
    "soğan", "kuru soğan", "taze soğan", "kırmızı soğan", "arpacık soğan",
    "sarımsak", "taze sarımsak", "maydanoz", "roka", "marul", "kıvırcık",
    "iceberg", "göbek marul", "lahana", "kırmızı lahana", "brüksel lahanası",
    "karnabahar", "brokoli", "ıspanak", "pazı", "semizotu", "nane", "kekik",
    "dereotu", "rezene", "pırasa", "kereviz", "turp", "bal kabağı",
    "bezelye", "fasulye", "taze fasulye", "ayşekadın", "çalı fasulye",
    "barbunya", "bakla", "mantar", "kültür mantarı", "istiridye mantarı",
    "kestane", "zencefil", "zerdeçal kök", "aloe vera", "yeşillik",
    "salatalıkgil", "enginar", "bamya", "biberiye", "fesleğen", "tere",
    // meyve
    "elma", "armut", "muz", "portakal", "mandalina", "greyfurt", "limon",
    "misket limon", "lime", "çilek", "kiraz", "vişne", "kayısı", "şeftali",
    "nektarin", "erik", "yeşil erik", "üzüm", "yaş üzüm", "karpuz", "kavun",
    "ananas", "kivi", "avokado", "nar", "hurma", "yaş hurma", "incir",
    "yaş incir", "dut", "yaban mersini", "böğürtlen", "ahududu", "papaya",
    "mango", "guava", "liçi", "pitaya", "ejder meyvesi",
    "meyve", "sebze",
  ],
  "sut-kahvalti": [
    "süt", "tam yağlı süt", "yarım yağlı süt", "yağsız süt", "laktozsuz süt",
    "çiğ süt", "keçi sütü", "koyun sütü", "uht süt", "yoğurt", "süzme yoğurt",
    "kaymaklı yoğurt", "meyveli yoğurt", "yoğurt içeceği", "probiyotik yoğurt",
    "kefir", "ayran", "tereyağı", "kaymak tereyağı", "peynir", "beyaz peynir",
    "kaşar", "eski kaşar", "taze kaşar", "tulum peynir", "otlu peynir",
    "çeçil", "örgü peynir", "hellim", "lor", "labne", "krem peynir",
    "cheddar", "mozzarella", "parmesan", "gouda", "brie", "kamember",
    "burrata", "ricotta", "feta", "krema", "süt kreması", "kaymak",
    "yulaf sütü", "badem sütü", "soya sütü", "hindistan cevizi sütü",
    "pirinç sütü", "yumurta", "organik yumurta", "beyaz yumurta",
    "kahverengi yumurta",
  ],
  "et-tavuk-balik": [
    // et
    "kırmızı et", "dana", "dana kıyma", "dana bonfile", "dana antrikot",
    "kuzu", "kuzu pirzola", "kuzu but", "kuzu kol", "biftek", "antrikot",
    "bonfile", "kontrfile", "kaburga", "kıyma", "karışık kıyma", "köfte",
    "hazır köfte", "cığ köfte hazır", "çiğ köfte", "kokoreç",
    // kanatlı
    "tavuk", "bütün tavuk", "tavuk göğsü", "tavuk but", "tavuk baget",
    "tavuk kanat", "tavuk şinitzel", "tavuk pirzola", "tavuk şiş",
    "hindi", "hindi fileto", "hindi göğsü",
    // deniz ürünleri
    "balık", "somon", "levrek", "çupra", "hamsi", "palamut", "lüfer",
    "istavrit", "sardalya", "uskumru", "kefal", "mezgit", "orkinos",
    "midye", "karides", "kalamar", "ahtapot", "istakoz", "yengeç",
    "deniz mahsul", "balık fileto",
  ],
  sarkuteri: [
    "salam", "hindi salam", "dana salam", "sosis", "kokteyl sosis",
    "sucuk", "kangal sucuk", "fermente sucuk", "dana sucuk", "pastırma",
    "kavurma", "jambon", "hindi jambon", "dana jambon", "füme et",
    "füme hindi", "füme somon", "füme", "bacon", "chorizo", "prosciutto",
    "salami",
  ],
  firin: [
    "ekmek", "tam buğday ekmek", "çavdar ekmek", "kepekli ekmek",
    "beyaz ekmek", "köy ekmek", "ekşi mayalı ekmek", "glutensiz ekmek",
    "tost ekmek", "kepek ekmek", "somun", "bazlama", "lavaş", "yufka",
    "sandviç ekmek", "hamburger ekmek", "sandviç ekmeği", "poğaça",
    "açma", "simit", "kruvasan", "kek", "pasta", "muffin", "cupcake",
    "kurabiye", "börek", "pide", "ramazan pidesi", "baklava", "kadayıf",
    "künefe", "revani", "şekerpare", "kalburabastı", "tulumba",
    "profiterol", "eclair", "donut", "waffle", "pankek",
  ],
  kahvaltilik: [
    "reçel", "çilek reçeli", "kayısı reçeli", "vişne reçeli",
    "portakal reçeli", "gül reçeli", "incir reçeli", "kızılcık reçeli",
    "marmelat", "bal", "çam balı", "kestane balı", "çiçek balı",
    "süzme bal", "pekmez", "üzüm pekmezi", "keçiboynuzu pekmezi",
    "harnup pekmezi", "dut pekmezi", "tahin", "tahin helva", "helva",
    "kaymak", "zeytin", "yeşil zeytin", "siyah zeytin", "salamura zeytin",
    "sele zeytin", "kalamata zeytin", "kahvaltılık", "kahvaltılık gevrek",
    "müsli", "granola", "corn flakes", "mısır gevreği", "yulaf ezmesi",
    "günaydın", "sürülebilir çikolata", "fıstık ezmesi",
    "badem ezmesi", "kaju ezmesi",
  ],
  "temel-gida": [
    // tahıllar
    "pirinç", "baldo pirinç", "osmancık pirinç", "jasmine pirinç",
    "basmati pirinç", "yasemin pirinç", "esmer pirinç", "bulgur",
    "kepekli bulgur", "köftelik bulgur", "pilavlık bulgur",
    "aşurelik buğday", "kuskus", "irmik", "makarna", "spagetti",
    "burgu makarna", "penne", "linguini", "fettuccine", "fusilli",
    "farfalle", "arpa şehriye", "tel şehriye", "erişte", "şehriye",
    "yulaf", "yulaf ezmesi", "yulaf kepeği", "buğday kepeği",
    "karabuğday", "kinoa", "quinoa", "amarant",
    // unlar
    "un", "buğday unu", "tam buğday unu", "mısır unu", "pirinç unu",
    "çavdar unu", "nohut unu", "badem unu", "hindistan cevizi unu",
    "glutensiz un", "nişasta", "mısır nişastası", "buğday nişastası",
    // şeker ve tatlandırıcı
    "şeker", "toz şeker", "esmer şeker", "pudra şekeri", "kesme şeker",
    "hindistan cevizi şekeri", "stevia", "tatlandırıcı", "akçaağaç şurubu",
    "agave şurubu", "glikoz şurubu", "melas",
    // baharat
    "tuz", "kaya tuzu", "deniz tuzu", "himalaya tuzu", "iyotlu tuz",
    "karabiber", "beyaz biber", "kırmızı biber", "pul biber", "isot",
    "kimyon", "tarçın", "yenibahar", "sumak", "safran", "zerdeçal",
    "köri", "zencefil toz", "hardal tohumu", "kişniş", "kişniş tohumu",
    "kakule", "karanfil", "muskat", "hindistan cevizi rendesi",
    "vanilya", "vanilya şekeri", "kabartma tozu", "karbonat", "limon tuzu",
    "maya", "kuru maya", "yaş maya", "instant maya",
    // sirke
    "sirke", "elma sirkesi", "üzüm sirkesi", "balzamik sirke",
    "beyaz şarap sirkesi",
    // salça ve konsantre
    "salça", "domates salçası", "biber salçası", "acı biber salçası",
    // yağlar
    "zeytinyağı", "sızma zeytinyağı", "erken hasat zeytinyağı",
    "riviera zeytinyağı", "ayçiçek yağı", "mısır yağı", "kanola yağı",
    "susam yağı", "hindistan cevizi yağı", "avokado yağı", "aspir yağı",
    "keten tohumu yağı", "sıvı yağ", "katı yağ", "margarin", "tereyağ",
    // bakliyat
    "nohut", "mercimek", "kırmızı mercimek", "yeşil mercimek",
    "sarı mercimek", "kahverengi mercimek", "kuru fasulye", "börülce",
    "barbunya kuru", "soya", "soya fasulyesi", "bulgur", "aşurelik buğday",
    // tohumlar ve süper gıdalar
    "tohum", "chia tohumu", "keten tohumu", "susam", "haşhaş tohumu",
    "ay çekirdeği", "kabak çekirdeği", "kenevir tohumu", "sarı tohum",
    "goji berry", "cranberry", "yaban mersini kurusu",
    "kakao", "kakao tozu", "kakao ezmesi",
    // baz maddeler
    "bulyon", "tavuk suyu", "et suyu", "sebze suyu", "hazır bulyon",
    "et suyu tablet", "mantar suyu",
  ],
  "hazir-gida": [
    "konserve", "ton balık", "ton", "sardalya konserve", "mısır konserve",
    "bezelye konserve", "fasulye konserve", "nohut konserve",
    "bamya konserve", "biberli sos", "mayonez", "ketçap", "hardal",
    "barbekü sos", "bbq sos", "soya sosu", "tabasco", "sriracha",
    "acı sos", "tatlı ekşi sos", "worcestershire", "balzamik krem",
    "çorba", "hazır çorba", "domates çorbası", "mercimek çorbası",
    "tavuk suyu çorba", "makarna sosu", "napoliten sos", "pesto",
    "pizza sosu", "hazır yemek", "hazır köfte", "hazır kebap",
    "yemeklik hazır", "kavanoz turşu", "turşu", "salatalık turşusu",
    "biber turşusu", "karışık turşu", "sarımsak turşusu",
  ],
  dondurulmus: [
    "dondurma", "dondurulmuş", "donuk", "donmuş", "hazır pizza",
    "donuk pizza", "patates kızartması", "donuk patates", "milföy",
    "yufka donuk", "börek donuk", "donuk sebze", "donuk meyve",
    "donuk balık", "donuk tavuk", "donuk köfte", "buz",
    "puff pastry",
  ],
  atistirmalik: [
    "çikolata", "sütlü çikolata", "bitter çikolata", "beyaz çikolata",
    "fındıklı çikolata", "bademli çikolata", "çikolata bar",
    "protein bar", "granola bar", "müsli bar", "gofret", "bisküvi",
    "sade bisküvi", "kremalı bisküvi", "sandviç bisküvi", "kek bar",
    "kraker", "tuzlu kraker", "kepekli kraker", "cips", "patates cipsi",
    "mısır cipsi", "tortilla cipsi", "sebze cips", "elma cips",
    "çerez", "leblebi", "sarı leblebi", "çıtır", "fındık", "iç fındık",
    "kavrulmuş fındık", "badem", "iç badem", "çiğ badem", "ceviz",
    "iç ceviz", "antep fıstığı", "iç fıstık", "yer fıstığı",
    "amerikan fıstığı", "kaju", "brezilya fıstığı", "makademya",
    "kuruyemiş", "kavrulmuş kuruyemiş", "karışık kuruyemiş",
    "şekerleme", "sakız", "jelibon", "lokum", "marşmelov",
    "kuru meyve", "kuru kayısı", "kuru incir", "kuru üzüm",
    "kuru kızılcık", "kuru mango", "kuru muz", "kuru elma",
    "popcorn", "patlamış mısır",
  ],
  "sicak-icecek": [
    "kahve", "türk kahvesi", "filtre kahve", "espresso", "çekirdek kahve",
    "öğütülmüş kahve", "granül kahve", "hazır kahve", "3ü1 arada",
    "nescafe", "cappuccino", "latte", "mocha", "americano",
    "çay", "siyah çay", "yeşil çay", "bitki çayı", "meyve çayı",
    "papatya", "rezene çayı", "adaçayı", "melisa", "ıhlamur",
    "kuşburnu çayı", "ada çayı", "yeşil çay", "beyaz çay", "matcha",
    "chai", "salep", "kakao", "sıcak çikolata", "kahve kreması",
    "kahve şurup",
  ],
  icecek: [
    "su", "içme suyu", "damacana", "maden suyu", "soda", "aromalı soda",
    "gazoz", "kola", "coca cola", "pepsi", "cola zero", "diyet kola",
    "fanta", "sprite", "seven up", "meyve suyu", "portakal suyu",
    "elma suyu", "vişne suyu", "şeftali suyu", "karışık meyve suyu",
    "nektar", "smoothie", "enerji içeceği", "red bull", "monster",
    "ice tea", "ledo", "buzlu çay", "protein içecek",
    "spor içeceği", "izotonik", "şarap", "kırmızı şarap", "beyaz şarap",
    "rose şarap", "bira", "efes", "tuborg", "rakı", "viski", "votka",
    "cin", "rom", "tekila", "likör",
  ],
  bebek: [
    "bebek", "bebek bezi", "prima", "molfix", "sleepy",
    "huggies", "pampers", "bebek maması", "devam maması", "bebek biberon",
    "biberon", "biberon fırçası", "emzik", "ıslak mendil", "bebek ıslak mendil",
    "bebek şampuanı", "bebek pudrası", "bebek yağı", "bebek losyonu",
    "bebek sabunu", "pişik kremi", "kavanoz maması", "bebek kavanoz",
    "bebek püresi", "bebek bisküvi",
  ],
  "kisisel-bakim": [
    "şampuan", "saç kremi", "saç maskesi", "saç spreyi", "saç boyası",
    "saç yağı", "saç serumu", "saç köpüğü", "saç jölesi", "wax",
    "sabun", "katı sabun", "sıvı sabun", "el sabunu", "duş jeli",
    "banyo köpüğü", "bubble bath", "el kremi", "yüz kremi", "gece kremi",
    "gündüz kremi", "nemlendirici", "yüz temizleyici", "yüz maskesi",
    "peeling", "tonik", "serum", "vücut losyonu", "vücut yağı",
    "vücut spreyi", "vücut şurubu", "güneş kremi", "aftersun",
    "tıraş", "tıraş köpüğü", "tıraş jeli", "tıraş sonrası", "aftershave",
    "jilet", "traş bıçağı", "epilasyon", "ağda", "diş fırçası",
    "elektrikli diş fırçası", "diş macunu", "beyazlatıcı diş",
    "gargara", "diş ipi", "ağız spreyi", "ped", "kağıt mendil",
    "hijyenik ped", "günlük ped", "tampon", "makyaj", "makyaj temizleyici",
    "ruj", "lip gloss", "dudak balmı", "maskara", "rimel", "eyeliner",
    "far", "allık", "fondöten", "pudra", "kapatıcı", "oje", "aseton",
    "parfüm", "eau de toilette", "eau de parfum", "deodorant",
    "roll on", "kolonya", "limon kolonyası",
  ],
  temizlik: [
    "çamaşır deterjanı", "çamaşır tozu", "sıvı deterjan", "çamaşır suyu",
    "yumuşatıcı", "koku giderici", "leke çıkarıcı", "bulaşık deterjanı",
    "bulaşık makinesi", "bulaşık makine tuzu", "tablet deterjan",
    "parlatıcı", "cam sili", "cam temizleyici", "yüzey temizleyici",
    "mutfak temizleyici", "banyo temizleyici", "wc", "wc temizleyici",
    "tuvalet kağıdı", "tuvalet fırçası", "tuvalet blok", "koku giderici",
    "hava spreyi", "oda spreyi", "kağıt havlu", "sanayi tipi havlu",
    "peçete kağıt", "çöp poşeti", "çöp torbası", "çöp kovası",
    "sünger", "çelik tel", "temizlik bezi", "mikrofiber bez",
    "yer temizleyici", "arap sabunu", "cif", "kireç çözücü",
    "pas çıkarıcı", "kalıp çözücü", "boru açıcı", "böcek ilacı",
    "sinek spreyi", "karınca ilacı", "haşere ilacı", "çamaşır suyu",
    "amonyak", "aseton temizlik",
  ],
  "ev-mutfak": [
    "streç film", "alüminyum folyo", "pişirme kağıdı", "yağlı kağıt",
    "fırın torbası", "kağıt bardak", "kağıt tabak", "peçete",
    "kibrit", "çakmak", "mum", "büyük mum", "tealight", "pil", "aa pil",
    "aaa pil", "kalem pil", "ampul", "led ampul", "buzdolabı poşeti",
    "kilitli poşet", "dondurucu poşeti", "vakum poşet", "bulaşık eldiveni",
    "tek kullanımlık eldiven", "önlük", "askı", "elbise askısı",
    "temizlik kovası", "faraş", "süpürge", "paspas", "sünger paspas",
    "havluluk", "havlu",
  ],
  "evcil-hayvan": [
    "kedi maması", "köpek maması", "kuru mama", "yaş mama", "kedi kumu",
    "silika kum", "kedi", "köpek", "kuş", "balık akvaryum", "mama",
    "balık yemi", "kuş yemi", "kemirgen yemi", "kaplumbağa yemi",
    "hamster yemi", "papağan yemi", "muhabbet kuşu yemi",
    "evcil hayvan şampuanı", "tasma", "kedi oyuncağı",
  ],
  diger: [],
};

/**
 * Broad "head-noun" fallback: if the specific keyword lookup misses, try
 * matching just the last word of the query against this map. Handles the long
 * tail of "[modifier] [head]" patterns like "chia tohumu", "hindistan cevizi
 * yağı", "papatya çayı", "brokoli çorbası" without listing every combination.
 * Order in the map wins on ties.
 */
// Order matters: earlier entries win. Prefer explicit forms first, then
// generic head nouns. "bez" / "mama" / "yağ" style short heads are handled
// via multi-word keywords (e.g. "bebek bezi", "kedi maması") rather than
// here, because bare "bez" or "maması" is too ambiguous to route reliably.
const HEAD_NOUNS: Array<[string, CategoryId]> = [
  // baby-specific
  ["biberonu", "bebek"],
  // pet
  ["yemi", "evcil-hayvan"],
  // seeds & superfoods
  ["tohumu", "temel-gida"],
  ["tohum", "temel-gida"],
  ["çekirdeği", "atistirmalik"],
  ["çekirdek", "atistirmalik"],
  // grains & pantry heads
  ["ekmeği", "firin"],
  ["ekmek", "firin"],
  ["böreği", "firin"],
  ["börek", "firin"],
  ["pidesi", "firin"],
  ["kek", "firin"],
  ["pastası", "firin"],
  ["kurabiyesi", "firin"],
  // grains/flours/legumes as heads
  ["unu", "temel-gida"],
  ["nişastası", "temel-gida"],
  ["pilavı", "temel-gida"],
  ["makarnası", "temel-gida"],
  ["makarna", "temel-gida"],
  ["mercimeği", "temel-gida"],
  ["mercimek", "temel-gida"],
  ["fasulyesi", "temel-gida"],
  ["fasulye", "temel-gida"],
  ["nohutu", "temel-gida"],
  ["nohut", "temel-gida"],
  ["bulguru", "temel-gida"],
  ["bulgur", "temel-gida"],
  ["pirinci", "temel-gida"],
  ["pirinç", "temel-gida"],
  ["yulafı", "temel-gida"],
  ["yulaf", "temel-gida"],
  ["irmiği", "temel-gida"],
  ["irmik", "temel-gida"],
  ["yağı", "temel-gida"],
  ["yağ", "temel-gida"],
  ["salçası", "temel-gida"],
  ["salça", "temel-gida"],
  ["sirkesi", "temel-gida"],
  ["sirke", "temel-gida"],
  ["baharatı", "temel-gida"],
  ["baharat", "temel-gida"],
  ["şekeri", "temel-gida"],
  ["tuzu", "temel-gida"],
  // dairy
  ["sütü", "sut-kahvalti"],
  ["yoğurdu", "sut-kahvalti"],
  ["yoğurt", "sut-kahvalti"],
  ["peyniri", "sut-kahvalti"],
  ["peynir", "sut-kahvalti"],
  ["yumurtası", "sut-kahvalti"],
  ["yumurta", "sut-kahvalti"],
  ["tereyağı", "sut-kahvalti"],
  ["kreması", "sut-kahvalti"],
  ["kefiri", "sut-kahvalti"],
  ["ayranı", "sut-kahvalti"],
  // meat & fish
  ["kıyması", "et-tavuk-balik"],
  ["kıyma", "et-tavuk-balik"],
  ["tavuğu", "et-tavuk-balik"],
  ["tavuk", "et-tavuk-balik"],
  ["balığı", "et-tavuk-balik"],
  ["balık", "et-tavuk-balik"],
  ["fileto", "et-tavuk-balik"],
  ["pirzolası", "et-tavuk-balik"],
  ["biftek", "et-tavuk-balik"],
  ["bonfile", "et-tavuk-balik"],
  // charcuterie
  ["sucuğu", "sarkuteri"],
  ["sucuk", "sarkuteri"],
  ["salamı", "sarkuteri"],
  ["salam", "sarkuteri"],
  ["sosisi", "sarkuteri"],
  ["sosis", "sarkuteri"],
  ["jambonu", "sarkuteri"],
  ["jambon", "sarkuteri"],
  ["pastırması", "sarkuteri"],
  ["pastırma", "sarkuteri"],
  // snacks
  ["kuruyemişi", "atistirmalik"],
  ["kuruyemiş", "atistirmalik"],
  ["çikolatası", "atistirmalik"],
  ["çikolata", "atistirmalik"],
  ["cipsi", "atistirmalik"],
  ["cips", "atistirmalik"],
  ["bisküvisi", "atistirmalik"],
  ["bisküvi", "atistirmalik"],
  ["krakeri", "atistirmalik"],
  ["kraker", "atistirmalik"],
  ["gofreti", "atistirmalik"],
  ["gofret", "atistirmalik"],
  ["barı", "atistirmalik"],
  ["kurabiyesi", "atistirmalik"],
  // hot drinks
  ["çayı", "sicak-icecek"],
  ["çay", "sicak-icecek"],
  ["kahvesi", "sicak-icecek"],
  ["kahve", "sicak-icecek"],
  ["kakaosu", "sicak-icecek"],
  ["kakao", "sicak-icecek"],
  // cold drinks / juices (heads that read as "drink")
  ["suyu", "icecek"],
  ["nektarı", "icecek"],
  ["içeceği", "icecek"],
  ["gazoz", "icecek"],
  ["kolası", "icecek"],
  ["kola", "icecek"],
  ["bira", "icecek"],
  ["şarabı", "icecek"],
  // ready-to-eat / condiments
  ["sosu", "hazir-gida"],
  ["sos", "hazir-gida"],
  ["çorbası", "hazir-gida"],
  ["çorba", "hazir-gida"],
  ["konservesi", "hazir-gida"],
  ["konserve", "hazir-gida"],
  ["turşusu", "hazir-gida"],
  ["turşu", "hazir-gida"],
  ["mayonezi", "hazir-gida"],
  ["mayonez", "hazir-gida"],
  ["ketçabı", "hazir-gida"],
  ["ketçap", "hazir-gida"],
  // breakfast
  ["reçeli", "kahvaltilik"],
  ["reçel", "kahvaltilik"],
  ["balı", "kahvaltilik"],
  ["pekmezi", "kahvaltilik"],
  ["pekmez", "kahvaltilik"],
  ["zeytini", "kahvaltilik"],
  ["zeytin", "kahvaltilik"],
  ["tahini", "kahvaltilik"],
  ["helvası", "kahvaltilik"],
  ["helva", "kahvaltilik"],
  // personal care
  ["şampuanı", "kisisel-bakim"],
  ["şampuan", "kisisel-bakim"],
  ["sabunu", "kisisel-bakim"],
  ["sabun", "kisisel-bakim"],
  ["kremi", "kisisel-bakim"],
  ["krem", "kisisel-bakim"],
  ["macunu", "kisisel-bakim"],
  ["deodorantı", "kisisel-bakim"],
  ["deodorant", "kisisel-bakim"],
  ["parfümü", "kisisel-bakim"],
  ["parfüm", "kisisel-bakim"],
  ["kolonyası", "kisisel-bakim"],
  ["kolonya", "kisisel-bakim"],
  ["losyonu", "kisisel-bakim"],
  ["mendili", "kisisel-bakim"],
  ["mendil", "kisisel-bakim"],
  // cleaning
  ["fırçası", "temizlik"],
  ["deterjanı", "temizlik"],
  ["deterjan", "temizlik"],
  ["temizleyicisi", "temizlik"],
  ["temizleyici", "temizlik"],
  ["kağıdı", "temizlik"],
  ["poşeti", "temizlik"],
  ["torbası", "temizlik"],
  ["süngeri", "temizlik"],
  ["sünger", "temizlik"],
  ["havlusu", "temizlik"],
  ["havlu", "temizlik"],
  ["yumuşatıcısı", "temizlik"],
];

type Rule = { keyword: string; category: CategoryId };
const RULES: Rule[] = (() => {
  const rules: Rule[] = [];
  for (const [id, words] of Object.entries(KEYWORDS) as [CategoryId, string[]][]) {
    for (const w of words) {
      const k = stemPhrase(w);
      if (!k) continue;
      // Short stems (like "kav" from "kavun" or "muz" from itself) used to be
      // dropped so Snowball noise like "donmuş"→"do" couldn't over-match. But
      // matches() below already refuses prefix tolerance when either side is
      // <4 chars, so a short stem can only fire on an exact-word match — which
      // is exactly what we want for one-syllable Turkish nouns.
      rules.push({ keyword: k, category: id });
    }
  }
  // Longest first so specific patterns win over generic ones.
  rules.sort((a, b) => b.keyword.length - a.keyword.length);
  return rules;
})();

/**
 * Match a stemmed keyword against a stemmed query, respecting word boundaries
 * so "biber" doesn't match "bibero" (Snowball's stem of "biberonu").
 * Prefix tolerance lets keyword "elma" match query word "elmas" when Snowball
 * over-stems a possessive suffix.
 */
function matches(query: string, keyword: string): boolean {
  if (keyword.includes(" ")) {
    // Multi-word keyword: require the whole phrase to appear as substring
    // with word boundaries. No word-level prefix tolerance across boundaries.
    const re = new RegExp(`(^|\\s)${escapeRegex(keyword)}(\\s|$)`);
    return re.test(query);
  }
  // Single-word keyword: compare against each query word with prefix tolerance.
  for (const qWord of query.split(" ")) {
    if (qWord === keyword) return true;
    if (qWord.length < 4 || keyword.length < 4) continue;
    if (qWord.startsWith(keyword) || keyword.startsWith(qWord)) return true;
  }
  return false;
}

// The head-noun table is matched against both the raw last word and its stem.
// Storing both variants lets us handle unstable Snowball stems (e.g. "suyu"
// stems to "su" which is too short, but the raw "suyu" still matches).
const HEAD_NOUN_RULES: Array<[string, string, CategoryId]> = HEAD_NOUNS.map(
  ([noun, cat]) => [noun.toLocaleLowerCase("tr-TR"), stemPhrase(noun), cat]
);

/**
 * The last content word in "karabuğday ekmeği" is "ekmek" — the head noun,
 * which dictates the category. Modifiers like "karabuğday" describe it.
 * Match head-noun first so specific compound items land under their head,
 * then fall back to whole-phrase matching for single-word items.
 */
export function categorize(itemName: string): CategoryId {
  const raw = itemName.toLocaleLowerCase("tr-TR").trim();
  const q = stemPhrase(itemName);
  if (!q) return "diger";

  const rawWords = raw.split(/\s+/).filter(Boolean);
  const rawLast = rawWords[rawWords.length - 1] ?? "";
  const stemmedWords = q.split(" ").filter(Boolean);
  const stemmedLast = stemmedWords[stemmedWords.length - 1] ?? "";

  // Pass 1: explicit multi-word keywords first. A curated phrase like
  // "diş fırçası" or "bebek bezi" always beats a generic head-noun rule.
  for (const rule of RULES) {
    if (rule.keyword.includes(" ") && matches(q, rule.keyword)) return rule.category;
  }

  // Pass 2: head-noun (last word) against the head-noun table. Handles
  // compound long-tail items like "chia tohumu", "papatya çayı".
  for (const [raw2, stem2, cat] of HEAD_NOUN_RULES) {
    if (matchesHead(rawLast, raw2)) return cat;
    if (stem2 && matchesHead(stemmedLast, stem2)) return cat;
  }

  // Pass 3: single-word keyword match against any word in the query.
  for (const rule of RULES) {
    if (!rule.keyword.includes(" ") && matches(q, rule.keyword)) return rule.category;
  }

  return "diger";
}

function matchesHead(word: string, key: string): boolean {
  if (!word || !key) return false;
  if (word === key) return true;
  // Suffix tolerance for possessive/case endings so raw "suyu" matches "su",
  // "temizleyicisi" matches "temizleyici", "ekmeği" matches "ekmek".
  if (word.length > key.length && word.startsWith(key)) {
    const rest = word.slice(key.length);
    if (/^(i|ı|u|ü|si|sı|su|sü|nin|nın|nun|nün|leri|ları|ini|ını|unu|ünü|de|da|ye|ya|le|la|n|m|s)?(?:i|ı|u|ü|si|sı|su|sü)?$/.test(rest)) {
      return true;
    }
  }
  // Sometimes the "k" softening in Turkish leaves "ekmeği" partially stemmed
  // to "ekmeğ" — accept a shared 4+ char prefix as a last resort.
  const shared = Math.min(word.length, key.length);
  if (shared >= 4 && (word.startsWith(key) || key.startsWith(word))) return true;
  return false;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
