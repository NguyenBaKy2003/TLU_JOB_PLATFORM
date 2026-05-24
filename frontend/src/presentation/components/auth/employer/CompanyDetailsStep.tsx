// src/presentation/components/auth/employer/CompanyDetailsStep.tsx
"use client";
import { useState, useRef }  from "react";
import Link                  from "next/link";
import { ImagePlus }         from "lucide-react";
import {
  FormInput, SubmitButton,
} from "@/presentation/components/common/auth-ui";
import { useToast }          from "@/presentation/components/ui/toast";
import { CompanyService }    from "@/application/services/CompanyService";
import { CompanyRepository } from "@/infrastructure/repositories/CompanyRepository";

const service = new CompanyService(new CompanyRepository());

const MAX_DESC = 512;

interface CompanyData {
  logo:        File | null;
  companyName: string;
  industry:    string;
  description: string;
}

interface Props {
  onComplete: (data: CompanyData) => void;
  onSkip:     () => void;
}

export function CompanyDetailsStep({ onComplete, onSkip }: Props) {
  const toast   = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form,    setForm]    = useState<CompanyData>({ logo: null, companyName: "", industry: "", description: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [errors,  setErrors]  = useState<{ companyName?: string; description?: string }>({});
  const [loading, setLoading] = useState(false);

  const set = (f: keyof CompanyData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(p => ({ ...p, logo: file }));
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.companyName.trim()) e.companyName = "Vui lòng nhập tên công ty";
    if (!form.description.trim()) e.description = "Vui lòng nhập mô tả công ty";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);

  try {
    const company = await service.getMyCompany();

    const updatePromise = service
      .updateCompany(company.id, {
        name: form.companyName,
        industry: form.industry || undefined,
        description: form.description,
      })
      .catch((err: any) => {
        toast.error("Lỗi cập nhật", err?.response?.data?.message ?? "Không thể cập nhật công ty");
        throw err; 
      });

    const logoPromise = form.logo
      ? service.uploadLogo(form.logo).catch((err: any) => {
          toast.error("Logo lỗi", err?.response?.data?.message ?? "Upload logo thất bại");
        })
      : Promise.resolve();

    await Promise.all([updatePromise, logoPromise]);

    toast.success("Thành công", "Cập nhật công ty thành công");
    onComplete(form);

  } catch (err: any) {
    toast.error("Lỗi", err?.response?.data?.message ?? "Vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <Link href="/"><img src="/Logo.svg" alt="CareerUp" className="h-16 w-36 mx-auto" /></Link>
      </div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
        Cung cấp thông tin của công ty
      </h2>
      <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
        Vui lòng cung cấp chi tiết về công ty để hoàn tất hồ sơ<br />và sử dụng mọi tính năng.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Logo upload */}
        <div className="flex justify-center mb-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 group">
            <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center
              transition-colors overflow-hidden
              ${preview ? "border-gray-200" : "border-gray-300 hover:border-blue-400 group-hover:bg-blue-50"}`}>
              {preview
                ? <img src={preview} alt="logo" className="w-full h-full object-cover" />
                : <ImagePlus size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              }
            </div>
            <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
              Tải lên logo
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>

        <FormInput label="Tên công ty" required placeholder="Nhập tên công ty"
          value={form.companyName}
          onChange={e => { setForm(p => ({ ...p, companyName: e.target.value })); setErrors(p => ({ ...p, companyName: undefined })); }}
          error={errors.companyName}
        />

        <FormInput label="Lĩnh vực công ty" required={false} placeholder="Nhập lĩnh vực hoạt động"
          value={form.industry} onChange={set("industry")}
        />

        {/* Description textarea */}
        <div className="relative">
          <div className={`relative border rounded-xl px-3 pt-3 pb-2 transition-all
            ${errors.description ? "border-red-400 bg-red-50" : "border-gray-300 focus-within:border-blue-500"}`}>
            <label className={`absolute -top-2.5 left-3 bg-white px-1 text-[16px] leading-none
              ${errors.description ? "text-red-500" : "text-gray-800"}`}>
              Mô tả công ty<span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => {
                setForm(p => ({ ...p, description: e.target.value.slice(0, MAX_DESC) }));
                setErrors(p => ({ ...p, description: undefined }));
              }}
              placeholder="Viết mô tả về công ty của bạn..."
              rows={5}
              className="w-full bg-transparent text-[16px] text-gray-700 placeholder-gray-400 outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-between mt-1 px-1">
            {errors.description
              ? <p className="text-red-500 text-[11px] flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {errors.description}
                </p>
              : <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  Thêm thông tin chi tiết
                </span>
            }
            <span className="text-[11px] text-gray-400 shrink-0">
              {form.description.length}/{MAX_DESC}
            </span>
          </div>
        </div>

        <SubmitButton loading={loading}>Hoàn tất</SubmitButton>
      </form>

      <div className="text-center mt-3">
        <button onClick={onSkip}
          className="text-[16px] text-gray-500 hover:text-gray-700 transition-colors">
          Bỏ qua
        </button>
      </div>
    </div>
  );
}