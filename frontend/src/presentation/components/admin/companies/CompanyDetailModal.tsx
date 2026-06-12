// src/presentation/components/admin/companies/CompanyDetailModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  Briefcase,
  Calendar,
  Clock,
  Shield,
  FileText,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Linkedin,
  BadgeCheck,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { AdminCompany } from "@/domain/models/AdminCompany";
import { AdminCompanyService } from "@/application/services/AdminCompanyService";
import { AdminCompanyRepository } from "@/infrastructure/repositories/AdminCompanyRepository";
import { extractErrorMessage } from "@/lib/extractErrorMessage";
import { useToast } from "@/presentation/components/ui/toast";
import { TfiEmail } from "react-icons/tfi";

// Status config
const statusConfig = {
  UNVERIFIED: {
    label: "Chưa xác thực",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  VERIFIED: {
    label: "Đã xác thực",
    color: "bg-green-100 text-green-800",
    icon: <BadgeCheck className="w-4 h-4" />,
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
  SUSPENDED: {
    label: "Đã khóa",
    color: "bg-gray-100 text-gray-800",
    icon: <AlertCircle className="w-4 h-4" />,
  },
} as const;

interface CompanyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function CompanyDetailModal({
  isOpen,
  onClose,
  companyId,
}: CompanyDetailModalProps) {
  const toast = useToast();
  const service = new AdminCompanyService(new AdminCompanyRepository());

  const [company, setCompany] = useState<AdminCompany | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "info" | "team" | "gallery" | "documents"
  >("info");
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyDetail();
    }
  }, [isOpen, companyId]);

  const fetchCompanyDetail = async () => {
    try {
      setLoading(true);
      const detail = await service.getCompany(companyId);
      setCompany(detail);
    } catch (error) {
      console.error("Failed to fetch company detail:", error);
      const message = extractErrorMessage(
        error,
        "Không thể tải chi tiết công ty"
      );
      toast.error("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : company ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Company Logo */}
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {company.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig[company.verificationStatus].color
                          }`}
                        >
                          {
                            statusConfig[company.verificationStatus].icon
                          }
                          {
                            statusConfig[company.verificationStatus]
                              .label
                          }
                        </span>
                        {company.industry && (
                          <span className="text-[16px] text-gray-500">
                            {company.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  {[
                    { key: "info", label: "Thông tin" },
                    { key: "team", label: "Đội ngũ" },
                    { key: "gallery", label: "Thư viện ảnh" },
                    { key: "documents", label: "Tài liệu" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 px-4 py-2 text-[16px] font-medium rounded-lg transition-colors ${
                        activeTab === tab.key
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {tab.key === "team" &&
                        company.teamMembers &&
                        company.teamMembers.length > 0 && (
                          <span className="ml-1 text-xs">
                            ({company.teamMembers.length})
                          </span>
                        )}
                      {tab.key === "gallery" &&
                        company.gallery &&
                        company.gallery.length > 0 && (
                          <span className="ml-1 text-xs">
                            ({company.gallery.length})
                          </span>
                        )}
                      {tab.key === "documents" &&
                        company.documents &&
                        company.documents.length > 0 && (
                          <span className="ml-1 text-xs">
                            ({company.documents.length})
                          </span>
                        )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-6 py-6 max-h-[calc(90vh-200px)]">
                {activeTab === "info" && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Thông tin cơ bản
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {company.email && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Email</div>
                              <div className="text-[16px] font-medium">
                                {company.email}
                              </div>
                            </div>
                          </div>
                        )}

                        {company.website && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Website
                              </div>
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[16px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {company.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        {company.phone && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Điện thoại
                              </div>
                              <div className="text-[16px] font-medium">
                                {company.phone}
                              </div>
                            </div>
                          </div>
                        )}

                        {(company.city || company.country) && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Địa điểm
                              </div>
                              <div className="text-[16px] font-medium">
                                {[company.city, company.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </div>
                          </div>
                        )}

                        {company.size && company.size !== "UNKNOWN" && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Quy mô
                              </div>
                              <div className="text-[16px] font-medium">
                                {company.sizeLabel || company.size}
                              </div>
                            </div>
                          </div>
                        )}

                        {company.industry && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Ngành nghề
                              </div>
                              <div className="text-[16px] font-medium">
                                {company.industry}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {company.description && (
                      <div>
                        <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-3">
                          Giới thiệu
                        </h3>
                        <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          {company.description}
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {company.address && (
                      <div>
                        <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-3">
                          Địa chỉ
                        </h3>
                        <div className="flex items-start gap-2 text-[16px] text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                          {company.address}
                        </div>
                      </div>
                    )}

                    {/* Verification Info */}
                    <div>
                      <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Thông tin xác thực
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[16px] text-gray-600 dark:text-gray-400">
                            Trạng thái
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusConfig[company.verificationStatus].color
                            }`}
                          >
                            {
                              statusConfig[company.verificationStatus]
                                .icon
                            }
                            {
                              statusConfig[company.verificationStatus]
                                .label
                            }
                          </span>
                        </div>

                        {company.verifiedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-[16px] text-gray-600 dark:text-gray-400">
                              Ngày xác thực
                            </span>
                            <span className="text-[16px] font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                company.verifiedAt
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[16px] text-gray-600 dark:text-gray-400">
                            Có thể đăng bài
                          </span>
                          <span
                            className={`text-[16px] font-medium ${
                              company.canPostJobs
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {company.canPostJobs
                              ? "Được phép"
                              : "Không được phép"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[16px] text-gray-600 dark:text-gray-400">
                            Ngày tạo
                          </span>
                          <span className="text-[16px] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              company.createdAt
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "team" && (
                  <div>
                    {company.teamMembers && company.teamMembers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {company.teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                          >
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.fullName}
                                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {member.fullName}
                              </h4>
                              {member.jobTitle && (
                                <p className="text-[16px] text-gray-500 mt-0.5">
                                  {member.jobTitle}
                                </p>
                              )}
                              {member.bio && (
                                <p className="text-[16px] text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                  {member.bio}
                                </p>
                              )}
                              {member.linkedinUrl && (
                                <a
                                  href={member.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
                                >
                                  <TfiEmail className="w-3 h-3" />
                                  Email
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-[16px]">
                          Chưa có thông tin thành viên
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "gallery" && (
                  <div>
                    {company.gallery && company.gallery.length > 0 ? (
                      <div className="space-y-4">
                        {/* Main image */}
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                          <img
                            src={
                              company.gallery[galleryIndex].imageUrl
                            }
                            alt={`Gallery ${galleryIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {company.gallery.length > 1 && (
                            <>
                              <button
                                onClick={() =>
                                  setGalleryIndex((prev) =>
                                    prev === 0
                                      ? company.gallery!.length - 1
                                      : prev - 1
                                  )
                                }
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  setGalleryIndex((prev) =>
                                    prev ===
                                    company.gallery!.length - 1
                                      ? 0
                                      : prev + 1
                                  )
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                            {galleryIndex + 1} /{" "}
                            {company.gallery.length}
                          </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-2">
                          {company.gallery.map((item, index) => (
                            <button
                              key={item.id}
                              onClick={() => setGalleryIndex(index)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                index === galleryIndex
                                  ? "border-blue-500"
                                  : "border-transparent hover:border-gray-300"
                              }`}
                            >
                              <img
                                src={item.imageUrl}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-[16px]">
                          Chưa có hình ảnh thư viện
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div>
                    {company.documents &&
                    company.documents.length > 0 ? (
                      <div className="space-y-3">
                        {company.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-600" />
                              <div>
                                <p className="font-medium text-[16px]">
                                  {doc.fileName}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  <span>
                                    {doc.type
                                      .replace(/_/g, " ")
                                      .toLowerCase()
                                      .replace(
                                        /\b\w/g,
                                        (l) => l.toUpperCase()
                                      )}
                                  </span>
                                  <span>
                                    {(
                                      doc.fileSizeBytes / 1024
                                    ).toFixed(1)}{" "}
                                    KB
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(
                                      doc.uploadedAt
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleDownload(
                                  doc.fileUrl,
                                  doc.fileName
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Tải xuống
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-[16px]">
                          Chưa có tài liệu
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3" />
              <p className="text-[16px]">Không tìm thấy thông tin công ty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}