import { useState } from "react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [spikeActive, setSpikeActive] = useState(false);

  return (
    <motion.div
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: spikeActive ? "#fff1f2" : "#FAFAFA" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    ></motion.div>
  );
};

export default Dashboard;
