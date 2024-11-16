import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Edit2, Save, QrCode, GripVertical, Eye } from 'lucide-react';
import type { MenuItem, MenuSection, Restaurant } from '../types/restaurant';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAuth } from '../hooks/useAuth';
import { restaurantService } from '../services/restaurantService';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { CurrencySelect } from '../components/CurrencySelect';
import { CURRENCIES, type CurrencyCode } from '../constants/currencies';

function MenuEdit() {
  const { user } = useAuth();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingRestaurantName, setEditingRestaurantName] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState<string>('');

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantData();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurant) {
      console.log('Sections and Items:', restaurant.sections);
      restaurant.sections.forEach(section => {
        console.log('Section ID:', section.id);
        section.items.forEach(item => {
          console.log('Item ID:', item.id);
        });
      });
    }
  }, [restaurant]);

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
        
        console.log('Loaded restaurant data:', {
          sections: normalizedData.sections.map((s: MenuSection) => ({
            id: s.id,
            itemCount: s.items.length,
            items: s.items.map((i: MenuItem) => i.id)
          }))
        });
        
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
    if (!user) return;

    try {
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
      console.log('Saved and normalized data:', validatedData);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    }
  };

  // Debug için useEffect ekleyelim
  useEffect(() => {
    if (restaurant) {
      console.log('Current Restaurant State:', {
        sections: restaurant.sections.map(section => ({
          id: section.id,
          items: section.items.map(item => item.id)
        }))
      });
    }
  }, [restaurant]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination || !restaurant) return;

    console.log('Drag Event:', {
      type,
      draggableId,
      source,
      destination
    });

    // Aynı yere bırakıldıysa işlem yapma
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('Item dropped in the same position, no action taken.');
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

        console.log('Looking for sections:', {
          sourceId,
          destId,
          foundSource: !!sourceSection,
          foundDest: !!destSection,
          availableSections: restaurant.sections.map(s => s.id)
        });

        if (!sourceSection || !destSection) {
          console.error('Section not found:', { 
            source: sourceId, 
            destination: destId,
            availableSections: restaurant.sections.map(s => s.id)
          });
          return;
        }

        // Taşınan öğeyi bul
        const movedItem = sourceSection.items.find(item => item.id === draggableId);
        if (!movedItem) {
          console.error('Item not found:', {
            itemId: draggableId,
            sectionItems: sourceSection.items.map(i => i.id)
          });
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
        console.log('Updated Restaurant:', updatedRestaurant);
        setRestaurant(updatedRestaurant);
        await saveRestaurantData(updatedRestaurant);
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
      await loadRestaurantData();
    }
  };

  const updateMenuItem = async (sectionId: string, updatedItem: MenuItem) => {
    if (!restaurant) return;

    try {
      const updatedSections = restaurant.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => 
              item.id === updatedItem.id ? updatedItem : item
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
      setEditingItem(null); // Clear editing state
    } catch (error) {
      console.error('Failed to update menu item:', error);
      setError('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (sectionId: string, itemId: string) => {
    if (!restaurant) return;

    try {
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
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      setError('Failed to delete menu item');
    }
  };

  // Yeni: Section başlığını güncelleyen fonksiyon
  const updateSectionTitle = async (sectionId: string, newTitle: string) => {
    if (!restaurant) return;

    try {
      const updatedSections = restaurant.sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, title: newTitle };
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
    if (!restaurant) return;
    
    try {
      const updatedSections = restaurant.sections.filter(section => section.id !== sectionId);
      const updatedRestaurant = { ...restaurant, sections: updatedSections };
      await saveRestaurantData(updatedRestaurant);
      setRestaurant(updatedRestaurant);
    } catch (error) {
      console.error('Failed to delete section:', error);
      setError('Failed to delete section');
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
            className={`border rounded-lg p-4 bg-white ${
              snapshot.isDragging ? 'shadow-lg opacity-50 scale-105' : 'hover:shadow-md'
            } transition-all`}
          >
            {editingItem?.id === item.id ? (
              // Editing form
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      name: e.target.value,
                    })
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Item name"
                />
                <input
                  type="text"
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Description"
                />
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="block w-32 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Price"
                    step="0.01"
                  />
                  <input
                    type="text"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        imageUrl: e.target.value,
                      })
                    }
                    className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Image URL"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateMenuItem(sectionId, editingItem)}
                    className="btn"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="flex items-start">
                <div
                  {...provided.dragHandleProps}
                  className="touch-manipulation p-2 mr-2 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">{item.name}</h3>
                      {item.description && (
                        <p className="text-zinc-600 mt-1">{item.description}</p>
                      )}
                      <p className="text-zinc-800 font-medium mt-2">
                        {CURRENCIES[restaurant?.currency || 'TRY'].symbol}
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMenuItem(sectionId, item.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>
    ),
    [editingItem, setEditingItem, updateMenuItem, deleteMenuItem]
  );

  // Move addMenuItem here
  const addMenuItem = (sectionId: string) => {
    if (!restaurant) return;

    const newItem: MenuItem = {
      id: `item-${uuidv4()}`,
      name: 'New Item',
      description: '',
      price: 0,
      imageUrl: '',
    };

    const updatedSections = restaurant.sections.map(section =>
      section.id === sectionId
        ? { ...section, items: [...section.items, newItem] }
        : section
    );

    const updatedRestaurant = { ...restaurant, sections: updatedSections };
    saveRestaurantData(updatedRestaurant);
    setRestaurant(updatedRestaurant);
  };

  const addSection = () => {
    if (!restaurant) return;

    const newSection: MenuSection = {
      id: `section-${uuidv4()}`,
      title: 'New Section',
      items: [],
    };

    const updatedRestaurant = {
      ...restaurant,
      sections: [...restaurant.sections, newSection],
    };

    saveRestaurantData(updatedRestaurant);
    setRestaurant(updatedRestaurant);
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
                  className="btn-secondary-sm"
                >
                  Add Item
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 text-zinc-400 hover:text-zinc-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <Droppable 
              droppableId={section.id}
              type="item"
            >
              {(provided, snapshot) => (
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
            </Droppable>
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

  // Add this debug effect to monitor item IDs
  useEffect(() => {
    if (restaurant) {
      console.log('All item IDs:', restaurant.sections.flatMap(section => 
        section.items.map(item => ({
          sectionId: section.id,
          itemId: item.id,
          itemName: item.name
        }))
      ));
    }
  }, [restaurant]);

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
              onClick={() => navigate(`/${restaurantId}`)}
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
                <span>View Menu</span>
              </button>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="btn-secondary-sm flex items-center space-x-2 whitespace-nowrap"
              >
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>QR Code</span>
              </button>
              <button
                onClick={addSection}
                className="btn-sm flex items-center space-x-2 whitespace-nowrap"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="section">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {restaurant.sections.map((section, index) => 
                  renderDraggableSection(section, index)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
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