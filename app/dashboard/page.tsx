"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Flame, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Scale, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  Search,
  Droplets,
  Award
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";

export default function DashboardPage() {
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [proteinTarget, setProteinTarget] = useState<number>(100);
  const [carbTarget, setCarbTarget] = useState<number>(250);
  const [fatTarget, setFatTarget] = useState<number>(55);
  const [newWeightInput, setNewWeightInput] = useState<string>("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load logged meal items
    const logsStr = localStorage.getItem("nutriscan_daily_logs");
    if (logsStr) {
      try {
        setDailyLogs(JSON.parse(logsStr));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Create initial sample logs if empty
      const sampleLogs = [
        {
          id: "log_sample_1",
          date: new Date().toISOString().split("T")[0],
          food_name: "Poha with Curd",
          source: "IFCT 2017",
          grams: 250,
          nutrition: { calories: 331, protein: 8.3, carbs: 52, fat: 8.1 },
          logged_at: "08:30 AM",
        },
        {
          id: "log_sample_2",
          date: new Date().toISOString().split("T")[0],
          food_name: "Roti & Paneer Butter Masala",
          source: "IFCT 2017",
          grams: 260,
          nutrition: { calories: 544, protein: 20.5, carbs: 49.6, fat: 27.8 },
          logged_at: "01:15 PM",
        },
      ];
      localStorage.setItem("nutriscan_daily_logs", JSON.stringify(sampleLogs));
      setDailyLogs(sampleLogs);
    }

    // Load user target profile
    const profileStr = localStorage.getItem("nutriscan_user_profile");
    if (profileStr) {
      try {
        const parsed = JSON.parse(profileStr);
        if (parsed.targets) {
          setTargetCalories(parsed.targets.targetCalories || 2000);
          setProteinTarget(parsed.targets.proteinGrams || 100);
          setCarbTarget(parsed.targets.carbGrams || 250);
          setFatTarget(parsed.targets.fatGrams || 55);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load weight logs
    const weightsStr = localStorage.getItem("nutriscan_weight_logs");
    if (weightsStr) {
      try {
        setWeightLogs(JSON.parse(weightsStr));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialWeights = [
        { date: "Oct 1", weight: 71.5 },
        { date: "Oct 2", weight: 71.2 },
        { date: "Oct 3", weight: 70.8 },
        { date: "Oct 4", weight: 70.5 },
        { date: "Oct 5", weight: 70.0 },
      ];
      localStorage.setItem("nutriscan_weight_logs", JSON.stringify(initialWeights));
      setWeightLogs(initialWeights);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = dailyLogs.filter((log) => log.date === todayStr);

  const consumedCalories = todayLogs.reduce((sum, item) => sum + (item.nutrition?.calories || 0), 0);
  const consumedProtein = Number(todayLogs.reduce((sum, item) => sum + (item.nutrition?.protein || 0), 0).toFixed(1));
  const consumedCarbs = Number(todayLogs.reduce((sum, item) => sum + (item.nutrition?.carbs || 0), 0).toFixed(1));
  const consumedFat = Number(todayLogs.reduce((sum, item) => sum + (item.nutrition?.fat || 0), 0).toFixed(1));

  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const caloriePercentage = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  const handleDeleteLog = (id: string) => {
    const updated = dailyLogs.filter((l) => l.id !== id);
    localStorage.setItem("nutriscan_daily_logs", JSON.stringify(updated));
    setDailyLogs(updated);
  };

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeightInput) return;
    const w = parseFloat(newWeightInput);
    if (isNaN(w) || w <= 0) return;

    const newLog = {
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      weight: w,
    };

    const updated = [...weightLogs, newLog];
    localStorage.setItem("nutriscan_weight_logs", JSON.stringify(updated));
    setWeightLogs(updated);
    setNewWeightInput("");
  };

  // Recharts Weekly Trend Mock Data (past 7 days)
  const weeklyTrendData = [
    { day: "Mon", calories: 1850, target: targetCalories },
    { day: "Tue", calories: 1920, target: targetCalories },
    { day: "Wed", calories: 2050, target: targetCalories },
    { day: "Thu", calories: 1780, target: targetCalories },
    { day: "Fri", calories: 1990, target: targetCalories },
    { day: "Sat", calories: 2100, target: targetCalories },
    { day: "Sun", calories: consumedCalories > 0 ? consumedCalories : 1870, target: targetCalories },
  ];

  // Pie Chart Data for Macro Split
  const macroPieData = [
    { name: "Protein", value: consumedProtein * 4, color: "#10b981" },
    { name: "Carbs", value: consumedCarbs * 4, color: "#06b6d4" },
    { name: "Fat", value: consumedFat * 9, color: "#a855f7" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Daily Nutrition & Weight Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Today's Nutrition Summary
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Track daily calories, macro balance, weekly trends, and body weight logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/scan"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-emerald-500/20"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Food</span>
          </Link>

          <Link
            href="/search"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs sm:text-sm font-bold"
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Search DB</span>
          </Link>
        </div>
      </div>

      {/* Top Cards: Calorie Ring + Macro Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Calorie Progress Ring */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-slate-900/80 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Calorie Budget Progress
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {caloriePercentage}% Achieved
            </span>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { value: consumedCalories, fill: "#10b981" },
                    { value: Math.max(0, targetCalories - consumedCalories), fill: "#1e293b" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-white">{consumedCalories}</span>
              <span className="text-xs text-slate-400 font-semibold">of {targetCalories} kcal</span>
              <span className="text-[11px] text-emerald-400 font-bold mt-1">
                {remainingCalories} kcal left
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center border-t border-slate-800 pt-4">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Consumed</span>
              <span className="text-lg font-black text-emerald-400">{consumedCalories} kcal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Remaining</span>
              <span className="text-lg font-black text-teal-300">{remainingCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Right Macros Bars + Ratio Split */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Macro Target Performance</span>
            </h3>

            <Link
              href="/bmi"
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Adjust Targets
            </Link>
          </div>

          <div className="space-y-5">
            {/* Protein Bar */}
            <MacroProgressRow
              label="Protein"
              consumed={consumedProtein}
              target={proteinTarget}
              unit="g"
              color="bg-emerald-500"
              textColor="text-emerald-400"
            />

            {/* Carbs Bar */}
            <MacroProgressRow
              label="Carbohydrates"
              consumed={consumedCarbs}
              target={carbTarget}
              unit="g"
              color="bg-cyan-500"
              textColor="text-cyan-400"
            />

            {/* Fat Bar */}
            <MacroProgressRow
              label="Dietary Fats"
              consumed={consumedFat}
              target={fatTarget}
              unit="g"
              color="bg-purple-500"
              textColor="text-purple-400"
            />
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Water</span>
              <span className="text-sm font-extrabold text-white">2.5 / 3.0 L</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Fiber</span>
              <span className="text-sm font-extrabold text-white">24 / 28 g</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Streak</span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4 mr-1" />
                5 Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Weekly Calorie Area Chart & Weight Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Calorie Trend (Recharts Area Chart) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Weekly Calorie Intake Trend</span>
            </h3>
            <span className="text-xs text-slate-400">Target: {targetCalories} kcal</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
                <Area type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Tracker (Recharts Line Chart + Form Input) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-teal-400" />
                <span>Weight Log Tracker</span>
              </h3>
              <span className="text-xs text-emerald-400 font-bold">Current: {weightLogs[weightLogs.length - 1]?.weight || 70} kg</span>
            </div>

            {/* Quick Weight Input Form */}
            <form onSubmit={handleAddWeight} className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                placeholder="Enter weight in kg..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 text-white text-xs border border-slate-800 focus:outline-none focus:border-teal-500 font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Log Weight
              </button>
            </form>

            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightLogs} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={3} dot={{ fill: "#14b8a6", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Logged Meals List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Today's Logged Meals ({todayLogs.length})</span>
          </h3>

          <Link
            href="/scan"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </Link>
        </div>

        {todayLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Camera className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No meals logged yet today.</p>
            <p className="text-xs text-slate-500">Scan a photo or search food items to log your nutrition.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm sm:text-base">{log.food_name}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
                      {log.source || "Verified DB"}
                    </span>
                  </div>
                  <div className="text-slate-400 space-x-3">
                    <span>Logged at {log.logged_at}</span>
                    <span>•</span>
                    <span>Portion: {log.grams}g</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400 block">
                      {log.nutrition?.calories || 0} kcal
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      P: {log.nutrition?.protein}g | C: {log.nutrition?.carbs}g | F: {log.nutrition?.fat}g
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-2 rounded-xl hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MacroProgressRow({
  label,
  consumed,
  target,
  unit,
  color,
  textColor,
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
  textColor: string;
}) {
  const percentage = Math.min(100, Math.round((consumed / target) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-300">{label}</span>
        <div>
          <span className={`font-bold ${textColor}`}>{consumed} {unit}</span>
          <span className="text-slate-400"> / {target} {unit} ({percentage}%)</span>
        </div>
      </div>

      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full ${color} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
