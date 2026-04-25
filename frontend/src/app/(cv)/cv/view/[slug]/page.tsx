"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Check, Share2, Printer } from "lucide-react";
import { CvService } from "@/application/services/CvService";
import { CvRepository } from "@/infrastructure/repositories/CvRepository";
import { CVPublicViewSkeleton } from "@/presentation/components/cv/view/CVPublicViewSkeleton";
import { CVPublicNotFound } from "@/presentation/components/cv/view/CVPublicNotFound";

const cvService = new CvService(new CvRepository());

function ActionBar({ onPrint }: { onPrint: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="no-print sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-end gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
            text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {copied
            ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Đã sao chép</>
            : <><Share2 className="w-3.5 h-3.5" /> Chia sẻ</>}
        </button>

        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
            bg-[#3D5A80] hover:bg-[#2E4565] text-white rounded-lg transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          In CV
        </button>
      </div>
    </div>
  );
}

export default function CVPublicViewPage() {
  const { slug }  = useParams<{ slug: string }>();
  const [html, setHtml]         = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(1000);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!slug) return;
    cvService.getPublicHtml(slug)
      .then((data) => {
        if (!data) setNotFound(true);
        else setHtml(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    setIframeHeight(iframe.contentDocument.body.scrollHeight + 32);
  };

  // ← Print bên trong iframe, không dính header ngoài
  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  if (loading)           return <CVPublicViewSkeleton />;
  if (notFound || !html) return <CVPublicNotFound />;

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          body { padding: 40px 48px; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `;

  return (
    <>
      <style>{`
        .no-print { }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#F0EEE9]">
        <ActionBar onPrint={handlePrint} />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <iframe
            ref={iframeRef}
            srcDoc={wrappedHtml}
            onLoad={handleIframeLoad}
            style={{ height: iframeHeight }}
            className="w-full bg-white rounded-2xl shadow-sm border-0"
            title="CV Preview"
          />
        </div>

        <div className="no-print max-w-4xl mx-auto px-4 pb-8">
          <p className="text-center text-[11px] text-gray-400 mt-2">
            CV được tạo tại TLU Job Platform
          </p>
        </div>
      </div>
    </>
  );
}