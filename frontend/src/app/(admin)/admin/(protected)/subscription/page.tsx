// D:\TLU_JOB_PLATFORM\frontend\src\app\(admin)\admin\(protected)\subscriptions\page.tsx

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
import { CandidatePlanFormModal } from '@/presentation/components/admin/subscription/CandidatePlanFormModal';
import { AdminSubscriptionRepository } from '@/infrastructure/repositories/AdminSubscriptionRepository';
import { AdminCandidatePlanRepository } from '@/infrastructure/repositories/AdminCandidatePlanRepository';
import { AdminSubscriptionService } from '@/application/services/AdminSubscriptionService';
import { AdminCandidatePlanService } from '@/application/services/AdminCandidatePlanService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import type { SubscriptionPlan } from '@/domain/models/CompanySubscription';
import type { CandidateSubscriptionPlan } from '@/domain/models/CandidateSubscription';
import type {
  PlanPayload,
  AdminSubscriptionRow,
} from '@/domain/repositories/IAdminSubscriptionRepository';
import type {
  CandidatePlanPayload,
} from '@/domain/models/CandidateSubscription';
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
  ToggleRight,
  Building2,
  User,
  Users,
  Briefcase,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const subscriptionStatusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'PENDING', label: 'Chờ xử lý' }
];

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

type TabType = 'company-plans' | 'candidate-plans' | 'company-subs' | 'candidate-subs';

const TABS: { key: TabType; label: string; icon: React.ReactNode; role: string }[] = [
  { key: 'company-plans', label: 'Gói Employer', icon: <Building2 className="w-4 h-4" />, role: 'EMPLOYER' },
  { key: 'candidate-plans', label: 'Gói Candidate', icon: <User className="w-4 h-4" />, role: 'CANDIDATE' },
  { key: 'company-subs', label: 'Đăng ký Employer', icon: <Briefcase className="w-4 h-4" />, role: 'EMPLOYER' },
  { key: 'candidate-subs', label: 'Đăng ký Candidate', icon: <Users className="w-4 h-4" />, role: 'CANDIDATE' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (amount: number): string => {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatQuota = (value: number): string => {
  return value === -1 ? 'Không giới hạn' : value.toLocaleString();
};

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AdminSubscriptionPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('company-plans');

  // Company Plans
  const [companyPlans, setCompanyPlans] = useState<SubscriptionPlan[]>([]);
  const [companyPlansLoading, setCompanyPlansLoading] = useState(true);

  // Candidate Plans
  const [candidatePlans, setCandidatePlans] = useState<CandidateSubscriptionPlan[]>([]);
  const [candidatePlansLoading, setCandidatePlansLoading] = useState(true);

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRow[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [companyPlanModalOpen, setCompanyPlanModalOpen] = useState(false);
  const [editingCompanyPlan, setEditingCompanyPlan] = useState<SubscriptionPlan | undefined>(undefined);

  const [candidatePlanModalOpen, setCandidatePlanModalOpen] = useState(false);
  const [editingCandidatePlan, setEditingCandidatePlan] = useState<CandidateSubscriptionPlan | undefined>(undefined);

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

  const companyService = new AdminSubscriptionService(new AdminSubscriptionRepository());
  const candidatePlanService = new AdminCandidatePlanService(new AdminCandidatePlanRepository());

  // Filter config
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: subscriptionStatusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  // ─── Fetch Functions ──────────────────────────────────────────────────────

  const fetchCompanyPlans = useCallback(async () => {
    setCompanyPlansLoading(true);
    try {
      const result = await companyService.getAllPlans();
      setCompanyPlans(result);
    } catch (error) {
      console.error('Failed to fetch company plans:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách gói Employer');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setCompanyPlansLoading(false);
    }
  }, []);

  const fetchCandidatePlans = useCallback(async () => {
    setCandidatePlansLoading(true);
    try {
      const result = await candidatePlanService.getAllPlans();
      setCandidatePlans(result);
    } catch (error) {
      console.error('Failed to fetch candidate plans:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách gói Candidate');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setCandidatePlansLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async (filterValues: { status?: string }) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setSubscriptionsLoading(true);

    try {
      const result = await companyService.listSubscriptions(0, 10, filterValues.status);
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
    fetchCompanyPlans();
    fetchCandidatePlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'company-subs' || activeTab === 'candidate-subs') {
      fetchSubscriptions({ status: filters.status });
    }
  }, [filters.status, activeTab]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // Company Plan handlers
  const handleCompanyToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const updated = await companyService.toggleActive(plan);
      setCompanyPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toastRef.current.success('Thành công', `${updated.active ? 'Kích hoạt' : 'Vô hiệu hóa'} gói "${plan.name}"`);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      const message = extractErrorMessage(error, 'Không thể thay đổi trạng thái gói');
      toastRef.current.error('Lỗi thao tác', message);
    }
  };

  const handleSaveCompanyPlan = useCallback(async (payload: PlanPayload) => {
    try {
      if (editingCompanyPlan) {
        const updated = await companyService.updatePlan(editingCompanyPlan.id, payload);
        setCompanyPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toastRef.current.success('Thành công', `Đã cập nhật gói "${payload.name}"`);
      } else {
        const created = await companyService.createPlan(payload);
        setCompanyPlans(prev => [created, ...prev]);
        toastRef.current.success('Thành công', `Đã tạo gói "${payload.name}"`);
      }
      setCompanyPlanModalOpen(false);
      setEditingCompanyPlan(undefined);
    } catch (error) {
      const message = extractErrorMessage(error, 'Không thể lưu gói đăng ký');
      toastRef.current.error('Lỗi thao tác', message);
      throw error;
    }
  }, [editingCompanyPlan]);

  // Candidate Plan handlers
  const handleCandidateToggleActive = async (plan: CandidateSubscriptionPlan) => {
    try {
      const updated = await candidatePlanService.toggleActive(plan);
      setCandidatePlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toastRef.current.success('Thành công', `${updated.active ? 'Kích hoạt' : 'Vô hiệu hóa'} gói "${plan.name}"`);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      const message = extractErrorMessage(error, 'Không thể thay đổi trạng thái gói');
      toastRef.current.error('Lỗi thao tác', message);
    }
  };

  const handleSaveCandidatePlan = useCallback(async (payload: CandidatePlanPayload) => {
    try {
      if (editingCandidatePlan) {
        const updated = await candidatePlanService.updatePlan(editingCandidatePlan.id, payload);
        setCandidatePlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toastRef.current.success('Thành công', `Đã cập nhật gói "${payload.name}"`);
      } else {
        const created = await candidatePlanService.createPlan(payload);
        setCandidatePlans(prev => [created, ...prev]);
        toastRef.current.success('Thành công', `Đã tạo gói "${payload.name}"`);
      }
      setCandidatePlanModalOpen(false);
      setEditingCandidatePlan(undefined);
    } catch (error) {
      const message = extractErrorMessage(error, 'Không thể lưu gói Candidate');
      toastRef.current.error('Lỗi thao tác', message);
      throw error;
    }
  }, [editingCandidatePlan]);

  const openCompanyToggleConfirm = (plan: SubscriptionPlan) => {
    setConfirmModal({
      isOpen: true,
      title: plan.active ? 'Vô hiệu hóa gói' : 'Kích hoạt gói',
      message: plan.active 
        ? `Bạn có chắc chắn muốn vô hiệu hóa gói "${plan.name}"? Các công ty sẽ không thể đăng ký gói này.`
        : `Bạn có chắc chắn muốn kích hoạt gói "${plan.name}"? Các công ty có thể đăng ký gói này.`,
      type: 'warning',
      onConfirm: () => handleCompanyToggleActive(plan)
    });
  };

  const openCandidateToggleConfirm = (plan: CandidateSubscriptionPlan) => {
    setConfirmModal({
      isOpen: true,
      title: plan.active ? 'Vô hiệu hóa gói' : 'Kích hoạt gói',
      message: plan.active 
        ? `Bạn có chắc chắn muốn vô hiệu hóa gói "${plan.name}"? Ứng viên sẽ không thể đăng ký gói này.`
        : `Bạn có chắc chắn muốn kích hoạt gói "${plan.name}"? Ứng viên có thể đăng ký gói này.`,
      type: 'warning',
      onConfirm: () => handleCandidateToggleActive(plan)
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

  // ─── Table Columns ────────────────────────────────────────────────────────

  // Company Plan columns
  const companyPlanColumns: Column<SubscriptionPlan>[] = [
    {
      key: 'code',
      title: 'Mã gói',
      width: '100px',
      render: (value) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'name',
      title: 'Tên gói',
      width: '160px',
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
      width: '110px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'priceYearly',
      title: 'Giá năm',
      width: '110px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'jobPostLimit',
      title: 'Tin tuyển dụng',
      width: '110px',
      render: (value) => formatQuota(value)
    },
    {
      key: 'durationDays',
      title: 'Hiệu lực',
      width: '90px',
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
      title: '',
      width: '80px',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditingCompanyPlan(record);
              setCompanyPlanModalOpen(true);
            }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openCompanyToggleConfirm(record)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title={record.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {record.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      )
    }
  ];

  // Candidate Plan columns
  const candidatePlanColumns: Column<CandidateSubscriptionPlan>[] = [
    {
      key: 'code',
      title: 'Mã gói',
      width: '100px',
      render: (value) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'name',
      title: 'Tên gói',
      width: '160px',
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
      width: '110px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'priceYearly',
      title: 'Giá năm',
      width: '110px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'applicationLimit',
      title: 'Đơn ứng tuyển',
      width: '110px',
      render: (value) => formatQuota(value)
    },
    {
      key: 'durationDays',
      title: 'Hiệu lực',
      width: '90px',
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
      key: 'free',
      title: 'Loại',
      width: '70px',
      render: (value) => value ? (
        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
      ) : null
    },
    {
      key: 'actions',
      title: '',
      width: '80px',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditingCandidatePlan(record);
              setCandidatePlanModalOpen(true);
            }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openCandidateToggleConfirm(record)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title={record.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {record.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      )
    }
  ];

  // Subscription columns (dùng chung)
  const subscriptionColumns: Column<AdminSubscriptionRow>[] = [
    {
      key: 'companyName',
      title: activeTab === 'company-subs' ? 'Công ty' : 'Ứng viên',
      width: '180px',
      render: (value) => <div className="font-medium text-foreground">{value}</div>
    },
    {
      key: 'planCode',
      title: 'Gói',
      width: '100px',
      render: (value) => <span className="font-mono text-xs">{value}</span>
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      render: (value: string) => {
        const config = subscriptionStatusConfig[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config?.color || ''}`}>
            {config?.icon}
            {config?.label || value}
          </span>
        );
      }
    },
    {
      key: 'amount',
      title: 'Số tiền',
      width: '110px',
      render: (value) => formatPrice(value)
    },
    {
      key: 'startedAt',
      title: 'Ngày bắt đầu',
      width: '110px',
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'expiresAt',
      title: 'Ngày hết hạn',
      width: '110px',
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
      title: '',
      width: '60px',
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

  const getSubscriptionDetailFields = (): DetailField[] => {
    if (!selectedSubscription) return [];
    return [
      { key: 'companyName', label: activeTab === 'company-subs' ? 'Công ty' : 'Ứng viên', value: selectedSubscription.companyName, copyable: true },
      { key: 'planCode', label: 'Mã gói', value: selectedSubscription.planCode, copyable: true },
      {
        key: 'status',
        label: 'Trạng thái',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${subscriptionStatusConfig[selectedSubscription.status]?.color || ''}`}>
            {subscriptionStatusConfig[selectedSubscription.status]?.icon}
            {subscriptionStatusConfig[selectedSubscription.status]?.label || selectedSubscription.status}
          </span>
        ),
        type: 'badge'
      },
      { key: 'amount', label: 'Số tiền', value: formatPrice(selectedSubscription.amount) },
      { key: 'startedAt', label: 'Ngày bắt đầu', value: new Date(selectedSubscription.startedAt).toLocaleString('vi-VN'), type: 'date' },
      { key: 'expiresAt', label: 'Ngày hết hạn', value: new Date(selectedSubscription.expiresAt).toLocaleString('vi-VN'), type: 'date' },
    ];
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const isPlansTab = activeTab === 'company-plans' || activeTab === 'candidate-plans';
  const isCompanyTab = activeTab === 'company-plans' || activeTab === 'company-subs';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý gói dịch vụ</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Quản lý gói đăng ký cho cả Employer và Candidate
          </p>
        </div>
        {isPlansTab && (
          <button
            onClick={() => {
              if (isCompanyTab) {
                setEditingCompanyPlan(undefined);
                setCompanyPlanModalOpen(true);
              } else {
                setEditingCandidatePlan(undefined);
                setCandidatePlanModalOpen(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 
              transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {isCompanyTab ? 'Thêm gói Employer' : 'Thêm gói Candidate'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
              border-b-2 -mb-[2px]
              ${activeTab === tab.key
                ? 'text-primary border-primary bg-primary/5'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Company Plans Tab ─── */}
      {activeTab === 'company-plans' && (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <DataTable
            data={companyPlans}
            columns={companyPlanColumns}
            loading={companyPlansLoading}
            showPagination={false}
            emptyMessage="Chưa có gói Employer nào"
            emptyDescription="Hãy thêm gói đăng ký đầu tiên cho Employer"
          />
        </div>
      )}

      {/* ─── Candidate Plans Tab ─── */}
      {activeTab === 'candidate-plans' && (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <DataTable
            data={candidatePlans}
            columns={candidatePlanColumns}
            loading={candidatePlansLoading}
            showPagination={false}
            emptyMessage="Chưa có gói Candidate nào"
            emptyDescription="Hãy thêm gói đăng ký đầu tiên cho Candidate"
          />
        </div>
      )}

      {/* ─── Subscriptions Tabs ─── */}
      {(activeTab === 'company-subs' || activeTab === 'candidate-subs') && (
        <>
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

          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <DataTable
              data={subscriptions}
              columns={subscriptionColumns}
              loading={subscriptionsLoading}
              selectable
              showPagination
              defaultPageSize={10}
              emptyMessage="Không có đăng ký nào"
              emptyDescription={`Chưa có ${isCompanyTab ? 'công ty' : 'ứng viên'} nào đăng ký`}
            />
          </div>
        </>
      )}

      {/* ─── Modals ─── */}

      {/* Company Plan Form Modal */}
      {companyPlanModalOpen && (
        <PlanFormModal
          plan={editingCompanyPlan}
          onSave={handleSaveCompanyPlan}
          onCancel={() => {
            setCompanyPlanModalOpen(false);
            setEditingCompanyPlan(undefined);
          }}
        />
      )}

      {/* Candidate Plan Form Modal */}
      {candidatePlanModalOpen && (
        <CandidatePlanFormModal
          plan={editingCandidatePlan}
          onSave={handleSaveCandidatePlan}
          onCancel={() => {
            setCandidatePlanModalOpen(false);
            setEditingCandidatePlan(undefined);
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

      {/* Confirm Modal */}
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