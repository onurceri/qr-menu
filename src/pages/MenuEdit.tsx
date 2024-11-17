import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Edit2, Save, QrCode, GripVertical, Eye } from 'lucide-react';
import type { MenuItem, MenuSection, Restaurant } from '../types/restaurant';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAuth } from '../hooks/useAuth';
import { restaurantService } from '../services/restaurantService';
import { DragDropContext, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { CurrencySelect } from '../components/CurrencySelect';
import { CURRENCIES, type CurrencyCode } from '../constants/currencies';
import { StrictModeDroppable } from '../components/StrictModeDroppable';
import { useTranslation } from 'react-i18next';

// MenuItem interface'ine price'ı string olarak tutan geçici bir alan ekleyelim
interface EditingMenuItem extends MenuItem {
  tempPrice?: string;
}

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

function MenuEdit() {
  const { user } = useAuth();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingMenuItem | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingRestaurantName, setEditingRestaurantName] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantData();
    }
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      const data = await restaurantService.getRestaurant(restaurantId!);
      if (data) {
        // Normalize data and create a stable reference
        const normalizedData = {
          ...data,
          sections: data.sections.map((section: MenuSection) => {
            const sectionId = section.id.startsWith('section-') 
              ? section.id 
              : `section-${section.id}`;
            
            return {
              ...section,
              id: sectionId,
              items: section.items.map((item: MenuItem) => ({
                ...item,
                id: item.id.startsWith('item-') ? item.id : `item-${item.id}`
              }))
            };
          })
        };
        
        setRestaurant(normalizedData);
      } else {
        setError('Restaurant not found');
      }
    } catch (err) {
      console.error('Failed to load restaurant data:', err);
      setError('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const saveRestaurantData = async (updatedData: Restaurant) => {
    if (!user || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      // Create a new reference with normalized IDs
      const validatedData = {
        ...updatedData,
        sections: updatedData.sections.map(section => {
          const sectionId = section.id.startsWith('section-') 
            ? section.id 
            : `section-${section.id}`;
            
          return {
            ...section,
            id: sectionId,
            items: section.items.map(item => ({
              ...item,
              id: item.id.startsWith('item-') ? item.id : `item-${item.id}`
            }))
          };
        })
      };

      // Save the normalized data
      await restaurantService.updateRestaurant(restaurantId!, validatedData);
      
      // Update state with the same normalized data
      setRestaurant(validatedData);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination || !restaurant) return;

    // Aynı yere bırakıldıysa işlem yapma
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      let updatedRestaurant;

      // Bölüm taşıma
      if (type === 'section') {
        const reorderedSections = Array.from(restaurant.sections);
        const [movedSection] = reorderedSections.splice(source.index, 1);
        reorderedSections.splice(destination.index, 0, movedSection);

        updatedRestaurant = { ...restaurant, sections: reorderedSections };
      }
      // Öğe taşıma
      else if (type === 'item') {
        // Remove any potential 'items-' prefix from the droppableIds
        const sourceId = source.droppableId.replace('items-', '');
        const destId = destination.droppableId.replace('items-', '');
        
        const sourceSection = restaurant.sections.find(s => s.id === sourceId);
        const destSection = restaurant.sections.find(s => s.id === destId);

        if (!sourceSection || !destSection) {
          return;
        }

        // Taşınan öğeyi bul
        const movedItem = sourceSection.items.find(item => item.id === draggableId);
        if (!movedItem) {
          return;
        }

        // Aynı bölüm içinde taşıma
        if (source.droppableId === destination.droppableId) {
          const newItems = Array.from(sourceSection.items);
          newItems.splice(source.index, 1);
          newItems.splice(destination.index, 0, movedItem);

          updatedRestaurant = {
            ...restaurant,
            sections: restaurant.sections.map(section =>
              section.id === sourceSection.id
                ? { ...section, items: newItems }
                : section
            )
          };
        }
        // Farklı bölümler arası taşıma
        else {
          const sourceItems = Array.from(sourceSection.items);
          const [movedItem] = sourceItems.splice(source.index, 1);
          const destItems = Array.from(destSection.items);
          destItems.splice(destination.index, 0, movedItem);

          updatedRestaurant = {
            ...restaurant,
            sections: restaurant.sections.map(section => {
              if (section.id === sourceSection.id) {
                return { ...section, items: sourceItems };
              }
              if (section.id === destSection.id) {
                return { ...section, items: destItems };
              }
              return section;
            })
          };
        }
      }

      if (updatedRestaurant) {
        setRestaurant(updatedRestaurant);
        await saveRestaurantData(updatedRestaurant);
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
      await loadRestaurantData();
    }
  };

  const updateMenuItem = async (sectionId: string, updatedItem: EditingMenuItem) => {
    if (!restaurant) return;

    try {
      setImageError(null);
      setError(null);

      // Tüm alanları validate et
      const nameError = validateInput.name(updatedItem.name);
      const descriptionError = validateInput.description(updatedItem.description || '');
      const priceError = validateInput.price(updatedItem.tempPrice || '0');
      const imageUrlError = validateInput.imageUrl(updatedItem.imageUrl || '');

      // Hataları topla
      const errors = [nameError, descriptionError, priceError, imageUrlError]
        .filter(Boolean);

      if (errors.length > 0) {
        setError(errors[0]);
        return;
      }

      // Sadece image URL'in çalışıp çalışmadığını kontrol et
      if (updatedItem.imageUrl) {
        const imageExists = await checkImageExists(updatedItem.imageUrl);
        if (!imageExists) {
          setImageError('Unable to load the image. Please check the URL');
          return;
        }
      }

      // tempPrice'ı number'a çevir veya 0 kullan
      const finalPrice = updatedItem.tempPrice 
        ? parseFloat(updatedItem.tempPrice) || 0 
        : updatedItem.price;

      // XSS koruması için HTML escape işlemi
      const sanitizedItem: MenuItem = {
        ...updatedItem,
        name: updatedItem.name.replace(/[<>]/g, ''),
        description: updatedItem.description?.replace(/[<>]/g, '') || '',
        price: finalPrice,
      };

      const updatedSections = restaurant.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => 
              item.id === sanitizedItem.id ? sanitizedItem : item
            )
          };
        }
        return section;
      });

      const updatedRestaurant = {
        ...restaurant,
        sections: updatedSections
      };

      await saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update menu item:', error);
      setError('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (sectionId: string, itemId: string) => {
    if (!restaurant || isDeletingItem) return;

    try {
      setIsDeletingItem(itemId);
      const updatedSections = restaurant.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          };
        }
        return section;
      });

      const updatedRestaurant = {
        ...restaurant,
        sections: updatedSections
      };

      await saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } finally {
      setIsDeletingItem(null);
    }
  };

  // Yeni: Section başlığını güncelleyen fonksiyon
  const updateSectionTitle = async (sectionId: string, newTitle: string) => {
    if (!restaurant) return;

    try {
      const titleError = validateInput.sectionTitle(newTitle);
      if (titleError) {
        setError(titleError);
        return;
      }

      // XSS koruması için HTML escape işlemi
      const sanitizedTitle = newTitle.replace(/[<>]/g, '');

      const updatedSections = restaurant.sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, title: sanitizedTitle };
        }
        return section;
      });

      const updatedRestaurant = { ...restaurant, sections: updatedSections };
      await saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
      setEditingSection(null);
    } catch (error) {
      console.error('Failed to update section title:', error);
      setError('Failed to update section title');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!restaurant || isDeletingSection) return;
    
    try {
      setIsDeletingSection(sectionId);
      const updatedSections = restaurant.sections.filter(section => section.id !== sectionId);
      const updatedRestaurant = { ...restaurant, sections: updatedSections };
      await saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } finally {
      setIsDeletingSection(null);
    }
  };

  // First, update the renderDraggableItem function to handle editing properly
  const renderDraggableItem = React.useCallback(
    (item: MenuItem, index: number, sectionId: string) => (
      <Draggable 
        key={item.id} 
        draggableId={item.id}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`border rounded-lg p-2 sm:p-4 bg-white ${
              snapshot.isDragging ? 'shadow-lg opacity-50 scale-105' : 'hover:shadow-md'
            } transition-all`}
          >
            <div className="flex items-start">
              <div
                {...provided.dragHandleProps}
                className="touch-manipulation p-1 sm:p-2 mr-1 sm:mr-2 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0 max-w-full">
                {editingItem?.id === item.id ? (
                  <div className="space-y-3">
                    <div className="w-full">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            name: e.target.value,
                          })
                        }
                        className="block w-full text-sm sm:text-base border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={t('menu.itemName')}
                      />
                    </div>
                    <div className="w-full">
                      <input
                        type="text"
                        value={editingItem.description || ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            description: e.target.value,
                          })
                        }
                        className="block w-full text-sm sm:text-base border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={t('menu.itemDescription')}
                      />
                    </div>
                    <div className="w-full sm:w-48">
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('menu.itemPrice')}
                      </label>
                      <input
                        id="price"
                        type="number"
                        value={editingItem.tempPrice ?? editingItem.price.toString()}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            tempPrice: e.target.value,
                          })
                        }
                        className="block w-full text-sm sm:text-base border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('menu.imageUrl')}
                      </label>
                      <input
                        id="imageUrl"
                        type="text"
                        value={editingItem.imageUrl || ''}
                        onChange={(e) => {
                          setImageError(null);
                          setEditingItem({
                            ...editingItem,
                            imageUrl: e.target.value,
                          })
                        }}
                        className={`block w-full text-sm sm:text-base border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 ${
                          imageError ? 'border-red-300' : ''
                        }`}
                        placeholder="https://..."
                      />
                      {imageError && (
                        <p className="mt-1 text-sm text-red-600">
                          {imageError}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setImageError(null);
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t('menu.cancel')}
                      </button>
                      <button
                        onClick={() => updateMenuItem(sectionId, editingItem)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm btn"
                        disabled={!!imageError}
                      >
                        {t('menu.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 min-w-0 space-x-3">
                      {/* Image container */}
                      {item.imageUrl && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Resim yüklenemezse error class'ı ekle
                              (e.target as HTMLImageElement).classList.add('error');
                              // Placeholder göster
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                            }}
                          />
                        </div>
                      )}
                      {/* Content container */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-zinc-900 truncate">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => setEditingItem({
                              ...item,
                              tempPrice: item.price.toString()
                            })}
                            className="p-1 text-zinc-400 hover:text-zinc-600 flex-shrink-0"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.description && (
                          <p className="text-zinc-600 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <p className="text-zinc-800 font-medium mt-2">
                          {CURRENCIES[restaurant?.currency || 'TRY'].symbol}
                          {item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMenuItem(sectionId, item.id)}
                      className="p-2 text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    ),
    [editingItem, setEditingItem, updateMenuItem, deleteMenuItem, restaurant?.currency, imageError]
  );

  // Move addMenuItem here
  const addMenuItem = async (sectionId: string) => {
    if (!restaurant || isAddingItem) return;

    try {
      setIsAddingItem(sectionId);
      const newItem: MenuItem = {
        id: `item-${uuidv4()}`,
        name: t('menu.newItem'),
        description: '',
        price: 0,
        imageUrl: '',
      };

      // Yeni item'ı düzenleme modunda açalım
      setEditingItem({
        ...newItem,
        tempPrice: '', // Boş string olarak başlat
      });

      const updatedSections = restaurant.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      );

      const updatedRestaurant = { ...restaurant, sections: updatedSections };
      saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } finally {
      setIsAddingItem(null);
    }
  };

  const addSection = async () => {
    if (!restaurant || isAddingSection) return;

    try {
      setIsAddingSection(true);
      const newSection: MenuSection = {
        id: `section-${uuidv4()}`,
        title: t('menu.newSection'),
        items: [],
      };

      const updatedRestaurant = {
        ...restaurant,
        sections: [...restaurant.sections, newSection],
      };

      saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } finally {
      setIsAddingSection(false);
    }
  };

  // Then define renderDraggableSection
  const renderDraggableSection = React.useCallback(
    (section: MenuSection, index: number) => (
      <Draggable 
        key={section.id} 
        draggableId={section.id}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`mb-12 bg-white rounded-lg shadow p-6 touch-manipulation ${
              snapshot.isDragging ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span {...provided.dragHandleProps} className="cursor-grab mr-2 text-zinc-400">
                  &#x2630;
                </span>
                {editingSection === section.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingSectionTitle}
                      onChange={(e) => setEditingSectionTitle(e.target.value)}
                      className="border-b border-zinc-200 focus:border-zinc-900 focus:outline-none"
                      onBlur={() => {
                        updateSectionTitle(section.id, editingSectionTitle);
                        setEditingSection(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingSection(null)}
                      className="p-2 text-zinc-600 hover:text-zinc-900"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-zinc-900">
                      {section.title}
                    </h2>
                    <button
                      onClick={() => {
                        setEditingSectionTitle(section.title);
                        setEditingSection(section.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addMenuItem(section.id)}
                  disabled={isAddingItem === section.id}
                  className="btn-secondary-sm"
                >
                  {isAddingItem === section.id ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                      <span>{t('menu.saving')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>{t('menu.addItem')}</span>
                    </span>
                  )}
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  disabled={isDeletingSection === section.id}
                  className="p-2 text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
                >
                  {isDeletingSection === section.id ? (
                    <div className="w-5 h-5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <StrictModeDroppable 
              droppableId={section.id}
              type="item"
            >
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-4 ${
                    snapshot.isDraggingOver ? 'bg-gray-50' : ''
                  }`}
                >
                  {section.items.map((item, itemIndex) =>
                    renderDraggableItem(item, itemIndex, section.id)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </div>
        )}
      </Draggable>
    ),
    [editingSection, editingSectionTitle, setEditingSectionTitle, updateSectionTitle, deleteSection, addMenuItem, renderDraggableItem]
  );

  const updateRestaurantName = async (newName: string) => {
    if (!restaurant || !user) return;

    try {
      const updatedRestaurant = { ...restaurant, name: newName };
      await restaurantService.updateRestaurant(restaurantId!, updatedRestaurant);
      setRestaurant(updatedRestaurant);
      setEditingRestaurantName(null);
    } catch (error) {
      console.error('Failed to update restaurant name:', error);
      setError('Failed to update restaurant name');
    }
  };

  const updateCurrency = async (newCurrency: CurrencyCode) => {
    if (!restaurant || !user) return;

    try {
      const updatedRestaurant = { ...restaurant, currency: newCurrency };
      await restaurantService.updateRestaurant(restaurantId!, updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } catch (error) {
      console.error('Failed to update currency:', error);
      setError('Failed to update currency');
    }
  };

  if (loading || !restaurant) {
    return <div>Loading...</div>;
  }

  // Get the current URL for the QR code
  const menuUrl = `${window.location.origin}/${restaurantId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Üst satır - Geri butonu ve restoran adı */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {editingRestaurantName !== null ? (
              <input
                type="text"
                value={editingRestaurantName}
                onChange={(e) => setEditingRestaurantName(e.target.value)}
                onBlur={() => updateRestaurantName(editingRestaurantName)}
                className="ml-4 text-xl font-semibold text-zinc-900 border-b border-zinc-200 focus:border-zinc-900 focus:outline-none"
                autoFocus
              />
            ) : (
              <h1
                className="ml-4 text-xl font-semibold text-zinc-900 cursor-pointer hover:text-zinc-700"
                onClick={() => setEditingRestaurantName(restaurant?.name || '')}
              >
                {restaurant?.name}
              </h1>
            )}
          </div>

          {/* Alt satır - Butonlar */}
          <div className="flex flex-wrap items-center gap-3">
            <CurrencySelect
              value={restaurant?.currency || 'TRY'}
              onChange={updateCurrency}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.open(`/${restaurantId}`, '_blank')}
                className="btn-secondary-sm flex items-center space-x-2 whitespace-nowrap"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('menu.viewMenu')}</span>
              </button>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="btn-secondary-sm flex items-center space-x-2 whitespace-nowrap"
              >
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{t('menu.qrCode')}</span>
              </button>
              <button
                onClick={addSection}
                disabled={isAddingSection}
                className="btn-sm flex items-center space-x-2 whitespace-nowrap"
              >
                {isAddingSection ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('menu.saving')}</span>
                  </span>
                ) : (
                  <>
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('menu.addSection')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <StrictModeDroppable droppableId="sections" type="section">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {restaurant.sections.map((section, index) => 
                  renderDraggableSection(section, index)
                )}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </main>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        menuUrl={menuUrl}
        restaurantName={restaurant.name}
      />
    </div>
  );
}

// Bileşeni memo ile sarmalayalım
export default React.memo(MenuEdit);