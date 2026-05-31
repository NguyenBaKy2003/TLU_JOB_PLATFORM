'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable, Column, ActionItem, AdminFilter, useFilter,
  TableActions, FormModel, FormField, DetailModel, DetailField, TablePagination,
} from '@/presentation/components/common';
import { AdminJobRepository } from '@/infrastructure/repositories/AdminJobRepository';
import type { AdminJob, AdminJobFilters, JobStatus } from '@/domain/models/AdminJob';
import { AdminJobService } from '@/application/services/AdminJobService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import {
  Building2, MapPin, Calendar, Clock, AlertCircle,
  Eye, Trash2, XCircle, CheckCircle, FileSpreadsheet, FileText,
} from 'lucide-react';

// ─── Static config ────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'DRAFT',     label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Đã đăng' },
  { value: 'CLOSED',    label: 'Đã đóng' },
  { value: 'EXPIRED',   label: 'Hết hạn' },
  { value: 'DELETED',   label: 'Đã xóa' },
];

const statusConfig: Record<JobStatus, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT:     { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',         icon: <Clock className="w-3 h-3" /> },
  PUBLISHED: { label: 'Đã đăng',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',  icon: <CheckCircle className="w-3 h-3" /> },
  CLOSED:    { label: 'Đã đóng',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',          icon: <XCircle className="w-3 h-3" /> },
  EXPIRED:   { label: 'Hết hạn',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertCircle className="w-3 h-3" /> },
  DELETED:   { label: 'Đã xóa',   color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',         icon: <Trash2 className="w-3 h-3" /> },
};

const formatCurrency = (amount: number | null, currency: string | null): string => {
  if (!amount) return 'Thỏa thuận';
  return `${currency === 'USD' ? '$' : '₫'}${amount.toLocaleString()}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminJobsPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const serviceRef  = useRef(new AdminJobService(new AdminJobRepository()));
  const isFetching  = useRef(false);
  const pageSizeRef = useRef(10);

  // ── State ──────────────────────────────────────────────────────────────────
  const [jobs,          setJobs]          = useState<AdminJob[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [exporting,     setExporting]     = useState<'excel' | 'pdf' | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [pageSize,      setPageSize]      = useState(10);
  const [selectedJob,   setSelectedJob]   = useState<AdminJob | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [closeFormModal, setCloseFormModal] = useState<{
    isOpen: boolean; job: AdminJob | null; loading: boolean;
  }>({ isOpen: false, job: null, loading: false });

  const [deleteFormModal, setDeleteFormModal] = useState<{
    isOpen: boolean; job: AdminJob | null; loading: boolean;
  }>({ isOpen: false, job: null, loading: false });

  // ── Filters ────────────────────────────────────────────────────────────────
  const filterConfigs = [
    { key: 'keyword',  type: 'input'  as const, label: 'Tìm kiếm',   placeholder: 'Tiêu đề, mô tả...' },
    { key: 'status',   type: 'select' as const, label: 'Trạng thái', options: statusOptions },
    { key: 'city',     type: 'input'  as const, label: 'Thành phố',  placeholder: 'Hà Nội, HCM...' },
    { key: 'category', type: 'input'  as const, label: 'Danh mục',   placeholder: 'IT, Marketing...' },
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs, syncWithUrl: true, debounceMs: 500,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (
    filterValues: { keyword?: string; status?: string; city?: string; category?: string },
    page = 0,
    size?: number,
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    const resolvedSize = size ?? pageSizeRef.current;
    try {
      const result = await serviceRef.current.searchJobs({
        page:     Math.max(0, page),
        size:     resolvedSize,
        keyword:  filterValues.keyword  || '',
        status:   (filterValues.status  || '') as JobStatus | '',
        city:     filterValues.city     || '',
        category: filterValues.category || '',
      });
      setJobs(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number ?? 0);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu',
        extractErrorMessage(error, 'Không thể tải danh sách tin tuyển dụng'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchJobs({
      keyword:  filters.keyword,
      status:   filters.status,
      city:     filters.city,
      category: filters.category,
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.status, filters.city, filters.category]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const currentFilters = useCallback(() => ({
    keyword:  getFilterValue('keyword'),
    status:   getFilterValue('status'),
    city:     getFilterValue('city'),
    category: getFilterValue('category'),
  }), [getFilterValue]);

  const handlePageChange = useCallback((page: number) => {
    fetchJobs(currentFilters(), Math.max(0, page - 1), pageSizeRef.current);
  }, [fetchJobs, currentFilters]);

  const handlePageSizeChange = useCallback((size: number) => {
    pageSizeRef.current = size;
    setPageSize(size);
    fetchJobs(currentFilters(), 0, size);
  }, [fetchJobs, currentFilters]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportFilters = useCallback((): Omit<AdminJobFilters, 'page' | 'size'> => ({
    status:   (getFilterValue('status')   || '') as JobStatus | '',
    keyword:  getFilterValue('keyword')   || '',
    city:     getFilterValue('city')      || '',
    category: getFilterValue('category')  || '',
  }), [getFilterValue]);

  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    try {
      await serviceRef.current.downloadExcel(exportFilters());
      toastRef.current.success('Xuất Excel', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất Excel', extractErrorMessage(error, 'Không thể xuất file Excel'));
    } finally { setExporting(null); }
  }, [exportFilters]);

  const handleExportPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      await serviceRef.current.downloadPdf(exportFilters());
      toastRef.current.success('Xuất PDF', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất PDF', extractErrorMessage(error, 'Không thể xuất file PDF'));
    } finally { setExporting(null); }
  }, [exportFilters]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleForceClose = async (id: string, reason: string) => {
    setCloseFormModal(prev => ({ ...prev, loading: true }));
    try {
      const job = jobs.find(j => j.id === id);
      await serviceRef.current.forceClose(id, reason);
      await fetchJobs(currentFilters(), currentPage, pageSizeRef.current);
      setCloseFormModal({ isOpen: false, job: null, loading: false });
      toastRef.current.success('Thành công', `Đã đóng tin tuyển dụng "${job?.title}"`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể đóng tin tuyển dụng'));
      setCloseFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleForceDelete = async (id: string, reason: string) => {
    setDeleteFormModal(prev => ({ ...prev, loading: true }));
    try {
      const job = jobs.find(j => j.id === id);
      await serviceRef.current.forceDelete(id, reason);
      await fetchJobs(currentFilters(), currentPage, pageSizeRef.current);
      setDeleteFormModal({ isOpen: false, job: null, loading: false });
      toastRef.current.success('Thành công', `Đã xóa tin tuyển dụng "${job?.title}"`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể xóa tin tuyển dụng'));
      setDeleteFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleFilterChange = useCallback((key: string, value: unknown) => setFilter(key, value), [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchJobs(currentFilters(), currentPage, pageSizeRef.current);
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchJobs, currentFilters, currentPage]);

  // ── Table ──────────────────────────────────────────────────────────────────
  const getActions = (record: AdminJob): ActionItem<AdminJob>[] => {
    const actions: ActionItem<AdminJob>[] = [{
      key: 'view', label: 'Xem chi tiết', icon: <Eye className="w-4 h-4" />,
      onClick: () => { setSelectedJob(record); setDetailModalOpen(true); },
      color: 'default',
    }];
    if (record.status !== 'CLOSED' && record.status !== 'DELETED') {
      actions.push({
        key: 'close', label: 'Đóng tin', icon: <XCircle className="w-4 h-4" />,
        onClick: () => setCloseFormModal({ isOpen: true, job: record, loading: false }),
        color: 'warning',
      });
    }
    if (record.status !== 'DELETED') {
      actions.push({
        key: 'delete', label: 'Xóa tin', icon: <Trash2 className="w-4 h-4" />,
        onClick: () => setDeleteFormModal({ isOpen: true, job: record, loading: false }),
        color: 'danger',
      });
    }
    return actions;
  };

  const columns: Column<AdminJob>[] = [
    {
      key: 'title', title: 'Tiêu đề', sortable: true, width: '300px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3" />{record.companyName}
          </div>
        </div>
      ),
    },
    { key: 'level', title: 'Cấp bậc', width: '120px', render: (v) => v || '—' },
    {
      key: 'location', title: 'Địa điểm', width: '150px',
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span>{value || '—'}</span>
        </div>
      ),
    },
    {
      key: 'salary', title: 'Mức lương', width: '160px',
      render: (_, record) =>
        `${formatCurrency(record.salaryMin, record.currency)} - ${formatCurrency(record.salaryMax, record.currency)}`,
    },
    {
      key: 'deadline', title: 'Hạn nộp', width: '120px',
      render: (value) => {
        if (!value) return '—';
        const d = new Date(value);
        return (
          <div className={`flex items-center gap-1 ${d < new Date() ? 'text-red-500' : ''}`}>
            <Calendar className="w-3 h-3" />
            <span>{d.toLocaleDateString('vi-VN')}</span>
          </div>
        );
      },
    },
    {
      key: 'status', title: 'Trạng thái', width: '130px',
      render: (value: JobStatus) => {
        const cfg = statusConfig[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
        );
      },
    },
    { key: 'createdAt', title: 'Ngày tạo', width: '120px', sortable: true, render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    {
      key: 'actions', title: 'Thao tác', width: '150px', align: 'center',
      render: (_, record) => <TableActions record={record} actions={getActions(record)} showLabel={false} />,
    },
  ];

  const getDetailFields = (): DetailField[] => {
    if (!selectedJob) return [];
    return [
      { key: 'title',     label: 'Tiêu đề',           value: selectedJob.title,       copyable: true },
      { key: 'company',   label: 'Công ty',            value: selectedJob.companyName, copyable: true },
      { key: 'status',    label: 'Trạng thái',         type: 'badge',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedJob.status].color}`}>
            {statusConfig[selectedJob.status].icon}{statusConfig[selectedJob.status].label}
          </span>
        ),
      },
      { key: 'level',     label: 'Cấp bậc',            value: selectedJob.level    || 'Chưa có' },
      { key: 'location',  label: 'Địa điểm',            value: selectedJob.location || 'Chưa có' },
      { key: 'salary',    label: 'Mức lương',
        value: `${formatCurrency(selectedJob.salaryMin, selectedJob.currency)} - ${formatCurrency(selectedJob.salaryMax, selectedJob.currency)}`,
      },
      { key: 'deadline',  label: 'Hạn nộp',   type: 'date',
        value: selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN') : 'Chưa có',
      },
      { key: 'createdAt', label: 'Ngày tạo',   type: 'date', value: new Date(selectedJob.createdAt).toLocaleString('vi-VN') },
      { key: 'updatedAt', label: 'Cập nhật lần cuối', type: 'date',
        value: selectedJob.updatedAt ? new Date(selectedJob.updatedAt).toLocaleString('vi-VN') : '—',
      },
    ];
  };

  const closeFormFields: FormField[]  = [{ name: 'reason', label: 'Lý do đóng tin', type: 'textarea', required: true, rows: 4, placeholder: 'Nhập lý do đóng tin tuyển dụng...' }];
  const deleteFormFields: FormField[] = [{ name: 'reason', label: 'Lý do xóa tin',  type: 'textarea', required: true, rows: 4, placeholder: 'Nhập lý do xóa tin tuyển dụng...' }];

  const page1Based = currentPage + 1;
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex   = Math.min((currentPage + 1) * pageSize, totalElements);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý tin tuyển dụng</h1>
          <p className="text-[16px] text-muted-foreground mt-1">Quản lý và kiểm soát các tin tuyển dụng trên hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> tin
          </div>
          <button onClick={handleExportExcel} disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <FileSpreadsheet className="w-4 h-4" />
            {exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button onClick={handleExportPdf} disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <FileText className="w-4 h-4" />
            {exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <AdminFilter
        config={{
          searchKey: 'keyword',
          statusKey: 'status',
          customFilters: [
            { key: 'city',     label: 'Thành phố', options: [] },
            { key: 'category', label: 'Danh mục',  options: [] },
          ],
        }}
        filters={{
          keyword:  getFilterValue('keyword'),
          status:   getFilterValue('status'),
          city:     getFilterValue('city'),
          category: getFilterValue('category'),
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm kiếm tiêu đề, mô tả..."
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table + Pagination */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={jobs}
          columns={columns}
          loading={loading}
          selectable
          showPagination={false}
          emptyMessage="Không có tin tuyển dụng"
          emptyDescription="Chưa có tin tuyển dụng nào trong hệ thống"
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

      <DetailModel
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Chi tiết tin tuyển dụng - ${selectedJob?.title || ''}`}
        fields={getDetailFields()}
      />

      <FormModel
        isOpen={closeFormModal.isOpen}
        onClose={() => setCloseFormModal({ isOpen: false, job: null, loading: false })}
        onSubmit={(data) => { if (closeFormModal.job) handleForceClose(closeFormModal.job.id, data.reason); }}
        title={`Đóng tin tuyển dụng - ${closeFormModal.job?.title ?? ''}`}
        fields={closeFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận đóng"
        loading={closeFormModal.loading}
      />

      <FormModel
        isOpen={deleteFormModal.isOpen}
        onClose={() => setDeleteFormModal({ isOpen: false, job: null, loading: false })}
        onSubmit={(data) => { if (deleteFormModal.job) handleForceDelete(deleteFormModal.job.id, data.reason); }}
        title={`Xóa tin tuyển dụng - ${deleteFormModal.job?.title ?? ''}`}
        fields={deleteFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận xóa"
        loading={deleteFormModal.loading}
      />
    </div>
  );
}