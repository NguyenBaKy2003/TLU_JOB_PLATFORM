"use client";
import { useState, useEffect, useCallback } from "react";
import { Building2, Clock, CheckCircle, Ban }  from "lucide-react";
import { AdminCompanyService }                           from "@/application/services/AdminCompanyService";
import { AdminCompanyRepository }                        from "@/infrastructure/repositories/AdminCompanyRepository";
import { CompanyTable }                                  from "@/presentation/components/admin/companies/CompanyTable";
import { CompanyFilters }                                from "@/presentation/components/admin/companies/CompanyFilters";
import { CompanyDetailModal }                            from "@/presentation/components/admin/companies/CompanyDetailModal";
import { ReasonModal }                                   from "@/presentation/components/admin/companies/ReasonModal";
import { Pagination }                                    from "@/presentation/components/common/Pagination";
import { useToast }                                      from "@/presentation/components/ui/toast";
import { extractErrorMessage }                           from "@/lib/extractErrorMessage";
import type { AdminCompany, VerificationStatus }         from "@/domain/models/AdminCompany";

const service = new AdminCompanyService(new AdminCompanyRepository());

// ── Stat card ──────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4
      flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
      overflow-hidden animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 bg-gray-100 rounded w-36" />
            <div className="h-2.5 bg-gray-100 rounded w-44" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="flex gap-1">
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Reason modal state ─────────────────────────────────────────────────────────

type ReasonModalState =
  | { type: "reject";  company: AdminCompany }
  | { type: "suspend"; company: AdminCompany }
  | null;

// ── Page ───────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AdminCompaniesPage() {
  const toast = useToast();

  const [companies,     setCompanies]     = useState<AdminCompany[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [status,        setStatus]        = useState<VerificationStatus | "">("");
  const [loading,       setLoading]       = useState(true);
  const [loadingId,     setLoadingId]     = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [reasonModal,   setReasonModal]   = useState<ReasonModalState>(null);

  const load = useCallback(async (p: number, s: VerificationStatus | "") => {
    setLoading(true);
    try {
      const res = await service.listCompanies({ page: p, size: PAGE_SIZE, status: s });
      setCompanies(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(page, status); }, [page, status, load]);

  const handleStatus = (v: VerificationStatus | "") => {
    setStatus(v);
    setPage(0);
  };

  const handleReset = () => {
    setStatus("");
    setPage(0);
  };

  // ── Patch helper ─────────────────────────────────────────────────────────

  const patch = (updated: AdminCompany) => {
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCompany(prev => prev?.id === updated.id ? updated : prev);
  };

  // ── Approve ───────────────────────────────────────────────────────────────

  const handleApprove = useCallback(async (company: AdminCompany) => {
    setLoadingId(company.id);
    try {
      const updated = await service.approve(company.id);
      patch(updated);
      toast.success("Đã duyệt", `Công ty ${company.name} đã được xác thực.`);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoadingId(null);
    }
  }, [toast]);

  // ── Reject (opens modal) ──────────────────────────────────────────────────

  const handleReject = useCallback((company: AdminCompany) => {
    setReasonModal({ type: "reject", company });
  }, []);

  const confirmReject = async (reason: string) => {
    if (!reasonModal || reasonModal.type !== "reject") return;
    const updated = await service.reject(reasonModal.company.id, reason);
    patch(updated);
    toast.success("Đã từ chối", `Công ty ${reasonModal.company.name} đã bị từ chối.`);
  };

  // ── Suspend (opens modal) ─────────────────────────────────────────────────

  const handleSuspend = useCallback((company: AdminCompany) => {
    setReasonModal({ type: "suspend", company });
  }, []);

  const confirmSuspend = async (reason: string) => {
    if (!reasonModal || reasonModal.type !== "suspend") return;
    const updated = await service.suspend(reasonModal.company.id, reason);
    patch(updated);
    toast.success("Đã khoá", `Công ty ${reasonModal.company.name} đã bị khoá.`);
  };

  // ── Unsuspend ─────────────────────────────────────────────────────────────

  const handleUnsuspend = useCallback(async (company: AdminCompany) => {
    setLoadingId(company.id);
    try {
      const updated = await service.unsuspend(company.id);
      patch(updated);
      toast.success("Đã mở khoá", `Công ty ${company.name} đã được mở khoá.`);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoadingId(null);
    }
  }, [toast]);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const pendingCount   = companies.filter(c => c.verificationStatus === "UNVERIFIED").length;
  const approvedCount  = companies.filter(c => c.verificationStatus === "VERIFIED").length;
  const rejectedCount  = companies.filter(c => c.verificationStatus === "REJECTED").length;
  const suspendedCount = companies.filter(c => c.verificationStatus === "SUSPENDED").length;

  return (
    <div className="flex flex-col gap-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Building2    size={18} className="text-blue-600"   />}
          label="Tổng công ty" value={totalElements.toLocaleString()}
          color="bg-blue-50"
        />
        <StatCard
          icon={<Clock        size={18} className="text-amber-500"  />}
          label="Chờ duyệt"   value={pendingCount}
          color="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle  size={18} className="text-green-600"  />}
          label="Đã duyệt"    value={approvedCount}
          color="bg-green-50"
        />
        <StatCard
          icon={<Ban          size={18} className="text-red-500"    />}
          label="Khoá / Từ chối" value={suspendedCount + rejectedCount}
          color="bg-red-50"
        />
      </div>

      {/* Filters */}
      <CompanyFilters
        status={status}
        totalElements={totalElements}
        onStatus={handleStatus}
        onReset={handleReset}
      />

      {/* Table */}
      {loading
        ? <TableSkeleton />
        : <CompanyTable
            companies={companies}
            loadingId={loadingId}
            onView={setSelectedCompany}
            onApprove={handleApprove}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onUnsuspend={handleUnsuspend}
          />
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            current={page + 1}
            total={totalPages}
            onChange={p => setPage(p - 1)}
          />
        </div>
      )}

      {/* Detail modal */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          actionLoading={loadingId === selectedCompany.id}
          onClose={() => setSelectedCompany(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onUnsuspend={handleUnsuspend}
        />
      )}

      {/* Reason modal — reject */}
      {reasonModal?.type === "reject" && (
        <ReasonModal
          title="Từ chối xác thực công ty"
          description={`Nhập lý do từ chối công ty "${reasonModal.company.name}".`}
          placeholder="VD: Giấy tờ không hợp lệ, thông tin không khớp..."
          confirmLabel="Xác nhận từ chối"
          confirmClass="bg-red-500 hover:bg-red-600"
          onConfirm={confirmReject}
          onClose={() => setReasonModal(null)}
        />
      )}

      {/* Reason modal — suspend */}
      {reasonModal?.type === "suspend" && (
        <ReasonModal
          title="Khoá công ty"
          description={`Nhập lý do khoá công ty "${reasonModal.company.name}".`}
          placeholder="VD: Vi phạm điều khoản sử dụng, nội dung sai sự thật..."
          confirmLabel="Xác nhận khoá"
          confirmClass="bg-orange-500 hover:bg-orange-600"
          onConfirm={confirmSuspend}
          onClose={() => setReasonModal(null)}
        />
      )}
    </div>
  );
}