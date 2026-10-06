import { FoodItem, NutritionValues } from './types';

export async function searchOpenFoodFacts(query: string, limit = 5): Promise<FoodItem[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NutriScanApp/1.0' } });
    
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products.map((product: any) => {
      const n = product.nutriments || {};
      const per_100g: NutritionValues = {
        calories: Number(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
        protein: Number(n.proteins_100g || n.proteins || 0),
        carbs: Number(n.carbohydrates_100g || n.carbohydrates || 0),
        fat: Number(n.fat_100g || n.fat || 0),
        fiber: Number(n.fiber_100g || n.fiber || 0),
        sugar: Number(n.sugars_100g || n.sugars || 0),
        sodium: Math.round(Number(n.sodium_100g || n.sodium || 0) * 1000), // convert g to mg if needed
        calcium: Math.round(Number(n.calcium_100g || 0) * 1000),
        iron: Math.round(Number(n.iron_100g || 0) * 1000),
        potassium: Math.round(Number(n.potassium_100g || 0) * 1000),
        vitamin_a: Number(n['vitamin-a_100g'] || 0),
        vitamin_c: Number(n['vitamin-c_100g'] || 0),
        vitamin_d: Number(n['vitamin-d_100g'] || 0),
        vitamin_b12: Number(n['vitamin-b12_100g'] || 0),
      };

      return {
        id: `off_${product.code || Math.random().toString(36).substring(7)}`,
        name: product.product_name || product.product_name_en || query,
        source: 'OpenFoodFacts',
        category: product.categories || 'Packaged Product',
        serving_unit: product.serving_size || 'g',
        serving_grams: 100,
        per_100g,
        brand: product.brands || undefined,
        barcode: product.code || undefined,
      } as FoodItem;
    });
  } catch (error) {
    console.error('Error fetching OpenFoodFacts:', error);
    return [];
  }
}

export async function lookupBarcodeOFF(barcode: string): Promise<FoodItem | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NutriScanApp/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const product = data.product;
    const n = product.nutriments || {};
    const per_100g: NutritionValues = {
      calories: Number(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
      protein: Number(n.proteins_100g || 0),
      carbs: Number(n.carbohydrates_100g || 0),
      fat: Number(n.fat_100g || 0),
      fiber: Number(n.fiber_100g || 0),
      sugar: Number(n.sugars_100g || 0),
      sodium: Math.round(Number(n.sodium_100g || 0) * 1000),
      calcium: Math.round(Number(n.calcium_100g || 0) * 1000),
      iron: Math.round(Number(n.iron_100g || 0) * 1000),
      potassium: Math.round(Number(n.potassium_100g || 0) * 1000),
    };

    return {
      id: `off_${product.code}`,
      name: product.product_name || product.product_name_en || 'Packaged Item',
      source: 'OpenFoodFacts',
      category: product.categories || 'Packaged Product',
      serving_unit: product.serving_size || 'g',
      serving_grams: 100,
      per_100g,
      brand: product.brands || undefined,
      barcode: product.code,
    };
  } catch (error) {
    console.error('Error looking up barcode:', error);
    return null;
  }
}
