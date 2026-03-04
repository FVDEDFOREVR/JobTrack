"use client";

import { createContext, useContext, useState, useCallback } from "react";
import AddJobModal from "@/components/AddJobModal";

interface ModalContextType {
  openAddApplicationModal: () => void;
  closeAddApplicationModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openAddApplicationModal: () => {},
  closeAddApplicationModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openAddApplicationModal = useCallback(() => setIsOpen(true), []);
  const closeAddApplicationModal = useCallback(() => setIsOpen(false), []);

  const handleSaved = useCallback(() => {
    setIsOpen(false);
    // Increment key so pages can listen for new jobs via custom event
    setRefreshKey((k) => k + 1);
    window.dispatchEvent(new CustomEvent("job-added"));
  }, []);

  return (
    <ModalContext.Provider value={{ openAddApplicationModal, closeAddApplicationModal }}>
      {children}
      {isOpen && (
        <AddJobModal
          onClose={closeAddApplicationModal}
          onSaved={handleSaved}
        />
      )}
    </ModalContext.Provider>
  );
}
