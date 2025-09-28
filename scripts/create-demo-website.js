const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDemoWebsite() {
  try {
    console.log('Creating demo website...');

    // Önce bir tenant bul veya oluştur
    let tenant = await prisma.tenant.findFirst({
      where: { subdomain: 'demo' }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          subdomain: 'demo',
          companyName: 'Demo Acente',
          isActive: true,
          subscriptionPlan: 'premium'
        }
      });
      console.log('Created demo tenant:', tenant.id);
    }

    // Website oluştur
    const website = await prisma.tenantWebsite.create({
      data: {
        tenantId: tenant.id,
        subdomain: 'demo-acente',
        isActive: true,
        theme: 'default',
        settings: {
          create: {
            companyName: 'Demo Acente',
            heroTitle: 'Profesyonel Transfer Hizmetleri',
            heroSubtitle: 'İstanbul Havalimanı transfer hizmetlerinde güvenilir çözüm ortağınız',
            contactInfo: {
              phone: '+90 555 123 45 67',
              email: 'info@demoacente.com',
              address: 'İstanbul, Türkiye',
              whatsapp: '+90 555 123 45 67'
            },
            socialMedia: {
              facebook: 'https://facebook.com/demoacente',
              instagram: 'https://instagram.com/demoacente',
              twitter: '',
              linkedin: ''
            },
            seoSettings: {
              title: 'Demo Acente - Profesyonel Transfer Hizmetleri',
              description: 'İstanbul Havalimanı transfer hizmetleri. Güvenilir, konforlu ve uygun fiyatlı transfer çözümleri.',
              keywords: 'transfer, havalimanı, istanbul, demo acente',
              ogImage: ''
            },
            colorScheme: {
              primary: '#16a34a',
              secondary: '#6b7280',
              accent: '#dcfce7'
            }
          }
        },
        pages: {
          create: [
            {
              slug: 'home',
              title: 'Ana Sayfa',
              content: { type: 'homepage', sections: [] },
              isPublished: true,
              isHomepage: true,
              sortOrder: 0
            }
          ]
        },
        sections: {
          create: [
            {
              sectionType: 'hero',
              title: 'Hero Section',
              content: {
                title: 'Profesyonel Transfer Hizmetleri',
                subtitle: 'İstanbul Havalimanı transfer hizmetlerinde güvenilir çözüm ortağınız',
                ctaText: 'Rezervasyon Yap',
                ctaLink: '/customer-reservation'
              },
              sortOrder: 0
            },
            {
              sectionType: 'features',
              title: 'Özelliklerimiz',
              content: {
                features: [
                  { 
                    title: '7/24 Hizmet', 
                    description: 'Günün her saati hizmetinizdeyiz' 
                  },
                  { 
                    title: 'Sabit Fiyat', 
                    description: 'Gizli ücret yok, şeffaf fiyatlandırma' 
                  },
                  { 
                    title: 'Profesyonel Şoförler', 
                    description: 'Deneyimli ve güvenilir şoför kadromuz' 
                  },
                  { 
                    title: 'Modern Araçlar', 
                    description: 'Konforlu ve güvenli araç filomuz' 
                  }
                ]
              },
              sortOrder: 1
            }
          ]
        }
      },
      include: {
        settings: true,
        pages: true,
        sections: true
      }
    });

    console.log('Demo website created successfully!');
    console.log('Website ID:', website.id);
    console.log('Subdomain:', website.subdomain);
    console.log('Access URL: http://localhost:3000/website/demo-acente');
    
  } catch (error) {
    console.error('Error creating demo website:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoWebsite();

