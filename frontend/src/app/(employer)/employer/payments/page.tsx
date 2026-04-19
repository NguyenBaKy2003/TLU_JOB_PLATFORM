"use client";
import { useState, useEffect, useCallback }  from "react";
import { useRouter }                         from "next/navigation";
import { EmployerPaymentService }            from "@/application/services/EmployerPaymentService";
import { EmployerPaymentRepository }         from "@/infrastructure/repositories/EmployerPaymentRepository";
import { PaymentFilters }                    from "@/presentation/components/payment/PaymentFilters";
import { PaymentTable }                      from "@/presentation/components/payment/PaymentTable";
import { PaymentTableSkeleton }              from "@/presentation/components/payment/PaymentTableSkeleton";
import { PaymentStatusBadge }               from "@/presentation/components/payment/PaymentStatusBadge";
import { Pagination }                        from "@/presentation/components/common/Pagination";
import { useToast }                          from "@/presentation/components/ui/toast";
import { extractErrorMessage }               from "@/lib/extractErrorMessage";
import type { EmployerPayment, PaymentStatus } from "@/domain/models/EmployerPayment";

const service  = new EmployerPaymentService(new EmployerPaymentRepository());
const PAGE_SIZE = 10;

export default function EmployerPaymentPage() {
  const toast  = useToast();
  const router = useRouter();

  const [payments,      setPayments]      = useState<EmployerPayment[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [page,          setPage]          = useState(0);
  const [status,        setStatus]        = useState<PaymentStatus | "">("");
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async (p: number, s: PaymentStatus | "") => {
    setLoading(true);
    try {
      const res = await service.listMyPayments({ page: p, size: PAGE_SIZE, status: s });
      setPayments(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Lỗi", extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(page, status); }, [page, status, load]);

  const handleStatus = (s: PaymentStatus | "") => { setStatus(s); setPage(0); };

  const columns = [
    {
      key: "amount",
      header: "Số tiền",
      render: (row: EmployerPayment) => (
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
      render: (row: EmployerPayment) => (
        <span className="text-xs text-gray-500">{row.gateway ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: EmployerPayment) => <PaymentStatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (row: EmployerPayment) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lịch sử thanh toán</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Tất cả giao dịch thanh toán của công ty bạn
        </p>
      </div>

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
            onView={id => router.push(`/employer/payments/${id}`)}
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