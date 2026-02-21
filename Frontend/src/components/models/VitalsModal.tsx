import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Thermometer, Wind, Activity, Sparkles } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const heartRateData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  v: 65 + Math.round(Math.random() * 15),
}));

const vitalsGrid = [
  { icon: Wind, iconColor: "text-sky-500", label: "SpO2 (Normal)", value: "98%", sub: "Blood Oxygen" },
  { icon: Activity, iconColor: "text-emerald-500", label: "Respiratory Rate", value: "16 br/min", sub: "Normal Range" },
  { icon: Heart, iconColor: "text-rose-400", label: "Resting Average", value: "61 BPM", sub: "Resting HR" },
  { icon: Thermometer, iconColor: "text-amber-500", label: "Skin Temp", value: "36.5°C", sub: "Normal" },
];

interface VitalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VitalsModal = ({ open, onOpenChange }: VitalsModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-scroll  h-[36rem] sm:max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <DialogTitle className="text-xl font-semibold text-slate-800">Hardware Telemetry</DialogTitle>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-medium text-slate-500">Oraimo Sensor Active</span>
          </div>
        </div>
      </DialogHeader>

      {/* Hero: Heart Rate */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div className="mb-1 text-center">
          <span className="text-8xl font-thin text-slate-800">72</span>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Beats Per Minute (BPM)</p>
        </div>
        <div className="mt-4 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={heartRateData}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} fill="url(#hrGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Clinical Vitals Grid */}
      <div className="grid grid-cols-2 gap-3">
        {vitalsGrid.map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:bg-slate-50"
          >
            <div className="mb-2 flex items-center gap-2">
              <v.icon className={`h-4 w-4 ${v.iconColor}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{v.sub}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{v.value}</p>
            <p className="text-xs text-slate-400">{v.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insight */}
      <div className="rounded-2xl bg-indigo-50/50 p-5">
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">AI Analysis</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Vitals are completely stable. No cardiovascular anomalies detected in the last 48 hours. HRV indicates optimal nervous system recovery.
        </p>
      </div>

      <p className="text-center text-xs text-slate-400">Last synced 2 min ago</p>
    </DialogContent>
  </Dialog>
);

export default VitalsModal;
