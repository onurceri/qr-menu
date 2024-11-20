export default {
  // Menu Editor
  addSection: 'Bölüm Ekle',
  viewMenu: 'Menüyü Görüntüle',
  qrCode: 'QR Kod',
  currency: 'Para Birimi',
  newSection: 'Yeni Bölüm',
  newItem: 'Yeni Ürün',
  sectionName: 'Bölüm Adı',
  itemName: 'Ürün Adı',
  itemDescription: 'Ürün Açıklaması',
  imageUrl: 'Resim URL',
  price: 'Fiyat',
  sections: 'Menü Bölümleri',
  noSections: 'Bölüm bulunamadı',

  // Validation Messages
  validation: {
    allItemNameRequired: 'Tüm ürünlerin bir adı olmalıdır',
    invalidImageUrl: 'Geçersiz resim URL\'i',
    nameRequired: 'İsim gereklidir',
    nameTooLong: 'İsim 100 karakterden kısa olmalıdır',
    invalidCharacters: 'Geçersiz karakterler tespit edildi',
    descriptionTooLong: 'Açıklama 500 karakterden kısa olmalıdır',
    priceRequired: 'Fiyat gereklidir',
    invalidPrice: 'Geçersiz fiyat',
    negativePriceNotAllowed: 'Fiyat negatif olamaz',
    priceTooHigh: 'Fiyat çok yüksek',
    urlTooLong: 'URL çok uzun',
    invalidUrlFormat: 'Geçersiz URL formatı',
    invalidUrlProtocol: 'Geçersiz URL protokolü',
    sectionTitleRequired: 'Bölüm başlığı gereklidir',
    sectionTitleTooLong: 'Bölüm başlığı 100 karakterden kısa olmalıdır',
    invalidPostalCode: 'Geçersiz posta kodu'
  }
} as const;
