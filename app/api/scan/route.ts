import { NextRequest, NextResponse } from 'next/server';
import { GeminiProvider } from '@/lib/llm/gemini';
import { matchFoodItem, calculateNutrition } from '@/lib/nutrition/match';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image base64 string is required' }, { status: 400 });
    }

    const gemini = new GeminiProvider();
    const scanResult = await gemini.analyzeFoodImage(image);

    if (!scanResult.is_food || !scanResult.items || scanResult.items.length === 0) {
      return NextResponse.json({
        is_food: false,
        message: 'No food items detected in photo. Please retake photo or search manually.',
        detected_items: [],
      });
    }

    // Match each detected food item against verified database
    const matchedItems = await Promise.all(
      scanResult.items.map(async (detected) => {
        const matches = await matchFoodItem(detected.name);
        const topMatch = matches.length > 0 ? matches[0] : null;

        if (topMatch) {
          const calc = calculateNutrition(topMatch, detected.estimated_grams);
          return {
            detected_name: detected.name,
            estimated_grams: detected.estimated_grams,
            confidence: detected.confidence,
            cooking_method: detected.cooking_method,
            matched_item: topMatch,
            calculated_nutrition: calc.totals,
            alternative_matches: matches.slice(1, 4),
          };
        } else {
          // Custom / fallback fallback if no match found
          const fallbackItem = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: detected.name,
            source: 'Custom' as const,
            per_100g: { calories: 150, protein: 5, carbs: 20, fat: 5 },
          };
          const calc = calculateNutrition(fallbackItem, detected.estimated_grams);
          return {
            detected_name: detected.name,
            estimated_grams: detected.estimated_grams,
            confidence: detected.confidence,
            cooking_method: detected.cooking_method,
            matched_item: fallbackItem,
            calculated_nutrition: calc.totals,
            alternative_matches: [],
          };
        }
      })
    );

    // Compute dish grand totals
    const grandTotals = matchedItems.reduce(
      (acc, curr) => ({
        calories: acc.calories + (curr.calculated_nutrition.calories || 0),
        protein: Number((acc.protein + (curr.calculated_nutrition.protein || 0)).toFixed(1)),
        carbs: Number((acc.carbs + (curr.calculated_nutrition.carbs || 0)).toFixed(1)),
        fat: Number((acc.fat + (curr.calculated_nutrition.fat || 0)).toFixed(1)),
        fiber: Number((acc.fiber + (curr.calculated_nutrition.fiber || 0)).toFixed(1)),
        sodium: acc.sodium + (curr.calculated_nutrition.sodium || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
    );

    return NextResponse.json({
      is_food: true,
      dish_description: scanResult.dish_description,
      items: matchedItems,
      grand_totals: grandTotals,
    });
  } catch (error) {
    console.error('Error processing scan:', error);
    return NextResponse.json({ error: 'Internal server error processing scan' }, { status: 500 });
  }
}
