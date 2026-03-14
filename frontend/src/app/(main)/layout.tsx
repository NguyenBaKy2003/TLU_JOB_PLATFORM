import { Footer } from "@/presentation/components/layout/Footer"
import { Header } from "@/presentation/components/layout/Header"
// import { Footer } from "@/presentation/components/layout/Footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col ">
      <Header />
      <main className="flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}