-- Backfill tenantId on existing reservations
-- ProTransfer as default owner of existing data
UPDATE reservations SET tenantId = (SELECT id FROM tenants WHERE subdomain='protransfer') WHERE tenantId IS NULL;


