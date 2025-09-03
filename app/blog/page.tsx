import Link from "next/link";

export default function BlogIndexPage() {
  const posts = [
    {
      slug: "istanbul-havalimani-transfer-rehberi-2025",
      title: "İstanbul Havalimanı Transfer Rehberi 2025",
      excerpt:
        "İstanbul Havalimanı ve Sabiha Gökçen için VIP transfer rehberi, fiyatlar ve sık sorulanlar.",
    },
    {
      slug: "saw-havalimani-transfer-fiyatlari",
      title: "SAW Havalimanı Transfer Fiyatları ve Rezervasyon",
      excerpt:
        "Sabiha Gökçen (SAW) için sabit fiyatlı VIP transfer; fiyat aralıkları ve rezervasyon adımları.",
    },
    {
      slug: "vip-transfer-istanbul",
      title: "VIP Transfer İstanbul - Lüks ve Konforlu Seyahat",
      excerpt:
        "Mercedes Vito VIP ile İstanbul içinde ve şehirler arası konforlu ulaşım rehberi.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blog</h1>
      <p className="mt-3 text-gray-600">
        İstanbul Havalimanı (IST) ve Sabiha Gökçen (SAW) transferi, VIP hizmetler ve fiyatlar hakkında
        güncel makaleler.
      </p>
      <div className="mt-8 space-y-6">
        {posts.map((p) => (
          <article key={p.slug} className="border rounded-lg p-5 bg-white shadow-sm">
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="mt-2 text-gray-600">{p.excerpt}</p>
            <div className="mt-4">
              <Link
                href={`/blog/${p.slug}`}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Oku
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


