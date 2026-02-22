import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Share2, Clock } from "lucide-react";

interface DietitianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const macros = [
  { label: "Protein", value: "120g", progress: 75, color: "#3b82f6" },
  { label: "Carbs", value: "150g", progress: 60, color: "#f97316" },
  { label: "Fats", value: "50g", progress: 45, color: "#eab308" },
  { label: "Hydration", value: "3.2L", progress: 80, color: "#06b6d4" },
];

const meals = [
  { time: "08:00 AM", title: "Metabolic Start: Spinach & Egg White Scramble", badge: "High Magnesium", badgeColor: "bg-emerald-50 text-emerald-600" },
  { time: "01:30 PM", title: "Sustained Energy: Grilled Chicken & Quinoa Bowl", badge: "Lean Protein", badgeColor: "bg-sky-50 text-sky-600" },
  { time: "07:00 PM", title: "Recovery: Baked Salmon with Asparagus", badge: "Omega-3 Rich", badgeColor: "bg-amber-50 text-amber-600" },
];

const DietitianModal = ({ open, onOpenChange }: DietitianModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-scroll  h-[36rem] sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-slate-800">Clinical Nutrition Protocol</DialogTitle>
      </DialogHeader>

      {/* AI Insight */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-indigo-50/50 p-5">
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">AI Insight</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Your smartwatch recorded a 15% drop in deep sleep and a slightly elevated resting heart rate. I have generated a high-magnesium, low-sodium
          protocol today to reduce cortisol and support cardiovascular recovery.
        </p>
      </motion.div>

      {/* Macro Targets */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">Daily Macro Targets</h3>
        <div className="grid grid-cols-4 gap-3">
          {macros.map((m, i) => (
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
                    strokeDasharray={`${(m.progress / 100) * 138.23} 138.23`}
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
          {meals.map((meal, i) => (
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
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meal.badgeColor}`}>{meal.badge}</span>
              </div>
              <p className="text-sm font-medium text-slate-700">{meal.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default DietitianModal;
