export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Teşekkürler!</h1>
                <p className="text-gray-600 mb-6">
                    Rezervasyon talebiniz başarıyla alındı. Fiyatınız seçtiğiniz para biriminde hesaplandı ve kaydedildi.
                </p>
                
                {/* Voucher Number Display */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-green-800 mb-2">Rezervasyon Bilgileri</h2>
                    <div className="text-sm text-green-700">
                        <p className="mb-2">Voucher numaranız:</p>
                        <div className="text-lg font-mono font-bold text-green-800 bg-white px-3 py-2 rounded border">
                            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('voucher') || 'XXXXXX'}
                        </div>
                    </div>
                </div>

                {/* Reservation Lookup Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-800 mb-2">Rezervasyon Durumu</h2>
                    <p className="text-sm text-blue-700 mb-2">
                        Rezervasyon durumunuzu sorgulamak için:
                    </p>
                    <ul className="text-xs text-blue-600 text-left space-y-1 mb-3">
                        <li>• Voucher numaranızı kullanarak</li>
                        <li>• Telefon numaranızla</li>
                    </ul>
                    <a 
                        href="/customer-reservation" 
                        className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm"
                    >
                        Rezervasyon Durumu Sorgula
                    </a>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-800 mb-2">Sonraki Adımlar:</h2>
                    <ul className="text-sm text-blue-700 text-left space-y-1">
                        <li>• Talebiniz onaylandı ve fiyat belirlendi</li>
                        <li>• Seçtiğiniz para biriminde (TRY/USD/EUR) fiyat kaydedildi</li>
                        <li>• Telefon ile bilgilendirme yapılacak</li>
                        <li>• Onayınız sonrası rezervasyon tamamlanacak</li>
                    </ul>
                </div>

                <div className="text-sm text-gray-600 mb-6">
                    <p className="mb-2">Herhangi bir sorunuz varsa:</p>
                    <a 
                        href="https://wa.me/905545812034?text=Merhaba, rezervasyon talebim hakkında bilgi almak istiyorum." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition mb-4"
                    >
                        WhatsApp ile mesaj gönder
                    </a>
                    <p className="text-xs text-gray-500">+90 554 581 20 34</p>
                </div>

                <a 
                    href="/customer-reservation" 
                    className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                    Yeni Talep Oluştur
                </a>
            </div>
        </div>
    );
}
