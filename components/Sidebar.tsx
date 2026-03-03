"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/jobs", label: "Applications", icon: "◈" },
  { href: "/pipeline", label: "Pipeline", icon: "⬕" },
  { href: "/contacts", label: "Contacts", icon: "◉" },
  { href: "/tasks", label: "Tasks", icon: "◻" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#141414] border-r border-white/5 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">J</div>
          <span className="font-semibold text-white text-sm tracking-tight">JobTrack</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}>
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/5 flex items-center gap-3">
        <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        <span className="text-xs text-gray-600">Account</span>
      </div>
    </aside>
  );
}
