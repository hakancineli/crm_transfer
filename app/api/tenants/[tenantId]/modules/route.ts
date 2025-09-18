import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        modules: {
          include: {
            module: true
          }
        }
      }
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modules: tenant.modules.map((tm: any) => ({
        moduleId: tm.moduleId,
        isEnabled: tm.isEnabled,
        activatedAt: tm.activatedAt,
        expiresAt: tm.expiresAt,
        features: tm.features,
        module: tm.module
      }))
    });
  } catch (error) {
    console.error('Error fetching tenant modules:', error);
    return NextResponse.json(
      { success: false, error: 'Modüller yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
