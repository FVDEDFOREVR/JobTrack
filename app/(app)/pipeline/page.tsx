"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STAGES = [
  { key: "bookmarked",   label: "Bookmarked",   color: "border-gray-600",   dot: "bg-gray-500" },
  { key: "applied",      label: "Applied",       color: "border-blue-600",   dot: "bg-blue-500" },
  { key: "phone_screen", label: "Phone Screen",  color: "border-yellow-600", dot: "bg-yellow-500" },
  { key: "interview",    label: "Interview",     color: "border-violet-600", dot: "bg-violet-500" },
  { key: "offer",        label: "Offer",         color: "border-emerald-600",dot: "bg-emerald-500" },
  { key: "rejected",     label: "Rejected",      color: "border-red-600",    dot: "bg-red-500" },
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

    // Optimistic update
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

  if (loading) return <div className="p-8 text-gray-600">Loading...</div>;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Pipeline</h1>
        <p className="text-gray-500 text-sm mt-1">Drag cards to update status</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {STAGES.map((stage) => {
          const stageJobs = jobsByStatus(stage.key);
          const isOver = dragOver === stage.key;
          return (
            <div
              key={stage.key}
              className={`flex flex-col w-64 shrink-0 rounded-xl border transition-colors ${
                isOver ? "border-violet-500/50 bg-violet-500/5" : "border-white/5 bg-[#141414]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(stage.key)}
            >
              {/* Column Header */}
              <div className={`px-4 py-3 border-b border-white/5 flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className="text-sm font-medium text-gray-300">{stage.label}</span>
                <span className="ml-auto text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
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
                    className={`bg-[#1a1a1a] border border-white/5 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-white/10 transition-all ${
                      dragging === job.id ? "opacity-40 scale-95" : ""
                    }`}
                  >
                    <Link href={`/jobs/${job.id}`} onClick={(e) => dragging && e.preventDefault()}>
                      <p className="text-sm font-medium text-gray-200 mb-1 leading-tight">{job.title}</p>
                      <p className="text-xs text-gray-500 mb-2">{job.companyName}</p>
                      <div className="flex items-center justify-between">
                        {formatSalary(job.salaryMin, job.salaryMax) ? (
                          <span className="text-xs text-emerald-500/70">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        ) : (
                          <span />
                        )}
                        {job.locationType && (
                          <span className="text-xs text-gray-600 capitalize">{job.locationType}</span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}

                {stageJobs.length === 0 && (
                  <div className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                    isOver ? "border-violet-500/40 text-violet-400" : "border-white/5 text-gray-700"
                  }`}>
                    <span className="text-xs">Drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
