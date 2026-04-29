
export default function StreamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <main className="flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
}