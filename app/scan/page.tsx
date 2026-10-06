"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Check, 
  Plus, 
  Sparkles, 
  ShieldAlert, 
  Scale, 
  Flame, 
  PieChart as PieIcon, 
  Trash2, 
  Edit3,
  CheckCircle2,
  Info
} from "lucide-react";
import { FoodItem, NutritionValues } from "@/lib/nutrition/types";
import { calculateNutrition, matchFoodItem } from "@/lib/nutrition/match";
import { compressImage } from "@/lib/utils/image";
import Disclaimer from "@/components/Disclaimer";

interface ScannedItemState {
  id: string;
  detected_name: string;
  matched_item: FoodItem;
  grams: number;
  confidence: number;
  alternative_matches: FoodItem[];
}

export default function ScanPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [items, setItems] = useState<ScannedItemState[]>([]);
  const [dishDescription, setDishDescription] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access live camera. Please use photo file upload instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    setImagePreview(base64);
    processImageScan(base64);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsScanning(true);
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);
      await processImageScan(compressedBase64);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Error processing image file.");
      setIsScanning(false);
    }
  };

  const processImageScan = async (base64Img: string) => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Img }),
      });

      const data = await res.json();
      if (!res.ok || !data.is_food) {
        alert(data.message || "Food scan failed. Please upload a clear food photo.");
        setItems([]);
        return;
      }

      setDishDescription(data.dish_description || "Scanned Meal");

      const scannedItemsList: ScannedItemState[] = data.items.map((item: any, idx: number) => ({
        id: `scan_item_${idx}_${Date.now()}`,
        detected_name: item.detected_name,
        matched_item: item.matched_item,
        grams: item.estimated_grams || 100,
        confidence: item.confidence || 0.85,
        alternative_matches: item.alternative_matches || [],
      }));

      setItems(scannedItemsList);
    } catch (err) {
      console.error("Scan processing error:", err);
      alert("Error connecting to vision scanning service.");
    } finally {
      setIsScanning(false);
    }
  };

  // Live item editing handlers
  const handleGramsChange = (id: string, newGrams: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, grams: Math.max(5, newGrams) } : item))
    );
  };

  const handleNameEdit = async (id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, detected_name: newName } : item))
    );
    // Re-match against database
    if (newName.trim().length > 2) {
      const matches = await matchFoodItem(newName);
      if (matches.length > 0) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  matched_item: matches[0],
                  alternative_matches: matches.slice(1, 4),
                }
              : item
          )
        );
      }
    }
  };

  const handleSelectAlternativeMatch = (id: string, altItem: FoodItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, matched_item: altItem } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Live recalculation of totals from DB numbers
  const calculatedItems = items.map((item) => ({
    ...item,
    calculated: calculateNutrition(item.matched_item, item.grams),
  }));

  const grandTotals: NutritionValues = calculatedItems.reduce(
    (acc, curr) => ({
      calories: acc.calories + curr.calculated.totals.calories,
      protein: Number((acc.protein + curr.calculated.totals.protein).toFixed(1)),
      carbs: Number((acc.carbs + curr.calculated.totals.carbs).toFixed(1)),
      fat: Number((acc.fat + curr.calculated.totals.fat).toFixed(1)),
      fiber: Number(((acc.fiber || 0) + (curr.calculated.totals.fiber || 0)).toFixed(1)),
      sodium: (acc.sodium || 0) + (curr.calculated.totals.sodium || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  );

  const handleSaveMealToLog = () => {
    if (calculatedItems.length === 0) return;
    const existingLogsStr = localStorage.getItem("nutriscan_daily_logs");
    const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];

    const newLogItem = {
      id: `log_scan_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      food_name: dishDescription || "Scanned Meal",
      source: "Gemini Vision + Verified DB",
      grams: items.reduce((sum, i) => sum + i.grams, 0),
      nutrition: grandTotals,
      items: calculatedItems.map((i) => ({
        name: i.matched_item.name,
        grams: i.grams,
        calories: i.calculated.totals.calories,
      })),
      logged_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    localStorage.setItem("nutriscan_daily_logs", JSON.stringify([newLogItem, ...existingLogs]));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Camera className="w-3.5 h-3.5" />
          <span>AI Vision Detection + Database Nutrition Calculator</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Food Photo Scanner
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Snap or upload a photo of your meal. Gemini detects items; IFCT 2017 & USDA calculate verified nutrition.
        </p>
      </div>

      {/* Accuracy Warning Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center space-x-2">
        <Info className="w-4 h-4 shrink-0 text-amber-400" />
        <span>
          <strong>Portion Estimate Notice:</strong> Photo portion size estimation is inherently approximate. You can easily adjust gram sliders or item names below before saving.
        </span>
      </div>

      {/* Main Grid: Camera/Upload Box vs Scan Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera / Photo Preview Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 bg-slate-950 aspect-square flex flex-col items-center justify-center p-4">
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="relative w-full h-full flex flex-col items-center justify-between">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl" />
                <button
                  onClick={captureCameraPhoto}
                  className="absolute bottom-4 px-6 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Snap Photo</span>
                </button>
              </div>
            ) : imagePreview ? (
              <div className="relative w-full h-full">
                {/* Image Preview */}
                <img
                  src={imagePreview}
                  alt="Scanned Food"
                  className="w-full h-full object-cover rounded-2xl"
                />

                {/* Laser Animation Scan Line Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-scanline shadow-[0_0_15px_#34d399]" />
                    <div className="bg-slate-950/90 border border-emerald-500/40 px-4 py-2.5 rounded-2xl flex items-center space-x-3 shadow-2xl">
                      <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                      <span className="text-xs font-bold text-emerald-300">Matching Food Database...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Default Upload Placeholder */
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Capture or Upload Meal Photo</h3>
                  <p className="text-slate-400 text-xs">Supports JPG, PNG, WEBP up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls Buttons */}
          <div className="flex gap-3">
            <button
              onClick={startCamera}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 flex items-center justify-center space-x-2 transition-all"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Use Live Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 hover:brightness-110 transition-all shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Right Column: Detected Items & Live Recalculated Totals */}
        <div className="lg:col-span-7 space-y-6">
          {items.length > 0 ? (
            <div className="space-y-6">
              {/* Grand Totals Summary Panel */}
              <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-slate-900/80 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Verified DB Sum
                    </span>
                    <h2 className="text-xl font-black text-white mt-1">{dishDescription}</h2>
                  </div>

                  <button
                    onClick={handleSaveMealToLog}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      isSaved
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-md"
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isSaved ? "Saved to Today's Log!" : "Save Meal to Log"}</span>
                  </button>
                </div>

                {/* Macro Rings / Cards */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">Calories</span>
                    <span className="text-xl font-black text-white">{grandTotals.calories}</span>
                    <span className="text-[9px] text-slate-400 block">kcal</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">Protein</span>
                    <span className="text-xl font-black text-white">{grandTotals.protein}g</span>
                    <span className="text-[9px] text-slate-400 block">grams</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                    <span className="text-[10px] font-bold uppercase text-cyan-400 block">Carbs</span>
                    <span className="text-xl font-black text-white">{grandTotals.carbs}g</span>
                    <span className="text-[9px] text-slate-400 block">grams</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                    <span className="text-[10px] font-bold uppercase text-purple-400 block">Fat</span>
                    <span className="text-xl font-black text-white">{grandTotals.fat}g</span>
                    <span className="text-[9px] text-slate-400 block">grams</span>
                  </div>
                </div>
              </div>

              {/* Editable Detected Items List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Detected Food Items & Gram Sliders ({items.length})
                </h3>

                {calculatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4"
                  >
                    {/* Item Top Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item.detected_name}
                            onChange={(e) => handleNameEdit(item.id, e.target.value)}
                            className="bg-transparent border-b border-slate-700 font-bold text-white text-base focus:outline-none focus:border-emerald-500 px-1"
                          />
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-xs text-slate-400 block">
                          DB Match: <strong className="text-emerald-400">{item.matched_item.name}</strong> ({item.matched_item.source})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-800/40">
                          {item.calculated.totals.calories} kcal
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-xl hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Portion Grams Slider & Presets */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Portion Weight</span>
                        <div className="space-x-1">
                          {/* Presets */}
                          <button
                            onClick={() => handleGramsChange(item.id, Math.round(item.grams * 0.75))}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold"
                          >
                            Small (-25%)
                          </button>
                          <button
                            onClick={() => handleGramsChange(item.id, Math.round(item.grams * 1.33))}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold"
                          >
                            Large (+33%)
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="10"
                          max="400"
                          step="5"
                          value={item.grams}
                          onChange={(e) => handleGramsChange(item.id, Number(e.target.value))}
                          className="flex-1 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          <input
                            type="number"
                            value={item.grams}
                            onChange={(e) => handleGramsChange(item.id, Number(e.target.value))}
                            className="w-12 bg-transparent text-right font-bold text-white text-xs focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400 font-semibold">g</span>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Matches Dropdown if available */}
                    {item.alternative_matches.length > 0 && (
                      <div className="text-xs text-slate-400 flex items-center space-x-2 pt-1">
                        <span>Swap match:</span>
                        <div className="flex flex-wrap gap-1">
                          {item.alternative_matches.map((alt) => (
                            <button
                              key={alt.id}
                              onClick={() => handleSelectAlternativeMatch(item.id, alt)}
                              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] text-teal-300 border border-slate-700/60 transition-colors"
                            >
                              {alt.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center text-slate-400 space-y-3">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-semibold">No food items scanned yet</p>
              <p className="text-xs text-slate-500">Take a photo or upload an image on the left to analyze.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
