"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { useModal } from "@/contexts/ModalContext";

interface JobListItem {
  id: string;
  title: string;
  companyName: string;
  status: string;
  location: string | null;
  locationType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  dateApplied: string | null;
  _count?: {
    activities?: number;
    tasks?: number;
  };
}

const STATUSES = ["", "bookmarked", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn"];
const STATUS_LABELS: Record<string, string> = {
  "": "All",
  bookmarked: "Bookmarked",
  applied: "Applied",
  phone_screen: "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const LOCATION_ICONS: Record<string, string> = {
  remote: "🌐",
  hybrid: "⚡",
  onsite: "🏢",
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `up to ${fmt(max!)}`;
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openAddApplicationModal } = useModal();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to load jobs";
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed?.error) message = parsed.error;
          } catch {
            // Ignore non-JSON responses and use fallback message.
          }
        }
        throw new Error(message);
      }

      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load jobs";
      setError(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 200);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  useEffect(() => {
    window.addEventListener("job-added", fetchJobs);
    return () => window.removeEventListener("job-added", fetchJobs);
  }, [fetchJobs]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications</h1>
          <p className="text-white/35 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked</p>
        </div>
        <button
          onClick={openAddApplicationModal}
          className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
        >
          + Add Job
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by title, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Status filter chips */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              status === s
                ? "text-violet-300 border border-violet-500/40"
                : "bg-white/[0.04] text-white/40 hover:text-white/65 border border-white/[0.08] hover:border-white/[0.15]"
            }`}
            style={status === s ? { background: "rgba(139,92,246,0.2)" } : {}}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-16 text-white/20">Loading...</div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-300/90 text-lg mb-2">Couldn&apos;t load applications</p>
          <p className="text-white/35 text-sm">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/35 text-lg mb-2">No applications found</p>
          <p className="text-white/20 text-sm">Add your first job to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const activityCount = job._count?.activities ?? 0;
            const taskCount = job._count?.tasks ?? 0;
            return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 hover:border-violet-500/30 hover:bg-white/[0.06] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="font-semibold text-white/90 group-hover:text-violet-300 transition-colors truncate">
                      {job.title}
                    </h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/40">
                    <span className="font-semibold text-white/60">{job.companyName}</span>
                    {job.location && (
                      <>
                        <span>·</span>
                        <span>
                          {job.locationType && LOCATION_ICONS[job.locationType]} {job.location}
                        </span>
                      </>
                    )}
                    {formatSalary(job.salaryMin, job.salaryMax) && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400/80 font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {job.dateApplied && (
                    <p className="text-xs text-white/25">Applied {formatDate(job.dateApplied)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    {activityCount > 0 && (
                      <span className="text-xs text-white/25">{activityCount} activities</span>
                    )}
                    {taskCount > 0 && (
                      <span className="text-xs text-white/25">{taskCount} tasks</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}


    </div>
  );
}
