// src/presentation/components/admin/templates/TemplateFormFields.tsx
"use client";

import { useRef, useState } from "react";

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
  isEdit?: boolean;
  error?: string | null;
}

const CATEGORIES = [
  { value: "", label: "Chọn danh mục..." },
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" },
  { value: "simple", label: "Simple" },
];

function HtmlPreview({ htmlContent }: { htmlContent: string | null }) {
  if (!htmlContent) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Chưa có HTML content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-4 min-h-[400px]">
      <div
        className="mx-auto w-full max-w-full overflow-hidden rounded-lg bg-white shadow-md"
        style={{ aspectRatio: "210 / 297" }}
      >
        <iframe
          srcDoc={htmlContent}
          title="HTML Preview"
          className="h-full w-full border-0"
          sandbox="allow-same-origin"
          style={{ pointerEvents: "none" }}
        />
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Preview hiển thị HTML thô — Thymeleaf expressions chưa được render bởi backend.</span>
      </div>
    </div>
  );
}

export function TemplateFormFields({ data, onChange, isEdit, error }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange("htmlContent", text);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tên template <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          maxLength={100}
          placeholder="Vd: Professional Blue, Creative Modern..."
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <p className="text-right text-xs text-gray-400">{data.name.length}/100</p>
      </div>

      {/* Thumbnail URL */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL thumbnail
        </label>
        <input
          type="url"
          value={data.thumbnailUrl}
          maxLength={500}
          placeholder="https://example.com/thumbnail.png"
          onChange={(e) => onChange("thumbnailUrl", e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
        />
        {data.thumbnailUrl && (
          <div className="flex items-center gap-2 rounded-md border border-gray-100 p-2 dark:border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.thumbnailUrl}
              alt="thumbnail preview"
              className="h-10 w-16 rounded object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="text-xs text-gray-400">Preview</span>
          </div>
        )}
      </div>

      {/* Category + Premium row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Danh mục
          </label>
          <select
            value={data.category}
            onChange={(e) => onChange("category", e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Loại
          </label>
          <div className="flex h-[42px] items-center gap-3 rounded-lg border border-gray-200 bg-white px-3.5 dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              role="switch"
              aria-checked={data.premium}
              onClick={() => onChange("premium", !data.premium)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                data.premium ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  data.premium ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {data.premium ? (
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Premium</span>
              ) : (
                "Free"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Active toggle — chỉ hiện khi edit */}
      {isEdit && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Trạng thái
          </label>
          <div className="flex h-[42px] items-center gap-3 rounded-lg border border-gray-200 bg-white px-3.5 dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              role="switch"
              aria-checked={data.active}
              onClick={() => onChange("active", !data.active)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                data.active ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  data.active ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {data.active ? (
                <span className="font-medium text-green-600 dark:text-green-400">Đang hiển thị</span>
              ) : (
                <span className="text-gray-500">Đang ẩn</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* HTML Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              HTML Content (Thymeleaf) <span className="text-red-500">*</span>
            </label>
            
            {/* Tab buttons */}
            <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "edit"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "preview"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import file .html
          </button>
          <input ref={fileRef} type="file" accept=".html,.xhtml,.xml" className="hidden" onChange={handleFileImport} />
        </div>

        {/* Editor / Preview */}
        <div className="relative">
          {viewMode === "edit" ? (
            <>
              <textarea
                value={data.htmlContent}
                onChange={(e) => onChange("htmlContent", e.target.value)}
                rows={16}
                spellCheck={false}
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" ...>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="http://www.thymeleaf.org">\n...`}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-800 placeholder-gray-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-600"
              />
              {data.htmlContent && (
                <div className="absolute bottom-2 right-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400 dark:bg-gray-800">
                  {data.htmlContent.length.toLocaleString()} chars
                </div>
              )}
            </>
          ) : (
            <HtmlPreview htmlContent={data.htmlContent} />
          )}
        </div>

        <p className="text-xs text-gray-400">
          Biến có sẵn:{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{"${personalInfo}"}</code>,{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{"${sections}"}</code>,{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{"${cv}"}</code>
        </p>
      </div>
    </div>
  );
}