"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsProps {
  totalXP: number;
  level: number;
  streak: number;
  personalBest: number;
}

export function QuickStats({ totalXP, level, streak, personalBest }: QuickStatsProps) {
  const stats = [
    { label: "Total XP", value: totalXP.toLocaleString(), icon: "⚡", color: "text-primary-600" },
    { label: "Level", value: level.toString(), icon: "🎯", color: "text-foreground" },
    { label: "Streak", value: `${streak} days`, icon: "🔥", color: "text-accent-600" },
    { label: "Best Score", value: `${personalBest}%`, icon: "🏆", color: "text-primary-500" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-xs font-medium text-muted uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
