'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable,
  Column,
  StatusBadge,
  AdminFilter,
  useFilter,
  ConfirmModel,
  DetailModel,
  DetailField
} from '@/presentation/components/common';
import { PlanFormModal } from '@/presentation/components/admin/subscription/PlanFormModal';
import { AdminSubscriptionRepository } from '@/infrastructure/repositories/AdminSubscriptionRepository';
import type { SubscriptionPlan } from '@/domain/models/CompanySubscription';
import type {
  PlanPayload,
  AdminSubscriptionRow,
} from '@/domain/repositories/IAdminSubscriptionRepository';
import { AdminSubscriptionService } from '@/application/services/AdminSubscriptionService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import { 
  Package, 
  Plus, 
  Edit, 
  Eye, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// Status options for subscription filter
const subscriptionStatusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'PENDING', label: 'Chờ xử lý' }
];

// Status config for subscription badge
const subscriptionStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE: {
    label: 'Hoạt động',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />
  },
  EXPIRED: {
    label: 'Hết hạn',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: <XCircle className="w-3 h-3" />
  },
  FAILED: {
    label: 'Thất bại',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3 h-3" />
  }
};

// Format price
const formatPrice = (amount: number): string => {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function AdminSubscriptionPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // State for plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // State for subscriptions
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRow[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | undefined>(undefined);
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscriptionRow | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const isFetching = useRef(false);

  const service = new AdminSubscriptionService(new AdminSubscriptionRepository());

  // Filter config for subscriptions
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: subscriptionStatusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const result = await service.getAllPlans();
      setPlans(result);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách gói đăng ký');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async (filterValues: { status?: string }) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setSubscriptionsLoading(true);

    try {
      const result = await service.listSubscriptions(0, 10, filterValues.status);
      setSubscriptions(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách đăng ký');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setSubscriptionsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPlans();
  }, []);

  // Fetch subscriptions when filter changes
  useEffect(() => {
    fetchSubscriptions({
      status: filters.status
    });
  }, [filters.status]);

  // Handle toggle plan active status
  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const updated = await service.toggleActive(plan);
      setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toastRef.current.success('Thành công', `${updated.active ? 'Kích hoạt' : 'Vô hiệu hóa'} gói "${plan.name}" thành công`);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Failed to toggle plan status:', error);
      const message = extractErrorMessage(error, 'Không thể thay đổi trạng thái gói');
      toastRef.current.error('Lỗi thao tác', message);
    }
  };

  // Handle save plan (create/update)
  const handleSavePlan = useCallback(async (payload: PlanPayload) => {
    try {
      if (editingPlan) {
        // Update existing plan
        const updated = await service.updatePlan(editingPlan.id, payload);
        setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toastRef.current.success('Thành công', `Đã cập nhật gói "${payload.name}"`);
      } else {
        // Create new plan
        const created = await service.createPlan(payload);
        setPlans(prev => [created, ...prev]);
        toastRef.current.success('Thành công', `Đã tạo gói "${payload.name}"`);
      }
      setPlanModalOpen(false);
      setEditingPlan(undefined);
    } catch (error) {
      console.error('Failed to save plan:', error);
      const message = extractErrorMessage(error, 'Không thể lưu gói đăng ký');
      toastRef.current.error('Lỗi thao tác', message);
      throw error; // Re-throw để PlanFormModal giữ spinner
    }
  }, [editingPlan]);

  const openCreatePlanModal = () => {
    setEditingPlan(undefined);
    setPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanModalOpen(true);
  };

  const openToggleConfirm = (plan: SubscriptionPlan) => {
    setConfirmModal({
      isOpen: true,
      title: plan.active ? 'Vô hiệu hóa gói' : 'Kích hoạt gói',
      message: plan.active 
        ? `Bạn có chắc chắn muốn vô hiệu hóa gói "${plan.name}"? Các công ty sẽ không thể đăng ký gói này.`
        : `Bạn có chắc chắn muốn kích hoạt gói "${plan.name}"? Các công ty có thể đăng ký gói này.`,
      type: 'warning',
      onConfirm: () => handleToggleActive(plan)
    });
  };

  const openSubscriptionDetail = (subscription: AdminSubscriptionRow) => {
    setSelectedSubscription(subscription);
    setDetailModalOpen(true);
  };

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  // Plans table columns
  const planColumns: Column<SubscriptionPlan>[] = [
    {
      key: 'code',
      title: 'Mã gói',
      width: '120px',
      render: (value) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'name',
      title: 'Tên gói',
      width: '180px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          {record.description && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{record.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'priceMonthly',
      title: 'Giá tháng',
      width: '120px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'priceYearly',
      title: 'Giá năm',
      width: '120px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'jobPostLimit',
      title: 'Tin tuyển dụng',
      width: '120px',
      render: (value) => value === -1 ? 'Không giới hạn' : value
    },
    {
      key: 'durationDays',
      title: 'Hiệu lực (ngày)',
      width: '100px',
      render: (value) => `${value} ngày`
    },
    {
      key: 'active',
      title: 'Trạng thái',
      width: '100px',
      render: (value) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          label={value ? 'Kích hoạt' : 'Vô hiệu'}
          size="sm"
        />
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditPlanModal(record)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openToggleConfirm(record)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title={record.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {record.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      )
    }
  ];

  // Subscriptions table columns
  const subscriptionColumns: Column<AdminSubscriptionRow>[] = [
    {
      key: 'companyName',
      title: 'Công ty',
      width: '200px',
      render: (value) => (
        <div className="font-medium text-foreground">{value}</div>
      )
    },
    {
      key: 'planCode',
      title: 'Gói',
      width: '120px',
      render: (value) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      render: (value: string) => {
        const config = subscriptionStatusConfig[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'amount',
      title: 'Số tiền',
      width: '120px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'startedAt',
      title: 'Ngày bắt đầu',
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'expiresAt',
      title: 'Ngày hết hạn',
      width: '120px',
      render: (value) => {
        const expiryDate = new Date(value);
        const isExpired = expiryDate < new Date();
        return (
          <span className={isExpired ? 'text-red-500' : ''}>
            {expiryDate.toLocaleDateString('vi-VN')}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '80px',
      align: 'center',
      render: (_, record) => (
        <button
          onClick={() => openSubscriptionDetail(record)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  // Subscription detail fields
  const getSubscriptionDetailFields = (): DetailField[] => {
    if (!selectedSubscription) return [];
    
    return [
      {
        key: 'companyName',
        label: 'Công ty',
        value: selectedSubscription.companyName,
        copyable: true
      },
      {
        key: 'planCode',
        label: 'Mã gói',
        value: selectedSubscription.planCode,
        copyable: true
      },
      {
        key: 'status',
        label: 'Trạng thái',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${subscriptionStatusConfig[selectedSubscription.status].color}`}>
            {subscriptionStatusConfig[selectedSubscription.status].icon}
            {subscriptionStatusConfig[selectedSubscription.status].label}
          </span>
        ),
        type: 'badge'
      },
      {
        key: 'amount',
        label: 'Số tiền',
        value: formatPrice(selectedSubscription.amount)
      },
      {
        key: 'startedAt',
        label: 'Ngày bắt đầu',
        value: new Date(selectedSubscription.startedAt).toLocaleString('vi-VN'),
        type: 'date'
      },
      {
        key: 'expiresAt',
        label: 'Ngày hết hạn',
        value: new Date(selectedSubscription.expiresAt).toLocaleString('vi-VN'),
        type: 'date'
      }
    ];
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đăng ký</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý gói đăng ký và theo dõi đăng ký của công ty
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Gói đăng ký</h2>
          </div>
          <button
            onClick={openCreatePlanModal}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm gói
          </button>
        </div>
        
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <DataTable
            data={plans}
            columns={planColumns}
            loading={plansLoading}
            showPagination={false}
            emptyMessage="Không có gói đăng ký"
            emptyDescription="Hãy thêm gói đăng ký đầu tiên"
          />
        </div>
      </div>

      {/* Subscriptions Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Danh sách đăng ký</h2>
        </div>

        {/* Filter */}
        <AdminFilter
          config={{
            searchKey: undefined,
            statusKey: 'status',
            customFilters: []
          }}
          filters={{
            status: getFilterValue('status')
          }}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          statusOptions={subscriptionStatusOptions}
          searchPlaceholder=""
          statusPlaceholder="Tất cả trạng thái"
          showDateFilter={false}
          loading={subscriptionsLoading}
        />

        {/* Subscriptions Table */}
        <div className="bg-background rounded-lg border border-border overflow-hidden mt-4">
          <DataTable
            data={subscriptions}
            columns={subscriptionColumns}
            loading={subscriptionsLoading}
            selectable
            showPagination
            defaultPageSize={10}
            emptyMessage="Không có đăng ký"
            emptyDescription="Chưa có công ty nào đăng ký"
          />
        </div>
      </div>

      {/* Plan Form Modal - Sử dụng component của bạn */}
      {planModalOpen && (
        <PlanFormModal
          plan={editingPlan}
          onSave={handleSavePlan}
          onCancel={() => {
            setPlanModalOpen(false);
            setEditingPlan(undefined);
          }}
        />
      )}

      {/* Subscription Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết đăng ký - ${selectedSubscription?.companyName || ''}`}
        fields={getSubscriptionDetailFields()}
      />

      {/* Confirm Modal for Toggle Active */}
      <ConfirmModel
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
}