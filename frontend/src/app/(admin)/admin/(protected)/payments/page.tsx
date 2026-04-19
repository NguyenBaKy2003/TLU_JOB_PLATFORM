"use client";
import { useState, useEffect, useCallback } from "react";
import { AdminPaymentService }    from "@/application/services/AdminPaymentService";
import { AdminPaymentRepository } from "@/infrastructure/repositories/AdminPaymentRepository";
import { PaymentStatCards }       from "@/presentation/components/payment/PaymentStatCards";
import { PaymentFilters }         from "@/presentation/components/payment/PaymentFilters";
import { PaymentTable }           from "@/presentation/components/payment/PaymentTable";
import { PaymentTableSkeleton }   from "@/presentation/components/payment/PaymentTableSkeleton";
import { PaymentStatusBadge }     from "@/presentation/components/payment/PaymentStatusBadge";
import { Pagination }             from "@/presentation/components/common/Pagination";
import { useToast }               from "@/presentation/components/ui/toast";
import { extractErrorMessage }    from "@/lib/extractErrorMessage";
import { useRouter }              from "next/navigation";
import type { AdminPayment, AdminPaymentStats, PaymentStatus } from "@/domain/models/AdminPayment";

const service  = new AdminPaymentService(new AdminPaymentRepository());
const PAGE_SIZE = 20;

export default function AdminPaymentPage() {
  const toast  = useToast();
  const router = useRouter();

  const [payments,      setPayments]      = useState<AdminPayment[]>([]);
  const [stats,         setStats]         = useState<AdminPaymentStats | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [status,        setStatus]        = useState<PaymentStatus | "">("");
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async (p: number, s: PaymentStatus | "") => {
    setLoading(true);
    try {
      const [pageRes, statsRes] = await Promise.all([
        service.search({ page: p, size: PAGE_SIZE, status: s }),
        stats === null
          ? service.getStats(
              new Date(Date.now() - 30 * 86400_000).toISOString(),
              new Date().toISOString(),
            )
          : Promise.resolve(stats),
      ]);
      setPayments(pageRes.content);
      setTotalElements(pageRes.totalElements);
      setTotalPages(pageRes.totalPages);
      setStats(statsRes);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(page, status); }, [page, status, load]);

  const handleStatus = (s: PaymentStatus | "") => { setStatus(s); setPage(0); };

  const columns = [
    {
      key: "company",
      header: "Công ty",
      render: (row: AdminPayment) => (
        <div>
          <p className="font-medium text-gray-900">{row.companyName}</p>
          <p className="text-xs text-gray-400">{row.companyId}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (row: AdminPayment) => (
        <span className="font-semibold text-gray-800">
          {row.amount.toLocaleString("vi-VN", {
            style: "currency", currency: row.currency,
          })}
        </span>
      ),
    },
    {
      key: "gateway",
      header: "Cổng TT",
      render: (row: AdminPayment) => (
        <span className="text-xs text-gray-500">{row.gateway ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: AdminPayment) => <PaymentStatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (row: AdminPayment) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PaymentStatCards
        totalRevenue={stats?.totalRevenue  ?? 0}
        totalCount={stats?.totalCount      ?? 0}
        successCount={stats?.successCount  ?? 0}
        failedCount={stats?.failedCount    ?? 0}
      />

      <PaymentFilters
        status={status}
        totalElements={totalElements}
        onStatus={handleStatus}
      />

      {loading
        ? <PaymentTableSkeleton />
        : <PaymentTable
            payments={payments}
            columns={columns}
            onView={id => router.push(`/admin/payments/${id}`)}
          />
      }

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            current={page + 1}
            total={totalPages}
            onChange={p => setPage(p - 1)}
          />
        </div>
      )}
    </div>
  );
}