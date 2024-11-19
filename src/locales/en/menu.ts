export default {
  // Menu Editor
  addSection: 'Add Section',
  viewMenu: 'View Menu',
  qrCode: 'QR Code',
  currency: 'Currency',
  expandAll: 'Expand All',
  collapseAll: 'Collapse All',
  newSection: 'New Section',
  newItem: 'New Item',
  sectionName: 'Section Name',
  itemName: 'Item Name',
  itemDescription: 'Item Description',
  imageUrl: 'Image URL',
  price: 'Price',
  sections: 'Menu Sections',
  noSections: 'No sections found',

  // Validation Messages
  validation: {
    allItemNameRequired: 'All items must have a name',
    invalidImageUrl: 'Invalid image URL',
    nameRequired: 'Name is required',
    nameTooLong: 'Name must be less than 100 characters',
    invalidCharacters: 'Invalid characters detected',
    descriptionTooLong: 'Description must be less than 500 characters',
    priceRequired: 'Price is required',
    invalidPrice: 'Invalid price',
    negativePriceNotAllowed: 'Price cannot be negative',
    priceTooHigh: 'Price is too high',
    urlTooLong: 'URL is too long',
    invalidUrlFormat: 'Invalid URL format',
    invalidUrlProtocol: 'Invalid URL protocol',
    sectionTitleRequired: 'Section title is required',
    sectionTitleTooLong: 'Section title must be less than 100 characters',
    invalidPostalCode: 'Invalid postal code'
  }
} as const;
