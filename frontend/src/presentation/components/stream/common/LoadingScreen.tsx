// components/stream/common/LoadingScreen.tsx
import React from "react";
import { globalStyles } from "./globalStyles";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export function LoadingScreen({ 
  message = "Đang kết nối...",
  subMessage 
}: LoadingScreenProps) {
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        minHeight: "100svh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a8a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}>
        {/* Animated logo area */}
        <div style={{
          width: 100, height: 100,
          borderRadius: 28,
          background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
          border: "2px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute",
            width: 90, height: 90,
            borderRadius: "50%",
            border: "2px solid rgba(59,130,246,0.3)",
            borderTopColor: "#60a5fa",
            animation: "spin 2s linear infinite",
          }} />
          {/* Inner ring */}
          <div style={{
            position: "absolute",
            width: 70, height: 70,
            borderRadius: "50%",
            border: "2px solid rgba(139,92,246,0.3)",
            borderBottomColor: "#a78bfa",
            animation: "spin 1.5s linear infinite reverse",
          }} />
          {/* Center dot */}
          <div style={{
            width: 12, height: 12,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{
            color: "#e2e8f0",
            fontSize: 16,
            fontWeight: 600,
            margin: 0,
            letterSpacing: "0.02em",
          }}>
            {message}
          </p>
          {subMessage && (
            <p style={{
              color: "rgba(148, 163, 184, 0.7)",
              fontSize: 13,
              margin: "8px 0 0",
            }}>
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </>
  );
}