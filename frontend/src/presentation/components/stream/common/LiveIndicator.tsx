// components/stream/common/LiveIndicator.tsx
import React from "react";

interface LiveIndicatorProps {
  style?: React.CSSProperties;
  size?: "sm" | "md";
}

export function LiveIndicator({ style, size = "sm" }: LiveIndicatorProps) {
  const isSmall = size === "sm";
  
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      borderRadius: 20,
      padding: isSmall ? "4px 12px" : "6px 16px",
      fontSize: isSmall ? 11 : 13,
      fontWeight: 700,
      color: "#fff",
      letterSpacing: "0.05em",
      boxShadow: "0 2px 10px rgba(239, 68, 68, 0.3)",
      ...style,
    }}>
      <span style={{
        width: isSmall ? 7 : 9,
        height: isSmall ? 7 : 9,
        borderRadius: "50%",
        background: "#fff",
        animation: "pulse 1.5s ease-in-out infinite",
        boxShadow: "0 0 10px rgba(255,255,255,0.5)",
      }} />
      LIVE
    </div>
  );
}