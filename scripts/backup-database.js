#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = `backup_${timestamp}.sql`;
const backupPath = path.join(BACKUP_DIR, backupFile);

console.log('🔄 Starting database backup...');
console.log(`📁 Backup directory: ${BACKUP_DIR}`);
console.log(`📄 Backup file: ${backupFile}`);

try {
  // Create SQL dump
  console.log('📊 Creating SQL dump...');
  execSync(`pg_dump "${DATABASE_URL}" > "${backupPath}"`, { stdio: 'inherit' });
  
  // Compress backup
  console.log('🗜️ Compressing backup...');
  execSync(`gzip "${backupPath}"`, { stdio: 'inherit' });
  
  const compressedFile = `${backupPath}.gz`;
  const stats = fs.statSync(compressedFile);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Backup completed successfully!');
  console.log(`📦 File: ${compressedFile}`);
  console.log(`📏 Size: ${fileSizeInMB} MB`);
  
  // Clean old backups (keep last 30 days)
  console.log('🧹 Cleaning old backups...');
  const files = fs.readdirSync(BACKUP_DIR);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  files.forEach(file => {
    if (file.startsWith('backup_') && file.endsWith('.sql.gz')) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old backup: ${file}`);
      }
    }
  });
  
  console.log('🎉 Backup process completed!');
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
