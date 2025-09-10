-- Gerçek rezervasyon verilerini PostgreSQL'e aktarma
-- crm_transfer'den export edilen 13 rezervasyon

-- Önce mevcut test rezervasyonlarını temizle
DELETE FROM "Reservation" WHERE "voucherNumber" LIKE 'FARAH%' OR "voucherNumber" LIKE 'TK%' OR "voucherNumber" LIKE 'PC%';

-- Gerçek rezervasyonları ekle
INSERT INTO "Reservation" (
    id, "tenantId", date, time, "from", "to", "flightCode", "passengerNames", 
    "luggageCount", price, currency, "phoneNumber", "voucherNumber", 
    "driverFee", "driverId", "userId", "paymentStatus", "createdAt", 
    "returnTransferId", "isReturn"
) VALUES 
(
    '8e9dbd5b-0b58-48cf-b4d4-3abbc8895ae6', 
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '23:59', 'IST', 'Bakırköy', 'dasdfas', 
    '["fasfs"]', 2, 25.0, 'USD', '', 'VIP20250307-FYOJ', 
    850.0, NULL, 
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PENDING', '2025-03-08 23:59:00', NULL, false
),
(
    '2fc0faaa-b3f1-4801-ab97-053a6cf09387',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '02:01', 'Laleli Double Tree otel', 'IST', 'tk300', 
    '[]', 2, 35.0, 'USD', NULL, 'VIP20250307-LRL3', 
    1000.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PAID', '2025-03-08 02:01:00', NULL, false
),
(
    'cfe31b48-fda5-445d-8f86-7819d1b1d733',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '20:30', 'IST', 'Ataköy Marine', 'KVS 300', 
    '["Soso","Marin","Arman"]', 3, 35.0, 'USD', NULL, 'VIP20250307-6VT8', 
    100.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'RECEIVED', '2025-03-08 20:30:00', NULL, false
),
(
    'ec7f25e7-0e83-443a-87b5-b2daa0852826',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '22:22', 'IST', 'SAW', '22dee', 
    '["wdawsd"]', 0, 35.0, 'USD', NULL, 'VIP20250307-1DI1', 
    1000.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'RECEIVED', '2025-03-08 22:22:00', NULL, false
),
(
    '2531ba8a-1c37-4daa-85ea-8379cb5a4d48',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '00:43', 'IST', 'SAW', 'tk333', 
    '"[\"ada\",\"ela\",\"yok\"]"', 0, 35.0, 'USD', NULL, 'VIP20250307-3J9K', 
    1000.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'RECEIVED', '2025-03-08 00:43:00', NULL, false
),
(
    '65a18a4a-9922-4a42-8e08-edbbcbd65878',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '22:22', 'IST', 'Şişli Bomonti', 'SV200', 
    '["Ada","Ela","Hakan"]', 2, 35.0, 'USD', '', 'VIP20250307-TIA1', 
    300.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'RECEIVED', '2025-03-08 22:22:00', NULL, false
),
(
    '8933e199-5826-43b5-a797-e26fb681f557',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-07', '05:02', 'Adana Merkez', 'IST', 'tk123', 
    '["BURAK","ENES","ELA",""]', 3, 35.0, 'USD', '05432695442', 'VIP20250308-V16K', 
    1000.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'UNPAID', '2025-03-07 05:02:00', NULL, false
),
(
    'e501a6f8-a337-424e-b690-0734467315db',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-07', '23:59', 'IST', 'SHRATON HOTEL', 'TK300', 
    '["MUSTAFA","METE","IŞIK"]', 3, 35.0, 'USD', '05545812034', 'VIP20250308-VBDT', 
    1000.0, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'RECEIVED', '2025-03-07 23:59:00', NULL, false
),
(
    '24d002b7-b8fd-4c80-8f29-e32c01616413',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-10', '23:59', 'IST', 'SAW', 'TK333', 
    '["ADA","MERT","YUSUF","nalan","REFA"]', 3, 35.0, 'USD', '66622226666', 'VIP20250308-5YPZ', 
    NULL, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PENDING', '2025-03-10 23:59:00', NULL, false
),
(
    '3a0650ae-3f94-4c9a-9ed6-ccfc62d8542a',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-09', '18:59', 'IST', 'Bakırköy', '', 
    '["GAMZE","SELVİ"]', 2, 40.0, 'USD', '05554542321', 'VIP20250308-XB66', 
    NULL, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PENDING', '2025-03-09 18:59:00', NULL, false
),
(
    'd748b522-33a9-4a95-a093-038f1c0ec373',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-08', '23:59', 'IST', 'İSTANBUL ADA PARK', 'TK138', 
    '["merih demiral","burak boşna"]', 3, 35.0, 'USD', '05454442436', 'VIP20250308-X0K4', 
    NULL, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PENDING', '2025-03-08 23:59:00', NULL, false
),
(
    'b1dbf78d-3e9e-413c-9d71-d613237c189c',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-09', '23:59', 'sadsd', 'sadsad', 'tk123', 
    '["sfsfa"]', 2, 35.0, 'USD', '05555555555', 'VIP20250310-8IGW', 
    NULL, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PENDING', '2025-03-09 23:59:00', NULL, false
),
(
    '6d18a2b1-cf68-4c48-9eb0-bc947603b249',
    (SELECT id FROM tenants WHERE subdomain = 'farahtourism' LIMIT 1),
    '2025-03-11', '03:00', 'IST', 'Şişli', 'tk123', 
    '["AHMET VELİ","CERRAHPAŞALI","POLAT"]', 3, 35.0, 'USD', '05555555555', 'VIP20250310-G76N', 
    NULL, NULL,
    (SELECT id FROM "User" WHERE username = 'farahtourism' LIMIT 1),
    'PENDING', '2025-03-11 03:00:00', NULL, false
);
