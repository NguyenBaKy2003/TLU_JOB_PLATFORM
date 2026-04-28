// src/presentation/components/employer/company/TeamMembersSection.tsx
"use client";
import { useState, useEffect } from "react";
import { Users, Plus, X, Check, Pencil, Trash2, Linkedin, Upload } from "lucide-react";
import { CompanySectionWrapper } from "./CompanySectionWrapper";
import type { TeamMember } from "@/domain/models/Company";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import { useToast } from "@/presentation/components/ui/toast";
import Image from "next/image";

const service = new CompanyService(new CompanyRepository());

interface Props {
  companyId: string;
  members: TeamMember[];
  onUpdate: () => void;
}

interface MemberFormData {
  fullName: string;
  jobTitle: string;
  bio: string;
  linkedinUrl: string;
  displayOrder: number;
}

const emptyForm: MemberFormData = {
  fullName: "",
  jobTitle: "",
  bio: "",
  linkedinUrl: "",
  displayOrder: 0,
};

export function TeamMembersSection({ companyId, members, onUpdate }: Props) {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.jobTitle.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập họ tên và chức vụ");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await service.updateTeamMember(editingId, {
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          bio: formData.bio || undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
          displayOrder: formData.displayOrder,
        });
        toast.success("Cập nhật thành công", "Thông tin thành viên đã được cập nhật");
      } else {
        await service.addTeamMember(formData);
        toast.success("Thêm thành viên", "Đã thêm thành viên mới vào đội ngũ");
      }
      onUpdate();
      resetForm();
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể lưu thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      fullName: member.fullName,
      jobTitle: member.jobTitle,
      bio: member.bio || "",
      linkedinUrl: member.linkedinUrl || "",
      displayOrder: member.displayOrder,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành viên này?")) return;
    try {
      await service.deleteTeamMember(memberId);
      toast.success("Đã xóa", "Thành viên đã được xóa khỏi đội ngũ");
      onUpdate();
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể xóa thành viên");
    }
  };

  const handleAvatarUpload = async (memberId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Sai định dạng", "Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File quá lớn", "Ảnh không được vượt quá 2MB");
      return;
    }

    setUploadingAvatar(memberId);
    try {
      await service.uploadTeamMemberAvatar(memberId, file);
      toast.success("Cập nhật ảnh", "Ảnh đại diện đã được cập nhật");
      onUpdate();
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setUploadingAvatar(null);
    }
  };

  const sortedMembers = [...members].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <CompanySectionWrapper
      title="Đội ngũ lãnh đạo"
      icon={<Users size={16} />}
      onEdit={() => setShowForm(true)}
      editing={showForm}
      actionButton={
        !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus size={14} /> Thêm thành viên
          </button>
        )
      }
    >
      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Chức vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="CEO, Giám đốc Nhân sự, ..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Giới thiệu</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                placeholder="Kinh nghiệm, thành tựu nổi bật..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="0"
                min={0}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={resetForm}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={14} /> Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
              {editingId ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      {sortedMembers.length === 0 && !showForm ? (
        <div className="text-center py-8 text-gray-400">
          <Users size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có thành viên nào trong đội ngũ</p>
          <p className="text-xs mt-1">Hãy thêm thành viên để giới thiệu về đội ngũ lãnh đạo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMembers.map((member) => (
            <div key={member.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group relative">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.fullName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-blue-600">
                      {member.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm cursor-pointer hover:bg-gray-50 border border-gray-200">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(member.id, file);
                    }}
                  />
                  {uploadingAvatar === member.id ? (
                    <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Upload size={12} className="text-gray-500" />
                  )}
                </label>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 truncate">{member.fullName}</h4>
                <p className="text-xs text-blue-600 mt-0.5">{member.jobTitle}</p>
                {member.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{member.bio}</p>}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 mt-1.5"
                  >
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200"
                >
                  <Pencil size={12} className="text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 border border-gray-200"
                >
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CompanySectionWrapper>
  );
}