import { GeminiProvider } from '@/lib/llm/gemini';
import { matchFoodItem, calculateNutrition } from '@/lib/nutrition/match';
import { FoodItem, CalculatedNutrition } from '@/lib/nutrition/types';

export interface PlannedMealItem {
  name: string;
  grams: number;
  matched_item?: FoodItem;
  calculated_nutrition?: any;
}

export interface PlannedMeal {
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  title: string;
  items: PlannedMealItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface PlannedDay {
  day_number: number;
  day_name: string;
  meals: PlannedMeal[];
  day_totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  variance_percentage: number;
}

export interface MealPlanRequest {
  targetCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  dietType: string;
  cuisinePref: string;
  mealsPerDay: number;
  allergies?: string[];
}

export async function generateAndVerifyMealPlan(request: MealPlanRequest): Promise<PlannedDay[]> {
  const { targetCalories, dietType, cuisinePref, mealsPerDay, allergies = [] } = request;

  const gemini = new GeminiProvider();

  const prompt = `You are a expert nutritionist. Generate a 7-day meal plan.
Targets:
- Daily Target Calories: ${targetCalories} kcal (Breakfast ~25%, Lunch ~35%, Snack ~10%, Dinner ~30%)
- Diet Type: ${dietType} (STRICTLY adhere to this: if veg/vegan/jain, NEVER include meat/egg)
- Cuisine Preference: ${cuisinePref}
- Meals Per Day: ${mealsPerDay}
- Allergies / Avoid items: ${allergies.join(', ') || 'None'}

Return ONLY valid JSON matching this schema:
{
  "days": [
    {
      "day_number": 1,
      "day_name": "Day 1",
      "meals": [
        {
          "meal_type": "breakfast",
          "title": "Poha with Curd",
          "items": [
            { "name": "poha", "grams": 150 },
            { "name": "curd", "grams": 100 }
          ]
        }
      ]
    }
  ]
}`;

  let rawJson = '';
  try {
    rawJson = await gemini.generateMealPlan(prompt);
  } catch (err) {
    console.warn('Gemini API call failed or not configured. Generating DB-verified default meal plan fallback.');
  }

  // Fallback structural generator using local IFCT database if LLM is offline
  let days: any[] = [];
  const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      days = parsed.days || [];
    } catch (e) {
      console.warn('Failed to parse LLM meal plan JSON');
    }
  }

  if (days.length === 0) {
    days = createDefaultStructuredDays(dietType, targetCalories);
  }

  // BACKEND RE-CALCULATION & VALIDATION LOOP
  const verifiedDays: PlannedDay[] = [];

  for (let i = 0; i < 7; i++) {
    const rawDay = days[i % days.length];
    const dayName = `Day ${i + 1}`;

    const verifiedMeals: PlannedMeal[] = [];
    let dayCalSum = 0;
    let dayProtSum = 0;
    let dayCarbSum = 0;
    let dayFatSum = 0;

    for (const meal of rawDay.meals) {
      const verifiedItems: PlannedMealItem[] = [];
      let mealCal = 0;
      let mealProt = 0;
      let mealCarb = 0;
      let mealFat = 0;

      for (const item of meal.items) {
        // Enforce diet type safety in code
        if (dietType === 'veg' || dietType === 'vegan' || dietType === 'jain') {
          if (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('egg') || item.name.toLowerCase().includes('meat') || item.name.toLowerCase().includes('fish')) {
            item.name = 'paneer'; // swap non-veg item to paneer
          }
        }

        const matches = await matchFoodItem(item.name);
        const topMatch = matches.length > 0 ? matches[0] : null;

        if (topMatch) {
          const calc = calculateNutrition(topMatch, item.grams);
          verifiedItems.push({
            name: item.name,
            grams: item.grams,
            matched_item: topMatch,
            calculated_nutrition: calc.totals,
          });
          mealCal += calc.totals.calories;
          mealProt += calc.totals.protein;
          mealCarb += calc.totals.carbs;
          mealFat += calc.totals.fat;
        }
      }

      verifiedMeals.push({
        meal_type: meal.meal_type,
        title: meal.title,
        items: verifiedItems,
        total_calories: mealCal,
        total_protein: Number(mealProt.toFixed(1)),
        total_carbs: Number(mealCarb.toFixed(1)),
        total_fat: Number(mealFat.toFixed(1)),
      });

      dayCalSum += mealCal;
      dayProtSum += mealProt;
      dayCarbSum += mealCarb;
      dayFatSum += mealFat;
    }

    // Calorie Precision Adjustment Loop (Programmatic Portion Normalization)
    const ratio = dayCalSum > 0 ? targetCalories / dayCalSum : 1;
    let finalCal = 0;
    let finalProt = 0;
    let finalCarb = 0;
    let finalFat = 0;

    const adjustedMeals = verifiedMeals.map((meal) => {
      let mCal = 0;
      let mProt = 0;
      let mCarb = 0;
      let mFat = 0;

      const adjItems = meal.items.map((item) => {
        const newGrams = Math.round(item.grams * ratio);
        if (item.matched_item) {
          const calc = calculateNutrition(item.matched_item, newGrams);
          mCal += calc.totals.calories;
          mProt += calc.totals.protein;
          mCarb += calc.totals.carbs;
          mFat += calc.totals.fat;
          return {
            ...item,
            grams: newGrams,
            calculated_nutrition: calc.totals,
          };
        }
        return item;
      });

      finalCal += mCal;
      finalProt += mProt;
      finalCarb += mCarb;
      finalFat += mFat;

      return {
        ...meal,
        items: adjItems,
        total_calories: mCal,
        total_protein: Number(mProt.toFixed(1)),
        total_carbs: Number(mCarb.toFixed(1)),
        total_fat: Number(mFat.toFixed(1)),
      };
    });

    const variance = Number((((finalCal - targetCalories) / targetCalories) * 100).toFixed(1));

    verifiedDays.push({
      day_number: i + 1,
      day_name: dayName,
      meals: adjustedMeals,
      day_totals: {
        calories: finalCal,
        protein: Number(finalProt.toFixed(1)),
        carbs: Number(finalCarb.toFixed(1)),
        fat: Number(finalFat.toFixed(1)),
      },
      variance_percentage: Math.abs(variance),
    });
  }

  return verifiedDays;
}

function createDefaultStructuredDays(dietType: string, targetCalories: number) {
  const isNonVeg = dietType === 'non-veg';

  return [
    {
      day_number: 1,
      day_name: 'Day 1',
      meals: [
        { meal_type: 'breakfast', title: 'Poha & Curd', items: [{ name: 'poha', grams: 150 }, { name: 'curd', grams: 100 }] },
        { meal_type: 'lunch', title: 'Roti, Dal & Paneer', items: [{ name: 'roti', grams: 80 }, { name: 'dal tadka', grams: 150 }, { name: 'paneer butter masala', grams: 150 }] },
        { meal_type: 'snack', title: 'Fruit Bowl', items: [{ name: 'apple', grams: 150 }] },
        { meal_type: 'dinner', title: isNonVeg ? 'Chicken Curry & Rice' : 'Rajma Chawal', items: [{ name: isNonVeg ? 'chicken curry' : 'rajma masala', grams: 200 }, { name: 'steamed rice', grams: 150 }] },
      ],
    },
    {
      day_number: 2,
      day_name: 'Day 2',
      meals: [
        { meal_type: 'breakfast', title: 'Idli Sambar', items: [{ name: 'idli', grams: 120 }, { name: 'sambar', grams: 150 }] },
        { meal_type: 'lunch', title: 'Bhakri & Usal', items: [{ name: 'bhakri', grams: 60 }, { name: 'usal', grams: 180 }, { name: 'curd', grams: 100 }] },
        { meal_type: 'snack', title: 'Banana Snack', items: [{ name: 'banana', grams: 110 }] },
        { meal_type: 'dinner', title: 'Dal Makhani & Rice', items: [{ name: 'dal makhani', grams: 200 }, { name: 'steamed rice', grams: 150 }] },
      ],
    },
    {
      day_number: 3,
      day_name: 'Day 3',
      meals: [
        { meal_type: 'breakfast', title: 'Upma & Tea', items: [{ name: 'upma', grams: 150 }] },
        { meal_type: 'lunch', title: 'Chole & Roti', items: [{ name: 'chole', grams: 200 }, { name: 'roti', grams: 80 }] },
        { meal_type: 'snack', title: 'Raw Paneer Cubes', items: [{ name: 'paneer', grams: 80 }] },
        { meal_type: 'dinner', title: 'Aloo Gobi & Roti', items: [{ name: 'aloo gobi', grams: 150 }, { name: 'roti', grams: 80 }] },
      ],
    },
  ];
}
