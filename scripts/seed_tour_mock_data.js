const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Tour Module Seeding...');

    // 1. Get Tenant (Drabos Travel)
    const tenant = await prisma.tenant.findFirst({
        where: { subdomain: 'drabos-travel' } // Adjust if needed
    });

    if (!tenant) {
        console.error('❌ Tenant "drabos-travel" not found. Please create it first.');
        return;
    }
    const tenantId = tenant.id;
    console.log(`✅ Using Tenant: ${tenant.companyName} (${tenantId})`);

    // 2. Create Customers
    const customersData = [
        { name: 'Ahmet', surname: 'Yılmaz', phone: '5321012020', passport: 'U12345678' },
        { name: 'Ayşe', surname: 'Demir', phone: '5332023030', passport: 'U22345678' },
        { name: 'Mehmet', surname: 'Kaya', phone: '5423034040', passport: 'U32345678' },
        { name: 'Fatma', surname: 'Çelik', phone: '5554045050', passport: 'U42345678' },
        { name: 'Mustafa', surname: 'Öztürk', phone: '5365056060', passport: 'U52345678' },
        { name: 'Zeynep', surname: 'Arslan', phone: '5376067070', passport: 'U62345678' },
        { name: 'Emre', surname: 'Doğan', phone: '5387078080', passport: 'U72345678' },
        { name: 'Burak', surname: 'Yıldız', phone: '5398089090', passport: 'U82345678' },
        { name: 'Elif', surname: 'Koç', phone: '5419090000', passport: 'U92345678' },
        { name: 'Can', surname: 'Kurt', phone: '5421010101', passport: 'U02345678' }
    ];

    const customers = [];
    for (const c of customersData) {
        let cust = await prisma.customer.findFirst({
            where: { phone: c.phone, tenantId }
        });

        if (!cust) {
            cust = await prisma.customer.create({
                data: {
                    tenantId,
                    name: c.name,
                    surname: c.surname,
                    phone: c.phone,
                    passportNumber: c.passport,
                    nationality: 'TR'
                }
            });
        }
        customers.push(cust);
    }
    console.log(`✅ Seeded ${customers.length} Customers`);

    // 3. Create Tour Routes
    const routesData = [
        { name: 'Sapanca & Maşukiye Turu', duration: 10, price: 35 },
        { name: 'Bursa Uludağ Turu', duration: 12, price: 50 },
        { name: 'İstanbul Şehir Klasikleri', duration: 8, price: 60 },
        { name: 'Şile & Ağva Turu', duration: 9, price: 40 },
        { name: 'Prenses Adaları Turu', duration: 7, price: 45 }
    ];

    const routes = [];
    for (const r of routesData) {
        // Check existing by name (approx) or create
        let route = await prisma.tourRoute.findFirst({
            where: { tenantId, name: r.name }
        });

        if (!route) {
            route = await prisma.tourRoute.create({
                data: {
                    tenantId,
                    name: r.name,
                    duration: r.duration,
                    basePrice: r.price,
                    currency: 'EUR',
                    regions: JSON.stringify(['Marmara']),
                    isActive: true
                }
            });
        }
        routes.push(route);
    }
    console.log(`✅ Seeded ${routes.length} Tour Routes`);

    // 4. Create Scheduled Tours (Next 14 days)
    const scheduledTours = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
        const tourDate = new Date(today);
        tourDate.setDate(today.getDate() + (i % 5)); // Spread over 5 days
        tourDate.setHours(9, 0, 0, 0);

        const route = routes[i % routes.length];

        // Check existing
        // Simple creation for volume
        const tour = await prisma.tour.create({
            data: {
                tenantId,
                routeId: route.id,
                startDate: tourDate,
                startTime: '09:00',
                vehicleId: null, // Assign later in UI
                driverId: null,
                guideId: null,
                status: 'SCHEDULED'
            }
        });
        scheduledTours.push(tour);
    }
    console.log(`✅ Seeded ${scheduledTours.length} Scheduled Tours`);

    // 5. Create Bookings
    let bookingCount = 0;
    for (const tour of scheduledTours) {
        // Create 1-3 bookings per tour
        const numBookings = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < numBookings; j++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const route = routes.find(r => r.id === tour.routeId);
            const groupSize = Math.floor(Math.random() * 4) + 1;
            const totalAmount = groupSize * (route ? route.basePrice : 50);

            let paymentStatus = 'PENDING';
            let paidAmount = 0;

            const rand = Math.random();
            if (rand > 0.6) {
                paymentStatus = 'PAID';
                paidAmount = totalAmount;
            } else if (rand > 0.3) {
                paymentStatus = 'PARTIAL';
                paidAmount = totalAmount / 2;
            }

            await prisma.tourBooking.create({
                data: {
                    tenantId,
                    voucherNumber: `TUR-SEED-${Date.now()}-${bookingCount}`,
                    customerId: customer.id,
                    tourId: tour.id,
                    routeName: route ? route.name : 'Unknown Tour',
                    vehicleType: 'SPRINTER_16',
                    groupSize: groupSize,
                    price: totalAmount,
                    currency: 'EUR',
                    pickupLocation: 'Sultanahmet Meydanı',
                    tourDate: tour.startDate,
                    tourTime: tour.startTime,
                    tourDuration: route ? route.duration : 8,
                    passengerNames: `${customer.name} ${customer.surname}, ...`,
                    status: 'CONFIRMED',
                    paymentStatus: paymentStatus,
                    paymentMethod: 'CASH',
                    paidAmount: paidAmount,
                    remainingAmount: totalAmount - paidAmount,
                    source: 'seed',
                    seatNumber: `${j + 1}`
                }
            });
            bookingCount++;
        }
    }
    console.log(`✅ Seeded ${bookingCount} Tour Bookings`);
    console.log('🎉 Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
