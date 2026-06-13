'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { CompanyReviewRepository } from '@/infrastructure/repositories/CompanyReviewRepository';
import type { CompanyReview, ReviewStatus } from '@/domain/models/CompanyReview';
import { CompanyReviewService } from '@/application/services/CompanyReviewService';
import { Eye, CheckCircle, XCircle, Star, Clock } from 'lucide-react';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';

// ─── Constants ───────

const STATUS_OPTIONS = [
  { value: 'PENDING',  label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Chờ duyệt',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock       className="w-3 h-3" /> },
  APPROVED: { label: 'Đã duyệt',    color: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',  icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED: { label: 'Bị từ chối',  color: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',    icon: <XCircle     className="w-3 h-3" /> },
};

const FILTER_CONFIGS = [
  { key: 'keyword', type: 'input'  as const, label: 'Tìm kiếm',   placeholder: 'Tìm theo nội dung đánh giá...' },
  { key: 'status',  type: 'select' as const, label: 'Trạng thái', options: STATUS_OPTIONS },
];

const REJECT_FORM_FIELDS: FormField[] = [
  {
    name: 'reason',
    label: 'Lý do từ chối',
    type: 'textarea',
    required: true,
    rows: 3,
    placeholder: 'Nhập lý do từ chối đánh giá này...',
  },
];

// ─── Service singleton (outside component to avoid re-creation) ───────────────

const reviewService = new CompanyReviewService(new CompanyReviewRepository());

// ─── Page Component ──

export default function EmployerReviewsPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const [reviews,       setReviews]       = useState<CompanyReview[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedReview, setSelectedReview] = useState<CompanyReview | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [processingId,  setProcessingId]  = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    review: CompanyReview | null;
    loading: boolean;
  }>({ isOpen: false, review: null, loading: false });

  const isFetching = useRef(false);

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: FILTER_CONFIGS,
    syncWithUrl: true,
    debounceMs: 500,
  });

  // ─── Fetch ───────

  const fetchReviews = useCallback(async (filterValues: { keyword?: string; status?: string }) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const status = (filterValues.status as ReviewStatus) || undefined;
      const result = await reviewService.getEmployerReviews(0, 10, status);

      const filtered = filterValues.keyword
        ? result.content.filter(r => {
            const term = filterValues.keyword!.toLowerCase();
            return (
              r.title?.toLowerCase().includes(term) ||
              r.content?.toLowerCase().includes(term) ||
              r.reviewerName?.toLowerCase().includes(term)
            );
          })
        : result.content;

      setReviews(filtered);
      setTotalElements(result.totalElements);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu',
        extractErrorMessage(error, 'Không thể tải danh sách đánh giá'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchReviews({ keyword: filters.keyword, status: filters.status });
  }, [filters.keyword, filters.status, fetchReviews]);

  // ─── Actions ─────

  const refreshCurrent = useCallback(() =>
    fetchReviews({ keyword: getFilterValue('keyword'), status: getFilterValue('status') }),
  [fetchReviews, getFilterValue]);

  const handleApprove = useCallback(async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await reviewService.approveReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã được phê duyệt');
      await refreshCurrent();
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }, [refreshCurrent]);

  const handleReject = useCallback(async (reviewId: string, reason: string) => {
    setRejectModal(prev => ({ ...prev, loading: true }));
    try {
      await reviewService.rejectReview(reviewId, reason);
      toastRef.current.success('Thành công', 'Đánh giá đã bị từ chối');
      setRejectModal({ isOpen: false, review: null, loading: false });
      await refreshCurrent();
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
      setRejectModal(prev => ({ ...prev, loading: false }));
    }
  }, [refreshCurrent]);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    refreshCurrent();
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [refreshCurrent]);

  // ─── Columns ─────

  const getActions = useCallback((record: CompanyReview): ActionItem<CompanyReview>[] => {
    const actions: ActionItem<CompanyReview>[] = [
      {
        key: 'view',
        label: 'Xem chi tiết',
        icon: <Eye className="w-4 h-4" />,
        onClick: (r) => { setSelectedReview(r); setDetailModalOpen(true); },
        color: 'default',
      },
    ];

    if (record.status === 'PENDING') {
      actions.push({
        key: 'approve',
        label: processingId === record.id ? 'Đang xử lý...' : 'Duyệt',
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: (r) => handleApprove(r.id),
        color: 'success',
        disabled: processingId === record.id,
      });
      actions.push({
        key: 'reject',
        label: 'Từ chối',
        icon: <XCircle className="w-4 h-4" />,
        onClick: (r) => setRejectModal({ isOpen: true, review: r, loading: false }),
        color: 'danger',
        disabled: processingId === record.id,
      });
    }

    return actions;
  }, [processingId, handleApprove]);

  const columns: Column<CompanyReview>[] = useMemo(() => [
    {
      key: 'reviewerName',
      title: 'Người đánh giá',
      width: '160px',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(value || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground text-sm">{value || 'Ẩn danh'}</div>
            {record.employed && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                Nhân viên
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      title: 'Nội dung',
      width: '250px',
      render: (value, record) => (
        <div className="max-w-[250px]">
          {record.title && (
            <div className="font-medium text-foreground text-sm truncate">{record.title}</div>
          )}
          <div className="text-xs text-muted-foreground line-clamp-2">{value}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      title: 'Sao',
      width: '70px',
      align: 'center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-semibold">{value}</span>
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      render: (value: string) => {
        const config = STATUS_CONFIG[value] ?? STATUS_CONFIG.PENDING;
        return <StatusBadge status={value.toLowerCase()} label={config.label} size="sm" />;
      },
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '110px',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'short', day: 'numeric',
      }),
    },
    {
      key: 'actions',
      title: '',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <TableActions record={record} actions={getActions(record)} showLabel={false} />
      ),
    },
  ], [getActions]);

  // ─── Detail Fields 

  const detailFields: DetailField[] = useMemo(() => {
    if (!selectedReview) return [];
    const config = STATUS_CONFIG[selectedReview.status] ?? STATUS_CONFIG.PENDING;

    return [
      { key: 'reviewer', label: 'Người đánh giá',
        value: selectedReview.anonymous ? 'Ẩn danh' : (selectedReview.reviewerName || 'N/A') },
      {
        key: 'rating', label: 'Đánh giá', type: 'badge' as const,
        value: (
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(star => (
              <Star key={star} size={14}
                className={star <= selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
            ))}
            <span className="ml-1 text-sm font-semibold">{selectedReview.rating}/5</span>
          </div>
        ),
      },
      { key: 'title',   label: 'Tiêu đề',       value: selectedReview.title   || 'Không có tiêu đề' },
      { key: 'content', label: 'Nội dung',       value: selectedReview.content, type: 'text' as const },
      { key: 'pros',    label: 'Điểm tốt',       value: selectedReview.pros   || '—', type: 'text' as const },
      { key: 'cons',    label: 'Điểm chưa tốt',  value: selectedReview.cons   || '—', type: 'text' as const },
      {
        key: 'status', label: 'Trạng thái', type: 'badge' as const,
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}{config.label}
          </span>
        ),
      },
      { key: 'createdAt', label: 'Ngày tạo',
        value: new Date(selectedReview.createdAt).toLocaleString('vi-VN'), type: 'date' as const },
      ...(selectedReview.rejectionReason ? [{
        key: 'rejectionReason', label: 'Lý do từ chối',
        value: selectedReview.rejectionReason, type: 'text' as const,
      }] : []),
    ];
  }, [selectedReview]);

  // ─── Render ───────

  const pendingCount = useMemo(() =>
    reviews.filter(r => r.status === 'PENDING').length, [reviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đánh giá</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý đánh giá của công ty bạn
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                {pendingCount} chờ duyệt
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng: <span className="font-semibold text-foreground">{totalElements}</span> đánh giá
        </div>
      </div>

      {/* Filter */}
      <AdminFilter
        config={{ searchKey: 'keyword', statusKey: 'status', customFilters: [] }}
        filters={{ keyword: getFilterValue('keyword'), status: getFilterValue('status') }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={STATUS_OPTIONS}
        searchPlaceholder="Tìm kiếm theo nội dung đánh giá..."
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
          emptyMessage="Chưa có đánh giá nào"
          emptyDescription="Đánh giá từ ứng viên sẽ xuất hiện ở đây"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết đánh giá — ${selectedReview?.reviewerName || 'Ẩn danh'}`}
        fields={detailFields}
      />

      {/* Reject Modal */}
      <FormModel
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, review: null, loading: false })}
        onSubmit={(data) => {
          if (rejectModal.review) handleReject(rejectModal.review.id, data.reason);
        }}
        title={`Từ chối đánh giá — ${rejectModal.review?.reviewerName || 'Ẩn danh'}`}
        fields={REJECT_FORM_FIELDS}
        initialData={{ reason: '' }}
        submitText="Từ chối"
        loading={rejectModal.loading}
      />
    </div>
  );
}