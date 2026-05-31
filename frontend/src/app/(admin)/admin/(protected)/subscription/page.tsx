'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DataTable, Column, StatusBadge, AdminFilter, useFilter,
  ConfirmModel, DetailModel, DetailField,
} from '@/presentation/components/common';
import { PlanFormModal } from '@/presentation/components/admin/subscription/PlanFormModal';
import { CandidatePlanFormModal } from '@/presentation/components/admin/subscription/CandidatePlanFormModal';
import { AdminSubscriptionRepository } from '@/infrastructure/repositories/AdminSubscriptionRepository';
import { AdminCandidatePlanRepository } from '@/infrastructure/repositories/AdminCandidatePlanRepository';
import { AdminCandidateSubscriptionRepository } from '@/infrastructure/repositories/AdminCandidateSubscriptionRepository';
import { AdminSubscriptionService } from '@/application/services/AdminSubscriptionService';
import { AdminCandidatePlanService } from '@/application/services/AdminCandidatePlanService';
import { AdminCandidateSubscriptionService } from '@/application/services/AdminCandidateSubscriptionService';
import { useToast } from '@/presentation/components/ui/toast';
import { extractErrorMessage } from '@/lib/extractErrorMessage';
import type { SubscriptionPlan } from '@/domain/models/CompanySubscription';
import type { CandidateSubscriptionPlan, CandidatePlanPayload } from '@/domain/models/CandidateSubscription';
import type { PlanPayload, AdminSubscriptionRow } from '@/domain/repositories/IAdminSubscriptionRepository';
import type { AdminCandidateSubscriptionRow } from '@/domain/repositories/IAdminCandidateSubscriptionRepository';
import {
  Plus, Edit, Eye, CheckCircle, XCircle, Clock,
  ToggleLeft, ToggleRight, Building2, User, Users, Briefcase,
  FileSpreadsheet, FileText,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const subscriptionStatusOptions = [
  { value: 'ACTIVE',    label: 'Hoạt động' },
  { value: 'EXPIRED',   label: 'Hết hạn' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'FAILED',    label: 'Thất bại' },
  { value: 'PENDING',   label: 'Chờ xử lý' },
];

const subscriptionStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE:    { label: 'Hoạt động',  color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',   icon: <CheckCircle className="w-3 h-3" /> },
  EXPIRED:   { label: 'Hết hạn',   color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',            icon: <XCircle className="w-3 h-3" /> },
  CANCELLED: { label: 'Đã hủy',    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',           icon: <XCircle className="w-3 h-3" /> },
  FAILED:    { label: 'Thất bại',   color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',            icon: <XCircle className="w-3 h-3" /> },
  PENDING:   { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3 h-3" /> },
};

type TabType = 'company-plans' | 'candidate-plans' | 'company-subs' | 'candidate-subs';

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: 'company-plans',   label: 'Gói Employer',       icon: <Building2 className="w-4 h-4" /> },
  { key: 'candidate-plans', label: 'Gói Candidate',      icon: <User className="w-4 h-4" /> },
  { key: 'company-subs',    label: 'Đăng ký Employer',   icon: <Briefcase className="w-4 h-4" /> },
  { key: 'candidate-subs',  label: 'Đăng ký Candidate',  icon: <Users className="w-4 h-4" /> },
];

const formatPrice = (amount: number): string => {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
};
const formatQuota = (value: number): string => value === -1 ? 'Không giới hạn' : value.toLocaleString();
// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSubscriptionPage() {
  const toast    = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const companyServiceRef       = useRef(new AdminSubscriptionService(new AdminSubscriptionRepository()));
  const candidatePlanServiceRef = useRef(new AdminCandidatePlanService(new AdminCandidatePlanRepository()));
  const candidateSubServiceRef  = useRef(new AdminCandidateSubscriptionService(new AdminCandidateSubscriptionRepository()));

  const isFetchingCompany   = useRef(false);
  const isFetchingCandidate = useRef(false);

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('company-plans');

  // ── Plans ──────────────────────────────────────────────────────────────────
  const [companyPlans,        setCompanyPlans]        = useState<SubscriptionPlan[]>([]);
  const [companyPlansLoading, setCompanyPlansLoading] = useState(true);
  const [candidatePlans,        setCandidatePlans]        = useState<CandidateSubscriptionPlan[]>([]);
  const [candidatePlansLoading, setCandidatePlansLoading] = useState(true);

  // ── Company subs ───────────────────────────────────────────────────────────
  const [companySubs,        setCompanySubs]        = useState<AdminSubscriptionRow[]>([]);
  const [companySubsLoading, setCompanySubsLoading] = useState(true);
  const [companySubsTotal,   setCompanySubsTotal]   = useState(0);
  const [exportingCompany,   setExportingCompany]   = useState<'excel' | 'pdf' | null>(null);

  // ── Candidate subs ─────────────────────────────────────────────────────────
  const [candidateSubs,        setCandidateSubs]        = useState<AdminCandidateSubscriptionRow[]>([]);
  const [candidateSubsLoading, setCandidateSubsLoading] = useState(true);
  const [candidateSubsTotal,   setCandidateSubsTotal]   = useState(0);
  const [exportingCandidate,   setExportingCandidate]   = useState<'excel' | 'pdf' | null>(null);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [companyPlanModalOpen,   setCompanyPlanModalOpen]   = useState(false);
  const [editingCompanyPlan,     setEditingCompanyPlan]     = useState<SubscriptionPlan | undefined>();
  const [candidatePlanModalOpen, setCandidatePlanModalOpen] = useState(false);
  const [editingCandidatePlan,   setEditingCandidatePlan]   = useState<CandidateSubscriptionPlan | undefined>();

  const [detailModalOpen,      setDetailModalOpen]      = useState(false);
  const [selectedCompanySub,   setSelectedCompanySub]   = useState<AdminSubscriptionRow | null>(null);
  const [selectedCandidateSub, setSelectedCandidateSub] = useState<AdminCandidateSubscriptionRow | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string;
    type: 'danger' | 'warning' | 'success'; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: () => {} });

  // ── Filters ────────────────────────────────────────────────────────────────
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Trạng thái', options: subscriptionStatusOptions },
  ];
  const { filters, setFilter, resetAllFilters, getFilterValue } = useFilter({
    configs: filterConfigs, syncWithUrl: true, debounceMs: 500,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCompanyPlans = useCallback(async () => {
    setCompanyPlansLoading(true);
    try {
      setCompanyPlans(await companyServiceRef.current.getAllPlans());
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải gói Employer'));
    } finally { setCompanyPlansLoading(false); }
  }, []);

  const fetchCandidatePlans = useCallback(async () => {
    setCandidatePlansLoading(true);
    try {
      setCandidatePlans(await candidatePlanServiceRef.current.getAllPlans());
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải gói Candidate'));
    } finally { setCandidatePlansLoading(false); }
  }, []);

  const fetchCompanySubs = useCallback(async (status?: string) => {
    if (isFetchingCompany.current) return;
    isFetchingCompany.current = true;
    setCompanySubsLoading(true);
    try {
      const result = await companyServiceRef.current.listSubscriptions(0, 20, status || undefined);
      setCompanySubs(result.content);
      setCompanySubsTotal(result.totalElements);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải đăng ký Employer'));
    } finally { setCompanySubsLoading(false); isFetchingCompany.current = false; }
  }, []);

  const fetchCandidateSubs = useCallback(async (status?: string) => {
    if (isFetchingCandidate.current) return;
    isFetchingCandidate.current = true;
    setCandidateSubsLoading(true);
    try {
      const result = await candidateSubServiceRef.current.listSubscriptions(0, 20, status || undefined);
      setCandidateSubs(result.content);
      setCandidateSubsTotal(result.totalElements);
    } catch (error) {
      toastRef.current.error('Lỗi tải dữ liệu', extractErrorMessage(error, 'Không thể tải đăng ký Candidate'));
    } finally { setCandidateSubsLoading(false); isFetchingCandidate.current = false; }
  }, []);

  useEffect(() => { fetchCompanyPlans(); fetchCandidatePlans(); }, []);

  useEffect(() => {
    const status = filters.status || undefined;
    if (activeTab === 'company-subs')   fetchCompanySubs(status);
    if (activeTab === 'candidate-subs') fetchCandidateSubs(status);
  }, [filters.status, activeTab]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCompanyExcel = useCallback(async () => {
  setExportingCompany('excel');
  try {
    await companyServiceRef.current.downloadExcel();
    toastRef.current.success('Xuất Excel', 'File đã được tải xuống');
  } catch (error) {
    toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file'));
  } finally { setExportingCompany(null); }
}, []);

const handleExportCompanyPdf = useCallback(async () => {
  setExportingCompany('pdf');
  try {
    await companyServiceRef.current.downloadPdf();
    toastRef.current.success('Xuất PDF', 'File đã được tải xuống');
  } catch (error) {
    toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file'));
  } finally { setExportingCompany(null); }
}, []);

const handleExportCandidateExcel = useCallback(async () => {
  setExportingCandidate('excel');
  try {
    await candidateSubServiceRef.current.downloadExcel();
    toastRef.current.success('Xuất Excel', 'File đã được tải xuống');
  } catch (error) {
    toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file'));
  } finally { setExportingCandidate(null); }
}, []);

const handleExportCandidatePdf = useCallback(async () => {
  setExportingCandidate('pdf');
  try {
    await candidateSubServiceRef.current.downloadPdf();
    toastRef.current.success('Xuất PDF', 'File đã được tải xuống');
  } catch (error) {
    toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể xuất file'));
  } finally { setExportingCandidate(null); }
}, []);

  // ── Plan handlers ──────────────────────────────────────────────────────────
  const handleSaveCompanyPlan = useCallback(async (payload: PlanPayload) => {
    try {
      if (editingCompanyPlan) {
        const updated = await companyServiceRef.current.updatePlan(editingCompanyPlan.id, payload);
        setCompanyPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toastRef.current.success('Thành công', `Đã cập nhật gói "${payload.name}"`);
      } else {
        const created = await companyServiceRef.current.createPlan(payload);
        setCompanyPlans(prev => [created, ...prev]);
        toastRef.current.success('Thành công', `Đã tạo gói "${payload.name}"`);
      }
      setCompanyPlanModalOpen(false);
      setEditingCompanyPlan(undefined);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể lưu gói'));
      throw error;
    }
  }, [editingCompanyPlan]);

  const handleSaveCandidatePlan = useCallback(async (payload: CandidatePlanPayload) => {
    try {
      if (editingCandidatePlan) {
        const updated = await candidatePlanServiceRef.current.updatePlan(editingCandidatePlan.id, payload);
        setCandidatePlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        toastRef.current.success('Thành công', `Đã cập nhật gói "${payload.name}"`);
      } else {
        const created = await candidatePlanServiceRef.current.createPlan(payload);
        setCandidatePlans(prev => [created, ...prev]);
        toastRef.current.success('Thành công', `Đã tạo gói "${payload.name}"`);
      }
      setCandidatePlanModalOpen(false);
      setEditingCandidatePlan(undefined);
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể lưu gói'));
      throw error;
    }
  }, [editingCandidatePlan]);

  const handleCompanyToggle = async (plan: SubscriptionPlan) => {
    try {
      const updated = await companyServiceRef.current.toggleActive(plan);
      setCompanyPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toastRef.current.success('Thành công', `${updated.active ? 'Kích hoạt' : 'Vô hiệu hóa'} gói "${plan.name}"`);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể thay đổi trạng thái'));
    }
  };

  const handleCandidateToggle = async (plan: CandidateSubscriptionPlan) => {
    try {
      const updated = await candidatePlanServiceRef.current.toggleActive(plan);
      setCandidatePlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      toastRef.current.success('Thành công', `${updated.active ? 'Kích hoạt' : 'Vô hiệu hóa'} gói "${plan.name}"`);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      toastRef.current.error('Lỗi', extractErrorMessage(error, 'Không thể thay đổi trạng thái'));
    }
  };

  const handleFilterChange = useCallback((key: string, value: unknown) => setFilter(key, value), [setFilter]);
  const handleResetFilters = useCallback(() => { resetAllFilters(); }, [resetAllFilters]);

  // ── Table columns ──────────────────────────────────────────────────────────
  const companyPlanColumns: Column<SubscriptionPlan>[] = [
    { key: 'code',         title: 'Mã gói',           width: '100px', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'name',         title: 'Tên gói',           width: '160px', render: (v, r) => <div><div className="font-medium">{v}</div>{r.description && <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>}</div> },
    { key: 'priceMonthly', title: 'Giá tháng',         width: '110px', render: (v) => formatPrice(v) },
    { key: 'priceYearly',  title: 'Giá năm',           width: '110px', render: (v) => formatPrice(v) },
    { key: 'jobPostLimit', title: 'Tin tuyển dụng',    width: '110px', render: (v) => formatQuota(v) },
    { key: 'durationDays', title: 'Hiệu lực',          width: '90px',  render: (v) => `${v} ngày` },
    { key: 'active',       title: 'Trạng thái',        width: '100px', render: (v) => <StatusBadge status={v ? 'active' : 'inactive'} label={v ? 'Kích hoạt' : 'Vô hiệu'} size="sm" /> },
    {
      key: 'actions', title: '', width: '80px', align: 'center',
      render: (_, r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditingCompanyPlan(r); setCompanyPlanModalOpen(true); }} className="p-1.5 rounded-md hover:bg-muted"><Edit className="w-4 h-4" /></button>
          <button onClick={() => setConfirmModal({ isOpen: true, title: r.active ? 'Vô hiệu hóa gói' : 'Kích hoạt gói', message: `${r.active ? 'Vô hiệu hóa' : 'Kích hoạt'} gói "${r.name}"?`, type: 'warning', onConfirm: () => handleCompanyToggle(r) })} className="p-1.5 rounded-md hover:bg-muted">
            {r.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      ),
    },
  ];

  const candidatePlanColumns: Column<CandidateSubscriptionPlan>[] = [
    { key: 'code',             title: 'Mã gói',          width: '100px', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'name',             title: 'Tên gói',          width: '160px', render: (v, r) => <div><div className="font-medium">{v}</div>{r.description && <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>}</div> },
    { key: 'priceMonthly',     title: 'Giá tháng',        width: '110px', render: (v) => formatPrice(v) },
    { key: 'priceYearly',      title: 'Giá năm',          width: '110px', render: (v) => formatPrice(v) },
    { key: 'applicationLimit', title: 'Đơn ứng tuyển',   width: '140px', render: (v) => formatQuota(v) },
    { key: 'durationDays',     title: 'Hiệu lực',         width: '90px',  render: (v) => `${v} ngày` },
    { key: 'active',           title: 'Trạng thái',       width: '100px', render: (v) => <StatusBadge status={v ? 'active' : 'inactive'} label={v ? 'Kích hoạt' : 'Vô hiệu'} size="sm" /> },
    { key: 'free',             title: 'Loại',             width: '70px',  render: (v) => v ? <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span> : null },
    {
      key: 'actions', title: '', width: '80px', align: 'center',
      render: (_, r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditingCandidatePlan(r); setCandidatePlanModalOpen(true); }} className="p-1.5 rounded-md hover:bg-muted"><Edit className="w-4 h-4" /></button>
          <button onClick={() => setConfirmModal({ isOpen: true, title: r.active ? 'Vô hiệu hóa gói' : 'Kích hoạt gói', message: `${r.active ? 'Vô hiệu hóa' : 'Kích hoạt'} gói "${r.name}"?`, type: 'warning', onConfirm: () => handleCandidateToggle(r) })} className="p-1.5 rounded-md hover:bg-muted">
            {r.active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      ),
    },
  ];

  const statusBadge = (value: string) => {
    const cfg = subscriptionStatusConfig[value];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg?.color || ''}`}>
        {cfg?.icon}{cfg?.label || value}
      </span>
    );
  };

  const companySubColumns: Column<AdminSubscriptionRow>[] = [
    { key: 'companyName', title: 'Công ty',       width: '180px', render: (v) => <div className="font-medium">{v}</div> },
    { key: 'planCode',    title: 'Gói',            width: '100px', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'status',      title: 'Trạng thái',    width: '130px', render: statusBadge },
    { key: 'amount',      title: 'Số tiền',        width: '110px', render: (v) => formatPrice(v) },
    { key: 'startedAt',   title: 'Bắt đầu',       width: '110px', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    { key: 'expiresAt',   title: 'Hết hạn',       width: '110px', render: (v) => { const d = new Date(v); return <span className={d < new Date() ? 'text-red-500' : ''}>{d.toLocaleDateString('vi-VN')}</span>; } },
    { key: 'actions', title: '', width: '60px', align: 'center', render: (_, r) => <button onClick={() => { setSelectedCompanySub(r); setSelectedCandidateSub(null); setDetailModalOpen(true); }} className="p-1.5 rounded-md hover:bg-muted"><Eye className="w-4 h-4" /></button> },
  ];

  const candidateSubColumns: Column<AdminCandidateSubscriptionRow>[] = [
    { key: 'candidateName', title: 'Ứng viên',    width: '180px', render: (v) => <div className="font-medium">{v}</div> },
    { key: 'planCode',      title: 'Gói',          width: '100px', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'status',        title: 'Trạng thái',  width: '130px', render: statusBadge },
    { key: 'amount',        title: 'Số tiền',      width: '110px', render: (v) => formatPrice(v) },
    { key: 'startedAt',     title: 'Bắt đầu',     width: '110px', render: (v) => new Date(v).toLocaleDateString('vi-VN') },
    { key: 'expiresAt',     title: 'Hết hạn',     width: '110px', render: (v) => { const d = new Date(v); return <span className={d < new Date() ? 'text-red-500' : ''}>{d.toLocaleDateString('vi-VN')}</span>; } },
    { key: 'actions', title: '', width: '60px', align: 'center', render: (_, r) => <button onClick={() => { setSelectedCandidateSub(r); setSelectedCompanySub(null); setDetailModalOpen(true); }} className="p-1.5 rounded-md hover:bg-muted"><Eye className="w-4 h-4" /></button> },
  ];

  // ── Detail fields ──────────────────────────────────────────────────────────
  const getDetailFields = (): DetailField[] => {
    if (selectedCompanySub) {
      const s = selectedCompanySub;
      return [
        { key: 'companyName', label: 'Công ty',      value: s.companyName, copyable: true },
        { key: 'planCode',    label: 'Mã gói',        value: s.planCode,    copyable: true },
        { key: 'status',      label: 'Trạng thái',   value: statusBadge(s.status), type: 'badge' },
        { key: 'amount',      label: 'Số tiền',       value: formatPrice(s.amount) },
        { key: 'startedAt',   label: 'Bắt đầu',      value: new Date(s.startedAt).toLocaleString('vi-VN'), type: 'date' },
        { key: 'expiresAt',   label: 'Hết hạn',      value: new Date(s.expiresAt).toLocaleString('vi-VN'), type: 'date' },
      ];
    }
    if (selectedCandidateSub) {
      const s = selectedCandidateSub;
      return [
        { key: 'candidateName', label: 'Ứng viên',   value: s.candidateName, copyable: true },
        { key: 'planCode',      label: 'Mã gói',      value: s.planCode,      copyable: true },
        { key: 'status',        label: 'Trạng thái', value: statusBadge(s.status), type: 'badge' },
        { key: 'amount',        label: 'Số tiền',     value: formatPrice(s.amount) },
        { key: 'startedAt',     label: 'Bắt đầu',    value: new Date(s.startedAt).toLocaleString('vi-VN'), type: 'date' },
        { key: 'expiresAt',     label: 'Hết hạn',    value: new Date(s.expiresAt).toLocaleString('vi-VN'), type: 'date' },
      ];
    }
    return [];
  };

  const isPlansTab   = activeTab === 'company-plans' || activeTab === 'candidate-plans';
  const isCompanyTab = activeTab === 'company-plans' || activeTab === 'company-subs';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý gói dịch vụ</h1>
          <p className="text-[16px] text-muted-foreground mt-1">Quản lý gói đăng ký cho cả Employer và Candidate</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export buttons cho subscription tabs */}
          {activeTab === 'company-subs' && (
            <>
              <button onClick={handleExportCompanyExcel} disabled={exportingCompany !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
                <FileSpreadsheet className="w-4 h-4" />{exportingCompany === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
              <button onClick={handleExportCompanyPdf} disabled={exportingCompany !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
                <FileText className="w-4 h-4" />{exportingCompany === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
              </button>
            </>
          )}
          {activeTab === 'candidate-subs' && (
            <>
              <button onClick={handleExportCandidateExcel} disabled={exportingCandidate !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
                <FileSpreadsheet className="w-4 h-4" />{exportingCandidate === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
              </button>
              <button onClick={handleExportCandidatePdf} disabled={exportingCandidate !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 text-sm font-medium">
                <FileText className="w-4 h-4" />{exportingCandidate === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
              </button>
            </>
          )}
          {/* Add plan button cho plans tabs */}
          {isPlansTab && (
            <button
              onClick={() => { if (isCompanyTab) { setEditingCompanyPlan(undefined); setCompanyPlanModalOpen(true); } else { setEditingCandidatePlan(undefined); setCandidatePlanModalOpen(true); } }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 text-[16px] font-medium">
              <Plus className="w-4 h-4" />
              {isCompanyTab ? 'Thêm gói Employer' : 'Thêm gói Candidate'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[16px] font-medium rounded-t-lg transition-colors border-b-2 -mb-[2px]
              ${activeTab === tab.key ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Company Plans */}
      {activeTab === 'company-plans' && (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <DataTable data={companyPlans} columns={companyPlanColumns} loading={companyPlansLoading}
            showPagination={false} emptyMessage="Chưa có gói Employer nào" emptyDescription="Hãy thêm gói đăng ký đầu tiên" />
        </div>
      )}

      {/* Candidate Plans */}
      {activeTab === 'candidate-plans' && (
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <DataTable data={candidatePlans} columns={candidatePlanColumns} loading={candidatePlansLoading}
            showPagination={false} emptyMessage="Chưa có gói Candidate nào" emptyDescription="Hãy thêm gói đăng ký đầu tiên" />
        </div>
      )}

      {/* Company Subscriptions */}
      {activeTab === 'company-subs' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng số: <span className="font-semibold text-foreground">{companySubsTotal}</span> đăng ký</span>
          </div>
          <AdminFilter config={{ searchKey: undefined, statusKey: 'status', customFilters: [] }}
            filters={{ status: getFilterValue('status') }} onFilterChange={handleFilterChange}
            onReset={handleResetFilters} statusOptions={subscriptionStatusOptions}
            searchPlaceholder="" statusPlaceholder="Tất cả trạng thái" showDateFilter={false} loading={companySubsLoading} />
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <DataTable data={companySubs} columns={companySubColumns} loading={companySubsLoading}
              selectable showPagination defaultPageSize={20}
              emptyMessage="Không có đăng ký nào" emptyDescription="Chưa có công ty nào đăng ký" />
          </div>
        </>
      )}

      {/* Candidate Subscriptions */}
      {activeTab === 'candidate-subs' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng số: <span className="font-semibold text-foreground">{candidateSubsTotal}</span> đăng ký</span>
          </div>
          <AdminFilter config={{ searchKey: undefined, statusKey: 'status', customFilters: [] }}
            filters={{ status: getFilterValue('status') }} onFilterChange={handleFilterChange}
            onReset={handleResetFilters} statusOptions={subscriptionStatusOptions}
            searchPlaceholder="" statusPlaceholder="Tất cả trạng thái" showDateFilter={false} loading={candidateSubsLoading} />
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <DataTable data={candidateSubs} columns={candidateSubColumns} loading={candidateSubsLoading}
              selectable showPagination defaultPageSize={20}
              emptyMessage="Không có đăng ký nào" emptyDescription="Chưa có ứng viên nào đăng ký" />
          </div>
        </>
      )}

      {/* Modals */}
      {companyPlanModalOpen && (
        <PlanFormModal plan={editingCompanyPlan} onSave={handleSaveCompanyPlan}
          onCancel={() => { setCompanyPlanModalOpen(false); setEditingCompanyPlan(undefined); }} />
      )}
      {candidatePlanModalOpen && (
        <CandidatePlanFormModal plan={editingCandidatePlan} onSave={handleSaveCandidatePlan}
          onCancel={() => { setCandidatePlanModalOpen(false); setEditingCandidatePlan(undefined); }} />
      )}

      <DetailModel isOpen={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedCompanySub(null); setSelectedCandidateSub(null); }}
        title={selectedCompanySub ? `Chi tiết - ${selectedCompanySub.companyName}` : `Chi tiết - ${selectedCandidateSub?.candidateName ?? ''}`}
        fields={getDetailFields()} />

      <ConfirmModel isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message}
        type={confirmModal.type} confirmText="Xác nhận" cancelText="Hủy" />
    </div>
  );
}