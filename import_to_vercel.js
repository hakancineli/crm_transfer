const fs = require('fs');
const path = require('path');

// Local veritabanından verileri oku
const reservationsData = fs.readFileSync('reservations.json', 'utf8');
const reservations = reservationsData.trim().split('\n').map(line => JSON.parse(line));

console.log(`Found ${reservations.length} reservations to import`);

// Vercel API endpoint'ine veri gönder
async function importToVercel() {
  const vercelUrl = 'https://crmtransferclone-r82fcw955-hakancinelis-projects.vercel.app';
  
  for (const reservation of reservations) {
    try {
      const response = await fetch(`${vercelUrl}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservation)
      });
      
      if (response.ok) {
        console.log(`✅ Imported reservation: ${reservation.voucherNumber}`);
      } else {
        console.log(`❌ Failed to import: ${reservation.voucherNumber} - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error importing ${reservation.voucherNumber}:`, error.message);
    }
  }
}

// Node.js fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

importToVercel();
