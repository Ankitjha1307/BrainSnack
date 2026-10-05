"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const THEME_KEY = "brainsnack-theme";

/** Reads the persisted preference and applies it to <html>. */
const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
  try {
    window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // Private browsing / disabled storage: the theme still applies for this page.
  }
};

export function Navbar() {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const pathname = usePathname();
  // The navbar remounts on every route change, so the toggle has to live in
  // localStorage - plain component state reset it each navigation.
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(THEME_KEY);
    } catch {
      stored = null;
    }
    const prefersDark =
      window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/topics", label: "Topics" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/community", label: "Community" },
    { href: "/challenges", label: "Challenges" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BS</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
              BrainSnack
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2">
                  <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.displayName || user.username}
                  </span>
                </Link>
                {isGuest && (
                  <Link href="/register" className="hidden sm:block">
                    <Button size="sm">Sign up</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>
                  {isGuest ? "Exit guest" : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
