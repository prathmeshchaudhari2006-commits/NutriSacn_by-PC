import { calculateBmi, calculateBmr, calculateTdee, calculateHealthTargets } from '../lib/health/bmi';

function runUnitTests() {
  console.log('--- RUNNING PHASE 4 HEALTH CALCULATOR UNIT TESTS ---');

  // Test Case 1: Known prompt example
  // 70 kg, 175 cm male, age 25
  const bmiRes1 = calculateBmi(175, 70, 'asian_indian');
  const bmr1 = calculateBmr('male', 70, 175, 25);
  const tdee1 = calculateTdee(bmr1, 'sedentary');
  const targets1 = calculateHealthTargets({
    age: 25,
    sex: 'male',
    heightCm: 175,
    weightKg: 70,
    activityLevel: 'sedentary',
    goal: 'maintain',
    bmiStandard: 'asian_indian'
  });

  console.log(`Test Case 1 (70kg, 175cm, Male, Age 25):`);
  console.log(`- Expected BMI: 22.9 | Actual BMI: ${bmiRes1.bmi} (Category: ${bmiRes1.category})`);
  console.log(`- Expected BMR: 1674 kcal | Actual BMR: ${bmr1} kcal`);
  console.log(`- Actual TDEE: ${tdee1} kcal`);
  console.log(`- Macro targets -> P: ${targets1.proteinGrams}g, F: ${targets1.fatGrams}g, C: ${targets1.carbGrams}g`);

  if (bmiRes1.bmi === 22.9 && bmr1 === 1674) {
    console.log('✅ TEST CASE 1 PASSED!');
  } else {
    console.error('❌ TEST CASE 1 FAILED!');
  }

  // Test Case 2: 60 kg, 160 cm female, age 30, moderate activity, weight loss
  const bmiRes2 = calculateBmi(160, 60, 'asian_indian');
  const bmr2 = calculateBmr('female', 60, 160, 30);
  const targets2 = calculateHealthTargets({
    age: 30,
    sex: 'female',
    heightCm: 160,
    weightKg: 60,
    activityLevel: 'moderate',
    goal: 'lose',
    bmiStandard: 'asian_indian'
  });

  console.log(`\nTest Case 2 (60kg, 160cm, Female, Age 30):`);
  console.log(`- BMI: ${bmiRes2.bmi} (${bmiRes2.category})`);
  console.log(`- BMR: ${bmr2} kcal | TDEE: ${targets2.tdee} kcal | Target Deficit Calories: ${targets2.targetCalories} kcal`);

  if (bmiRes2.bmi === 23.4 && bmr2 === 1289) {
    console.log('✅ TEST CASE 2 PASSED!');
  } else {
    console.error('❌ TEST CASE 2 FAILED!');
  }
}

runUnitTests();
