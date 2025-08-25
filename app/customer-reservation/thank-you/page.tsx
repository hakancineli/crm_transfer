export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Teşekkürler!</h1>
                <p className="text-gray-600 mb-6">
                    Rezervasyon talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-800 mb-2">Sonraki Adımlar:</h2>
                    <ul className="text-sm text-blue-700 text-left space-y-1">
                        <li>• Talebinizi değerlendiriyoruz</li>
                        <li>• Size en uygun fiyatı sunuyoruz</li>
                        <li>• Telefon ile bilgilendirme yapıyoruz</li>
                        <li>• Onayınız sonrası rezervasyonu tamamlıyoruz</li>
                    </ul>
                </div>

                <div className="text-sm text-gray-600">
                    <p>Herhangi bir sorunuz varsa:</p>
                    <div className="mt-2 flex flex-col items-center gap-2">
                        <a
                            href={`https://wa.me/905545812034?text=${encodeURIComponent('Merhaba, rezervasyon talebim hakkında bilgi almak istiyorum.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors w-full text-center"
                        >
                            WhatsApp ile mesaj gönder
                        </a>
                        <a
                            href="tel:+905545812034"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            +90 554 581 20 34
                        </a>
                    </div>
                </div>

                <div className="mt-6">
                    <a 
                        href="/customer-reservation" 
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Yeni Talep Oluştur
                    </a>
                </div>
            </div>
        </div>
    );
}
