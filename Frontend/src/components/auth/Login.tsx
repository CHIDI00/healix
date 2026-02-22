import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import logo from "../../asset/healixlogo.png";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}auth`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid username or password");
      }

      localStorage.setItem("healix_token", data.token);
      localStorage.setItem(
        "healix_user",
        JSON.stringify({
          id: data.user_id,
          username: data.username,
          email: data.email,
        }),
      );

      onLogin();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
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
            <img src={logo} alt="Healix logo" className="w-6 h-auto" />
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Helix</h1>
          </div>
          <p className="text-sm text-slate-400">Your unified health partner.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-10 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
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
