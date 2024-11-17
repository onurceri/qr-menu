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
        myRestaurants: 'My Restaurants'
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
        deleting: 'Deleting...'
      },
      validation: {
        nameRequired: 'Restaurant name is required',
        nameTooLong: 'Restaurant name must be less than 100 characters',
        descriptionTooLong: 'Description must be less than 500 characters',
        invalidCharacters: 'Invalid characters detected'
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
        newItem: 'New Item'
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
        myRestaurants: 'Restoranlarım'
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
        deleting: 'Siliniyor...'
      },
      validation: {
        nameRequired: 'Restoran adı zorunludur',
        nameTooLong: 'Restoran adı 100 karakterden kısa olmalıdır',
        descriptionTooLong: 'Açıklama 500 karakterden kısa olmalıdır',
        invalidCharacters: 'Geçersiz karakterler tespit edildi'
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
        newItem: 'Yeni Ürün'
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