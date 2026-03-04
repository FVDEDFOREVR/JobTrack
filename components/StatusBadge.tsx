const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  bookmarked:   { label: "Bookmarked",   color: "text-white/50",    bg: "bg-white/[0.07]",          dot: "bg-white/40" },
  applied:      { label: "Applied",      color: "text-blue-400",    bg: "bg-blue-400/[0.12]",       dot: "bg-blue-400" },
  phone_screen: { label: "Phone Screen", color: "text-yellow-400",  bg: "bg-yellow-400/[0.12]",     dot: "bg-yellow-400" },
  interview:    { label: "Interview",    color: "text-violet-400",  bg: "bg-violet-400/[0.15]",     dot: "bg-violet-400" },
  offer:        { label: "Offer",        color: "text-emerald-400", bg: "bg-emerald-400/[0.15]",    dot: "bg-emerald-400" },
  rejected:     { label: "Rejected",     color: "text-red-400",     bg: "bg-red-400/[0.12]",        dot: "bg-red-400" },
  withdrawn:    { label: "Withdrawn",    color: "text-orange-400",  bg: "bg-orange-400/[0.12]",     dot: "bg-orange-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-white/50", bg: "bg-white/[0.07]", dot: "bg-white/40" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} opacity-80`} />
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };
