"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStartingGuest, setIsStartingGuest] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setError("");
    setIsStartingGuest(true);
    try {
      await continueAsGuest();
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start a guest session. Is the backend running?"
      );
    } finally {
      setIsStartingGuest(false);
    }
  };

  const busy = isLoading || isStartingGuest;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">BS</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign in to continue your learning streak
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Input
                label="Email or username"
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={busy}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={busy}
              />

              <Button type="submit" className="w-full" isLoading={isLoading} disabled={isStartingGuest}>
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Guest is the primary path: every feature works without an account. */}
        <Card>
          <CardContent className="pt-5 text-center space-y-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Just looking around?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Use every feature as a guest. No sign-up, no password. Your progress is saved
                for this browser session.
              </p>
            </div>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGuest}
              isLoading={isStartingGuest}
              disabled={isLoading}
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}