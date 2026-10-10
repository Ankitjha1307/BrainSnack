"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Compass,
  Menu,
  Moon,
  Swords,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEME_KEY = "brainsnack-theme";

const navLinks = [
  { href: "/community", label: "Feed", icon: Compass },
  { href: "/topics", label: "Explore", icon: BookOpen },
  { href: "/dashboard", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/challenges", label: "Challenges", icon: Swords },
];

const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
  try {
    window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // Keep the current-page preference when browser storage is unavailable.
  }
};

export function Navbar() {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(THEME_KEY);
    } catch {
      stored = null;
    }
    // BrainSnack starts in the warmer, more readable light theme. A saved
    // choice still wins on later visits.
    const dark = stored === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/dashboard"
            aria-label="BrainSnack home"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm transition-colors hover:bg-surface-muted"
          >
            <span className="font-serif text-lg tracking-tight sm:text-xl">BrainSnack</span>
          </Link>

          <div className="relative" ref={profileRef}>
            {isAuthenticated && user ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="rounded-base p-1 pr-2.5"
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <Avatar
                    src={user.avatarUrl ?? undefined}
                    alt={user.username}
                    fallback={user.username}
                    size="sm"
                  />
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted transition-transform",
                      profileOpen && "rotate-180"
                    )}
                  />
                </Button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-border bg-surface p-2 text-foreground shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                    >
                      View profile
                    </Link>
                    {isGuest && (
                      <Link
                        href="/register"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                      >
                        Save my progress
                      </Link>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleDark}
                      className="h-auto w-full justify-between rounded-base px-3 py-2.5 text-left text-sm shadow-none"
                    >
                      {isDark ? "Light theme" : "Dark theme"}
                      <Moon className="h-4 w-4 text-muted" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="h-auto w-full justify-start rounded-base px-3 py-2.5 text-left text-sm text-foreground shadow-none"
                    >
                      {isGuest ? "Exit guest session" : "Log out"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-surface-muted"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

      </header>

      <nav
          aria-label="Main navigation"
          className="fixed bottom-4 left-1/2 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 overflow-hidden rounded-full border border-border bg-surface/90 p-1.5 shadow-md backdrop-blur-md"
        >
          <div className="hidden items-center justify-center gap-1 sm:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-sans text-sm font-medium text-foreground/65 transition-colors hover:bg-secondary-background/70 hover:text-foreground dark:hover:bg-secondary-background/10",
                    isActive(link.href) &&
                      "bg-primary-300 text-main-foreground shadow-sm hover:bg-primary-200 hover:text-main-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-base sm:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Navigation
          </Button>

          {mobileMenuOpen && (
            <div className="flex flex-wrap justify-center gap-1 border-t border-border/70 pt-1 sm:hidden">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-foreground/70",
                      isActive(link.href) && "bg-primary-300 text-main-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
      </nav>
    </>
  );
}
