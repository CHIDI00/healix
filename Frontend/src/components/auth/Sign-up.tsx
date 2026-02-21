import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../asset/healixlogo.png";

interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  const apiBaseUrl = (
    configuredApiBaseUrl || "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");
  const API_BASE_URL = `${apiBaseUrl}/auth`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        if (!data || typeof data !== "object") {
          throw new Error(`Registration failed (HTTP ${response.status})`);
        }

        const firstErrorKey = Object.keys(data)[0];
        const errorMessage = Array.isArray(data[firstErrorKey])
          ? data[firstErrorKey][0]
          : "Registration failed. Please check your details.";

        throw new Error(`${firstErrorKey}: ${errorMessage}`);
      }

      navigate("/login");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage.replace("_", " "));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center py-10"
      style={{
        background:
          "radial-gradient(ellipse at center, #ffffff 0%, #f1f5f9 100%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <img src={logo} alt="Healix logo" className="w-6 h-auto" />
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
              Helix
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Join your unified health partner.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-rose-50 p-4 text-sm capitalize text-rose-600 border border-rose-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isLoading}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
            <Input
              type="text"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isLoading}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
          </div>

          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />

          <Input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="password2"
              placeholder="Confirm password"
              value={formData.password2}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-10 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="mt-2 h-12 w-full rounded-xl bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
          >
            Create Account
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-6 block text-center text-sm text-slate-400"
        >
          Already have an account?{" "}
          <span className="font-medium text-indigo-500 hover:text-indigo-600">
            Log In
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
