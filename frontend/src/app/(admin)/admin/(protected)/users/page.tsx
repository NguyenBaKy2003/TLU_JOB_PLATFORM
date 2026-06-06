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
  TablePagination
} from '@/presentation/components/common';
import { AdminUserRepository } from '@/infrastructure/repositories/AdminUserRepository';
import type { AdminUser, AdminUserFilters, AdminUserRole } from '@/domain/models/AdminUser';
import { Shield, User, Building2, Lock, Unlock, Edit, FileSpreadsheet, FileText } from 'lucide-react';
import { AdminUserService } from '@/application/services/AdminUserService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';

// ─── Static config ────────────────────────────────────────────────────────────

const roleOptions = [
  { value: 'ADMIN',     label: 'Admin' },
  { value: 'CANDIDATE', label: 'Ứng viên' },
  { value: 'EMPLOYER',  label: 'Nhà tuyển dụng' },
];

const roleFormOptions = [
  { value: 'ADMIN',     label: 'Admin' },
  { value: 'EMPLOYER',  label: 'Nhà tuyển dụng' },
  { value: 'CANDIDATE', label: 'Ứng viên' },
];

const statusOptions = [
  { value: 'active',   label: 'Hoạt động' },
  { value: 'inactive', label: 'Khóa' },
];

const roleConfig: Record<AdminUserRole, { icon: React.ReactNode; label: string; color: string }> = {
  ADMIN: {
    icon:  <Shield    className="w-4 h-4" />,
    label: 'Admin',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  },
  EMPLOYER: {
    icon:  <Building2 className="w-4 h-4" />,
    label: 'Nhà tuyển dụng',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  },
  CANDIDATE: {
    icon:  <User      className="w-4 h-4" />,
    label: 'Ứng viên',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusToActive(status: string): boolean | '' {
  if (status === 'active')   return true;
  if (status === 'inactive') return false;
  return '';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const serviceRef  = useRef(new AdminUserService(new AdminUserRepository()));
  const isFetching  = useRef(false);
  const pageSizeRef = useRef(10); // ← ref để tránh stale closure trong fetchUsers

  // ── State ──────────────────────────────────────────────────────────────────
  const [users,         setUsers]         = useState<AdminUser[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [exporting,     setExporting]     = useState<'excel' | 'pdf' | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0); // 0-based (Spring)
  const [pageSize,      setPageSize]      = useState(10);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen:    boolean;
    title:     string;
    message:   string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [roleFormModal, setRoleFormModal] = useState<{
    isOpen:  boolean;
    user:    AdminUser | null;
    loading: boolean;
  }>({ isOpen: false, user: null, loading: false });

  // ── Filters ────────────────────────────────────────────────────────────────
  const filterConfigs = [
    { key: 'keyword', type: 'input'  as const, label: 'Tìm kiếm',   placeholder: 'Tìm theo tên, email...' },
    { key: 'role',    type: 'select' as const, label: 'Vai trò',    options: roleOptions   },
    { key: 'status',  type: 'select' as const, label: 'Trạng thái', options: statusOptions },
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs:     filterConfigs,
    syncWithUrl: true,
    debounceMs:  500,
  });

  // ── Fetch — dependency rỗng, dùng pageSizeRef thay vì state ───────────────
  const fetchUsers = useCallback(async (
    filterValues: { keyword?: string; role?: string; status?: string },
    page = 0,
    size?: number,
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    const resolvedSize = size ?? pageSizeRef.current;

    try {
      const apiFilters: AdminUserFilters = {
        page:    Math.max(0, Number.isFinite(page) ? page : 0),
        size:    resolvedSize,
        keyword: filterValues.keyword || '',
        role:    (filterValues.role || '') as AdminUserRole | '',
        active:  statusToActive(filterValues.status || ''),
      };

      const result = await serviceRef.current.listUsers(apiFilters);
      setUsers(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page ?? 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toastRef.current.error('Lỗi tải dữ liệu',
        extractErrorMessage(error, 'Không thể tải danh sách người dùng'));
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []); // ← safe vì mọi giá trị động đều qua ref hoặc param

  // Reset về trang 0 khi filter thay đổi
  useEffect(() => {
    fetchUsers({ keyword: filters.keyword, role: filters.role, status: filters.status }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.role, filters.status]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const handlePageChange = useCallback((page: number) => {
    if (!Number.isFinite(page)) return;
    fetchUsers(
      { keyword: getFilterValue('keyword'), role: getFilterValue('role'), status: getFilterValue('status') },
      Math.max(0, page - 1), // 1-based UI → 0-based Spring
      pageSizeRef.current,
    );
  }, [fetchUsers, getFilterValue]);

  const handlePageSizeChange = useCallback((size: number) => {
    pageSizeRef.current = size; // ← sync ref ngay, trước khi React re-render
    setPageSize(size);
    fetchUsers(
      { keyword: getFilterValue('keyword'), role: getFilterValue('role'), status: getFilterValue('status') },
      0,
      size, // ← truyền trực tiếp, không phụ thuộc state
    );
  }, [fetchUsers, getFilterValue]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggleActive = async (userId: string) => {
    try {
      const user   = users.find(u => u.id === userId);
      const action = user?.active ? 'khóa' : 'kích hoạt';
      await serviceRef.current.toggleActive(userId);
      await fetchUsers(
        { keyword: getFilterValue('keyword'), role: getFilterValue('role'), status: getFilterValue('status') },
        currentPage,
        pageSizeRef.current,
      );
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      toastRef.current.success('Thành công', `Đã ${action} tài khoản "${user?.fullName}" thành công`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác',
        extractErrorMessage(error, 'Không thể thay đổi trạng thái tài khoản'));
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminUserRole) => {
    setRoleFormModal(prev => ({ ...prev, loading: true }));
    try {
      const user = users.find(u => u.id === userId);
      await serviceRef.current.changeRole(userId, newRole);
      await fetchUsers(
        { keyword: getFilterValue('keyword'), role: getFilterValue('role'), status: getFilterValue('status') },
        currentPage,
        pageSizeRef.current,
      );
      setRoleFormModal({ isOpen: false, user: null, loading: false });
      const roleLabel = roleFormOptions.find(r => r.value === newRole)?.label ?? newRole;
      toastRef.current.success('Thành công', `Đã đổi vai trò của "${user?.fullName}" thành ${roleLabel}`);
    } catch (error) {
      toastRef.current.error('Lỗi thao tác',
        extractErrorMessage(error, 'Không thể thay đổi vai trò'));
      setRoleFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const currentFilterSnapshot = useCallback(() => ({
    keyword: getFilterValue('keyword') || '',
    role:    (getFilterValue('role') || '') as AdminUserRole | '',
    active:  statusToActive(getFilterValue('status') || ''),
  }), [getFilterValue]);

  const handleExportExcel = useCallback(async () => {
    setExporting('excel');
    try {
      await serviceRef.current.downloadExcel(currentFilterSnapshot());
      toastRef.current.success('Xuất Excel', 'File đã được tải xuống thành công');
    } catch (error) {
      toastRef.current.error('Lỗi xuất Excel',
        extractErrorMessage(error, 'Không thể xuất file Excel'));
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
      toastRef.current.error('Lỗi xuất PDF',
        extractErrorMessage(error, 'Không thể xuất file PDF'));
    } finally {
      setExporting(null);
    }
  }, [currentFilterSnapshot]);

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchUsers(
      { keyword: getFilterValue('keyword'), role: getFilterValue('role'), status: getFilterValue('status') },
      currentPage,
      pageSizeRef.current,
    );
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchUsers, getFilterValue, currentPage]);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<AdminUser>[] = [
    {
      key:      'fullName',
      title:    'Họ tên',
      sortable: true,
      width:    '200px',
      render:   (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{record.email}</div>
        </div>
      ),
    },
    {
      key:   'role',
      title: 'Vai trò',
      width: '150px',
      render: (value: AdminUserRole) => {
        const cfg = roleConfig[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.icon}
            {cfg.label}
          </span>
        );
      },
    },
    {
      key:   'active',
      title: 'Trạng thái',
      width: '120px',
      render: (value: boolean) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          label={value ? 'Hoạt động' : 'Khóa'}
          size="sm"
        />
      ),
    },
    {
      key:      'createdAt',
      title:    'Ngày tạo',
      width:    '160px',
      sortable: true,
      render:   (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      key:   'lastLoginAt',
      title: 'Lần cuối đăng nhập',
      width: '160px',
      render: (value) =>
        value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa đăng nhập',
    },
    {
      key:    'actions',
      title:  'Thao tác',
      width:  '100px',
      align:  'center',
      render: (_, record) => (
        <TableActions record={record} actions={actions} showLabel={false} />
      ),
    },
  ];

  const actions: ActionItem<AdminUser>[] = [
    {
      key:   'toggle',
      label: (record) => record.active ? 'Khóa tài khoản' : 'Kích hoạt',
      icon:  (record) => record.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />,
      onClick: (record) => {
        setConfirmModal({
          isOpen:    true,
          title:     record.active ? 'Khóa tài khoản' : 'Kích hoạt tài khoản',
          message:   record.active
            ? `Bạn có chắc chắn muốn khóa tài khoản của "${record.fullName}"? Người dùng sẽ không thể đăng nhập.`
            : `Bạn có chắc chắn muốn kích hoạt tài khoản của "${record.fullName}"? Người dùng sẽ có thể đăng nhập lại.`,
          onConfirm: () => handleToggleActive(record.id),
        });
      },
      color: (record) => record.active ? 'warning' : 'success',
    },
    {
      key:     'role',
      label:   'Đổi vai trò',
      icon:    <Edit className="w-4 h-4" />,
      onClick: (record) => setRoleFormModal({ isOpen: true, user: record, loading: false }),
      color:   'default',
    },
  ];

  // ── Pagination derived values (TablePagination dùng 1-based) ──────────────
  const page1Based = currentPage + 1;
  const startIndex = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex   = Math.min((currentPage + 1) * pageSize, totalElements);

  // ── Role form fields ───────────────────────────────────────────────────────
  const roleFormFields: FormField[] = [
    {
      name:        'role',
      label:       'Vai trò mới',
      type:        'select',
      required:    true,
      options:     roleFormOptions,
      placeholder: 'Chọn vai trò mới',
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-[16px] text-muted-foreground mt-1">
            Quản lý tài khoản, phân quyền và trạng thái người dùng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[16px] text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> người dùng
          </div>

          <button
            onClick={handleExportExcel}
            disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exporting !== null || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            {exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <AdminFilter
        config={{
          searchKey:  'keyword',
          statusKey:  'status',
          customFilters: [
            { key: 'role', label: 'Vai trò', options: roleOptions },
          ],
        }}
        filters={{
          keyword: getFilterValue('keyword'),
          status:  getFilterValue('status'),
          role:    getFilterValue('role'),
        }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        statusOptions={statusOptions}
        searchPlaceholder="Tìm kiếm theo tên, email..."
        statusPlaceholder="Tất cả trạng thái"
        showDateFilter={false}
        loading={loading}
      />

      {/* Table + Pagination */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          selectable
          showPagination={false}
          emptyMessage="Không có người dùng"
          emptyDescription="Chưa có người dùng nào trong hệ thống"
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

      {/* Confirm modal */}
      <ConfirmModel
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.title.includes('Khóa') ? 'danger' : 'warning'}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      {/* Role form modal */}
      <FormModel
        isOpen={roleFormModal.isOpen}
        onClose={() => setRoleFormModal({ isOpen: false, user: null, loading: false })}
        onSubmit={(data) => {
          if (roleFormModal.user) handleRoleChange(roleFormModal.user.id, data.role);
        }}
        title={`Đổi vai trò - ${roleFormModal.user?.fullName ?? ''}`}
        fields={roleFormFields}
        initialData={{ role: roleFormModal.user?.role ?? '' }}
        submitText="Cập nhật"
        loading={roleFormModal.loading}
      />
    </div>
  );
}