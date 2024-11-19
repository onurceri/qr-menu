import React, { useState, useEffect, startTransition, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Edit2, Save, QrCode, GripVertical, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import type { MenuItem, MenuSection, Menu } from '../types/restaurant';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAuth } from '../hooks/useAuth';
import { restaurantService } from '../services/restaurantService';
import { DragDropContext, Draggable, DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { CurrencySelect } from '../components/CurrencySelect';
import { CURRENCIES, type CurrencyCode } from '../constants/currencies';
import { StrictModeDroppable } from '../components/StrictModeDroppable';
import { useTranslation } from 'react-i18next';


// Image URL'in gerçekten çalışıp çalışmadığını kontrol eden fonksiyon
const checkImageExists = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) resolve(true); // Boş URL'e izin ver
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Input validation fonksiyonlarını ekleyelim
const validateInput = {
  name: (value: string) => {
    // İsim alanı için validasyon
    if (!value.trim()) return 'Name is required';
    if (value.length > 100) return 'Name must be less than 100 characters';
    // XSS koruması için özel karakterleri kontrol et
    if (/[<>{}]/g.test(value)) return 'Invalid characters detected';
    return null;
  },
  
  description: (value: string) => {
    // Açıklama alanı için validasyon
    if (value.length > 500) return 'Description must be less than 500 characters';
    // XSS koruması için özel karakterleri kontrol et
    if (/[<>{}]/g.test(value)) return 'Invalid characters detected';
    return null;
  },

  price: (value: string) => {
    // Fiyat alanı için validasyon
    if (!value) return 'Price is required';
    const price = parseFloat(value);
    if (isNaN(price)) return 'Price must be a number';
    if (price < 0) return 'Price cannot be negative';
    if (price > 999999.99) return 'Price is too high';
    return null;
  },

  imageUrl: (value: string) => {
    // Resim URL'i için validasyon
    if (!value) return null; // Opsiyonel alan
    if (value.length > 2048) return 'URL is too long';
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) return 'Invalid URL protocol';
    } catch {
      return 'Invalid URL format';
    }
    return null;
  },

  sectionTitle: (value: string) => {
    // Bölüm başlığı için validasyon
    if (!value.trim()) return 'Section title is required';
    if (value.length > 100) return 'Section title must be less than 100 characters';
    if (/[<>{}]/g.test(value)) return 'Invalid characters detected';
    return null;
  }
};

// Item form component'i ekleyelim
const ItemForm = ({
  item,
  onUpdate,
  onDelete,
  dragHandleProps,
  currency
}: {
  item: MenuItem;
  onUpdate: (updates: Partial<MenuItem>) => void;
  onDelete: () => void;
  dragHandleProps: any;
  currency: CurrencyCode;
}) => {
  const { t } = useTranslation();
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [tempPrice, setTempPrice] = useState(item.price.toString());
  // Validation error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);

  const handleImageUrlChange = async (url: string) => {
    onUpdate({ imageUrl: url });
    if (!url) {
      setIsImageValid(null);
      return;
    }

    setIsCheckingImage(true);
    const isValid = await checkImageExists(url);
    setIsImageValid(isValid);
    setIsCheckingImage(false);
  };

  // Format price helper function
  const formatPrice = (value: string) => {
    // Remove any non-digit characters except decimal point
    let cleaned = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length > 1) {
      cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    }

    return cleaned;
  };

  // Price change handler
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPrice = formatPrice(e.target.value);
    setTempPrice(formattedPrice);
    
    // Only update the actual price if we have a valid number
    if (formattedPrice !== '') {
      const numericPrice = parseFloat(formattedPrice) || 0;
      onUpdate({ price: numericPrice });
    }
  };

  // Price blur handler - format on blur
  const handlePriceBlur = () => {
    if (tempPrice === '') {
      setTempPrice('0');
      onUpdate({ price: 0 });
    } else {
      const numericPrice = parseFloat(tempPrice) || 0;
      setTempPrice(numericPrice.toFixed(2));
      onUpdate({ price: numericPrice });
    }
  };

  // Update tempPrice when item.price changes externally
  useEffect(() => {
    setTempPrice(item.price.toString());
  }, [item.price]);

  // Name validation
  const handleNameChange = (value: string) => {
    const error = validateInput.name(value);
    setNameError(error);
    // Her zaman state'i güncelle, validation hatası olsa bile
    onUpdate({ name: value });
  };

  // Description validation
  const handleDescriptionChange = (value: string) => {
    const error = validateInput.description(value);
    setDescriptionError(error);
    if (!error) {
      onUpdate({ description: value });
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
      {/* Header - Name and Actions */}
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
        <div {...dragHandleProps} className="p-2 hover:bg-zinc-50 rounded cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full border-0 border-b border-transparent hover:border-zinc-200 
                focus:border-zinc-300 rounded-none focus:ring-0 px-0 text-base font-medium
                ${nameError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder={t('menu.itemName')}
            />
            {nameError && (
              <p className="absolute text-xs text-red-500 mt-1">{t(nameError)}</p>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 pl-9">
        {/* Description */}
        <div className="relative">
          <textarea
            value={item.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className={`w-full border-0 bg-zinc-50 rounded-md h-20 resize-none focus:ring-1 
              ${descriptionError ? 'border-red-300 focus:ring-red-500' : 'focus:ring-zinc-300'} text-sm`}
            placeholder={t('menu.itemDescription')}
          />
          {descriptionError && (
            <p className="absolute text-xs text-red-500 mt-1">{t(descriptionError)}</p>
          )}
          <div className="absolute bottom-2 right-2 text-xs text-zinc-400">
            {(item.description?.length || 0)}/500
          </div>
        </div>

        {/* Image URL */}
        <div className="relative">
          <div className="relative">
            <input
              type="url"
              value={item.imageUrl || ''}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className={`w-full border-0 bg-zinc-50 rounded-md focus:ring-1 focus:ring-zinc-300 pr-10 text-sm
                ${isImageValid === false ? 'bg-red-50 focus:ring-red-300' : ''}
                ${isImageValid === true ? 'bg-green-50 focus:ring-green-300' : ''}`}
              placeholder={t('menu.imageUrl')}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {isCheckingImage ? (
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              ) : isImageValid === true ? (
                <div className="text-green-500">✓</div>
              ) : isImageValid === false ? (
                <div className="text-red-500">✗</div>
              ) : null}
            </div>
          </div>
          {isImageValid === false && (
            <p className="mt-1 text-xs text-red-500">
              {t('validation.invalidImageUrl')}
            </p>
          )}
        </div>

        {/* Price input */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={tempPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              className={`w-full border-0 bg-zinc-50 rounded-md pl-8 focus:ring-1 
                ${priceError ? 'border-red-300 focus:ring-red-500' : 'focus:ring-zinc-300'} text-sm`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-zinc-500">{CURRENCIES[currency].symbol}</span>
            </div>
          </div>
          {priceError && (
            <p className="text-xs text-red-500 mt-1">{t(priceError)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Ana komponent
function MenuEdit() {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [previousMenu, setPreviousMenu] = useState<string>(''); // Menu'nun önceki halini tutmak için
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  // Debounced save fonksiyonunu düzenleyelim
  const debouncedSave = useCallback(
    (menuData: Menu) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      setIsSaving(true);

      timeoutIdRef.current = setTimeout(async () => {
        try {
          // API çağrısı öncesi validasyon kontrolü
          const hasValidationErrors = menuData.sections.some(section => {
            // Section başlığı validasyonu
            if (validateInput.sectionTitle(section.title)) {
              return true;
            }
            
            // Section içindeki itemların validasyonu
            return section.items.some(item => {
              return (
                validateInput.name(item.name) ||
                validateInput.description(item.description || '') ||
                validateInput.price(item.price.toString()) ||
                (item.imageUrl && validateInput.imageUrl(item.imageUrl))
              );
            });
          });

          if (hasValidationErrors) {
            console.log('Validation errors exist, skipping API call');
            return;
          }

          await restaurantService.updateMenu(menuId!, menuData);
          setHasChanges(false);
        } catch (err) {
          console.error('Failed to save changes:', err);
          setError('Failed to save changes');
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    [menuId]
  );

  // Component unmount olduğunda timeout'u temizleyelim
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  // Menu değişikliklerini takip et ve otomatik kaydet
  useEffect(() => {
    // Sadece değişiklik varsa ve ilk yükleme değilse kaydet
    if (menu && hasChanges && !isLoading) {
      // Menu'nun JSON stringini karşılaştır
      const currentMenuString = JSON.stringify(menu);
      if (currentMenuString !== previousMenu) {
        debouncedSave(menu);
        setPreviousMenu(currentMenuString);
      }
    }
  }, [menu, debouncedSave, isLoading, hasChanges, previousMenu]);

  // İlk yükleme için ayrı bir useEffect
  useEffect(() => {
    if (menuId) {
      loadMenuData();
    }
  }, [menuId]);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await restaurantService.getMenu(menuId!);
      
      if (!data) {
        throw new Error('Menu data not found');
      }

      startTransition(() => {
        setMenu(data);
        setPreviousMenu(JSON.stringify(data)); // İlk yüklemede önceki menu'yu set et
        setHasChanges(false); // İlk yüklemede değişiklik yok
      });
    } catch (error) {
      console.error('Failed to load menu data:', error);
      setError('Failed to load menu data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!menu || !result.destination) return;

    const { source, destination, type } = result;

    const reorder = <T extends any>(list: T[], startIndex: number, endIndex: number): T[] => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    let updatedMenu = { ...menu };

    if (type === 'section') {
      // Bölüm sıralaması değişti
      updatedMenu.sections = reorder(
        menu.sections,
        source.index,
        destination.index
      );
    } else if (type === 'item') {
      // droppableId formatı: "items-{sectionId}"
      const sourceSectionId = source.droppableId.replace('items-', '');
      const destinationSectionId = destination.droppableId.replace('items-', '');
      
      if (sourceSectionId === destinationSectionId) {
        // Aynı bölüm içinde item sıralaması
        const sectionIndex = menu.sections.findIndex(s => s.id === sourceSectionId);
        if (sectionIndex === -1) return;

        const items = reorder(
          menu.sections[sectionIndex].items,
          source.index,
          destination.index
        );
        updatedMenu.sections[sectionIndex].items = items;
      } else {
        // Farklı bölümler arası item taşıma
        const sourceSectionIndex = menu.sections.findIndex(s => s.id === sourceSectionId);
        const destSectionIndex = menu.sections.findIndex(s => s.id === destinationSectionId);
        
        if (sourceSectionIndex === -1 || destSectionIndex === -1) return;
        
        const sourceItems = [...menu.sections[sourceSectionIndex].items];
        const destItems = [...menu.sections[destSectionIndex].items];
        
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);
        
        updatedMenu.sections[sourceSectionIndex].items = sourceItems;
        updatedMenu.sections[destSectionIndex].items = destItems;
      }
    }

    setMenu(updatedMenu);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!menu || isSaving) return;

    // Tüm ürünlerin name alanını kontrol et
    const hasInvalidItems = menu.sections.some(section => 
      section.items.some(item => !item.name?.trim())
    );

    if (hasInvalidItems) {
      setError(t('validation.allItemNameRequired'));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Validate menu data
      const validatedData = {
        ...menu,
        sections: menu.sections.map((section: MenuSection) => ({
          ...section,
          items: section.items.map((item: MenuItem) => ({
            ...item,
            name: item.name.trim(), // Boşlukları temizle
            price: Number(item.price)
          }))
        }))
      };

      await restaurantService.updateMenu(menuId!, validatedData);
      setMenu(validatedData);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Menu state'ini güncelleyen ve değişiklikleri kaydeden yardımcı fonksiyon
  const updateMenu = useCallback((updatedMenu: Menu) => {
    const currentMenuString = JSON.stringify(updatedMenu);
    if (currentMenuString !== previousMenu) {
      setMenu(updatedMenu);
      setHasChanges(true);
    }
  }, [previousMenu]);

  const handleAddSection = () => {
    if (!menu) return;

    const newSection: MenuSection = {
      id: `section-${uuidv4()}`,
      title: t('menu.newSection'),
      items: []
    };

    setExpandedSections(prev => new Set([...prev, newSection.id]));
    
    updateMenu({
      ...menu,
      sections: [...menu.sections, newSection]
    });
  };

  const handleAddItem = (sectionId: string) => {
    if (!menu) return;

    const newItem: MenuItem = {
      id: `item-${uuidv4()}`,
      name: t('menu.newItem'), // Boş string yerine varsayılan değer
      description: '',
      price: 0,
      imageUrl: ''
    };

    updateMenu({
      ...menu,
      sections: menu.sections.map(section => 
        section.id === sectionId 
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    });
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    if (!menu) return;
    updateMenu({ ...menu, currency });
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    if (!menu) return;

    const error = validateInput.sectionTitle(newTitle);
    setSectionErrors(prev => ({
      ...prev,
      [sectionId]: error ? t(error) : ''
    }));

    // Her zaman state'i güncelle
    updateMenu({
      ...menu,
      sections: menu.sections.map(section =>
        section.id === sectionId ? { ...section, title: newTitle } : section
      )
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!menu) return;

    updateMenu({
      ...menu,
      sections: menu.sections.filter(section => section.id !== sectionId)
    });
  };

  const handleItemUpdate = (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    if (!menu) return;

    // Her zaman state'i güncelle
    updateMenu({
      ...menu,
      sections: menu.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId 
                  ? { ...item, ...updates }
                  : item
              )
            }
          : section
      )
    });
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (!menu) return;

    updateMenu({
      ...menu,
      sections: menu.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter(item => item.id !== itemId)
            }
          : section
      )
    });
  };

  // Tüm section'ları expand/collapse etmek için
  const handleExpandAll = (expand: boolean) => {
    if (expand) {
      setExpandedSections(new Set(menu?.sections.map(s => s.id) || []));
      setAllExpanded(true);
    } else {
      setExpandedSections(new Set());
      setAllExpanded(false);
    }
  };

  // Tekil section'ları expand/collapse etmek için
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    setAllExpanded(newExpanded.size === menu?.sections.length);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error || t('common.error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header bölümü - Mobil için yeniden düzenlendi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-zinc-600 hover:text-zinc-900 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t('common.back')}</span>
        </button>

        <div className="grid grid-cols-3 sm:flex items-stretch gap-2 w-full sm:w-auto">
          <button
            onClick={handleAddSection}
            className="btn-secondary h-10 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('menu.addSection')}</span>
          </button>
          <button
            onClick={() => window.open(`/menu/${menuId}`, '_blank')}
            className="btn-secondary h-10 flex items-center justify-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{t('menu.viewMenu')}</span>
            <span className="sm:hidden">{t('common.view')}</span>
          </button>
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="btn-secondary h-10 flex items-center justify-center space-x-2"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">{t('menu.qrCode')}</span>
            <span className="sm:hidden">QR</span>
          </button>
        </div>
      </div>

      {/* Currency Selection and Expand/Collapse Controls */}
      {menu && menu.sections.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center w-full sm:w-auto">
            <span className="text-zinc-700 font-medium mr-2 whitespace-nowrap">
              {t('menu.currency')}:
            </span>
            <CurrencySelect
              value={menu?.currency || 'TRY'}
              onChange={handleCurrencyChange}
              className="h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleExpandAll(true)}
              className="btn-secondary-sm h-10 flex items-center justify-center space-x-2"
              disabled={allExpanded}
            >
              <ChevronDown className="h-4 w-4" />
              <span>{t('menu.expandAll')}</span>
            </button>
            <button
              onClick={() => handleExpandAll(false)}
              className="btn-secondary-sm h-10 flex items-center justify-center space-x-2"
              disabled={!allExpanded && expandedSections.size === 0}
            >
              <ChevronRight className="h-4 w-4" />
              <span>{t('menu.collapseAll')}</span>
            </button>
          </div>
        </div>
      )}

      {menu && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <StrictModeDroppable droppableId="sections" type="section">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-6"
              >
                {menu.sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-lg shadow-sm border-2 ${
                          snapshot.isDragging ? 'border-zinc-400 shadow-lg' : 'border-zinc-200'
                        }`}
                      >
                        {/* Section header */}
                        <div className="p-4 border-b border-zinc-200 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 bg-zinc-50 rounded-t-lg">
                          <div className="flex items-center flex-1 min-w-0 w-full">
                            <div {...provided.dragHandleProps} className="p-2 hover:bg-zinc-100 rounded cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-5 w-5 text-zinc-400" />
                            </div>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-2 hover:bg-zinc-100 rounded-md mr-2"
                            >
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="h-5 w-5 text-zinc-500" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-zinc-500" />
                              )}
                            </button>
                            <div className="relative flex-1 min-w-0">
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                                className={`w-full text-base sm:text-lg font-semibold bg-transparent border-none 
                                  focus:ring-0 focus:border-none truncate
                                  ${sectionErrors[section.id] ? 'text-red-500' : ''}`}
                                placeholder={t('menu.sectionName')}
                              />
                              {sectionErrors[section.id] && (
                                <p className="absolute text-xs text-red-500 mt-1">
                                  {sectionErrors[section.id]}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                            <span className="text-sm text-zinc-500 whitespace-nowrap">
                              {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                            </span>
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Section items - Collapsible content */}
                        {expandedSections.has(section.id) && (
                          <StrictModeDroppable
                            droppableId={`items-${section.id}`}
                            type="item"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="p-4 space-y-4 min-h-[100px]"
                              >
                                {section.items.map((item, itemIndex) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={itemIndex}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={snapshot.isDragging ? 'shadow-lg' : ''}
                                      >
                                        <ItemForm
                                          item={item}
                                          onUpdate={(updates) => handleItemUpdate(section.id, item.id, updates)}
                                          onDelete={() => handleDeleteItem(section.id, item.id)}
                                          dragHandleProps={provided.dragHandleProps}
                                          currency={menu.currency}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button
                                  onClick={() => handleAddItem(section.id)}
                                  className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-lg text-zinc-500 
                                  hover:border-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition-colors
                                  flex items-center justify-center"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {t('menu.addItem')}
                                </button>
                              </div>
                            )}
                          </StrictModeDroppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      )}

      {isQrModalOpen && (
        <QRCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          menuUrl={`${window.location.origin}/menu/${menuId}`}
          restaurantName={menu?.name || ''}
        />
      )}
    </div>
  );
}

export default MenuEdit;