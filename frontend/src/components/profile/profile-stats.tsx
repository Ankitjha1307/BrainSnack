"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatsProps {
  totalXP: number;
  level: number;
  streak: number;
  personalBest: number;
}

export function ProfileStats({ totalXP, level, streak, personalBest }: ProfileStatsProps) {
  const stats = [
    { label: "Total XP", value: totalXP.toLocaleString(), icon: "⚡", color: "from-primary-500 to-primary-700" },
    { label: "Level", value: level.toString(), icon: "🎯", color: "from-green-500 to-green-700" },
    { label: "Streak", value: `${streak} days`, icon: "🔥", color: "from-accent-500 to-accent-700" },
    { label: "Best Score", value: `${personalBest}%`, icon: "🏆", color: "from-purple-500 to-purple-700" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
