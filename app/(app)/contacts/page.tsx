"use client";

import { useEffect, useState, useCallback } from "react";

interface ContactJobLink {
  job: {
    title: string;
    companyName: string;
  };
}

interface ContactItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  companyName: string | null;
  linkedIn: string | null;
  notes: string | null;
  jobs?: ContactJobLink[];
}

function AddContactModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", companyName: "", linkedIn: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSaved();
  };

  const inputClass = "w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0c1e] border border-white/[0.12] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-base font-bold text-white">Add Contact</h2>
          <button onClick={onClose} className="text-white/35 hover:text-white/70 text-xl leading-none transition-colors">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div>
            <label className="block text-xs text-white/35 mb-1.5 font-medium">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sarah Chen" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Role</label>
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Engineering Manager" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Company</label>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Stripe" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/35 mb-1.5 font-medium">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sarah@stripe.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-white/35 mb-1.5 font-medium">LinkedIn</label>
            <input value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} placeholder="https://linkedin.com/in/..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-white/35 mb-1.5 font-medium">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="How you met, context..." className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/60 text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
            >
              {saving ? "Saving..." : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/contacts?${params}`);

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to load contacts";
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed?.error) message = parsed.error;
          } catch {
            // Ignore non-JSON responses and keep fallback message.
          }
        }
        throw new Error(message);
      }

      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load contacts";
      setError(message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchContacts, 200);
    return () => clearTimeout(t);
  }, [fetchContacts]);

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    fetchContacts();
  };

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-white/35 text-sm mt-1">{contacts.length} people in your network</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
        >
          + Add Contact
        </button>
      </div>

      <input
        type="text"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors mb-6"
      />

      {loading ? (
        <div className="text-center py-16 text-white/20">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/35 text-lg mb-2">No contacts yet</p>
          <p className="text-white/20 text-sm">Add recruiters, hiring managers, and referrals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 hover:border-violet-500/30 transition-all">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3))" }}
                >
                  {contact.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white/90">{contact.name}</p>
                      {contact.role && <p className="text-xs text-white/40 mt-0.5">{contact.role}</p>}
                      {contact.companyName && <p className="text-xs text-violet-400/80 mt-0.5">{contact.companyName}</p>}
                    </div>
                    <button onClick={() => deleteContact(contact.id)} className="text-white/20 hover:text-red-400 text-sm transition-colors shrink-0">✕</button>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors">
                        ✉ {contact.email}
                      </a>
                    )}
                    {contact.linkedIn && (
                      <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors">
                        LinkedIn ↗
                      </a>
                    )}
                  </div>

                  {contact.notes && (
                    <p className="text-xs text-white/25 mt-2 line-clamp-2">{contact.notes}</p>
                  )}

                  {contact.jobs?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {contact.jobs.slice(0, 3).map((cj: ContactJobLink) => (
                        <span key={cj.job.title} className="text-xs px-1.5 py-0.5 bg-white/[0.06] rounded-full text-white/35 font-medium">
                          {cj.job.companyName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddContactModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchContacts(); }} />
      )}
    </div>
  );
}
