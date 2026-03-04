import Link from "next/link";

export default function JobNotFound() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-6xl font-black text-white/10 mb-4">404</p>
      <h1 className="text-xl font-bold text-white mb-2">Job not found</h1>
      <p className="text-white/35 text-sm mb-6">This application doesn't exist or you don't have access to it.</p>
      <Link
        href="/jobs"
        className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all glow-btn"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
      >
        ← Back to Applications
      </Link>
    </div>
  );
}
