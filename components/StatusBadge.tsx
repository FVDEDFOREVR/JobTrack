const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  bookmarked:   { label: "Bookmarked",   color: "text-gray-400",   bg: "bg-gray-400/10" },
  applied:      { label: "Applied",      color: "text-blue-400",   bg: "bg-blue-400/10" },
  phone_screen: { label: "Phone Screen", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  interview:    { label: "Interview",    color: "text-violet-400", bg: "bg-violet-400/10" },
  offer:        { label: "Offer",        color: "text-emerald-400",bg: "bg-emerald-400/10" },
  rejected:     { label: "Rejected",     color: "text-red-400",    bg: "bg-red-400/10" },
  withdrawn:    { label: "Withdrawn",    color: "text-orange-400", bg: "bg-orange-400/10" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-gray-400", bg: "bg-gray-400/10" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG };
