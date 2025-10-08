import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/app/lib/tenant';
import { MODULES } from '@/app/lib/modules';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // JWT token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const userRole = decoded.role;
    const userId = decoded.userId;

    // SUPERUSER tüm tenant'ları görebilir, AGENCY_ADMIN sadece kendi tenant'ını
    let tenants;
    if (userRole === 'SUPERUSER') {
      tenants = await TenantService.getAllTenants();
    } else if (userRole === 'AGENCY_ADMIN') {
      // AGENCY_ADMIN sadece kendi tenant'ını görebilir
      const userTenants = await TenantService.getTenantsByUserId(userId);
      tenants = userTenants;
    } else {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }
    
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
    // JWT token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const userRole = decoded.role;
    const userId = decoded.userId;
    const { tenantId, moduleId } = await request.json();

    if (!tenantId || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID ve Module ID gerekli' },
        { status: 400 }
      );
    }

    // AGENCY_ADMIN sadece kendi tenant'ının modüllerini değiştirebilir
    if (userRole === 'AGENCY_ADMIN') {
      const userTenants = await TenantService.getTenantsByUserId(userId);
      const hasAccess = userTenants.some(tenant => tenant.id === tenantId);
      
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: 'Bu tenant\'a erişim yetkiniz yok' },
          { status: 403 }
        );
      }
    } else if (userRole !== 'SUPERUSER') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
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
