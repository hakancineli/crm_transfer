import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/app/lib/tenant';
import { MODULES } from '@/app/lib/modules';

export async function GET() {
  try {
    const tenants = await TenantService.getAllTenants();
    
    // Use MODULES constant instead of database
    const modules = Object.values(MODULES);

    return NextResponse.json({
      success: true,
      data: {
        tenants,
        modules
      }
    });
  } catch (error) {
    console.error('Error fetching modules data:', error);
    return NextResponse.json(
      { success: false, error: 'Veriler alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, moduleId } = await request.json();

    if (!tenantId || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID ve Module ID gerekli' },
        { status: 400 }
      );
    }

    const success = await TenantService.toggleModule(tenantId, moduleId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Modül durumu güncellendi'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Modül durumu güncellenemedi' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error toggling module:', error);
    return NextResponse.json(
      { success: false, error: 'Modül durumu güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
