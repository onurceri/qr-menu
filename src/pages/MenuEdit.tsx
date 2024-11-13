import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ArrowLeft, Trash2, Edit2, Save, QrCode } from 'lucide-react';
import type { MenuItem, MenuSection, Restaurant } from '../types';
import { QRCodeModal } from '../components/QRCodeModal';
import { useAuth } from '../hooks/useAuth';
import { restaurantService } from '../services/restaurantService';


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

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantData();
    }
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      const data = await restaurantService.getRestaurant(restaurantId!);
      if (data) {
        setRestaurant(data);
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
      await restaurantService.updateRestaurant(user.uid, updatedData);
      setRestaurant(updatedData);
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || 'Restaurant not found'}
      </div>
    );
  }

  // Get the current URL for the QR code
  const menuUrl = window.location.origin;

  const addSection = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedRestaurant = {
        ...restaurant,
        sections: [...restaurant.sections, {
          id: `section-${Date.now()}`,
          title: 'New Section',
          items: [],
        }],
      };
      await saveRestaurantData(updatedRestaurant);
    } catch (err) {
      setError('Failed to add section');
    } finally {
      setLoading(false);
    }
  };

  const updateSectionTitle = async (sectionId: string, title: string) => {
    const updatedRestaurant = {
      ...restaurant,
      sections: restaurant.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    };
    setRestaurant(updatedRestaurant);
    await saveRestaurantData(updatedRestaurant);
  };

  const deleteSection = async (sectionId: string) => {
    const updatedRestaurant = {
      ...restaurant,
      sections: restaurant.sections.filter((section) => section.id !== sectionId),
    };
    setRestaurant(updatedRestaurant);
    await saveRestaurantData(updatedRestaurant);
  };

  const addMenuItem = async (sectionId: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      price: 0,
      description: '',
    };
    const updatedRestaurant = {
      ...restaurant,
      sections: restaurant.sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      ),
    };
    setRestaurant(updatedRestaurant);
    await saveRestaurantData(updatedRestaurant);
    setEditingItem(newItem);
  };

  const updateMenuItem = async (sectionId: string, updatedItem: MenuItem) => {
    const updatedRestaurant = {
      ...restaurant,
      sections: restaurant.sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            items: section.items.map((item) =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          }
          : section
      ),
    };
    setRestaurant(updatedRestaurant);
    await saveRestaurantData(updatedRestaurant);
    setEditingItem(null);
  };

  const deleteMenuItem = async (sectionId: string, itemId: string) => {
    const updatedRestaurant = {
      ...restaurant,
      sections: restaurant.sections.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          }
          : section
      ),
    };
    setRestaurant(updatedRestaurant);
    await saveRestaurantData(updatedRestaurant);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/${restaurantId}`)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                Edit Menu
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="btn flex items-center space-x-2"
              >
                <QrCode className="h-4 w-4" />
                <span>View QR Code</span>
              </button>
              <button
                onClick={addSection}
                className="btn flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Section</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {restaurant.sections.map((section) => (
          <div key={section.id} className="mb-12 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              {editingSection === section.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(section.id, e.target.value)
                    }
                    className="border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                    onBlur={() => setEditingSection(null)}
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingSection(null)}
                    className="p-2 text-emerald-600 hover:text-emerald-700"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                  <button
                    onClick={() => setEditingSection(section.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addMenuItem(section.id)}
                  className="btn"
                >
                  Add Item
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingItem?.id === item.id ? (
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
                              price: parseFloat(e.target.value),
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
                          onClick={() =>
                            updateMenuItem(section.id, editingItem)
                          }
                          className="btn"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-600 mt-1">
                            {item.description}
                          </p>
                        )}
                        <p className="text-emerald-600 font-semibold mt-2">
                          ₺{item.price.toFixed(2)}
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
                          onClick={() => deleteMenuItem(section.id, item.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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

export default MenuEdit;