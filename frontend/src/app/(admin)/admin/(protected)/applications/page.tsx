'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable, Column, AdminFilter, useFilter,
  TableActions, FormModel, FormField, DetailModel, DetailField, TablePagination,
} from '@/presentation/components/common';
import { AdminApplicationRepository } from '@/infrastructure/repositories/AdminApplicationRepository';
import type {
  AdminApplication, AdminApplicationDetail,
  AdminApplicationFilters, ApplicationStatus, ApplicationStatusLog,
} from '@/domain/models/AdminApplication';
import { getCandidateName, getCandidateEmail } from '@/domain/models/AdminApplication';
import { AdminApplicationService } from '@/application/services/AdminApplicationService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import {
  Eye, FileText, Calendar, Star, AlertCircle,
  CheckCircle, XCircle, Clock, Edit, FileSpreadsheet, Building2, MapPin,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'SUBMITTED',           label: 'Đã nộp' },
  { value: 'REVIEWING',           label: 'Đang xem xét' },
  { value: 'SHORTLISTED',         label: 'Vào danh sách' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Đã hẹn phỏng vấn' },
  { value: 'HIRED',               label: 'Đã tuyển' },
  { value: 'REJECTED',            label: 'Từ chối' },
  { value: 'WITHDRAWN',           label: 'Rút đơn' },
  { value: 'CANCELLED',           label: 'Đã hủy' },
  { value: 'PENDING',             label: 'Chờ xử lý' },
];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  SUBMITTED:           { label: 'Đã nộp',           color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',         icon: <FileText className="w-3 h-3" /> },
  REVIEWING:           { label: 'Đang xem xét',     color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3 h-3" /> },
  SHORTLISTED:         { label: 'Vào danh sách',     color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <Star className="w-3 h-3" /> },
  INTERVIEW_SCHEDULED: { label: 'Đã hẹn phỏng vấn', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <Calendar className="w-3 h-3" /> },
  HIRED:               { label: 'Đã tuyển',          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',    icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED:            { label: 'Từ chối',           color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',            icon: <XCircle className="w-3 h-3" /> },
  WITHDRAWN:           { label: 'Rút đơn',           color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',           icon: <AlertCircle className="w-3 h-3" /> },
  CANCELLED:           { label: 'Đã hủy',            color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: <XCircle className="w-3 h-3" /> },
  PENDING:             { label: 'Chờ xử lý',         color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',        icon: <Clock className="w-3 h-3" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminApplicationsPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const serviceRef  = useRef(new AdminApplicationService(new AdminApplicationRepository()));
  const isFetching  = useRef(false);
  const pageSizeRef = useRef(10);

  // ── State ──────────────────────────────────────────────────────────────────
  const [applications,  setApplications]  = useState<AdminApplication[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [exporting,     setExporting]     = useState<'excel' | 'pdf' | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [pageSize,      setPageSize]      = useState(10);

  const [selectedDetail,  setSelectedDetail]  = useState<AdminApplicationDetail | null>(null);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [statusFormModal, setStatusFormModal] = useState<{
    isOpen: boolean; application: AdminApplication | null; loading: boolean;
  }>({ isOpen: false, application: null, loading: false });

  // ── Filters ────────────────────────────────────────────────────────────────
  const filterConfigs = [
    { key: 'keyword', type: 'input'  as const, label: 'Tìm kiếm',   placeholder: 'Tên ứng viên, email, vị trí...' },
    { key: 'status',  type: 'select' as const, label: 'Trạng thái', options: statusOptions },
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs, syncWithUrl: true, debounceMs: 500,
  });

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchApplications = useCallback(async (
    filterValues: { keyword?: string; status?: string },
    page = 0,
    size?: number,
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    const resolvedSize = size ?? pageSizeRef.current;
    try {
      const result = await serviceRef.current.listAll({
        page:    Math.max(0, page),
        size:    resolvedSize,
        status:  (filterValues.status  || '') as ApplicationStatus | '',
        keyword: filterValues.keyword || '',
      });
      setApplications(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number ?? 0);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu',
        extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchApplications({ keyword: filters.keyword, status: filters.status }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.status]);

  // ── Fetch detail ───────────────────────────────────────────────────────────
  const handleViewDetail = useCallback(async (record: AdminApplication) => {
    setDetailModalOpen(true);
    setSelectedDetail(null);   // clear → skeleton ngay
    setDetailLoading(true);
    try {
      const detail = await serviceRef.current.getById(record.id);
      setSelectedDetail(detail);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể tải chi tiết đơn ứng tuyển'));
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
    keyword: getFilterValue('keyword'),
    status:  getFilterValue('status'),
  }), [getFilterValue]);

  const handlePageChange = useCallback((page: number) => {
    fetchApplications(currentFilters(), Math.max(0, page - 1), pageSizeRef.current);
  }, [fetchApplications, currentFilters]);

  const handlePageSizeChange = useCallback((size: number) => {
    pageSizeRef.current = size;
    setPageSize(size);
    fetchApplications(currentFilters(), 0, size);
  }, [fetchApplications, currentFilters]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    try {
      await serviceRef.current.downloadExcel(
        (getFilterValue('status') || '') as ApplicationStatus | '',
        getFilterValue('keyword') || '',
      );
      toastRef.current.success('Xuất Excel', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất Excel', extractErrorMessage(error, 'Không thể xuất file Excel'));
    } finally { setExporting(null); }
  }, [getFilterValue]);

  const handleExportPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      await serviceRef.current.downloadPdf(
        (getFilterValue('status') || '') as ApplicationStatus | '',
        getFilterValue('keyword') || '',
      );
      toastRef.current.success('Xuất PDF', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất PDF', extractErrorMessage(error, 'Không thể xuất file PDF'));
    } finally { setExporting(null); }
  }, [getFilterValue]);

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: ApplicationStatus, reason: string) => {
    setStatusFormModal(prev => ({ ...prev, loading: true }));
    try {
      const app = applications.find(a => a.id === id);
      await serviceRef.current.overrideStatus(id, status, reason);
      await fetchApplications(currentFilters(), currentPage, pageSizeRef.current);
      setStatusFormModal({ isOpen: false, application: null, loading: false });
      toastRef.current.success(
        'Thành công',
        `Đã cập nhật trạng thái của "${getCandidateName(app!)}" thành ${statusConfig[status].label}`,
      );
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể thay đổi trạng thái'));
      setStatusFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleFilterChange = useCallback((key: string, value: unknown) => setFilter(key, value), [setFilter]);
  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);
  const handleRefresh = useCallback(() => {
    fetchApplications(currentFilters(), currentPage, pageSizeRef.current);
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchApplications, currentFilters, currentPage]);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<AdminApplication>[] = [
    {
      key: 'candidate', title: 'Ứng viên', sortable: false, width: '200px',
      render: (_, record) => (
        <div>
          <div className="font-medium text-foreground">{getCandidateName(record)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{getCandidateEmail(record)}</div>
        </div>
      ),
    },
    {
      key: 'job', title: 'Vị trí', width: '220px',
      render: (value: AdminApplication['job']) => (
        <div>
          <div className="font-medium text-foreground">{value?.title ?? '—'}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            {value?.workLocationCity && <><MapPin className="w-3 h-3" />{value.workLocationCity}</>}
            {value?.level && <span className="ml-1">· {value.level}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'company', title: 'Công ty', width: '180px',
      render: (value: AdminApplication['company']) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="truncate">{value?.name ?? '—'}</span>
        </div>
      ),
    },
    {
      key: 'status', title: 'Trạng thái', width: '155px',
      render: (value: ApplicationStatus) => {
        const cfg = statusConfig[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
        );
      },
    },
    {
      key: 'appliedAt', title: 'Ngày nộp', width: '110px', sortable: true,
      render: (v) => new Date(v).toLocaleDateString('vi-VN'),
    },
    {
      key: 'aiScore', title: 'Điểm AI', width: '100px',
      render: (_, record) => record.hasAIScore && record.aiScore != null ? (
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="font-medium">{record.aiScore}</span>
          {record.aiScoreLabel && (
            <span className="text-xs text-muted-foreground">· {record.aiScoreLabel}</span>
          )}
        </div>
      ) : <span className="text-muted-foreground text-xs">Chưa có</span>,
    },
    {
      key: 'actions', title: 'Thao tác', width: '110px', align: 'center',
      render: (_, record) => (
        <TableActions record={record} actions={[
          {
            key: 'view', label: 'Xem chi tiết', icon: <Eye className="w-4 h-4" />,
            onClick: (r) => handleViewDetail(r), color: 'default',
          },
          {
            key: 'status', label: 'Đổi trạng thái', icon: <Edit className="w-4 h-4" />,
            onClick: (r) => setStatusFormModal({ isOpen: true, application: r, loading: false }),
            color: 'default',
          },
        ]} showLabel={false} />
      ),
    },
  ];

  // ── Detail fields ──────────────────────────────────────────────────────────
  const getDetailFields = (): DetailField[] => {
    if (!selectedDetail) return [];
    const d = selectedDetail;

    return [
      // ── Ứng viên
      {
        key: 'candidate', label: 'Ứng viên',
        value: (
          <div>
            <div className="font-medium">{d.candidate?.fullName ?? '—'}</div>
            <div className="text-sm text-muted-foreground">{d.candidate?.email ?? '—'}</div>
            {d.candidate?.phone && (
              <div className="text-sm text-muted-foreground">{d.candidate.phone}</div>
            )}
          </div>
        ),
      },

      // ── Vị trí
      {
        key: 'job', label: 'Vị trí ứng tuyển',
        value: (
          <div>
            <div className="font-medium">{d.job?.title ?? '—'}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              {d.job?.level     && <span>{d.job.level}</span>}
              {d.job?.jobType   && <span>· {d.job.jobType}</span>}
              {d.job?.workLocationCity && <span>· {d.job.workLocationCity}</span>}
            </div>
          </div>
        ),
      },

      // ── Công ty
      {
        key: 'company', label: 'Công ty',
        value: (
          <div>
            <div className="font-medium">{d.company?.name ?? '—'}</div>
            {d.company?.industry && (
              <div className="text-sm text-muted-foreground">{d.company.industry}</div>
            )}
            {d.company?.city && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />{d.company.city}
              </div>
            )}
          </div>
        ),
      },

      // ── Trạng thái
      {
        key: 'status', label: 'Trạng thái', type: 'badge',
        value: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[d.status].color}`}>
            {statusConfig[d.status].icon}{statusConfig[d.status].label}
          </span>
        ),
      },

      // ── Điểm AI
      {
        key: 'score', label: 'Điểm AI',
        value:  d.aiScore != null
          ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{d.aiScore.score}</span>
              
            </div>
          )
          : 'Chưa có điểm',
      },

      // // ── CV
      // ...(d.cvUrl ? [{
      //   key: 'cvUrl', label: 'CV đính kèm',
      //   value: (
      //     <a href={d.cvUrl} target="_blank" rel="noreferrer"
      //       className="inline-flex items-center gap-1.5 text-blue-600 hover:underline dark:text-blue-400">
      //       <FileText className="w-3.5 h-3.5" />
      //       Xem CV
      //     </a>
      //   ),
      // }] : []),

      // ── Cover letter
      ...(d.coverLetter ? [{
        key: 'coverLetter', label: 'Thư xin việc', type: 'html' as const,
        value: d.coverLetter,
      }] : []),

      // ── Ngày nộp
      {
        key: 'appliedAt', label: 'Ngày nộp', type: 'date',
        value: new Date(d.appliedAt).toLocaleString('vi-VN'),
      },

      // ── Lịch sử trạng thái
      ...(d.statusLogs?.length > 0 ? [{
        key: 'statusLogs', label: 'Lịch sử trạng thái',
        value: (
          <div className="space-y-2.5">
            {d.statusLogs.map(log => (
              <div key={log.id} className="border-l-2 border-border pl-3 py-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {log.fromStatus && (
                    <>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig[log.fromStatus]?.color ?? ''}`}>
                        {statusConfig[log.fromStatus]?.label ?? log.fromStatus}
                      </span>
                      <span className="text-muted-foreground text-xs">→</span>
                    </>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig[log.toStatus]?.color ?? ''}`}>
                    {statusConfig[log.toStatus]?.label ?? log.toStatus}
                  </span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    {new Date(log.changedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                {log.reason    && <div className="text-xs text-muted-foreground mt-1">Lý do: {log.reason}</div>}
                {log.changedBy && <div className="text-xs text-muted-foreground">Bởi: {log.changedBy}</div>}
              </div>
            ))}
          </div>
        ),
      }] : []),
    ];
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const page1Based = currentPage + 1;
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex   = Math.min((currentPage + 1) * pageSize, totalElements);

  const statusFormFields: FormField[] = [
    { name: 'status', label: 'Trạng thái mới', type: 'select', required: true, options: statusOptions, placeholder: 'Chọn trạng thái mới' },
    { name: 'reason', label: 'Lý do thay đổi', type: 'textarea', required: true, rows: 3, placeholder: 'Nhập lý do...' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý đơn ứng tuyển</h1>
          <p className="text-[16px] text-muted-foreground mt-1">Quản lý và theo dõi trạng thái các đơn ứng tuyển</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> đơn
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
        config={{ searchKey: 'keyword', statusKey: 'status', customFilters: [] }}
        filters={{ keyword: getFilterValue('keyword'), status: getFilterValue('status') }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm kiếm theo tên ứng viên, email, vị trí..."
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table + Pagination */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          selectable
          showPagination={false}
          emptyMessage="Không có đơn ứng tuyển"
          emptyDescription="Chưa có đơn ứng tuyển nào trong hệ thống"
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
        title={selectedDetail
          ? `Chi tiết đơn — ${selectedDetail.candidate?.fullName ?? ''}`
          : 'Chi tiết đơn ứng tuyển'
        }
        fields={getDetailFields()}
        loading={detailLoading}
      />

      {/* Override Status Form */}
      <FormModel
        isOpen={statusFormModal.isOpen}
        onClose={() => setStatusFormModal({ isOpen: false, application: null, loading: false })}
        onSubmit={(data) => {
          if (statusFormModal.application)
            handleStatusChange(statusFormModal.application.id, data.status, data.reason);
        }}
        title={`Đổi trạng thái — ${statusFormModal.application ? getCandidateName(statusFormModal.application) : ''}`}
        fields={statusFormFields}
        initialData={{ status: statusFormModal.application?.status ?? '', reason: '' }}
        submitText="Cập nhật"
        loading={statusFormModal.loading}
      />
    </div>
  );
}