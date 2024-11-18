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
        back: 'Back',
        save: 'Save',
        clear: 'Clear',
        noResults: 'No results found',
        enterMinChars: 'Enter at least {{count}} characters',
        saving: 'Saving...',
        saved: 'Saved',
        cancel: 'Cancel',
        confirm: 'Confirm',
        tryAgain: 'Try Again',
        required: 'Required field',
        charactersRemaining: '{{count}} characters remaining',
        showMore: 'Show more',
        showLess: 'Show less'
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
        menuInLanguage: '{{language}} Menu',
        profile: 'Restaurant Profile',
        uploadImage: 'Upload Image',
        imageRequirements: 'Maximum 5MB, JPG or PNG format',
        address: 'Address',
        street: 'Street',
        city: 'City',
        country: 'Country',
        postalCode: 'Postal Code',
        defaultMenu: 'Default Menu',
        imageUploadError: 'Failed to upload image',
        loadError: 'Failed to load restaurant',
        updateError: 'Failed to update restaurant',
        locationNotFound: 'Location not found',
        clickMapToSetLocation: 'Click on the map to set location manually',
        location: 'Location',
        hours: 'Opening Hours',
        languages: 'Available Languages',
        availableMenus: 'Available Menus',
        fetchError: 'Failed to fetch restaurant details',
        notFound: 'Restaurant not found',
        uploadingImage: 'Uploading image...',
        imageValidationError: 'Image validation error: {{error}}',
        allowedFileTypes: 'Allowed file types: {{types}}',
        isOpen: 'Open',
        openTime: 'Opening Time',
        closeTime: 'Closing Time',
        closed: 'Closed',
        noHours: 'No opening hours set',
        noLocation: 'Location not available',
        selectCountry: 'Select a country',
        selectCity: 'Select a city',
        descriptionHint: 'A brief description of your restaurant',
        mapInteractionHint: 'Click and drag to move the map, use zoom controls to zoom in/out'
      },
      validation: {
        nameRequired: 'Restaurant name is required',
        nameTooLong: 'Restaurant name must be less than 100 characters',
        descriptionTooLong: 'Description must be less than 500 characters',
        invalidCharacters: 'Invalid characters detected',
        invalidImageUrl: 'Invalid image URL',
        invalidTimeRange: 'Closing time must be after opening time',
        invalidTimeFormat: 'Invalid time format'
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
      },
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
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
        back: 'Geri',
        save: 'Kaydet',
        clear: 'Temizle',
        noResults: 'Sonuç bulunamadı',
        enterMinChars: 'En az {{count}} karakter girin',
        saving: 'Kaydediliyor...',
        saved: 'Kaydedildi',
        cancel: 'İptal',
        confirm: 'Onayla',
        tryAgain: 'Tekrar Dene',
        required: 'Zorunlu alan',
        charactersRemaining: '{{count}} karakter kaldı',
        showMore: 'Devamını gör',
        showLess: 'Daha az göster'
      },
      validation: {
        nameRequired: 'İsim alanı zorunludur',
        nameTooLong: 'İsim çok uzun',
        descriptionTooLong: 'Açıklama çok uzun',
        invalidCharacters: 'Geçersiz karakterler',
        invalidTimeRange: 'Geçersiz saat aralığı',
        invalidPostalCode: 'Geçersiz posta kodu',
        invalidTimeFormat: 'Geçersiz saat formatı',
        invalidImageUrl: 'Geçersiz görsel URL\'si'
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
        deleting: 'Siliniyor...',
        menus: 'Menüler',
        addMenu: 'Menü Ekle',
        noMenus: 'Henüz menü eklenmemiş',
        selectLanguage: 'Dil Seçin',
        menuExists: 'Bu dilde menü zaten mevcut',
        menuInLanguage: '{{language}} Menü',
        profile: 'Restoran Profili',
        uploadImage: 'Resim Yükle',
        imageRequirements: 'Maximum 5MB, JPG veya PNG formatında',
        address: 'Adres',
        street: 'Sokak',
        city: 'Şehir',
        country: 'Ülke',
        postalCode: 'Posta Kodu',
        defaultMenu: 'Varsayılan Menü',
        imageUploadError: 'Resim yükleme hatası',
        loadError: 'Restoran yükleme hatası',
        updateError: 'Restoran güncelleme hatası',
        locationNotFound: 'Konum bulunamadı',
        clickMapToSetLocation: 'Haritada konum manuel olarak ayarlama',
        location: 'Konum',
        hours: 'Çalışma Saatleri',
        languages: 'Mevcut Diller',
        availableMenus: 'Mevcut Menüler',
        fetchError: 'Restoran bilgileri alınamadı',
        notFound: 'Restoran bulunamadı',
        uploadingImage: 'Resim yükleniyor...',
        imageValidationError: 'Resim doğrulama hatası: {{error}}',
        allowedFileTypes: 'İzin verilen formatlar: {{types}}',
        isOpen: 'Açık',
        openTime: 'Açılış Saati',
        closeTime: 'Kapanış Saati',
        closed: 'Kapalı',
        noHours: 'Çalışma saatleri belirtilmemiş',
        noLocation: 'Konum bilgisi mevcut değil',
        selectCountry: 'Ülke seçin',
        selectCity: 'Şehir seçin',
        createError: 'Oluşturma hatası',
        deleteError: 'Silme hatası',
        menuCreateError: 'Menü oluşturma hatası',
        menuDeleteError: 'Menü silme hatası',
        imageDeleteError: 'Resim silme hatası',
        descriptionHint: 'Restoranınızın kısa bir açıklaması'
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
      },
      days: {
        monday: 'Pazartesi',
        tuesday: 'Salı',
        wednesday: 'Çarşamba',
        thursday: 'Perşembe',
        friday: 'Cuma',
        saturday: 'Cumartesi',
        sunday: 'Pazar'
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
        back: 'Retour',
        save: 'Enregistrer',
        clear: 'Effacer',
        noResults: 'Aucun résultat trouvé',
        enterMinChars: 'Entrez au moins {{count}} caractères'
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
        menuInLanguage: 'Menu {{language}}',
        profile: 'Profil du Restaurant',
        uploadImage: 'Télécharger une Image',
        imageRequirements: 'Maximum 5MB, format JPG ou PNG',
        address: 'Adresse',
        street: 'Rue',
        city: 'Ville',
        country: 'Pays',
        postalCode: 'Code Postal',
        defaultMenu: 'Menu par Défaut',
        imageUploadError: 'Erreur de téléchargement de l\'image',
        loadError: 'Erreur de chargement du restaurant',
        updateError: 'Erreur de mise à jour du restaurant',
        locationNotFound: 'Emplacement non trouvé',
        clickMapToSetLocation: 'Cliquez sur la carte pour définir l\'emplacement manuellement',
        location: 'Emplacement',
        hours: 'Heures d\'ouverture',
        languages: 'Langues disponibles',
        availableMenus: 'Menus disponibles',
        fetchError: 'Impossible de récupérer les détails du restaurant',
        notFound: 'Restaurant non trouvé',
        uploadingImage: 'Chargement de l\'image...',
        imageValidationError: 'Erreur de validation de l\'image: {{error}}',
        allowedFileTypes: 'Types de fichiers autorisés: {{types}}',
        isOpen: 'Ouvert',
        openTime: 'Heure d\'ouverture',
        closeTime: 'Heure de fermeture',
        closed: 'Fermé',
        noHours: 'Heures d\'ouverture non définies',
        noLocation: 'Emplacement non disponible',
        selectCountry: 'Sélectionnez un pays',
        selectCity: 'Sélectionnez une ville'
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
      },
      days: {
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche'
      }
    }
  },
  ar: {
    translation: {
      common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        login: 'تسجيل الدخول',
        register: 'تسجيل',
        logout: 'تسجيل الخروج',
        language: 'اللغة',
        profile: 'الملف الشخصي',
        view: 'عرض',
        edit: 'تعديل',
        delete: 'حذف',
        back: 'رجوع',
        save: 'حفظ',
        clear: 'مسح',
        noResults: 'لم يتم العثور على نتائج',
        enterMinChars: 'أدخل على الأقل {{count}} حرف'
      },
      restaurants: {
        title: 'مطاعمك',
        addNew: 'إضافة مطعم جديد',
        noRestaurants: 'لا توجد مطاعم',
        noRestaurantsDesc: 'لم تقم بإضافة أي مطعم بعد. استخدم النموذج أعلاه لإنشاء مطعمك لأول.',
        tip: '💡 نصيحة: بعد إنشاء مطعم، يمكنك إضافة أقسام القائمة والعناصر لتقديم عروضك.',
        name: 'اسم المطعم',
        description: 'وصف المطعم (اختياري)',
        creating: 'جاري الإنشاء...',
        add: 'إضافة',
        view: 'عرض',
        edit: 'تعديل',
        delete: 'حذف',
        deleting: 'جاري الحذف...',
        menus: 'القوائم',
        addMenu: 'إضافة قائمة',
        noMenus: 'لم تتم إضافة قوائم بعد',
        selectLanguage: 'اختر اللغة',
        menuExists: 'القائمة موجودة بالفعل بهذه اللغة',
        menuInLanguage: 'قائمة {{language}}',
        profile: 'لف المطعم',
        uploadImage: 'تحميل الصورة',
        imageRequirements: 'أقصى 5MB، بصيغة JPG أو PNG',
        address: 'العنوان',
        street: 'الشارع',
        city: 'المدينة',
        country: 'البلد',
        postalCode: 'رمز البريد',
        defaultMenu: 'القائمة الافراضية',
        imageUploadError: 'فشل تحميل الصورة',
        loadError: 'فشل تحميل المطعم',
        updateError: 'فشل تحديث المطعم',
        locationNotFound: 'الموقع غير موجود',
        clickMapToSetLocation: 'اضغط على الخرطة لتحديد الموقع يدويا',
        location: 'الموقع',
        hours: 'ساعات التشغيل',
        languages: 'اللغات المتاحة',
        availableMenus: 'القوائم المتاحة',
        fetchError: 'فشل في جلب تفاصيل المطعم',
        notFound: 'مطعم غير موجود',
        uploadingImage: 'جاري تحميل الصورة...',
        imageValidationError: 'خطأ تحقق الصورة: {{error}}',
        allowedFileTypes: 'الأنواع المسموحة: {{types}}',
        isOpen: 'مفتوح',
        openTime: 'موعد الافتتاح',
        closeTime: 'موعد الإغلاق',
        closed: 'مغلق',
        noHours: 'لم يتم تحديد ساعات العمل',
        noLocation: 'الموقع غير متوفر',
        selectCountry: 'اختر الدولة',
        selectCity: 'اختر المدينة'
      },
      validation: {
        nameRequired: 'اسم المطعم مطلوب',
        nameTooLong: 'يجب أن يكون اسم المطعم أقل من 100 حرف',
        descriptionTooLong: 'يجب أن يكون الوصف أقل من 500 حرف',
        invalidCharacters: 'تم اكتشاف أحرف غير صالحة',
        invalidImageUrl: 'رابط الصورة غير صالح'
      },
      menu: {
        sections: 'أقسام اقائمة',
        addSection: 'إضافة قسم',
        sectionName: 'اسم القسم',
        addItem: 'إضافة عنصر',
        itemName: 'اسم العنصر',
        itemDescription: 'وصف العنصر',
        itemPrice: 'السعر',
        dragToReorder: 'اسحب لإعادة الترتيب',
        noSections: 'لا توجد أقسام في القائمة بعد',
        noItems: 'لا توجد عناصر في هذا القسم',
        currency: 'العملة',
        save: 'حفظ التغييرات',
        saving: 'جاري الحفظ...',
        delete: 'حذف',
        edit: 'تعديل',
        cancel: 'إلغاء',
        imageUrl: 'رابط الصورة',
        newItem: 'عنصر جديد',
        viewMenu: 'عرض القائمة',
        qrCode: 'مز QR',
        newSection: 'قسم جديد',
        expandAll: 'توسيع الكل',
        collapseAll: 'طي الكل'
      },
      days: {
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'السبت',
        saturday: 'الأحد',
        sunday: 'الأثنين'
      }
    }
  },
  nl: {
    translation: {
      common: {
        loading: 'Laden...',
        error: 'Er is een fout opgetreden',
        login: 'Inloggen',
        register: 'Registreren',
        logout: 'Uitloggen',
        language: 'Taal',
        profile: 'Profiel',
        view: 'Bekijken',
        edit: 'Bewerken',
        delete: 'Verwijderen',
        back: 'Terug',
        save: 'Opslaan',
        clear: 'Wissen',
        noResults: 'Geen resultaten gevonden',
        enterMinChars: 'Voer minstens {{count}} tekens in'
      },
      restaurants: {
        title: 'Uw Restaurants',
        addNew: 'Nieuw Restaurant Toevoegen',
        noRestaurants: 'Nog Geen Restaurants',
        noRestaurantsDesc: 'U heeft nog geen restaurants toegevoegd. Gebruik het formulier hierboven om uw eerste restaurant aan te maken.',
        tip: '💡 Tip: Na het aanmaken van een restaurant kunt u menusecties en items toevoegen om uw aanbod te presenteren.',
        name: 'Restaurantnaam',
        description: 'Restaurantbeschrijving (optioneel)',
        creating: 'Aanmaken...',
        add: 'Toevoegen',
        view: 'Bekijken',
        edit: 'Bewerken',
        delete: 'Verwijderen',
        deleting: 'Verwijderen...',
        menus: "Menu's",
        addMenu: 'Menu Toevoegen',
        noMenus: "Nog geen menu's toegevoegd",
        selectLanguage: 'Selecteer Taal',
        menuExists: 'Menu in deze taal bestaat al',
        menuInLanguage: '{{language}} Menu',
        profile: 'Restaurant Profiel',
        uploadImage: 'Afbeelding Uploaden',
        imageRequirements: 'Maximum 5MB, JPG of PNG formaat',
        address: 'Adres',
        street: 'Straat',
        city: 'Stad',
        country: 'Land',
        postalCode: 'Postcode',
        defaultMenu: 'Standaard Menu',
        imageUploadError: 'Afbeelding uploaden mislukt',
        loadError: 'Restaurant laden mislukt',
        updateError: 'Restaurant bijwerken mislukt',
        locationNotFound: 'Locatie niet gevonden',
        clickMapToSetLocation: 'Klik op de kaart om de locatie handmatig in te stellen',
        location: 'Locatie',
        hours: 'Opening Hours',
        languages: 'Beschikbare Talen',
        availableMenus: 'Beschikbare Menus',
        fetchError: 'Restaurantdetails konnten nicht abgerufen werden',
        notFound: 'Restaurant niet gevonden',
        uploadingImage: 'Afbeelding uploaden...',
        imageValidationError: 'Afbeelding validatie fout: {{error}}',
        allowedFileTypes: 'Toegestane bestandstypes: {{types}}',
        isOpen: 'Open',
        openTime: 'Opening Time',
        closeTime: 'Closing Time',
        closed: 'Gesloten',
        noHours: 'Geen openingstijden ingesteld',
        noLocation: 'Locatie niet beschikbaar',
        selectCountry: 'Selecteer een land',
        selectCity: 'Selecteer een stad'
      },
      validation: {
        nameRequired: 'Restaurantnaam is verplicht',
        nameTooLong: 'Restaurantnaam moet korter zijn dan 100 tekens',
        descriptionTooLong: 'Beschrijving moet korter zijn dan 500 tekens',
        invalidCharacters: 'Ongeldige tekens gedetecteerd',
        invalidImageUrl: 'Ongeldige afbeeldings-URL'
      },
      menu: {
        sections: 'Menusecties',
        addSection: 'Sectie Toevoegen',
        sectionName: 'Sectienaam',
        addItem: 'Item Toevoegen',
        itemName: 'Itemnaam',
        itemDescription: 'Itembeschrijving',
        itemPrice: 'Prijs',
        dragToReorder: 'Sleep om te herordenen',
        noSections: 'Nog geen menusecties',
        noItems: 'Geen items in deze sectie',
        currency: 'Valuta',
        save: 'Wijzigingen Opslaan',
        saving: 'Opslaan...',
        delete: 'Verwijderen',
        edit: 'Bewerken',
        cancel: 'Annuleren',
        imageUrl: 'Afbeeldings-URL',
        newItem: 'Nieuw Item',
        viewMenu: 'Menu Bekijken',
        qrCode: 'QR Code',
        newSection: 'Nieuwe Sectie',
        expandAll: 'Alles Uitvouwen',
        collapseAll: 'Alles Invouwen'
      },
      days: {
        monday: 'Maandag',
        tuesday: 'Dinsdag',
        wednesday: 'Woensdag',
        thursday: 'Donderdag',
        friday: 'Vrijdag',
        saturday: 'Zaterdag',
        sunday: 'Zondag'
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