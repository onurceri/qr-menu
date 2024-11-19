export default {
  // Menu Editor
  addSection: 'إضافة قسم',
  viewMenu: 'عرض القائمة',
  qrCode: 'رمز QR',
  currency: 'العملة',
  expandAll: 'توسيع الكل',
  collapseAll: 'طي الكل',
  newSection: 'قسم جديد',
  newItem: 'عنصر جديد',
  sectionName: 'اسم القسم',
  itemName: 'اسم العنصر',
  itemDescription: 'وصف العنصر',
  imageUrl: 'رابط الصورة',
  price: 'السعر',

  // Validation Messages
  validation: {
    allItemNameRequired: 'يجب أن يكون لجميع العناصر اسم',
    invalidImageUrl: 'رابط الصورة غير صالح',
    nameRequired: 'الاسم مطلوب',
    nameTooLong: 'يجب أن يكون الاسم أقل من 100 حرف',
    invalidCharacters: 'تم اكتشاف أحرف غير صالحة',
    descriptionTooLong: 'يجب أن يكون الوصف أقل من 500 حرف',
    priceRequired: 'السعر مطلوب',
    invalidPrice: 'سعر غير صالح',
    negativePriceNotAllowed: 'لا يمكن أن يكون السعر سالباً',
    priceTooHigh: 'السعر مرتفع جداً',
    urlTooLong: 'الرابط طويل جداً',
    invalidUrlFormat: 'تنسيق الرابط غير صالح',
    invalidUrlProtocol: 'بروتوكول الرابط غير صالح',
    sectionTitleRequired: 'عنوان القسم مطلوب',
    sectionTitleTooLong: 'يجب أن يكون عنوان القسم أقل من 100 حرف'
  }
} as const;
