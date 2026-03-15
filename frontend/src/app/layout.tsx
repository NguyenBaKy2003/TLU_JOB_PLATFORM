import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from "@/usecase/contexts/AuthContext";
import { ToastProvider } from "@/presentation/components/ui/toast";
import { AuthProvider } from "@/application/contexts/AuthContext";
// import { WebSocketProvider } from "@/usecase/contexts/WebSocketContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joblin - Nền tảng tuyển dụng Thông Minh",
  description: "Joblin - Nền tảng tuyển dụng Thông Minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          {/* <WebSocketProvider> */}
            <ToastProvider>
              {children}
            </ToastProvider>
          {/* </WebSocketProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}