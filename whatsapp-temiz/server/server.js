const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// SQLite veritabanı başlatma
const db = new sqlite3.Database('whatsapp.db');

// Veritabanı tablolarını oluştur
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS message_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS sent_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// WhatsApp client
let client = null;
let qrCodeData = null;
let isConnected = false;

// Progress tracking
let currentSendingProgress = {
  current: 0,
  total: 0,
  successCount: 0,
  errorCount: 0,
  isActive: false
};

// WhatsApp client başlatma
function initializeWhatsApp() {
  console.log('initializeWhatsApp fonksiyonu çağrıldı');
  
  // Önceki client'ı temizle
  if (client) {
    try {
      client.destroy();
    } catch (e) {
      console.error('Önceki client destroy hatası:', e);
    }
  }
  
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      timeout: 60000
    }
  });

  client.on('qr', async (qr) => {
    try {
      qrCodeData = await qrcode.toDataURL(qr);
      console.log('QR kod oluşturuldu');
    } catch (err) {
      console.error('QR kod oluşturma hatası:', err);
    }
  });

  client.on('ready', () => {
    console.log('WhatsApp client hazır!');
    isConnected = true;
  });

  client.on('disconnected', () => {
    console.log('WhatsApp bağlantısı kesildi');
    isConnected = false;
    qrCodeData = null; // QR kodunu sıfırla
    // Otomatik yeniden başlat
    setTimeout(() => {
      try {
        if (client) {
          client.destroy();
        }
      } catch (e) {
        console.error('Client destroy sırasında hata:', e);
      }
      initializeWhatsApp();
    }, 3000); // 3 saniye bekle
  });

  client.on('auth_failure', (msg) => {
    console.error('Kimlik doğrulama hatası:', msg);
  });

  client.on('error', (err) => {
    console.error('WhatsApp istemci hatası:', err);
    // Hata durumunda yeniden başlat
    setTimeout(() => {
      try {
        if (client) {
          client.destroy();
        }
      } catch (e) {
        console.error('Error handler destroy hatası:', e);
      }
      initializeWhatsApp();
    }, 5000);
  });

  client.on('change_state', (state) => {
    console.log('İstemci durumu değişti:', state);
  });

  client.initialize();
}

// API Routes

// QR kod al
app.get('/api/qr', (req, res) => {
  if (!client) {
    initializeWhatsApp();
  }
  
  if (qrCodeData) {
    res.json({ qr: qrCodeData });
  } else {
    res.json({ qr: null, message: 'QR kod henüz hazır değil' });
  }
});

// Bağlantı durumu
app.get('/api/status', (req, res) => {
  res.json({ connected: isConnected });
});

// Progress durumu
app.get('/api/progress', (req, res) => {
  res.json(currentSendingProgress);
});

// Mesaj şablonu kaydet
app.post('/api/templates', (req, res) => {
  const { name, content } = req.body;
  
  if (!name || !content) {
    return res.status(400).json({ error: 'İsim ve içerik gerekli' });
  }

  db.run('INSERT INTO message_templates (name, content) VALUES (?, ?)', 
    [name, content], function(err) {
      if (err) {
        res.status(500).json({ error: 'Şablon kaydedilemedi' });
      } else {
        res.json({ id: this.lastID, name, content });
      }
    });
});

// Mesaj şablonlarını listele
app.get('/api/templates', (req, res) => {
  db.all('SELECT * FROM message_templates ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Şablonlar alınamadı' });
    } else {
      res.json(rows);
    }
  });
});

// Toplu mesaj gönder
app.post('/api/send-bulk', async (req, res) => {
  const { numbers, message, delay } = req.body;
  
  if (!isConnected) {
    return res.status(400).json({ error: 'WhatsApp bağlı değil' });
  }
  
  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'Geçerli numara listesi gerekli' });
  }
  
  if (!message) {
    return res.status(400).json({ error: 'Mesaj içeriği gerekli' });
  }

  // Progress'i başlat
  currentSendingProgress = {
    current: 0,
    total: numbers.length,
    successCount: 0,
    errorCount: 0,
    isActive: true
  };

  const delayMs = (delay || 5) * 1000; // saniyeyi milisaniyeye çevir
  const results = [];

  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i].replace(/\D/g, ''); // Sadece rakamları al
    
    try {
      // Numara formatını kontrol et
      if (number.length < 10) {
        results.push({ number: numbers[i], success: false, error: 'Geçersiz numara formatı' });
        currentSendingProgress.errorCount++;
      } else {
        // WhatsApp formatına çevir (ülke kodu ile)
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        
        // Mesaj gönder
        await client.sendMessage(formattedNumber, message);
        
        // Gönderilen mesajı veritabanına kaydet
        db.run('INSERT INTO sent_messages (phone_number, message) VALUES (?, ?)', 
          [numbers[i], message]);
        
        results.push({ number: numbers[i], success: true });
        currentSendingProgress.successCount++;
      }
      
      // Progress'i güncelle
      currentSendingProgress.current = i + 1;
      
      // Gecikme (son mesaj hariç)
      if (i < numbers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
    } catch (error) {
      console.error(`Mesaj gönderme hatası (${numbers[i]}):`, error);
      results.push({ number: numbers[i], success: false, error: error.message });
      currentSendingProgress.errorCount++;
      currentSendingProgress.current = i + 1;
    }
  }

  // Progress'i tamamla
  currentSendingProgress.isActive = false;

  res.json({ results });
});

// Gönderilen mesajları listele
app.get('/api/sent-messages', (req, res) => {
  db.all('SELECT * FROM sent_messages ORDER BY sent_at DESC LIMIT 100', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Gönderilen mesajlar alınamadı' });
    } else {
      res.json(rows);
    }
  });
});

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log('WhatsApp client başlatılıyor...');
  initializeWhatsApp();
}); 