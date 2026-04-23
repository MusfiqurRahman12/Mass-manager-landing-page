import React, { useState } from "react";
import { Footer, Navbar, Sidebar } from "./";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar onMenuClick={() => setIsMobileOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar 
            open={isMobileOpen} 
            onClose={() => setIsMobileOpen(false)} 
          />
        )}
        <main className="flex-1 overflow-y-auto md:ml-64">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
