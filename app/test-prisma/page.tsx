import { prisma } from '@/app/lib/prisma';

export default async function TestPrismaPage() {
  try {
    const website = await prisma.tenantWebsite.findFirst({
      where: { subdomain: 'demo-acente' },
      include: { settings: true, tenant: true }
    });

    if (!website) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Website Not Found</h1>
            <p>Demo website bulunamadı.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-green-600 mb-6">✅ Prisma Test Başarılı!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Website Bilgileri</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li><strong>ID:</strong> {website.id}</li>
                  <li><strong>Subdomain:</strong> {website.subdomain}</li>
                  <li><strong>Is Active:</strong> {website.isActive ? '✅' : '❌'}</li>
                  <li><strong>Theme:</strong> {website.theme}</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Tenant Bilgileri</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>Company:</strong> {website.tenant.companyName}</li>
                  <li><strong>Subdomain:</strong> {website.tenant.subdomain}</li>
                  <li><strong>Website Module:</strong> {website.tenant.websiteModuleEnabled ? '✅' : '❌'}</li>
                  <li><strong>Plan:</strong> {website.tenant.subscriptionPlan}</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Settings Bilgileri</h3>
              {website.settings ? (
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li><strong>Company Name:</strong> {website.settings.companyName}</li>
                  <li><strong>Hero Title:</strong> {website.settings.heroTitle}</li>
                  <li><strong>Hero Subtitle:</strong> {website.settings.heroSubtitle}</li>
                  <li><strong>Phone:</strong> N/A</li>
                </ul>
              ) : (
                <p className="text-yellow-700">Settings bulunamadı</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <a 
                href="/website/demo-acente"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Website'i Görüntüle →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Prisma Error</h1>
          <p className="text-gray-600 mb-4">Veritabanı bağlantısında hata:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm text-left">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  } finally {
    // Prisma client is shared, no need to disconnect
  }
}
