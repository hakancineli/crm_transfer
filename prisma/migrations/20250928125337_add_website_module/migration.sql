-- CreateTable
CREATE TABLE "public"."tenant_websites" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "domain" TEXT,
    "subdomain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "customCSS" TEXT,
    "favicon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."website_pages" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isHomepage" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."website_settings" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logo" TEXT,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroImage" TEXT,
    "contactInfo" JSONB NOT NULL,
    "socialMedia" JSONB NOT NULL,
    "seoSettings" JSONB NOT NULL,
    "colorScheme" JSONB NOT NULL,
    "customCSS" TEXT,
    "analyticsCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."website_sections" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_websites_domain_key" ON "public"."tenant_websites"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_websites_subdomain_key" ON "public"."tenant_websites"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "website_pages_websiteId_slug_key" ON "public"."website_pages"("websiteId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "website_settings_websiteId_key" ON "public"."website_settings"("websiteId");

-- CreateIndex
CREATE UNIQUE INDEX "website_sections_websiteId_sectionType_key" ON "public"."website_sections"("websiteId", "sectionType");

-- AddForeignKey
ALTER TABLE "public"."tenant_websites" ADD CONSTRAINT "tenant_websites_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."website_pages" ADD CONSTRAINT "website_pages_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."tenant_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."website_settings" ADD CONSTRAINT "website_settings_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."tenant_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."website_sections" ADD CONSTRAINT "website_sections_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "public"."tenant_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
