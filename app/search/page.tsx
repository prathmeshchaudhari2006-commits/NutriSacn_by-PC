"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Database, 
  Flame, 
  PieChart as PieIcon, 
  Plus, 
  Check, 
  Barcode, 
  Info, 
  Sparkles, 
  Sliders,
  Scale
} from "lucide-react";
import { FoodItem, CalculatedNutrition } from "@/lib/nutrition/types";
import { calculateNutrition } from "@/lib/nutrition/match";
import Disclaimer from "@/components/Disclaimer";

// Standard Daily Values (DV) for % bars
const DAILY_VALUES = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
  calcium: 1300,
  iron: 18,
  potassium: 4700,
  vitamin_a: 900,
  vitamin_c: 90,
  vitamin_d: 20,
  vitamin_b12: 2.4,
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState<number>(100);
  const [unit, setUnit] = useState<string>("g");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [barcodeInput, setBarcodeInput] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Load default search results on initial mount
  useEffect(() => {
    fetchResults("roti");
  }, []);

  const fetchResults = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setSelectedItem(data.results[0]);
        setGrams(data.results[0].serving_grams || 100);
      } else {
        setResults([]);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query);
  };

  const handleBarcodeLookup = async () => {
    if (!barcodeInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcodeInput.trim())}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const n = p.nutriments || {};
        const item: FoodItem = {
          id: `off_${p.code}`,
          name: p.product_name || p.product_name_en || "Packaged Food",
          source: "OpenFoodFacts",
          category: p.categories || "Packaged Product",
          serving_unit: "g",
          serving_grams: 100,
          per_100g: {
            calories: Number(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
            protein: Number(n.proteins_100g || 0),
            carbs: Number(n.carbohydrates_100g || 0),
            fat: Number(n.fat_100g || 0),
            fiber: Number(n.fiber_100g || 0),
            sugar: Number(n.sugars_100g || 0),
            sodium: Math.round(Number(n.sodium_100g || 0) * 1000),
          },
          brand: p.brands || undefined,
          barcode: p.code,
        };
        setResults([item]);
        setSelectedItem(item);
        setGrams(100);
      } else {
        alert("Barcode not found in Open Food Facts database.");
      }
    } catch (err) {
      console.error("Barcode lookup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert unit to grams adjustment
  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    if (!selectedItem) return;

    if (newUnit === "g") {
      setGrams(100);
    } else if (newUnit === "piece") {
      setGrams(selectedItem.serving_grams || 40);
    } else if (newUnit === "bowl" || newUnit === "katori") {
      setGrams(150);
    } else if (newUnit === "cup") {
      setGrams(200);
    }
  };

  const calculated: CalculatedNutrition | null = selectedItem
    ? calculateNutrition(selectedItem, grams)
    : null;

  const handleSaveToLog = () => {
    if (!calculated) return;
    const existingLogsStr = localStorage.getItem("nutriscan_daily_logs");
    const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];

    const newLogItem = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      food_name: calculated.foodItem.name,
      source: calculated.foodItem.source,
      grams: calculated.grams,
      nutrition: calculated.totals,
      logged_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localStorage.setItem("nutriscan_daily_logs", JSON.stringify([newLogItem, ...existingLogs]));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
          <Database className="w-3.5 h-3.5" />
          <span>IFCT 2017 + USDA + Open Food Facts Database</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Food Nutrition Search
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Lookup 100% verified nutrition values for Indian dishes, global staples, and packaged foods.
        </p>
      </div>

      {/* Search Input Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Text Search */}
        <div className="lg:col-span-2 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food item (e.g. roti, paneer, apple, dal, Maggi)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl glass-panel bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:border-emerald-500/80 transition-all text-sm sm:text-base shadow-lg"
            />
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-1"
            >
              {isLoading ? <span>Searching...</span> : <span>Search</span>}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Popular:</span>
            {["Roti", "Paneer", "Dal Tadka", "Maggi", "Apple", "Poha", "Chicken Curry", "Idli"].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setQuery(preset);
                  fetchResults(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Barcode Lookup Option */}
        <div className="glass-panel p-4 rounded-2xl border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold text-xs">
            <Barcode className="w-4 h-4 text-cyan-400" />
            <span>Packaged Barcode Lookup</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter EAN/UPC barcode..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleBarcodeLookup}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
            >
              Lookup
            </button>
          </div>
        </div>
      </div>

      {/* Main Results & Nutrition Panel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search Result Items List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1">
            Matching Items ({results.length})
          </h3>

          {results.length === 0 && !isLoading && (
            <div className="p-8 rounded-2xl glass-panel text-center text-slate-400 space-y-2">
              <Info className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-medium">No direct database match found.</p>
              <p className="text-xs text-slate-500">Try searching for generic item names like "rice", "dal", or "paneer".</p>
            </div>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {results.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setGrams(item.serving_grams || 100);
                  }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    isSelected
                      ? "bg-slate-900/90 border-emerald-500/80 shadow-md shadow-emerald-500/10"
                      : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">{item.name}</h4>
                      {item.brand && (
                        <span className="text-xs text-slate-400 block">{item.brand}</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        item.source === "IFCT"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : item.source === "USDA"
                          ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                          : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      {item.source}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                    <span className="flex items-center text-amber-400 font-semibold">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      {item.per_100g.calories} kcal / 100g
                    </span>
                    <span>P: {item.per_100g.protein}g | C: {item.per_100g.carbs}g | F: {item.per_100g.fat}g</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Verified Nutrition Panel */}
        <div className="lg:col-span-8">
          {calculated && selectedItem ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Verified Data ({selectedItem.source})
                    </span>
                    {selectedItem.category && (
                      <span className="text-xs text-slate-400">{selectedItem.category}</span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {selectedItem.name}
                  </h2>
                </div>

                <button
                  onClick={handleSaveToLog}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                    isSaved
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-95"
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{isSaved ? "Saved to Log!" : "Save to Today's Log"}</span>
                </button>
              </div>

              {/* Portion & Serving Size Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span>Serving Unit & Portion</span>
                  </div>

                  {/* Unit Selectors */}
                  <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {["g", "piece", "bowl", "cup"].map((u) => (
                      <button
                        key={u}
                        onClick={() => handleUnitChange(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                          unit === u
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grams Slider & Direct Numeric Input */}
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={grams}
                    onChange={(e) => setGrams(Number(e.target.value))}
                    className="flex-1 accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      value={grams}
                      onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-transparent text-right font-extrabold text-white text-base focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold">grams</span>
                  </div>
                </div>
              </div>

              {/* Macro Cards Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-center">
                  <span className="text-xs font-bold uppercase text-amber-400 block">Calories</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{calculated.totals.calories}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">kcal</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-center">
                  <span className="text-xs font-bold uppercase text-emerald-400 block">Protein</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{calculated.totals.protein}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">grams</span>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-center">
                  <span className="text-xs font-bold uppercase text-cyan-400 block">Carbs</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{calculated.totals.carbs}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">grams</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-center">
                  <span className="text-xs font-bold uppercase text-purple-400 block">Fat</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{calculated.totals.fat}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">grams</span>
                </div>
              </div>

              {/* Nutrition Panel % Daily Value Bars */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                  Detailed Nutrition & % Daily Value (DV)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Nutrients */}
                  <div className="space-y-3">
                    <NutrientDvRow
                      label="Dietary Fiber"
                      value={`${calculated.totals.fiber ?? 0} g`}
                      dvPercentage={Math.round(((calculated.totals.fiber ?? 0) / DAILY_VALUES.fiber) * 100)}
                      color="bg-emerald-500"
                    />
                    <NutrientDvRow
                      label="Total Sugars"
                      value={`${calculated.totals.sugar ?? 0} g`}
                      dvPercentage={Math.round(((calculated.totals.sugar ?? 0) / DAILY_VALUES.sugar) * 100)}
                      color="bg-amber-500"
                    />
                    <NutrientDvRow
                      label="Sodium"
                      value={`${calculated.totals.sodium ?? 0} mg`}
                      dvPercentage={Math.round(((calculated.totals.sodium ?? 0) / DAILY_VALUES.sodium) * 100)}
                      color="bg-red-500"
                    />
                    <NutrientDvRow
                      label="Calcium"
                      value={`${calculated.totals.calcium ?? 0} mg`}
                      dvPercentage={Math.round(((calculated.totals.calcium ?? 0) / DAILY_VALUES.calcium) * 100)}
                      color="bg-cyan-500"
                    />
                  </div>

                  {/* Right Nutrients */}
                  <div className="space-y-3">
                    <NutrientDvRow
                      label="Iron"
                      value={`${calculated.totals.iron ?? 0} mg`}
                      dvPercentage={Math.round(((calculated.totals.iron ?? 0) / DAILY_VALUES.iron) * 100)}
                      color="bg-teal-500"
                    />
                    <NutrientDvRow
                      label="Potassium"
                      value={`${calculated.totals.potassium ?? 0} mg`}
                      dvPercentage={Math.round(((calculated.totals.potassium ?? 0) / DAILY_VALUES.potassium) * 100)}
                      color="bg-indigo-500"
                    />
                    <NutrientDvRow
                      label="Vitamin A"
                      value={`${calculated.totals.vitamin_a ?? 0} mcg`}
                      dvPercentage={Math.round(((calculated.totals.vitamin_a ?? 0) / DAILY_VALUES.vitamin_a) * 100)}
                      color="bg-orange-500"
                    />
                    <NutrientDvRow
                      label="Vitamin C"
                      value={`${calculated.totals.vitamin_c ?? 0} mg`}
                      dvPercentage={Math.round(((calculated.totals.vitamin_c ?? 0) / DAILY_VALUES.vitamin_c) * 100)}
                      color="bg-yellow-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center text-slate-400 space-y-3">
              <Search className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-semibold">Select a food item to view full nutrition panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NutrientDvRow({
  label,
  value,
  dvPercentage,
  color,
}: {
  label: string;
  value: string;
  dvPercentage: number;
  color: string;
}) {
  const cappedPercentage = Math.min(100, Math.max(0, dvPercentage));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <div className="space-x-2">
          <span className="text-white font-bold">{value}</span>
          <span className="text-slate-400 text-[11px]">({dvPercentage}% DV)</span>
        </div>
      </div>
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full ${color} transition-all duration-300 rounded-full`}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>
    </div>
  );
}
