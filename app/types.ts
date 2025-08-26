export type Airport = keyof typeof AIRPORTS;
export type Hotel = keyof typeof HOTELS;
export type Currency = keyof typeof CURRENCIES;
export type TransferType = keyof typeof TRANSFER_TYPES;

export const AIRPORTS = {
	'IST': 'İstanbul Havalimanı',
	'SAW': 'Sabiha Gökçen Havalimanı',
	'ADB': 'İzmir Adnan Menderes Havalimanı',
	'AYT': 'Antalya Havalimanı'
} as const;

export const HOTELS = {
	// Taksim - Beyoğlu Bölgesi
	'CVK_PARK_BOSPHORUS': 'CVK Park Bosphorus Hotel',
	'HILTON_TAKSIM': 'Hilton Istanbul Bosphorus',
	'INTERCONTINENTAL': 'InterContinental Istanbul',
	'DIVAN_TAKSIM': 'Divan Istanbul',
	'MARMARA_TAKSIM': 'The Marmara Taksim',
	'GRAND_HYATT': 'Grand Hyatt Istanbul',
	'AHS_ATLAS': 'AHS Atlas Taksim',
	'GOLDEN_AGE': 'Golden Age Hotel',
	'GRAND_OZTANIK': 'Grand Öztanık Hotel',
	'RICHMOND_ISTANBUL': 'Richmond Istanbul',
	'LARES_PARK': 'Lares Park Hotel',
	'TAXIM_HILL': 'Taxim Hill Hotel',
	'AVANTGARDE_TAKSIM': 'Avantgarde Taksim Hotel',
	'ELITE_WORLD': 'Elite World Istanbul Hotel',
	'CARTOON_TAKSIM': 'Cartoon Hotel Taksim',
	'TAKSIM_STAR': 'Taksim Star Hotel',
	'MIRROR_HOTEL': 'Mirror Hotel',
	'GRAND_WASHINGTON': 'Grand Washington Hotel',
	'TAKSIM_GONEN': 'Gönen Hotel Taksim',
	'METROPOLITAN': 'Metropolitan Hotels Taksim',
	'GRAND_ARAS': 'Grand Aras Hotel & Suites',
	'CITY_CENTER': 'City Center Hotel Istanbul',
	
	// Beşiktaş - Boğaz Bölgesi
	'FOUR_SEASONS_BOSPHORUS': 'Four Seasons Hotel Istanbul at the Bosphorus',
	'CIRAGAN_PALACE': 'Çırağan Palace Kempinski',
	'SHANGRI_LA': 'Shangri-La Bosphorus',
	'RITZ_CARLTON': 'The Ritz-Carlton Istanbul',
	'WISSOTEL_BOSPHORUS': 'Swissotel The Bosphorus',
	'CONRAD_ISTANBUL': 'Conrad Istanbul Bosphorus',
	'RADISSON_BOSPHORUS': 'Radisson Blu Bosphorus Hotel',
	'BEBEK_HOTEL': 'Bebek Hotel By The Stay',
	'GEZI_HOTEL': 'Gezi Hotel Bosphorus',
	'W_ISTANBUL': 'W Istanbul Hotel',
	'GRAND_TARABYA': 'The Grand Tarabya',
	'SUMAHAN': 'Sumahan on the Bosphorus',
	'RADISSON_ORTAKOY': 'Radisson Blu Hotel Ortaköy',
	'BOSPHORUS_PALACE': 'Bosphorus Palace Hotel',
	'BEYAZ_KONAK': 'Beyaz Konak Hotel',
	'MARITIME_HOTEL': 'Maritime Hotel Istanbul',
	
	// Şişli - Levent - Maslak Bölgesi
	'RENAISSANCE_POLAT': 'Renaissance Polat Istanbul Hotel',
	'DEDEMAN_ISTANBUL': 'Dedeman Istanbul',
	'POINT_HOTEL': 'The Point Hotel Barbaros',
	'FAIRMONT_QUASAR': 'Fairmont Quasar Istanbul',
	'RAFFLES_ISTANBUL': 'Raffles Istanbul',
	'HILTON_MASLAK': 'Hilton Istanbul Maslak',
	'MERCURE_BOMONTI': 'Mercure Istanbul Bomonti',
	'DIVAN_ISTANBUL_CITY': 'Divan Istanbul City',
	'SHERATON_LEVENT': 'Sheraton Istanbul Levent',
	'MÖVENPICK_ISTANBUL': 'Mövenpick Hotel Istanbul',
	'METROPOLITAN_CITYHOTEL': 'Metropolitan Hotels City',
	'CLARION_MAHMUTBEY': 'Clarion Hotel Istanbul Mahmutbey',
	'TRYP_ISTANBUL': 'TRYP by Wyndham Istanbul',
	'SURMELI_ISTANBUL': 'Surmeli Istanbul Hotel',
	'HOLIDAY_INN_SISLI': 'Holiday Inn Istanbul Şişli',
	'ACE_HOTEL': 'Ace Hotel Istanbul',
	
	// Havalimanı - Bakırköy - Yeşilköy Bölgesi
	'CROWNE_PLAZA_FLORYA': 'Crowne Plaza Istanbul Florya',
	'RENAISSANCE_AIRPORT': 'Renaissance Istanbul Airport Hotel',
	'RADISSON_BLU_AIRPORT': 'Radisson Blu Conference & Airport Hotel',
	'WOW_ISTANBUL': 'WOW Istanbul Hotel',
	'HOLIDAY_INN_AIRPORT': 'Holiday Inn Istanbul Airport',
	'AIR_BOSS': 'Air Boss Hotel',
	'YESILKOY_AIRPORT': 'Yeşilköy Airport Hotel',
	'PARK_INN_AIRPORT': 'Park Inn by Radisson Istanbul Airport',
	'COURTYARD_AIRPORT': 'Courtyard Istanbul International Airport',
	'HILTON_GARDEN_AIRPORT': 'Hilton Garden Inn Istanbul Airport',
	'TEMPO_AIRPORT': 'Tempo Fair Suites Airport',
	'ELITE_WORLD_BUSINESS': 'Elite World Business Hotel',
	'RAMADA_AIRPORT': 'Ramada Istanbul Airport',
	'IBIS_AIRPORT': 'Ibis Istanbul Airport',
	
	// Sultanahmet - Fatih - Tarihi Yarımada
	'FOUR_SEASONS_SULTANAHMET': 'Four Seasons Hotel Istanbul at Sultanahmet',
	'AJWA_SULTANAHMET': 'AJWA Hotel Sultanahmet',
	'LEVNI_HOTEL': 'Levni Hotel & Spa',
	'SURA_HAGIA_SOPHIA': 'Sura Hagia Sophia Hotel',
	'ARMADA_HOTEL': 'Armada Istanbul Old City Hotel',
	'YASMAK_SULTAN': 'Yasmak Sultan Hotel',
	'CELAL_SULTAN': 'Celal Sultan Hotel',
	'ARENA_HOTEL': 'Arena Hotel Istanbul',
	'SULTANHAN_HOTEL': 'Sultanhan Hotel',
	'RECITAL_HOTEL': 'Recital Hotel',
	'GOLDEN_HORN': 'Golden Horn Hotel',
	'DOSSO_DOSSI_OLD_CITY': 'Dosso Dossi Hotels Old City',
	'GRAND_ANKA': 'Grand Anka Hotel',
	'BEYAZ_SARAY': 'Beyaz Saray Hotel',
	'GRAND_YAVUZ': 'Grand Yavuz Hotel',
	'MARINEM_HOTEL': 'Marinem Istanbul Hotel',
	'ANTEA_PALACE': 'Antea Palace Hotel & Spa',
	'GRAND_DURMAZ': 'Grand Durmaz Hotel',
	'MANESOL_OLD_CITY': 'Manesol Old City Bosphorus',
	'GRAND_MARCELLO': 'Grand Marcello Hotel',
	'ZURICH_HOTEL': 'Zurich Hotel',
	'GRAND_SAGCANLAR': 'Grand Sagcanlar Hotel',
	'GRAND_NARIN': 'Grand Narin Hotel',
	'GRAND_UNAL': 'Grand Ünal Hotel',
	'GRAND_ASIYAN': 'Grand Asiyan Hotel',
	
	// Anadolu Yakası
	'WYNDHAM_KALAMIS': 'Wyndham Grand Istanbul Kalamış',
	'DOUBLETREE_MODA': 'DoubleTree by Hilton Moda',
	'BOSPHORUS_SORGUN': 'Bosphorus Sorgun Hotel',
	'AGVA_SAFIR': 'Ağva Safir Pansiyon',
	'DIVAN_PENDIK': 'Divan Istanbul Pendik',
	'BURGU_ARJAAN': 'Burgu Arjaan by Rotana',
	'RADISSON_PENDIK': 'Radisson Blu Hotel & Spa Istanbul Tuzla',
	'HILTON_KOZYATAGI': 'Hilton Istanbul Kozyatağı',
	'SHERATON_ATASEHIR': 'Sheraton Grand Istanbul Ataşehir',
	'CROWNE_PLAZA_ASIA': 'Crowne Plaza Istanbul Asia',
	'WYNDHAM_ATASEHIR': 'Wyndham Grand Istanbul Ataşehir',
	'HOLIDAY_INN_KADIKOY': 'Holiday Inn Istanbul Kadıköy',
	'DRAGOS_RESORT': 'Dragos Resort & Spa',
	'TITANIC_KARTAL': 'Titanic Business Kartal',
	'DIVAN_ALTUNIZADE': 'Divan Istanbul Asia',
	'MERCURE_UMRANIYE': 'Mercure Istanbul Ümraniye',
	
	// Diğer Bölgeler
	'GRAND_CEVAHIR': 'Grand Cevahir Hotel',
	'MARMARA_SISLI': 'The Marmara Şişli',
	'MERCURE_TAKSIM': 'Mercure Istanbul Taksim',
	'NIPPON_HOTEL': 'Nippon Hotel',
	'TITANIC_CITY': 'Titanic City Hotel',
	'FERONYA_HOTEL': 'Feronya Hotel',
	'GRAND_HALIC': 'Grand Halic Hotel',
	'RAMADA_PLAZA_TEKSTILKENT': 'Ramada Plaza By Wyndham Istanbul Tekstilkent',
	'HOLIDAY_INN_MERTER': 'Holiday Inn Istanbul City',
	'GRAND_MAKEL': 'Grand Makel Hotel',
	'WISH_MORE': 'Wish More Hotel Istanbul',
	'GRAND_WASHINGTON_MERTER': 'Grand Washington Hotel Merter',
	'GRAND_ARAS_SUITES': 'Grand Aras Hotel & Suites',
	'GRAND_EMIN': 'Grand Emin Hotel',
	'GRAND_ASYA': 'Grand Asya Hotel',
	'GRAND_TAHIR': 'Grand Tahir Hotel'
} as const;

export const CURRENCIES = {
	'USD': '$',
	'EUR': '€',
	'TRY': '₺'
} as const;

export const TRANSFER_TYPES = {
	'ARRIVAL': 'Karşılama Transferi',
	'DEPARTURE': 'Çıkış Transferi',
	'INTER': 'Ara Transfer'
} as const; 