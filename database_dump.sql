PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('08071f98-f9fc-4e46-bc8f-fa9515276e8a','96fe987b163f6cf89ab42929bc0f7caaea023e01cbd05f929cfeb7dc396c3ab7',1741310202544,'20250307011642_add_driver_model',NULL,NULL,1741310202542,1);
INSERT INTO _prisma_migrations VALUES('9fbcc0b4-a9f1-49d8-8a9a-e085eb93248c','f99535484f6d437cf261bc75a887f6619182627eaab76c736bc88cb9664c8f5d',1741386572371,'20250307222932_add_phone_number',NULL,NULL,1741386572370,1);
INSERT INTO _prisma_migrations VALUES('8715a759-b947-4411-8254-74025c278c58','ff6f6dfc50f0ad35bd318f7e7242209a4aaf488b73f41a5ccee452655a0c49b6',1741390361216,'20250307233241_add_payment_status',NULL,NULL,1741390361214,1);
INSERT INTO _prisma_migrations VALUES('5f928e33-af65-455e-8041-c9fe62f11957','59ce4218025f087aa498eca26ea979beb4f805148ffe06cb6c4609a52512766d',1741557336257,'20250309215536_add_return_fields',NULL,NULL,1741557336255,1);
CREATE TABLE IF NOT EXISTS "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Driver VALUES('5389ca6c-8bd3-40e7-8949-9c39c4a118da','EMRE ÖZ','‪+90 537 403 94 35‬',1756068881561);
INSERT INTO Driver VALUES('908b4ecd-1e5b-4039-aa63-064bc6a7efea','ERMRE ÖZ','‪+90 537 403 94 35‬',1756068901822);
INSERT INTO Driver VALUES('f67d3657-2928-4a69-bc03-25765cfa3fb4','Gokhan ','05435790237',1755936317926);
INSERT INTO Driver VALUES('a435478d-ef71-47e7-abdd-221682910bb6','Gökhan ortaç','+90 530 877 67 77',1756423466635);
INSERT INTO Driver VALUES('083768b8-f926-42b6-9803-9b50738de6a8','Hakan Çineli','05555555555',1756402888842);
INSERT INTO Driver VALUES('02278577-d05c-47c5-89f2-f11a8b42cb65','LEVENT','+90 543 328 11 20',1756554430583);
INSERT INTO Driver VALUES('c1b8a422-8cd9-44fa-b558-b6c4b753acfc','Ramazan kader','+90 536 571 34 33',1756420517863);
INSERT INTO Driver VALUES('a7f0060e-08cf-4169-be87-0dd2ce26e0c1','SADIK DEDAR','05346852103',1755801748926);
INSERT INTO Driver VALUES('dfc622c7-7f55-4749-b1e1-0e387c13397d','Yusuf','+90 539 892 29 21',1755772984953);
INSERT INTO Driver VALUES('72f37a96-ebcb-441e-85b0-d89354a5dcb9','necati','‪+90 554 028 14 06‬',1756821679055);
INSERT INTO Driver VALUES('e49f4392-4c01-4900-a7ea-81acf8c399f5','necati','‪+90 554 028 14 06‬',1756821786282);
INSERT INTO Driver VALUES('985ea079-ac54-4272-b88a-2e5550bffc12','yusuf canlikaya','‪+90 531 796 00 13‬',1755860259763);
INSERT INTO Driver VALUES('c6af571e-f630-4cf5-8e09-00edc92805e4','yusuf canlikaya ','+90 531 796 00 13‬',1755893778610);
INSERT INTO Driver VALUES('dd98e599-89d5-4aee-8c65-9f2a9145a114','~Necati Demir','‪+90 554 028 14 06‬',1756658957622);
CREATE TABLE IF NOT EXISTS "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "flightCode" TEXT NOT NULL,
    "passengerNames" TEXT NOT NULL,
    "luggageCount" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "voucherNumber" TEXT NOT NULL,
    "driverFee" REAL,
    "driverId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnTransferId" TEXT,
    "isReturn" BOOLEAN NOT NULL DEFAULT false, "distanceKm" REAL,
    CONSTRAINT "Reservation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_returnTransferId_fkey" FOREIGN KEY ("returnTransferId") REFERENCES "Reservation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO Reservation VALUES('a46e5c04-0248-4945-b122-78a3eb1a1d4e','2025-09-08','21:00','Ibis Merter Hotel','IST','305 23','["Benabdallah Wissem, Zakaria Nadji Nasrallah, Nadji Mouad Nadji"]',4,40.0,'USD','+212 609-343312','VIP20250831-2',1000.0,'72f37a96-ebcb-441e-85b0-d89354a5dcb9','PENDING',1756664060277,NULL,0,NULL);
INSERT INTO Reservation VALUES('79e15393-9917-44ac-a1ff-02ada68087b1','2025-09-06','06:00','Centro Westside By Rotana','IST','TK493','["Hicham Nadji Benabdallah"]',4,40.0,'USD','+213 770 98 62 97','VIP20250831-3',1000.0,'e49f4392-4c01-4900-a7ea-81acf8c399f5','PAID',1756667633774,NULL,0,NULL);
INSERT INTO Reservation VALUES('c24e7ec5-5767-41d3-93ea-74a4f39e3e42','2025-08-31','18:10','İstanbul Havalimanı','Centro Westside By Rotana','TK2423','[]',5,40.0,'USD','+213 770 98 62 97','VIP20250831-1',1000.0,'dd98e599-89d5-4aee-8c65-9f2a9145a114','PAID',1756629588550,NULL,0,NULL);
INSERT INTO Reservation VALUES('6e41ec92-f068-4b68-a9a1-49552c30ca35','2025-08-30','15:00','beyoğlu','IST','tk111','[]',2,35.0,'USD','‪+971 56 169 3329‬','VIP20250830-1',1000.0,'02278577-d05c-47c5-89f2-f11a8b42cb65','PAID',1756554404417,NULL,0,NULL);
INSERT INTO Reservation VALUES('d527872b-8088-4945-927b-841a5c0690ac','2025-08-28','23:59','İstanbul Havalimanı (IST), Tayakadın, Terminal Caddesi, Arnavutköy/i̇stanbul','Venezia Mega Outlet, Karadeniz, Eski Edirne Asfaltı, Gaziosmanpaşa/i̇stanbul','TK000','["Taha Nagat Nouriyah Fatma Rashida"]',8,40.0,'USD','+218 94-5278868','VIP20250828-5',1000.0,'a435478d-ef71-47e7-abdd-221682910bb6','PAID',1756422580748,NULL,0,33.88300000000000268);
INSERT INTO Reservation VALUES('f7299f5c-8357-4708-83d9-4b46df7500fa','2025-08-28','23:59','İstanbul Havalimanı (IST), Tayakadın, Terminal Caddesi, Arnavutköy/i̇stanbul','Nişantaşı, Teşvikiye, Şişli/i̇stanbul','TK0963','["Mehmet Ali Çatal"]',0,1700.0,'TRY','05302541991','VIP20250828-4',1000.0,'c1b8a422-8cd9-44fa-b558-b6c4b753acfc','PAID',1756401617186,NULL,0,41.44800000000000039);
INSERT INTO Reservation VALUES('4e9da7d2-7b18-42e6-89ed-782e4b46784e','2025-08-23','11:00','bethooven hotel','IST','','[]',3,35.0,'USD','+218 92-5034180','VIP20250823-1',1100.0,'f67d3657-2928-4a69-bc03-25765cfa3fb4','PAID',1755870616608,NULL,0,NULL);
INSERT INTO Reservation VALUES('5f723200-d63b-4343-a72e-5abde53f30e7','2025-08-22','20:45','IST','Yakuplu, Beylikdüzü, ISTANBUL','TK1666','["Dr Abdulraouf Mannaa"]',2,1600.0,'TRY','+966555617255','VIP20250822-3',1099.970000000000027,'c6af571e-f630-4cf5-8e09-00edc92805e4','PAID',1755863921310,NULL,0,NULL);
INSERT INTO Reservation VALUES('364ef1d3-da0c-4285-9821-f1caa7e822f6','2025-08-22','13:00','IST','Fati̇h- Hotel Is Fehmi Bey','TK721','["Mary, Batool, Kumayl. Last Name İs Rizvi."]',2,35.0,'USD','+1 (647) 865-0253','VIP20250822-2',999.990000000000009,'985ea079-ac54-4272-b88a-2e5550bffc12','PAID',1755857000305,NULL,0,NULL);
INSERT INTO Reservation VALUES('c48a5f3b-96bb-4594-8bf0-3a6c3eb5b9c3','2025-08-22','00:59','Park Mavera Kayaşehir’e','IST','TK00','["Safa Al-muzel Wafah","Hellami Alriqabi"]',2,35.0,'USD','+90 536 701 37 99','VIP20250822-1',999.990000000000009,'a7f0060e-08cf-4169-be87-0dd2ce26e0c1','PAID',1755782118611,NULL,0,NULL);
INSERT INTO Reservation VALUES('3135f1ec-a15c-47d6-a1b4-bf558a458189','2025-08-21','23:59','Esenyurt','IST','TK1111','["Ennasser Mohamed.","Ennasser İkram.","Rahmoun Rachida"]',3,40.0,'USD','+212 664-620238','VIP20250821-1',1200.0,'dfc622c7-7f55-4749-b1e1-0e387c13397d','PAID',1755772666852,NULL,0,NULL);
CREATE UNIQUE INDEX "Reservation_voucherNumber_key" ON "Reservation"("voucherNumber");
CREATE UNIQUE INDEX "Reservation_returnTransferId_key" ON "Reservation"("returnTransferId");
COMMIT;
