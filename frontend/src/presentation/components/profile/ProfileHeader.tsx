"use client";

import React from "react";
import { Camera, FileText, Download } from "lucide-react";
import { UserProfile } from "@/types/profile";

interface ProfileHeaderProps {
  user: UserProfile;
  onViewCV?: () => void;
  onDownloadPDF?: () => void;
  onAvatarChange?: (file: File) => void;
}

export function ProfileHeader({
  user,
  onViewCV,
  onDownloadPDF,
  onAvatarChange,
}: ProfileHeaderProps) {
  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onAvatarChange) onAvatarChange(file);
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            onClick={handleAvatarClick}
            className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all group overflow-hidden"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Camera size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-[9px] text-gray-400 group-hover:text-blue-400 transition-colors text-center leading-tight px-1">
                  Tải ảnh
                </span>
              </div>
            )}
          </div>
          {user.avatar && (
            <button
              onClick={handleAvatarClick}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
            >
              <Camera size={11} className="text-white" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {user.jobTitle && (
              <span className="text-sm text-gray-500 font-medium">{user.jobTitle}</span>
            )}
            {user.jobTitle && user.university && (
              <span className="text-gray-300">•</span>
            )}
            {user.university && (
              <span className="text-sm text-gray-500">{user.university}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onViewCV}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText size={13} />
              Xem CV
            </button>
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={13} />
              Tải xuống bản PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}