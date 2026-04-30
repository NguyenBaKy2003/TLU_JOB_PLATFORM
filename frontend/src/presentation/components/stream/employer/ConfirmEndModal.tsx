// components/stream/employer/ConfirmEndModal.tsx
import React from "react";

interface ConfirmEndModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmEndModal({ onConfirm, onCancel }: ConfirmEndModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#1e293b",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: "28px 28px 24px",
        maxWidth: 360, width: "100%",
        animation: "fadeUp 0.2s ease",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16, color: "#ef4444",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 style={{
          margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#f8fafc",
        }}>
          Kết thúc stream?
        </h3>
        <p style={{
          margin: "0 0 24px", fontSize: 14,
          color: "rgba(255,255,255,0.4)", lineHeight: 1.6,
        }}>
          Stream sẽ kết thúc ngay lập tức. Hệ thống sẽ tự động xử lý recording và tạo AI summary.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)", background: "none",
              color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 12,
              border: "none", background: "#ef4444", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            Kết thúc
          </button>
        </div>
      </div>
    </div>
  );
}