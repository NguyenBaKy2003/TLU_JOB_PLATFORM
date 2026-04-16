import { X, Globe, Building2, MapPin, CheckCircle, XCircle, Lock, Unlock } from "lucide-react";
import { CompanyStatusBadge } from "./CompanyStatusBadge";
import type { AdminCompany } from "@/domain/models/AdminCompany";

interface Props {
  company:     AdminCompany;
  actionLoading: boolean;
  onClose:     () => void;
  onApprove:   (company: AdminCompany) => void;
  onReject:    (company: AdminCompany) => void;
  onSuspend:   (company: AdminCompany) => void;
  onUnsuspend: (company: AdminCompany) => void;
}

export function CompanyDetailModal({
  company, actionLoading, onClose, onApprove, onReject, onSuspend, onUnsuspend,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg
        flex flex-col max-h-[90vh] overflow-hidden
        animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-10 h-10 rounded-xl object-cover border border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200
              flex items-center justify-center">
              <Building2 size={18} className="text-blue-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{company.name}</h2>
            <p className="text-xs text-gray-400">{company.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center
              text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Trạng thái:</span>
            <CompanyStatusBadge status={company.verificationStatus} />
          </div>

          {/* Rejection reason */}
          {company.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-red-600 mb-1">Lý do từ chối / khoá</p>
              <p className="text-sm text-red-700">{company.rejectionReason}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Ngành nghề"   value={company.industry ?? "—"} />
            <InfoItem label="Thành phố"    value={company.city ?? "—"}     icon={<MapPin size={12} />} />
            <InfoItem label="Ngày tạo"
              value={new Date(company.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
              })}
            />
            {company.updatedAt && (
              <InfoItem label="Cập nhật lần cuối"
                value={new Date(company.updatedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                })}
              />
            )}
          </div>

          {/* Website */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Globe size={14} />
              {company.website}
            </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 flex-wrap">
          {(company.verificationStatus === "PENDING" || company.verificationStatus === "REJECTED") && (
            <ActionButton
              onClick={() => onApprove(company)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={<CheckCircle size={14} />}
            >
              Duyệt
            </ActionButton>
          )}

          {company.verificationStatus === "PENDING" && (
            <ActionButton
              onClick={() => onReject(company)}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 text-white"
              icon={<XCircle size={14} />}
            >
              Từ chối
            </ActionButton>
          )}

          {company.verificationStatus === "APPROVED" && (
            <ActionButton
              onClick={() => onSuspend(company)}
              disabled={actionLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              icon={<Lock size={14} />}
            >
              Khoá
            </ActionButton>
          )}

          {company.verificationStatus === "SUSPENDED" && (
            <ActionButton
              onClick={() => onUnsuspend(company)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={<Unlock size={14} />}
            >
              Mở khoá
            </ActionButton>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-medium
              text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3.5 py-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
        {icon}{value}
      </p>
    </div>
  );
}

function ActionButton({
  children, onClick, disabled, className, icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon}{children}
    </button>
  );
}