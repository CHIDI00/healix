# 🧬 Healix (Helix) - Frontend

> **Consumer Medical Minimalism.** > _Built for the 2026 Cavista Hackathon: "From data to prevention: AI as your health partner."_

Healix is a centralized, AI-first digital health hub. We transform raw hardware telemetry (from wearables like the Oraimo watch via Google Health Connect) into actionable, clinical-grade prevention protocols. This repository contains the React frontend, designed with a strict focus on high-trust, frictionless UI/UX.

---

## ✨ Hackathon Theme Alignment

**"From data to prevention."**
Most health apps stop at data (e.g., "You took 8,000 steps"). Healix uses an AI Agent to interpret that data and drive **prevention**.

- **The Data:** Live wearable telemetry (Heart Rate, SpO2, Sleep).
- **The Prevention:** AI-generated Clinical Nutrition Protocols (modifying diet based on HRV/Sleep drops) and automated Emergency EMR dispatching.

## 🎨 UI/UX Philosophy: "Apple Health meets Stripe"

Health data is highly sensitive and often anxiety-inducing. We built Healix using:

- **Off-white backgrounds (`#FAFAFA`)** and deep slate text for an airy, clinical feel.
- **Framer Motion** for zero-jank, liquid-smooth page transitions (e.g., the seamless melt from the Authentication screen into the Main Hub).
- **shadcn/ui** minimalist dialogs to keep complex medical data compartmentalized and accessible.

---

## 🛠 Tech Stack

- **Framework:** React 18 + Vite (TypeScript)
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS + PostCSS
- **UI Components:** shadcn/ui + Radix UI Primitives
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts/Data Viz:** Recharts (for ultra-clean vitals telemetry)
- **API Communication:** Native Fetch API with Token-based Auth

---

## 🚀 Key Features

- **Bank-Level Authentication Flow:** A highly polished, animated Login & Signup flow communicating with the Django REST Framework backend.
- **The AI Agent Hub:** A centralized dashboard featuring a massive, interactive AI entry point that replaces traditional, clunky sidebars.
- **Live Vitals Telemetry:** Real-time data visualization of resting heart rate, SpO2, and respiratory rate.
- **Dynamic Dietitian Protocol:** An AI-generated, daily nutrition plan based explicitly on the user's overnight recovery and strain metrics.
- **Clinical Health Summary (EMR):** Generates beautiful, doctor-ready PDF summaries of the user's weekly health trends.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have Node.js (v18+) and npm installed.

### 1. Clone & Install Dependencies

```bash
cd Frontend
npm install
```
