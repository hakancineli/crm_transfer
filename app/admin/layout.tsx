import AdminNavigation from '@/app/components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
