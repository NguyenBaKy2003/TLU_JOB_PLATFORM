'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable,
  Column,
  ActionItem,
  StatusBadge,
  AdminFilter,
  useFilter,
  ConfirmModel,
  TableActions,
  FormModel,
  FormField,
  DetailModel,
  DetailField
} from '@/presentation/components/common';
import { AdminPaymentRepository } from '@/infrastructure/repositories/AdminPaymentRepository';
import type {
  AdminPayment,
  AdminPaymentFilters,
  AdminPaymentStats
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
  XCircle
} from 'lucide-react';

// Status options for filter
const paymentStatusOptions = [
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'SUCCESS', label: 'Thành công' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền' }
];

// Status config for badge
const paymentStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Chờ thanh toán',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3 h-3" />
  },
  SUCCESS: {
    label: 'Thành công',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />
  },
  FAILED: {
    label: 'Thất bại',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <Undo2 className="w-3 h-3" />
  }
};

// Format price
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (date: string): string => {
  if (!date) return '—';
  return new Date(date).toLocaleString('vi-VN');
};

// Convert date to LocalDateTime format for API
const toLocalDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  // Chuyển đổi từ yyyy-MM-dd sang yyyy-MM-ddT00:00:00
  return `${dateStr}T00:00:00`;
};

export default function AdminPaymentsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [stats, setStats] = useState<AdminPaymentStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Date range for stats
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Refund Modal state
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    payment: AdminPayment | null;
    loading: boolean;
  }>({
    isOpen: false,
    payment: null,
    loading: false
  });

  const isFetching = useRef(false);

  const service = new AdminPaymentService(new AdminPaymentRepository());

  // Filter configuration
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: paymentStatusOptions },
    { key: 'planCode', type: 'input' as const, label: 'Mã gói', placeholder: 'Nhập mã gói...' }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  // Fetch payments
  const fetchPayments = useCallback(async (filterValues: { status?: string; planCode?: string }) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const apiFilters: AdminPaymentFilters = {
        page: 0,
        size: 10,
        status: filterValues.status as any || undefined,
        planCode: filterValues.planCode || undefined
      };
      
      const result = await service.search(apiFilters);
      setPayments(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách thanh toán');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Fetch stats - gửi đúng định dạng LocalDateTime
  const fetchStats = useCallback(async (from: string, to: string) => {
    try {
      const fromDateTime = toLocalDateTime(from);
      const toDateTime = toLocalDateTime(to);
      const result = await service.getStats(fromDateTime, toDateTime);
      setStats(result);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      const message = extractErrorMessage(error, 'Không thể tải thống kê');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    }
  }, []);

  // Handle refund
  const handleRefund = async (paymentId: string, reason: string) => {
    setRefundModal(prev => ({ ...prev, loading: true }));
    try {
      const payment = payments.find(p => p.id === paymentId);
      await service.refund(paymentId, reason);
      await fetchPayments({
        status: getFilterValue('status'),
        planCode: getFilterValue('planCode')
      });
      await fetchStats(dateRange.from, dateRange.to);
      setRefundModal({ isOpen: false, payment: null, loading: false });
      toastRef.current.success('Thành công', `Đã hoàn tiền cho giao dịch ${payment?.gatewayOrderCode}`);
    } catch (error) {
      console.error('Failed to refund payment:', error);
      const message = extractErrorMessage(error, 'Không thể hoàn tiền');
      toastRef.current.error('Lỗi thao tác', message);
      setRefundModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openRefundModal = (payment: AdminPayment) => {
    if (payment.status !== 'SUCCESS') {
      toastRef.current.warning('Không thể hoàn tiền', 'Chỉ có thể hoàn tiền cho giao dịch thành công');
      return;
    }
    setRefundModal({
      isOpen: true,
      payment,
      loading: false
    });
  };

  const openPaymentDetail = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchPayments({
      status: filters.status,
      planCode: filters.planCode
    });
  }, [filters.status, filters.planCode]);

  // Initial fetch for stats
  useEffect(() => {
    fetchStats(dateRange.from, dateRange.to);
  }, [dateRange.from, dateRange.to]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchPayments({
      status: getFilterValue('status'),
      planCode: getFilterValue('planCode')
    });
    fetchStats(dateRange.from, dateRange.to);
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchPayments, fetchStats, getFilterValue, dateRange]);

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  // Refund form fields
  const refundFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do hoàn tiền',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Nhập lý do hoàn tiền...'
    }
  ];

  // Table columns
  const columns: Column<AdminPayment>[] = [
    {
      key: 'gatewayOrderCode',
      title: 'Mã giao dịch',
      width: '150px',
      render: (value) => (
        <span className="font-mono text-xs">{value}</span>
      )
    },
    {
      key: 'companyName',
      title: 'Công ty',
      width: '200px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">ID: {record.companyId}</div>
        </div>
      )
    },
    {
      key: 'planCode',
      title: 'Gói đăng ký',
      width: '120px',
      render: (value) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'amountFormatted',
      title: 'Số tiền',
      width: '130px',
      render: (value) => (
        <div className="font-semibold text-foreground">{value}</div>
      )
    },
    {
      key: 'gateway',
      title: 'Cổng thanh toán',
      width: '100px',
      render: (value) => value || '—'
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '130px',
      render: (value: string) => {
        const config = paymentStatusConfig[value];
        if (!config) return <span>{value}</span>;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '160px',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'completedAt',
      title: 'Ngày hoàn thành',
      width: '160px',
      render: (value) => value ? formatDate(value) : '—'
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <TableActions
          record={record}
          actions={getActions(record)}
          showLabel={false}
        />
      )
    }
  ];

  // Dynamic actions based on payment status
  const getActions = (record: AdminPayment): ActionItem<AdminPayment>[] => {
    const actions: ActionItem<AdminPayment>[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => openPaymentDetail(record),
        color: 'default'
      }
    ];

    // Only show refund for SUCCESS payments
    if (record.status === 'SUCCESS') {
      actions.push({
        key: 'refund',
        label: 'Hoàn tiền',
        icon: <Undo2 className="w-4 h-4" />,
        onClick: () => openRefundModal(record),
        color: 'warning'
      });
    }
    
    return actions;
  };

  // Payment detail fields
  const getPaymentDetailFields = (): DetailField[] => {
    if (!selectedPayment) return [];
    
    return [
      {
        key: 'gatewayOrderCode',
        label: 'Mã giao dịch',
        value: selectedPayment.gatewayOrderCode,
        copyable: true
      },
      {
        key: 'gatewayTransactionId',
        label: 'Mã giao dịch cổng',
        value: selectedPayment.gatewayTransactionId || '—',
        copyable: true
      },
      {
        key: 'companyInfo',
        label: 'Công ty',
        value: `${selectedPayment.companyName} (ID: ${selectedPayment.companyId})`,
        copyable: true
      },
      {
        key: 'planCode',
        label: 'Gói đăng ký',
        value: selectedPayment.planCode,
        copyable: true
      },
      {
        key: 'subscriptionId',
        label: 'Mã đăng ký',
        value: selectedPayment.subscriptionId,
        copyable: true
      },
      {
        key: 'amount',
        label: 'Số tiền',
        value: selectedPayment.amountFormatted
      },
      {
        key: 'gateway',
        label: 'Cổng thanh toán',
        value: selectedPayment.gateway || '—'
      },
      {
        key: 'status',
        label: 'Trạng thái',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[selectedPayment.status]?.color || ''}`}>
            {paymentStatusConfig[selectedPayment.status]?.icon}
            {selectedPayment.statusLabel}
          </span>
        ),
        type: 'badge'
      },
      {
        key: 'failureReason',
        label: 'Lý do thất bại',
        value: selectedPayment.failureReason || '—',
        type: 'text'
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        value: formatDate(selectedPayment.createdAt),
        type: 'date'
      },
      {
        key: 'completedAt',
        label: 'Ngày hoàn thành',
        value: selectedPayment.completedAt ? formatDate(selectedPayment.completedAt) : '—',
        type: 'date'
      }
    ];
  };

  // Stats cards
  const StatCard = ({ title, value, icon, color, trend }: any) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý thanh toán</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và theo dõi các giao dịch thanh toán trên hệ thống
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Date Range Filter for Stats */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Thống kê từ:</span>
        </div>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => handleDateRangeChange('from', e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
        />
        <span className="text-muted-foreground">đến</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => handleDateRangeChange('to', e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background"
        />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng doanh thu"
            value={formatPrice(stats.totalRevenue)}
            icon={<DollarSign className="w-4 h-4" />}
            color="bg-green-100 text-green-600 dark:bg-green-900/30"
            trend={stats.revenueTrend}
          />
          <StatCard
            title="Tổng số giao dịch"
            value={stats.totalTransactions}
            icon={<Receipt className="w-4 h-4" />}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
            trend={stats.transactionsTrend}
          />
          <StatCard
            title="Giao dịch thành công"
            value={stats.successCount}
            icon={<CheckCircle className="w-4 h-4" />}
            color="bg-green-100 text-green-600 dark:bg-green-900/30"
          />
          <StatCard
            title="Giao dịch thất bại"
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
            { key: 'planCode', label: 'Mã gói', options: [] }
          ]
        }}
        filters={{
          status: getFilterValue('status'),
          planCode: getFilterValue('planCode')
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

      {/* Data Table */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={payments}
          columns={columns}
          loading={loading}
          selectable
          showPagination
          defaultPageSize={10}
          emptyMessage="Không có giao dịch"
          emptyDescription="Chưa có giao dịch thanh toán nào trong hệ thống"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Payment Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết giao dịch - ${selectedPayment?.gatewayOrderCode || ''}`}
        fields={getPaymentDetailFields()}
      />

      {/* Refund Form Modal */}
      <FormModel
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, payment: null, loading: false })}
        onSubmit={(data) => {
          if (refundModal.payment) {
            handleRefund(refundModal.payment.id, data.reason);
          }
        }}
        title={`Hoàn tiền - ${refundModal.payment?.gatewayOrderCode || ''}`}
        fields={refundFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận hoàn tiền"
        loading={refundModal.loading}
      />
    </div>
  );
}