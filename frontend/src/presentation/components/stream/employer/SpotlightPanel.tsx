// components/stream/employer/SpotlightPanel.tsx
import React, { useState } from "react";
import { Pin, X, Briefcase } from "lucide-react";

interface SpotlightPanelProps {
  sessionId: string;
  onSpotlight: (id: string) => void;
  spotlighting: boolean;
  spotlightedJobs: string[];
  onRemove: (id: string) => void;
}

export function SpotlightPanel({
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
    <div className="flex flex-col gap-5 h-full bg-[#1e3a5f]">
      {/* Header info */}
      <div className="px-5 pt-5 pb-0">
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Pin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">Spotlight Job</p>
            <p className="text-xs text-amber-400/60 mt-0.5">Ghim vị trí tuyển dụng lên stream</p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-5">
        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2 block">
          Job Post ID
        </label>
        <div className="flex gap-2">
          <input
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSpotlight()}
            placeholder="Nhập ID bài đăng..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-500/50 focus:bg-white/15 transition-colors"
          />
          <button
            onClick={handleSpotlight}
            disabled={spotlighting || !jobId.trim()}
            className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${jobId.trim() && !spotlighting
                ? "bg-amber-500 text-white hover:bg-amber-400 cursor-pointer"
                : "bg-white/10 text-white/20 cursor-default"
              }
            `}
          >
            {spotlighting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Divider */}
      {spotlightedJobs.length > 0 && (
        <div className="px-5">
          <div className="h-px bg-white/10" />
        </div>
      )}

      {/* Spotlighted jobs list */}
      {spotlightedJobs.length > 0 && (
        <div className="flex flex-col gap-2 px-5 pb-5 flex-1 overflow-auto">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
            Đang ghim ({spotlightedJobs.length})
          </p>
          
          {spotlightedJobs.map((id, index) => (
            <div
              key={id}
              className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 hover:bg-amber-500/15 transition-colors group"
            >
              {/* Number badge */}
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {index + 1}
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-sm font-medium text-amber-200 truncate">
                    {id}
                  </span>
                </div>
                <p className="text-[11px] text-amber-400/50 mt-0.5 ml-5">
                  Đang hiển thị trên stream
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                title="Gỡ ghim"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {spotlightedJobs.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-5">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
            <Pin className="w-6 h-6 text-white/15" />
          </div>
          <p className="text-sm text-white/25 text-center">
            Chưa có job nào được ghim
          </p>
          <p className="text-xs text-white/15 text-center mt-1">
            Nhập ID và nhấn ghim để hiển thị
          </p>
        </div>
      )}
    </div>
  );
}