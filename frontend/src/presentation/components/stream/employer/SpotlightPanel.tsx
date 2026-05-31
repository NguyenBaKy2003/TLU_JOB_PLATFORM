"use client";
import React, { useState, useEffect } from "react";
import { Pin, X, Briefcase, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { JobService }    from "@/application/services/JobService";
import { JobRepository } from "@/infrastructure/repositories/JobRepository";
import type { JobPost }  from "@/domain/models/Job";

const service  = new JobService(new JobRepository());
const PAGE_SIZE = 8;

interface SpotlightPanelProps {
  sessionId:       string;
  onSpotlight:     (id: string) => void;
  spotlighting:    boolean;
  spotlightedJobs: string[];
  onRemove:        (id: string) => void;
}

export function SpotlightPanel({
  onSpotlight,
  spotlighting,
  spotlightedJobs,
  onRemove,
}: SpotlightPanelProps) {
  const [jobs,         setJobs]         = useState<JobPost[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalElements,setTotalElements]= useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await service.getMyJobs(page, PAGE_SIZE, { status: "PUBLISHED" });
        setJobs(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements ?? res.content.length);
      } catch {
        setError("Không thể tải danh sách tin tuyển dụng");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const availableJobs = jobs.filter(j => !spotlightedJobs.includes(j.id));

  const rangeFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeTo   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="flex flex-col h-full bg-[#1e3a5f]">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Pin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[16px] font-semibold text-amber-300">Spotlight Job</p>
            <p className="text-xs text-amber-400/60 mt-0.5">Ghim vị trí tuyển dụng lên stream</p>
          </div>
        </div>
      </div>

      {/* Job list */}
      <div className="px-5 flex flex-col gap-2 flex-1 min-h-0">

        {/* Count */}
        <div className="flex items-center justify-between shrink-0">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            Tin đang tuyển
          </p>
          {!loading && totalElements > 0 && (
            <p className="text-[11px] text-white/25">
              {rangeFrom}–{rangeTo} / {totalElements}
            </p>
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-white/30">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Đang tải...</span>
            </div>
          ) : error ? (
            <p className="text-xs text-red-400/70 text-center py-6">{error}</p>
          ) : availableJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Briefcase size={24} className="text-white/15" />
              <p className="text-xs text-white/25 text-center">
                {jobs.length === 0 ? "Không có tin đang tuyển" : "Tất cả tin đã được ghim"}
              </p>
            </div>
          ) : (
            availableJobs.map(job => (
              <button
                key={job.id}
                onClick={() => onSpotlight(job.id)}
                disabled={spotlighting}
                className="flex items-center gap-3 bg-white/5 border border-white/10
                  rounded-xl px-4 py-3 hover:bg-amber-500/10 hover:border-amber-500/30
                  transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed
                  shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center
                  justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{job.title}</p>
                  {job.location && (
                    <p className="text-[11px] text-white/30 truncate mt-0.5">{job.location}</p>
                  )}
                </div>
                <Pin className="w-3.5 h-3.5 text-white/20 shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 py-2 shrink-0">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px]
                text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30
                disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} /> Trước
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i =>
                  i === 0 ||
                  i === totalPages - 1 ||
                  Math.abs(i - page) <= 1
                )
                .reduce<(number | "...")[]>((acc, i, idx, arr) => {
                  if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`e-${idx}`} className="text-[11px] text-white/20 px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-colors
                        ${page === item
                          ? "bg-amber-500 text-white"
                          : "text-white/40 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {(item as number) + 1}
                    </button>
                  )
                )
              }
            </div>

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px]
                text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30
                disabled:cursor-not-allowed transition-colors"
            >
              Sau <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      {spotlightedJobs.length > 0 && (
        <div className="px-5 py-2 shrink-0">
          <div className="h-px bg-white/10" />
        </div>
      )}

      {/* Pinned jobs */}
      {spotlightedJobs.length > 0 && (
        <div className="flex flex-col gap-2 px-5 pb-5 shrink-0 max-h-[35%] overflow-y-auto">
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider sticky top-0 bg-[#1e3a5f] py-1">
            Đang ghim ({spotlightedJobs.length})
          </p>
          {spotlightedJobs.map((id, index) => {
            const job = jobs.find(j => j.id === id);
            return (
              <div key={id}
                className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20
                  rounded-xl px-4 py-3 group shrink-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center
                  justify-center text-xs font-bold text-white shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-amber-200 truncate">
                    {job?.title ?? id}
                  </p>
                  <p className="text-[11px] text-amber-400/50 mt-0.5">Đang hiển thị trên stream</p>
                </div>
                <button
                  onClick={() => onRemove(id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30
                    hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0
                    opacity-0 group-hover:opacity-100"
                  title="Gỡ ghim"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}