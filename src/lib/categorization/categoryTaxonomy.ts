import {
  Baby,
  Beef,
  Bird,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Droplet,
  Droplets,
  Egg,
  Fish,
  FlaskConical,
  Home,
  Milk,
  Nut,
  PawPrint,
  Sandwich,
  Snowflake,
  Soup,
  SprayCan,
  Tag,
  Utensils,
  Wheat,
  type LucideIcon,
  Carrot,
} from "lucide-react";

// Just the taxonomy data (ids, labels, icons) — kept separate from
// categories.ts's matching engine (Snowball stemmer + keyword rules) so
// that code needing only labels/icons for display (category pickers,
// settings, the merged-category list) doesn't drag in categories.ts's
// ~330 kB Snowball stemmer dependency. See categorizeLazy.ts.

export type CategoryId =
  | "meyve-sebze"
  | "sut-urunleri"
  | "yumurta"
  | "kirmizi-et"
  | "kanatli"
  | "balik-deniz-urunleri"
  | "sarkuteri"
  | "firin"
  | "kahvaltilik"
  | "tahil-bakliyat"
  | "yag"
  | "baharat-cesni"
  | "hazir-gida"
  | "dondurulmus"
  | "kuruyemis-tohum"
  | "atistirmalik"
  | "icecek"
  | "sicak-icecek"
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
  icon: LucideIcon; // quick visual scan aid in the grouped list and settings
};

export const CATEGORIES: CategoryDef[] = [
  { id: "meyve-sebze", label: "Meyve & Sebze", order: 1, icon: Carrot },
  { id: "sut-urunleri", label: "Süt Ürünleri", order: 2, icon: Milk },
  { id: "yumurta", label: "Yumurta", order: 3, icon: Egg },
  { id: "kirmizi-et", label: "Kırmızı Et", order: 4, icon: Beef },
  { id: "kanatli", label: "Kanatlı", order: 5, icon: Bird },
  { id: "balik-deniz-urunleri", label: "Balık & Deniz Ürünleri", order: 6, icon: Fish },
  { id: "sarkuteri", label: "Şarküteri", order: 7, icon: Sandwich },
  { id: "firin", label: "Fırın & Pastane", order: 8, icon: Croissant },
  { id: "kahvaltilik", label: "Kahvaltılık", order: 9, icon: Utensils },
  { id: "tahil-bakliyat", label: "Tahıl & Bakliyat", order: 10, icon: Wheat },
  { id: "yag", label: "Yağ", order: 11, icon: Droplet },
  { id: "baharat-cesni", label: "Baharat & Çeşni", order: 12, icon: FlaskConical },
  { id: "hazir-gida", label: "Hazır & Konserve", order: 13, icon: Soup },
  { id: "dondurulmus", label: "Dondurulmuş", order: 14, icon: Snowflake },
  { id: "kuruyemis-tohum", label: "Kuruyemiş & Tohum", order: 15, icon: Nut },
  { id: "atistirmalik", label: "Atıştırmalık", order: 16, icon: Cookie },
  { id: "sicak-icecek", label: "Kahve & Çay", order: 17, icon: Coffee },
  { id: "icecek", label: "İçecek", order: 18, icon: CupSoda },
  { id: "bebek", label: "Bebek", order: 19, icon: Baby },
  { id: "kisisel-bakim", label: "Kişisel Bakım", order: 20, icon: Droplets },
  { id: "temizlik", label: "Temizlik", order: 21, icon: SprayCan },
  { id: "ev-mutfak", label: "Ev & Mutfak", order: 22, icon: Home },
  { id: "evcil-hayvan", label: "Evcil Hayvan", order: 23, icon: PawPrint },
  { id: "diger", label: "Diğer", order: 99, icon: Tag },
];

export const CATEGORY_BY_ID: Record<CategoryId, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, CategoryDef>;
