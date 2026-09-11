# Meal Tracking UI Implementation Spec

## Overview
Refactor the TodayView and related meal tracking components to match the UI/UX design provided in the visual specifications. The implementation focuses on strict adherence to the design without adding new features.

## Target Design Elements

### 1. Daily Macro Summary Card ("GÜNLÜK TOPLAM / KALAN MAKROLAR")
- **Location:** Top of page
- **Content:** 5 metric blocks in a responsive grid (2 cols on mobile, 5 cols on desktop)
- **Metrics:**
  - Kalori (Blue: #E3F2FD / Dark: adjust for dark mode)
  - Protein (Red/Pink: #FCE4EC / Dark: adjust for dark mode)
  - Karbonhidrat (Green: #E8F5E9 / Dark: adjust for dark mode)
  - Yağ (Yellow/Cream: #FFFDE7 / Dark: adjust for dark mode)
  - Lif (Purple: #F3E5F5 / Dark: adjust for dark mode)
- **Format:** `Current / Target` (e.g., `1850 / 2200`)
- **Styling:** Each block has a soft pastel background with the metric label in smaller text and bold numeric value

### 2. Meal Cards Section
**Three meal containers in order:**
- İlk Öğün (First Meal)
- Ara Öğün (Snack/Mid-meal)
- Son Öğün (Last Meal)

**Each meal card structure:**
1. **Header Row:**
   - Meal title (İlk Öğün, etc.)
   - "Öğün Hazırla" action dropdown button (right-aligned)

2. **Action Slots:**
   - Two side-by-side dashed/bordered buttons:
     - "+ Yemek Seç" (Select Recipe)
     - "+ Ürün Seç" (Select Product/Item)

3. **Added Items List:**
   - Each item displays with left blue accent border (when in focused state)
   - Item title
   - Grammage/unit information
   - Preparation notes (if any)
   - Macro breakdown: `P: XXg K: XXg Y: XXg XXX kcal`

### 3. Search & Selection Modal/Sheet
**Two variations: "Ürün Seç / Ara" (Product) and "Tarif Seç / Ara" (Recipe)**

- **Search Input:** Clear placeholder with search icon
- **Optional: Recommendation Chips** (when macro context available)
  - Section heading: "KALAN MAKROYA GÖRE ÖNERİLENLER"
  - Selectable pill buttons (e.g., "Yüksek Proteinli Snack", "Düşük Karb Sebze Mix")
- **Item Cards in List:**
  - Title
  - Detailed description/grammage
  - Macro breakdown
  - Contextual tags (e.g., "YÜKSEK PROTEİN", "25 dk", "Kolay")

### 4. State Flow & Real-Time Updates
1. User clicks `+ Ürün Seç` or `+ Yemek Seç`
2. Modal/sheet opens with search interface
3. User searches and selects an item
4. Modal closes; item is appended to the meal container
5. Daily macro summary at top recalculates automatically

## Theme Implementation (Light & Dark Only)
- **Light Mode:**
  - Background: #F8F9FA
  - Cards: White
  - Text: Dark gray
  - Borders: Light gray
  
- **Dark Mode:**
  - Background: Dark gray/black
  - Cards: Dark surface
  - Text: Light gray
  - Borders: Darker gray
  - Macro badges: Adjust pastel colors for visibility

- **Preserved Macro Colors (adjust opacity/brightness for dark mode):**
  - Kalori: Blue
  - Protein: Red/Pink
  - Karbonhidrat: Green
  - Yağ: Yellow
  - Lif: Purple

## Components to Create/Refactor
1. **MacroSummaryCard** - Daily totals display (new)
2. **MealContainer** - Individual meal section (refactor from existing)
3. **MealItemCard** - Item within a meal (refactor from existing)
4. **FoodSearchModal** - Product/recipe selection (refactor from MealFoodPicker)
5. **FoodRecommendationChips** - Optional macro-based suggestions (new)
6. **MealTrackingView** - Main container replacing TodayView (refactor)

## Implementation Checklist
- [ ] Define CSS variables for 2-theme system (Light & Dark)
- [ ] Create MacroSummaryCard component
- [ ] Create MealContainer component with action slots
- [ ] Create MealItemCard component with left border accent
- [ ] Create FoodSearchModal with search and selection logic
- [ ] Refactor state management for meal item tracking
- [ ] Wire up real-time macro calculation
- [ ] Ensure responsive layout (mobile-first)
- [ ] Test theme switching (Light ↔ Dark)
- [ ] Verify all micro-interactions (hover, focus, active states)

## Notes
- Do NOT invent new UI elements or patterns
- Stick strictly to the provided design
- Preserve existing state management where possible
- Maintain backward compatibility with the nutrition backend
- Use CSS variables for theming consistency
- No additional themes beyond Light and Dark
