"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const features = [
  { icon: "◈", title: "Application Tracker", desc: "Log every job you apply to. Track status from bookmarked to offer." },
  { icon: "⬕", title: "Kanban Pipeline", desc: "Drag and drop jobs across stages. See your entire funnel at a glance." },
  { icon: "✎", title: "Activity Log", desc: "Record every email, call, and interview. Never forget what happened." },
  { icon: "◻", title: "Task Reminders", desc: "Set follow-up tasks with due dates. Stay on top of every opportunity." },
  { icon: "◉", title: "Contact Manager", desc: "Track recruiters and hiring managers linked to each application." },
  { icon: "⬡", title: "Smart Dashboard", desc: "See your response rate, active processes, and offers in one view." },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#08060f] text-gray-100 relative overflow-x-hidden">

      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(236,72,153,0.1) 0%, transparent 70%)" }} />

      {/* Nav */}
      <nav className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto relative">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm glow-violet-sm"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
          >J</div>
          <span className="font-bold text-white text-sm tracking-tight">JobTrack</span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/dashboard"
              className="text-sm font-semibold text-white px-5 py-2 rounded-xl transition-all glow-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              Go to app
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-white/45 hover:text-white/75 transition-colors px-3 py-2">Sign in</Link>
              <Link href="/sign-up"
                className="text-sm font-semibold text-white px-5 py-2 rounded-xl transition-all glow-btn"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-violet-300 mb-8 border border-violet-500/30"
          style={{ background: "rgba(139,92,246,0.12)" }}>
          ✦ Free to use · No credit card required
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
          Your job search,<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            finally organized
          </span>
        </h1>
        <p className="text-xl text-white/45 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop losing track of applications in spreadsheets. JobTrack is a CRM built for job seekers — track every application, interview, and follow-up in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isSignedIn ? (
            <Link href="/dashboard"
              className="px-8 py-3.5 text-white font-bold rounded-2xl transition-all text-base glow-btn"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              Go to your dashboard →
            </Link>
          ) : (
            <>
              <Link href="/sign-up"
                className="px-8 py-3.5 text-white font-bold rounded-2xl transition-all text-base glow-btn"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                Start tracking for free →
              </Link>
              <Link href="/sign-in"
                className="px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/65 font-medium rounded-2xl transition-colors text-base border border-white/[0.1]">
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* App Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 0 80px rgba(139,92,246,0.12)" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-white/[0.02]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <div className="flex-1 mx-4 bg-white/[0.05] rounded px-3 py-1 text-xs text-white/25">jobtrack.app/dashboard</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                ["6",   "Total Apps",  "text-white"],
                ["3",   "Active",      "text-violet-400"],
                ["1",   "Offers",      "text-emerald-400"],
                ["67%", "Response",    "text-blue-400"],
              ].map(([v, l, c]) => (
                <div key={l} className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08]">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-semibold">{l}</p>
                  <p className={`text-2xl font-black tracking-tighter ${c}`}>{v}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Senior Frontend Engineer", "Stripe",  "Interview",   "text-violet-400",  "rgba(139,92,246,0.15)"],
                ["Staff Engineer",           "Vercel",  "Phone Screen","text-yellow-400",  "rgba(251,191,36,0.15)"],
                ["Senior SWE",               "OpenAI",  "Offer",       "text-emerald-400", "rgba(52,211,153,0.15)"],
              ].map(([title, co, status, tc, bg]) => (
                <div key={title} className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08]">
                  <p className="text-sm font-semibold text-white/85 mb-1">{title}</p>
                  <p className="text-xs text-white/40 mb-2">{co}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${tc}`}
                    style={{ background: bg }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-black text-white text-center mb-4 tracking-tight">Everything you need to land the job</h2>
        <p className="text-white/35 text-center mb-12">Built for job seekers. Simple, focused, and fast.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:border-violet-500/30 transition-all">
              <div className="text-2xl mb-3 text-violet-400">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.07] py-20 text-center px-6 relative">
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to get organized?</h2>
        <p className="text-white/35 mb-8">Stop juggling spreadsheets. JobTrack keeps your entire search in one place.</p>
        {isSignedIn ? (
          <Link href="/dashboard"
            className="inline-block px-8 py-3.5 text-white font-bold rounded-2xl transition-all text-base glow-btn"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
            Go to your dashboard →
          </Link>
        ) : (
          <Link href="/sign-up"
            className="inline-block px-8 py-3.5 text-white font-bold rounded-2xl transition-all text-base glow-btn"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
            Create your free account →
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 text-center">
        <p className="text-xs text-white/20">© 2026 JobTrack · Built with Next.js</p>
      </footer>
    </div>
  );
}
