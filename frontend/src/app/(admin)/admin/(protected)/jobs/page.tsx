"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Briefcase, Search, CheckCircle, XCircle, Clock,
  Trash2, Lock, ChevronDown, AlertTriangle, FileText,
} from "lucide-react";
import { useRouter }            from "next/navigation";
import { Pagination }           from "@/presentation/components/common/Pagination";
import { AdminJobService }      from "@/application/services/AdminJobService";
import { AdminJobRepository }   from "@/infrastructure/repositories/AdminJobRepository";
import { useToast }             from "@/presentation/components/ui/toast";
import { extractErrorMessage }  from "@/lib/extractErrorMessage";
import type { AdminJob, JobStatus } from "@/domain/models/AdminJob";

// ── Constants ────────────────────────────────────────────────────────────────

const service = new AdminJobService(new AdminJobRepository());

const STATUS_FILTERS: { value: JobStatus | "ALL"; label: string }[] = [
  { value: "ALL",       label: "Tất cả"     },
  { value: "PUBLISHED", label: "Đang đăng"  },
  { value: "CLOSED",    label: "Đã đóng"    },
  { value: "EXPIRED",   label: "Hết hạn"    },
  { value: "DRAFT",     label: "Nháp"       },
  { value: "DELETED",   label: "Đã xóa"     },
];

const PAGE_SIZE = 20;

const JOB_STATUS_STYLE: Record<JobStatus, string> = {
  PUBLISHED: "bg-green-50 text-green-700 border border-green-100",
  CLOSED:    "bg-gray-100 text-gray-600",
  EXPIRED:   "bg-amber-50 text-amber-600 border border-amber-100",
  DRAFT:     "bg-blue-50 text-blue-600",
  DELETED:   "bg-red-50 text-red-500",
};

const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  PUBLISHED: "Đang đăng",
  CLOSED:    "Đã đóng",
  EXPIRED:   "Hết hạn",
  DRAFT:     "Nháp",
  DELETED:   "Đã xóa",
};

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

function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${JOB_STATUS_STYLE[status] ?? "bg-gray-100 text-gray-500"}`}>
      {JOB_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-48" />
            <div className="h-2.5 bg-gray-100 rounded w-32" />
          </div>
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="flex gap-1.5">
            <div className="w-8 h-7 bg-gray-100 rounded-lg" />
            <div className="w-8 h-7 bg-gray-100 rounded-lg" />
            <div className="w-8 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Modal xác nhận force-close hoặc force-delete */
function ConfirmActionModal({
  job,
  action,
  onClose,
  onConfirm,
}: {
  job:       AdminJob;
  action:    "close" | "delete";
  onClose:   () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);

  const isDelete = action === "delete";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(reason || (isDelete ? "Vi phạm chính sách" : "Vi phạm chính sách"));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">
        <div className={`flex items-center gap-2 ${isDelete ? "text-red-600" : "text-amber-600"}`}>
          {isDelete ? <Trash2 size={20} /> : <Lock size={20} />}
          <h2 className="font-semibold text-base">
            {isDelete ? "Force-delete bài đăng" : "Force-close bài đăng"}
          </h2>
        </div>

        <div className="text-sm text-gray-600 flex flex-col gap-1">
          <p>Bài đăng: <strong className="text-gray-900">{job.title}</strong></p>
          <p className="text-gray-400 text-xs">Công ty: {job.companyName}</p>
          {isDelete && (
            <p className="mt-1 text-red-500 text-xs font-medium">
              ⚠ Sau khi xóa, toàn bộ đơn ứng tuyển liên quan sẽ bị cancel.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">
            Lý do <span className="text-gray-400">(tuỳ chọn — mặc định "Vi phạm chính sách")</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Nhập lý do..."
            className={`w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none
              ${isDelete
                ? "border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                : "border-gray-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
              }`}
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
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-xl text-white font-medium transition-colors disabled:opacity-40
              ${isDelete
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-500 hover:bg-amber-600"
              }`}
          >
            {loading ? "Đang xử lý..." : isDelete ? "Xóa bài đăng" : "Đóng bài đăng"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminJobsPage() {
  const router = useRouter();
  const toast  = useToast();

  const [jobs,          setJobs]          = useState<AdminJob[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [statusFilter,  setStatusFilter]  = useState<JobStatus | "ALL">("ALL");
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);

  const [actionTarget, setActionTarget] = useState<{
    job:    AdminJob;
    action: "close" | "delete";
  } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const load = useCallback(async (p: number, s: JobStatus | "ALL") => {
    setLoading(true);
    try {
      const res = await service.listJobs({
        status: s === "ALL" ? "" : s,
        page:   p,
        size:   PAGE_SIZE,
      });
      setJobs(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(page, statusFilter); }, [page, statusFilter, load]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleConfirm = async (reason: string) => {
    if (!actionTarget) return;
    const { job, action } = actionTarget;
    try {
      if (action === "close") {
        await service.forceClose(job.id, reason);
        toast.success("Thành công", "Bài đăng đã bị đóng.");
      } else {
        await service.forceDelete(job.id, reason);
        toast.success("Thành công", "Bài đăng đã bị xóa. Đơn ứng tuyển sẽ được cancel.");
      }
      load(page, statusFilter);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
      throw e;
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const handleSearch = (v: string) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(0), 400);
  };

  const filtered = search.trim()
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.companyName.toLowerCase().includes(search.toLowerCase()),
      )
    : jobs;

  const published = jobs.filter(j => j.status === "PUBLISHED").length;
  const closed    = jobs.filter(j => j.status === "CLOSED").length;
  const expired   = jobs.filter(j => j.status === "EXPIRED").length;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Briefcase   size={18} className="text-blue-600"  />}
          label="Tổng bài đăng" value={totalElements.toLocaleString()}
          color="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle size={18} className="text-green-600" />}
          label="Đang đăng"     value={published}
          color="bg-green-50"
        />
        <StatCard
          icon={<Clock       size={18} className="text-amber-500" />}
          label="Hết hạn"       value={expired}
          color="bg-amber-50"
        />
        <StatCard
          icon={<XCircle     size={18} className="text-gray-400"  />}
          label="Đã đóng"       value={closed}
          color="bg-gray-50"
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
            placeholder="Tìm bài đăng, công ty..."
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

        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {totalElements.toLocaleString()} bài
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
              <Briefcase size={32} strokeWidth={1.2} />
              <p className="text-sm">Không có bài đăng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Bài đăng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Công ty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Hạn nộp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày tạo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Bài đăng */}
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <p className="font-medium text-gray-900 truncate">{job.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {job.location ?? "—"}
                          {job.level ? ` · ${job.level}` : ""}
                        </p>
                      </td>

                      {/* Công ty */}
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[160px]">
                        <p className="truncate">{job.companyName}</p>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3.5">
                        <JobStatusBadge status={job.status} />
                      </td>

                      {/* Hạn nộp */}
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      {/* Ngày tạo */}
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Hành động */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">

                          {/* Xem đơn ứng tuyển → sang trang applications lọc theo jobPostId */}
                          <button
                            onClick={() =>
                              router.push(`/admin/applications?jobPostId=${job.id}&companyId=${job.companyId}`)
                            }
                            title="Xem đơn ứng tuyển"
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FileText size={15} />
                          </button>

                          {/* Force-close — chỉ khi PUBLISHED */}
                          {job.status === "PUBLISHED" && (
                            <button
                              onClick={() => setActionTarget({ job, action: "close" })}
                              title="Force-close vi phạm"
                              className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Lock size={15} />
                            </button>
                          )}

                          {/* Force-delete — không áp dụng nếu đã DELETED */}
                          {job.status !== "DELETED" && (
                            <button
                              onClick={() => setActionTarget({ job, action: "delete" })}
                              title="Force-delete vi phạm"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
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

      {/* ── Confirm Modal ──────────────────────────────────────────── */}
      {actionTarget && (
        <ConfirmActionModal
          job={actionTarget.job}
          action={actionTarget.action}
          onClose={() => setActionTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}