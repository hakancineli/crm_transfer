// E-posta gönderme servisi
export class EmailService {
  // E-posta gönder
  static async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      // Gerçek uygulamada burada e-posta servisi (SendGrid, Nodemailer, vb.) kullanılacak
      // Şimdilik console'a log yazdırıyoruz
      console.log('📧 E-posta Gönderiliyor:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('HTML:', html);
      console.log('Text:', text);
      
      // Simüle edilmiş başarı
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: 'E-posta başarıyla gönderildi'
      };
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
      return {
        success: false,
        error: 'E-posta gönderilemedi'
      };
    }
  }

  // Rezervasyon onay e-postası
  static async sendBookingConfirmation(booking: {
    voucherNumber: string;
    hotelName: string;
    hotelAddress: string;
    roomType: string;
    checkin: string;
    checkout: string;
    adults: number;
    children: number;
    rooms: number;
    totalPrice: number;
    currency: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    specialRequests?: string;
    bookingReference: string;
  }) {
    const checkinDate = new Date(booking.checkin).toLocaleDateString('tr-TR');
    const checkoutDate = new Date(booking.checkout).toLocaleDateString('tr-TR');
    const nights = Math.ceil(
      (new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / (1000 * 60 * 60 * 24)
    );

    const subject = `🏨 Rezervasyon Onayı - ${booking.voucherNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rezervasyon Onayı</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .voucher-number { font-size: 24px; font-weight: bold; color: #1976d2; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏨 ProTransfer</h1>
            <h2>Rezervasyon Onayı</h2>
            <p>Sayın ${booking.customerInfo.name}, rezervasyonunuz başarıyla oluşturulmuştur.</p>
          </div>
          
          <div class="content">
            <div class="voucher-number">
              Voucher No: ${booking.voucherNumber}
            </div>
            
            <div class="booking-details">
              <h3>🏨 Otel Bilgileri</h3>
              <div class="detail-row">
                <span class="detail-label">Otel Adı:</span>
                <span class="detail-value">${booking.hotelName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Adres:</span>
                <span class="detail-value">${booking.hotelAddress}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Oda Tipi:</span>
                <span class="detail-value">${booking.roomType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Rezervasyon No:</span>
                <span class="detail-value">${booking.bookingReference}</span>
              </div>
            </div>

            <div class="booking-details">
              <h3>📅 Rezervasyon Detayları</h3>
              <div class="detail-row">
                <span class="detail-label">Giriş Tarihi:</span>
                <span class="detail-value">${checkinDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Çıkış Tarihi:</span>
                <span class="detail-value">${checkoutDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Gece Sayısı:</span>
                <span class="detail-value">${nights} gece</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Oda Sayısı:</span>
                <span class="detail-value">${booking.rooms} oda</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Yetişkin:</span>
                <span class="detail-value">${booking.adults} kişi</span>
              </div>
              ${booking.children > 0 ? `
              <div class="detail-row">
                <span class="detail-label">Çocuk:</span>
                <span class="detail-value">${booking.children} kişi</span>
              </div>
              ` : ''}
            </div>

            <div class="booking-details">
              <h3>💰 Fiyat Bilgileri</h3>
              <div class="detail-row">
                <span class="detail-label">Gece başına:</span>
                <span class="detail-value">${(booking.totalPrice / (nights * booking.rooms)).toFixed(2)} ${booking.currency}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Gece sayısı:</span>
                <span class="detail-value">${nights} gece</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Oda sayısı:</span>
                <span class="detail-value">${booking.rooms} oda</span>
              </div>
              <div class="detail-row" style="border-bottom: 2px solid #1976d2; font-weight: bold; font-size: 18px;">
                <span class="detail-label">Toplam Tutar:</span>
                <span class="detail-value">${booking.totalPrice} ${booking.currency}</span>
              </div>
            </div>

            ${booking.specialRequests ? `
            <div class="booking-details">
              <h3>💬 Özel İstekler</h3>
              <p>${booking.specialRequests}</p>
            </div>
            ` : ''}

            <div class="highlight">
              <h3>⚠️ Önemli Notlar</h3>
              <ul>
                <li>Bu e-postayı otel girişinde göstermeniz gerekmektedir</li>
                <li>Rezervasyon iptal/değişiklik işlemleri için bizimle iletişime geçin</li>
                <li>Voucher numaranız: <strong>${booking.voucherNumber}</strong></li>
                <li>Rezervasyon referansınız: <strong>${booking.bookingReference}</strong></li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/accommodation/voucher/${booking.voucherNumber}" class="button">
                🖨️ Voucher'ı Görüntüle
              </a>
            </div>
          </div>

          <div class="footer">
            <p><strong>ProTransfer</strong> - Profesyonel Transfer ve Konaklama Hizmetleri</p>
            <p>📞 +90 555 123 45 67 | ✉️ info@protransfer.com</p>
            <p>E-posta Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Rezervasyon Onayı - ${booking.voucherNumber}

Sayın ${booking.customerInfo.name},

Rezervasyonunuz başarıyla oluşturulmuştur.

Voucher No: ${booking.voucherNumber}
Rezervasyon No: ${booking.bookingReference}

Otel Bilgileri:
- Otel: ${booking.hotelName}
- Adres: ${booking.hotelAddress}
- Oda Tipi: ${booking.roomType}

Rezervasyon Detayları:
- Giriş: ${checkinDate}
- Çıkış: ${checkoutDate}
- Gece Sayısı: ${nights} gece
- Oda Sayısı: ${booking.rooms} oda
- Yetişkin: ${booking.adults} kişi
${booking.children > 0 ? `- Çocuk: ${booking.children} kişi` : ''}

Fiyat Bilgileri:
- Gece başına: ${(booking.totalPrice / (nights * booking.rooms)).toFixed(2)} ${booking.currency}
- Toplam Tutar: ${booking.totalPrice} ${booking.currency}

${booking.specialRequests ? `Özel İstekler: ${booking.specialRequests}` : ''}

Önemli Notlar:
- Bu e-postayı otel girişinde göstermeniz gerekmektedir
- Rezervasyon iptal/değişiklik işlemleri için bizimle iletişime geçin
- Voucher numaranız: ${booking.voucherNumber}
- Rezervasyon referansınız: ${booking.bookingReference}

Voucher'ı görüntülemek için: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/accommodation/voucher/${booking.voucherNumber}

ProTransfer - Profesyonel Transfer ve Konaklama Hizmetleri
📞 +90 555 123 45 67 | ✉️ info@protransfer.com
    `;

    return await this.sendEmail(booking.customerInfo.email, subject, html, text);
  }

  // Rezervasyon iptal e-postası
  static async sendBookingCancellation(booking: {
    voucherNumber: string;
    hotelName: string;
    customerInfo: { name: string; email: string; phone: string; };
    cancellationReason?: string;
  }) {
    const subject = `❌ Rezervasyon İptali - ${booking.voucherNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rezervasyon İptali</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ ProTransfer</h1>
            <h2>Rezervasyon İptali</h2>
            <p>Sayın ${booking.customerInfo.name}, rezervasyonunuz iptal edilmiştir.</p>
          </div>
          
          <div class="content">
            <div class="booking-details">
              <h3>İptal Edilen Rezervasyon</h3>
              <p><strong>Voucher No:</strong> ${booking.voucherNumber}</p>
              <p><strong>Otel:</strong> ${booking.hotelName}</p>
              ${booking.cancellationReason ? `<p><strong>İptal Nedeni:</strong> ${booking.cancellationReason}</p>` : ''}
            </div>

            <div class="booking-details">
              <h3>İade İşlemleri</h3>
              <p>İade işlemleri 3-5 iş günü içinde tamamlanacaktır.</p>
              <p>Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>ProTransfer</strong> - Profesyonel Transfer ve Konaklama Hizmetleri</p>
            <p>📞 +90 555 123 45 67 | ✉️ info@protransfer.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Rezervasyon İptali - ${booking.voucherNumber}

Sayın ${booking.customerInfo.name},

Rezervasyonunuz iptal edilmiştir.

Voucher No: ${booking.voucherNumber}
Otel: ${booking.hotelName}
${booking.cancellationReason ? `İptal Nedeni: ${booking.cancellationReason}` : ''}

İade İşlemleri:
İade işlemleri 3-5 iş günü içinde tamamlanacaktır.
Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.

ProTransfer - Profesyonel Transfer ve Konaklama Hizmetleri
📞 +90 555 123 45 67 | ✉️ info@protransfer.com
    `;

    return await this.sendEmail(booking.customerInfo.email, subject, html, text);
  }

  // Rezervasyon değişiklik e-postası
  static async sendBookingModification(booking: {
    voucherNumber: string;
    hotelName: string;
    customerInfo: { name: string; email: string; phone: string; };
    changes: string;
  }) {
    const subject = `🔄 Rezervasyon Değişikliği - ${booking.voucherNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rezervasyon Değişikliği</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔄 ProTransfer</h1>
            <h2>Rezervasyon Değişikliği</h2>
            <p>Sayın ${booking.customerInfo.name}, rezervasyonunuzda değişiklik yapılmıştır.</p>
          </div>
          
          <div class="content">
            <div class="booking-details">
              <h3>Değişiklik Detayları</h3>
              <p><strong>Voucher No:</strong> ${booking.voucherNumber}</p>
              <p><strong>Otel:</strong> ${booking.hotelName}</p>
              <p><strong>Yapılan Değişiklikler:</strong></p>
              <p>${booking.changes}</p>
            </div>

            <div class="booking-details">
              <h3>Güncellenmiş Rezervasyon</h3>
              <p>Güncellenmiş rezervasyon bilgilerinizi voucher sayfasından görüntüleyebilirsiniz.</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>ProTransfer</strong> - Profesyonel Transfer ve Konaklama Hizmetleri</p>
            <p>📞 +90 555 123 45 67 | ✉️ info@protransfer.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Rezervasyon Değişikliği - ${booking.voucherNumber}

Sayın ${booking.customerInfo.name},

Rezervasyonunuzda değişiklik yapılmıştır.

Voucher No: ${booking.voucherNumber}
Otel: ${booking.hotelName}

Yapılan Değişiklikler:
${booking.changes}

Güncellenmiş rezervasyon bilgilerinizi voucher sayfasından görüntüleyebilirsiniz.

ProTransfer - Profesyonel Transfer ve Konaklama Hizmetleri
📞 +90 555 123 45 67 | ✉️ info@protransfer.com
    `;

    return await this.sendEmail(booking.customerInfo.email, subject, html, text);
  }
}
