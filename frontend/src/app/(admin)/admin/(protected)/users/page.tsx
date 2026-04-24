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
  FormField
} from '@/presentation/components/common';
import { AdminUserRepository } from '@/infrastructure/repositories/AdminUserRepository';
import type { AdminUser, AdminUserFilters, AdminUserRole } from '@/domain/models/AdminUser';
import { Shield, User, Building2, Crown, Lock, Unlock, Edit } from 'lucide-react';
import { AdminUserService } from '@/application/services/AdminUserService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'CANDIDATE', label: 'Ứng viên' },
  { value: 'EMPLOYER', label: 'Nhà tuyển dụng' }
];

const roleFormOptions = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'EMPLOYER', label: 'Nhà tuyển dụng' },
  { value: 'CANDIDATE', label: 'Ứng viên' }
];

const statusOptions = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Khóa' }
];

const roleConfig: Record<AdminUserRole, { icon: React.ReactNode; label: string; color: string }> = {
  SUPER_ADMIN: {
    icon: <Crown className="w-4 h-4" />,
    label: 'Super Admin',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
  },
  ADMIN: {
    icon: <Shield className="w-4 h-4" />,
    label: 'Admin',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
  },
  EMPLOYER: {
    icon: <Building2 className="w-4 h-4" />,
    label: 'Nhà tuyển dụng',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
  },
  CANDIDATE: {
    icon: <User className="w-4 h-4" />,
    label: 'Ứng viên',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  }
};

export default function AdminUsersPage() {
  const toast = useToast();

  // FIX: giữ toast trong ref để không làm fetchUsers recreate mỗi render
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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

  const [roleFormModal, setRoleFormModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    loading: boolean;
  }>({
    isOpen: false,
    user: null,
    loading: false
  });

  const isFetching = useRef(false);

  const service = new AdminUserService(new AdminUserRepository());

  const filterConfigs = [
    { key: 'keyword', type: 'input' as const, label: 'Tìm kiếm', placeholder: 'Tìm theo tên, email...' },
    { key: 'role', type: 'select' as const, label: 'Vai trò', options: roleOptions },
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: statusOptions }
  ];

  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs,
    syncWithUrl: true,
    debounceMs: 500
  });

  // FIX: không có dependency nào dễ thay đổi — toast dùng qua ref
  const fetchUsers = useCallback(async (filterValues: { keyword?: string; role?: string }) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);

    try {
      const apiFilters: AdminUserFilters = {
        page: 0,
        size: 10,
        keyword: filterValues.keyword || '',
        role: filterValues.role || ''
      };

      const result = await service.listUsers(apiFilters);
      setUsers(result.content);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const message = extractErrorMessage(error, 'Không thể tải danh sách người dùng');
      toastRef.current.error('Lỗi tải dữ liệu', message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []); 

  useEffect(() => {
    fetchUsers({
      keyword: filters.keyword,
      role: filters.role
    });
  }, [filters.keyword, filters.role]); 

  const handleToggleActive = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      const action = user?.active ? 'khóa' : 'kích hoạt';
      await service.toggleActive(userId);
      await fetchUsers({
        keyword: getFilterValue('keyword'),
        role: getFilterValue('role')
      });
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      toastRef.current.success('Thành công', `Đã ${action} tài khoản "${user?.fullName}" thành công`);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      const message = extractErrorMessage(error, 'Không thể thay đổi trạng thái tài khoản');
      toastRef.current.error('Lỗi thao tác', message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminUserRole) => {
    setRoleFormModal(prev => ({ ...prev, loading: true }));
    try {
      const user = users.find(u => u.id === userId);
      await service.changeRole(userId, newRole);
      await fetchUsers({
        keyword: getFilterValue('keyword'),
        role: getFilterValue('role')
      });
      setRoleFormModal({ isOpen: false, user: null, loading: false });
      const roleLabel = roleFormOptions.find(r => r.value === newRole)?.label || newRole;
      toastRef.current.success('Thành công', `Đã đổi vai trò của "${user?.fullName}" thành ${roleLabel}`);
    } catch (error) {
      console.error('Failed to change user role:', error);
      const message = extractErrorMessage(error, 'Không thể thay đổi vai trò');
      toastRef.current.error('Lỗi thao tác', message);
      setRoleFormModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openRoleForm = (user: AdminUser) => {
    setSelectedUser(user);
    setRoleFormModal({ isOpen: true, user, loading: false });
  };

  // FIX: handleFilterChange và handleResetFilters không cần fetchUsers trong deps
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilter(key, value);
  }, [setFilter]);

  // FIX: chỉ reset filter — useEffect sẽ tự fetch lại khi filter thay đổi
  const handleResetFilters = useCallback(() => {
    resetAllFilters();
    toastRef.current.info('Đã xóa bộ lọc', 'Đang tải lại tất cả dữ liệu');
  }, [resetAllFilters]);

  const handleRefresh = useCallback(() => {
    fetchUsers({
      keyword: getFilterValue('keyword'),
      role: getFilterValue('role')
    });
    toastRef.current.info('Làm mới', 'Đang tải lại dữ liệu...');
  }, [fetchUsers, getFilterValue]);

  const roleFormFields: FormField[] = [
    {
      name: 'role',
      label: 'Vai trò mới',
      type: 'select',
      required: true,
      options: roleFormOptions,
      placeholder: 'Chọn vai trò mới'
    }
  ];

  const columns: Column<AdminUser>[] = [
    {
      key: 'fullName',
      title: 'Họ tên',
      sortable: true,
      width: '200px',
      render: (value, record) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{record.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Vai trò',
      width: '150px',
      render: (value: AdminUserRole) => {
        const config = roleConfig[value];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'active',
      title: 'Trạng thái',
      width: '120px',
      render: (value: boolean) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          label={value ? 'Hoạt động' : 'Khóa'}
          size="sm"
        />
      )
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      width: '160px',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN')
    },
    {
      key: 'lastLoginAt',
      title: 'Lần cuối đăng nhập',
      width: '160px',
      render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '100px',
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

  const actions: ActionItem<AdminUser>[] = [
    {
      key: 'toggle',
      label: (record) => record.active ? 'Khóa tài khoản' : 'Kích hoạt',
      icon: (record) => record.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />,
      onClick: (record) => {
        setSelectedUser(record);
        setConfirmModal({
          isOpen: true,
          title: record.active ? 'Khóa tài khoản' : 'Kích hoạt tài khoản',
          message: record.active
            ? `Bạn có chắc chắn muốn khóa tài khoản của "${record.fullName}"? Người dùng sẽ không thể đăng nhập.`
            : `Bạn có chắc chắn muốn kích hoạt tài khoản của "${record.fullName}"? Người dùng sẽ có thể đăng nhập lại.`,
          onConfirm: () => handleToggleActive(record.id)
        });
      },
      color: (record) => record.active ? 'warning' : 'success'
    },
    {
      key: 'role',
      label: 'Đổi vai trò',
      icon: <Edit className="w-4 h-4" />,
      onClick: (record) => openRoleForm(record),
      color: 'default'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tài khoản, phân quyền và trạng thái người dùng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Tổng số: <span className="font-semibold text-foreground">{totalElements}</span> người dùng
          </div>
        </div>
      </div>

      <AdminFilter
        config={{
          searchKey: 'keyword',
          statusKey: 'status',
          customFilters: [
            { key: 'role', label: 'Vai trò', options: roleOptions }
          ]
        }}
        filters={{
          keyword: getFilterValue('keyword'),
          status: getFilterValue('status'),
          role: getFilterValue('role')
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

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          selectable
          showPagination
          defaultPageSize={10}
          emptyMessage="Không có người dùng"
          emptyDescription="Chưa có người dùng nào trong hệ thống"
          onRefresh={handleRefresh}
        />
      </div>

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

      <FormModel
        isOpen={roleFormModal.isOpen}
        onClose={() => setRoleFormModal({ isOpen: false, user: null, loading: false })}
        onSubmit={(data) => {
          if (roleFormModal.user) {
            handleRoleChange(roleFormModal.user.id, data.role);
          }
        }}
        title={`Đổi vai trò - ${roleFormModal.user?.fullName || ''}`}
        fields={roleFormFields}
        initialData={{ role: roleFormModal.user?.role || '' }}
        submitText="Cập nhật"
        loading={roleFormModal.loading}
      />
    </div>
  );
}