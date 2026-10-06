import { matchFoodItem, calculateNutrition } from '../lib/nutrition/match';

async function testPhase3() {
  const sampleFoods = [
    { query: 'roti', grams: 80 },
    { query: 'paneer', grams: 100 },
    { query: 'dal tadka', grams: 150 },
    { query: 'basmati rice', grams: 150 },
    { query: 'poha', grams: 150 },
    { query: 'idli', grams: 120 },
    { query: 'samosa', grams: 90 },
    { query: 'maggi', grams: 140 },
    { query: 'apple', grams: 150 },
    { query: 'chicken curry', grams: 200 }
  ];

  console.log('--- TESTING PHASE 3: 10 SAMPLE FOODS MATCHING & SERVING CONVERSION ---');

  for (const item of sampleFoods) {
    const matches = await matchFoodItem(item.query);
    if (matches.length === 0) {
      console.error(`FAILED: No match for ${item.query}`);
      continue;
    }
    const matched = matches[0];
    const calc = calculateNutrition(matched, item.grams);
    console.log(`\nQuery: "${item.query}" -> DB Match: "${matched.name}" (${matched.source})`);
    console.log(`Portion: ${item.grams}g -> Calories: ${calc.totals.calories} kcal | Protein: ${calc.totals.protein}g | Carbs: ${calc.totals.carbs}g | Fat: ${calc.totals.fat}g | Fiber: ${calc.totals.fiber ?? 0}g`);
  }
}

testPhase3();
