// components/stream/candidate/SpotlightBanner.tsx
import React from "react";
import { IconBriefcase, IconX } from "../common/Icons";

interface SpotlightJob {
  jobPostId: string;
  title?: string;
}

interface SpotlightBannerProps {
  job: SpotlightJob;
  onApply: () => void;
  onDismiss: () => void;
}

export function SpotlightBanner({ job, onApply, onDismiss }: SpotlightBannerProps) {
  return (
    <div style={{
      margin: "0 16px",
      background: "linear-gradient(135deg, #fffbeb, #fef3c7, #fde68a)",
      border: "1px solid #fcd34d",
      borderRadius: 18,
      padding: "16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 4px 20px rgba(245, 158, 11, 0.15)",
      animation: "fadeUp 0.3s ease",
    }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44,
        borderRadius: 14,
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "#fff",
        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
      }}>
        <IconBriefcase size={18} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#92400e",
            background: "rgba(146, 64, 14, 0.1)",
            padding: "2px 8px",
            borderRadius: 6,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            Đang tuyển
          </span>
          <span style={{
            fontSize: 10,
            color: "#a16207",
          }}>
            Spotlight
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 700,
          color: "#1c1917",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
        }}>
          {job.title ?? `Job #${job.jobPostId.slice(0, 8)}`}
        </p>
        <p style={{
          margin: "2px 0 0",
          fontSize: 11,
          color: "#a16207",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}>
          ID: {job.jobPostId.slice(0, 12)}...
        </p>
      </div>

      {/* Actions */}
      <div style={{
        display: "flex",
        gap: 8,
        flexShrink: 0,
      }}>
        <button
          onClick={onApply}
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.02em",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
          }}
        >
          Ứng tuyển ngay
        </button>
        <button
          onClick={onDismiss}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "rgba(146, 64, 14, 0.08)",
            border: "1px solid rgba(146, 64, 14, 0.15)",
            cursor: "pointer",
            color: "#92400e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(146, 64, 14, 0.15)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(146, 64, 14, 0.08)";
          }}
          title="Đóng"
        >
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
}