import Sidebar from "@/components/Sidebar";
import { ModalProvider } from "@/contexts/ModalContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </ModalProvider>
  );
}
