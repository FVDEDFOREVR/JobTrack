"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

const STATUSES = [
  { value: "bookmarked", label: "Bookmarked" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const ACTIVITY_TYPES = [
  { value: "email", label: "Email", icon: "✉" },
  { value: "call", label: "Call", icon: "☎" },
  { value: "interview", label: "Interview", icon: "◈" },
  { value: "note", label: "Note", icon: "✎" },
  { value: "follow_up", label: "Follow-up", icon: "↩" },
  { value: "offer", label: "Offer", icon: "★" },
  { value: "rejection", label: "Rejection", icon: "✕" },
];

const ACTIVITY_ICONS: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.value, t.icon])
);

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `up to ${fmt(max!)}`;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "tasks" | "notes">("activity");

  // Activity form
  const [actForm, setActForm] = useState({ type: "note", title: "", notes: "", date: "" });
  const [addingAct, setAddingAct] = useState(false);

  // Task form
  const [taskForm, setTaskForm] = useState({ title: "", dueDate: "" });
  const [addingTask, setAddingTask] = useState(false);

  // Edit status
  const [editingStatus, setEditingStatus] = useState(false);

  const fetchJob = async () => {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json();
    setJob(data);
    setLoading(false);
  };

  useEffect(() => { fetchJob(); }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setEditingStatus(false);
    fetchJob();
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actForm.title) return;
    setAddingAct(true);
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...actForm, jobId: id }),
    });
    setActForm({ type: "note", title: "", notes: "", date: "" });
    setAddingAct(false);
    fetchJob();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setAddingTask(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...taskForm, jobId: id }),
    });
    setTaskForm({ title: "", dueDate: "" });
    setAddingTask(false);
    fetchJob();
  };

  const toggleTask = async (taskId: string, done: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    fetchJob();
  };

  const deleteJob = async () => {
    if (!confirm("Delete this job application?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    router.push("/jobs");
  };

  if (loading) return <div className="p-8 text-white/20">Loading...</div>;
  if (!job) return <div className="p-8 text-white/20">Job not found</div>;

  const inputClass = "bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
        <Link href="/jobs" className="hover:text-violet-400 transition-colors">Applications</Link>
        <span>/</span>
        <span className="text-white/50">{job.companyName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">{job.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-white/60 font-semibold">{job.companyName}</span>
            {job.location && <span className="text-white/35 text-sm">{job.location}</span>}
            {job.locationType && (
              <span className="text-xs px-2 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-white/40 capitalize">{job.locationType}</span>
            )}
            {formatSalary(job.salaryMin, job.salaryMax) && (
              <span className="text-emerald-400/80 text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/50 hover:text-white/75 text-sm rounded-xl transition-all"
            >
              View Job ↗
            </a>
          )}
          <button
            onClick={deleteJob}
            className="px-3 py-2 bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-500/20 text-red-400 text-sm rounded-xl transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status + Meta */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">Status</p>
            {editingStatus ? (
              <select
                autoFocus
                value={job.status}
                onChange={(e) => updateStatus(e.target.value)}
                onBlur={() => setEditingStatus(false)}
                className="bg-white/[0.05] border border-violet-500/50 rounded-lg px-2 py-1 text-sm text-white/80 focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            ) : (
              <button onClick={() => setEditingStatus(true)} className="hover:opacity-80 transition-opacity">
                <StatusBadge status={job.status} />
              </button>
            )}
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">Date Applied</p>
            <p className="text-sm text-white/60">{formatDate(job.dateApplied)}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">Resume Version</p>
            <p className="text-sm text-white/60">{job.resumeVersion || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">Added</p>
            <p className="text-sm text-white/60">{formatDate(job.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Contacts */}
      {job.contacts?.length > 0 && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-3">Contacts</h3>
          <div className="flex flex-wrap gap-3">
            {job.contacts.map((cj: any) => (
              <Link
                key={cj.contact.id}
                href={`/contacts`}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl hover:border-violet-500/30 transition-all"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(236,72,153,0.4))" }}
                >
                  {cj.contact.name[0]}
                </div>
                <div>
                  <p className="text-sm text-white/80">{cj.contact.name}</p>
                  {cj.contact.role && <p className="text-xs text-white/35">{cj.contact.role}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
        {(["activity", "tasks", "notes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? "text-violet-300 border border-violet-500/30"
                : "text-white/35 hover:text-white/60"
            }`}
            style={activeTab === tab ? { background: "rgba(139,92,246,0.2)" } : {}}
          >
            {tab}
            {tab === "activity" && job.activities?.length > 0 && (
              <span className="ml-1.5 text-xs text-white/25">({job.activities.length})</span>
            )}
            {tab === "tasks" && job.tasks?.length > 0 && (
              <span className="ml-1.5 text-xs text-white/25">({job.tasks.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          {/* Add Activity */}
          <form onSubmit={addActivity} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-3">Log Activity</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setActForm({ ...actForm, type: t.value })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    actForm.type === t.value
                      ? "text-violet-300 border border-violet-500/40"
                      : "bg-white/[0.05] text-white/35 hover:text-white/65 border border-white/[0.08]"
                  }`}
                  style={actForm.type === t.value ? { background: "rgba(139,92,246,0.2)" } : {}}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={actForm.title}
                onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                placeholder="What happened?"
                className={`flex-1 ${inputClass}`}
              />
              <input
                type="date"
                value={actForm.date}
                onChange={(e) => setActForm({ ...actForm, date: e.target.value })}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={addingAct || !actForm.title}
                className="px-4 py-2 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
              >
                Log
              </button>
            </div>
            <textarea
              value={actForm.notes}
              onChange={(e) => setActForm({ ...actForm, notes: e.target.value })}
              placeholder="Notes (optional)"
              rows={2}
              className={`mt-2 w-full ${inputClass} resize-none`}
            />
          </form>

          {/* Activity List */}
          {job.activities?.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">No activity logged yet</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/[0.06]" />
              <div className="space-y-0">
                {job.activities?.map((act: any) => (
                  <div key={act.id} className="flex gap-4 pb-4 relative">
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-sm shrink-0 z-10 text-white/50">
                      {ACTIVITY_ICONS[act.type] || "·"}
                    </div>
                    <div className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 mt-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white/80">{act.title}</p>
                        <span className="text-xs text-white/25">{formatDate(act.date)}</span>
                      </div>
                      {act.notes && <p className="text-xs text-white/35">{act.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <form onSubmit={addTask} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
            <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-3">Add Task</p>
            <div className="flex gap-2">
              <input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Send thank you email"
                className={`flex-1 ${inputClass}`}
              />
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={addingTask || !taskForm.title}
                className="px-4 py-2 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
              >
                Add
              </button>
            </div>
          </form>

          {job.tasks?.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-2">
              {job.tasks?.map((task: any) => {
                const isOverdue = !task.done && task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3.5 bg-white/[0.04] border rounded-2xl transition-all ${
                      task.done
                        ? "border-white/[0.04] opacity-50"
                        : isOverdue
                        ? "border-red-500/20"
                        : "border-white/[0.08] hover:border-violet-500/25"
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id, !task.done)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        task.done
                          ? "border-violet-500 text-white"
                          : "border-violet-500/40 bg-violet-500/[0.05] hover:border-violet-400"
                      }`}
                      style={task.done ? { background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" } : {}}
                    >
                      {task.done && <span className="text-xs">✓</span>}
                    </button>
                    <span className={`flex-1 text-sm ${task.done ? "line-through text-white/25" : "text-white/80"}`}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs shrink-0 px-2 py-0.5 rounded-full font-semibold ${
                        isOverdue ? "text-red-400 bg-red-400/[0.12]" : "text-white/30"
                      }`}>
                        {isOverdue ? "Overdue · " : ""}{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <NotesEditor jobId={id} initialNotes={job.notes || ""} onSaved={fetchJob} />
        </div>
      )}
    </div>
  );
}

function NotesEditor({ jobId, initialNotes, onSaved }: { jobId: string; initialNotes: string; onSaved: () => void }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">Notes</p>
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all glow-btn"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this role, interview prep, company research..."
        rows={12}
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
      />
    </div>
  );
}
