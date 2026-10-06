import { NextRequest, NextResponse } from 'next/server';
import { generateAndVerifyMealPlan, MealPlanRequest } from '@/lib/mealplan/generator';

export async function POST(req: NextRequest) {
  try {
    const body: MealPlanRequest = await req.json();

    if (!body.targetCalories || body.targetCalories <= 0) {
      return NextResponse.json({ error: 'Valid targetCalories is required' }, { status: 400 });
    }

    const verifiedPlan = await generateAndVerifyMealPlan(body);

    return NextResponse.json({
      success: true,
      targetCalories: body.targetCalories,
      plan: verifiedPlan,
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return NextResponse.json({ error: 'Failed to generate verified meal plan' }, { status: 500 });
  }
}
