import { Eye, CheckCircle, XCircle, Lock, Unlock, Building2 } from "lucide-react";
import { CompanyStatusBadge } from "./CompanyStatusBadge";
import type { AdminCompany } from "@/domain/models/AdminCompany";

interface Props {
  companies:    AdminCompany[];
  loadingId:    string | null;
  onView:       (company: AdminCompany) => void;
  onApprove:    (company: AdminCompany) => void;
  onReject:     (company: AdminCompany) => void;
  onSuspend:    (company: AdminCompany) => void;
  onUnsuspend:  (company: AdminCompany) => void;
}

function Avatar({ company }: { company: AdminCompany }) {
  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={company.name}
        className="w-8 h-8 rounded-xl object-cover border border-gray-100"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200
      flex items-center justify-center">
      <Building2 size={14} className="text-blue-500" />
    </div>
  );
}

export function CompanyTable({
  companies, loadingId, onView, onApprove, onReject, onSuspend, onUnsuspend,
}: Props) {
  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
        flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <Building2 size={40} className="text-gray-200" />
        <p className="text-[16px]">Không có công ty nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[16px]">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/60">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Công ty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngành</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Thành phố</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Ngày tạo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.map(company => {
              const isLoading = loadingId === company.id;
              return (
                <tr key={company.id}
                  className="hover:bg-gray-50/50 transition-colors group">

                  {/* Company info */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar company={company} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">
                          {company.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {company.industry ?? "—"}
                  </td>

                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {company.city ?? "—"}
                  </td>

                  <td className="px-4 py-3.5">
                    <CompanyStatusBadge status={company.verificationStatus} />
                  </td>

                  <td className="px-4 py-3.5 text-gray-400 text-xs">
                    {new Date(company.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <ActionBtn
                        title="Xem chi tiết"
                        onClick={() => onView(company)}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        disabled={isLoading}
                      >
                        <Eye size={14} />
                      </ActionBtn>

                      {/* Approve — chỉ hiện khi PENDING hoặc REJECTED */}
                      {(company.verificationStatus === "UNVERIFIED" || company.verificationStatus === "REJECTED") && (
                        <ActionBtn
                          title="Duyệt"
                          onClick={() => onApprove(company)}
                          className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <CheckCircle size={14} />
                        </ActionBtn>
                      )}

                      {/* Reject — chỉ hiện khi PENDING */}
                      {company.verificationStatus === "UNVERIFIED" && (
                        <ActionBtn
                          title="Từ chối"
                          onClick={() => onReject(company)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                          disabled={isLoading}
                        >
                          <XCircle size={14} />
                        </ActionBtn>
                      )}

                      {/* Suspend / Unsuspend */}
                      {company.verificationStatus === "VERIFIED" && (
                        <ActionBtn
                          title="Khoá công ty"
                          onClick={() => onSuspend(company)}
                          className="text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                          disabled={isLoading}
                        >
                          <Lock size={14} />
                        </ActionBtn>
                      )}
                      {company.verificationStatus === "SUSPENDED" && (
                        <ActionBtn
                          title="Mở khoá"
                          onClick={() => onUnsuspend(company)}
                          className="text-gray-400 hover:text-green-600 hover:bg-green-50"
                          disabled={isLoading}
                        >
                          <Unlock size={14} />
                        </ActionBtn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({
  children, title, onClick, className, disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  className: string;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg flex items-center justify-center
        transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}