"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  bookmarked:   { label: "Bookmarked",   color: "text-gray-400" },
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

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8 text-gray-600">Loading...</div>;

  const { totalJobs, statusMap, upcomingTasks, recentActivities } = data;
  const activeCount = (statusMap["applied"] || 0) + (statusMap["phone_screen"] || 0) + (statusMap["interview"] || 0);
  const offerCount = statusMap["offer"] || 0;
  const responseRate = totalJobs > 0
    ? Math.round(((totalJobs - (statusMap["bookmarked"] || 0) - (statusMap["rejected"] || 0)) / totalJobs) * 100)
    : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your job search at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applications", value: totalJobs, sub: "all time", color: "text-white" },
          { label: "Active Processes", value: activeCount, sub: "in progress", color: "text-violet-400" },
          { label: "Offers", value: offerCount, sub: "received", color: "text-emerald-400" },
          { label: "Response Rate", value: `${responseRate}%`, sub: "of applications", color: "text-blue-400" },
        ].map((card) => (
          <div key={card.label} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Overview */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-300 mb-4">Pipeline Overview</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <Link key={key} href={`/jobs?status=${key}`}
              className="flex flex-col items-center p-3 rounded-lg bg-white/3 hover:bg-white/6 transition-colors border border-white/5">
              <span className={`text-xl font-bold ${cfg.color}`}>{statusMap[key] || 0}</span>
              <span className="text-xs text-gray-500 mt-1 text-center leading-tight">{cfg.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-300">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-xs text-violet-400 hover:text-violet-300">View all</Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No upcoming tasks</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task: any) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-4 h-4 rounded border border-white/20 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{task.title}</p>
                      {task.job && <p className="text-xs text-gray-500 truncate">{task.job.companyName} · {task.job.title}</p>}
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs shrink-0 ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
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
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No activity yet</p>
          ) : (
            <div>
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-gray-500 w-4 shrink-0 mt-0.5">{ACTIVITY_ICONS[act.type] || "·"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{act.title}</p>
                    {act.job && <p className="text-xs text-gray-500 truncate">{act.job.companyName}</p>}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">{formatRelative(act.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
