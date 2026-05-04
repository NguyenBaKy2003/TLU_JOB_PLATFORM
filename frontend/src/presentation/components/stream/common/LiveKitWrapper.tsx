// presentation/components/stream/common/LiveKitWrapper.tsx
"use client";

import { LiveKitRoom, ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";
import type { ReactNode } from "react";

interface LiveKitWrapperProps {
  serverUrl: string;
  token: string;
  connect?: boolean;
  video?: boolean;
  audio?: boolean;
  className?: string;
  showControlBar?: boolean;
  canPublish?: boolean;
  children: ReactNode;
}

export function LiveKitWrapper({
  serverUrl,
  token,
  connect = true,
  video = true,
  audio = true,
  className = "",
  showControlBar = true,
  canPublish = false,
  children
}: LiveKitWrapperProps) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={connect}
      video={video}
      audio={audio}
      className={className}
    >
      {children}
      
      {showControlBar && (
        <div className="shrink-0">
          <ControlBar 
            controls={canPublish ? {
              microphone: true,
              camera: true,
              screenShare: false,
              chat: false,
              leave: false,
            } : undefined}
            className="!bg-white !rounded-xl !border !border-slate-200 !px-5 !py-2.5" 
          />
        </div>
      )}
    </LiveKitRoom>
  );
}