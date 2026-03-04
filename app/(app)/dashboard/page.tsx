"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  bookmarked:   { label: "Bookmarked",   color: "text-white/45" },
  applied:      { label: "Applied",      color: "text-blue-400" },
  phone_screen: { label: "Phone Screen", color: "text-yellow-400" },
  interview:    { label: "Interview",    color: "text-violet-400" },
  offer:        { label: "Offer",        color: "text-emerald-400" },
  rejected:     { label: "Rejected",     color: "text-red-400" },
  withdrawn:    { label: "Withdrawn",    color: "text-orange-400" },
};

const ACTIVITY_ICONS: Record<string, string> = {
  email: "✉", call: "☎", interview: "◈", note: "✎",
  follow_up: "↩", offer: "★", rejection: "✕",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const { openAddApplicationModal } = useModal();

  const fetchStats = () => fetch("/api/stats").then((r) => r.json()).then(setData);

  useEffect(() => {
    fetchStats();
    // Refresh stats when a job is added via the global modal
    window.addEventListener("job-added", fetchStats);
    return () => window.removeEventListener("job-added", fetchStats);
  }, []);

  if (!data) return <div className="p-8 text-white/25">Loading...</div>;

  const { totalJobs, statusMap, upcomingTasks, recentActivities } = data;
  const activeCount = (statusMap["applied"] || 0) + (statusMap["phone_screen"] || 0) + (statusMap["interview"] || 0);
  const offerCount = statusMap["offer"] || 0;
  const responseRate = totalJobs > 0
    ? Math.round(((totalJobs - (statusMap["bookmarked"] || 0) - (statusMap["rejected"] || 0)) / totalJobs) * 100)
    : 0;

  const isEmpty = totalJobs === 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Image
            src="/JobTrack_Logo.png"
            alt="JobTrack"
            width={160}
            height={45}
            className="object-contain mb-1"
            priority
          />
          <p className="text-white/35 text-sm mt-1">Your job search at a glance</p>
        </div>
        <button
          onClick={openAddApplicationModal}
          className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
          + Add Application
        </button>
      </div>

      {/* Empty state onboarding */}
      {isEmpty && (
        <div className="bg-white/[0.04] border border-violet-500/20 rounded-2xl p-10 mb-8"
          style={{ boxShadow: "0 0 60px rgba(139,92,246,0.08)" }}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest px-2.5 py-1 rounded-full border border-violet-500/30"
                style={{ background: "rgba(139,92,246,0.12)" }}>Step 1</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Add a job you're tracking</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              Start with a role you've already applied to. Once added, JobTrack will automatically track your pipeline, tasks, and activity.
            </p>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-6 flex flex-col gap-2">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold mb-1">Example</p>
              {[["Company", "Stripe"], ["Role", "Frontend Engineer"], ["Status", "Applied"]].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-16 shrink-0">{k}</span>
                  <span className="text-sm text-white/60 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <button
              onClick={openAddApplicationModal}
              className="px-6 py-3 text-white font-semibold rounded-xl transition-all glow-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              Add your first application →
            </button>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isEmpty ? (
          <>
            {[
              { label: "Total Applications", hint: "Add your first job to start tracking",           glow: "rgba(255,255,255,0.08)" },
              { label: "Active Processes",   hint: "Starts once you move a job into interview stages", glow: "rgba(139,92,246,0.15)" },
              { label: "Offers",             hint: "Appears when you receive an offer",               glow: "rgba(52,211,153,0.15)" },
              { label: "Response Rate",      hint: "Appears after your first application",            glow: "rgba(96,165,250,0.15)" },
            ].map((card) => (
              <div key={card.label}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
                style={{ boxShadow: `0 0 40px ${card.glow}` }}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">{card.label}</p>
                <p className="text-sm text-white/20 leading-snug">{card.hint}</p>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { label: "Total Applications", value: totalJobs,          sub: "all time",         color: "text-white",       glow: "rgba(255,255,255,0.08)" },
              { label: "Active Processes",   value: activeCount,        sub: "in progress",      color: "text-violet-400",  glow: "rgba(139,92,246,0.15)" },
              { label: "Offers",             value: offerCount,         sub: "received",         color: "text-emerald-400", glow: "rgba(52,211,153,0.15)" },
              { label: "Response Rate",      value: `${responseRate}%`, sub: "of applications",  color: "text-blue-400",    glow: "rgba(96,165,250,0.15)" },
            ].map((card) => (
              <div key={card.label}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 transition-colors hover:border-white/[0.14]"
                style={{ boxShadow: `0 0 40px ${card.glow}` }}>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">{card.label}</p>
                <p className={`text-3xl font-black tracking-tighter ${card.color}`}>{card.value}</p>
                <p className="text-xs text-white/25 mt-1">{card.sub}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-white/70 mb-4">Pipeline Overview</h2>
        {isEmpty ? (
          <p className="text-white/20 text-sm text-center py-4">
            Your pipeline will appear here after you add your first application.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <Link key={key} href={`/jobs?status=${key}`}
                className="flex flex-col items-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors border border-white/[0.07] hover:border-violet-500/30">
                <span className={`text-xl font-black tracking-tighter ${cfg.color}`}>{statusMap[key] || 0}</span>
                <span className="text-[10px] text-white/30 mt-1 text-center leading-tight font-medium">{cfg.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-xs text-violet-400 hover:text-violet-300 font-medium">View all →</Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-white/20 text-sm py-4 text-center">No upcoming tasks</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task: any) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                    <div className="w-4 h-4 rounded border border-violet-500/40 bg-violet-500/[0.05] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 truncate">{task.title}</p>
                      {task.job && <p className="text-xs text-white/30 truncate">{task.job.companyName} · {task.job.title}</p>}
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs shrink-0 font-medium ${isOverdue ? "text-red-400" : "text-white/30"}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white/70 mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <p className="text-white/20 text-sm py-4 text-center">No activity yet</p>
          ) : (
            <div>
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-sm text-white/30 w-4 shrink-0 mt-0.5">{ACTIVITY_ICONS[act.type] || "·"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/75 truncate">{act.title}</p>
                    {act.job && <p className="text-xs text-white/30 truncate">{act.job.companyName}</p>}
                  </div>
                  <span className="text-xs text-white/25 shrink-0">{formatRelative(act.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
