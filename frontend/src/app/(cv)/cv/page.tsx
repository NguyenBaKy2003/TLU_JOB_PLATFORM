// src/app/(cv)/cv/page.tsx
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

const cvService = new CvService(new CvRepository());

export default function CVPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(); // Hook auth của bạn
  
  const [cvs, setCvs] = useState<OnlineCV[]>([]);
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load data chỉ khi có quyền
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
        console.error("Failed to load CVs", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, isAuthenticated, user?.role]);

  // Nếu đang check auth
  if (authLoading) return <CVPageSkeleton />;

  // Nếu chưa đăng nhập hoặc không phải CANDIDATE
  if (!isAuthenticated || user?.role !== "CANDIDATE") {
    return <CVAuthRequired isAuthenticated={isAuthenticated} 
      userRole={user?.role}  />;
  }

  // Nếu đang load data
  if (loading) return <CVPageSkeleton />;

  const handleCreate = async (title: string, templateId: string) => {
    setCreating(true);
    try {
      const newCv = await cvService.createFromForm({ title, templateId });
      setCvs((prev) => [newCv, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create CV", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (cvId: string) => {
    try {
      const duplicated = await cvService.duplicate(cvId);
      setCvs((prev) => [duplicated, ...prev]);
    } catch (err) {
      console.error("Failed to duplicate CV", err);
    }
  };

  const handleDelete = async (cvId: string) => {
    try {
      await cvService.delete(cvId);
      setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
    } catch (err) {
      console.error("Failed to delete CV", err);
    }
  };

  const handlePublish = async (cvId: string) => {
    try {
      const updated = await cvService.publish(cvId);
      setCvs((prev) => prev.map((cv) => (cv.id === cvId ? updated : cv)));
    } catch (err) {
      console.error("Failed to publish CV", err);
    }
  };

  const handleArchive = async (cvId: string) => {
    try {
      const updated = await cvService.archive(cvId);
      setCvs((prev) => prev.map((cv) => (cv.id === cvId ? updated : cv)));
    } catch (err) {
      console.error("Failed to archive CV", err);
    }
  };

  const handleRestore = async (cvId: string) => {
    try {
      const updated = await cvService.restore(cvId);
      setCvs((prev) => prev.map((cv) => (cv.id === cvId ? updated : cv)));
    } catch (err) {
      console.error("Failed to restore CV", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <CVPageHeader
          count={cvs.length}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {cvs.length === 0 ? (
          <CVEmptyState onCreateClick={() => setShowCreateModal(true)} />
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