import * as React from "react";
import { motion } from "motion/react";
import { User, Mail, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS, GLOWS } from "@/shared/theme";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState(user?.name ?? "");
  const [tier, setTier] = React.useState(user?.tier ?? "Intentional Tier");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setTier(user.tier ?? "Intentional Tier");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateProfile({ name: name.trim(), tier: tier.trim() || undefined });
    setSaving(false);
    toast.success("Profile updated");
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Profile</h1>
      </div>

      <div
        className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl"
        style={{ backgroundColor: COLORS.bgCard, boxShadow: GLOWS.ambient() }}
      >
        <div
          className="h-28 flex items-end px-8 pb-6"
          style={{
            background: `linear-gradient(135deg, ${COLORS.electricCyan}22, ${COLORS.electricPurple}22)`,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white border-2 border-white/20 shadow-xl"
            style={{
              background: `linear-gradient(to bottom right, ${COLORS.electricCyan}, ${COLORS.electricBlue})`,
              boxShadow: GLOWS.soft(COLORS.electricCyan),
            }}
          >
            {initials}
          </div>
        </div>

        <div className="p-8 space-y-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Full name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Email
              </Label>
              <Input
                value={user.email}
                disabled
                className="bg-white/5 border-white/10 text-gray-500 h-12 rounded-xl cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Tier
              </Label>
              <Input
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                placeholder="Intentional Tier"
              />
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl font-bold uppercase tracking-wider"
              style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>

          <div className="pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-xl border-white/10 text-gray-400 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
