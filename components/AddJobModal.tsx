"use client";

import { useState } from "react";

const STATUSES = [
  { value: "bookmarked", label: "Bookmarked" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function AddJobModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    url: "",
    status: "bookmarked",
    location: "",
    locationType: "remote",
    salaryMin: "",
    salaryMax: "",
    dateApplied: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.companyName) return;
    setSaving(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
  };

  const inputClass = "w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors";
  const selectClass = `${inputClass} [&>option]:bg-[#1a1530] [&>option]:text-white`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0c1e] border border-white/[0.12] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-base font-bold text-white">Add Job Application</h2>
          <button onClick={onClose} className="text-white/35 hover:text-white/70 text-xl leading-none transition-colors">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Job Title */}
            <div className="col-span-2">
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Job Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Senior Frontend Engineer"
                className={inputClass}
              />
            </div>
            {/* 2. Company */}
            <div className="col-span-2">
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Company *</label>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Stripe"
                className={inputClass}
              />
            </div>
            {/* 3. Status */}
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={selectClass}
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {/* 4. Date Applied */}
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Date Applied</label>
              <input
                type="date"
                value={form.dateApplied}
                onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
                className={inputClass}
              />
            </div>
            {/* 5. Work Type */}
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Work Type</label>
              <select
                value={form.locationType}
                onChange={(e) => setForm({ ...form, locationType: e.target.value })}
                className={selectClass}
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            {/* 6. Location */}
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="San Francisco, CA"
                className={inputClass}
              />
            </div>
            {/* 7. Job URL */}
            <div className="col-span-2">
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Job URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            {/* 8. Salary Min / 9. Salary Max */}
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Salary Min</label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                placeholder="150000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Salary Max</label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                placeholder="200000"
                className={inputClass}
              />
            </div>
            {/* 10. Notes */}
            <div className="col-span-2">
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes about this role..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/60 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
            >
              {saving ? "Saving..." : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
