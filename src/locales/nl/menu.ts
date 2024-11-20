export default {
  // Menu Editor
  addSection: 'Sectie Toevoegen',
  viewMenu: 'Menu Bekijken',
  qrCode: 'QR Code',
  currency: 'Valuta',
  newSection: 'Nieuwe Sectie',
  newItem: 'Nieuw Item',
  sectionName: 'Sectienaam',
  itemName: 'Itemnaam',
  itemDescription: 'Itembeschrijving',
  imageUrl: 'Afbeelding URL',
  price: 'Prijs',
  sections: 'Menu Secties',
  noSections: 'Geen secties gevonden',

  // Validation Messages
  validation: {
    allItemNameRequired: 'Alle items moeten een naam hebben',
    invalidImageUrl: 'Ongeldige afbeelding URL',
    nameRequired: 'Naam is verplicht',
    nameTooLong: 'Naam moet korter zijn dan 100 karakters',
    invalidCharacters: 'Ongeldige karakters gedetecteerd',
    descriptionTooLong: 'Beschrijving moet korter zijn dan 500 karakters',
    priceRequired: 'Prijs is verplicht',
    invalidPrice: 'Ongeldige prijs',
    negativePriceNotAllowed: 'Prijs kan niet negatief zijn',
    priceTooHigh: 'Prijs is te hoog',
    urlTooLong: 'URL is te lang',
    invalidUrlFormat: 'Ongeldig URL formaat',
    invalidUrlProtocol: 'Ongeldig URL protocol',
    sectionTitleRequired: 'Sectietitel is verplicht',
    sectionTitleTooLong: 'Sectietitel moet korter zijn dan 100 karakters',
    invalidPostalCode: 'Ongeldige postcode'
  }
} as const;
