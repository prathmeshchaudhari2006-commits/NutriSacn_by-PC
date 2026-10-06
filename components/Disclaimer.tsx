import { ShieldAlert } from "lucide-react";

export default function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs text-amber-400/90 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 my-3">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong>Medical Disclaimer:</strong> General nutritional guidance only. Not medical advice. Consult a doctor or registered dietitian for clinical needs.
        </span>
      </div>
    );
  }

  return (
    <footer className="mt-12 mb-20 md:mb-8 text-center text-xs text-slate-500 max-w-4xl mx-auto px-4">
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-left sm:text-center space-y-2">
        <div className="flex items-center justify-center space-x-2 text-amber-400 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Health & Safety Notice</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
          NutriScan calculates calories and macros using verified nutrition databases (IFCT 2017, USDA, OFF). 
          Calculations and AI recommendations are for general informational purposes only and do not replace advice from certified healthcare professionals or registered dietitians.
        </p>
      </div>
    </footer>
  );
}
