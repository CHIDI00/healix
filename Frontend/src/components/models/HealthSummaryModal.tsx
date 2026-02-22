import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, Share2, FileText, Sparkles } from "lucide-react";

interface HealthSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const durations = ["7 Days", "14 Days", "30 Days", "90 Days"];

const tableData = [
  { metric: "Heart Rate", avg: "68 BPM", baseline: "60-100 BPM", status: "Normal" },
  { metric: "Blood Oxygen", avg: "97.5%", baseline: ">95%", status: "Normal" },
  { metric: "Daily Steps", avg: "8,240", baseline: "8,000", status: "Optimal" },
  { metric: "Skin Temp", avg: "36.5°C", baseline: "36.1-37.2°C", status: "Normal" },
  { metric: "Respiratory Rate", avg: "16 br/min", baseline: "12-20 br/min", status: "Normal" },
];

const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const HealthSummaryModal = ({ open, onOpenChange }: HealthSummaryModalProps) => {
  const [selectedDuration, setSelectedDuration] = useState("7 Days");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-slate-200 bg-[#FAFAFA] overflow-y-auto h-[36rem] sm:max-w-2xl p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800">Clinical Health Summary</DialogTitle>
          </DialogHeader>

          {/* Duration Selector */}
          <div className="mt-4 flex gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  selectedDuration === d ? "bg-indigo-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* EMR Document */}
        <div className="m-6 mt-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Letterhead */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700">OmniCare AI Clinical EMR</span>
            </div>
            <span className="text-[10px] text-slate-400">Generated: {today} | Auth: System AI</span>
          </div>

          {/* Patient Info */}
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-500">
            <p>
              <span className="font-medium text-slate-600">Patient:</span> Onyeka Joshua
            </p>
            <p>
              <span className="font-medium text-slate-600">DOB:</span> 1999
            </p>
            <p>
              <span className="font-medium text-slate-600">Primary Device:</span> Oraimo Watch
            </p>
            <p>
              <span className="font-medium text-slate-600">Duration:</span> {selectedDuration}
            </p>
          </div>

          <hr className="my-4 border-slate-100" />

          {/* AI Summary */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">AI Diagnostic Summary</h3>
            <div className="flex gap-3 rounded-xl bg-indigo-50/50 p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <p className="text-sm leading-relaxed text-slate-600">
                Based on the continuous telemetry data collected over the past {selectedDuration.toLowerCase()}, the patient is maintaining optimal
                cardiovascular health. Resting heart rate has decreased by 3% week-over-week. Dietary adherence to the low-sodium protocol is
                currently at 85%. No emergency arrhythmias have been detected.
              </p>
            </div>
          </div>

          {/* Data Table */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                <th className="pb-2 font-medium">Metric</th>
                <th className="pb-2 font-medium">{selectedDuration.replace(" Days", "d")} Avg</th>
                <th className="pb-2 font-medium">Baseline</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <motion.tr
                  key={row.metric}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-slate-50 text-slate-600"
                >
                  <td className="py-2.5 font-medium text-slate-700">{row.metric}</td>
                  <td className="py-2.5">{row.avg}</td>
                  <td className="py-2.5 text-slate-400">{row.baseline}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-emerald-600">{row.status}</span>
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            <Share2 className="mr-2 h-4 w-4" />
            Send to Care Team
          </Button>
          <Button className="flex-1 rounded-xl bg-indigo-600 text-sm hover:bg-indigo-700">
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthSummaryModal;
