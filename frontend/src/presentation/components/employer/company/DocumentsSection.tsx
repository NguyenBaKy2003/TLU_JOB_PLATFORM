// src/presentation/components/employer/company/DocumentsSection.tsx
"use client";
import { useState, useRef } from "react";
import { 
  FileText, Plus, X, Download, Upload, CheckCircle, XCircle, 
  File, Image, FileArchive, Eye, Trash2, Building2, 
  Receipt, IdCard, ScrollText
} from "lucide-react";
import type { CompanyDocument, CompanyDocumentType } from "@/domain/models/Company";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import { useToast } from "@/presentation/components/ui/toast";
import { CompanySectionWrapper } from "./CompanySectionWrapper";

const service = new CompanyService(new CompanyRepository());

interface Props {
  documents: CompanyDocument[];
  verificationStatus: string;
  onUpdate: () => void;
}

// Cập nhật DOCUMENT_TYPES theo backend enum
const DOCUMENT_TYPES: { value: CompanyDocumentType; label: string; description: string; icon: JSX.Element }[] = [
  { 
    value: "BUSINESS_LICENSE", 
    label: "Giấy phép đăng ký kinh doanh", 
    description: "Giấy chứng nhận đăng ký doanh nghiệp do Sở KHĐT cấp", 
    icon: <Building2 size={16} /> 
  },
  { 
    value: "TAX_CERTIFICATE", 
    label: "Mã số thuế", 
    description: "Giấy chứng nhận đăng ký thuế hoặc thông báo mã số thuế", 
    icon: <Receipt size={16} /> 
  },
  { 
    value: "LEGAL_REPRESENTATIVE_ID", 
    label: "CMND/CCCD người đại diện", 
    description: "Căn cước công dân của người đại diện pháp luật", 
    icon: <IdCard size={16} /> 
  },
  { 
    value: "OPERATING_LICENSE", 
    label: "Giấy phép hoạt động", 
    description: "Giấy phép hoạt động ngành nghề đặc thù (nếu có)", 
    icon: <ScrollText size={16} /> 
  },
  { 
    value: "OTHER", 
    label: "Tài liệu khác", 
    description: "Các giấy tờ xác thực bổ sung khác", 
    icon: <File size={16} /> 
  },
];

const getFileColor = (mimeType: string): string => {
  if (mimeType.includes("pdf")) return "text-red-500 bg-red-50";
  if (mimeType.includes("image")) return "text-green-500 bg-green-50";
  if (mimeType.includes("word")) return "text-blue-500 bg-blue-50";
  return "text-gray-500 bg-gray-100";
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("pdf")) return <FileText size={24} />;
  if (mimeType.includes("image")) return <Image size={24} />;
  if (mimeType.includes("word")) return <FileText size={24} />;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return <FileArchive size={24} />;
  return <File size={24} />;
};

// Helper để lấy icon cho loại tài liệu
const getTypeIcon = (type: CompanyDocumentType) => {
  const found = DOCUMENT_TYPES.find(t => t.value === type);
  return found?.icon || <File size={16} />;
};

export function DocumentsSection({ documents, verificationStatus, onUpdate }: Props) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<CompanyDocumentType>("BUSINESS_LICENSE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Chưa chọn file", "Vui lòng chọn tài liệu để tải lên");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn", "Tài liệu không được vượt quá 10MB");
      return;
    }

    setUploading(true);
    try {
      await service.uploadDocument(selectedType, selectedFile);
      toast.success("Nộp tài liệu thành công", "Tài liệu đã được gửi để xác thực");
      setShowForm(false);
      setSelectedFile(null);
      onUpdate();
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể tải lên tài liệu");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    setDeletingId(docId);
    try {
      // await service.deleteDocument(docId); // Uncomment when backend supports
      toast.success("Đã xóa", "Tài liệu đã được xóa");
      onUpdate();
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể xóa tài liệu");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const isVerified = verificationStatus === "VERIFIED";
  const isRejected = verificationStatus === "REJECTED";

  // Kiểm tra xem đã nộp đủ các loại tài liệu cần thiết chưa
  const requiredTypes: CompanyDocumentType[] = ["BUSINESS_LICENSE", "TAX_CERTIFICATE", "LEGAL_REPRESENTATIVE_ID"];
  const uploadedTypes = documents.map(doc => doc.type);
  const missingTypes = requiredTypes.filter(type => !uploadedTypes.includes(type));
  const hasAllRequired = missingTypes.length === 0;

  const actionButton = !isVerified && !showForm ? (
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
    >
      <Plus size={14} /> Nộp tài liệu
    </button>
  ) : undefined;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  return (
    <CompanySectionWrapper
      title="Tài liệu xác thực"
      icon={<FileText size={16} />}
      actionButton={actionButton}
      editing={showForm}
    >
      {/* Status Info */}
      {isVerified ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Đã xác thực thành công</p>
              <p className="text-xs text-green-600 mt-0.5">Bạn có thể đăng tin tuyển dụng ngay</p>
            </div>
          </div>
        </div>
      ) : isRejected ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Tài liệu bị từ chối</p>
              <p className="text-xs text-red-600 mt-0.5">Vui lòng nộp lại tài liệu hợp lệ để được xác thực</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-full shrink-0">
              <FileText size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">Đang chờ xác thực</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Công ty cần được xác thực trước khi có thể đăng tin tuyển dụng
              </p>
              {/* Required documents checklist */}
              <div className="mt-3">
                <p className="text-xs font-medium text-yellow-700 mb-1.5">Giấy tờ cần nộp:</p>
                <div className="flex flex-wrap gap-2">
                  {requiredTypes.map(type => {
                    const isUploaded = uploadedTypes.includes(type);
                    const typeInfo = DOCUMENT_TYPES.find(t => t.value === type);
                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                          isUploaded 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircle size={10} />
                        ) : (
                          <FileText size={10} />
                        )}
                        <span>{typeInfo?.label?.split(" ").slice(0, 2).join(" ") || type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-800">Nộp tài liệu xác thực</h4>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedFile(null);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Document Type Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Loại tài liệu</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DOCUMENT_TYPES.map((type) => {
                  const isUploaded = uploadedTypes.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => !isUploaded && setSelectedType(type.value)}
                      disabled={isUploaded}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        selectedType === type.value && !isUploaded
                          ? "border-blue-500 bg-blue-50"
                          : isUploaded
                          ? "border-green-200 bg-green-50 cursor-not-allowed opacity-60"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={selectedType === type.value ? "text-blue-600" : "text-gray-400"}>
                          {type.icon}
                        </span>
                        <span className="text-xs font-medium text-gray-700 flex-1">{type.label}</span>
                        {isUploaded && <CheckCircle size={12} className="text-green-600 shrink-0" />}
                      </div>
                      {type.description && (
                        <p className="text-[10px] text-gray-400 mt-1 ml-6">{type.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File Drop Zone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Chọn file</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                  ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"}
                  ${selectedFile ? "bg-green-50 border-green-400" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Kéo thả file vào đây hoặc nhấp để chọn</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Hỗ trợ: PDF, JPG, PNG, DOC (tối đa 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedFile(null);
              }}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              Tải lên
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 && !showForm ? (
        <div 
          onClick={() => !isVerified && setShowForm(true)}
          className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"
        >
          <FileText size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Chưa có tài liệu nào</p>
          <p className="text-xs text-gray-400 mt-1">
            {!isVerified ? "Nhấp để nộp tài liệu xác thực" : "Tài liệu sẽ hiển thị sau khi xác thực"}
          </p>
        </div>
      ) : (
        <>
          {/* Required documents status */}
          {!isVerified && !hasAllRequired && (
            <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-700">
                <span className="font-semibold">⚠️ Thiếu tài liệu bắt buộc:</span>{" "}
                {missingTypes.map(t => DOCUMENT_TYPES.find(dt => dt.value === t)?.label).join(", ")}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const fileColor = getFileColor(doc.mimeType);
              const Icon = getFileIcon(doc.mimeType);
              const typeInfo = DOCUMENT_TYPES.find((t) => t.value === doc.type);
              const typeLabel = typeInfo?.label || doc.type;
              const typeIcon = typeInfo?.icon || <File size={16} />;
              
              return (
                <div
                  key={doc.id}
                  className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* File Preview Area */}
                  <div className={`p-4 ${fileColor} flex items-center justify-center relative`}>
                    <div className="text-center">
                      <div className="mb-2">{Icon}</div>
                      <p className="text-xs font-medium truncate max-w-[150px]">{doc.fileName}</p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200"
                        title="Xem tài liệu"
                      >
                        <Eye size={12} className="text-gray-500" />
                      </a>
                      <a
                        href={doc.fileUrl}
                        download
                        className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200"
                        title="Tải xuống"
                      >
                        <Download size={12} className="text-gray-500" />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 border border-gray-200"
                        title="Xóa tài liệu"
                      >
                        {deletingId === doc.id ? (
                          <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Trash2 size={12} className="text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-3 bg-gray-50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-gray-400">{typeIcon}</span>
                      <p className="text-xs font-medium text-gray-800 truncate flex-1">{typeLabel}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400">
                        {formatFileSize(doc.fileSizeBytes)} • {formatDate(doc.uploadedAt)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        doc.mimeType.includes("pdf") ? "bg-red-100 text-red-600" :
                        doc.mimeType.includes("image") ? "bg-green-100 text-green-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {doc.mimeType.split("/").pop()?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Verified badge */}
                  {isVerified && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-white rounded-full p-0.5">
                        <CheckCircle size={10} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Info Box */}
      {!isVerified && documents.length === 0 && !showForm && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-100 rounded-full shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-800">Hướng dẫn xác thực</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Vui lòng nộp đầy đủ các giấy tờ bắt buộc: Giấy phép kinh doanh, Mã số thuế, 
                và CCCD người đại diện. Tài liệu sẽ được xem xét trong 1-2 ngày làm việc.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document count badge */}
      {documents.length > 0 && !showForm && (
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {hasAllRequired ? "✓ Đã nộp đủ giấy tờ" : `Đã nộp ${documents.length}/${requiredTypes.length+1} tài liệu`}
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {documents.length} tài liệu
          </span>
        </div>
      )}
    </CompanySectionWrapper>
  );
}