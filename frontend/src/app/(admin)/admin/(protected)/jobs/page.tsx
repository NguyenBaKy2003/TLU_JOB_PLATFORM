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
import { AdminJobRepository } from '@/infrastructure/repositories/AdminJobRepository';
import type {
  AdminJob,
  AdminJobFilters,
  JobStatus
} from '@/domain/models/AdminJob';
import { AdminJobService } from '@/application/services/AdminJobService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import {Building2, MapPin,  Calendar, Clock, AlertCircle, Eye,  Trash2, XCircle, CheckCircle } from 'lucide-react';

// Status options for filter
const statusOptions = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Đã đăng' },
  { value: 'CLOSED', label: 'Đã đóng' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'DELETED', label: 'Đã xóa' }
];

// Status config for badge
const statusConfig: Record<JobStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: {
    label: 'Bản nháp',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: <Clock className="w-3 h-3" />
  },
  PUBLISHED: {
    label: 'Đã đăng',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />
  },
  CLOSED: {
    label: 'Đã đóng',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  EXPIRED: {
    label: 'Hết hạn',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <AlertCircle className="w-3 h-3" />
  },
  DELETED: {
    label: 'Đã xóa',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    icon: <Trash2 className="w-3 h-3" />
  }
};

// Format currency
const formatCurrency = (amount: number | null, currency: string | null): string => {
  if (!amount) return 'Thỏa thuận';
  const currencySymbol = currency === 'USD' ? '$' : '₫';
  return `${currencySymbol}${amount.toLocaleString()}`;
};

export default function AdminJobsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Confirm Modal state for close/delete
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

  // Close Form Modal state
  const [closeFormModal, setCloseFormModal] = useState<{
    isOpen: boolean;
    job: AdminJob | null;
    loading: boolean;
  }>({
    isOpen: false,
    job: null,
    loading: false
  });

  // Delete Form Modal state
  const [deleteFormModal, setDeleteFormModal] = useState<{
    isOpen: boolean;
    job: AdminJob | null;
    loading: boolean;
  }>({
    isOpen: false,
    job: null,
    loading: false
  });

  const isFetching = useRef(false);

  const service = new AdminJobService(new AdminJobRepository());

  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: statusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  const fetchJobs = useCallback(async (filterValues: { status?: string }) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const apiFilters: AdminJobFilters = {
        page: 0,
        size: 10,
        status: filterValues.status as JobStatus || ''
      };

      const result = await service.listJobs(apiFilters);
      setJobs(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách tin tuyển dụng');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Fetch when filter changes
  useEffect(() => {
    fetchJobs({
      status: filters.status
    });
  }, [filters.status]);

  const fetchJobDetail = async (id: string) => {
    try {
      // Note: You may need to implement getJobById in the service
      // For now, find from existing jobs
      const job = jobs.find(j => j.id === id);
      if (job) {
        setSelectedJob(job);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch job detail:', error);
      const message = extractErrorMessage(error, 'Không thể tải chi tiết tin tuyển dụng');
      toastRef.current.error('Lỗi', message);
    }
  };

  const handleForceClose = async (id: string, reason: string) => {
    setCloseFormModal(prev => ({ ...prev, loading: true }));
    try {
      const job = jobs.find(j => j.id === id);
      await service.forceClose(id, reason);
      await fetchJobs({
        status: getFilterValue('status')
      });
      setCloseFormModal({ isOpen: false, job: null, loading: false });
      toastRef.current.success('Thành công', `Đã đóng tin tuyển dụng "${job?.title}"`);
    } catch (error) {
      console.error('Failed to close job:', error);
      const message = extractErrorMessage(error, 'Không thể đóng tin tuyển dụng');
      toastRef.current.error('Lỗi thao tác', message);
      setCloseFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleForceDelete = async (id: string, reason: string) => {
    setDeleteFormModal(prev => ({ ...prev, loading: true }));
    try {
      const job = jobs.find(j => j.id === id);
      await service.forceDelete(id, reason);
      await fetchJobs({
        status: getFilterValue('status')
      });
      setDeleteFormModal({ isOpen: false, job: null, loading: false });
      toastRef.current.success('Thành công', `Đã xóa tin tuyển dụng "${job?.title}"`);
    } catch (error) {
      console.error('Failed to delete job:', error);
      const message = extractErrorMessage(error, 'Không thể xóa tin tuyển dụng');
      toastRef.current.error('Lỗi thao tác', message);
      setDeleteFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openCloseForm = (job: AdminJob) => {
    setCloseFormModal({
      isOpen: true,
      job,
      loading: false
    });
  };

  const openDeleteForm = (job: AdminJob) => {
    setDeleteFormModal({
      isOpen: true,
      job,
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
    fetchJobs({
      status: getFilterValue('status')
    });
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchJobs, getFilterValue]);

  // Form fields for close
  const closeFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do đóng tin',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Nhập lý do đóng tin tuyển dụng...'
    }
  ];

  // Form fields for delete
  const deleteFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do xóa tin',
      type: 'textarea',
      required: true,
      rows: 4,
      placeholder: 'Nhập lý do xóa tin tuyển dụng...'
    }
  ];

  // Detail fields
  const getDetailFields = (): DetailField[] => {
    if (!selectedJob) return [];
    
    return [
      {
        key: 'title',
        label: 'Tiêu đề',
        value: selectedJob.title,
        copyable: true
      },
      {
        key: 'company',
        label: 'Công ty',
        value: selectedJob.companyName,
        copyable: true
      },
      {
        key: 'status',
        label: 'Trạng thái',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedJob.status].color}`}>
            {statusConfig[selectedJob.status].icon}
            {statusConfig[selectedJob.status].label}
          </span>
        ),
        type: 'badge'
      },
      {
        key: 'level',
        label: 'Cấp bậc',
        value: selectedJob.level || 'Chưa có'
      },
      {
        key: 'location',
        label: 'Địa điểm',
        value: selectedJob.location || 'Chưa có'
      },
      {
        key: 'salary',
        label: 'Mức lương',
        value: formatCurrency(selectedJob.salaryMin, selectedJob.currency) + ' - ' + formatCurrency(selectedJob.salaryMax, selectedJob.currency)
      },
      {
        key: 'deadline',
        label: 'Hạn nộp',
        value: selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN') : 'Chưa có',
        type: 'date'
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        value: new Date(selectedJob.createdAt).toLocaleString('vi-VN'),
        type: 'date'
      },
      {
        key: 'updatedAt',
        label: 'Cập nhật lần cuối',
        value: selectedJob.updatedAt ? new Date(selectedJob.updatedAt).toLocaleString('vi-VN') : '—',
        type: 'date'
      }
    ];
  };

  // Get actions based on job status
  const getActions = (record: AdminJob): ActionItem<AdminJob>[] => {
    const actions: ActionItem<AdminJob>[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => fetchJobDetail(record.id),
        color: 'default'
      }
    ];

    // Only show close/delete for non-closed/non-deleted jobs
    if (record.status !== 'CLOSED' && record.status !== 'DELETED') {
      actions.push({
        key: 'close',
        label: 'Đóng tin',
        icon: <XCircle className="w-4 h-4" />,
        onClick: () => openCloseForm(record),
        color: 'warning'
      });
    }

    // Only show delete for non-deleted jobs
    if (record.status !== 'DELETED') {
      actions.push({
        key: 'delete',
        label: 'Xóa tin',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => openDeleteForm(record),
        color: 'danger'
      });
    }
    
    return actions;
  };

  // Table columns
  const columns: Column<AdminJob>[] = [
    {
      key: 'title',
      title: 'Tiêu đề',
      sortable: true,
      width: '300px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {record.companyName}
          </div>
        </div>
      )
    },
    {
      key: 'level',
      title: 'Cấp bậc',
      width: '120px',
      render: (value) => value || '—'
    },
    {
      key: 'location',
      title: 'Địa điểm',
      width: '150px',
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span>{value || '—'}</span>
        </div>
      )
    },
    {
      key: 'salary',
      title: 'Mức lương',
      width: '150px',
      render: (_, record) => formatCurrency(record.salaryMin, record.currency) + ' - ' + formatCurrency(record.salaryMax, record.currency)
    },
    {
      key: 'deadline',
      title: 'Hạn nộp',
      width: '120px',
      render: (value) => {
        if (!value) return '—';
        const deadline = new Date(value);
        const isExpired = deadline < new Date();
        return (
          <div className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
            <Calendar className="w-3 h-3" />
            <span>{deadline.toLocaleDateString('vi-VN')}</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '130px',
      render: (value: JobStatus) => {
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
      width: '150px',
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
          <h1 className="text-2xl font-bold text-foreground">Quản lý tin tuyển dụng</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Quản lý và kiểm soát các tin tuyển dụng trên hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> tin
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
          data={jobs}
          columns={columns}
          loading={loading}
          selectable
          showPagination
          defaultPageSize={10}
          emptyMessage="Không có tin tuyển dụng"
          emptyDescription="Chưa có tin tuyển dụng nào trong hệ thống"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết tin tuyển dụng - ${selectedJob?.title || ''}`}
        fields={getDetailFields()}
      />

      {/* Form Modal for Close Job */}
      <FormModel
        isOpen={closeFormModal.isOpen}
        onClose={() => setCloseFormModal({ isOpen: false, job: null, loading: false })}
        onSubmit={(data) => {
          if (closeFormModal.job) {
            handleForceClose(closeFormModal.job.id, data.reason);
          }
        }}
        title={`Đóng tin tuyển dụng - ${closeFormModal.job?.title || ''}`}
        fields={closeFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận đóng"
        loading={closeFormModal.loading}
      />

      {/* Form Modal for Delete Job */}
      <FormModel
        isOpen={deleteFormModal.isOpen}
        onClose={() => setDeleteFormModal({ isOpen: false, job: null, loading: false })}
        onSubmit={(data) => {
          if (deleteFormModal.job) {
            handleForceDelete(deleteFormModal.job.id, data.reason);
          }
        }}
        title={`Xóa tin tuyển dụng - ${deleteFormModal.job?.title || ''}`}
        fields={deleteFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận xóa"
        loading={deleteFormModal.loading}
      />
    </div>
  );
}