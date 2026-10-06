import { generateAndVerifyMealPlan } from '../lib/mealplan/generator';

async function testPhase6() {
  console.log('--- TESTING PHASE 6: MEAL PLAN VERIFICATION & TARGET ACCURACY ---');

  const testConfigs = [
    { targetCalories: 1800, proteinGrams: 90, carbGrams: 220, fatGrams: 50, dietType: 'veg', cuisinePref: 'Indian', mealsPerDay: 4 },
    { targetCalories: 2000, proteinGrams: 100, carbGrams: 250, fatGrams: 55, dietType: 'non-veg', cuisinePref: 'Indian', mealsPerDay: 4 },
    { targetCalories: 2200, proteinGrams: 110, carbGrams: 280, fatGrams: 60, dietType: 'vegan', cuisinePref: 'Indian', mealsPerDay: 4 },
  ];

  for (const config of testConfigs) {
    console.log(`\nTesting Config -> Target: ${config.targetCalories} kcal | Diet: ${config.dietType}`);
    const days = await generateAndVerifyMealPlan(config);

    let allWithin10Percent = true;

    days.forEach((day) => {
      const diff = Math.abs(day.day_totals.calories - config.targetCalories);
      const percentDiff = (diff / config.targetCalories) * 100;

      console.log(`  - ${day.day_name}: Total = ${day.day_totals.calories} kcal (Target: ${config.targetCalories} kcal) | Diff = ${percentDiff.toFixed(1)}%`);

      if (percentDiff > 10) {
        allWithin10Percent = false;
        console.error(`  ❌ ERROR: ${day.day_name} missed target by > 10%`);
      }
    });

    if (allWithin10Percent) {
      console.log(`✅ PASSED: All 7 days are within ±10% of target ${config.targetCalories} kcal for ${config.dietType}!`);
    } else {
      console.error(`❌ FAILED for target ${config.targetCalories} kcal`);
    }
  }
}

testPhase6();
