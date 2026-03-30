import * as React from "react";
import { motion } from "motion/react";
import { User, Mail, Sparkles, LogOut, Pencil, Plus, X, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { MfaEnrollmentCard } from "@/features/auth/components/MfaEnrollmentCard";
import { PrivacyPolicyLink, PrivacyPolicyMetaLine } from "@/shared/components/PrivacyPolicyLink";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/features/auth";
import {
  PreferencesAPI,
  RawExplicitAPI,
  type Preference,
  type PreferenceCreate,
  type RawExplicit,
} from "@/api";
import { COLORS, GLOWS } from "@/shared/theme";
import {
  AppButton,
  AppInput,
  AppSelect,
  EmptyState,
  FormField,
  LoadingState,
  SectionHeader,
  StatusChip,
  Surface,
} from "@/shared/components/system";

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

function parsePreferenceValue(raw: string, type: Preference["value_type"]): string | number | boolean | object {
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
}

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FINANCIAL_FIELDS.map(({ key, label }) => {
          const isNum =
            key === "household_size" ||
            key === "monthly_fixed_expenses" ||
            key === "self_report_research_habit" ||
            key.startsWith("value_priority");

          return (
            <FormField key={key} label={label}>
              <AppInput
                value={form[key] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  set(key, (isNum ? (v === "" ? null : Number(v)) : v) as RawExplicit[typeof key]);
                }}
                type={isNum ? "number" : "text"}
              />
            </FormField>
          );
        })}
      </div>
      <div className="flex gap-2">
        <AppButton type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </AppButton>
        <AppButton type="button" variant="outline" onClick={onCancel}>
          Cancel
        </AppButton>
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

  return (
    <Surface variant="inset" padding="md" className="rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Key">
          <AppInput
            value={form.key}
            onChange={(e) => onChange({ ...form, key: e.target.value })}
            placeholder="e.g. theme"
          />
        </FormField>
        <FormField label="Value type">
          <AppSelect
            value={form.value_type}
            onValueChange={(value) => onChange({ ...form, value_type: value as Preference["value_type"] })}
            options={VALUE_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </FormField>
        <FormField label="Value">
          <AppInput
            value={typeof form.value === "object" ? JSON.stringify(form.value) : String(form.value)}
            onChange={(e) => onChange({ ...form, value: parsePreferenceValue(e.target.value, form.value_type) })}
            placeholder={form.value_type === "json" ? '{"key": "value"}' : "Value"}
          />
        </FormField>
        <div className="flex gap-2">
          <AppButton type="submit">Add</AppButton>
          <AppButton type="button" variant="outline" onClick={onCancel}>
            Cancel
          </AppButton>
        </div>
      </form>
    </Surface>
  );
}

const FinancialProfileSection = React.memo(function FinancialProfileSection({
  financialLoading,
  rawExplicit,
  editingFinancial,
  onStartEdit,
  onSave,
  onCancel,
}: {
  financialLoading: boolean;
  rawExplicit: RawExplicit[];
  editingFinancial: RawExplicit | null;
  onStartEdit: () => void;
  onSave: (updated: RawExplicit) => void;
  onCancel: () => void;
}) {
  return (
    <section className="space-y-4 border-t border-[var(--app-color-border-subtle)] pt-8">
      <div className="flex items-center justify-between">
        <h3 className="app-card-title">Financial Profile</h3>
        {!financialLoading && rawExplicit.length > 0 && !editingFinancial && (
          <AppButton type="button" variant="quietAccent" size="sm" onClick={onStartEdit} className="gap-1">
            <Pencil size={14} />
            Edit
          </AppButton>
        )}
      </div>
      {financialLoading && (
        <LoadingState label="Loading financial profile..." lines={2} compact />
      )}
      {!financialLoading && rawExplicit.length === 0 && (
        <EmptyState title="No financial profile yet" description="Complete onboarding to set your financial profile." />
      )}
      {!financialLoading && rawExplicit.length > 0 && !editingFinancial && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FINANCIAL_FIELDS.map(({ key, label }) => {
            const val = rawExplicit[0][key];
            return (
              <Surface key={key} variant="inset" padding="sm" className="space-y-1 rounded-xl">
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--app-color-text-tertiary)]">{label}</div>
                <div className="text-sm font-bold text-[var(--app-color-text-primary)]">
                  {val == null || val === "" ? "—" : String(val)}
                </div>
              </Surface>
            );
          })}
        </div>
      )}
      {editingFinancial ? <FinancialEditForm data={editingFinancial} onSave={onSave} onCancel={onCancel} /> : null}
    </section>
  );
});

const PreferencesSection = React.memo(function PreferencesSection({
  prefsLoading,
  preferences,
  addingPref,
  newPref,
  onStartAdd,
  onChangePref,
  onSubmitPref,
  onCancelAdd,
  onRemovePref,
}: {
  prefsLoading: boolean;
  preferences: Preference[];
  addingPref: boolean;
  newPref: PreferenceCreate;
  onStartAdd: () => void;
  onChangePref: (value: PreferenceCreate) => void;
  onSubmitPref: () => void;
  onCancelAdd: () => void;
  onRemovePref: (id: number) => Promise<void>;
}) {
  return (
    <section className="space-y-4 border-t border-[var(--app-color-border-subtle)] pt-8">
      <div className="flex items-center justify-between">
        <h3 className="app-card-title">Preferences</h3>
        {!prefsLoading && !addingPref && (
          <AppButton type="button" variant="quietAccent" size="sm" onClick={onStartAdd} className="gap-1">
            <Plus size={14} />
            Add
          </AppButton>
        )}
      </div>
      {prefsLoading && (
        <LoadingState label="Loading preferences..." lines={2} compact />
      )}
      {!prefsLoading && preferences.length === 0 && !addingPref && (
        <EmptyState title="No preferences yet." description="Add preference keys to store UI or behavior settings." />
      )}
      {!prefsLoading && preferences.length > 0 && (
        <div className="mb-4 space-y-2">
          {preferences.map((p) => (
            <Surface key={p.id} variant="inset" padding="sm" className="flex items-center justify-between rounded-xl">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase text-[var(--app-color-text-tertiary)]">{p.key}</span>
                <span className="text-sm font-bold text-[var(--app-color-text-primary)]">
                  {typeof p.value === "object" ? JSON.stringify(p.value) : String(p.value)}
                </span>
                <StatusChip tone="neutral">{p.value_type}</StatusChip>
              </div>
              <AppButton
                type="button"
                onClick={() => void onRemovePref(p.id)}
                variant="quietDanger"
                size="sm"
                className="h-8 w-8 rounded-lg px-0"
              >
                <X size={14} />
              </AppButton>
            </Surface>
          ))}
        </div>
      )}
      {addingPref ? (
        <PreferenceAddForm form={newPref} onChange={onChangePref} onSubmit={onSubmitPref} onCancel={onCancelAdd} />
      ) : null}
    </section>
  );
});

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState(user?.name ?? "");
  const [tier, setTier] = React.useState(user?.tier ?? "");
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
      setTier(user.tier ?? "");
    }
  }, [user]);

  React.useEffect(() => {
    let cancelled = false;
    RawExplicitAPI.list()
      .then((data) => {
        if (!cancelled) setRawExplicit(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load financial profile.");
      })
      .finally(() => {
        if (!cancelled) setFinancialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    PreferencesAPI.list()
      .then((data) => {
        if (!cancelled) setPreferences(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load preferences.");
      })
      .finally(() => {
        if (!cancelled) setPrefsLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  const handleFinancialSave = React.useCallback((updated: RawExplicit) => {
    setRawExplicit((prev) => (prev[0]?.id === updated.id ? [updated, ...prev.slice(1)] : [updated]));
    setEditingFinancial(null);
  }, []);

  const handleRemovePreference = React.useCallback(async (id: number) => {
    try {
      await PreferencesAPI.remove(id);
      setPreferences((prev) => prev.filter((x) => x.id !== id));
      toast.success("Preference removed.");
    } catch {
      toast.error("Failed to remove preference.");
    }
  }, []);

  const handleSubmitPreference = React.useCallback(async () => {
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
  }, [newPref]);

  const handleCancelPreference = React.useCallback(() => {
    setAddingPref(false);
    setNewPref({ key: "", value: "", value_type: "string" });
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="mx-auto max-w-4xl space-y-8"
    >
      <SectionHeader
        eyebrow="Account"
        title="Profile"
        titleClassName="app-page-title"
        description="Manage your identity, saved financial context, and preference keys."
      />

      <Surface
        variant="panel"
        padding="none"
        className="overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl"
        style={{ backgroundColor: COLORS.bgCard, boxShadow: GLOWS.ambient() }}
      >
        <div
          className="flex h-28 items-end px-8 pb-6"
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--app-accent-cyan-soft) 12%, transparent), color-mix(in srgb, var(--app-accent-purple-soft) 14%, transparent))",
            borderBottom: "1px solid var(--app-color-border-subtle)",
          }}
        >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-[color:color-mix(in_srgb,var(--app-color-text-inverse)_20%,transparent)] text-2xl font-black text-[var(--app-color-text-inverse)] shadow-xl"
              style={{
                background: `linear-gradient(to bottom right, ${COLORS.electricCyan}, ${COLORS.electricBlue})`,
                boxShadow: GLOWS.soft(COLORS.electricCyan),
            }}
          >
            {initials}
          </div>
        </div>

        <div className="space-y-8 p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <FormField
              label={
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Full name
                </span>
              }
            >
              <AppInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </FormField>
            <FormField
              label={
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </span>
              }
              helperText="Email cannot be changed."
            >
              <AppInput value={user.email} disabled className="cursor-not-allowed text-[var(--app-color-text-tertiary)]" />
            </FormField>
            <FormField
              label={
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tier
                </span>
              }
            >
              <AppInput value={tier} onChange={(e) => setTier(e.target.value)} placeholder="Optional" />
            </FormField>
            <AppButton type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </AppButton>
          </form>

          <MfaEnrollmentCard />

          <div className="pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-1">Legal</p>
            <PrivacyPolicyMetaLine className="mb-2" />
            <PrivacyPolicyLink className="text-cyan-400 text-sm font-bold" />
          </div>

          <FinancialProfileSection
            financialLoading={financialLoading}
            rawExplicit={rawExplicit}
            editingFinancial={editingFinancial}
            onStartEdit={() => setEditingFinancial(rawExplicit[0] ?? null)}
            onSave={handleFinancialSave}
            onCancel={() => setEditingFinancial(null)}
          />

          <PreferencesSection
            prefsLoading={prefsLoading}
            preferences={preferences}
            addingPref={addingPref}
            newPref={newPref}
            onStartAdd={() => setAddingPref(true)}
            onChangePref={setNewPref}
            onSubmitPref={handleSubmitPreference}
            onCancelAdd={handleCancelPreference}
            onRemovePref={handleRemovePreference}
          />

          <div className="border-t border-[var(--app-color-border-subtle)] pt-6">
            <AppButton
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 text-[var(--app-color-text-secondary)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </AppButton>
          </div>
        </div>
      </Surface>
    </motion.div>
  );
}
