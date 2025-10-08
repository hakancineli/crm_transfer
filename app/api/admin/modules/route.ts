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

    // Sadece SUPERUSER erişebilir
    if (userRole !== 'SUPERUSER') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim - Sadece SUPERUSER modül yönetimi yapabilir' },
        { status: 403 }
      );
    }

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

    // Sadece SUPERUSER modül değiştirebilir
    if (userRole !== 'SUPERUSER') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim - Sadece SUPERUSER modül yönetimi yapabilir' },
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
