import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Login from "@/components/auth/Login";
import Dashboard from "./Dashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!isLoggedIn ? <Login key="auth" onLogin={() => setIsLoggedIn(true)} /> : <Dashboard key="dashboard" />}
    </AnimatePresence>
  );
};

export default Index;
