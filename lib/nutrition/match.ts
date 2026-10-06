import { FoodItem, NutritionValues, CalculatedNutrition } from './types';
import { searchIFCT } from './ifct';
import { searchUSDA } from './usda';
import { searchOpenFoodFacts } from './openfoodfacts';

// Transliterations & Adjective Normalizer
export function normalizeFoodQuery(raw: string): string {
  if (!raw) return '';
  let q = raw.toLowerCase().trim();

  // Remove common preparation adjectives
  const adjectives = [
    'roasted', 'fried', 'deep-fried', 'steamed', 'boiled', 'grilled', 'baked',
    'fresh', 'raw', 'cooked', 'home-style', 'homestyle', 'spicy', 'crispy',
    'hot', 'sweet', 'savory', 'salted', 'unsalted'
  ];

  for (const adj of adjectives) {
    const regex = new RegExp(`\\b${adj}\\b`, 'gi');
    q = q.replace(regex, '');
  }

  // Transliteration normalizations
  const replacements: Record<string, string> = {
    'phulka': 'roti',
    'fulka': 'roti',
    'chapatti': 'roti',
    'chapati': 'roti',
    'varan': 'dal',
    'bhat': 'rice',
    'chawal': 'rice',
    'kela': 'banana',
    'seb': 'apple',
    'dahi': 'curd',
    'pohe': 'poha',
    'idly': 'idli',
    'dosai': 'dosa',
  };

  for (const [key, val] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    q = q.replace(regex, val);
  }

  return q.replace(/\s+/g, ' ').trim();
}

export async function matchFoodItem(rawQuery: string): Promise<FoodItem[]> {
  const query = rawQuery.trim();
  const normalized = normalizeFoodQuery(query);

  // 1. Search IFCT (Local NIN Indian Tables)
  const ifctResults = searchIFCT(query, 5);
  const normalizedIfctResults = searchIFCT(normalized, 5);
  
  // Combine unique IFCT results
  const ifctMap = new Map<string, FoodItem>();
  [...ifctResults, ...normalizedIfctResults].forEach(item => ifctMap.set(item.id, item));
  const combinedIfct = Array.from(ifctMap.values());

  if (combinedIfct.length > 0) {
    return combinedIfct;
  }

  // 2. Search USDA
  const usdaResults = await searchUSDA(normalized || query, 5);
  if (usdaResults.length > 0) {
    return usdaResults;
  }

  // 3. Search Open Food Facts
  const offResults = await searchOpenFoodFacts(normalized || query, 5);
  return offResults;
}

export function calculateNutrition(foodItem: FoodItem, grams: number): CalculatedNutrition {
  const factor = Math.max(0, grams) / 100;
  const p = foodItem.per_100g;

  const totals: NutritionValues = {
    calories: Math.round(p.calories * factor),
    protein: Number((p.protein * factor).toFixed(1)),
    carbs: Number((p.carbs * factor).toFixed(1)),
    fat: Number((p.fat * factor).toFixed(1)),
    fiber: p.fiber !== undefined ? Number((p.fiber * factor).toFixed(1)) : undefined,
    sugar: p.sugar !== undefined ? Number((p.sugar * factor).toFixed(1)) : undefined,
    sodium: p.sodium !== undefined ? Math.round(p.sodium * factor) : undefined,
    calcium: p.calcium !== undefined ? Math.round(p.calcium * factor) : undefined,
    iron: p.iron !== undefined ? Number((p.iron * factor).toFixed(1)) : undefined,
    potassium: p.potassium !== undefined ? Math.round(p.potassium * factor) : undefined,
    vitamin_a: p.vitamin_a !== undefined ? Math.round(p.vitamin_a * factor) : undefined,
    vitamin_c: p.vitamin_c !== undefined ? Number((p.vitamin_c * factor).toFixed(1)) : undefined,
    vitamin_d: p.vitamin_d !== undefined ? Number((p.vitamin_d * factor).toFixed(1)) : undefined,
    vitamin_b12: p.vitamin_b12 !== undefined ? Number((p.vitamin_b12 * factor).toFixed(1)) : undefined,
  };

  return {
    foodItem,
    grams,
    totals,
  };
}
