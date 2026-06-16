import type { Metadata } from "next";
// 1. IMPORT INTER TỪ GOOGLE FONTS CỦA NEXT.JS
import { Inter } from "next/font/google"; 
import "./globals.css";
import { ToastProvider } from "@/presentation/components/ui/toast";
import { AuthProvider } from "@/application/contexts/AuthContext";
import { WebSocketProvider } from "@/application/contexts/WebSocketContext";
import { ReactQueryProvider } from "@/presentation/components/providers/ReactQueryProvider";
import { NotificationToastListener } from "@/presentation/components/notifications/NotificationToastListener";

// 2. KHỞI TẠO FONT INTER
const inter = Inter({
  variable: "--font-sans", 
  subsets: ["latin", "vietnamese"], // Thêm vietnamese để font không bị lỗi dấu
});

export const metadata: Metadata = {
  title: "CareerUp - Nền tảng tuyển dụng Thông Minh",
  description: "CareerUp - Nền tảng tuyển dụng Thông Minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. TRUYỀN BIẾN FONT INTER VÀO CLASS CỦA HTML
    <html lang="vi" className={`${inter.variable} bg-[#DFEAFE]`}>
      <body className="font-sans">
        <ReactQueryProvider>
          <AuthProvider>
            <WebSocketProvider>
              <ToastProvider defaultPosition="top-right" maxToasts={5}>
                <NotificationToastListener />
                {children}
              </ToastProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}