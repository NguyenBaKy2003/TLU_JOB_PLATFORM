// src/presentation/components/admin/subscription/SubscriptionListTab.tsx
"use client";
import { AlertCircle }               from "lucide-react";
import type { AdminSubscriptionRow } from "@/domain/repositories/IAdminSubscriptionRepository";
import { Pagination } from "../../common/Pagination";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    "bg-green-50  text-green-700  border-green-200",
  EXPIRED:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  CANCELLED: "bg-gray-100  text-gray-600   border-gray-200",
  FAILED:    "bg-red-50    text-red-600    border-red-200",
  PENDING:   "bg-blue-50   text-blue-600   border-blue-200",
};

// ── Row ────

function SubRow({ sub, formatPrice }: {
  sub: AdminSubscriptionRow; formatPrice: (n: number) => string;
}) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-[16px] font-medium text-gray-900">{sub.companyName}</p>
        <p className="text-[11px] text-gray-400">{sub.companyId.slice(0, 8)}…</p>
      </td>
      <td className="px-5 py-3.5">
        <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 text-gray-700 rounded-md">
          {sub.planCode}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border
          ${STATUS_STYLES[sub.status] ?? "bg-gray-100 text-gray-600"}`}>
          {sub.status}
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-600">
        {new Date(sub.startedAt).toLocaleDateString("vi-VN")}
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-600">
        {new Date(sub.expiresAt).toLocaleDateString("vi-VN")}
      </td>
      <td className="px-5 py-3.5 text-[16px] font-semibold text-blue-600">
        {formatPrice(sub.amount)}
      </td>
    </tr>
  );
}

// ── Skeleton ──────────────

function SubSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-50">
          {[120, 60, 70, 80, 80, 60].map((w, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Props ──

interface Props {
  subs:        AdminSubscriptionRow[];
  loading:     boolean;
  totalSubs:   number;
  subsPages:   number;
  subsPage:    number;
  subsStatus:  string;
  formatPrice: (n: number) => string;
  onStatusChange: (s: string) => void;
  onPageChange:   (p: number) => void;
}

// ── Component ─────────────

export function SubscriptionListTab({
  subs, loading, totalSubs, subsPages, subsPage,
  subsStatus, formatPrice, onStatusChange, onPageChange,
}: Props) {
  const HEADERS = ["Công ty", "Gói", "Trạng thái", "Bắt đầu", "Hết hạn", "Số tiền"];

  return (
    <div className="flex flex-col gap-4">

      {/* Backend pending banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border
        border-amber-200 rounded-xl text-[16px] text-amber-800">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <p>
          Cần endpoint{" "}
          <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">
            GET /api/v1/admin/subscriptions
          </code>{" "}
          từ backend để hiển thị danh sách này.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={subsStatus}
          onChange={e => onStatusChange(e.target.value)}
          className="px-3 py-2 text-[16px] border border-gray-200 rounded-xl bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer
            text-gray-700"
        >
          <option value="">Tất cả trạng thái</option>
          {["ACTIVE", "EXPIRED", "CANCELLED", "FAILED", "PENDING"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          <strong className="text-gray-800">{totalSubs.toLocaleString()}</strong> subscriptions
        </p>
      </div>

      {/* Table */}
      {loading ? <SubSkeleton /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-50">
                  {HEADERS.map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold
                      text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-[16px] text-gray-400">
                      Không có subscription nào
                    </td>
                  </tr>
                ) : (
                  subs.map(sub => (
                    <SubRow key={sub.id} sub={sub} formatPrice={formatPrice} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subsPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            current={subsPage + 1}
            total={subsPages}
            onChange={p => onPageChange(p - 1)}
          />
        </div>
      )}
    </div>
  );
}