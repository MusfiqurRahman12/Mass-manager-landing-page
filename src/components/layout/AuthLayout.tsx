import React from "react";
import { Footer, Navbar } from "./";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
