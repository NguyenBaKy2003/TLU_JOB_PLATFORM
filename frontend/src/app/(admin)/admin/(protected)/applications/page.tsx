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
  DetailField
} from '@/presentation/components/common';
import { AdminApplicationRepository } from '@/infrastructure/repositories/AdminApplicationRepository';
import type {
  AdminApplication,
  AdminApplicationDetail,
  AdminApplicationFilters,
  ApplicationStatus,
  ApplicationStatusLog
} from '@/domain/models/AdminApplication';
import { AdminApplicationService } from '@/application/services/AdminApplicationService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import { Eye, FileText, Calendar, Star, AlertCircle, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';

// Status options for filter
const statusOptions = [
  { value: 'SUBMITTED', label: 'Đã nộp' },
  { value: 'REVIEWING', label: 'Đang xem xét' },
  { value: 'SHORTLISTED', label: 'Vào danh sách' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Đã hẹn phỏng vấn' },
  { value: 'HIRED', label: 'Đã tuyển' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'WITHDRAWN', label: 'Rút đơn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'PENDING', label: 'Chờ xử lý' }
];

// Status config for badge
const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  SUBMITTED: {
    label: 'Đã nộp',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <FileText className="w-3 h-3" />
  },
  REVIEWING: {
    label: 'Đang xem xét',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3 h-3" />
  },
  SHORTLISTED: {
    label: 'Vào danh sách',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: <Star className="w-3 h-3" />
  },
  INTERVIEW_SCHEDULED: {
    label: 'Đã hẹn phỏng vấn',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: <Calendar className="w-3 h-3" />
  },
  HIRED: {
    label: 'Đã tuyển',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  WITHDRAWN: {
    label: 'Rút đơn',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: <AlertCircle className="w-3 h-3" />
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    icon: <XCircle className="w-3 h-3" />
  },
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: <Clock className="w-3 h-3" />
  }
};

// Status options for form
const statusFormOptions = statusOptions.map(opt => ({
  value: opt.value,
  label: opt.label
}));

export default function AdminApplicationsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<AdminApplicationDetail | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusLogs, setStatusLogs] = useState<ApplicationStatusLog[]>([]);

  // Confirm Modal state for status change
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Status Form Modal state
  const [statusFormModal, setStatusFormModal] = useState<{
    isOpen: boolean;
    application: AdminApplication | null;
    loading: boolean;
  }>({
    isOpen: false,
    application: null,
    loading: false
  });

  const isFetching = useRef(false);

  const service = new AdminApplicationService(new AdminApplicationRepository());

  const filterConfigs = [
    { key: 'keyword', type: 'input' as const, label: 'Tìm kiếm', placeholder: 'Tìm theo tên ứng viên, email, vị trí...' },
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: statusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  const fetchApplications = useCallback(async (filterValues: { keyword?: string; status?: string }) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const apiFilters: AdminApplicationFilters = {
        page: 0,
        size: 10,
        status: (filterValues.status as ApplicationStatus) || '',
        ...(filterValues.keyword && { keyword: filterValues.keyword })
      };

      const result = await service.listAll(apiFilters);
      setApplications(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Fetch when filter changes
  useEffect(() => {
    fetchApplications({
      keyword: filters.keyword,
      status: filters.status
    });
  }, [filters.keyword, filters.status]);

  const fetchApplicationDetail = async (id: string) => {
    try {
      const detail = await service.getById(id);
      const logs = await service.getStatusLogs(id);
      setSelectedApplication(detail);
      setStatusLogs(logs);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch application detail:', error);
      const message = extractErrorMessage(error, 'Không thể tải chi tiết đơn ứng tuyển');
      toastRef.current.error('Lỗi', message);
    }
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus, reason: string) => {
    setStatusFormModal(prev => ({ ...prev, loading: true }));
    try {
      const application = applications.find(a => a.id === id);
      await service.overrideStatus(id, status, reason);
      await fetchApplications({
        keyword: getFilterValue('keyword'),
        status: getFilterValue('status')
      });
      setStatusFormModal({ isOpen: false, application: null, loading: false });
      const statusLabel = statusConfig[status].label;
      toastRef.current.success('Thành công', `Đã cập nhật trạng thái đơn ứng tuyển của "${application?.candidateName}" thành ${statusLabel}`);
    } catch (error) {
      console.error('Failed to change status:', error);
      const message = extractErrorMessage(error, 'Không thể thay đổi trạng thái');
      toastRef.current.error('Lỗi thao tác', message);
      setStatusFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openStatusForm = (application: AdminApplication) => {
    setStatusFormModal({
      isOpen: true,
      application,
      loading: false
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
    fetchApplications({
      keyword: getFilterValue('keyword'),
      status: getFilterValue('status')
    });
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchApplications, getFilterValue]);

  // Form fields for status change
  const statusFormFields: FormField[] = [
    {
      name: 'status',
      label: 'Trạng thái mới',
      type: 'select',
      required: true,
      options: statusFormOptions,
      placeholder: 'Chọn trạng thái mới'
    },
    {
      name: 'reason',
      label: 'Lý do thay đổi',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'Nhập lý do thay đổi trạng thái...'
    }
  ];

  // Detail fields
  const getDetailFields = (): DetailField[] => {
    if (!selectedApplication) return [];
    
    return [
      {
        key: 'candidateInfo',
        label: 'Thông tin ứng viên',
        value: (
          <div className="space-y-1">
            <div className="font-medium">{selectedApplication.candidateName}</div>
            <div className="text-[16px] text-muted-foreground">{selectedApplication.candidateEmail}</div>
            {selectedApplication.candidate?.phone && (
              <div className="text-[16px] text-muted-foreground">{selectedApplication.candidate.phone}</div>
            )}
          </div>
        ),
        type: 'text'
      },
      {
        key: 'jobInfo',
        label: 'Vị trí ứng tuyển',
        value: (
          <div className="space-y-1">
            <div className="font-medium">{selectedApplication.job.title}</div>
            {selectedApplication.job.level && (
              <div className="text-[16px] text-muted-foreground">Cấp bậc: {selectedApplication.job.level}</div>
            )}
          </div>
        ),
        type: 'text'
      },
      {
        key: 'status',
        label: 'Trạng thái',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedApplication.status].color}`}>
            {statusConfig[selectedApplication.status].icon}
            {statusConfig[selectedApplication.status].label}
          </span>
        ),
        type: 'badge'
      },
      {
        key: 'appliedAt',
        label: 'Ngày ứng tuyển',
        value: new Date(selectedApplication.appliedAt).toLocaleDateString('vi-VN'),
        type: 'date'
      },
      {
        key: 'aiScore',
        label: 'Điểm AI',
        value: selectedApplication.aiScore ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedApplication.aiScore}</span>
            <span className="text-[16px] text-muted-foreground">({selectedApplication.aiScoreLabel})</span>
          </div>
        ) : 'Chưa có điểm',
        type: 'text'
      },
      {
        key: 'statusLogs',
        label: 'Lịch sử thay đổi',
        value: (
          <div className="space-y-2">
            {statusLogs.map(log => (
              <div key={log.id} className="text-[16px] border-l-2 border-border pl-3 py-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig[log.toStatus].color}`}>
                    {statusConfig[log.toStatus].label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(log.changedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                {log.reason && (
                  <div className="text-muted-foreground text-xs mt-1">
                    Lý do: {log.reason}
                  </div>
                )}
                {log.changedBy && (
                  <div className="text-muted-foreground text-xs">
                    Thực hiện bởi: {log.changedBy}
                  </div>
                )}
              </div>
            ))}
          </div>
        ),
        type: 'text'
      }
    ];
  };

  // Table columns
  const columns: Column<AdminApplication>[] = [
    {
      key: 'candidateName',
      title: 'Ứng viên',
      sortable: true,
      width: '200px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{record.candidateEmail}</div>
        </div>
      )
    },
    {
      key: 'job',
      title: 'Vị trí',
      width: '200px',
      render: (value: AdminApplication['job']) => (
        <div>
          <div className="font-medium text-foreground">{value.title}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '150px',
      render: (value: ApplicationStatus) => {
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
      key: 'appliedAt',
      title: 'Ngày ứng tuyển',
      width: '120px',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'aiScore',
      title: 'Điểm AI',
      width: '100px',
      render: (value) => value ? (
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="font-medium">{value}</span>
        </div>
      ) : '—'
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <TableActions
          record={record}
          actions={actions}
          showLabel={false}
        />
      )
    }
  ];

  // Table actions
  const actions: ActionItem<AdminApplication>[] = [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <Eye className="w-4 h-4" />,
      onClick: (record) => {
        fetchApplicationDetail(record.id);
      },
      color: 'default'
    },
    {
      key: 'status',
      label: 'Đổi trạng thái',
      icon: <Edit className="w-4 h-4" />,
      onClick: (record) => {
        openStatusForm(record);
      },
      color: 'default'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đơn ứng tuyển</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Quản lý và theo dõi trạng thái các đơn ứng tuyển
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> đơn
          </div>
        </div>
      </div>

      {/* Admin Filter */}
      <AdminFilter
        config={{
          searchKey: 'keyword',
          statusKey: 'status',
          customFilters: []
        }}
        filters={{
          keyword: getFilterValue('keyword'),
          status: getFilterValue('status')
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm kiếm theo tên ứng viên, email, vị trí..."
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Data Table */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          selectable
          showPagination
          defaultPageSize={10}
          emptyMessage="Không có đơn ứng tuyển"
          emptyDescription="Chưa có đơn ứng tuyển nào trong hệ thống"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết đơn ứng tuyển - ${selectedApplication?.candidateName || ''}`}
        fields={getDetailFields()}
      />

      {/* Form Modal for Status Change */}
      <FormModel
        isOpen={statusFormModal.isOpen}
        onClose={() => setStatusFormModal({ isOpen: false, application: null, loading: false })}
        onSubmit={(data) => {
          if (statusFormModal.application) {
            handleStatusChange(statusFormModal.application.id, data.status, data.reason);
          }
        }}
        title={`Đổi trạng thái - ${statusFormModal.application?.candidateName || ''}`}
        fields={statusFormFields}
        initialData={{ status: statusFormModal.application?.status || '', reason: '' }}
        submitText="Cập nhật"
        loading={statusFormModal.loading}
      />
    </div>
  );
}