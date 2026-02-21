import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, #ffffff 0%, #f1f5f9 100%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-500" />
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Helix</h1>
          </div>
          <p className="text-sm text-slate-400">Your unified health partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Username "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />
          <Button type="submit" className="h-12 w-full rounded-xl bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700">
            Log In
          </Button>
        </form>

        <Link to="/signup" className="mt-6 block text-center text-sm text-slate-400">
          Don't have an account? <span className="font-medium text-indigo-500 hover:text-indigo-600">Sign Up</span>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Login;
