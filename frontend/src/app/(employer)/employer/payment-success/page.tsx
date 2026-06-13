"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Calendar, Briefcase,
  Star, Eye, Cpu, BarChart2, Home, Loader2, Package,
} from "lucide-react";
import { CompanySubscriptionService } from "@/application/services/CompanySubscriptionService";
import { CompanySubscriptionRepository } from "@/infrastructure/repositories/CompanySubscriptionRepository";
import type { CompanySubscription } from "@/domain/models/CompanySubscription";

const service = new CompanySubscriptionService(new CompanySubscriptionRepository());

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

// ── Sub-components ────

function AnimatedCheck() {
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mx-auto mb-4">
      <CheckCircle2 size={30} strokeWidth={1.5} className="text-emerald-500" />
    </div>
  );
}

interface Quota {
  limit: number;
  used: number;
  unlimited: boolean;
}

function QuotaBar({ label, quota, icon }: {
  label: string;
  quota: Quota;
  icon: React.ReactNode;
}) {
  const pct        = quota.unlimited ? 100 : quota.limit > 0
                       ? Math.min(100, (quota.used / quota.limit) * 100)
                       : 0;
  const countLabel = quota.unlimited
                       ? "Không giới hạn"
                       : `${quota.used} / ${quota.limit}`;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-400">{countLabel}</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              quota.unlimited ? "bg-emerald-400" : "bg-blue-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ active, label, icon }: {
  active: boolean; label: string; icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border ${
      active
        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
        : "bg-gray-50 border-gray-100 text-gray-400"
    }`}>
      <span className={active ? "text-emerald-500" : "text-gray-300"}>{icon}</span>
      {label}
    </div>
  );
}

function ReceiptRow({ label, value, highlight }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-blue-600" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Page ──────────────

export default function EmployerPaymentSuccessPage() {
  const [sub,     setSub]     = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const subData = await service.getMySubscription();
        setSub(subData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-blue-400" />
          <p className="text-sm">Đang tải thông tin đơn hàng…</p>
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center">
          <Package size={36} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-medium text-gray-800 mb-2">Không tìm thấy thông tin gói</h2>
          <p className="text-sm text-gray-400 mb-6">
            Giao dịch đã được ghi nhận. Vui lòng kiểm tra trong phần quản lý gói.
          </p>
          <Link
            href="/employer/subscription"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Xem gói dịch vụ <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const days = daysUntil(sub.expiresAt);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-8 text-center">
          <AnimatedCheck />
          <h1 className="text-xl font-medium text-gray-900 mb-2">Thanh toán thành công</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            Gói <span className="font-medium text-gray-800">{sub.planCode}</span> đã được kích hoạt.
            Bạn có thể bắt đầu đăng tin tuyển dụng ngay.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
            <Calendar size={12} /> Còn {days} ngày sử dụng
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Hóa đơn</p>
              <p className="font-medium text-gray-800 mt-0.5">
                #{sub.currentPaymentId?.slice(-8).toUpperCase() ?? "—"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
              <CheckCircle2 size={11} /> Đã thanh toán
            </span>
          </div>
          <div className="px-5 py-1">
            <ReceiptRow label="Gói dịch vụ"      value={sub.planCode}                             highlight />
            <ReceiptRow label="Chu kỳ"            value={sub.yearly ? "Hàng năm" : "Hàng tháng"} />
            <ReceiptRow label="Ngày kích hoạt"    value={formatDate(sub.startedAt)}               />
            <ReceiptRow label="Ngày hết hạn"      value={formatDate(sub.expiresAt)}               />
            <ReceiptRow label="Thời hạn còn lại"  value={`${days} ngày`}                          />
          </div>
        </div>

        {/* Quota — dùng trực tiếp jobPostQuota, featuredJobQuota, cvViewQuota từ API */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Hạn mức sử dụng</h3>
          <QuotaBar
            label="Tin tuyển dụng"
            quota={sub.jobPostQuota}
            icon={<Briefcase size={14} />}
          />
          <QuotaBar
            label="Tin nổi bật"
            quota={sub.featuredJobQuota}
            icon={<Star size={14} />}
          />
          <QuotaBar
            label="Xem CV"
            quota={sub.cvViewQuota}
            icon={<Eye size={14} />}
          />
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Tính năng đi kèm</h3>
          <div className="grid grid-cols-2 gap-2">
            <FeatureBadge active={sub.aiFeatures}      label="AI tuyển dụng"       icon={<Cpu size={12} />}      />
            <FeatureBadge active={sub.analyticsAccess} label="Phân tích nâng cao"  icon={<BarChart2 size={12} />} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/employer/jobs/new"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Đăng tin ngay <ArrowRight size={14} />
          </Link>
          <Link
            href="/employer/subscription"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Home size={14} /> Quản lý gói
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Liên hệ{" "}
          <a href="mailto:support@jobplatform.vn" className="text-blue-500 hover:underline">
            support@jobplatform.vn
          </a>{" "}
          nếu cần hỗ trợ.
        </p>

      </div>
    </div>
  );
}