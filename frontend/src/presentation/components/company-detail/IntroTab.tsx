// src/presentation/components/company-detail/IntroTab.tsx
"use client";
import { useState } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { CompanyProfile } from "@/domain/models/Company";
import Image from "next/image";

interface Props {
  company: CompanyProfile;
}

export function IntroTab({ company }: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const galleryImages = company.gallery || [];

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  const nextImage = () => {
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
    }
  };
  const prevImage = () => {
    if (selectedImageIndex !== null && galleryImages.length > 0) {
      setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h2>
        <div className="text-[16px] text-gray-700 leading-relaxed space-y-3">
          {company.description ? (
            company.description.split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))
          ) : (
            <p className="text-gray-400 italic">Chưa có mô tả</p>
          )}
        </div>
      </section>

      {galleryImages.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thư viện ảnh</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-video rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.caption || `Hình ảnh ${idx + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs text-white truncate">{img.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10">
            <X size={24} />
          </button>
          
          {galleryImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft size={32} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight size={32} />
              </button>
            </>
          )}
          
          <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryImages[selectedImageIndex].imageUrl}
              alt={galleryImages[selectedImageIndex].caption || "Gallery image"}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {galleryImages[selectedImageIndex].caption && (
              <p className="text-center text-white/80 mt-4 text-[16px]">{galleryImages[selectedImageIndex].caption}</p>
            )}
            <p className="text-center text-white/50 text-xs mt-2">{selectedImageIndex + 1} / {galleryImages.length}</p>
          </div>
        </div>
      )}

      {galleryImages.length === 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thư viện ảnh</h2>
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <ImageIcon size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-[16px] text-gray-400">Chưa có ảnh nào</p>
          </div>
        </section>
      )}
    </div>
  );
}