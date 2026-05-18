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
} from '@/presentation/components/common';
import { CompanyDetailModal } from '@/presentation/components/admin/companies/CompanyDetailModal';
import { AdminCompanyRepository } from '@/infrastructure/repositories/AdminCompanyRepository';
import type {
  AdminCompany,
  AdminCompanyFilters,
  VerificationStatus
} from '@/domain/models/AdminCompany';
import { AdminCompanyService } from '@/application/services/AdminCompanyService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import { Building2, Mail, Globe, MapPin, Briefcase, CheckCircle, XCircle, Clock, AlertCircle, Eye, Edit, Shield, Unlock } from 'lucide-react';

// Status options for filter
const statusOptions = [
  { value: 'UNVERIFIED', label: 'Chưa xác thực' },
  { value: 'VERIFIED', label: 'Đã xác thực' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'SUSPENDED', label: 'Đã khóa' }
];

// Status config for badge
const statusConfig: Record<VerificationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  UNVERIFIED: {
    label: 'Chưa xác thực',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3 h-3" />
  },
  VERIFIED: {
    label: 'Đã xác thực',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  SUSPENDED: {
    label: 'Đã khóa',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: <AlertCircle className="w-3 h-3" />
  }
};

// Action button config
const actionButtonConfig = {
  UNVERIFIED: {
    primaryAction: 'approve',
    primaryLabel: 'Xác thực',
    primaryIcon: <CheckCircle className="w-4 h-4" />,
    primaryColor: 'success' as const,
    secondaryAction: 'reject',
    secondaryLabel: 'Từ chối',
    secondaryIcon: <XCircle className="w-4 h-4" />,
    secondaryColor: 'danger' as const
  },
  VERIFIED: {
    primaryAction: 'suspend',
    primaryLabel: 'Khóa',
    primaryIcon: <Shield className="w-4 h-4" />,
    primaryColor: 'warning' as const,
    secondaryAction: null,
    secondaryLabel: null,
    secondaryIcon: null,
    secondaryColor: null
  },
  SUSPENDED: {
    primaryAction: 'unsuspend',
    primaryLabel: 'Mở khóa',
    primaryIcon: <Unlock className="w-4 h-4" />,
    primaryColor: 'success' as const,
    secondaryAction: null,
    secondaryLabel: null,
    secondaryIcon: null,
    secondaryColor: null
  },
  REJECTED: {
    primaryAction: null,
    primaryLabel: null,
    primaryIcon: null,
    primaryColor: null,
    secondaryAction: null,
    secondaryLabel: null,
    secondaryIcon: null,
    secondaryColor: null
  }
};

export default function AdminCompaniesPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  
  // Company Detail Modal state
  const [detailCompanyId, setDetailCompanyId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Confirm Modal state
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

  // Reject Form Modal state
  const [rejectFormModal, setRejectFormModal] = useState<{
    isOpen: boolean;
    company: AdminCompany | null;
    loading: boolean;
  }>({
    isOpen: false,
    company: null,
    loading: false
  });

  // Suspend Form Modal state
  const [suspendFormModal, setSuspendFormModal] = useState<{
    isOpen: boolean;
    company: AdminCompany | null;
    loading: boolean;
  }>({
    isOpen: false,
    company: null,
    loading: false
  });

  const isFetching = useRef(false);

  const service = new AdminCompanyService(new AdminCompanyRepository());

  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: statusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  const fetchCompanies = useCallback(async (filterValues: { status?: string }) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const apiFilters: AdminCompanyFilters = {
        page: 0,
        size: 10,
        status: filterValues.status as VerificationStatus || ''
      };

      const result = await service.listCompanies(apiFilters);
      setCompanies(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách công ty');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Fetch when filter changes
  useEffect(() => {
    fetchCompanies({
      status: filters.status
    });
  }, [filters.status]);

  // Mở modal chi tiết công ty
  const openCompanyDetail = (id: string) => {
    setDetailCompanyId(id);
    setDetailModalOpen(true);
  };

  // Đóng modal chi tiết công ty
  const closeCompanyDetail = () => {
    setDetailModalOpen(false);
    setDetailCompanyId(null);
  };

  const handleApprove = async (id: string) => {
    try {
      const company = companies.find(c => c.id === id);
      await service.approve(id);
      await fetchCompanies({
        status: getFilterValue('status')
      });
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      toastRef.current.success('Thành công', `Đã xác thực công ty "${company?.name}" thành công`);
    } catch (error) {
      console.error('Failed to approve company:', error);
      const message = extractErrorMessage(error, 'Không thể xác thực công ty');
      toastRef.current.error('Lỗi thao tác', message);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setRejectFormModal(prev => ({ ...prev, loading: true }));
    try {
      const company = companies.find(c => c.id === id);
      await service.reject(id, reason);
      await fetchCompanies({
        status: getFilterValue('status')
      });
      setRejectFormModal({ isOpen: false, company: null, loading: false });
      toastRef.current.success('Thành công', `Đã từ chối xác thực công ty "${company?.name}"`);
    } catch (error) {
      console.error('Failed to reject company:', error);
      const message = extractErrorMessage(error, 'Không thể từ chối xác thực công ty');
      toastRef.current.error('Lỗi thao tác', message);
      setRejectFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSuspend = async (id: string, reason: string) => {
    setSuspendFormModal(prev => ({ ...prev, loading: true }));
    try {
      const company = companies.find(c => c.id === id);
      await service.suspend(id, reason);
      await fetchCompanies({
        status: getFilterValue('status')
      });
      setSuspendFormModal({ isOpen: false, company: null, loading: false });
      toastRef.current.success('Thành công', `Đã khóa công ty "${company?.name}"`);
    } catch (error) {
      console.error('Failed to suspend company:', error);
      const message = extractErrorMessage(error, 'Không thể khóa công ty');
      toastRef.current.error('Lỗi thao tác', message);
      setSuspendFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUnsuspend = async (id: string) => {
    try {
      const company = companies.find(c => c.id === id);
      await service.unsuspend(id);
      await fetchCompanies({
        status: getFilterValue('status')
      });
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      toastRef.current.success('Thành công', `Đã mở khóa công ty "${company?.name}"`);
    } catch (error) {
      console.error('Failed to unsuspend company:', error);
      const message = extractErrorMessage(error, 'Không thể mở khóa công ty');
      toastRef.current.error('Lỗi thao tác', message);
    }
  };

  const openApproveConfirm = (company: AdminCompany) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác thực công ty',
      message: `Bạn có chắc chắn muốn xác thực công ty "${company.name}"? Sau khi xác thực, công ty sẽ có thể đăng bài tuyển dụng.`,
      type: 'success',
      onConfirm: () => handleApprove(company.id)
    });
  };

  const openRejectForm = (company: AdminCompany) => {
    setRejectFormModal({
      isOpen: true,
      company,
      loading: false
    });
  };

  const openSuspendForm = (company: AdminCompany) => {
    setSuspendFormModal({
      isOpen: true,
      company,
      loading: false
    });
  };

  const openUnsuspendConfirm = (company: AdminCompany) => {
    setConfirmModal({
      isOpen: true,
      title: 'Mở khóa công ty',
      message: `Bạn có chắc chắn muốn mở khóa công ty "${company.name}"? Công ty sẽ có thể hoạt động trở lại.`,
      type: 'success',
      onConfirm: () => handleUnsuspend(company.id)
    });
  };

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchCompanies({
      status: getFilterValue('status')
    });
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchCompanies, getFilterValue]);

  // Form fields for reject
  const rejectFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do từ chối',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Nhập lý do từ chối xác thực công ty...'
    }
  ];

  // Form fields for suspend
  const suspendFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do khóa',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Nhập lý do khóa công ty...'
    }
  ];

  // Generate dynamic actions based on company status
  const getActions = (record: AdminCompany): ActionItem<AdminCompany>[] => {
    const actions: ActionItem<AdminCompany>[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => openCompanyDetail(record.id), // Sử dụng hàm mới
        color: 'default'
      }
    ];

    const config = actionButtonConfig[record.verificationStatus];
    
    if (config.primaryAction && config.primaryLabel) {
      actions.push({
        key: config.primaryAction,
        label: config.primaryLabel,
        icon: config.primaryIcon,
        onClick: () => {
          if (config.primaryAction === 'approve') openApproveConfirm(record);
          if (config.primaryAction === 'suspend') openSuspendForm(record);
          if (config.primaryAction === 'unsuspend') openUnsuspendConfirm(record);
        },
        color: config.primaryColor
      });
    }
    
    if (config.secondaryAction && config.secondaryLabel) {
      actions.push({
        key: config.secondaryAction,
        label: config.secondaryLabel,
        icon: config.secondaryIcon,
        onClick: () => {
          if (config.secondaryAction === 'reject') openRejectForm(record);
        },
        color: config.secondaryColor
      });
    }
    
    return actions;
  };

  // Table columns
  const columns: Column<AdminCompany>[] = [
    {
      key: 'logoUrl',
      title: 'Logo',
      width: '80px',
      render: (value) => value ? (
        <img src={value} alt="Logo" className="w-10 h-10 rounded-lg object-cover border" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Building2 className="w-5 h-5 text-muted-foreground" />
        </div>
      )
    },
    {
      key: 'name',
      title: 'Tên công ty',
      sortable: true,
      width: '250px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{record.email}</div>
        </div>
      )
    },
    {
      key: 'industry',
      title: 'Ngành nghề',
      width: '150px',
      render: (value) => value || '—'
    },
    {
      key: 'city',
      title: 'Thành phố',
      width: '120px',
      render: (value) => value || '—'
    },
    {
      key: 'verificationStatus',
      title: 'Trạng thái',
      width: '150px',
      render: (value: VerificationStatus) => {
        const config = statusConfig[value];
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
      width: '120px',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '180px',
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý công ty</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Quản lý và xác thực các công ty trên hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> công ty
          </div>
        </div>
      </div>

      {/* Admin Filter */}
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
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder=""
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Data Table */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={companies}
          columns={columns}
          loading={loading}
          selectable
          showPagination
          defaultPageSize={10}
          emptyMessage="Không có công ty"
          emptyDescription="Chưa có công ty nào trong hệ thống"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Company Detail Modal - Component mới */}
      <CompanyDetailModal
        isOpen={detailModalOpen}
        onClose={closeCompanyDetail}
        companyId={detailCompanyId || ""}
      />

      {/* Confirm Modal for Approve/Unsuspend */}
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

      {/* Form Modal for Reject */}
      <FormModel
        isOpen={rejectFormModal.isOpen}
        onClose={() => setRejectFormModal({ isOpen: false, company: null, loading: false })}
        onSubmit={(data) => {
          if (rejectFormModal.company) {
            handleReject(rejectFormModal.company.id, data.reason);
          }
        }}
        title={`Từ chối xác thực - ${rejectFormModal.company?.name || ''}`}
        fields={rejectFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận từ chối"
        loading={rejectFormModal.loading}
      />

      {/* Form Modal for Suspend */}
      <FormModel
        isOpen={suspendFormModal.isOpen}
        onClose={() => setSuspendFormModal({ isOpen: false, company: null, loading: false })}
        onSubmit={(data) => {
          if (suspendFormModal.company) {
            handleSuspend(suspendFormModal.company.id, data.reason);
          }
        }}
        title={`Khóa công ty - ${suspendFormModal.company?.name || ''}`}
        fields={suspendFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận khóa"
        loading={suspendFormModal.loading}
      />
    </div>
  );
}