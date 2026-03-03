"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Add Contact</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sarah Chen" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Role</label>
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Engineering Manager" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Company</label>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Stripe" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sarah@stripe.com" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">LinkedIn</label>
            <input value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="How you met, context..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">{saving ? "Saving..." : "Add Contact"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data);
    setLoading(false);
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">{contacts.length} people in your network</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Add Contact
        </button>
      </div>

      <input
        type="text"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 mb-6"
      />

      {loading ? (
        <div className="text-center py-16 text-gray-600">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">No contacts yet</p>
          <p className="text-gray-600 text-sm">Add recruiters, hiring managers, and referrals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-300 font-semibold text-sm shrink-0">
                  {contact.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-200">{contact.name}</p>
                      {contact.role && <p className="text-xs text-gray-500">{contact.role}</p>}
                      {contact.companyName && <p className="text-xs text-violet-400/70">{contact.companyName}</p>}
                    </div>
                    <button onClick={() => deleteContact(contact.id)} className="text-gray-700 hover:text-red-400 text-sm transition-colors shrink-0">✕</button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
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
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{contact.notes}</p>
                  )}

                  {contact.jobs?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {contact.jobs.slice(0, 3).map((cj: any) => (
                        <span key={cj.job.title} className="text-xs px-1.5 py-0.5 bg-white/5 rounded text-gray-500">
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
