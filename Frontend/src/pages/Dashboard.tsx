import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  FileText,
  Heart,
  Phone,
  Settings,
  Sparkles,
  Utensils,
  LogOut,
} from "lucide-react";
import AIChatModal from "@/components/models/AIChatModal";
import VitalsModal from "@/components/models/VitalsModal";
import Orb from "@/components/ui/OrbAnimation";
import DietitianModal from "@/components/models/DiatitionModal";

const quickCards = [
  {
    id: "vitals",
    label: "Vitals",
    icon: Heart,
    preview: "72 BPM",
    iconColor: "text-rose-500",
  },
  {
    id: "diet",
    label: "Dietitian",
    icon: Utensils,
    iconColor: "text-amber-500",
  },
  {
    id: "health",
    label: "Physical & Mental Health",
    icon: Brain,
    iconColor: "text-violet-500",
  },
  {
    id: "summary",
    label: "Health Summary",
    icon: FileText,
    iconColor: "text-sky-500",
  },
  {
    id: "emergency",
    label: "Emergency Connections",
    icon: Phone,
    iconColor: "text-red-500",
  },
];

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [spikeActive, setSpikeActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [dietOpen, setDietOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <motion.div
      className="relative flex min-h-screen flex-col max-w-[90rem] mx-auto"
      style={{ backgroundColor: spikeActive ? "#fff1f2" : "#FAFAFA" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Emergency Alert Banner */}
      <AnimatePresence>
        {spikeActive && (
          <motion.div
            className="fixed left-0 right-0 top-0 z-50 bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            CRITICAL: Severe BPM Abnormality. Auto-dispatching Risk Message.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
            OJ
          </div>
          <span className="text-sm font-medium text-slate-700">
            Onyeka Joshua
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-slate-600">
              <span className="md:hidden block">Active</span>
              <span className="md:block hidden">Oraimo Watch Synced</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <Settings className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    className="absolute right-0 top-12 z-50 w-40 rounded-xl border border-slate-100 bg-white py-1 shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      className="flex w-full items-center shadow-none gap-2 px-4 py-2 text-left text-sm text-slate-600 transition hover:text-red-600"
                      onClick={() => {
                        setSettingsOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* AI Hero Button */}
      <div className=" flex flex-1 items-center justify-center">
        <motion.button
          onClick={() => setChatOpen(true)}
          className="relative group flex h-56 w-56 flex-col items-center justify-center rounded-full"
          style={{
            boxShadow: spikeActive
              ? "0 0 60px rgba(239,68,68,0.4)"
              : "0 0 60px rgba(99,102,241,0.2)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          animate={
            spikeActive
              ? {
                  boxShadow: [
                    "0 0 40px rgba(239,68,68,0.3)",
                    "0 0 80px rgba(239,68,68,0.6)",
                    "0 0 40px rgba(239,68,68,0.3)",
                  ],
                }
              : {}
          }
          transition={spikeActive ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          <Sparkles
            className={`mb-2 h-10 w-10 transition ${spikeActive ? "text-red-500" : "text-indigo-500"}`}
          />
          <span className="text-xs font-medium text-slate-500">
            Tap to talk to
          </span>
          <span
            className={`text-sm font-semibold ${spikeActive ? "text-red-600" : "text-indigo-600"}`}
          >
            Helix
          </span>

          <div className="w-full h-full absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
            <Orb
              hoverIntensity={0.2}
              rotateOnHover
              hue={0}
              forceHoverState={false}
              backgroundColor="#000000"
            />
          </div>
        </motion.button>
      </div>

      {/* Quick Access Grid */}
      <div className="px-4 pb-8">
        <div className="flex flex-wrap  gap-3 overflow-x-auto pb-2">
          {quickCards.map((card) => (
            <motion.button
              key={card.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (card.id === "vitals") setVitalsOpen(true);
                else if (card.id === "emergency") setEmergencyOpen(true);
                else if (card.id === "summary") setSummaryOpen(true);
                else if (card.id === "health") setHealthOpen(true);
                else if (card.id === "diet") setDietOpen(true);
              }}
              className="flex min-w-[120px] flex-[2] flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-4 transition hover:shadow-sm"
            >
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              <span className="md:text-lg text-base font-medium text-slate-600">
                {card.label}
              </span>
              {card.preview && (
                <span className="text-xs font-semibold text-emerald-600">
                  {card.preview}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Simulate Spike Button */}
      <button
        onClick={() => setSpikeActive((p) => !p)}
        className="fixed bottom-1 right-4 z-40 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 shadow-sm transition hover:bg-slate-50"
      >
        {spikeActive ? "Reset" : "Simulate Spike"}
      </button>

      {/* Modals */}
      <>
        <AIChatModal open={chatOpen} onOpenChange={setChatOpen} />
        <VitalsModal open={vitalsOpen} onOpenChange={setVitalsOpen} />
        <DietitianModal open={dietOpen} onOpenChange={setDietOpen} />
      </>
    </motion.div>
  );
};

export default Dashboard;
