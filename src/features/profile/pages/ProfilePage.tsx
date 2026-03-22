import * as React from "react";
import { motion } from "motion/react";
import { User, Mail, Sparkles, LogOut, Pencil, Plus, X, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS, GLOWS } from "@/shared/theme";
import { toast } from "sonner";
import {
  RawExplicitAPI,
  PreferencesAPI,
  type RawExplicit,
  type Preference,
  type PreferenceCreate,
} from "@/api";

const FINANCIAL_FIELDS: { key: keyof RawExplicit; label: string }[] = [
  { key: "life_stage", label: "Life Stage" },
  { key: "household_size", label: "Household Size" },
  { key: "location_zip", label: "Location (ZIP)" },
  { key: "income_range", label: "Income Range" },
  { key: "monthly_fixed_expenses", label: "Monthly Fixed Expenses" },
  { key: "financial_goal", label: "Financial Goal" },
  { key: "risk_tolerance", label: "Risk Tolerance" },
  { key: "budget_style", label: "Budget Style" },
  { key: "value_priority_cost", label: "Value: Cost" },
  { key: "value_priority_quality", label: "Value: Quality" },
  { key: "value_priority_sustainability", label: "Value: Sustainability" },
  { key: "self_report_research_habit", label: "Research Habit" },
];

const VALUE_TYPES: Preference["value_type"][] = ["bool", "int", "float", "string", "json"];

function FinancialEditForm({
  data,
  onSave,
  onCancel,
}: {
  data: RawExplicit;
  onSave: (d: RawExplicit) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = React.useState<Partial<RawExplicit>>(data);
  const [submitting, setSubmitting] = React.useState(false);

  const set = <K extends keyof RawExplicit>(key: K, val: RawExplicit[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await RawExplicitAPI.patch(data.id, form);
      onSave(updated);
      toast.success("Financial profile updated.");
    } catch {
      toast.error("Failed to update.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {FINANCIAL_FIELDS.map(({ key, label }) => {
          const isNum =
            key === "household_size" ||
            key === "monthly_fixed_expenses" ||
            key === "self_report_research_habit" ||
            key.startsWith("value_priority");
          return (
            <div key={key} className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-gray-500">{label}</Label>
              <Input
                value={form[key] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  set(key, (isNum ? (v === "" ? null : Number(v)) : v) as RawExplicit[typeof key]);
                }}
                type={isNum ? "number" : "text"}
                className="bg-white/5 border-white/10 text-white h-10 rounded-xl"
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="rounded-xl" style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}>
          {submitting ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl border-white/10">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PreferenceAddForm({
  form,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: PreferenceCreate;
  onChange: (f: PreferenceCreate) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const parseValue = (raw: string, type: Preference["value_type"]): string | number | boolean | object => {
    if (type === "bool") return raw.toLowerCase() === "true" || raw === "1";
    if (type === "int") return parseInt(raw, 10) || 0;
    if (type === "float") return parseFloat(raw) || 0;
    if (type === "json") {
      try {
        return JSON.parse(raw) as object;
      } catch {
        return raw;
      }
    }
    return raw;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-gray-500">Key</Label>
        <Input
          value={form.key}
          onChange={(e) => onChange({ ...form, key: e.target.value })}
          placeholder="e.g. theme"
          className="bg-[#0B1220] border-white/10 text-white h-10 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-gray-500">Value type</Label>
        <select
          value={form.value_type}
          onChange={(e) => onChange({ ...form, value_type: e.target.value as Preference["value_type"] })}
          className="w-full bg-[#0B1220] border border-white/10 rounded-xl py-2.5 px-4 text-white font-bold"
        >
          {VALUE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase text-gray-500">Value</Label>
        <Input
          value={typeof form.value === "object" ? JSON.stringify(form.value) : String(form.value)}
          onChange={(e) => onChange({ ...form, value: parseValue(e.target.value, form.value_type) })}
          placeholder={form.value_type === "json" ? '{"key": "value"}' : "Value"}
          className="bg-[#0B1220] border-white/10 text-white h-10 rounded-xl"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="rounded-xl" style={{ backgroundColor: COLORS.electricCyan, color: COLORS.bgPrimary }}>
          Add
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl border-white/10">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState(user?.name ?? "");
  const [tier, setTier] = React.useState(user?.tier ?? "Intentional Tier");
  const [saving, setSaving] = React.useState(false);

  const [rawExplicit, setRawExplicit] = React.useState<RawExplicit[]>([]);
  const [preferences, setPreferences] = React.useState<Preference[]>([]);
  const [financialLoading, setFinancialLoading] = React.useState(true);
  const [prefsLoading, setPrefsLoading] = React.useState(true);
  const [editingFinancial, setEditingFinancial] = React.useState<RawExplicit | null>(null);
  const [addingPref, setAddingPref] = React.useState(false);
  const [newPref, setNewPref] = React.useState<PreferenceCreate>({
    key: "",
    value: "",
    value_type: "string",
  });

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setTier(user.tier ?? "Intentional Tier");
    }
  }, [user]);

  React.useEffect(() => {
    let cancelled = false;
    RawExplicitAPI.list()
      .then((data) => { if (!cancelled) setRawExplicit(data); })
      .catch(() => { if (!cancelled) toast.error("Failed to load financial profile."); })
      .finally(() => { if (!cancelled) setFinancialLoading(false); });
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    PreferencesAPI.list()
      .then((data) => { if (!cancelled) setPreferences(data); })
      .catch(() => { if (!cancelled) toast.error("Failed to load preferences."); })
      .finally(() => { if (!cancelled) setPrefsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await updateProfile({ name: name.trim(), tier: tier.trim() || undefined });
      if (result.ok) {
        toast.success("Profile updated");
      } else {
        toast.error(result.error ?? "Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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

          {/* Financial Profile */}
          <div className="pt-8 border-t border-white/10">
            <h3 className="text-lg font-black text-white mb-4 flex items-center justify-between">
              Financial Profile
              {!financialLoading && rawExplicit.length > 0 && !editingFinancial && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingFinancial(rawExplicit[0])}
                  className="text-cyan-400 hover:text-cyan-300 gap-1"
                >
                  <Pencil size={14} /> Edit
                </Button>
              )}
            </h3>
            {financialLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading…
              </div>
            )}
            {!financialLoading && rawExplicit.length === 0 && (
              <p className="text-gray-500 text-sm">Complete onboarding to set your financial profile.</p>
            )}
            {!financialLoading && rawExplicit.length > 0 && !editingFinancial && (
              <div className="grid grid-cols-2 gap-4">
                {FINANCIAL_FIELDS.map(({ key, label }) => {
                  const val = rawExplicit[0][key];
                  return (
                    <div key={key} className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</div>
                      <div className="text-sm font-bold text-white">
                        {val == null || val === "" ? "—" : String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {editingFinancial && (
              <FinancialEditForm
                data={editingFinancial}
                onSave={(updated) => {
                  setRawExplicit((prev) => (prev[0]?.id === updated.id ? [updated, ...prev.slice(1)] : [updated]));
                  setEditingFinancial(null);
                }}
                onCancel={() => setEditingFinancial(null)}
              />
            )}
          </div>

          {/* Preferences */}
          <div className="pt-8 border-t border-white/10">
            <h3 className="text-lg font-black text-white mb-4 flex items-center justify-between">
              Preferences
              {!prefsLoading && !addingPref && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingPref(true)}
                  className="text-cyan-400 hover:text-cyan-300 gap-1"
                >
                  <Plus size={14} /> Add
                </Button>
              )}
            </h3>
            {prefsLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading…
              </div>
            )}
            {!prefsLoading && preferences.length === 0 && !addingPref && (
              <p className="text-gray-500 text-sm">No preferences yet.</p>
            )}
            {!prefsLoading && preferences.length > 0 && (
              <div className="space-y-2 mb-4">
                {preferences.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black uppercase text-gray-500">{p.key}</span>
                      <span className="text-sm font-bold text-white">
                        {typeof p.value === "object" ? JSON.stringify(p.value) : String(p.value)}
                      </span>
                      <span className="text-[10px] text-gray-600">({p.value_type})</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await PreferencesAPI.remove(p.id);
                          setPreferences((prev) => prev.filter((x) => x.id !== p.id));
                          toast.success("Preference removed.");
                        } catch {
                          toast.error("Failed to remove preference.");
                        }
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {addingPref && (
              <PreferenceAddForm
                form={newPref}
                onChange={setNewPref}
                onSubmit={async () => {
                  if (!newPref.key.trim()) {
                    toast.error("Key is required.");
                    return;
                  }
                  try {
                    const created = await PreferencesAPI.create(newPref);
                    setPreferences((prev) => [...prev, created]);
                    setNewPref({ key: "", value: "", value_type: "string" });
                    setAddingPref(false);
                    toast.success("Preference added.");
                  } catch {
                    toast.error("Failed to add preference.");
                  }
                }}
                onCancel={() => {
                  setAddingPref(false);
                  setNewPref({ key: "", value: "", value_type: "string" });
                }}
              />
            )}
          </div>

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
