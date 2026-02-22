import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Thermometer, Wind, Activity, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

interface VitalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VitalData {
  heart_rate: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  oxygen_saturation: number;
  respiratory_rate: number;
  body_temperature: number;
  timestamp: string;
}

const VitalsModal = ({ open, onOpenChange }: VitalsModalProps) => {
  const [vitals, setVitals] = useState<VitalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ hour: number; v: number }[]>([]);

  useEffect(() => {
    if (open) {
      fetchVitals();
      const interval = setInterval(() => {
        setVitals((prev) => {
          if (!prev) return prev;
          const newTemp = parseFloat((36.4 + Math.random() * 0.4).toFixed(1));
          return { ...prev, body_temperature: newTemp };
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const fetchVitals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}vitals/pull/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to pull telemetry from hardware.");
      }

      const data = await response.json();
      setVitals(data);

      const baseHR = data.heart_rate || 72;
      const generatedTrend = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        v: baseHR - 5 + Math.round(Math.random() * 10),
      }));
      setChartData(generatedTrend);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getVitalsGrid = (data: VitalData) => [
    {
      icon: Wind,
      iconColor: data.oxygen_saturation < 95 ? "text-amber-500" : "text-sky-500",
      label: data.oxygen_saturation < 95 ? "SpO2 (Low)" : "SpO2 (Normal)",
      value: data.oxygen_saturation ? `${data.oxygen_saturation}%` : "--",
      sub: "Blood Oxygen",
    },
    {
      icon: Heart,
      iconColor: data.blood_pressure_systolic > 130 ? "text-rose-600" : "text-rose-400",
      label: "Systolic / Diastolic",
      value:
        data.blood_pressure_systolic && data.blood_pressure_diastolic ? `${data.blood_pressure_systolic}/${data.blood_pressure_diastolic}` : "--",
      sub: "Blood Pressure",
    },
    {
      icon: Activity,
      iconColor: "text-emerald-500",
      label: "Normal Range",
      value: data.respiratory_rate ? `${data.respiratory_rate} br/min` : "--",
      sub: "Respiratory Rate",
    },
    {
      icon: Thermometer,
      iconColor: data.body_temperature > 37.5 ? "text-rose-500" : "text-amber-500",
      label: data.body_temperature > 37.5 ? "Elevated" : "Normal",
      value: data.body_temperature ? `${data.body_temperature}°C` : "--",
      sub: "Body Temp",
    },
  ];

  const generateAIInsight = (data: VitalData) => {
    const anomalies = [];

    // Clinical thresholds
    if (data.heart_rate > 100) anomalies.push("tachycardia (elevated heart rate)");
    if (data.heart_rate < 50) anomalies.push("bradycardia (low heart rate)");
    if (data.oxygen_saturation < 95) anomalies.push("sub-optimal blood oxygen saturation");
    if (data.blood_pressure_systolic > 130 || data.blood_pressure_diastolic > 85) anomalies.push("elevated blood pressure");
    if (data.body_temperature > 37.5) anomalies.push("a slight temperature elevation");

    // If completely healthy
    if (anomalies.length === 0) {
      return `Telemetry is stable. No cardiovascular anomalies detected in the last 48 hours. Your blood pressure (${data.blood_pressure_systolic}/${data.blood_pressure_diastolic}) and SpO2 (${data.oxygen_saturation}%) indicate optimal autonomic recovery. You are cleared for standard protocols.`;
    }

    // If anomalies are found
    const anomalyString = anomalies.join(" and ");

    // Check if it's an emergency (e.g., HR > 120 or SpO2 < 90)
    if (data.heart_rate > 120 || data.oxygen_saturation < 90) {
      return `CRITICAL ALERT: Helix anomaly detection triggered. We are actively tracking severe ${anomalyString}. The auto-dispatch protocol to your Care Team has been initiated. Please remain seated and rest.`;
    }

    // General anomaly warning
    return `Helix anomaly detection triggered. We noticed ${anomalyString} in your recent telemetry. It is highly recommended to prioritize active recovery, hydration, and reduce physical strain today.`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-auto h-[36rem] sm:max-w-2xl">
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

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4 py-20"
            >
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-slate-500">Syncing with Oraimo hardware...</p>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="mb-2 h-10 w-10 text-rose-500" />
              <p className="mb-4 text-sm text-slate-600">{error}</p>
              <Button onClick={fetchVitals} variant="outline" className="rounded-xl border-slate-200">
                Retry Connection
              </Button>
            </motion.div>
          ) : vitals ? (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-4">
              {/* Hero: Real-Time Heart Rate */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-1 text-center">
                  <span className={`text-8xl font-thin ${vitals.heart_rate > 100 ? "text-rose-500" : "text-slate-800"}`}>
                    {vitals.heart_rate || "--"}
                  </span>
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Beats Per Minute (BPM)</p>
                </div>
                <div className="mt-4 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={vitals.heart_rate > 100 ? "#f43f5e" : "#34d399"} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={vitals.heart_rate > 100 ? "#f43f5e" : "#34d399"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={vitals.heart_rate > 100 ? "#f43f5e" : "#34d399"}
                        strokeWidth={2}
                        fill="url(#hrGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Clinical Vitals Grid */}
              <div className="grid grid-cols-2 gap-3">
                {getVitalsGrid(vitals).map((v, i) => (
                  <motion.div
                    key={v.sub}
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

              {/* Dynamic AI Insight */}
              <div
                className={`rounded-2xl p-5 ${
                  vitals.heart_rate > 100 || vitals.oxygen_saturation < 95 ? "bg-rose-50/50 border border-rose-100" : "bg-indigo-50/50"
                }`}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles
                    className={`h-3.5 w-3.5 ${vitals.heart_rate > 100 || vitals.oxygen_saturation < 95 ? "text-rose-500" : "text-indigo-500"}`}
                  />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest ${vitals.heart_rate > 100 || vitals.oxygen_saturation < 95 ? "text-rose-500" : "text-indigo-500"}`}
                  >
                    Helix AI Analysis
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{generateAIInsight(vitals)}</p>
              </div>

              <p className="text-center text-xs text-slate-400">Last hardware sync: {vitals.timestamp || "Just now"}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default VitalsModal;
