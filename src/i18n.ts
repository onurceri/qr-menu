import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        language: 'Language',
        profile: 'Profile',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        back: 'Back'
      },
      restaurants: {
        title: 'Your Restaurants',
        addNew: 'Add New Restaurant',
        noRestaurants: 'No Restaurants Yet',
        noRestaurantsDesc: "You haven't added any restaurants yet. Create your first restaurant using the form above to get started.",
        tip: '💡 Tip: After creating a restaurant, you can add menu sections and items to showcase your offerings.',
        name: 'Restaurant Name',
        description: 'Restaurant Description (optional)',
        creating: 'Creating...',
        add: 'Add Restaurant',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        deleting: 'Deleting...',
        menus: 'Menus',
        addMenu: 'Add Menu',
        noMenus: 'No menus added yet',
        selectLanguage: 'Select Language',
        menuExists: 'Menu in this language already exists',
        menuInLanguage: '{{language}} Menu'
      },
      validation: {
        nameRequired: 'Restaurant name is required',
        nameTooLong: 'Restaurant name must be less than 100 characters',
        descriptionTooLong: 'Description must be less than 500 characters',
        invalidCharacters: 'Invalid characters detected',
        invalidImageUrl: 'Invalid image URL'
      },
      menu: {
        sections: 'Menu Sections',
        addSection: 'Add Section',
        sectionName: 'Section Name',
        addItem: 'Add Item',
        itemName: 'Item Name',
        itemDescription: 'Item Description',
        itemPrice: 'Price',
        dragToReorder: 'Drag to reorder',
        noSections: 'No menu sections yet',
        noItems: 'No items in this section',
        currency: 'Currency',
        save: 'Save Changes',
        saving: 'Saving...',
        delete: 'Delete',
        edit: 'Edit',
        cancel: 'Cancel',
        imageUrl: 'Image URL',
        newItem: 'New Item',
        viewMenu: 'View Menu',
        qrCode: 'QR Code',
        newSection: 'New Section',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All'
      }
    }
  },
  tr: {
    translation: {
      common: {
        loading: 'Yükleniyor...',
        error: 'Bir hata oluştu',
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        logout: 'Çıkış Yap',
        language: 'Dil',
        profile: 'Profil',
        view: 'Görüntüle',
        edit: 'Düzenle',
        delete: 'Sil',
        back: 'Geri'
      },
      restaurants: {
        title: 'Restoranlarınız',
        addNew: 'Yeni Restoran Ekle',
        noRestaurants: 'Henüz Restoran Yok',
        noRestaurantsDesc: 'Henüz hiç restoran eklemediniz. Başlamak için yukarıdaki formu kullanarak ilk restoranınızı oluşturun.',
        tip: '💡 İpucu: Restoran oluşturduktan sonra, menü bölümleri ve ürünler ekleyerek sunumunuzu yapabilirsiniz.',
        name: 'Restoran Adı',
        description: 'Restoran Açıklaması (opsiyonel)',
        creating: 'Oluşturuluyor...',
        add: 'Restoran Ekle',
        view: 'Görüntüle',
        edit: 'Düzenle',
        delete: 'Sil',
        deleting: 'Siliniyor...',
        menus: 'Menüler',
        addMenu: 'Menü Ekle',
        noMenus: 'Henüz menü eklenmemiş',
        selectLanguage: 'Dil Seçin',
        menuExists: 'Bu dilde menü zaten mevcut',
        menuInLanguage: '{{language}} Menü'
      },
      validation: {
        nameRequired: 'Restoran adı zorunludur',
        nameTooLong: 'Restoran adı 100 karakterden kısa olmalıdır',
        descriptionTooLong: 'Açıklama 500 karakterden kısa olmalıdır',
        invalidCharacters: 'Geçersiz karakterler tespit edildi',
        invalidImageUrl: 'Geçersiz görsel URL\'si'
      },
      menu: {
        sections: 'Menü Bölümleri',
        addSection: 'Bölüm Ekle',
        sectionName: 'Bölüm Adı',
        addItem: 'Ürün Ekle',
        itemName: 'Ürün Adı',
        itemDescription: 'Ürün Açıklaması',
        itemPrice: 'Fiyat',
        dragToReorder: 'Sıralamak için sürükleyin',
        noSections: 'Henüz menü bölümü yok',
        noItems: 'Bu bölümde ürün yok',
        currency: 'Para Birimi',
        save: 'Değişiklikleri Kaydet',
        saving: 'Kaydediliyor...',
        delete: 'Sil',
        edit: 'Düzenle',
        cancel: 'İptal',
        imageUrl: 'Görsel URL',
        newItem: 'Yeni Ürün',
        viewMenu: 'Menüyü Görüntüle',
        qrCode: 'QR Kod',
        newSection: 'Yeni Bölüm',
        expandAll: 'Tümünü Genişlet',
        collapseAll: 'Tümünü Daralt'
      }
    }
  },
  fr: {
    translation: {
      common: {
        loading: 'Chargement...',
        error: 'Une erreur est survenue',
        login: 'Connexion',
        register: 'Inscription',
        logout: 'Déconnexion',
        language: 'Langue',
        profile: 'Profil',
        view: 'Voir',
        edit: 'Modifier',
        delete: 'Supprimer',
        back: 'Retour'
      },
      restaurants: {
        title: 'Vos Restaurants',
        addNew: 'Ajouter un Restaurant',
        noRestaurants: 'Aucun Restaurant',
        noRestaurantsDesc: "Vous n'avez pas encore ajouté de restaurant. Utilisez le formulaire ci-dessus pour créer votre premier restaurant.",
        tip: '💡 Astuce: Après avoir créé un restaurant, vous pouvez ajouter des sections de menu et des articles pour présenter vos offres.',
        name: 'Nom du Restaurant',
        description: 'Description du Restaurant (optionnel)',
        creating: 'Création...',
        add: 'Ajouter',
        view: 'Voir',
        edit: 'Modifier',
        delete: 'Supprimer',
        deleting: 'Suppression...',
        menus: 'Menus',
        addMenu: 'Ajouter un Menu',
        noMenus: 'Aucun menu ajouté',
        selectLanguage: 'Sélectionner la Langue',
        menuExists: 'Le menu dans cette langue existe déjà',
        menuInLanguage: 'Menu {{language}}'
      },
      validation: {
        nameRequired: 'Le nom du restaurant est requis',
        nameTooLong: 'Le nom du restaurant doit faire moins de 100 caractères',
        descriptionTooLong: 'La description doit faire moins de 500 caractères',
        invalidCharacters: 'Caractères invalides détectés',
        invalidImageUrl: 'URL d\'image invalide'
      },
      menu: {
        sections: 'Sections du Menu',
        addSection: 'Ajouter une Section',
        sectionName: 'Nom de la Section',
        addItem: 'Ajouter un Article',
        itemName: "Nom de l'Article",
        itemDescription: "Description de l'Article",
        itemPrice: 'Prix',
        dragToReorder: 'Glisser pour réorganiser',
        noSections: 'Aucune section de menu',
        noItems: 'Aucun article dans cette section',
        currency: 'Devise',
        save: 'Enregistrer',
        saving: 'Enregistrement...',
        delete: 'Supprimer',
        edit: 'Modifier',
        cancel: 'Annuler',
        imageUrl: 'URL de l\'image',
        newItem: 'Nouvel Article',
        viewMenu: 'Voir le Menu',
        qrCode: 'Code QR',
        newSection: 'Nouvelle Section',
        expandAll: 'Tout développer',
        collapseAll: 'Tout réduire'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 