import { ShieldCheck, Lock, EyeOff, Database } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Health Privacy & Data Security</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-slate-400 text-sm">Last updated: October 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-6 text-slate-300 text-sm leading-relaxed">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <EyeOff className="w-5 h-5 text-emerald-400" />
            <span>1. Food Photo Processing & Ephemeral Storage</span>
          </h2>
          <p>
            NutriScan processes food images strictly for vision identification. Photos are compressed client-side, sent securely via TLS, processed in-memory by the Gemini Vision LLM, and immediately discarded. 
            <strong> We do not store your food photos on server disks by default.</strong>
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-teal-400" />
            <span>2. Health Metrics & Row-Level Security</span>
          </h2>
          <p>
            Nutritional logs, body measurements (height, weight, age), and meal plans are private sensitive data. When integrated with Supabase Auth, Row Level Security (RLS) policies enforce that only your authenticated account can read or modify your data.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>3. Database Sourcing Accuracy</span>
          </h2>
          <p>
            All nutrition numbers originate from NIN IFCT 2017, USDA FoodData Central, and Open Food Facts. Artificial Intelligence is strictly restricted to food naming and portion estimation, guaranteeing numbers are never hallucinated.
          </p>
        </div>
      </div>
    </div>
  );
}
