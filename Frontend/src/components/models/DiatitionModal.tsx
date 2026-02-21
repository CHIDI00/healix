import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Loader2, AlertCircle } from "lucide-react";

interface DietitianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DietPlan {
  ai_insight: string;
  macros: {
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    hydration_l: number;
  };
  meals: {
    time: string;
    title: string;
    badge: string;
  }[];
}

const DietitianModal = ({ open, onOpenChange }: DietitianModalProps) => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger the AI generation when the modal opens
  useEffect(() => {
    if (open && !dietPlan) {
      fetchDietPlan();
    }
  }, [open, dietPlan]);

  const fetchDietPlan = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setDietPlan({
        ai_insight: "Helix noticed your heart rate was elevated yesterday. We are switching to a cardiovascular recovery protocol today.",
        macros: { protein_g: 130, carbs_g: 160, fats_g: 55, hydration_l: 3.5 },
        meals: [
          { time: "08:00 AM", title: "Oatmeal with Chia & Berries", badge: "High Fiber" },
          { time: "01:00 PM", title: "Grilled Salmon Salad", badge: "Omega-3 Rich" },
        ],
      });
      setIsLoading(false);
    }, 2000);
  };

  //   const fetchDietPlan = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const token = localStorage.getItem("healix_token");

  //       // Update this endpoint to match whatever the backend developer sets up for the RAG/Diet agent
  //       const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}assistant/diet-plan/`, {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Token ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to connect to Helix AI Agent.");
  //       }

  //       const data = await response.json();
  //       setDietPlan(data);
  //     } catch (err: any) {
  //       setError(err.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  // Helper function to format the raw backend data into your UI's macro array
  const getMappedMacros = (macrosData?: DietPlan["macros"]) => {
    if (!macrosData) return [];
    return [
      { label: "Protein", value: `${macrosData.protein_g}g`, progress: (macrosData.protein_g / 150) * 100, color: "#3b82f6" },
      { label: "Carbs", value: `${macrosData.carbs_g}g`, progress: (macrosData.carbs_g / 200) * 100, color: "#f97316" },
      { label: "Fats", value: `${macrosData.fats_g}g`, progress: (macrosData.fats_g / 70) * 100, color: "#eab308" },
      { label: "Hydration", value: `${macrosData.hydration_l}L`, progress: (macrosData.hydration_l / 4) * 100, color: "#06b6d4" },
    ];
  };

  const getBadgeColor = (badgeText: string) => {
    const lower = badgeText.toLowerCase();
    if (lower.includes("magnesium") || lower.includes("greens")) return "bg-emerald-50 text-emerald-600";
    if (lower.includes("protein") || lower.includes("energy")) return "bg-sky-50 text-sky-600";
    if (lower.includes("omega") || lower.includes("fats")) return "bg-amber-50 text-amber-600";
    return "bg-indigo-50 text-indigo-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-auto h-[36rem] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">Clinical Nutrition Protocol</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isLoading ? (
            // The Loading State
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4 py-20"
            >
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <p className="text-sm font-medium text-slate-500">Helix is analyzing your vitals...</p>
            </motion.div>
          ) : error ? (
            // The Error State
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="mb-2 h-10 w-10 text-rose-500" />
              <p className="mb-4 text-sm text-slate-600">{error}</p>
              <Button onClick={fetchDietPlan} variant="outline" className="rounded-xl border-slate-200">
                Try Again
              </Button>
            </motion.div>
          ) : dietPlan ? (
            //The Success
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-4">
              {/* AI Insight */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-indigo-50/50 p-5">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">Helix Insight</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{dietPlan.ai_insight}</p>
              </motion.div>

              {/* Macro Targets */}
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">Daily Macro Targets</h3>
                <div className="grid grid-cols-4 gap-3">
                  {getMappedMacros(dietPlan.macros).map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="relative mb-2 h-14 w-14">
                        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                          <circle
                            cx="28"
                            cy="28"
                            r="22"
                            fill="none"
                            stroke={m.color}
                            strokeWidth="4"
                            strokeDasharray={`${(Math.min(m.progress, 100) / 100) * 138.23} 138.23`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">{m.value}</span>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{m.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Meal Timeline */}
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">Prescribed Protocol</h3>
                <div className="space-y-2">
                  {dietPlan.meals.map((meal, i) => (
                    <motion.div
                      key={meal.time}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl border border-slate-100 bg-white p-4 transition hover:bg-slate-50"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-400">{meal.time}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getBadgeColor(meal.badge)}`}>{meal.badge}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{meal.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DietitianModal;
