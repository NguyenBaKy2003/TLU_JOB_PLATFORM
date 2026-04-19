"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Search, Users, Clock, CheckCircle, XCircle,
  ChevronDown, AlertTriangle, Ban,
} from "lucide-react";
import { ApplicationStatusBadge }   from "@/presentation/components/applications/ApplicationStatusBadge";
import { AIScorePanel }             from "@/presentation/components/applications/AIScorePanel";
import { ApplicationDetailDrawer }  from "@/presentation/components/applications/ApplicationDetailDrawer";
import { Pagination }               from "@/presentation/components/common/Pagination";
import { AdminApplicationService }  from "@/application/services/AdminApplicationService";
import { AdminApplicationRepository } from "@/infrastructure/repositories/AdminApplicationRepository";
import { useToast }                 from "@/presentation/components/ui/toast";
import { extractErrorMessage }      from "@/lib/extractErrorMessage";
import type {
  AdminApplication,
  ApplicationStatus,
} from "@/domain/models/AdminApplication";

// ── Constants ────────────────────────────────────────────────────────────────

const service = new AdminApplicationService(new AdminApplicationRepository());

const STATUS_FILTERS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL",                 label: "Tất cả"    },
  { value: "SUBMITTED",           label: "Mới nộp"   },
  { value: "REVIEWING",           label: "Đang xem"  },
  { value: "SHORTLISTED",         label: "Rút gọn"   },
  { value: "INTERVIEW_SCHEDULED", label: "Lịch PV"   },
  { value: "HIRED",               label: "Đã tuyển"  },
  { value: "REJECTED",            label: "Từ chối"   },
  { value: "WITHDRAWN",           label: "Đã rút"    },
  { value: "CANCELLED",           label: "Đã hủy"    },
];

const PAGE_SIZE = 20;

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-36" />
            <div className="h-2.5 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="w-7 h-7 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Modal override trạng thái — SUPER_ADMIN only */
function OverrideStatusModal({
  app,
  onClose,
  onConfirm,
}: {
  app: AdminApplication;
  onClose: () => void;
  onConfirm: (status: ApplicationStatus, reason: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const STATUSES: ApplicationStatus[] = [
    "SUBMITTED", "REVIEWING", "SHORTLISTED",
    "INTERVIEW_SCHEDULED", "HIRED", "REJECTED", "WITHDRAWN", "CANCELLED",
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(status, reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle size={20} />
          <h2 className="font-semibold text-base">Override Trạng Thái</h2>
        </div>

        <p className="text-sm text-gray-500">
          Bạn đang override trạng thái đơn của{" "}
          <strong>{app.candidateName}</strong>. Hành động này sẽ được ghi log.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">Trạng thái mới</label>
          <div className="relative">
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ApplicationStatus)}
              className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2 text-sm
                outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-8"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">
            Lý do <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do override (bắt buộc)..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="px-4 py-2 text-sm rounded-xl bg-amber-500 text-white font-medium
              hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang xử lý..." : "Xác nhận override"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal cancel toàn bộ đơn theo job — SUPER_ADMIN only */
function CancelByJobModal({
  jobPostId,
  onClose,
  onConfirm,
}: {
  jobPostId: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-red-600">
          <Ban size={20} />
          <h2 className="font-semibold text-base">Cancel toàn bộ đơn</h2>
        </div>

        <p className="text-sm text-gray-500">
          Tất cả đơn chưa hoàn tất của bài đăng{" "}
          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{jobPostId}</code>{" "}
          sẽ bị cancel. Không thể hoàn tác.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">
            Lý do <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do (bắt buộc)..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
              outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white font-medium
              hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang xử lý..." : "Xác nhận cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

/**
 * Admin: Quản lý toàn bộ đơn ứng tuyển theo công ty.
 *
 * Props:
 *   companyId  — bắt buộc, lấy từ searchParams hoặc route param của admin dashboard
 *   isSuperAdmin — hiện nút Override & Cancel
 */
export default function AdminApplicationsPage({
  jobPostId: defaultJobPostId,
  isSuperAdmin = false,
}: {
  jobPostId?:       string;
  isSuperAdmin?:    boolean;
}) {
  const toast = useToast();

  const [apps,          setApps]          = useState<AdminApplication[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [statusFilter,  setStatusFilter]  = useState<ApplicationStatus | "ALL">("ALL");
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);

  // Drawers / Modals
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<AdminApplication | null>(null);
  const [cancelJobId,    setCancelJobId]    = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data fetching ───────────────────────────────────────────────────────────

const load = useCallback(async (p: number, s: ApplicationStatus | "ALL") => {
  setLoading(true);
  try {
    const statusParam = s === "ALL" ? undefined : s;

    const res = await service.listAll({
      page: p,
      size: PAGE_SIZE,
      status: statusParam,
      search: search || undefined,
      jobPostId: defaultJobPostId,
    });

    setApps(res.content);
    setTotalElements(res.totalElements);
    setTotalPages(res.totalPages);
  } catch (e) {
    toast.error("Lỗi", extractErrorMessage(e));
  } finally {
    setLoading(false);
  }
}, [defaultJobPostId, search, toast]);

  useEffect(() => { load(page, statusFilter); }, [page, statusFilter, load]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleOverrideConfirm = async (status: ApplicationStatus, reason: string) => {
    if (!overrideTarget) return;
    try {
      await service.overrideStatus(overrideTarget.id, status, reason);
      toast.success("Thành công", "Trạng thái đã được override.");
      load(page, statusFilter);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
      throw e;
    }
  };

  const handleCancelByJob = async (reason: string) => {
    if (!cancelJobId) return;
    try {
      const count = await service.cancelByJob(cancelJobId, reason);
      toast.success("Thành công", `${count} đơn đã được cancel.`);
      load(page, statusFilter);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
      throw e;
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const handleSearch = (v: string) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(0), 400);
  };

  const filtered = search.trim()
    ? apps.filter(a =>
        a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        a.candidateEmail.toLowerCase().includes(search.toLowerCase()),
      )
    : apps;

  const pending   = apps.filter(a => ["SUBMITTED", "PENDING"].includes(a.status)).length;
  const reviewing = apps.filter(a => a.status === "REVIEWING").length;
  const hired     = apps.filter(a => a.status === "HIRED").length;
  const rejected  = apps.filter(a => a.status === "REJECTED").length;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<FileText    size={18} className="text-blue-600"  />}
          label="Tổng đơn"   value={totalElements.toLocaleString()}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Clock       size={18} className="text-amber-500" />}
          label="Chờ duyệt"  value={pending}
          color="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle size={18} className="text-green-600" />}
          label="Đã tuyển"   value={hired}
          color="bg-green-50"
        />
        <StatCard
          icon={<XCircle     size={18} className="text-red-500"   />}
          label="Từ chối"    value={rejected}
          color="bg-red-50"
        />
      </div>

      {/* ── Filters + Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
        flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Tìm ứng viên..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(0); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${statusFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {totalElements.toLocaleString()} đơn
          </span>

          {/* SUPER_ADMIN: cancel toàn bộ đơn job hiện tại */}
          {isSuperAdmin && defaultJobPostId && (
            <button
              onClick={() => setCancelJobId(defaultJobPostId)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Ban size={13} />
              Cancel tất cả
            </button>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
              <Users size={32} strokeWidth={1.2} />
              <p className="text-sm">Không có đơn ứng tuyển nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ứng viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Vị trí</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">AI Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày nộp</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Ứng viên */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {app.candidate?.avatarUrl
                            ? <img
                                src={app.candidate.avatarUrl}
                                alt={app.candidate.fullName}
                                className="w-8 h-8 rounded-xl object-cover border border-gray-100"
                              />
                            : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200
                                flex items-center justify-center text-xs font-bold text-gray-500">
                              </div>
                          }
                          <div>
                            <p className="font-medium text-gray-900">{app.candidateName}</p>
                            <p className="text-xs text-gray-400">{app.candidateEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Vị trí */}
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        <div>
                          <p className="font-medium text-gray-700 truncate max-w-[160px]">
                            {app.job?.title}
                          </p>
                          <p className="text-gray-400">{app.job?.level ?? "—"}</p>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        <ApplicationStatusBadge status={app.status} />
                      </td>

                      {/* AI Score */}
                      <td className="px-4 py-3.5">
                        {app.aiScore != null ? (
                          <AIScorePanel
                            score={{
                              score: app.aiScore,
                              label: app.aiScoreLabel ?? "",
                              skillMatchScore:  0,
                              experienceScore:  0,
                              educationScore:   0,
                            }}
                            compact
                          />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Ngày nộp */}
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Hành động */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuperAdmin && (
                            <button
                              onClick={() => setOverrideTarget(app)}
                              title="Override trạng thái"
                              className="px-2.5 py-1.5 text-xs font-medium text-amber-600
                                bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              Override
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedId(app.id)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600
                              bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Xem
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            current={page + 1}
            total={totalPages}
            onChange={p => setPage(p - 1)}
          />
        </div>
      )}

      {/* ── Detail Drawer ──────────────────────────────────────────── */}
      {selectedId && (
        <ApplicationDetailDrawer
          applicationId={selectedId}
          role="admin"
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* ── Override Modal (SUPER_ADMIN) ───────────────────────────── */}
      {overrideTarget && (
        <OverrideStatusModal
          app={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onConfirm={handleOverrideConfirm}
        />
      )}

      {/* ── Cancel By Job Modal (SUPER_ADMIN) ─────────────────────── */}
      {cancelJobId && (
        <CancelByJobModal
          jobPostId={cancelJobId}
          onClose={() => setCancelJobId(null)}
          onConfirm={handleCancelByJob}
        />
      )}
    </div>
  );
}