"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import AddJobModal from "@/components/AddJobModal";

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
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 200);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
        />
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                status === s
                  ? "bg-violet-600 text-white"
                  : "bg-[#1a1a1a] text-gray-400 hover:text-gray-200 border border-white/10"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-16 text-gray-600">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">No applications found</p>
          <p className="text-gray-600 text-sm">Add your first job to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:border-white/10 hover:bg-[#1e1e1e] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white group-hover:text-violet-300 transition-colors truncate">
                      {job.title}
                    </h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="font-medium text-gray-400">{job.companyName}</span>
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
                        <span className="text-emerald-500/80">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {job.dateApplied && (
                    <p className="text-xs text-gray-600">Applied {formatDate(job.dateApplied)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    {job._count?.activities > 0 && (
                      <span className="text-xs text-gray-600">{job._count.activities} activities</span>
                    )}
                    {job._count?.tasks > 0 && (
                      <span className="text-xs text-gray-600">{job._count.tasks} tasks</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showAdd && (
        <AddJobModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchJobs(); }}
        />
      )}
    </div>
  );
}
