import { NextRequest, NextResponse } from 'next/server';
import { matchFoodItem, calculateNutrition } from '@/lib/nutrition/match';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const gramsParam = searchParams.get('grams');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const results = await matchFoodItem(query);
  
  if (gramsParam && results.length > 0) {
    const grams = parseFloat(gramsParam) || 100;
    const calculated = calculateNutrition(results[0], grams);
    return NextResponse.json({
      query,
      results,
      calculated,
    });
  }

  return NextResponse.json({
    query,
    results,
  });
}
