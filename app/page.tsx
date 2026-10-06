import Link from "next/link";
import { 
  Camera, 
  Search, 
  Calculator, 
  UtensilsCrossed, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  Flame, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-10 lg:p-12 border border-emerald-500/20 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-emerald-950/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Golden Rule: Verified DB Numbers, Zero Hallucinations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Scan Your Meal. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Get Verified Nutrition.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            NutriScan combines AI vision with verified nutrition databases (IFCT 2017, USDA, Open Food Facts). 
            AI identifies the food and portion; authoritative databases compute exact calories, macros, and vitamins.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/scan"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Scan Food Photo</span>
            </Link>

            <Link
              href="/search"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/60 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Search className="w-5 h-5 text-emerald-400" />
              <span>Search Database</span>
            </Link>

            <Link
              href="/bmi"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700/60 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Calculator className="w-5 h-5 text-teal-400" />
              <span>Calculate BMI & Targets</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Extreme Precision & Ease
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Everything you need to track calories, hit macro goals, and plan meals backed by real data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <Link
            href="/scan"
            className="group relative p-6 rounded-2xl glass-panel border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              AI Vision Scan
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
              Snap a dish photo. Gemini Vision detects item names & portion size; exact DB values compute calories.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-400 space-x-1">
              <span>Try Camera Scan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/search"
            className="group relative p-6 rounded-2xl glass-panel border-slate-800 hover:border-teal-500/50 hover:bg-slate-900/80 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">
              IFCT & USDA Database
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
              Search Indian foods (roti, dal, paneer) and global branded items with macros & % Daily Values.
            </p>
            <div className="flex items-center text-xs font-semibold text-teal-400 space-x-1">
              <span>Search Foods</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            href="/bmi"
            className="group relative p-6 rounded-2xl glass-panel border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              BMI & Target Calculator
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
              Mifflin-St Jeor BMR & TDEE engine with Asian-Indian standard cutoffs and macro targets.
            </p>
            <div className="flex items-center text-xs font-semibold text-cyan-400 space-x-1">
              <span>Calculate Targets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4 */}
          <Link
            href="/meal-plan"
            className="group relative p-6 rounded-2xl glass-panel border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              AI Meal Planner
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
              Generate 7-day meal plans verified against DB entries within ±10% calorie target precision.
            </p>
            <div className="flex items-center text-xs font-semibold text-emerald-400 space-x-1">
              <span>Generate Meal Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Accuracy Pipeline Breakdown */}
      <section className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 bg-slate-900/50 space-y-6">
        <div className="flex items-center space-x-3 text-emerald-400 font-bold text-lg">
          <Sparkles className="w-5 h-5" />
          <span>The NutriScan Dual-Engine Accuracy System</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step 1: AI Vision</div>
            <h4 className="text-base font-semibold text-white">Food & Portion Detection</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Gemini Vision scans dish photo and extracts item names (e.g. "Roti", "Paneer Tikka") and portion estimates.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-400">Step 2: DB Matching</div>
            <h4 className="text-base font-semibold text-white">Authoritative Matching</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Items are cross-referenced with IFCT 2017 (NIN Indian Tables), USDA FoodData Central, and Open Food Facts.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Step 3: Verification</div>
            <h4 className="text-base font-semibold text-white">Exact Nutrition Formula</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Total calories, protein, carbs, fat, fiber, and micronutrients are derived directly via <code className="text-emerald-400">per_100g * grams / 100</code>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
