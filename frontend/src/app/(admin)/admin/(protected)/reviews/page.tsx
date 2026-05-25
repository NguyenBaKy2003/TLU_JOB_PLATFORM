// D:\TLU_JOB_PLATFORM\frontend\src\app\(admin)\admin\(protected)\reviews\page.tsx

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
  StatusBadge
} from '@/presentation/components/common';
import { AdminReviewRepository } from '@/infrastructure/repositories/AdminReviewRepository';
import type { CompanyReview, ReviewStatus } from '@/domain/models/CompanyReview';
import type { PageResponse } from '@/domain/models/CompanyReview';
import { AdminReviewService } from '@/application/services/AdminReviewService';
import { 
  Eye, CheckCircle, XCircle, EyeOff, Trash2, Star, 
  User, Building2, MessageSquare, Clock, Shield,
  ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';

// ─── Status Options ──────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'Chờ duyệt',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: <Clock className="w-3 h-3" />
  },
  APPROVED: {
    label: 'Đã duyệt',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle className="w-3 h-3" />
  },
  REJECTED: {
    label: 'Bị từ chối',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-3 h-3" />
  },
  
};

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedReview, setSelectedReview] = useState<CompanyReview | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject form modal
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    review: CompanyReview | null;
    loading: boolean;
  }>({ isOpen: false, review: null, loading: false });

  const isFetching = useRef(false);
  const service = new AdminReviewService(new AdminReviewRepository());

  const filterConfigs = [
    { key: 'keyword', type: 'input' as const, label: 'Tìm kiếm', placeholder: 'Tìm theo tên, nội dung đánh giá...' },
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: statusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchReviews = useCallback(async (filterValues: { keyword?: string; status?: string }) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const status = (filterValues.status as ReviewStatus) || undefined;
      const result = await service.getAllReviews(0, 10, status);
      
      // Client-side keyword filter
      let filtered = result.content;
      if (filterValues.keyword) {
        const term = filterValues.keyword.toLowerCase();
        filtered = result.content.filter(r =>
          r.title?.toLowerCase().includes(term) ||
          r.content?.toLowerCase().includes(term) ||
          r.reviewerName?.toLowerCase().includes(term)
        );
      }
      
      setReviews(filtered);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách đánh giá');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchReviews({ keyword: filters.keyword, status: filters.status });
  }, [filters.keyword, filters.status]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleApprove = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await service.approveReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã được phê duyệt');
      await fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') });
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reviewId: string, reason: string) => {
    setRejectModal(prev => ({ ...prev, loading: true }));
    try {
      await service.rejectReview(reviewId, reason);
      toastRef.current.success('Thành công', 'Đánh giá đã bị từ chối');
      setRejectModal({ isOpen: false, review: null, loading: false });
      await fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') });
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
      setRejectModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleHide = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await service.hideReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã bị ẩn');
      await fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') });
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleShow = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await service.showReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã được hiển thị lại');
      await fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') });
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa vĩnh viễn đánh giá này?')) return;
    setProcessingId(reviewId);
    try {
      await service.deleteReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã bị xóa vĩnh viễn');
      await fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') });
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const openDetail = (review: CompanyReview) => {
    setSelectedReview(review);
    setDetailModalOpen(true);
  };

  const openRejectForm = (review: CompanyReview) => {
    setRejectModal({ isOpen: true, review, loading: false });
  };

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') });
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchReviews, getFilterValue]);

  // ─── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<CompanyReview>[] = [
    {
      key: 'reviewerName',
      title: 'Người đánh giá',
      width: '180px',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(value || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground text-[16px]">{value || 'Ẩn danh'}</div>
            {record.employed && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                Nhân viên
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'content',
      title: 'Nội dung',
      width: '250px',
      render: (value, record) => (
        <div className="max-w-[250px]">
          {record.title && (
            <div className="font-medium text-foreground text-[16px] truncate">{record.title}</div>
          )}
          <div className="text-xs text-muted-foreground line-clamp-2">{value}</div>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Sao',
      width: '80px',
      align: 'center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-[16px] font-semibold">{value}</span>
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      render: (value: string) => {
        const config = statusConfig[value] || statusConfig.PENDING;
        return (
          <StatusBadge
            status={value.toLowerCase()}
            label={config.label}
            size="sm"
          />
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '120px',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    },
    {
      key: 'actions',
      title: '',
      width: '140px',
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

  const getActions = (record: CompanyReview): ActionItem<CompanyReview>[] => {
    const actions: ActionItem<CompanyReview>[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <Eye className="w-4 h-4" />,
        onClick: (r) => openDetail(r),
        color: 'default'
      }
    ];

    if (record.status === 'PENDING') {
      actions.push({
        key: 'approve',
        label: 'Duyệt',
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: (r) => handleApprove(r.id),
        color: 'success'
      });
      actions.push({
        key: 'reject',
        label: 'Từ chối',
        icon: <XCircle className="w-4 h-4" />,
        onClick: (r) => openRejectForm(r),
        color: 'danger'
      });
    }

    if (record.status === 'APPROVED') {
      actions.push({
        key: 'hide',
        label: 'Ẩn',
        icon: <EyeOff className="w-4 h-4" />,
        onClick: (r) => handleHide(r.id),
        color: 'warning'
      });
    }

    if (record.status === 'HIDDEN') {
      actions.push({
        key: 'show',
        label: 'Hiển thị lại',
        icon: <Eye className="w-4 h-4" />,
        onClick: (r) => handleShow(r.id),
        color: 'success'
      });
    }

    actions.push({
      key: 'delete',
      label: 'Xóa',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (r) => handleDelete(r.id),
      color: 'danger'
    });

    return actions;
  };

  // ─── Detail Fields ─────────────────────────────────────────────────────────

  const getDetailFields = (): DetailField[] => {
    if (!selectedReview) return [];
    const config = statusConfig[selectedReview.status] || statusConfig.PENDING;

    return [
      {
        key: 'reviewer',
        label: 'Người đánh giá',
        value: selectedReview.anonymous ? 'Ẩn danh' : (selectedReview.reviewerName || 'N/A'),
        copyable: true
      },
      {
        key: 'rating',
        label: 'Đánh giá',
        value: (
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(star => (
              <Star key={star} size={14}
                className={star <= selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
              />
            ))}
            <span className="ml-1 text-[16px] font-semibold">{selectedReview.rating}/5</span>
          </div>
        ),
        type: 'badge'
      },
      {
        key: 'title',
        label: 'Tiêu đề',
        value: selectedReview.title || 'Không có tiêu đề'
      },
      {
        key: 'content',
        label: 'Nội dung',
        value: selectedReview.content,
        type: 'text'
      },
      {
        key: 'pros',
        label: 'Điểm tốt',
        value: selectedReview.pros || '—',
        type: 'text'
      },
      {
        key: 'cons',
        label: 'Điểm chưa tốt',
        value: selectedReview.cons || '—',
        type: 'text'
      },
      {
        key: 'status',
        label: 'Trạng thái',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        ),
        type: 'badge'
      },
      {
        key: 'createdAt',
        label: 'Ngày tạo',
        value: new Date(selectedReview.createdAt).toLocaleString('vi-VN'),
        type: 'date'
      },
      ...(selectedReview.updatedAt !== selectedReview.createdAt ? [{
        key: 'updatedAt',
        label: 'Cập nhật',
        value: new Date(selectedReview.updatedAt).toLocaleString('vi-VN'),
        type: 'date' as const
      }] : []),
      ...(selectedReview.rejectionReason ? [{
        key: 'rejectionReason',
        label: 'Lý do từ chối',
        value: selectedReview.rejectionReason,
        type: 'text' as const
      }] : [])
    ];
  };

  // ─── Reject Form Fields ────────────────────────────────────────────────────

  const rejectFormFields: FormField[] = [
    {
      name: 'reason',
      label: 'Lý do từ chối',
      type: 'textarea',
      required: true,
      rows: 3,
      placeholder: 'Nhập lý do từ chối đánh giá này...'
    }
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đánh giá</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Quản lý và kiểm duyệt đánh giá trên toàn hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng: <span className="font-semibold text-foreground">{totalElements}</span> đánh giá
          </div>
        </div>
      </div>

      {/* Filter */}
      <AdminFilter
        config={{ searchKey: 'keyword', statusKey: 'status', customFilters: [] }}
        filters={{ keyword: getFilterValue('keyword'), status: getFilterValue('status') }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm kiếm theo tên, nội dung đánh giá..."
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={reviews}
          columns={columns}
          loading={loading}
          selectable
          showPagination
          defaultPageSize={10}
          emptyMessage="Không có đánh giá nào"
          emptyDescription="Chưa có đánh giá nào trong hệ thống"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết đánh giá - ${selectedReview?.reviewerName || 'Ẩn danh'}`}
        fields={getDetailFields()}
      />

      {/* Reject Form Modal */}
      <FormModel
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, review: null, loading: false })}
        onSubmit={(data) => {
          if (rejectModal.review) {
            handleReject(rejectModal.review.id, data.reason);
          }
        }}
        title={`Từ chối đánh giá - ${rejectModal.review?.reviewerName || 'Ẩn danh'}`}
        fields={rejectFormFields}
        initialData={{ reason: '' }}
        submitText="Từ chối"
        loading={rejectModal.loading}
      />
    </div>
  );
}