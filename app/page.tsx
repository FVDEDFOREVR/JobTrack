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
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">J</div>
          <span className="font-semibold text-white text-sm tracking-tight">JobTrack</span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/dashboard" className="text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">
              Go to app
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">Sign in</Link>
              <Link href="/sign-up" className="text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-full text-xs text-violet-400 mb-8">
          Free forever · No credit card required
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Your job search,<br />
          <span className="text-violet-400">finally organized</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop losing track of applications in spreadsheets. JobTrack is a free CRM built for job seekers — track every application, interview, and follow-up in one place.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isSignedIn ? (
            <Link href="/dashboard" className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-base">
              Go to your dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-base">
                Start tracking for free
              </Link>
              <Link href="/sign-in" className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors text-base border border-white/10">
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* App Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#111]">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <div className="flex-1 mx-4 bg-white/5 rounded px-3 py-1 text-xs text-gray-600">jobtrack.app/dashboard</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[["6", "Total Apps", "text-white"], ["3", "Active", "text-violet-400"], ["1", "Offers", "text-emerald-400"], ["67%", "Response", "text-blue-400"]].map(([v, l, c]) => (
                <div key={l} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">{l}</p>
                  <p className={`text-2xl font-bold ${c}`}>{v}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Senior Frontend Engineer", "Stripe", "Interview", "text-violet-400", "bg-violet-400/10"],
                ["Staff Engineer", "Vercel", "Phone Screen", "text-yellow-400", "bg-yellow-400/10"],
                ["Senior SWE", "OpenAI", "Offer", "text-emerald-400", "bg-emerald-400/10"],
              ].map(([title, co, status, tc, bg]) => (
                <div key={title} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                  <p className="text-sm font-medium text-gray-200 mb-1">{title}</p>
                  <p className="text-xs text-gray-500 mb-2">{co}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${tc} ${bg}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Everything you need to land the job</h2>
        <p className="text-gray-500 text-center mb-12">Built by job seekers, for job seekers. No bloat, no paywalls.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
              <div className="text-2xl mb-3 text-violet-400">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to get organized?</h2>
        <p className="text-gray-500 mb-8">Join thousands of job seekers who use JobTrack to land their next role.</p>
        {isSignedIn ? (
          <Link href="/dashboard" className="inline-block px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-base">
            Go to your dashboard
          </Link>
        ) : (
          <Link href="/sign-up" className="inline-block px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors text-base">
            Create your free account
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-gray-700">© 2026 JobTrack · Free forever · Built with Next.js</p>
      </footer>
    </div>
  );
}
