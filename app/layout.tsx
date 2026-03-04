import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobTrack — Job Search CRM",
  description: "Track your job applications, interviews, and follow-ups. Free for everyone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-[#08060f] text-gray-100 min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
