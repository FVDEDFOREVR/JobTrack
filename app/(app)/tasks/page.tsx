"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(d: string | null) {
  if (!d) return false;
  return new Date(d) < new Date();
}

function isDueToday(d: string | null) {
  if (!d) return false;
  const due = new Date(d);
  const today = new Date();
  return due.toDateString() === today.toDateString();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("pending");
  const [newTask, setNewTask] = useState({ title: "", dueDate: "" });
  const [adding, setAdding] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "pending") params.set("done", "false");
    if (filter === "done") params.set("done", "true");
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleTask = async (id: string, done: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    setAdding(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    setNewTask({ title: "", dueDate: "" });
    setAdding(false);
    fetchTasks();
  };

  const pendingCount = tasks.filter((t) => !t.done).length;
  const overdueCount = tasks.filter((t) => !t.done && isOverdue(t.dueDate)).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
        <p className="text-white/35 text-sm mt-1">
          {pendingCount} pending
          {overdueCount > 0 && <span className="text-red-400 ml-2 font-medium">· {overdueCount} overdue</span>}
        </p>
      </div>

      {/* Add Task */}
      <form onSubmit={addTask} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 mb-6">
        <div className="flex gap-2">
          <input
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Add a task..."
            className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white/60 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={adding || !newTask.title}
            className="px-4 py-2.5 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
          >
            Add
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
        {(["pending", "all", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              filter === f
                ? "text-violet-300 border border-violet-500/30"
                : "text-white/35 hover:text-white/60"
            }`}
            style={filter === f ? { background: "rgba(139,92,246,0.2)" } : {}}
          >
            {f === "pending" ? "Pending" : f === "done" ? "Completed" : "All"}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="text-center py-16 text-white/20">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/35 text-lg mb-2">
            {filter === "done" ? "No completed tasks" : "No tasks yet"}
          </p>
          <p className="text-white/20 text-sm">Add tasks to stay on top of your job search</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const overdue = !task.done && isOverdue(task.dueDate);
            const today = !task.done && isDueToday(task.dueDate);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3.5 bg-white/[0.04] border rounded-2xl transition-all ${
                  task.done
                    ? "border-white/[0.04] opacity-50"
                    : overdue
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

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.done ? "line-through text-white/25" : "text-white/80"}`}>
                    {task.title}
                  </p>
                  {task.job && (
                    <Link href={`/jobs/${task.job.id || ""}`} className="text-xs text-white/30 hover:text-violet-400/70 transition-colors">
                      {task.job.companyName} · {task.job.title}
                    </Link>
                  )}
                </div>

                {task.dueDate && (
                  <span className={`text-xs shrink-0 px-2 py-0.5 rounded-full font-semibold ${
                    overdue ? "text-red-400 bg-red-400/[0.12]" :
                    today  ? "text-yellow-400 bg-yellow-400/[0.12]" :
                    "text-white/30"
                  }`}>
                    {overdue ? "Overdue · " : today ? "Today · " : ""}{formatDate(task.dueDate)}
                  </span>
                )}

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-white/20 hover:text-red-400 text-sm transition-colors shrink-0 ml-1"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
