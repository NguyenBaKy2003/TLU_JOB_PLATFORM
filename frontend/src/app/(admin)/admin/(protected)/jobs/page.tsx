'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable, Column, ActionItem, AdminFilter, useFilter,
  TableActions, FormModel, FormField, DetailModel, DetailField, TablePagination,
} from '@/presentation/components/common';
import { AdminJobRepository } from '@/infrastructure/repositories/AdminJobRepository';
import type { AdminJob, AdminJobDetail, AdminJobFilters, JobStatus } from '@/domain/models/AdminJob';
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
  DRAFT:     { label: 'Bản nháp', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',            icon: <Clock className="w-3 h-3" /> },
  PUBLISHED: { label: 'Đã đăng',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',     icon: <CheckCircle className="w-3 h-3" /> },
  CLOSED:    { label: 'Đã đóng',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',             icon: <XCircle className="w-3 h-3" /> },
  EXPIRED:   { label: 'Hết hạn',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertCircle className="w-3 h-3" /> },
  DELETED:   { label: 'Đã xóa',   color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',            icon: <Trash2 className="w-3 h-3" /> },
};

const competitionLevelConfig: Record<string, { label: string; color: string }> = {
  LOW:     { label: 'Thấp',    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  MEDIUM:  { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  HIGH:    { label: 'Cao',     color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  EXTREME: { label: 'Rất cao', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
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
  const [jobs,            setJobs]            = useState<AdminJob[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [exporting,       setExporting]       = useState<'excel' | 'pdf' | null>(null);
  const [totalElements,   setTotalElements]   = useState(0);
  const [totalPages,      setTotalPages]      = useState(0);
  const [currentPage,     setCurrentPage]     = useState(0);
  const [pageSize,        setPageSize]        = useState(10);
  const [selectedDetail,  setSelectedDetail]  = useState<AdminJobDetail | null>(null);
  const [detailLoading,   setDetailLoading]   = useState(false);
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
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs, syncWithUrl: true, debounceMs: 500,
  });

  // ── Fetch list ─────────────────────────────────────────────────────────────
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

  // ── Fetch detail ───────────────────────────────────────────────────────────
  const handleViewDetail = useCallback(async (record: AdminJob) => {
    setDetailModalOpen(true);
    setSelectedDetail(null);   // clear → skeleton hiện ngay
    setDetailLoading(true);
    try {
      const detail = await serviceRef.current.getJobDetail(record.id);
      setSelectedDetail(detail);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể tải chi tiết tin tuyển dụng'));
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedDetail(null);
  }, []);

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
    status:   (getFilterValue('status')  || '') as JobStatus | '',
    keyword:  getFilterValue('keyword')  || '',
    city:     getFilterValue('city')     || '',
    category: getFilterValue('category') || '',
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

  // ── Table columns ──────────────────────────────────────────────────────────
  const getActions = (record: AdminJob): ActionItem<AdminJob>[] => {
    const actions: ActionItem<AdminJob>[] = [{
      key: 'view', label: 'Xem chi tiết', icon: <Eye className="w-4 h-4" />,
      onClick: () => handleViewDetail(record),
      color: 'default',
    }];
    // Chỉ cho close khi PUBLISHED (backend yêu cầu)
    if (record.status === 'PUBLISHED') {
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
      key: 'title', title: 'Tiêu đề', sortable: true, width: '280px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3" />{record.companyName ?? '—'}
          </div>
        </div>
      ),
    },
    { key: 'level',    title: 'Cấp bậc',  width: '100px', render: (v) => v || '—' },
    { key: 'category', title: 'Danh mục', width: '130px', render: (v) => v || '—' },
    {
      key: 'workLocationCity', title: 'Địa điểm', width: '130px',
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span>{value || '—'}</span>
        </div>
      ),
    },
    {
      key: 'salaryDisplay', title: 'Mức lương', width: '180px',
      render: (value) => value ?? 'Thỏa thuận',
    },
    {
      key: 'deadline', title: 'Hạn nộp', width: '110px',
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
    {
      key: 'createdAt', title: 'Ngày tạo', width: '110px', sortable: true,
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions', title: 'Thao tác', width: '120px', align: 'center',
      render: (_, record) => <TableActions record={record} actions={getActions(record)} showLabel={false} />,
    },
  ];

  // ── Detail fields ──────────────────────────────────────────────────────────
  const getDetailFields = (): DetailField[] => {
    if (!selectedDetail) return [];
    const d = selectedDetail;
    const compLvl = d.competition ? competitionLevelConfig[d.competition.level] : null;

    return [
      // ── Thông tin cơ bản
      { key: 'title',      label: 'Tiêu đề',    value: d.title,       copyable: true },
      { key: 'company',    label: 'Công ty',     value: d.companyName ?? '—', copyable: true },
      {
        key: 'status', label: 'Trạng thái', type: 'badge',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[d.status].color}`}>
            {statusConfig[d.status].icon}{statusConfig[d.status].label}
          </span>
        ),
      },
      { key: 'jobType',    label: 'Loại hình',   value: d.jobType ?? '—' },
      { key: 'level',      label: 'Cấp bậc',     value: d.level    ?? '—' },
      { key: 'category',   label: 'Danh mục',    value: d.category ?? '—' },
      { key: 'experience', label: 'Kinh nghiệm', value: d.experienceYears != null ? `${d.experienceYears} năm` : '—' },
      { key: 'vacancies',  label: 'Số lượng tuyển', value: d.vacancies != null ? `${d.vacancies} người` : '—' },

      // ── Địa điểm & lương
      { key: 'city',    label: 'Thành phố',   value: d.workLocationCity    ?? '—' },
      { key: 'address', label: 'Địa chỉ',     value: d.workLocationAddress ?? '—' },
      { key: 'salary',  label: 'Mức lương',   value: d.salaryDisplay ?? 'Thỏa thuận' },
      {
        key: 'negotiable', label: 'Thương lượng lương',
        value: d.salaryNegotiable ? 'Có thể thương lượng' : 'Cố định',
      },

      // ── Thời hạn
      {
        key: 'deadline', label: 'Hạn nộp', type: 'date',
        value: d.deadline ? new Date(d.deadline).toLocaleDateString('vi-VN') : '—',
      },
      {
        key: 'publishedAt', label: 'Ngày đăng', type: 'date',
        value: d.publishedAt ? new Date(d.publishedAt).toLocaleString('vi-VN') : '—',
      },
      {
        key: 'createdAt', label: 'Ngày tạo', type: 'date',
        value: new Date(d.createdAt).toLocaleString('vi-VN'),
      },

      // ── Thống kê
      { key: 'viewCount',        label: 'Lượt xem',         value: `${d.viewCount} lượt` },
      { key: 'applicationCount', label: 'Số ứng viên',      value: `${d.applicationCount} người` },

      // ── Skills
      ...(d.skills?.length > 0 ? [{
        key: 'skills', label: 'Kỹ năng yêu cầu',
        value: (
          <div className="flex flex-wrap gap-1.5">
            {d.skills.map((s, i) => (
              <span key={i}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border
                  ${s.required
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                  }`}
              >
                {s.skillName}
                <span className="opacity-60">· {s.level}</span>
              </span>
            ))}
          </div>
        ),
      }] : []),

      // ── Mô tả
      ...(d.description ? [{
        key: 'description', label: 'Mô tả công việc', type: 'html' as const,
        value: d.description,
      }] : []),

      ...(d.requirements ? [{
        key: 'requirements', label: 'Yêu cầu', type: 'html' as const,
        value: d.requirements,
      }] : []),

      ...(d.benefits ? [{
        key: 'benefits', label: 'Phúc lợi', type: 'html' as const,
        value: d.benefits,
      }] : []),

      // ── Cạnh tranh
      ...(d.competition && compLvl ? [
        {
          key: 'compLevel', label: 'Mức cạnh tranh',
          value: (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${compLvl.color}`}>
              {compLvl.label} · {d.competition.competitionScore}/100
            </span>
          ),
        },
        { key: 'compApplicants', label: 'Tổng ứng viên', value: `${d.competition.totalApplicants} người` },
        { key: 'compAdvice',     label: 'Nhận xét',       value: d.competition.candidateAdvice },
        { key: 'compInsight',    label: 'Gợi ý nhà tuyển', value: d.competition.employerInsight },
      ] : []),

      // ── Công ty
      ...(d.companyWebsite ? [{
        key: 'website', label: 'Website công ty',
        value: (
          <a href={d.companyWebsite} target="_blank" rel="noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400 break-all">
            {d.companyWebsite}
          </a>
        ),
      }] : []),
      ...(d.companyIndustry ? [{ key: 'industry', label: 'Ngành nghề',  value: d.companyIndustry }] : []),
      ...(d.companySize     ? [{ key: 'compSize', label: 'Quy mô công ty', value: d.companySize }] : []),
    ];
  };

  // ── Derived pagination values ───────────────────────────────────────────────
  const page1Based = currentPage + 1;
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex   = Math.min((currentPage + 1) * pageSize, totalElements);

  const closeFormFields:  FormField[] = [{ name: 'reason', label: 'Lý do đóng tin', type: 'textarea', required: true, rows: 4, placeholder: 'Nhập lý do đóng tin tuyển dụng...' }];
  const deleteFormFields: FormField[] = [{ name: 'reason', label: 'Lý do xóa tin',  type: 'textarea', required: true, rows: 4, placeholder: 'Nhập lý do xóa tin tuyển dụng...' }];

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

      {/* Detail Modal */}
      <DetailModel
        isOpen={detailModalOpen}
        onClose={handleCloseDetail}
        title={selectedDetail ? `Chi tiết tin tuyển dụng — ${selectedDetail.title}` : 'Chi tiết tin tuyển dụng'}
        fields={getDetailFields()}
        loading={detailLoading}
      />

      {/* Close Form */}
      <FormModel
        isOpen={closeFormModal.isOpen}
        onClose={() => setCloseFormModal({ isOpen: false, job: null, loading: false })}
        onSubmit={(data) => { if (closeFormModal.job) handleForceClose(closeFormModal.job.id, data.reason); }}
        title={`Đóng tin tuyển dụng — ${closeFormModal.job?.title ?? ''}`}
        fields={closeFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận đóng"
        loading={closeFormModal.loading}
      />

      {/* Delete Form */}
      <FormModel
        isOpen={deleteFormModal.isOpen}
        onClose={() => setDeleteFormModal({ isOpen: false, job: null, loading: false })}
        onSubmit={(data) => { if (deleteFormModal.job) handleForceDelete(deleteFormModal.job.id, data.reason); }}
        title={`Xóa tin tuyển dụng — ${deleteFormModal.job?.title ?? ''}`}
        fields={deleteFormFields}
        initialData={{ reason: '' }}
        submitText="Xác nhận xóa"
        loading={deleteFormModal.loading}
      />
    </div>
  );
}