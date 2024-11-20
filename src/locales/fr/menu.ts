export default {
  // Menu Editor
  addSection: 'Ajouter une Section',
  viewMenu: 'Voir le Menu',
  qrCode: 'Code QR',
  currency: 'Devise',
  newSection: 'Nouvelle Section',
  newItem: 'Nouvel Article',
  sectionName: 'Nom de la Section',
  itemName: 'Nom de l\'Article',
  itemDescription: 'Description de l\'Article',
  imageUrl: 'URL de l\'Image',
  price: 'Prix',
  sections: 'Sections du Menu',
  noSections: 'Aucune section trouvée',

  // Validation Messages
  validation: {
    allItemNameRequired: 'Tous les articles doivent avoir un nom',
    invalidImageUrl: 'URL d\'image invalide',
    nameRequired: 'Le nom est requis',
    nameTooLong: 'Le nom doit faire moins de 100 caractères',
    invalidCharacters: 'Caractères invalides détectés',
    descriptionTooLong: 'La description doit faire moins de 500 caractères',
    priceRequired: 'Le prix est requis',
    invalidPrice: 'Prix invalide',
    negativePriceNotAllowed: 'Le prix ne peut pas être négatif',
    priceTooHigh: 'Le prix est trop élevé',
    urlTooLong: 'URL trop longue',
    invalidUrlFormat: 'Format d\'URL invalide',
    invalidUrlProtocol: 'Protocole d\'URL invalide',
    sectionTitleRequired: 'Le titre de la section est requis',
    sectionTitleTooLong: 'Le titre de la section doit faire moins de 100 caractères',
    invalidPostalCode: 'Code postal invalide'
  }
} as const;
