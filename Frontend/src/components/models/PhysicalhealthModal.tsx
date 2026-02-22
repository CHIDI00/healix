import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Sparkles, Footprints, Flame, Activity } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";

interface BarShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
}

interface PhysicalHealthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const weekData = [
  { day: "Mon", steps: 6200 },
  { day: "Tue", steps: 8100 },
  { day: "Wed", steps: 7400 },
  { day: "Thu", steps: 9200 },
  { day: "Fri", steps: 5800 },
  { day: "Sat", steps: 8432 },
  { day: "Sun", steps: 3200 },
];

const todayIndex = new Date().getDay(); // 0=Sun
const dayMap = [6, 0, 1, 2, 3, 4, 5]; // map to Mon-based index
const highlightIndex = dayMap[todayIndex];

const metrics = [
  {
    icon: Footprints,
    iconColor: "text-sky-500",
    bgColor: "bg-sky-50",
    label: "Steps",
    value: "8,432",
    sub: "84% of daily goal",
    progress: 84,
    progressColor: "#0ea5e9",
  },
  {
    icon: Flame,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "Active Energy",
    value: "450 kcal",
    sub: "Above average",
    progress: 72,
    progressColor: "#f97316",
  },
  {
    icon: Activity,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
    label: "Elevated HR",
    value: "45 min",
    sub: "Zone 3+",
    progress: 60,
    progressColor: "#f43f5e",
  },
];

const PhysicalHealthModal = ({ open, onOpenChange }: PhysicalHealthModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-auto h-[36rem] sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-slate-800">Physical Activity & Recovery</DialogTitle>
      </DialogHeader>

      {/* Hero: Recovery Score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-transparent p-5"
      >
        <div className="text-center">
          <span className="text-5xl font-bold text-emerald-600">82%</span>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-emerald-500">Recovery Score</p>
        </div>
        <div className="flex-1 rounded-xl bg-white/60 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">AI Analysis</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            Your Heart Rate Variability (HRV) is optimal, but you had a slight calorie deficit yesterday. Proceed with your standard workout protocol
            today.
          </p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${m.bgColor}`}>
              <m.icon className={`h-4 w-4 ${m.iconColor}`} />
            </div>
            <p className="text-xl font-bold text-slate-800">{m.value}</p>
            <p className="text-xs font-medium text-slate-500">{m.label}</p>
            <p className="mt-1 text-[10px] text-slate-400">{m.sub}</p>
            {/* Progress ring */}
            <div className="mt-2 flex justify-center">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke={m.progressColor}
                  strokeWidth="3"
                  strokeDasharray={`${(m.progress / 100) * 100.53} 100.53`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Trend */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">7-Day Activity Trend</h3>
        <div className="h-36 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barCategoryGap="20%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Bar
                dataKey="steps"
                radius={[4, 4, 0, 0]}
                fill="#e2e8f0"
                shape={(props: BarShapeProps) => {
                  const { x, y, width, height, index } = props;
                  return <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={index === highlightIndex ? "#34d399" : "#e2e8f0"} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default PhysicalHealthModal;
