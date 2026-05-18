"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, Eye, Code2, Loader2, RefreshCw } from "lucide-react";

// ── Types ──

export interface TemplateFormData {
  name: string;
  thumbnailUrl: string;
  category: string;
  premium: boolean;
  htmlContent: string;
  active?: boolean;
}

interface Props {
  data: TemplateFormData;
  onChange: (field: keyof TemplateFormData, value: string | boolean) => void;
  isEdit: boolean;
  error: string | null;
  /** HTML đã render từ backend (preview thật). Nếu undefined → dùng htmlContent thô */
  previewHtml?: string;
  previewLoading?: boolean;
  onRequestPreview?: () => void;
}

// ── Field wrapper ─────────

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[16px] text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40";

// ── HTML Preview pane ─────

function HtmlPreviewPane({
  html,
  loading,
  onRefresh,
}: {
  html: string;
  loading: boolean;
  onRefresh?: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Khi không có previewHtml từ backend → render htmlContent thô trong iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html || "<p style='color:#9ca3af;padding:2rem;font-family:sans-serif'>Chưa có nội dung HTML</p>");
    doc.close();
  }, [html]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Preview
        </span>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              title="Tải lại preview từ backend"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Iframe */}
      <div className="relative bg-gray-100 dark:bg-gray-900" style={{ minHeight: 420 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="Template HTML preview"
          className="h-full w-full border-0"
          style={{ minHeight: 420, display: "block" }}
          sandbox="allow-same-origin"
        />
      </div>

      <p className="border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
        Preview hiển thị HTML thô — Thymeleaf expressions chưa được render.
      </p>
    </div>
  );
}

// ── Main component ────────

export function TemplateFormFields({
  data,
  onChange,
  isEdit,
  error,
  previewHtml,
  previewLoading = false,
  onRequestPreview,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorTab, setEditorTab] = useState<"code" | "preview">("code");

  // Khi chuyển sang tab preview, tự động gọi refresh nếu có handler
  const handleTabSwitch = (tab: "code" | "preview") => {
    setEditorTab(tab);
    if (tab === "preview" && onRequestPreview) {
      onRequestPreview();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange("htmlContent", text);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[16px] text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ── Basic info ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Tên template *">
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Ví dụ: Modern Professional"
              className={INPUT}
              required
            />
          </Field>
        </div>

        <Field label="Danh mục">
          <select
            value={data.category}
            onChange={(e) => onChange("category", e.target.value)}
            className={INPUT}
          >
            <option value="">— Không chọn —</option>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="simple">Simple</option>
          </select>
        </Field>

        <Field label="URL Thumbnail">
          <input
            type="url"
            value={data.thumbnailUrl}
            onChange={(e) => onChange("thumbnailUrl", e.target.value)}
            placeholder="https://..."
            className={INPUT}
          />
        </Field>
      </div>

      {/* ── Toggles ── */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Premium toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={data.premium}
              onChange={(e) => onChange("premium", e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-gray-200 transition peer-checked:bg-amber-500 dark:bg-gray-700" />
            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-[16px] font-medium text-gray-700 dark:text-gray-300">Premium</p>
            <p className="text-[11px] text-gray-400">Yêu cầu subscription</p>
          </div>
        </label>

        {/* Active toggle — chỉ hiện khi edit */}
        {isEdit && (
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={data.active ?? true}
                onChange={(e) => onChange("active", e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-gray-200 transition peer-checked:bg-green-500 dark:bg-gray-700" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="text-[16px] font-medium text-gray-700 dark:text-gray-300">Active</p>
              <p className="text-[11px] text-gray-400">Hiển thị với candidate</p>
            </div>
          </label>
        )}
      </div>

      {/* ── HTML Editor + Preview ── */}
      <div>
        {/* Tab bar + import button */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => handleTabSwitch("code")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                editorTab === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Code2 className="h-3 w-3" />
              HTML
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                editorTab === "preview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          </div>

          {/* Import file */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Upload className="h-3 w-3" />
            Import file .html
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.xhtml"
            className="hidden"
            onChange={handleFileImport}
          />
        </div>

        {/* Code tab */}
        {editorTab === "code" && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
                HTML · XHTML Strict
              </span>
              <span className="text-[10px] text-gray-400">
                {data.htmlContent.length.toLocaleString()} chars
              </span>
            </div>
            <textarea
              value={data.htmlContent}
              onChange={(e) => onChange("htmlContent", e.target.value)}
              rows={20}
              spellCheck={false}
              placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC ...>\n<html xmlns="..." xmlns:th="http://www.thymeleaf.org">\n  <head><title th:text="\${cv.title}">CV</title></head>\n  <body>\n    <h1 th:text="\${personalInfo.fullName}">Tên</h1>\n    ...\n  </body>\n</html>`}
              className="
                block w-full resize-y bg-white px-4 py-3 font-mono text-xs text-gray-800
                outline-none placeholder:text-gray-300 placeholder:font-sans
                dark:bg-gray-900 dark:text-gray-200
                leading-relaxed
              "
              style={{ minHeight: 420, tabSize: 2 }}
            />
          </div>
        )}

        {/* Preview tab */}
        {editorTab === "preview" && (
          <HtmlPreviewPane
            html={previewHtml ?? data.htmlContent}
            loading={previewLoading}
            onRefresh={onRequestPreview}
          />
        )}
      </div>
    </div>
  );
}