import { prisma } from '@/app/lib/prisma'; // Prisma importu en üste eklenmeli

export async function getReservation(voucherNumber: string) {
    try {
        // Check if it's a tour reservation (TUR- prefix)
        if (voucherNumber.startsWith('TUR-')) {
            // Tur rezervasyonunu çek
            const tourBooking = await prisma.tourBooking.findUnique({
                where: { voucherNumber },
                include: {
                    driver: true,
                    tenant: true,
                    User: true
                }
            });

            if (tourBooking) {
                try {
                    let parsedNames = tourBooking.passengerNames;

                    // Eğer passengerNames bir string ise, JSON.parse ile diziye dönüştür
                    if (typeof parsedNames === 'string') {
                        try {
                            parsedNames = JSON.parse(parsedNames);
                        } catch (e) {
                            console.error('Yolcu isimleri parse edilemedi:', e);
                        }
                    }

                    return {
                        ...tourBooking,
                        passengerNames: parsedNames,
                        reservationType: 'tour' // Rezervasyon tipini belirt
                    };
                } catch (e) {
                    console.error('Yolcu isimleri işlenirken hata oluştu:', e);
                    return { ...tourBooking, reservationType: 'tour' };
                }
            }
            return null;
        }

        // Transfer rezervasyonu için mevcut kod
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
                    passengerNames: parsedNames,
                    reservationType: 'transfer' // Rezervasyon tipini belirt
                };
            } catch (e) {
                console.error('Yolcu isimleri işlenirken hata oluştu:', e);
                return { ...reservation, reservationType: 'transfer' };
            }
        }
        return null; // Rezervasyon bulunamazsa, null döndür
    } catch (error) {
        console.error('Rezervasyon getirme hatası:', error);
        return null;  // Hata durumunda null döndür
    }
}
