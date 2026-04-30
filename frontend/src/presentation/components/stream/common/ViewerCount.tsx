// components/stream/common/ViewerCount.tsx
"use client";

import React, { useEffect, useState } from "react";
import { IconEye } from "./Icons";

interface ViewerCountProps {
  count: number;
  variant?: "light" | "dark" | "glass";
}

export function ViewerCount({ count, variant = "glass" }: ViewerCountProps) {
  const [display, setDisplay] = useState(count);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (count !== display) {
      setFlash(true);
      const t = setTimeout(() => { setDisplay(count); setFlash(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [count, display]);

  const styles: Record<string, React.CSSProperties> = {
    light: {
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(10px)",
    },
    dark: {
      background: "rgba(30, 41, 59, 0.8)",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      backdropFilter: "blur(10px)",
    },
    glass: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      backdropFilter: "blur(20px)",
    },
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 14px",
      borderRadius: 20,
      transition: "all 0.3s ease",
      ...styles[variant],
    }}>
      <IconEye size={14} />
      <span style={{
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 13,
        fontWeight: 600,
        color: flash ? "#10b981" : "#e2e8f0",
        transition: "color 0.3s",
      }}>
        {display.toLocaleString()}
      </span>
    </div>
  );
}