// components/stream/common/VideoArea.tsx
"use client";

import React from "react";
import { Track } from "livekit-client";
import { useTracks, VideoTrack, RoomAudioRenderer } from "@livekit/components-react";
import { LiveIndicator } from "./LiveIndicator";
import { ViewerCount } from "./ViewerCount";

interface VideoAreaProps {
  viewerCount: number;
  showControls?: boolean;
}

export function VideoArea({ viewerCount, showControls = false }: VideoAreaProps) {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: !showControls }
  );

  const main = tracks.find(
    t => t.source === Track.Source.Camera || t.source === Track.Source.ScreenShare
  );

  return (
    <div style={{
      position: "relative",
      width: "100%",
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)",
      borderRadius: showControls ? 20 : 0,
      overflow: "hidden",
      border: showControls ? "1px solid rgba(148, 163, 184, 0.1)" : "none",
      boxShadow: showControls ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
      ...(showControls ? { height: "100%" } : { aspectRatio: "16/9" }),
    }}>
      {main ? (
        <VideoTrack
          trackRef={main}
          style={{
            width: "100%",
            height: "100%",
            objectFit: showControls ? "cover" : "contain",
          }}
        />
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 16,
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              border: "3px solid rgba(59, 130, 246, 0.2)",
              borderTopColor: "#3b82f6",
              animation: "spin 1.5s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 15,
              borderRadius: "50%",
              border: "2px solid rgba(139, 92, 246, 0.2)",
              borderBottomColor: "#8b5cf6",
              animation: "spin 2s linear infinite reverse",
            }} />
          </div>
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}>
            Đang kết nối stream...
          </p>
        </div>
      )}

      {/* Top overlay */}
      <div style={{
        position: "absolute", top: 16, left: 16, right: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <LiveIndicator size="sm" />
        <div style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "2px",
        }}>
          <ViewerCount count={viewerCount} variant="light" />
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 60,
        background: "linear-gradient(to top, rgba(15,23,42,0.6), transparent)",
        pointerEvents: "none",
      }} />

      <RoomAudioRenderer />
    </div>
  );
}