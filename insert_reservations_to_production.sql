-- Production veritabanına rezervasyonları eklemek için SQL script
-- Bu script'i production PostgreSQL veritabanında çalıştırın

INSERT INTO "Reservation" (
    id, "tenantId", date, time, "from", "to", "flightCode", "passengerNames", 
    "luggageCount", price, currency, "phoneNumber", "distanceKm", "voucherNumber", 
    "driverFee", "driverId", "userId", "paymentStatus", "companyCommissionStatus", 
    "createdAt", "returnTransferId", "isReturn"
) VALUES 
(
    'res-1', 'tenant-1', '2025-01-15', '14:30', 'İstanbul Havalimanı', 'Beşiktaş', 
    'TK1234', '["Ahmet Yılmaz", "Ayşe Yılmaz"]', 2, 150.0, 'USD', '+90 532 111 22 33', 
    45.5, 'TK1234-001', 75.0, 'driver-1', 'user-2', 'RECEIVED', 'APPROVED', 
    '2025-09-06 20:58:47', NULL, false
),
(
    'res-2', 'tenant-1', '2025-01-16', '09:15', 'Sabiha Gökçen', 'Kadıköy', 
    'PC5678', '["Mehmet Demir"]', 1, 120.0, 'USD', '+90 533 222 33 44', 
    38.2, 'PC5678-002', 60.0, 'driver-2', 'user-2', 'PENDING', 'PENDING', 
    '2025-09-06 20:58:47', NULL, false
),
(
    'res-3', 'tenant-1', '2025-01-17', '16:45', 'Taksim', 'İstanbul Havalimanı', 
    'TK9012', '["Ali Kaya", "Fatma Kaya", "Zeynep Kaya"]', 3, 180.0, 'USD', 
    '+90 534 333 44 55', 42.8, 'TK9012-003', 90.0, 'driver-3', 'user-2', 
    'RECEIVED', 'APPROVED', '2025-09-06 20:58:47', NULL, false
)
ON CONFLICT (id) DO UPDATE SET
    "tenantId" = EXCLUDED."tenantId",
    date = EXCLUDED.date,
    time = EXCLUDED.time,
    "from" = EXCLUDED."from",
    "to" = EXCLUDED."to",
    "flightCode" = EXCLUDED."flightCode",
    "passengerNames" = EXCLUDED."passengerNames",
    "luggageCount" = EXCLUDED."luggageCount",
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    "phoneNumber" = EXCLUDED."phoneNumber",
    "distanceKm" = EXCLUDED."distanceKm",
    "voucherNumber" = EXCLUDED."voucherNumber",
    "driverFee" = EXCLUDED."driverFee",
    "driverId" = EXCLUDED."driverId",
    "userId" = EXCLUDED."userId",
    "paymentStatus" = EXCLUDED."paymentStatus",
    "companyCommissionStatus" = EXCLUDED."companyCommissionStatus",
    "createdAt" = EXCLUDED."createdAt",
    "returnTransferId" = EXCLUDED."returnTransferId",
    "isReturn" = EXCLUDED."isReturn";
