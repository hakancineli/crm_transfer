import AdminNavigation from '@/app/components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
