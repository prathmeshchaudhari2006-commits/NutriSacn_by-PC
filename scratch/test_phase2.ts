import { matchFoodItem } from '../lib/nutrition/match';

async function testPhase2() {
  const queries = ['roti', 'paneer', 'apple', 'Maggi'];
  console.log('--- TESTING PHASE 2 NUTRITION DATA LAYER ---');

  for (const q of queries) {
    const matches = await matchFoodItem(q);
    if (matches.length > 0) {
      const top = matches[0];
      console.log(`\nQuery: "${q}" -> Matched: "${top.name}" (${top.source})`);
      console.log(`Per 100g -> Calories: ${top.per_100g.calories} kcal | Protein: ${top.per_100g.protein}g | Carbs: ${top.per_100g.carbs}g | Fat: ${top.per_100g.fat}g`);
    } else {
      console.error(`FAILED: No match found for "${q}"`);
    }
  }
}

testPhase2();
