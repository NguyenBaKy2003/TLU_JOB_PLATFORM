'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable, Column, ActionItem, AdminFilter, useFilter,
  ConfirmModel, TableActions, FormModel, FormField, TablePagination,
} from '@/presentation/components/common';
import { CompanyDetailModal } from '@/presentation/components/admin/companies/CompanyDetailModal';
import { AdminCompanyRepository } from '@/infrastructure/repositories/AdminCompanyRepository';
import type { AdminCompany, AdminCompanyFilters, VerificationStatus } from '@/domain/models/AdminCompany';
import { AdminCompanyService } from '@/application/services/AdminCompanyService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import {
  Building2, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, Shield, Unlock, FileSpreadsheet, FileText,
} from 'lucide-react';

// ─── Static config ────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'UNVERIFIED', label: 'Chưa xác thực' },
  { value: 'VERIFIED',   label: 'Đã xác thực' },
  { value: 'REJECTED',   label: 'Từ chối' },
  { value: 'SUSPENDED',  label: 'Đã khóa' },
];

const statusConfig: Record<VerificationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  UNVERIFIED: { label: 'Chưa xác thực', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3 h-3" /> },
  VERIFIED:   { label: 'Đã xác thực',   color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',   icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED:   { label: 'Từ chối',        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',           icon: <XCircle className="w-3 h-3" /> },
  SUSPENDED:  { label: 'Đã khóa',        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',          icon: <AlertCircle className="w-3 h-3" /> },
};

const actionButtonConfig = {
  UNVERIFIED: { primaryAction: 'approve',   primaryLabel: 'Xác thực', primaryIcon: <CheckCircle className="w-4 h-4" />, primaryColor: 'success'  as const, secondaryAction: 'reject',  secondaryLabel: 'Từ chối', secondaryIcon: <XCircle className="w-4 h-4" />, secondaryColor: 'danger' as const },
  VERIFIED:   { primaryAction: 'suspend',   primaryLabel: 'Khóa',     primaryIcon: <Shield className="w-4 h-4" />,      primaryColor: 'warning'  as const, secondaryAction: null, secondaryLabel: null, secondaryIcon: null, secondaryColor: null },
  SUSPENDED:  { primaryAction: 'unsuspend', primaryLabel: 'Mở khóa',  primaryIcon: <Unlock className="w-4 h-4" />,      primaryColor: 'success'  as const, secondaryAction: null, secondaryLabel: null, secondaryIcon: null, secondaryColor: null },
  REJECTED:   { primaryAction: null, primaryLabel: null, primaryIcon: null, primaryColor: null, secondaryAction: null, secondaryLabel: null, secondaryIcon: null, secondaryColor: null },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCompaniesPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const serviceRef  = useRef(new AdminCompanyService(new AdminCompanyRepository()));
  const isFetching  = useRef(false);
  const pageSizeRef = useRef(10);

  // ── State ──────────────────────────────────────────────────────────────────
  const [companies,     setCompanies]     = useState<AdminCompany[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [exporting,     setExporting]     = useState<'excel' | 'pdf' | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [pageSize,      setPageSize]      = useState(10);

  const [detailCompanyId, setDetailCompanyId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string;
    type: 'danger' | 'warning' | 'success'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

  const [rejectFormModal, setRejectFormModal] = useState<{
    isOpen: boolean; company: AdminCompany | null; loading: boolean;
  }>({ isOpen: false, company: null, loading: false });

  const [suspendFormModal, setSuspendFormModal] = useState<{
    isOpen: boolean; company: AdminCompany | null; loading: boolean;
  }>({ isOpen: false, company: null, loading: false });

  // ── Filters ────────────────────────────────────────────────────────────────
  const filterConfigs = [
    { key: 'keyword',  type: 'input'  as const, label: 'Tìm kiếm',   placeholder: 'Tên, mô tả, ngành...' },
    { key: 'status',   type: 'select' as const, label: 'Trạng thái', options: statusOptions },
    { key: 'city',     type: 'input'  as const, label: 'Thành phố',  placeholder: 'Hà Nội, HCM...' },
    { key: 'planCode', type: 'input'  as const, label: 'Plan',       placeholder: 'STARTER, BUSINESS...' },
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs, syncWithUrl: true, debounceMs: 500,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(async (
    filterValues: { keyword?: string; status?: string; city?: string; planCode?: string },
    page = 0,
    size?: number,
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    const resolvedSize = size ?? pageSizeRef.current;
    const hasAdvanced  = filterValues.keyword || filterValues.city || filterValues.planCode;

    const apiFilters: AdminCompanyFilters = {
      page:     Math.max(0, page),
      pageSize: resolvedSize,
      status:   (filterValues.status || '') as VerificationStatus | '',
      keyword:  filterValues.keyword  || '',
      city:     filterValues.city     || '',
      planCode: filterValues.planCode || '',
    };

    try {
      // search() nếu có advanced filter, list() nếu chỉ có status
      const result = hasAdvanced
        ? await serviceRef.current.searchCompanies(apiFilters)
        : await serviceRef.current.listCompanies(apiFilters);

      setCompanies(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number ?? 0);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu',
        extractErrorMessage(error, 'Không thể tải danh sách công ty'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCompanies({
      keyword:  filters.keyword,
      status:   filters.status,
      city:     filters.city,
      planCode: filters.planCode,
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.status, filters.city, filters.planCode]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const currentFilters = useCallback(() => ({
    keyword:  getFilterValue('keyword'),
    status:   getFilterValue('status'),
    city:     getFilterValue('city'),
    planCode: getFilterValue('planCode'),
  }), [getFilterValue]);

  const handlePageChange = useCallback((page: number) => {
    fetchCompanies(currentFilters(), Math.max(0, page - 1), pageSizeRef.current);
  }, [fetchCompanies, currentFilters]);

  const handlePageSizeChange = useCallback((size: number) => {
    pageSizeRef.current = size;
    setPageSize(size);
    fetchCompanies(currentFilters(), 0, size);
  }, [fetchCompanies, currentFilters]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const currentFilterSnapshot = useCallback((): Omit<AdminCompanyFilters, "page" | "pageSize"> => ({
    status:   (getFilterValue('status') || '') as VerificationStatus | '',
    keyword:  getFilterValue('keyword')  || '',
    city:     getFilterValue('city')     || '',
    planCode: getFilterValue('planCode') || '',
  }), [getFilterValue]);

  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    try {
      await serviceRef.current.downloadExcel(currentFilterSnapshot());
      toastRef.current.success('Xuất Excel', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất Excel', extractErrorMessage(error, 'Không thể xuất file Excel'));
    } finally {
      setExporting(null);
    }
  }, [currentFilterSnapshot]);

  const handleExportPdf = useCallback(async () => {
    setExporting('pdf');
    try {
      await serviceRef.current.downloadPdf(currentFilterSnapshot());
      toastRef.current.success('Xuất PDF', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất PDF', extractErrorMessage(error, 'Không thể xuất file PDF'));
    } finally {
      setExporting(null);
    }
  }, [currentFilterSnapshot]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      const company = companies.find(c => c.id === id);
      await serviceRef.current.approve(id);
      await fetchCompanies(currentFilters(), currentPage, pageSizeRef.current);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      toastRef.current.success('Thành công', `Đã xác thực công ty "${company?.name}"`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể xác thực công ty'));
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setRejectFormModal(prev => ({ ...prev, loading: true }));
    try {
      const company = companies.find(c => c.id === id);
      await serviceRef.current.reject(id, reason);
      await fetchCompanies(currentFilters(), currentPage, pageSizeRef.current);
      setRejectFormModal({ isOpen: false, company: null, loading: false });
      toastRef.current.success('Thành công', `Đã từ chối xác thực công ty "${company?.name}"`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể từ chối xác thực'));
      setRejectFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSuspend = async (id: string, reason: string) => {
    setSuspendFormModal(prev => ({ ...prev, loading: true }));
    try {
      const company = companies.find(c => c.id === id);
      await serviceRef.current.suspend(id, reason);
      await fetchCompanies(currentFilters(), currentPage, pageSizeRef.current);
      setSuspendFormModal({ isOpen: false, company: null, loading: false });
      toastRef.current.success('Thành công', `Đã khóa công ty "${company?.name}"`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể khóa công ty'));
      setSuspendFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUnsuspend = async (id: string) => {
    try {
      const company = companies.find(c => c.id === id);
      await serviceRef.current.unsuspend(id);
      await fetchCompanies(currentFilters(), currentPage, pageSizeRef.current);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      toastRef.current.success('Thành công', `Đã mở khóa công ty "${company?.name}"`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác', extractErrorMessage(error, 'Không thể mở khóa công ty'));
    }
  };

  const handleFilterChange = useCallback((key: string, value: unknown) => setFilter(key, value), [setFilter]);
  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);
  const handleRefresh = useCallback(() => {
    fetchCompanies(currentFilters(), currentPage, pageSizeRef.current);
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchCompanies, currentFilters, currentPage]);

  // ── Table ──────────────────────────────────────────────────────────────────
  const getActions = (record: AdminCompany): ActionItem<AdminCompany>[] => {
    const actions: ActionItem<AdminCompany>[] = [{
      key: 'view', label: 'Xem chi tiết', icon: <Eye className="w-4 h-4" />,
      onClick: () => { setDetailCompanyId(record.id); setDetailModalOpen(true); },
      color: 'default',
    }];
    const cfg = actionButtonConfig[record.verificationStatus];
    if (cfg.primaryAction && cfg.primaryLabel) {
      actions.push({
        key: cfg.primaryAction, label: cfg.primaryLabel, icon: cfg.primaryIcon,
        onClick: () => {
          if (cfg.primaryAction === 'approve')   setConfirmModal({ isOpen: true, title: 'Xác thực công ty', message: `Xác thực công ty "${record.name}"?`, type: 'success', onConfirm: () => handleApprove(record.id) });
          if (cfg.primaryAction === 'suspend')   setSuspendFormModal({ isOpen: true, company: record, loading: false });
          if (cfg.primaryAction === 'unsuspend') setConfirmModal({ isOpen: true, title: 'Mở khóa công ty', message: `Mở khóa công ty "${record.name}"?`, type: 'success', onConfirm: () => handleUnsuspend(record.id) });
        },
        color: cfg.primaryColor,
      });
    }
    if (cfg.secondaryAction && cfg.secondaryLabel) {
      actions.push({
        key: cfg.secondaryAction, label: cfg.secondaryLabel, icon: cfg.secondaryIcon,
        onClick: () => { if (cfg.secondaryAction === 'reject') setRejectFormModal({ isOpen: true, company: record, loading: false }); },
        color: cfg.secondaryColor,
      });
    }
    return actions;
  };

  const columns: Column<AdminCompany>[] = [
    {
      key: 'logoUrl', title: 'Logo', width: '80px',
      render: (value) => value
        ? <img src={value} alt="Logo" className="w-10 h-10 rounded-lg object-cover border" />
        : <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Building2 className="w-5 h-5 text-muted-foreground" /></div>,
    },
    {
      key: 'name', title: 'Tên công ty', sortable: true, width: '250px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{record.email}</div>
        </div>
      ),
    },
    { key: 'industry', title: 'Ngành nghề', width: '150px', render: (v) => v || '—' },
    { key: 'city',     title: 'Thành phố',  width: '120px', render: (v) => v || '—' },
    {
      key: 'verificationStatus', title: 'Trạng thái', width: '150px',
      render: (value: VerificationStatus) => {
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
      key: 'actions', title: 'Thao tác', width: '180px', align: 'center',
      render: (_, record) => <TableActions record={record} actions={getActions(record)} showLabel={false} />,
    },
  ];

  const page1Based = currentPage + 1;
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex   = Math.min((currentPage + 1) * pageSize, totalElements);

  const rejectFormFields: FormField[] = [{ name: 'reason', label: 'Lý do từ chối', type: 'textarea', required: true, rows: 4, placeholder: 'Nhập lý do từ chối...' }];
  const suspendFormFields: FormField[] = [{ name: 'reason', label: 'Lý do khóa',    type: 'textarea', required: true, rows: 4, placeholder: 'Nhập lý do khóa công ty...' }];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý công ty</h1>
          <p className="text-[16px] text-muted-foreground mt-1">Quản lý và xác thực các công ty trên hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> công ty
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
            { key: 'planCode', label: 'Plan',       options: [] },
          ],
        }}
        filters={{
          keyword:  getFilterValue('keyword'),
          status:   getFilterValue('status'),
          city:     getFilterValue('city'),
          planCode: getFilterValue('planCode'),
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm kiếm tên, mô tả, ngành..."
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table + Pagination */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={companies}
          columns={columns}
          loading={loading}
          selectable
          showPagination={false}
          emptyMessage="Không có công ty"
          emptyDescription="Chưa có công ty nào trong hệ thống"
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

      <CompanyDetailModal isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setDetailCompanyId(null); }} companyId={detailCompanyId || ''} />

      <ConfirmModel isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} confirmText="Xác nhận" cancelText="Hủy" />

      <FormModel isOpen={rejectFormModal.isOpen} onClose={() => setRejectFormModal({ isOpen: false, company: null, loading: false })} onSubmit={(data) => { if (rejectFormModal.company) handleReject(rejectFormModal.company.id, data.reason); }} title={`Từ chối xác thực - ${rejectFormModal.company?.name ?? ''}`} fields={rejectFormFields} initialData={{ reason: '' }} submitText="Xác nhận từ chối" loading={rejectFormModal.loading} />

      <FormModel isOpen={suspendFormModal.isOpen} onClose={() => setSuspendFormModal({ isOpen: false, company: null, loading: false })} onSubmit={(data) => { if (suspendFormModal.company) handleSuspend(suspendFormModal.company.id, data.reason); }} title={`Khóa công ty - ${suspendFormModal.company?.name ?? ''}`} fields={suspendFormFields} initialData={{ reason: '' }} submitText="Xác nhận khóa" loading={suspendFormModal.loading} />
    </div>
  );
}