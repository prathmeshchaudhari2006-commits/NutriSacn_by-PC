export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type BmiStandard = 'asian_indian' | 'who';

export interface HealthInputs {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  bmiStandard?: BmiStandard;
}

export interface BmiResult {
  bmi: number;
  category: string;
  standard: BmiStandard;
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
}

export interface TargetResults {
  bmiResult: BmiResult;
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  fiberGrams: number;
  waterLiters: number;
  warningMessage?: string;
}

// Activity Level Multipliers
const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// Calculate BMI & Category
export function calculateBmi(heightCm: number, weightKg: number, standard: BmiStandard = 'asian_indian'): BmiResult {
  if (heightCm <= 0 || weightKg <= 0) {
    throw new Error('Height and weight must be positive numbers');
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = '';
  let minBmiNormal = 18.5;
  let maxBmiNormal = 22.9;

  if (standard === 'asian_indian') {
    minBmiNormal = 18.5;
    maxBmiNormal = 22.9;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi <= 22.9) category = 'Normal';
    else if (bmi <= 24.9) category = 'Overweight';
    else category = 'Obese';
  } else {
    minBmiNormal = 18.5;
    maxBmiNormal = 24.9;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi <= 24.9) category = 'Normal';
    else if (bmi <= 29.9) category = 'Overweight';
    else category = 'Obese';
  }

  const healthyWeightMinKg = Number((minBmiNormal * heightM * heightM).toFixed(1));
  const healthyWeightMaxKg = Number((maxBmiNormal * heightM * heightM).toFixed(1));

  return {
    bmi,
    category,
    standard,
    healthyWeightMinKg,
    healthyWeightMaxKg,
  };
}

// Calculate BMR using Mifflin-St Jeor Formula
export function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be greater than zero');
  }

  if (sex === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

// Calculate TDEE
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  const factor = ACTIVITY_FACTORS[activityLevel] || 1.2;
  return Math.round(bmr * factor);
}

// Calculate Complete Macro & Calorie Targets
export function calculateHealthTargets(inputs: HealthInputs): TargetResults {
  const { age, sex, heightCm, weightKg, activityLevel, goal, bmiStandard = 'asian_indian' } = inputs;

  let warningMessage: string | undefined;

  // Unsafe input safety checks
  if (age < 18) {
    warningMessage = 'NutriScan targets are designed for adults (18+). Please consult a pediatrician or dietitian for youth growth guidance.';
  }

  const bmiResult = calculateBmi(heightCm, weightKg, bmiStandard);
  if (bmiResult.bmi < 16) {
    warningMessage = 'BMI is severely low (< 16). Please consult a medical professional for clinical nutritional support.';
  }

  const bmr = calculateBmr(sex, weightKg, heightCm, age);
  const tdee = calculateTdee(bmr, activityLevel);

  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories = Math.round(tdee * 0.82); // 18% deficit
    // Enforce safety floor
    const minCalories = sex === 'female' ? 1200 : 1500;
    if (targetCalories < minCalories) {
      targetCalories = minCalories;
      warningMessage = `Calorie target adjusted to safe minimum floor of ${minCalories} kcal/day.`;
    }
  } else if (goal === 'gain') {
    targetCalories = Math.round(tdee * 1.12); // 12% surplus
  }

  // Protein target calculation
  let proteinFactor = 1.4;
  if (goal === 'lose') proteinFactor = 1.6; // High protein preserves lean mass
  if (goal === 'gain') proteinFactor = 2.0;

  const proteinGrams = Math.round(weightKg * proteinFactor);
  const proteinCalories = proteinGrams * 4;

  // Fat target (25% of total calories)
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Remainder calories for carbs
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(remainingCalories / 4);

  // Fiber target: 14g per 1000 kcal (~28g default)
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  // Hydration target: ~35ml per kg body weight
  const waterLiters = Number(((weightKg * 35) / 1000).toFixed(1));

  return {
    bmiResult,
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    fatGrams,
    carbGrams,
    fiberGrams,
    waterLiters,
    warningMessage,
  };
}
