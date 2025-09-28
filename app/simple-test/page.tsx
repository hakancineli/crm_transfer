import { prisma } from '@/app/lib/prisma';

export default async function SimpleTestPage() {
  try {
    // Basit bir test
    const tenantCount = await prisma.tenant.count();
    const websiteCount = await prisma.tenantWebsite.count();
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Prisma Çalışıyor!</h1>
          <div className="space-y-2">
            <p><strong>Tenant Sayısı:</strong> {tenantCount}</p>
            <p><strong>Website Sayısı:</strong> {websiteCount}</p>
          </div>
          <div className="mt-6">
            <a 
              href="/website/demo-acente"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Demo Website'i Görüntüle
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Prisma Hatası</h1>
          <pre className="text-sm text-gray-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }
}

