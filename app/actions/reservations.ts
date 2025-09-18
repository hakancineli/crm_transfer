import { prisma } from '@/app/lib/prisma'; // Prisma importu en üste eklenmeli

export async function getReservation(voucherNumber: string) {
    try {
        // Rezervasyonu veritabanından çekiyoruz
        const reservation = await prisma.reservation.findUnique({
            where: { voucherNumber },
            include: { driver: true }
        });

        // Rezervasyon bulunduysa
        if (reservation) {
            try {
                let parsedNames = reservation.passengerNames;

                // Eğer passengerNames bir string ise, JSON.parse ile diziye dönüştür
                if (typeof parsedNames === 'string') {
                    try {
                        parsedNames = JSON.parse(parsedNames);
                    } catch (e) {
                        console.error('Yolcu isimleri parse edilemedi:', e);
                        // Eğer parse hatası alırsak, passengerNames'ı olduğu gibi döndürebiliriz
                    }
                }

                return {
                    ...reservation,
                    passengerNames: parsedNames
                };
            } catch (e) {
                console.error('Yolcu isimleri işlenirken hata oluştu:', e);
                return reservation;  // Hata durumunda, rezervasyonu olduğu gibi döndürüyoruz
            }
        }
        return null; // Rezervasyon bulunamazsa, null döndür
    } catch (error) {
        console.error('Rezervasyon getirme hatası:', error);
        return null;  // Hata durumunda null döndür
    }
}
