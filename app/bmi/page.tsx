"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  Flame, 
  Target, 
  Dumbbell, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Droplets,
  Apple
} from "lucide-react";
import { 
  calculateHealthTargets, 
  HealthInputs, 
  TargetResults, 
  BmiStandard 
} from "@/lib/health/bmi";

export default function BmiPage() {
  const [inputs, setInputs] = useState<HealthInputs>({
    age: 25,
    sex: "male",
    heightCm: 175,
    weightKg: 70,
    activityLevel: "moderate",
    goal: "maintain",
    bmiStandard: "asian_indian",
  });

  const [dietType, setDietType] = useState<string>("veg");
  const [cuisinePref, setCuisinePref] = useState<string>("Indian");
  const [mealsPerDay, setMealsPerDay] = useState<number>(4);
  const [allergies, setAllergies] = useState<string>("");

  const results: TargetResults = calculateHealthTargets(inputs);

  const handleInputChange = (field: keyof HealthInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile & targets for meal planner
  const handleProceedToMealPlan = () => {
    const profileData = {
      ...inputs,
      dietType,
      cuisinePref,
      mealsPerDay,
      allergies: allergies.split(",").map((s) => s.trim()).filter(Boolean),
      targets: results,
    };
    localStorage.setItem("nutriscan_user_profile", JSON.stringify(profileData));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Mifflin-St Jeor Engine + Asian-Indian Standards</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          BMI & Calorie Target Calculator
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Compute precise BMR, TDEE, macro ratios, and healthy weight ranges tailored to your goal.
        </p>
      </div>

      {results.warningMessage && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs sm:text-sm flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <span>{results.warningMessage}</span>
        </div>
      )}

      {/* Main Grid: Form Inputs vs Target Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Personal Stats */}
        <div className="lg:col-span-6 space-y-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>1. Your Body & Lifestyle Metrics</span>
          </h2>

          <div className="space-y-4">
            {/* Sex & Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sex</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleInputChange("sex", "male")}
                    className={`py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                      inputs.sex === "male"
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("sex", "female")}
                    className={`py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                      inputs.sex === "female"
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={inputs.age}
                  onChange={(e) => handleInputChange("age", Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-emerald-500 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Height & Weight Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Height</span>
                  <span className="text-emerald-400 font-bold">{inputs.heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={inputs.heightCm}
                  onChange={(e) => handleInputChange("heightCm", Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Weight</span>
                  <span className="text-emerald-400 font-bold">{inputs.weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="180"
                  value={inputs.weightKg}
                  onChange={(e) => handleInputChange("weightKg", Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Activity Level</label>
              <select
                value={inputs.activityLevel}
                onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
              >
                <option value="sedentary">Sedentary (Little or no exercise, desk job)</option>
                <option value="light">Lightly Active (1-3 days exercise/week)</option>
                <option value="moderate">Moderately Active (3-5 days exercise/week)</option>
                <option value="very_active">Very Active (6-7 days intense workout)</option>
                <option value="extra_active">Extra Active (Hard physical job or 2x training)</option>
              </select>
            </div>

            {/* Goal Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Goal</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "lose", label: "Fat Loss" },
                  { id: "maintain", label: "Maintain" },
                  { id: "gain", label: "Muscle Gain" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleInputChange("goal", g.id)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      inputs.goal === g.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Type & Preferences */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dietary Preferences</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Diet Type</label>
                  <select
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain (No onion/garlic/roots)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Meals Per Day</label>
                  <select
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs"
                  >
                    <option value={3}>3 Meals (B/L/D)</option>
                    <option value={4}>4 Meals (B/L/Snack/D)</option>
                    <option value={5}>5 Meals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Allergies / Dislikes</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. peanuts, dairy, mushrooms..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs placeholder-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Verified Target Cards */}
        <div className="lg:col-span-6 space-y-6">
          {/* BMI Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">BMI Metric</span>

              {/* Standard Toggle */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                <button
                  onClick={() => handleInputChange("bmiStandard", "asian_indian")}
                  className={`px-2 py-1 rounded-lg font-bold ${
                    inputs.bmiStandard === "asian_indian"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400"
                  }`}
                >
                  Asian-Indian
                </button>
                <button
                  onClick={() => handleInputChange("bmiStandard", "who")}
                  className={`px-2 py-1 rounded-lg font-bold ${
                    inputs.bmiStandard === "who"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400"
                  }`}
                >
                  WHO Standard
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                <span className="text-3xl sm:text-4xl font-black text-white">{results.bmiResult.bmi}</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-0.5">kg/m²</span>
              </div>

              <div className="space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                  Category: {results.bmiResult.category}
                </div>
                <p className="text-xs text-slate-400">
                  Healthy weight range for {inputs.heightCm} cm height is{" "}
                  <strong className="text-white">{results.bmiResult.healthyWeightMinKg} kg – {results.bmiResult.healthyWeightMaxKg} kg</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Calorie & Energy Targets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/50 space-y-1">
              <span className="text-xs font-bold uppercase text-slate-400 block">Basal Metabolic Rate (BMR)</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{results.bmr}</span>
                <span className="text-xs text-slate-400">kcal/day</span>
              </div>
              <p className="text-[11px] text-slate-500">Base calories at complete rest.</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-950/20 space-y-1">
              <span className="text-xs font-bold uppercase text-emerald-400 block">Daily Target Calories</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl sm:text-3xl font-black text-white">{results.targetCalories}</span>
                <span className="text-xs text-slate-400">kcal/day</span>
              </div>
              <p className="text-[11px] text-slate-400">TDEE: {results.tdee} kcal/day.</p>
            </div>
          </div>

          {/* Macro Distribution Cards */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Daily Macro Targets
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                <span className="text-xs font-bold uppercase text-emerald-400 block">Protein</span>
                <span className="text-2xl font-black text-white">{results.proteinGrams}g</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{results.proteinGrams * 4} kcal</span>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center">
                <span className="text-xs font-bold uppercase text-cyan-400 block">Carbs</span>
                <span className="text-2xl font-black text-white">{results.carbGrams}g</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{results.carbGrams * 4} kcal</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center">
                <span className="text-xs font-bold uppercase text-purple-400 block">Fat</span>
                <span className="text-2xl font-black text-white">{results.fatGrams}g</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{results.fatGrams * 9} kcal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <Apple className="w-5 h-5 text-emerald-400" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Daily Fiber</span>
                  <span className="font-bold text-white">{results.fiberGrams}g / day</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Hydration Target</span>
                  <span className="font-bold text-white">{results.waterLiters} Liters / day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Button to Meal Planner */}
          <Link
            href="/meal-plan"
            onClick={handleProceedToMealPlan}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <span>Save Profile & Generate Meal Plan</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
