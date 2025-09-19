// Telegram bildirimi servisi
export interface TelegramNotification {
  type: 'new_reservation' | 'reservation_updated' | 'reservation_cancelled' | 'driver_assigned';
  reservation: {
    voucherNumber: string;
    date: string;
    time: string;
    from: string;
    to: string;
    passengerNames: string[];
    price: number;
    currency: string;
  };
}

export async function sendTelegramNotification(notification: TelegramNotification) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('Telegram bot token veya chat ID bulunamadı');
      return;
    }
    
    let message = '';
    
    switch (notification.type) {
      case 'new_reservation':
        message = `🆕 *Yeni Rezervasyon*\n\n` +
          `📋 Voucher: \`${notification.reservation.voucherNumber}\`\n` +
          `📅 Tarih: ${notification.reservation.date}\n` +
          `🕐 Saat: ${notification.reservation.time}\n` +
          `🚗 Güzergah: ${notification.reservation.from} → ${notification.reservation.to}\n` +
          `👥 Yolcular: ${notification.reservation.passengerNames.join(', ')}\n` +
          `💰 Fiyat: ${notification.reservation.price} ${notification.reservation.currency}`;
        break;
        
      case 'reservation_updated':
        message = `🔄 *Rezervasyon Güncellendi*\n\n` +
          `📋 Voucher: \`${notification.reservation.voucherNumber}\`\n` +
          `📅 Tarih: ${notification.reservation.date}\n` +
          `🕐 Saat: ${notification.reservation.time}\n` +
          `🚗 Güzergah: ${notification.reservation.from} → ${notification.reservation.to}\n` +
          `👥 Yolcular: ${notification.reservation.passengerNames.join(', ')}\n` +
          `💰 Fiyat: ${notification.reservation.price} ${notification.reservation.currency}`;
        break;
        
      case 'reservation_cancelled':
        message = `❌ *Rezervasyon İptal Edildi*\n\n` +
          `📋 Voucher: \`${notification.reservation.voucherNumber}\`\n` +
          `📅 Tarih: ${notification.reservation.date}\n` +
          `🕐 Saat: ${notification.reservation.time}\n` +
          `🚗 Güzergah: ${notification.reservation.from} → ${notification.reservation.to}`;
        break;
        
      case 'driver_assigned':
        message = `👨‍💼 *Şoför Atandı*\n\n` +
          `📋 Voucher: \`${notification.reservation.voucherNumber}\`\n` +
          `📅 Tarih: ${notification.reservation.date}\n` +
          `🕐 Saat: ${notification.reservation.time}\n` +
          `🚗 Güzergah: ${notification.reservation.from} → ${notification.reservation.to}`;
        break;
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API hatası:', errorData);
    } else {
      console.log('Telegram bildirimi başarıyla gönderildi');
    }
    
  } catch (error) {
    console.error('Telegram bildirimi gönderilirken hata:', error);
  }
}
