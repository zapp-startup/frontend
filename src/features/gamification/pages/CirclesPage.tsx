import * as React from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  LogOut,
  Plus,
  Shield,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { GamificationAPI, type Group, type GroupInvite, type GroupMember, type LeaderboardResponse } from "@/api/gamification.api";
import { useAuth } from "@/features/auth";
import { ElectricCard } from "@/features/home/components/ElectricCard";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { COLORS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";
import { toast } from "sonner";

export function CirclesPage() {
  const { backendUser } = useAuth();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = React.useState<number | null>(null);
  const [members, setMembers] = React.useState<GroupMember[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardResponse | null>(null);
  const [invites, setInvites] = React.useState<GroupInvite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(7);
  const [page, setPage] = React.useState(1);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isJoinOpen, setIsJoinOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const selectedGroupRequestRef = React.useRef(0);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const isAdmin = members.some((member) => member.user === backendUser?.id && member.role === "admin");

  const loadBaseData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [groupResult, inviteResult] = await Promise.allSettled([
        GamificationAPI.getGroups(),
        GamificationAPI.getGroupInvites(),
      ]);
      const groupData = groupResult.status === "fulfilled" ? groupResult.value : [];
      const inviteData = inviteResult.status === "fulfilled" ? inviteResult.value : [];

      if (groupResult.status !== "fulfilled") {
        throw groupResult.reason;
      }

      if (inviteResult.status !== "fulfilled") {
        console.error(inviteResult.reason);
        toast.error("Group invites are unavailable right now.");
      }

      setGroups(groupData);
      setInvites(inviteData.filter((invite) => invite.status === "pending"));
      setSelectedGroupId((current) => (
        current && groupData.some((group) => group.id === current)
          ? current
          : (groupData[0]?.id ?? null)
      ));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load circles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSelectedGroup = React.useCallback(async () => {
    if (!selectedGroupId) {
      setMembers([]);
      setLeaderboard(null);
      return;
    }

    const requestId = selectedGroupRequestRef.current + 1;
    selectedGroupRequestRef.current = requestId;

    try {
      const [memberData, leaderboardData] = await Promise.all([
        GamificationAPI.getGroupMembers(selectedGroupId),
        GamificationAPI.getLeaderboard(selectedGroupId, days, page, 10),
      ]);

      if (selectedGroupRequestRef.current !== requestId) {
        return;
      }

      setMembers(memberData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      if (selectedGroupRequestRef.current !== requestId) {
        return;
      }
      console.error(error);
      toast.error("Failed to load circle details.");
    }
  }, [days, page, selectedGroupId]);

  React.useEffect(() => {
    void loadBaseData();
  }, [loadBaseData]);

  React.useEffect(() => {
    void loadSelectedGroup();
  }, [loadSelectedGroup]);

  const handleCreate = async (name: string, isPrivate: boolean) => {
    try {
      const created = await GamificationAPI.createGroup({ name, is_private: isPrivate });
      toast.success("Circle created.");
      setIsCreateOpen(false);
      await loadBaseData();
      setSelectedGroupId(created.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create circle.");
    }
  };

  const handleJoin = async (inviteCode: string) => {
    try {
      await GamificationAPI.joinGroup(inviteCode);
      toast.success("Joined circle.");
      setIsJoinOpen(false);
      await loadBaseData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to join circle.");
      throw error;
    }
  };

  const handleLeave = async () => {
    if (!selectedGroup) return;
    try {
      await GamificationAPI.leaveGroup(selectedGroup.id);
      toast.success("Left circle.");
      await loadBaseData();
      setPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to leave circle.");
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      await GamificationAPI.acceptInvite(inviteId);
      toast.success("Invite accepted.");
      await loadBaseData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept invite.");
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      await GamificationAPI.declineInvite(inviteId);
      toast.success("Invite declined.");
      await loadBaseData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to decline invite.");
    }
  };

  const handlePromote = async (membershipId: number) => {
    if (!selectedGroup) return;
    try {
      await GamificationAPI.updateMemberRole(selectedGroup.id, membershipId, "admin");
      toast.success("Member promoted.");
      await loadSelectedGroup();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update role.");
    }
  };

  const handleRemoveMember = async (membershipId: number) => {
    if (!selectedGroup) return;
    try {
      await GamificationAPI.removeMember(selectedGroup.id, membershipId);
      toast.success("Member removed.");
      await loadSelectedGroup();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove member.");
    }
  };

  const copyInviteCode = async () => {
    if (!selectedGroup?.invite_code) return;
    try {
      await navigator.clipboard.writeText(selectedGroup.invite_code);
      setCopied(true);
      toast.success("Invite code copied.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy invite code.");
    }
  };

  return (
    <div className="space-y-10 pb-32">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white">Circles</h1>
          <p className="mt-2 text-lg font-medium text-gray-500">
            Rolling leaderboards for accountability, streaks, and better spending habits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsJoinOpen(true)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            <UserPlus size={16} />
            Join
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400"
          >
            <Plus size={16} />
            Create
          </Button>
        </div>
      </div>

      {invites.length > 0 && (
        <ElectricCard semanticColor={COLORS.electricYellow} elevation={1} className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-yellow-400" />
            <h2 className="text-lg font-black text-white">Pending Invites</h2>
          </div>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between rounded-[1.6rem] border border-white/[0.05] bg-white/[0.02] p-4">
                <div>
                  <div className="font-black text-white">
                    {invite.group_name ?? `Circle #${invite.group}`}
                  </div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                    {invite.inviter_username ?? "Pending invite"} {invite.note ? `• ${invite.note}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleAcceptInvite(invite.id)} className="rounded-2xl bg-green-500/20 text-green-300 hover:bg-green-500/30">
                    Accept
                  </Button>
                  <Button onClick={() => handleDeclineInvite(invite.id)} variant="outline" className="rounded-2xl border-white/10">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ElectricCard>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">My Circles</div>
          {loading && (
            <ElectricCard elevation={0}>
              <div className="py-12 text-center text-xs font-black uppercase tracking-[0.3em] text-gray-600">
                Loading circles...
              </div>
            </ElectricCard>
          )}
          {!loading && groups.length === 0 && (
            <ElectricCard elevation={0}>
              <div className="py-12 text-center">
                <Users size={36} className="mx-auto mb-4 text-gray-700" />
                <div className="font-bold text-gray-400">No circles yet.</div>
              </div>
            </ElectricCard>
          )}
          {groups.map((group) => (
            <motion.button
              key={group.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setSelectedGroupId(group.id);
                setPage(1);
              }}
              className={cn(
                "w-full rounded-[2rem] border p-5 text-left transition-all",
                selectedGroupId === group.id
                  ? "border-cyan-500/40 bg-cyan-500/8"
                  : "border-white/[0.05] bg-[#101A2E] hover:border-white/10",
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">{group.name}</h3>
                {selectedGroupId === group.id && <div className="h-2 w-2 rounded-full bg-cyan-400" />}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                {group.member_count} members • {group.is_private ? "private" : "public"}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="space-y-8 lg:col-span-8">
          {!selectedGroup && (
            <ElectricCard elevation={0}>
              <div className="py-20 text-center">
                <Users size={52} className="mx-auto mb-5 text-gray-700" />
                <h2 className="text-2xl font-black text-white">Pick a circle</h2>
                <p className="mt-2 text-gray-500">Select a circle or create a new one to view rankings and members.</p>
              </div>
            </ElectricCard>
          )}

          {selectedGroup && (
            <>
              <ElectricCard semanticColor={COLORS.electricCyan} elevation={2} className="p-8">
                <div className="mb-6 flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedGroup.name}</h2>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                      {selectedGroup.member_count} members
                    </div>
                  </div>
                  <Button
                    onClick={handleLeave}
                    variant="outline"
                    className="rounded-2xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Leave
                  </Button>
                </div>

                <div className="rounded-[1.8rem] border border-white/[0.05] bg-white/[0.02] p-5">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">
                    Invite Code
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-lg font-black text-cyan-300">{selectedGroup.invite_code}</code>
                    <Button onClick={copyInviteCode} className="rounded-2xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
              </ElectricCard>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                    <Trophy size={20} className="text-yellow-400" />
                    Weekly Leaderboard
                  </h2>
                  <div className="flex gap-2">
                    {[7, 30, 90].map((window) => (
                      <button
                        key={window}
                        onClick={() => {
                          setDays(window);
                          setPage(1);
                        }}
                        className={cn(
                          "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-all",
                          days === window
                            ? "bg-cyan-500 text-[#0B1220]"
                            : "bg-white/[0.05] text-gray-500 hover:bg-white/[0.1] hover:text-white",
                        )}
                      >
                        {window}d
                      </button>
                    ))}
                  </div>
                </div>

                <ElectricCard elevation={1} className="overflow-hidden p-0">
                  {leaderboard?.results.length ? (
                    <div className="divide-y divide-white/[0.05]">
                      {leaderboard.results.map((entry, index) => (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className={cn(
                            "flex items-center gap-5 px-6 py-5",
                            entry.rank === leaderboard.current_user_rank && "bg-cyan-500/6",
                          )}
                        >
                          <div className="w-10 text-center">
                            {entry.rank === 1 ? (
                              <Crown size={22} className="mx-auto text-yellow-400" />
                            ) : (
                              <div className="text-lg font-black text-gray-400">#{entry.rank}</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-white">{entry.username}</span>
                              {entry.role === "admin" && <Shield size={14} className="text-purple-400" />}
                            </div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                              Level {entry.level} • {entry.current_streak_days}d streak • {entry.reflections_count} reflections
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-cyan-300">{entry.points_total}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-600">
                              points
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-sm font-bold text-gray-500">No leaderboard activity yet.</div>
                  )}

                  {leaderboard && (leaderboard.next || leaderboard.previous) && (
                    <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-4">
                      <Button
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={!leaderboard.previous}
                        variant="outline"
                        className="rounded-2xl border-white/10"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                        Page {page}
                      </div>
                      <Button
                        onClick={() => setPage((current) => current + 1)}
                        disabled={!leaderboard.next}
                        variant="outline"
                        className="rounded-2xl border-white/10"
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}
                </ElectricCard>
              </section>

              <section className="space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                  <Users size={20} className="text-purple-400" />
                  Members
                </h2>
                <ElectricCard elevation={0} className="overflow-hidden p-0">
                  {members.map((member) => {
                    const isCurrentUser = member.user === backendUser?.id;
                    return (
                      <div key={member.id} className="flex items-center justify-between border-b border-white/[0.05] px-6 py-5 last:border-b-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white">{member.username}</span>
                            {member.role === "admin" && <Shield size={14} className="text-purple-400" />}
                            {isCurrentUser && (
                              <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                                You
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>

                        {isAdmin && !isCurrentUser && member.role !== "admin" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePromote(member.id)}
                              variant="outline"
                              className="rounded-2xl border-white/10"
                            >
                              Promote
                            </Button>
                            <Button
                              onClick={() => handleRemoveMember(member.id)}
                              variant="outline"
                              className="rounded-2xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </ElectricCard>
              </section>
            </>
          )}
        </div>
      </div>

      <CreateCircleDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} onCreate={handleCreate} />
      <JoinCircleDialog isOpen={isJoinOpen} onOpenChange={setIsJoinOpen} onJoin={handleJoin} />
    </div>
  );
}

function CreateCircleDialog({
  isOpen,
  onOpenChange,
  onCreate,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, isPrivate: boolean) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [isPrivate, setIsPrivate] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await onCreate(name.trim(), isPrivate);
      setName("");
      setIsPrivate(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem] border-white/10 bg-[#101A2E] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Create Circle</DialogTitle>
          <DialogDescription className="text-gray-400">
            Start a private accountability group and invite members with a code.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Circle Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Budget Warriors"
              className="h-12 rounded-2xl border-white/10 bg-[#0B1220] text-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate((current) => !current)}
            className="flex w-full items-center justify-between rounded-[1.6rem] border border-white/[0.05] bg-white/[0.02] px-5 py-4"
          >
            <div className="text-left">
              <div className="font-black text-white">Private Circle</div>
              <div className="text-xs text-gray-500">Members join with the invite code.</div>
            </div>
            <div className={cn("h-7 w-14 rounded-full p-1 transition-all", isPrivate ? "bg-cyan-500" : "bg-white/10")}>
              <div className={cn("h-5 w-5 rounded-full bg-white transition-all", isPrivate ? "translate-x-7" : "translate-x-0")} />
            </div>
          </button>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400">
              {submitting ? "Creating..." : "Create Circle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JoinCircleDialog({
  isOpen,
  onOpenChange,
  onJoin,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (inviteCode: string) => Promise<void>;
}) {
  const [inviteCode, setInviteCode] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inviteCode.trim()) return;
    try {
      setSubmitting(true);
      await onJoin(inviteCode.trim());
      setInviteCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem] border-white/10 bg-[#101A2E] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Join Circle</DialogTitle>
          <DialogDescription className="text-gray-400">
            Paste an invite code to join an existing accountability group.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-500">Invite Code</Label>
            <Input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="abc123xyz"
              className="h-12 rounded-2xl border-white/10 bg-[#0B1220] font-mono text-white"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting} className="rounded-2xl bg-cyan-500 text-[#0B1220] hover:bg-cyan-400">
              {submitting ? "Joining..." : "Join Circle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
