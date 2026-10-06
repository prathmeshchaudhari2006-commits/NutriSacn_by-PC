import { FoodItem, NutritionValues } from './types';

export async function searchUSDA(query: string, limit = 5): Promise<FoodItem[]> {
  const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
  
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(query)}&pageSize=${limit}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      console.warn(`USDA API response status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.foods || !Array.isArray(data.foods)) return [];

    return data.foods.map((food: any) => {
      const getNutrient = (nameOrId: string | number): number => {
        const found = food.foodNutrients?.find((n: any) => 
          (typeof nameOrId === 'string' && n.nutrientName?.toLowerCase().includes(nameOrId.toLowerCase())) ||
          n.nutrientId === nameOrId
        );
        return found ? Number(found.value) || 0 : 0;
      };

      const per_100g: NutritionValues = {
        calories: getNutrient('Energy') || getNutrient(1008) || 0,
        protein: getNutrient('Protein') || getNutrient(1003) || 0,
        carbs: getNutrient('Carbohydrate') || getNutrient(1005) || 0,
        fat: getNutrient('Total lipid') || getNutrient(1004) || 0,
        fiber: getNutrient('Fiber') || getNutrient(1079) || 0,
        sugar: getNutrient('Sugars') || getNutrient(2000) || 0,
        sodium: getNutrient('Sodium') || getNutrient(1093) || 0,
        calcium: getNutrient('Calcium') || getNutrient(1087) || 0,
        iron: getNutrient('Iron') || getNutrient(1089) || 0,
        potassium: getNutrient('Potassium') || getNutrient(1092) || 0,
        vitamin_a: getNutrient('Vitamin A') || 0,
        vitamin_c: getNutrient('Vitamin C') || 0,
        vitamin_d: getNutrient('Vitamin D') || 0,
        vitamin_b12: getNutrient('Vitamin B-12') || 0,
      };

      return {
        id: `usda_${food.fdcId}`,
        name: food.description,
        source: 'USDA',
        category: food.foodCategory || 'Generic Food',
        serving_unit: 'g',
        serving_grams: 100,
        per_100g,
        brand: food.brandOwner || food.brandName || undefined,
      } as FoodItem;
    });
  } catch (error) {
    console.error('Error fetching USDA foods:', error);
    return [];
  }
}
