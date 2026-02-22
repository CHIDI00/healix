import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
}

interface SignupProps {
  onSignup: (data: FormData) => void;
}

const Signup = ({ onSignup }: SignupProps) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(formData);
  };

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center py-10"
      style={{
        background: "radial-gradient(ellipse at center, #ffffff 0%, #f1f5f9 100%)",
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
            <Sparkles className="h-7 w-7 text-indigo-500" />
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Helix</h1>
          </div>
          <p className="text-sm text-slate-400">Join your unified health partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
            <Input
              type="text"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
              required
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
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />

          <Input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />

          <Input
            type="password"
            name="password2"
            placeholder="Confirm password"
            value={formData.password2}
            onChange={handleChange}
            required
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
          />

          <Button type="submit" className="mt-2 h-12 w-full rounded-xl bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700">
            Create Account
          </Button>
        </form>

        <Link to="/login" className="mt-6 block text-center text-sm text-slate-400">
          Already have an account? <span className="font-medium text-indigo-500 hover:text-indigo-600">Log In</span>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
