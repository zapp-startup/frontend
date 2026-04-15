import * as React from "react";
import { motion } from "motion/react";
import { Loader2, Music, RefreshCw, Unplug, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { COLORS, GLOWS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";
import { useSpotifyIntegration } from "../hooks/useSpotifyIntegration";

function formatSynced(iso?: string | null) {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function SpotifyIntegrationSection() {
  const { status, insights, loading, actionLoading, error, connect, sync, disconnect, reload } =
    useSpotifyIntegration();

  const connected = status?.connected === true;
  const syncState = (status?.sync_status ?? "idle").toLowerCase();
  const syncing = syncState === "syncing" || syncState === "pending";
  const needsReconnect =
    status?.requires_reconnect === true ||
    syncState === "reconnect_required" ||
    status?.health === "error";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-white/10 bg-[#101A2E]/80 p-8 shadow-2xl"
      style={{ boxShadow: GLOWS.ambient(0.35) }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10"
            style={{
              background: `linear-gradient(135deg, #1DB95433, ${COLORS.electricGreen}22)`,
              boxShadow: GLOWS.soft("#1DB954"),
            }}
          >
            <Music className="h-7 w-7 text-[#1DB954]" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white">Spotify</h3>
            <p className="mt-1 max-w-xl text-sm font-medium text-gray-500">
              Connect Spotify to enrich subscription intelligence with listening activity (no in-app player). OAuth is
              handled securely by our servers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {!connected && (
            <Button
              type="button"
              disabled={loading || actionLoading}
              onClick={() => void connect()}
              className="rounded-2xl bg-[#1DB954] font-black uppercase tracking-widest text-[#0B1220] hover:bg-[#1ed760]"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Spotify"}
            </Button>
          )}
          {connected && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={actionLoading || syncing}
                onClick={() => void sync()}
                className="rounded-2xl border-white/15"
              >
                {syncing || actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sync now
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={actionLoading}
                onClick={() => void disconnect()}
                className="rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Unplug className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          Checking Spotify connection…
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" className="border-white/20" onClick={() => void reload()}>
            Retry
          </Button>
        </div>
      )}

      {connected && status && !loading && (
        <div className="mt-6 grid gap-4 border-t border-white/5 pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Account</p>
            <p className="text-lg font-black text-white">{status.display_name ?? "Spotify account"}</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              {status.country && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{status.country}</span>
              )}
              {status.product && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{status.product}</span>
              )}
            </div>
            {status.scopes && status.scopes.length > 0 && (
              <p className="text-[10px] leading-relaxed text-gray-600">
                Scopes: {status.scopes.slice(0, 6).join(", ")}
                {status.scopes.length > 6 ? "…" : ""}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sync</p>
            <p className="text-sm text-gray-300">
              Last synced: <span className="font-bold text-white">{formatSynced(status.last_synced_at)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
                  needsReconnect && "border-red-500/40 bg-red-500/10 text-red-300",
                  !needsReconnect && status.health === "warning" && "border-amber-500/40 bg-amber-500/10 text-amber-200",
                  !needsReconnect && (status.health === "ok" || !status.health) && "border-emerald-500/30 text-emerald-300"
                )}
              >
                {needsReconnect ? (
                  <>
                    <AlertTriangle className="h-3 w-3" /> Reconnect required
                  </>
                ) : syncing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Syncing
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> {status.sync_status ?? "idle"}
                  </>
                )}
              </span>
              {status.message && <span className="text-xs text-gray-500">{status.message}</span>}
            </div>
          </div>
        </div>
      )}

      {connected && insights && (insights.active_listening_days != null || insights.summary) && (
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400/90">Spotify insights</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {insights.active_listening_days != null && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Active days</p>
                <p className="text-2xl font-black text-white">{insights.active_listening_days}</p>
              </div>
            )}
            {insights.recent_usage_trend && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Recent trend</p>
                <p className="text-lg font-black capitalize text-white">{String(insights.recent_usage_trend)}</p>
              </div>
            )}
            {insights.estimated_utilization != null && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Est. utilization</p>
                <p className="text-2xl font-black text-white">
                  {typeof insights.estimated_utilization === "number"
                    ? `${Math.round(insights.estimated_utilization * 100)}%`
                    : insights.estimated_utilization}
                </p>
              </div>
            )}
            {insights.cost_per_active_day != null && (
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500">Cost / active day</p>
                <p className="text-2xl font-black text-white">
                  ${Number(insights.cost_per_active_day).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          {insights.summary && <p className="mt-3 text-sm text-gray-400">{insights.summary}</p>}
        </div>
      )}
    </motion.section>
  );
}
