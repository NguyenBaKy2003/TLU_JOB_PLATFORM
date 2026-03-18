"use client";

import { useEffect, useRef, useState }     from "react";
import { useRouter }                       from "next/navigation";
import { AuthTokenResponse }               from "@/domain/models/User";
import { useToast }                        from "@/presentation/components/ui/toast";
import { CandidateService }                from "@/application/services/CandidateService";
import { CandidateRepository }             from "@/infrastructure/repositories/CandidateRepository";

const candidateService = new CandidateService(new CandidateRepository());

interface OnboardingData {
  location:   string;
  postalCode: string;
  remote:     boolean;
  salary:     number;
  cycle:      string;
  cvFile:     File | null;
}

interface Props {
  token:      AuthTokenResponse;
  onboarding: OnboardingData;
}

type SaveStatus = "saving" | "done" | "error";

export function RegisterSuccessStep({ token, onboarding }: Props) {
  const router     = useRouter();
  const toast      = useToast();
  const hasSaved   = useRef(false); // ← chặn double-call

  const [status, setStatus] = useState<SaveStatus>("saving");

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;
    saveOnboardingData();
  }, []);

  const saveOnboardingData = async () => {
    try {
      const tasks: Promise<unknown>[] = [];

      const hasProfile = onboarding.location || onboarding.salary > 0;
      if (hasProfile) {
        tasks.push(
          candidateService.updateProfile({
            location:       onboarding.location,
            expectedSalary: onboarding.salary,
            currency:       "VND",
          })
        );
      }

      if (onboarding.cvFile) {
        tasks.push(
          candidateService.uploadCV({
            file:  onboarding.cvFile,
            title: onboarding.cvFile.name.replace(/\.[^.]+$/, ""),
          })
        );
      }

      await Promise.all(tasks);

      setStatus("done");

      if (tasks.length > 0) {
        toast.success(
          "Hồ sơ đã được khởi tạo!",
          "Thông tin của bạn đã được lưu. Chúc bạn tìm được công việc phù hợp."
        );
      } else {
        toast.success(
          "Đăng ký thành công!",
          "Bạn có thể cập nhật hồ sơ bất cứ lúc nào trong phần Cài đặt."
        );
      }

      setTimeout(() => router.replace("/home"), 2000);

    } catch (err: any) {
      setStatus("error");
      toast.error(
        "Lưu thông tin thất bại",
        "Bạn có thể cập nhật hồ sơ sau trong phần Cài đặt."
      );
      setTimeout(() => router.replace("/home"), 2500);
    }
  };

  return (
    <div className="w-full max-w-[300px] mx-auto text-center">
      <div className={[
        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
        status === "saving" ? "bg-blue-50"
        : status === "done" ? "bg-green-100"
                            : "bg-yellow-50",
      ].join(" ")}>
        {status === "saving" ? (
          <svg className="w-7 h-7 animate-spin text-blue-500"
               viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        ) : status === "done" ? (
          <svg width="32" height="32" viewBox="0 0 24 24"
               fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24"
               fill="none" stroke="#d97706" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {status === "saving" ? "Đang khởi tạo hồ sơ..."
        : status === "done"  ? "Tất cả đã sẵn sàng!"
                             : "Đăng ký thành công!"}
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        {status === "saving"
          ? "Vui lòng chờ trong giây lát..."
          : status === "done"
          ? "Hồ sơ của bạn đã được khởi tạo.\nĐang chuyển hướng vào trang chủ..."
          : "Bạn có thể cập nhật hồ sơ sau trong phần Cài đặt.\nĐang chuyển hướng..."}
      </p>

      {(status === "done" || status === "error") && (
        <div className="flex justify-center">
          <svg className="w-5 h-5 animate-spin text-blue-500"
               viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      )}
    </div>
  );
}