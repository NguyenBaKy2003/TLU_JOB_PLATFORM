// src/presentation/components/employer/company/GallerySection.tsx
"use client";
import { useState, useRef } from "react";
import { Image as ImageIcon, Plus, X, Trash2, Move, Upload } from "lucide-react";
import { CompanySectionWrapper } from "./CompanySectionWrapper";
import type { GalleryImage } from "@/domain/models/Company";
import { CompanyService } from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";
import { useToast } from "@/presentation/components/ui/toast";
import Image from "next/image";

const service = new CompanyService(new CompanyRepository());

interface Props {
  companyId: string;
  images: GalleryImage[];
  onUpdate: () => void;
}

export function GallerySection({ companyId, images, onUpdate }: Props) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

const handleUpload = async (file: File, caption?: string) => {
    if (!file.type.startsWith("image/")) {
        toast.error("Sai định dạng", "Chỉ chấp nhận file ảnh");
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn", "Ảnh không được vượt quá 5MB");
        return;
    }

    setUploading(true);
    try {
        await service.addGalleryImage(file, caption); // trả về GalleryImage[] nhưng không cần dùng
        toast.success("Thêm ảnh", "Ảnh đã được thêm vào thư viện");
        onUpdate();
    } catch (error: any) {
        toast.error("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
        setUploading(false);
    }
};

  const handleDelete = async (imageId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    setDeletingId(imageId);
    try {
      await service.deleteGalleryImage(imageId);
      toast.success("Đã xóa", "Ảnh đã được xóa khỏi thư viện");
      onUpdate();
    } catch (error: any) {
      toast.error("Lỗi", error.message || "Không thể xóa ảnh");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <CompanySectionWrapper
      title="Thư viện ảnh"
      icon={<ImageIcon size={16} />}
      actionButton={
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Thêm ảnh
        </button>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          for (const file of files) {
            await handleUpload(file);
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      {sortedImages.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"
        >
          <Upload size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">Chưa có ảnh nào</p>
          <p className="text-xs text-gray-400 mt-1">Nhấp để tải ảnh lên</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedImages.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.caption || "Gallery image"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                    disabled={deletingId === image.id}
                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    {deletingId === image.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-xs text-white truncate">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            * Nhấp vào ảnh để xem chi tiết
          </p>
        </>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.caption || "Gallery image"}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {selectedImage.caption && (
              <p className="text-center text-white mt-4 text-sm">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </CompanySectionWrapper>
  );
}