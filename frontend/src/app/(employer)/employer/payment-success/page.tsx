"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, Calendar, Briefcase,
  Star, Eye, Cpu, BarChart2, Home, Loader2, Package,
} from "lucide-react";
import { CompanySubscriptionService } from "@/application/services/CompanySubscriptionService";
import { CompanySubscriptionRepository } from "@/infrastructure/repositories/CompanySubscriptionRepository";
import type { CompanySubscription, QuotaResult } from "@/domain/models/CompanySubscription";

const service = new CompanySubscriptionService(new CompanySubscriptionRepository());

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

function AnimatedCheck() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
      <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
      <span className="absolute inset-2 rounded-full bg-emerald-50" />
      <CheckCircle2 size={52} strokeWidth={1.5} className="relative text-emerald-500 drop-shadow-sm" />
    </div>
  );
}

function QuotaBar({ label, used, limit, icon }: { label: string; used: number; limit: number; icon: React.ReactNode }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span className="font-medium text-gray-700">{label}</span>
          <span>{used}/{limit === -1 ? "∞" : limit}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ active, label, icon }: { active: boolean; label: string; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
      <span className={active ? "text-emerald-500" : "text-gray-300"}>{icon}</span>
      {label}
    </div>
  );
}

function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-[16px] text-gray-400">{label}</span>
      <span className={`text-[16px] font-semibold ${highlight ? "text-blue-600" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}

export default function EmployerPaymentSuccessPage() {
  const [sub, setSub] = useState<CompanySubscription | null>(null);
  const [quota, setQuota] = useState<QuotaResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [subData, quotaData] = await Promise.all([
          service.getMySubscription(),
          service.getMyQuota().catch(() => null),
        ]);
        setSub(subData);
        setQuota(quotaData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
          <p className="text-[16px]">Đang tải thông tin đơn hàng…</p>
        </div>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <Package size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy thông tin gói</h2>
          <p className="text-[16px] text-gray-400 mb-6">Giao dịch đã được ghi nhận. Vui lòng kiểm tra trong phần quản lý gói.</p>
          <Link href="/employer/subscription" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[16px] font-semibold hover:bg-blue-700 transition-colors">
            Xem gói dịch vụ <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  const days = daysUntil(sub.expiresAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100 opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-100 opacity-40 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-10 text-center">
          <AnimatedCheck />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Thanh toán thành công!</h1>
          <p className="text-[16px] text-gray-500 max-w-xs mx-auto leading-relaxed">
            Gói <span className="font-semibold text-gray-800">{sub.planCode}</span> đã được kích hoạt. Bạn có thể bắt đầu đăng tin tuyển dụng ngay.
          </p>
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Calendar size={14} /> Còn {days} ngày sử dụng
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-widest">Hóa đơn</p>
              <p className="text-white font-bold text-lg mt-0.5">#{sub.currentPaymentId?.slice(-8).toUpperCase() ?? "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Trạng thái</p>
              <span className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-400 text-white text-xs font-bold uppercase tracking-wide">Đã thanh toán</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50 px-6">
            <ReceiptRow label="Gói dịch vụ" value={sub.planCode} highlight />
            <ReceiptRow label="Ngày kích hoạt" value={formatDate(sub.startedAt)} />
            <ReceiptRow label="Ngày hết hạn" value={formatDate(sub.expiresAt)} />
            <ReceiptRow label="Thời hạn còn lại" value={`${days} ngày`} />
          </div>
        </div>

        {/* Quota */}
        {quota && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-[16px] font-bold text-gray-800 mb-4">Hạn mức sử dụng</h3>
            <div className="space-y-4">
              <QuotaBar label="Tin tuyển dụng" used={quota.jobPostUsed ?? 0} limit={quota.jobPostLimit ?? 0} icon={<Briefcase size={14} />} />
              <QuotaBar label="Tin nổi bật" used={quota.featuredJobUsed ?? 0} limit={quota.featuredJobLimit ?? 0} icon={<Star size={14} />} />
              <QuotaBar label="Xem CV" used={quota.cvViewUsed ?? 0} limit={quota.cvViewLimit ?? 0} icon={<Eye size={14} />} />
            </div>
          </div>
        )}

        {/* Features */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-gray-800 mb-4">Tính năng đi kèm</h3>
          <div className="grid grid-cols-2 gap-2">
            <FeatureBadge active={sub.aiFeatures} label="AI tuyển dụng" icon={<Cpu size={13} />} />
            <FeatureBadge active={sub.analyticsAccess} label="Phân tích nâng cao" icon={<BarChart2 size={13} />} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/employer/jobs/new" className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-600 text-white text-[16px] font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-200">
            Đăng tin ngay <ArrowRight size={15} />
          </Link>
          <Link href="/employer/subscription" className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-700 text-[16px] font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all">
            <Home size={15} /> Quản lý gói
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Hóa đơn đã được lưu. Liên hệ{" "}
          <a href="mailto:support@jobplatform.vn" className="text-blue-500 hover:underline">support@jobplatform.vn</a>{" "}
          nếu cần hỗ trợ.
        </p>
      </div>
    </div>
  );
}