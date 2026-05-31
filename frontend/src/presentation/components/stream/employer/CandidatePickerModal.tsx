"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Search, Users, Briefcase, Sparkles,
  CheckCircle2, Loader2, UserCheck, ChevronDown,
} from "lucide-react";
import { Bolt } from "lucide-react";
import { ApplicationService }    from "@/application/services/ApplicationService";
import { ApplicationRepository } from "@/infrastructure/repositories/ApplicationRepository";
import type { ApplicationWithCandidate, ApplicationStatus } from "@/domain/models/Application";

const service = new ApplicationService(new ApplicationRepository());

function scoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 50) return { bar: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50"  };
  return               { bar: "bg-red-400",        text: "text-red-600",     bg: "bg-red-50"    };
}

function initials(name: string) {
  return name.trim().split(" ").slice(-2).map(w => w[0]).join("").toUpperCase() || "?";
}

const STATUS_OPTIONS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"        },
  { value: "SUBMITTED",           label: "Mới nộp"       },
  { value: "REVIEWING",           label: "Đang xét"      },
  { value: "SHORTLISTED",         label: "Vào danh sách" },
  { value: "INTERVIEW_SCHEDULED", label: "Đã lên lịch"   },
  { value: "OFFERED",             label: "Đã offer"      },
  { value: "HIRED",               label: "Đã tuyển"      },
];

const PAGE_SIZE = 10;

interface Props {
  slotId:    string;
  slotLabel: string;
  sessionId: string;
  onInvite:  (sessionId: string, candidateId: string, slotId: string) => Promise<void>;
  onClose:   () => void;
}

function CandidateRow({
  app, selected, onSelect,
}: {
  app: ApplicationWithCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  const name   = app.candidate?.fullName ?? app.candidateName ?? "";
  const email  = app.candidate?.email    ?? app.candidateEmail ?? "";
  const score  = app.aiScore;
  const colors = score != null ? scoreColor(score) : null;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl
        border transition-all duration-150
        ${selected
          ? "border-blue-400 bg-blue-50 ring-1 ring-blue-300"
          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
        }`}
    >
      <div className="relative flex-shrink-0">
        {app.candidate?.avatarUrl ? (
          <img src={app.candidate.avatarUrl} alt={name}
            className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
        ) : (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
            text-[13px] font-bold
            ${selected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
            {initials(name)}
          </div>
        )}
        {app.candidate?.boosted && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full
            flex items-center justify-center" title="Ứng viên nổi bật">
            <Bolt size={8} className="text-white fill-white" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-semibold text-gray-900 truncate">{name}</span>
          {app.candidate?.boosted && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full
              bg-amber-100 text-amber-700">Nổi bật</span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
        {app.job?.title && (
          <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
            <Briefcase size={9} className="text-gray-400 flex-shrink-0" />
            {app.job.title}
          </p>
        )}
      </div>

      {score != null && colors ? (
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
            {score}/100
          </span>
          <div className="w-16 h-1 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
          {selected && <CheckCircle2 size={16} className="text-blue-500" />}
        </div>
      )}
      {selected && score != null && (
        <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
      )}
    </button>
  );
}

export function CandidatePickerModal({
  slotId, slotLabel, sessionId, onInvite, onClose,
}: Props) {
  const [apps,          setApps]          = useState<ApplicationWithCandidate[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [pendingSearch, setPendingSearch] = useState(""); // giá trị đang gõ, chưa submit
  const [statusFilter,  setStatusFilter]  = useState<ApplicationStatus | "ALL">("ALL");
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [inviting,      setInviting]      = useState(false);
  const [statusOpen,    setStatusOpen]    = useState(false);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (
    p: number,
    status: ApplicationStatus | "ALL",
    q: string,
  ) => {
    setLoading(true);
    try {
      const res = await service.getApplicationsByCompany(
        p,
        PAGE_SIZE,
        status === "ALL" ? undefined : status,
        q.trim() || undefined,   // truyền search lên server
      );
      setApps(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, statusFilter, search);
  }, [page, statusFilter, search, load]);

  // Debounce search 400ms
  const handleSearchInput = (val: string) => {
    setPendingSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(0);
      setSelectedId(null);
    }, 400);
  };

  const handleStatusChange = (val: ApplicationStatus | "ALL") => {
    setStatusFilter(val);
    setStatusOpen(false);
    setPage(0);
    setSelectedId(null);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    setSelectedId(null);
  };

  const selectedApp = apps.find(a => a.candidateId === selectedId);

  const handleInvite = async () => {
    if (!selectedId) return;
    setInviting(true);
    try {
      await onInvite(sessionId, selectedId, slotId);
      onClose();
    } finally {
      setInviting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const activeStatusLabel = STATUS_OPTIONS.find(s => s.value === statusFilter)?.label ?? "Tất cả";

  // range hiển thị: "1–10 / 45"
  const rangeFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeTo   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm p-4"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col
          max-h-[88vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
              <UserCheck size={16} className="text-blue-600" />
              Mời ứng viên phỏng vấn
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {slotLabel} · Chọn 1 ứng viên để gửi lời mời
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 pt-3 pb-2 flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {loading && pendingSearch && (
              <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-300 animate-spin" />
            )}
            <input
              type="text"
              placeholder="Tìm tên, email, vị trí..."
              value={pendingSearch}
              onChange={e => handleSearchInput(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-[13px] bg-gray-50 border border-gray-200
                rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300
                focus:border-blue-400 placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setStatusOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium
                bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100
                transition-colors whitespace-nowrap"
            >
              {activeStatusLabel}
              <ChevronDown size={12}
                className={`text-gray-400 transition-transform ${statusOpen ? "rotate-180" : ""}`} />
            </button>
            {statusOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl
                border border-gray-100 shadow-lg py-1 z-10">
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => handleStatusChange(opt.value)}
                    className={`w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 transition-colors
                      ${statusFilter === opt.value ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Count */}
        <div className="px-5 pb-1 min-h-[20px]">
          <p className="text-[11px] text-gray-400">
            {loading
              ? "Đang tải..."
              : totalElements === 0
                ? "Không có ứng viên"
                : `${rangeFrom}–${rangeTo} / ${totalElements} ứng viên`
            }
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1 min-h-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <p className="text-xs">Đang tải danh sách ứng viên...</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Users size={28} strokeWidth={1.2} />
              <p className="text-xs">Không tìm thấy ứng viên nào</p>
            </div>
          ) : (
            apps.map(app => (
              <CandidateRow
                key={app.id}
                app={app}
                selected={selectedId === app.candidateId}
                onSelect={() =>
                  setSelectedId(prev => prev === app.candidateId ? null : app.candidateId)
                }
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-5 py-2.5
            border-t border-gray-50">
            <button
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1 text-xs rounded-lg border border-gray-200
                disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Trước
            </button>

            {/* Page numbers — hiển thị tối đa 5 trang */}
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
                    <span key={`ellipsis-${idx}`} className="text-[11px] text-gray-300 px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item as number)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-colors
                        ${page === item
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
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
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1 text-xs rounded-lg border border-gray-200
                disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Sau →
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          {selectedApp ? (
            <div className="flex items-center gap-3 mb-3 bg-white rounded-xl
              border border-blue-100 px-3 py-2.5">
              {selectedApp.candidate?.avatarUrl ? (
                <img src={selectedApp.candidate.avatarUrl}
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center
                  justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                  {initials(selectedApp.candidate?.fullName ?? selectedApp.candidateName ?? "")}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">
                  {selectedApp.candidate?.fullName ?? selectedApp.candidateName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {selectedApp.job?.title ?? ""}
                </p>
              </div>
              {selectedApp.aiScore != null && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                  ${scoreColor(selectedApp.aiScore).bg} ${scoreColor(selectedApp.aiScore).text}`}>
                  <Sparkles size={9} className="inline mr-0.5" />
                  {selectedApp.aiScore}/100
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-3 text-center">Chưa chọn ứng viên nào</p>
          )}

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px]
                font-medium text-gray-600 hover:bg-gray-100 transition-colors">
              Huỷ
            </button>
            <button
              onClick={handleInvite}
              disabled={!selectedId || inviting}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5
                rounded-xl text-[13px] font-semibold text-white transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            >
              {inviting
                ? <><Loader2 size={14} className="animate-spin" /> Đang gửi...</>
                : <><UserCheck size={14} /> Gửi lời mời</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}