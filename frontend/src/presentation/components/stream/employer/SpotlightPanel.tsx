// components/stream/employer/SpotlightPanel.tsx
import React, { useState } from "react";
import { IconPin, IconX } from "../common/Icons";

interface SpotlightPanelProps {
  sessionId: string;
  onSpotlight: (id: string) => void;
  spotlighting: boolean;
  spotlightedJobs: string[];
  onRemove: (id: string) => void;
}

export function SpotlightPanel({
  sessionId,
  onSpotlight,
  spotlighting,
  spotlightedJobs,
  onRemove,
}: SpotlightPanelProps) {
  const [jobId, setJobId] = useState("");

  const handleSpotlight = () => {
    if (jobId.trim()) {
      onSpotlight(jobId.trim());
      setJobId("");
    }
  };

  return (
    <div style={{
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      height: "100%",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.08))",
        border: "1px solid rgba(251, 191, 36, 0.15)",
        borderRadius: 14,
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
        }}>
          <IconPin size={16} />
        </div>
        <div>
          <p style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "#fbbf24",
            letterSpacing: "0.02em",
          }}>
            Spotlight Job
          </p>
          <p style={{
            margin: "2px 0 0",
            fontSize: 11,
            color: "rgba(251, 191, 36, 0.6)",
          }}>
            Ghim vị trí tuyển dụng lên stream
          </p>
        </div>
      </div>

      {/* Input area */}
      <div>
        <label style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}>
          Job Post ID
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSpotlight()}
            placeholder="Nhập ID bài đăng..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 13,
              color: "#e2e8f0",
              outline: "none",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#fbbf24";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251, 191, 36, 0.1)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          />
          <button
            onClick={handleSpotlight}
            disabled={spotlighting || !jobId.trim()}
            style={{
              width: 42, height: 42,
              borderRadius: 12,
              border: "none",
              background: jobId.trim() && !spotlighting
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "rgba(255,255,255,0.05)",
              color: jobId.trim() && !spotlighting
                ? "#fff"
                : "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: jobId.trim() && !spotlighting ? "pointer" : "default",
              flexShrink: 0,
              transition: "all 0.2s",
              boxShadow: jobId.trim() && !spotlighting
                ? "0 4px 15px rgba(245, 158, 11, 0.3)"
                : "none",
            }}
            onMouseEnter={e => {
              if (jobId.trim() && !spotlighting) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {spotlighting ? (
              <div style={{
                width: 14, height: 14,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            ) : (
              <IconPin size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Divider */}
      {spotlightedJobs.length > 0 && (
        <div style={{
          height: 1,
          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
          margin: "4px 0",
        }} />
      )}

      {/* Spotlighted jobs list */}
      {spotlightedJobs.length > 0 && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          overflow: "auto",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px",
          }}>
            <p style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Đang ghim ({spotlightedJobs.length})
            </p>
          </div>

          {spotlightedJobs.map((id, index) => (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.06), rgba(245, 158, 11, 0.06))",
                border: "1px solid rgba(251, 191, 36, 0.15)",
                borderRadius: 12,
                padding: "10px 14px",
                animation: `slideIn 0.3s ease ${index * 0.05}s both`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))";
                e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.3)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(251, 191, 36, 0.06), rgba(245, 158, 11, 0.06))";
                e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.15)";
              }}
            >
              {/* Number badge */}
              <div style={{
                width: 24, height: 24,
                borderRadius: 7,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}>
                {index + 1}
              </div>

              {/* Job info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                }}>
                  <IconPin size={10} />
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fbbf24",
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {id}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 10,
                  color: "rgba(251, 191, 36, 0.5)",
                }}>
                  Đang hiển thị trên stream
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(id)}
                style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  cursor: "pointer",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                }}
                title="Gỡ ghim"
              >
                <IconX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}