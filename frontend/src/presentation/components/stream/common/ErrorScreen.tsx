// components/stream/common/ErrorScreen.tsx
import React from "react";
import { IconWifi } from "./Icons";
import { globalStyles } from "./globalStyles";

interface ErrorScreenProps {
  message?: string;
  subMessage?: string;
  onBack?: () => void;
}

export function ErrorScreen({ 
  message = "Không thể kết nối",
  subMessage = "Vui lòng kiểm tra kết nối và thử lại",
  onBack 
}: ErrorScreenProps) {
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
        padding: "0 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: 24,
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#f87171",
        }}>
          <IconWifi size={36} />
        </div>
        
        <div>
          <h2 style={{
            margin: "0 0 8px",
            fontSize: 20,
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: "0.02em",
          }}>
            {message}
          </h2>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: "#94a3b8",
            lineHeight: 1.6,
          }}>
            {subMessage}
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "12px 32px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Thử lại
          </button>
        )}
      </div>
    </>
  );
}