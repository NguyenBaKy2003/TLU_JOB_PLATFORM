"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CvService } from "@/application/services/CvService";
import { CvRepository } from "@/infrastructure/repositories/CvRepository";
import type { OnlineCV, CVTemplate } from "@/domain/models/Cv";
import { CVPageSkeleton } from "@/presentation/components/cv/CVPageSkeleton";
import { CVPageHeader } from "@/presentation/components/cv/CVPageHeader";
import { CVEmptyState } from "@/presentation/components/cv/CVEmptyState";
import { CVGrid } from "@/presentation/components/cv/CVGrid";
import { CreateCVModal } from "@/presentation/components/cv/CreateCVModal";
import { useAuth } from "@/application/contexts/AuthContext";
import { CVAuthRequired } from "@/presentation/components/cv/CVAuthRequired";
import { useToast } from "@/presentation/components/ui/toast";
import { extractErrorMessage } from "@/lib/extractErrorMessage";

const cvService = new CvService(new CvRepository());

export default function CVPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();

  const [cvs, setCvs] = useState<OnlineCV[]>([]);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "CANDIDATE") {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [cvList, tplList] = await Promise.all([
          cvService.listMyCVs(),
          cvService.listTemplates(),
        ]);
        setCvs(cvList);
        setTemplates(tplList);
      } catch (err) {
        toastError("Tải dữ liệu thất bại", extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, isAuthenticated, user?.role]);

  if (authLoading) return <CVPageSkeleton />;

  if (!isAuthenticated || user?.role !== "CANDIDATE") {
    return (
      <CVAuthRequired
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
      />
    );
  }

  if (loading) return <CVPageSkeleton />;

  const handleCreate = async (title: string, templateId: string) => {
    setCreating(true);
    try {
      const newCv = await cvService.createFromForm({ title, templateId });
      setCvs((prev) => [newCv, ...prev]);
      setShowCreateModal(false);
      success("Tạo CV thành công", `CV "${title}" đã được tạo.`);
    } catch (err) {
      toastError("Tạo CV thất bại", extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (cvId: string) => {
    try {
      const duplicated = await cvService.duplicate(cvId);
      setCvs((prev) => [duplicated, ...prev]);
      success("Sao chép thành công", "CV đã được nhân bản.");
    } catch (err) {
      toastError("Sao chép thất bại", extractErrorMessage(err));
    }
  };

  const handleDelete = async (cvId: string) => {
    try {
      await cvService.delete(cvId);
      setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
      success("Đã xóa CV", "CV đã được xóa khỏi danh sách.");
    } catch (err) {
      toastError("Xóa thất bại", extractErrorMessage(err));
    }
  };

  const handlePublish = async (cvId: string) => {
    try {
      const updated = await cvService.publish(cvId);
      setCvs((prev) => prev.map((cv) => (cv.id === cvId ? updated : cv)));
      success("Đã công khai CV", "CV của bạn hiện đã được công khai.");
    } catch (err) {
      toastError("Công khai thất bại", extractErrorMessage(err));
    }
  };

  const handleArchive = async (cvId: string) => {
    try {
      const updated = await cvService.archive(cvId);
      setCvs((prev) => prev.map((cv) => (cv.id === cvId ? updated : cv)));
      success("Đã lưu trữ CV", "CV đã được chuyển vào lưu trữ.");
    } catch (err) {
      toastError("Lưu trữ thất bại", extractErrorMessage(err));
    }
  };

  const handleRestore = async (cvId: string) => {
    try {
      const updated = await cvService.restore(cvId);
      setCvs((prev) => prev.map((cv) => (cv.id === cvId ? updated : cv)));
      success("Đã khôi phục CV", "CV đã được khôi phục thành công.");
    } catch (err) {
      toastError("Khôi phục thất bại", extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#DFEAFE] flex flex-col w-full">
      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 flex flex-col">
        <CVPageHeader
          count={cvs.length}
          onCreateClick={() => setShowCreateModal(true)}
        />
      <div className="flex-1 flex flex-col items-center justify-center"></div>
        {cvs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
                <CVEmptyState onCreateClick={() => setShowCreateModal(true)} />
            </div>
        ) : (
          <CVGrid
            cvs={cvs}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onArchive={handleArchive}
            onRestore={handleRestore}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateCVModal
          templates={templates}
          creating={creating}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}