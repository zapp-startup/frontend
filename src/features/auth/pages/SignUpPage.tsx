import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS, GLOWS } from "@/shared/theme";
import { toast } from "sonner";

export function SignUpPage() {
  const { signUp, isAuthenticated, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthReady && isAuthenticated) navigate("/", { replace: true });
  }, [isAuthReady, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signUp({ name, email, password, confirmPassword });
    setLoading(false);
    if (result.ok) {
      toast.success("Account created. Welcome to Zapp!");
      navigate("/", { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
          style={{ backgroundColor: COLORS.bgCard, boxShadow: GLOWS.ambient() }}
        >
          <div className="flex justify-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: COLORS.electricCyan + "20", boxShadow: GLOWS.soft(COLORS.electricCyan) }}
            >
              <Zap className="w-7 h-7" style={{ color: COLORS.electricCyan }} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center text-white uppercase tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Enter your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Full name
              </Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm" className="text-gray-300 text-xs font-bold uppercase tracking-wider">
                Confirm password
              </Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-sm"
              style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
            >
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="font-semibold transition-colors hover:opacity-90"
              style={{ color: COLORS.electricCyan }}
            >
              Sign in
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
