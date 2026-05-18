// components/stream/common/VideoArea.tsx
"use client";

import React from "react";
import { Track } from "livekit-client";
import {
  useTracks,
  useParticipants,
  VideoTrack,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { LiveIndicator } from "./LiveIndicator";
import { ViewerCount } from "./ViewerCount";
import { Eye } from "lucide-react";

interface VideoAreaProps {
  viewerCount: number;
  showControls?: boolean;
  canPublish?: boolean;
}

export function VideoArea({ viewerCount, showControls = false, canPublish = false }: VideoAreaProps) {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: false }
  );

  const participants = useParticipants();
  const remoteParticipants = participants.filter(p => !p.isLocal);

  const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare);
  const allCameraTracks = tracks.filter(t => t.source === Track.Source.Camera && t.participant.identity);
  const localCameraTrack = allCameraTracks.find(t => t.participant.isLocal);
  const remoteCameraTracks = allCameraTracks.filter(t => !t.participant.isLocal);

  const hasScreenShare = screenShareTrack && screenShareTrack.publication?.isSubscribed;
  const isEmployer = showControls;
  const isInterviewCandidate = !showControls && canPublish;
  const hasRemoteParticipants = remoteParticipants.length > 0;

  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  const renderPlaceholder = (name: string, isMuted: boolean, isLocal: boolean) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700">
      <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
        <span className="text-white text-lg font-bold">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-2 truncate px-2 max-w-full">
        {name || (isLocal ? "Bạn" : "Unknown")}
      </p>
      <p className="text-[10px] text-slate-500 mt-0.5">
        {isMuted ? "Camera đang tắt" : "Đang kết nối..."}
      </p>
    </div>
  );

  const renderCameraBox = (track: any, isLocal: boolean, compact = false) => {
    const name = isLocal
      ? "Bạn"
      : (track.participant.name || track.participant.identity?.split("-")?.pop() || "Speaker");
    const isMuted = track.publication?.isMuted ?? true;
    const isSubscribed = track.publication?.isSubscribed ?? false;

    return (
      <div
        className={`relative rounded-lg overflow-hidden bg-slate-700 ${
          compact ? "aspect-video" : "h-full"
        } ${isLocal ? "ring-2 ring-green-500" : ""}`}
      >
        {isSubscribed && !isMuted ? (
          <VideoTrack trackRef={track} className="w-full h-full object-cover" />
        ) : (
          renderPlaceholder(name, isMuted, isLocal)
        )}
        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {isLocal && isMuted ? `Tắt • ${name}` : name}
        </div>
        {!isLocal && isMuted && isSubscribed && (
          <div className="absolute top-1 right-1 bg-red-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            Tắt
          </div>
        )}
      </div>
    );
  };

  const renderParticipantPlaceholder = (participant: any, compact = false) => {
    const name = participant.name || participant.identity?.split("-")?.pop() || "Speaker";
    return (
      <div
        key={participant.identity}
        className={`relative rounded-lg overflow-hidden bg-slate-700 ${compact ? "aspect-video" : "h-full"}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 truncate px-2 max-w-full">{name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Camera đang tắt</p>
        </div>
        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {name}
        </div>
      </div>
    );
  };

  const renderRemoteParticipantsGrid = (compact = false) => {
    return remoteParticipants.map(participant => {
      const track = remoteCameraTracks.find(t => t.participant.identity === participant.identity);
      if (track) {
        return (
          <div key={participant.identity}>
            {renderCameraBox(track, false, compact)}
          </div>
        );
      }
      return renderParticipantPlaceholder(participant, compact);
    });
  };

  // ===================================================================
  // EMPLOYER MODE
  // ===================================================================
  if (isEmployer) {
    return (
      <div className="relative w-full h-full bg-slate-800 rounded-lg overflow-hidden">
        {hasScreenShare ? (
          <div className="absolute inset-0 flex gap-2 p-2">
            <div className="flex-1 relative rounded-lg overflow-hidden bg-slate-900">
              <VideoTrack trackRef={screenShareTrack} className="w-full h-full object-contain" />
            </div>
            <div className="w-56 shrink-0 flex flex-col gap-2 overflow-y-auto">
              {localCameraTrack && renderCameraBox(localCameraTrack, true, true)}
              {renderRemoteParticipantsGrid(true)}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex gap-2 p-2">
            <div className="flex-1">
              {hasRemoteParticipants ? (
                <div className={`w-full h-full grid ${getGridClass(remoteParticipants.length)} gap-1`}>
                  {renderRemoteParticipantsGrid()}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-600 border-t-blue-500 animate-spin" />
                  <p className="text-[16px] text-slate-400">Đang chờ người tham gia...</p>
                  <p className="text-xs text-slate-500">Chia sẻ link để mời ứng viên</p>
                </div>
              )}
            </div>
            <div className="w-56 shrink-0">
              {localCameraTrack ? (
                renderCameraBox(localCameraTrack, true, true)
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-700 ring-2 ring-blue-500">
                  {renderPlaceholder("Bạn", true, true)}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <LiveIndicator size="sm" />
          <ViewerCount count={viewerCount} variant="light" />
          {hasScreenShare && (
            <div className="bg-blue-500/90 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              Màn hình chia sẻ
            </div>
          )}
        </div>

        <RoomAudioRenderer />
      </div>
    );
  }

  // ===================================================================
  // CANDIDATE MODE - Full height, no aspect-video
  // ===================================================================
  return (
    <div className="relative w-full h-full bg-slate-800 rounded-lg overflow-hidden">
      {hasScreenShare ? (
        <div className="absolute inset-0 flex gap-2 p-2">
          <div className="flex-1 relative rounded-lg overflow-hidden bg-slate-900">
            <VideoTrack trackRef={screenShareTrack} className="w-full h-full object-contain" />
          </div>
          <div className="w-44 shrink-0 flex flex-col gap-2 overflow-y-auto">
            {renderRemoteParticipantsGrid(true)}
            {isInterviewCandidate && localCameraTrack && renderCameraBox(localCameraTrack, true, true)}
          </div>
        </div>
      ) : hasRemoteParticipants ? (
        <div className="absolute inset-0">
          <div className={`absolute inset-0 grid ${getGridClass(remoteParticipants.length)} gap-1 p-1`}>
            {renderRemoteParticipantsGrid()}
          </div>
          {isInterviewCandidate && localCameraTrack && !localCameraTrack.publication?.isMuted && (
            <div className="absolute bottom-3 right-3 w-40 sm:w-48 aspect-video rounded-lg overflow-hidden border-2 border-green-500 shadow-lg z-10 bg-slate-700">
              <VideoTrack trackRef={localCameraTrack} className="w-full h-full object-cover" />
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">Bạn</div>
            </div>
          )}
          {isInterviewCandidate && localCameraTrack && localCameraTrack.publication?.isMuted && (
            <div className="absolute bottom-3 right-3 w-40 sm:w-48 aspect-video rounded-lg overflow-hidden border-2 border-slate-500 shadow-lg z-10 bg-slate-700 flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="text-white text-[16px] font-bold">B</span>
              </div>
              <p className="text-[10px] text-slate-400">Cam tắt</p>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">Bạn</div>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-[16px] text-slate-400">Đang kết nối stream...</p>
          <p className="text-xs text-slate-500">Chờ host bật camera</p>
          {isInterviewCandidate && localCameraTrack && !localCameraTrack.publication?.isMuted && (
            <div className="mt-2 w-40 aspect-video rounded-lg overflow-hidden border-2 border-green-500 bg-slate-700">
              <VideoTrack trackRef={localCameraTrack} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <LiveIndicator size="sm" />
          <div className="flex items-center gap-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3" />
            {viewerCount.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {hasScreenShare && (
            <div className="bg-blue-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Màn hình chia sẻ
            </div>
          )}
          {isInterviewCandidate && localCameraTrack && !localCameraTrack.publication?.isMuted && (
            <div className="bg-green-500/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Camera đang bật
            </div>
          )}
        </div>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}