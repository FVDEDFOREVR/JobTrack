"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STAGES = [
  { key: "bookmarked",   label: "Bookmarked",   dot: "bg-white/40" },
  { key: "applied",      label: "Applied",       dot: "bg-blue-500" },
  { key: "phone_screen", label: "Phone Screen",  dot: "bg-yellow-500" },
  { key: "interview",    label: "Interview",     dot: "bg-violet-500" },
  { key: "offer",        label: "Offer",         dot: "bg-emerald-500" },
  { key: "rejected",     label: "Rejected",      dot: "bg-red-500" },
];

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `up to ${fmt(max!)}`;
}

export default function PipelinePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const fetchJobs = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDragStart = (jobId: string) => setDragging(jobId);
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const handleDrop = async (status: string) => {
    if (!dragging) return;
    const job = jobs.find((j) => j.id === dragging);
    if (!job || job.status === status) { setDragging(null); setDragOver(null); return; }

    setJobs((prev) => prev.map((j) => j.id === dragging ? { ...j, status } : j));
    setDragging(null);
    setDragOver(null);

    await fetch(`/api/jobs/${dragging}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const jobsByStatus = (status: string) => jobs.filter((j) => j.status === status);

  if (loading) return <div className="p-8 text-white/25">Loading...</div>;

  const isEmpty = jobs.length === 0;

  return (
    <div className="p-8 h-full flex flex-col min-w-0 overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline</h1>
        <p className="text-white/35 text-sm mt-1">Drag cards to update status</p>
      </div>

      {/* Empty state onboarding */}
      {isEmpty && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/[0.04] border border-violet-500/20 rounded-2xl p-10 text-center max-w-md w-full"
            style={{ boxShadow: "0 0 60px rgba(139,92,246,0.08)" }}>
            <div className="text-4xl mb-4 text-violet-400">⬕</div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Your job pipeline will appear here</h2>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              Add your first application and move it through the hiring stages. Drag cards between columns to update status.
            </p>
            <a href="/jobs"
              className="inline-block px-6 py-3 text-white font-semibold rounded-xl transition-all glow-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              Add your first application →
            </a>
          </div>
        </div>
      )}

      {!isEmpty && <div className="flex gap-4 pb-4 flex-1">
        {STAGES.map((stage) => {
          const stageJobs = jobsByStatus(stage.key);
          const isOver = dragOver === stage.key;
          return (
            <div
              key={stage.key}
              className={`flex flex-col flex-1 min-w-0 rounded-2xl border transition-all ${
                isOver
                  ? "border-violet-500/50 bg-violet-500/[0.06]"
                  : "border-white/[0.07] bg-[#0c0a1a]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className="text-sm font-semibold text-white/70">{stage.label}</span>
                <span className="ml-auto text-xs text-white/30 bg-white/[0.07] px-1.5 py-0.5 rounded-full font-semibold">
                  {stageJobs.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {stageJobs.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={() => handleDragStart(job.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white/[0.05] border border-white/[0.09] rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-violet-500/30 transition-all ${
                      dragging === job.id ? "opacity-40 scale-95" : ""
                    }`}
                  >
                    <Link href={`/jobs/${job.id}`} onClick={(e) => dragging && e.preventDefault()}>
                      <p className="text-sm font-semibold text-white/85 mb-1 leading-tight truncate">{job.title}</p>
                      <p className="text-xs text-white/40 mb-2 truncate">{job.companyName}</p>
                      <div className="flex items-center justify-between">
                        {formatSalary(job.salaryMin, job.salaryMax) ? (
                          <span className="text-xs text-emerald-400/80 font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        ) : (
                          <span />
                        )}
                        {job.locationType && (
                          <span className="text-xs text-white/25 capitalize">{job.locationType}</span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}

                {stageJobs.length === 0 && (
                  <div className={`h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${
                    isOver ? "border-violet-500/40 text-violet-400" : "border-white/[0.07] text-white/20"
                  }`}>
                    <span className="text-xs">Drag applications here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
