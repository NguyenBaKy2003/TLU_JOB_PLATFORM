'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable,
  Column,
  ActionItem,
  AdminFilter,
  useFilter,
  TableActions,
  FormModel,
  FormField,
  DetailModel,
  DetailField,
  TablePagination,
} from '@/presentation/components/common';
import { AdminPaymentRepository } from '@/infrastructure/repositories/AdminPaymentRepository';
import type {
  AdminPayment,
  AdminPaymentStats,
  PaymentStatus,
} from '@/domain/models/AdminPayment';
import { AdminPaymentService } from '@/application/services/AdminPaymentService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import {
  DollarSign,
  Eye,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
  Undo2,
  Clock,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const paymentStatusOptions = [
  { value: 'PENDING',  label: 'Chờ thanh toán' },
  { value: 'SUCCESS',  label: 'Thành công' },
  { value: 'FAILED',   label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];

const paymentStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Chờ thanh toán',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3 h-3" />,
  },
  SUCCESS: {
    label: 'Thành công',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  FAILED: {
    label: 'Thất bại',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />,
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Undo2 className="w-3 h-3" />,
  },
};

const gatewayOptions = [
  { value: 'PAYOS',  label: 'PayOS' },
  { value: 'VNPAY',  label: 'VNPay' },
  { value: 'MOMO',   label: 'MoMo' },
  { value: 'STRIPE', label: 'Stripe' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '—';
  return new Date(date).toLocaleString('vi-VN');
};

const toLocalDateTime = (dateStr: string, endOfDay = false): string => {
  if (!dateStr) return '';
  return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: number | null;
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => (
  <div className="bg-background rounded-lg border border-border p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-muted-foreground">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    {trend !== undefined && trend !== null && (
      <div className="flex items-center gap-1 mt-2 text-xs">
        {trend > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : trend < 0 ? (
          <TrendingDown className="w-3 h-3 text-red-500" />
        ) : null}
        <span className={trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}>
          {Math.abs(trend)}% so với kỳ trước
        </span>
      </div>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const serviceRef  = useRef(new AdminPaymentService(new AdminPaymentRepository()));
  const isFetching  = useRef(false);
  const pageSizeRef = useRef(10);

  // ── State ──────────────────────────────────────────────────────────────────
  const [payments,      setPayments]      = useState<AdminPayment[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [exporting,     setExporting]     = useState<'excel' | 'pdf' | null>(null);
  const [invoiceId,     setInvoiceId]     = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [pageSize,      setPageSize]      = useState(10);
  const [stats,         setStats]         = useState<AdminPaymentStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });

  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    payment: AdminPayment | null;
    loading: boolean;
  }>({ isOpen: false, payment: null, loading: false });

  // ── Filters ────────────────────────────────────────────────────────────────
  const filterConfigs = [
    { key: 'status',  type: 'select' as const, label: 'Trạng thái', options: paymentStatusOptions },
    { key: 'gateway', type: 'select' as const, label: 'Cổng TT',    options: gatewayOptions },
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async (
    filterValues: { status?: string; gateway?: string; planCode?: string },
    page = 0,
    size?: number,
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    const resolvedSize = size ?? pageSizeRef.current;
    try {
      const result = await serviceRef.current.search({
        page,
        size: resolvedSize,
        status:   filterValues.status   as PaymentStatus | undefined,
        gateway:  filterValues.gateway  || undefined,
        planCode: filterValues.planCode || undefined,
      });
      setPayments(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number ?? 0);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải danh sách thanh toán'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  const fetchStats = useCallback(async (from: string, to: string) => {
    try {
      const result = await serviceRef.current.getStats(
        toLocalDateTime(from),
        toLocalDateTime(to, true),
      );
      setStats(result);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải thống kê'));
    }
  }, []);

  const currentFilters = useCallback(() => ({
    status:   getFilterValue('status'),
    gateway:  getFilterValue('gateway'),
    planCode: getFilterValue('planCode'),
  }), [getFilterValue]);

  // filter change → reset page 0
  useEffect(() => {
    fetchPayments({ status: filters.status, gateway: filters.gateway, planCode: filters.planCode }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.gateway, filters.planCode]);

  useEffect(() => {
    fetchStats(dateRange.from, dateRange.to);
  }, [dateRange.from, dateRange.to, fetchStats]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const handlePageChange = useCallback((page: number) => {
    fetchPayments(currentFilters(), Math.max(0, page - 1), pageSizeRef.current);
  }, [fetchPayments, currentFilters]);

  const handlePageSizeChange = useCallback((size: number) => {
    pageSizeRef.current = size;
    setPageSize(size);
    fetchPayments(currentFilters(), 0, size);
  }, [fetchPayments, currentFilters]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const buildExportFilters = () => ({
    status:   getFilterValue('status')   as PaymentStatus | undefined,
    gateway:  getFilterValue('gateway')  || undefined,
    planCode: getFilterValue('planCode') || undefined,
    fromDate: dateRange.from ? toLocalDateTime(dateRange.from)          : undefined,
    toDate:   dateRange.to   ? toLocalDateTime(dateRange.to, true)       : undefined,
  });

  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    try {
      await serviceRef.current.downloadExcel(buildExportFilters());
      toastRef.current.success('Xuất Excel', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file Excel'));
    } finally { setExporting(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilterValue, dateRange]);

  const handleExportPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      await serviceRef.current.downloadPdf(buildExportFilters());
      toastRef.current.success('Xuất PDF', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file PDF'));
    } finally { setExporting(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFilterValue, dateRange]);

  const handleDownloadInvoice = useCallback(async (payment: AdminPayment) => {
    setInvoiceId(payment.id);
    try {
      await serviceRef.current.downloadInvoice(payment.id, payment.gatewayOrderCode);
      toastRef.current.success('Tải hóa đơn', 'Hóa đơn đã được tải xuống');
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể tải hóa đơn'));
    } finally { setInvoiceId(null); }
  }, []);

  // ── Refund ─────────────────────────────────────────────────────────────────
  const handleRefund = async (paymentId: string, reason: string) => {
    setRefundModal(prev => ({ ...prev, loading: true }));
    try {
      const payment = payments.find(p => p.id === paymentId);
      await serviceRef.current.refund(paymentId, reason);
      await fetchPayments(currentFilters(), currentPage, pageSizeRef.current);
      await fetchStats(dateRange.from, dateRange.to);
      setRefundModal({ isOpen: false, payment: null, loading: false });
      toastRef.current.success('Thành công', `Đã hoàn tiền cho giao dịch ${payment?.gatewayOrderCode}`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể hoàn tiền'));
      setRefundModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openRefundModal = (payment: AdminPayment) => {
    if (payment.status !== 'SUCCESS') {
      toastRef.current.warning('Không thể hoàn tiền', 'Chỉ có thể hoàn tiền cho giao dịch thành công');
      return;
    }
    setRefundModal({ isOpen: true, payment, loading: false });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((key: string, value: unknown) => setFilter(key, value), [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchPayments(currentFilters(), currentPage, pageSizeRef.current);
    fetchStats(dateRange.from, dateRange.to);
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchPayments, fetchStats, currentFilters, currentPage, dateRange]);

  // ── Table columns ──────────────────────────────────────────────────────────
  const getActions = (record: AdminPayment): ActionItem<AdminPayment>[] => {
    const actions: ActionItem<AdminPayment>[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => { setSelectedPayment(record); setDetailModalOpen(true); },
        color: 'default',
      },
    ];

    if (record.status === 'SUCCESS') {
      actions.push({
        key: 'invoice',
        label: invoiceId === record.id ? 'Đang tải...' : 'Tải hóa đơn',
        icon: <Download className="w-4 h-4" />,
        onClick: () => handleDownloadInvoice(record),
        color: 'default',
      });
      
    }

    return actions;
  };

  const columns: Column<AdminPayment>[] = [
    {
      key: 'gatewayOrderCode',
      title: 'Mã giao dịch',
      width: '150px',
      render: (value) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: 'companyName',
      title: 'Người thanh toán',
      width: '200px',
      render: (value, record) => {
        const name  = value || record.candidateName || '—';
        const type  = value ? 'Công ty' : record.candidateName ? 'Ứng viên' : '';
        const subId = record.companyId || record.candidateId;
        return (
          <div>
            <div className="font-medium text-foreground text-sm">{name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {type && <span className="mr-1">[{type}]</span>}
              {subId && <span className="font-mono">{subId.substring(0, 8)}…</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'planCode',
      title: 'Gói',
      width: '120px',
      render: (value) => value ? <span className="font-mono text-xs">{value}</span> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'amountFormatted',
      title: 'Số tiền',
      width: '130px',
      render: (value) => <div className="font-semibold text-foreground">{value}</div>,
    },
    {
      key: 'gateway',
      title: 'Cổng TT',
      width: '90px',
      render: (value) => value || '—',
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '140px',
      render: (value: string) => {
        const config = paymentStatusConfig[value];
        if (!config) return <span>{value}</span>;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '150px',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'completedAt',
      title: 'Ngày hoàn tất',
      width: '150px',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <TableActions record={record} actions={getActions(record)} showLabel={false} />
      ),
    },
  ];

  // ── Detail fields ──────────────────────────────────────────────────────────
  const getPaymentDetailFields = (): DetailField[] => {
    if (!selectedPayment) return [];
    const cfg = paymentStatusConfig[selectedPayment.status];
    return [
      { key: 'gatewayOrderCode',    label: 'Mã đơn hàng',       value: selectedPayment.gatewayOrderCode,             copyable: true },
      { key: 'gatewayTransactionId',label: 'Mã GD cổng',        value: selectedPayment.gatewayTransactionId || '—',  copyable: true },
      { key: 'id',                  label: 'Payment ID',         value: selectedPayment.id,                           copyable: true },
      ...(selectedPayment.companyId ? [{
        key: 'company', label: 'Công ty',
        value: `${selectedPayment.companyName} (${selectedPayment.companyId?.substring(0,8)}…)`,
        copyable: true,
      }] : []),
      ...(selectedPayment.candidateId ? [{
        key: 'candidate', label: 'Ứng viên',
        value: `${selectedPayment.candidateName} (${selectedPayment.candidateId?.substring(0,8)}…)`,
        copyable: true,
      }] : []),
      { key: 'planCode',      label: 'Gói đăng ký',    value: selectedPayment.planCode      || '—' },
      { key: 'subscriptionId',label: 'Mã đăng ký',     value: selectedPayment.subscriptionId|| '—', copyable: true },
      { key: 'amount',        label: 'Số tiền',         value: selectedPayment.amountFormatted },
      { key: 'currency',      label: 'Tiền tệ',         value: selectedPayment.currency },
      { key: 'gateway',       label: 'Cổng thanh toán', value: selectedPayment.gateway       || '—' },
      {
        key: 'status', label: 'Trạng thái', type: 'badge' as const,
        value: cfg ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
        ) : selectedPayment.status,
      },
      ...(selectedPayment.failureReason ? [{
        key: 'failureReason', label: 'Lý do thất bại',
        value: selectedPayment.failureReason, type: 'text' as const,
      }] : []),
      { key: 'createdAt',   label: 'Ngày tạo',      value: formatDate(selectedPayment.createdAt),   type: 'date' as const },
      { key: 'completedAt', label: 'Ngày hoàn tất', value: formatDate(selectedPayment.completedAt), type: 'date' as const },
    ];
  };

  // ── Refund form ────────────────────────────────────────────────────────────
  const refundFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do hoàn tiền',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Nhập lý do hoàn tiền...',
    },
  ];

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const page1Based  = currentPage + 1;
  const startIndex  = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex    = Math.min((currentPage + 1) * pageSize, totalElements);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý thanh toán</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và theo dõi các giao dịch thanh toán trên hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            {exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Date Range for Stats */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Thống kê từ:</span>
        </div>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
          className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
        />
        <span className="text-muted-foreground text-sm">đến</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
          className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
        />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng doanh thu"
            value={formatPrice(stats.totalRevenue)}
            icon={<DollarSign className="w-4 h-4" />}
            color="bg-green-100 text-green-600 dark:bg-green-900/30"
            trend={stats.revenueTrend}
          />
          <StatCard
            title="Tổng giao dịch"
            value={stats.totalTransactions}
            icon={<Receipt className="w-4 h-4" />}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
            trend={stats.transactionsTrend}
          />
          <StatCard
            title="Thành công"
            value={stats.successCount}
            icon={<CheckCircle className="w-4 h-4" />}
            color="bg-green-100 text-green-600 dark:bg-green-900/30"
          />
          <StatCard
            title="Thất bại"
            value={stats.failedCount}
            icon={<XCircle className="w-4 h-4" />}
            color="bg-red-100 text-red-600 dark:bg-red-900/30"
          />
        </div>
      )}

      {/* Filter */}
      <AdminFilter
        config={{
          searchKey: undefined,
          statusKey: 'status',
          customFilters: [
            { key: 'gateway',  label: 'Cổng TT', options: gatewayOptions },
          ],
        }}
        filters={{
          status:   getFilterValue('status'),
          gateway:  getFilterValue('gateway'),
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={paymentStatusOptions}
        searchPlaceholder=""
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table + Pagination */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={payments}
          columns={columns}
          loading={loading}
          selectable
          showPagination={false}
          emptyMessage="Không có giao dịch"
          emptyDescription="Chưa có giao dịch thanh toán nào trong hệ thống"
          onRefresh={handleRefresh}
        />
        <TablePagination
          currentPage={page1Based}
          totalPages={totalPages}
          totalItems={totalElements}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết giao dịch — ${selectedPayment?.gatewayOrderCode || ''}`}
        fields={getPaymentDetailFields()}
      />

      {/* Refund Modal */}
      <FormModel
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, payment: null, loading: false })}
        onSubmit={(data) => {
          if (refundModal.payment) handleRefund(refundModal.payment.id, data.reason);
        }}
        title={`Hoàn tiền — ${refundModal.payment?.gatewayOrderCode || ''}`}
        fields={refundFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận hoàn tiền"
        loading={refundModal.loading}
      />
    </div>
  );
}