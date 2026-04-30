// components/stream/employer/StartScreen.tsx
import React from "react";
import type { LiveStreamSession } from "@/domain/models/LiveStream";
import { globalStyles, IconRadio } from "../common";

interface StartScreenProps {
  session: LiveStreamSession;
  onStart: () => void;
  starting: boolean;
}

export function StartScreen({ session, onStart, starting }: StartScreenProps) {
  return (
    <>
      <style>{globalStyles}</style>
<div style={{
  minHeight: "100svh",
  background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #1e3a8a 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 32,
  padding: "0 32px",
  textAlign: "center",
}}>
  <div style={{
    width: 100, height: 100,
    borderRadius: 28,
    background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
    border: "2px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#60a5fa",
    marginBottom: 8,
  }}>
    <IconRadio size={40} />
  </div>
  
  <div>
    <h1 style={{
      margin: "0 0 12px",
      fontSize: 28,
      fontWeight: 700,
      background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "0.02em",
    }}>
      {session.title}
    </h1>
    <p style={{
      margin: 0,
      fontSize: 15,
      color: "#94a3b8",
      lineHeight: 1.6,
    }}>
      Bắt đầu stream khi bạn đã sẵn sàng
    </p>
  </div>

  <button
    onClick={onStart}
    disabled={starting}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      background: starting
        ? "linear-gradient(135deg, rgba(239,68,68,0.5), rgba(220,38,38,0.5))"
        : "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      border: "none",
      borderRadius: 16,
      padding: "16px 40px",
      fontSize: 16,
      fontWeight: 700,
      cursor: starting ? "default" : "pointer",
      transition: "all 0.3s",
      boxShadow: starting ? "none" : "0 8px 30px rgba(239, 68, 68, 0.3)",
      letterSpacing: "0.02em",
    }}
    onMouseEnter={e => {
      if (!starting) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(239, 68, 68, 0.4)";
      }
    }}
    onMouseLeave={e => {
      if (!starting) {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(239, 68, 68, 0.3)";
      }
    }}
  >
    {starting ? (
      <>
        <div style={{
          width: 20, height: 20,
          border: "2px solid rgba(255,255,255,0.3)",
          borderTop: "2px solid #fff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        Đang khởi động...
      </>
    ) : (
      <>
        <span style={{
          width: 12, height: 12,
          borderRadius: "50%",
          background: "#fff",
          animation: "pulse 1.5s ease-in-out infinite",
          boxShadow: "0 0 15px rgba(255,255,255,0.5)",
        }} />
        Bắt đầu Live Stream
      </>
    )}
  </button>
</div>
    </>
  );
}
