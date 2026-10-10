"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ComposeFab } from "@/components/community/compose-button";
import { ComposeModal } from "@/components/community/compose-modal";
import { ComposeProvider } from "@/context/ComposeContext";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Hold the page until the session check resolves, otherwise a refresh briefly
  // renders the dashboard chrome for an unauthenticated visitor.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-border border-t-primary-600 animate-spin" />
          <p className="text-sm text-muted">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ComposeProvider>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <Navbar />
        <main className="mx-auto w-full max-w-[1440px] p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-32">
          {children}
        </main>
        <ComposeFab />
        <ComposeModal />
      </div>
    </ComposeProvider>
  );
}
