"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",    icon: "⬡", section: "MAIN" },
  { href: "/jobs",       label: "Applications", icon: "◈", section: "MAIN" },
  { href: "/pipeline",   label: "Pipeline",     icon: "⬕", section: "MAIN" },
  { href: "/contacts",   label: "Contacts",     icon: "◉", section: "NETWORK" },
  { href: "/resume",     label: "Resume",       icon: "◫", section: "NETWORK" },
  { href: "/tasks",      label: "Tasks",        icon: "◻", section: "PRODUCTIVITY" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#0c0a1a] border-r border-white/[0.07] flex flex-col shrink-0 relative overflow-hidden">
      {/* Subtle sidebar glow */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07] relative">
        <Image
          src="/JobTrack_Logo.png"
          alt="JobTrack"
          width={140}
          height={40}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 relative">
        {["MAIN", "NETWORK", "PRODUCTIVITY"].map((section) => {
          const items = navItems.filter((i) => i.section === section);
          return (
            <div key={section} className="mb-3">
              <p className="text-[10px] font-bold tracking-widest text-white/25 px-3 mb-1.5 uppercase">{section}</p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30"
                          : "text-white/40 hover:text-white/75 hover:bg-white/[0.06] border border-transparent"
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.07] flex items-center gap-3">
        <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        <span className="text-xs text-white/25">Account</span>
      </div>
    </aside>
  );
}
