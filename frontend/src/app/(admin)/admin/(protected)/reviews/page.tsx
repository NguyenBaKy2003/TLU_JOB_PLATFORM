'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable, Column, ActionItem, AdminFilter, useFilter,
  TableActions, FormModel, FormField, DetailModel, DetailField,
  StatusBadge, TablePagination,
} from '@/presentation/components/common';
import { AdminReviewRepository } from '@/infrastructure/repositories/AdminReviewRepository';
import type { CompanyReview, ReviewStatus } from '@/domain/models/CompanyReview';
import { AdminReviewService } from '@/application/services/AdminReviewService';
import {
  Eye, CheckCircle, XCircle, EyeOff, Trash2, Star,
  Clock, FileSpreadsheet, FileText,
} from 'lucide-react';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';

// ─── Constants ────────

const statusOptions = [
  { value: 'PENDING',  label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'HIDDEN',   label: 'Đã ẩn' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Chờ duyệt',   color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3 h-3" /> },
  APPROVED: { label: 'Đã duyệt',    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',    icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED: { label: 'Bị từ chối',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',           icon: <XCircle className="w-3 h-3" /> },
  HIDDEN:   { label: 'Đã ẩn',       color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',          icon: <EyeOff className="w-3 h-3" /> },
};

// ─── Component ────────

export default function AdminReviewsPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const serviceRef  = useRef(new AdminReviewService(new AdminReviewRepository()));
  const isFetching  = useRef(false);
  const pageSizeRef = useRef(10);

  // ── State ──────────
  const [reviews,       setReviews]       = useState<CompanyReview[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [exporting,     setExporting]     = useState<'excel' | 'pdf' | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [pageSize,      setPageSize]      = useState(10);
  const [processingId,  setProcessingId]  = useState<string | null>(null);

  const [selectedReview, setSelectedReview] = useState<CompanyReview | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean; review: CompanyReview | null; loading: boolean;
  }>({ isOpen: false, review: null, loading: false });

  // ── Filters ────────
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: statusOptions },
  ];
  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs, syncWithUrl: true, debounceMs: 500,
  });

  // ── Fetch ──────────
  const fetchReviews = useCallback(async (
    filterValues: { status?: string },
    page = 0,
    size?: number,
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    const resolvedSize = size ?? pageSizeRef.current;
    try {
      const status = (filterValues.status as ReviewStatus) || undefined;
      const result = await serviceRef.current.getAllReviews(page, resolvedSize, status);
      setReviews(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number ?? 0);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải danh sách đánh giá'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchReviews({ status: filters.status }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  // ── Pagination ─────
  const currentFilters = useCallback(() => ({ status: getFilterValue('status') }), [getFilterValue]);

  const handlePageChange = useCallback((page: number) => {
    fetchReviews(currentFilters(), Math.max(0, page - 1), pageSizeRef.current);
  }, [fetchReviews, currentFilters]);

  const handlePageSizeChange = useCallback((size: number) => {
    pageSizeRef.current = size;
    setPageSize(size);
    fetchReviews(currentFilters(), 0, size);
  }, [fetchReviews, currentFilters]);

  // ── Export ─────────
  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    try {
      await serviceRef.current.downloadExcel(
        (getFilterValue('status') || undefined) as ReviewStatus | undefined,
      );
      toastRef.current.success('Xuất Excel', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file Excel'));
    } finally { setExporting(null); }
  }, [getFilterValue]);

  const handleExportPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      await serviceRef.current.downloadPdf(
        (getFilterValue('status') || undefined) as ReviewStatus | undefined,
      );
      toastRef.current.success('Xuất PDF', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file PDF'));
    } finally { setExporting(null); }
  }, [getFilterValue]);

  // ── Actions ────────
  const handleApprove = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await serviceRef.current.approveReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã được phê duyệt');
      await fetchReviews(currentFilters(), currentPage, pageSizeRef.current);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally { setProcessingId(null); }
  };

  const handleReject = async (reviewId: string, reason: string) => {
    setRejectModal(prev => ({ ...prev, loading: true }));
    try {
      await serviceRef.current.rejectReview(reviewId, reason);
      toastRef.current.success('Thành công', 'Đánh giá đã bị từ chối');
      setRejectModal({ isOpen: false, review: null, loading: false });
      await fetchReviews(currentFilters(), currentPage, pageSizeRef.current);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
      setRejectModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleHide = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await serviceRef.current.hideReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã bị ẩn');
      await fetchReviews(currentFilters(), currentPage, pageSizeRef.current);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally { setProcessingId(null); }
  };

  const handleShow = async (reviewId: string) => {
    setProcessingId(reviewId);
    try {
      await serviceRef.current.showReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã được hiển thị lại');
      await fetchReviews(currentFilters(), currentPage, pageSizeRef.current);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally { setProcessingId(null); }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa vĩnh viễn đánh giá này?')) return;
    setProcessingId(reviewId);
    try {
      await serviceRef.current.deleteReview(reviewId);
      toastRef.current.success('Thành công', 'Đánh giá đã bị xóa vĩnh viễn');
      await fetchReviews(currentFilters(), currentPage, pageSizeRef.current);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error));
    } finally { setProcessingId(null); }
  };

  const handleFilterChange = useCallback((key: string, value: unknown) => setFilter(key, value), [setFilter]);
  const handleResetFilters = useCallback(() => { resetAllFilters(); }, [resetAllFilters]);
  const handleRefresh = useCallback(() => {
    fetchReviews(currentFilters(), currentPage, pageSizeRef.current);
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchReviews, currentFilters, currentPage]);

  // ── Table ──────────
  const getActions = (record: CompanyReview): ActionItem<CompanyReview>[] => {
    const actions: ActionItem<CompanyReview>[] = [
      { key: 'view', label: 'Xem chi tiết', icon: <Eye className="w-4 h-4" />, onClick: (r) => { setSelectedReview(r); setDetailModalOpen(true); }, color: 'default' },
    ];
    if (record.status === 'PENDING') {
      actions.push({ key: 'approve', label: 'Duyệt',    icon: <CheckCircle className="w-4 h-4" />, onClick: (r) => handleApprove(r.id), color: 'success' });
      actions.push({ key: 'reject',  label: 'Từ chối',  icon: <XCircle className="w-4 h-4" />,    onClick: (r) => setRejectModal({ isOpen: true, review: r, loading: false }), color: 'danger' });
    }
    if (record.status === 'APPROVED') {
      actions.push({ key: 'hide', label: 'Ẩn', icon: <EyeOff className="w-4 h-4" />, onClick: (r) => handleHide(r.id), color: 'warning' });
    }
    if (record.status === 'HIDDEN') {
      actions.push({ key: 'show', label: 'Hiển thị lại', icon: <Eye className="w-4 h-4" />, onClick: (r) => handleShow(r.id), color: 'success' });
    }
    actions.push({ key: 'delete', label: 'Xóa', icon: <Trash2 className="w-4 h-4" />, onClick: (r) => handleDelete(r.id), color: 'danger' });
    return actions;
  };

  const columns: Column<CompanyReview>[] = [
    {
      key: 'reviewerName', title: 'Người đánh giá', width: '180px',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(value || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground text-sm">{value || 'Ẩn danh'}</div>
            {record.employed && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Nhân viên</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'content', title: 'Nội dung', width: '250px',
      render: (value, record) => (
        <div className="max-w-[250px]">
          {record.title && <div className="font-medium text-foreground text-sm truncate">{record.title}</div>}
          <div className="text-xs text-muted-foreground line-clamp-2">{value}</div>
        </div>
      ),
    },
    {
      key: 'rating', title: 'Sao', width: '80px', align: 'center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-semibold">{value}</span>
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
        </div>
      ),
    },
    {
      key: 'status', title: 'Trạng thái', width: '120px',
      render: (value: string) => {
        const cfg = statusConfig[value] || statusConfig.PENDING;
        return <StatusBadge status={value.toLowerCase()} label={cfg.label} size="sm" />;
      },
    },
    { key: 'createdAt', title: 'Ngày tạo', width: '120px', sortable: true, render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    {
      key: 'actions', title: '', width: '140px', align: 'center',
      render: (_, record) => <TableActions record={record} actions={getActions(record)} showLabel={false} />,
    },
  ];

  const getDetailFields = (): DetailField[] => {
    if (!selectedReview) return [];
    const cfg = statusConfig[selectedReview.status] || statusConfig.PENDING;
    return [
      { key: 'reviewer',  label: 'Người đánh giá', value: selectedReview.anonymous ? 'Ẩn danh' : (selectedReview.reviewerName || 'N/A'), copyable: true },
      { key: 'rating',    label: 'Đánh giá', type: 'badge',
        value: <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />)}<span className="ml-1 text-sm font-semibold">{selectedReview.rating}/5</span></div> },
      { key: 'title',     label: 'Tiêu đề',          value: selectedReview.title || 'Không có tiêu đề' },
      { key: 'content',   label: 'Nội dung',          value: selectedReview.content, type: 'text' },
      { key: 'pros',      label: 'Điểm tốt',          value: selectedReview.pros   || '—', type: 'text' },
      { key: 'cons',      label: 'Điểm chưa tốt',     value: selectedReview.cons   || '—', type: 'text' },
      { key: 'status',    label: 'Trạng thái', type: 'badge',
        value: <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.icon}{cfg.label}</span> },
      { key: 'createdAt', label: 'Ngày tạo', type: 'date', value: new Date(selectedReview.createdAt).toLocaleString('vi-VN') },
      ...(selectedReview.rejectionReason ? [{ key: 'rejectionReason', label: 'Lý do từ chối', value: selectedReview.rejectionReason, type: 'text' as const }] : []),
    ];
  };

  const rejectFormFields: FormField[] = [
    { name: 'reason', label: 'Lý do từ chối', type: 'textarea', required: true, rows: 3, placeholder: 'Nhập lý do từ chối...' },
  ];

  const page1Based = currentPage + 1;
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex   = Math.min((currentPage + 1) * pageSize, totalElements);

  // ── Render ─────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đánh giá</h1>
          <p className="text-[16px] text-muted-foreground mt-1">Quản lý và kiểm duyệt đánh giá trên toàn hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng: <span className="font-semibold text-foreground">{totalElements}</span> đánh giá
          </div>
          <button onClick={handleExportExcel} disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <FileSpreadsheet className="w-4 h-4" />{exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button onClick={handleExportPdf} disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <FileText className="w-4 h-4" />{exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>
      </div>

      {/* Filter */}
      <AdminFilter
        config={{ searchKey: undefined, statusKey: 'status', customFilters: [] }}
        filters={{ status: getFilterValue('status') }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder=""
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table + Pagination */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={reviews}
          columns={columns}
          loading={loading}
          selectable
          showPagination={false}
          emptyMessage="Không có đánh giá nào"
          emptyDescription="Chưa có đánh giá nào trong hệ thống"
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

      <DetailModel isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết - ${selectedReview?.reviewerName || 'Ẩn danh'}`}
        fields={getDetailFields()} />

      <FormModel
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, review: null, loading: false })}
        onSubmit={(data) => { if (rejectModal.review) handleReject(rejectModal.review.id, data.reason); }}
        title={`Từ chối - ${rejectModal.review?.reviewerName || 'Ẩn danh'}`}
        fields={rejectFormFields}
        initialData={{ reason: '' }}
        submitText="Từ chối"
        loading={rejectModal.loading}
      />
    </div>
  );
}