-- Test verileri oluşturma scripti

-- Tenant oluştur
INSERT INTO tenants (id, subdomain, companyName, domain, isActive, subscriptionPlan, createdAt, updatedAt) 
VALUES ('tenant-1', 'protransfer', 'ProTransfer', 'protransfer.com.tr', true, 'premium', datetime('now'), datetime('now'));

-- Modüller oluştur
INSERT INTO modules (id, name, description, isActive, priceMonthly, priceYearly, features, createdAt, updatedAt) 
VALUES 
('module-1', 'transfer', 'Transfer yönetimi modülü', true, 50.0, 500.0, '["reservations", "drivers", "reports"]', datetime('now'), datetime('now')),
('module-2', 'accommodation', 'Konaklama modülü', true, 30.0, 300.0, '["hotel_bookings", "price_pool"]', datetime('now'), datetime('now'));

-- Tenant modüllerini etkinleştir
INSERT INTO tenant_modules (id, tenantId, moduleId, isEnabled, activatedAt, createdAt, updatedAt) 
VALUES 
('tm-1', 'tenant-1', 'module-1', true, datetime('now'), datetime('now'), datetime('now')),
('tm-2', 'tenant-1', 'module-2', true, datetime('now'), datetime('now'), datetime('now'));

-- Kullanıcılar oluştur
INSERT INTO User (id, username, email, password, name, role, isActive, createdAt, updatedAt) 
VALUES 
('user-1', 'admin', 'admin@protransfer.com.tr', '$2a$10$example', 'Admin User', 'SUPERUSER', true, datetime('now'), datetime('now')),
('user-2', 'seller1', 'seller1@protransfer.com.tr', '$2a$10$example', 'Satış Personeli 1', 'SELLER', true, datetime('now'), datetime('now')),
('user-3', 'operation', 'operation@protransfer.com.tr', '$2a$10$example', 'Operasyon Personeli', 'OPERATION', true, datetime('now'), datetime('now'));

-- Tenant kullanıcıları
INSERT INTO tenant_users (id, tenantId, userId, role, permissions, isActive, createdAt, updatedAt) 
VALUES 
('tu-1', 'tenant-1', 'user-1', 'ADMIN', '["ALL"]', true, datetime('now'), datetime('now')),
('tu-2', 'tenant-1', 'user-2', 'SELLER', '["VIEW_OWN_SALES", "CREATE_RESERVATIONS"]', true, datetime('now'), datetime('now')),
('tu-3', 'tenant-1', 'user-3', 'OPERATION', '["VIEW_ALL_RESERVATIONS", "ASSIGN_DRIVERS"]', true, datetime('now'), datetime('now'));

-- Şoförler oluştur
INSERT INTO Driver (id, name, phoneNumber, createdAt) 
VALUES 
('driver-1', 'Ahmet Yılmaz', '+90 532 123 45 67', datetime('now')),
('driver-2', 'Mehmet Demir', '+90 533 234 56 78', datetime('now')),
('driver-3', 'Ali Kaya', '+90 534 345 67 89', datetime('now'));

-- Test rezervasyonları oluştur
INSERT INTO Reservation (id, tenantId, date, time, "from", "to", flightCode, passengerNames, luggageCount, price, currency, phoneNumber, distanceKm, voucherNumber, driverFee, driverId, userId, paymentStatus, companyCommissionStatus, createdAt) 
VALUES 
('res-1', 'tenant-1', '2025-01-15', '14:30', 'İstanbul Havalimanı', 'Beşiktaş', 'TK1234', '["Ahmet Yılmaz", "Ayşe Yılmaz"]', 2, 150.0, 'USD', '+90 532 111 22 33', 45.5, 'TK1234-001', 75.0, 'driver-1', 'user-2', 'RECEIVED', 'APPROVED', datetime('now')),
('res-2', 'tenant-1', '2025-01-16', '09:15', 'Sabiha Gökçen', 'Kadıköy', 'PC5678', '["Mehmet Demir"]', 1, 120.0, 'USD', '+90 533 222 33 44', 38.2, 'PC5678-002', 60.0, 'driver-2', 'user-2', 'PENDING', 'PENDING', datetime('now')),
('res-3', 'tenant-1', '2025-01-17', '16:45', 'Taksim', 'İstanbul Havalimanı', 'TK9012', '["Ali Kaya", "Fatma Kaya", "Zeynep Kaya"]', 3, 180.0, 'USD', '+90 534 333 44 55', 42.8, 'TK9012-003', 90.0, 'driver-3', 'user-2', 'RECEIVED', 'APPROVED', datetime('now'));

-- Aktiviteler oluştur
INSERT INTO Activity (id, tenantId, userId, action, entityType, entityId, description, details, ipAddress, userAgent, createdAt) 
VALUES 
('act-1', 'tenant-1', 'user-1', 'LOGIN', 'USER', 'user-1', 'Admin giriş yaptı', '{"loginTime": "2025-01-15T10:00:00Z"}', '192.168.1.1', 'Mozilla/5.0...', datetime('now')),
('act-2', 'tenant-1', 'user-2', 'CREATE', 'RESERVATION', 'res-1', 'Yeni rezervasyon oluşturuldu', '{"voucherNumber": "TK1234-001", "passengers": 2}', '192.168.1.2', 'Mozilla/5.0...', datetime('now')),
('act-3', 'tenant-1', 'user-3', 'UPDATE', 'RESERVATION', 'res-1', 'Şoför atandı', '{"driverId": "driver-1", "driverName": "Ahmet Yılmaz"}', '192.168.1.3', 'Mozilla/5.0...', datetime('now'));
