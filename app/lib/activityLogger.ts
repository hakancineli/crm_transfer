import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ActivityData {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entityType: 'USER' | 'RESERVATION' | 'DRIVER' | 'SYSTEM';
  entityId?: string;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityLogger {
  static async logActivity(data: ActivityData) {
    try {
      // Ensure details is JSON serializable
      let serializableDetails = null;
      if (data.details) {
        try {
          serializableDetails = JSON.parse(JSON.stringify(data.details));
        } catch (e) {
          console.warn('Details not JSON serializable, converting to string:', e);
          serializableDetails = String(data.details);
        }
      }

      await prisma.activity.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          description: data.description,
          details: serializableDetails,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Activity logging failed:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  static async getActivities(limit: number = 50) {
    try {
      return await prisma.activity.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }

  static async getUserActivities(userId: string, limit: number = 20) {
    try {
      return await prisma.activity.findMany({
        where: {
          userId
        },
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
      return [];
    }
  }
}
