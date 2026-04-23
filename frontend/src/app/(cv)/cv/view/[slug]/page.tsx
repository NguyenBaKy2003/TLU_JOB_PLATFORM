"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { OnlineCVDetail } from "@/domain/models/Cv";
import api from "@/lib/axios";
import { CVPublicViewSkeleton } from "@/presentation/components/cv/view/CVPublicViewSkeleton";
import { CVPublicNotFound } from "@/presentation/components/cv/view/CVPublicNotFound";
import { CVPublicRenderer } from "@/presentation/components/cv/view/CVPublicRenderer";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

async function getCVBySlug(slug: string): Promise<OnlineCVDetail | null> {
  try {
    const res = await api.get<ApiResponse<OnlineCVDetail>>(`/public/cv/${slug}`);
    return res.data.data;
  } catch {
    return null;
  }
}

export default function CVPublicViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [cv, setCv] = useState<OnlineCVDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getCVBySlug(slug).then((data) => {
      if (!data) setNotFound(true);
      else setCv(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <CVPublicViewSkeleton />;
  if (notFound || !cv) return <CVPublicNotFound />;

  return <CVPublicRenderer cv={cv} />;
}