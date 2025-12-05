"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { AssistantLauncher } from "@/components/dashboard/AssistantLauncher";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-full p-4 sm:w-80"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <Sidebar
                isMobile
                onClose={() => setIsSidebarOpen(false)}
                onNavigate={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <AssistantLauncher />
    </div>
  );
}
