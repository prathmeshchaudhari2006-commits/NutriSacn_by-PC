export interface NutritionValues {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
  sugar?: number; // g
  sodium?: number; // mg
  calcium?: number; // mg
  iron?: number; // mg
  potassium?: number; // mg
  vitamin_a?: number; // mcg
  vitamin_c?: number; // mg
  vitamin_d?: number; // mcg
  vitamin_b12?: number; // mcg
}

export interface FoodItem {
  id: string;
  name: string;
  aliases?: string[];
  source: 'IFCT' | 'USDA' | 'OpenFoodFacts' | 'Custom';
  category?: string;
  serving_unit?: string;
  serving_grams?: number;
  per_100g: NutritionValues;
  brand?: string;
  barcode?: string;
  confidence?: number;
}

export interface CalculatedNutrition {
  foodItem: FoodItem;
  grams: number;
  totals: NutritionValues;
}

export interface MatchedSearchResult {
  item: FoodItem;
  score: number;
  source: string;
}
