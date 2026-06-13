import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/presentation/components/ui/toast";
import { AuthProvider } from "@/application/contexts/AuthContext";
import { WebSocketProvider } from "@/application/contexts/WebSocketContext";
import { ReactQueryProvider } from "@/presentation/components/providers/ReactQueryProvider";
import { NotificationToastListener } from "@/presentation/components/notifications/NotificationToastListener";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="vi" className={`${geistSans.variable}  bg-[#DFEAFE]`}>
      <body>
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