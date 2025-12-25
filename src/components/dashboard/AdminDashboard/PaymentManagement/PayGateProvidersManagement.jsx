"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit2, Save, X, RotateCcw, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Swal from "sweetalert2";

function SortableProviderRow({ provider, onEdit, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: provider.code });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${
        isDragging ? 'shadow-2xl z-50' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-cyan-400 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={20} />
        </div>

        <div className="text-2xl">{provider.icon || '💳'}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold truncate">{provider.name}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
              {provider.type}
            </span>
          </div>
          <p className="text-gray-400 text-sm truncate">{provider.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Code: {provider.code}</span>
            <span>Provider: {provider.provider}</span>
            <span>Min: ${provider.minAmount}</span>
            {provider.maxAmount && <span>Max: ${provider.maxAmount}</span>}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500">Order</span>
          <span className="px-3 py-1 bg-gray-700 text-cyan-400 rounded-full font-semibold">
            #{provider.sortOrder + 1}
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={provider.isActive !== false}
            onChange={() => onToggle(provider.code)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>

        <button
          onClick={() => onEdit(provider)}
          className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
          title="Edit provider"
        >
          <Edit2 size={18} />
        </button>
      </div>
    </div>
  );
}

const PayGateProvidersManagement = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingProvider, setEditingProvider] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isLanguageLoaded) {
      fetchProviders();
    }
  }, [isLanguageLoaded]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/paygate-providers');
      const data = await response.json();

      if (data.success) {
        const sorted = (data.providers || []).sort((a, b) => a.sortOrder - b.sortOrder);
        setProviders(sorted);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProviders((items) => {
        const oldIndex = items.findIndex((item) => item.code === active.id);
        const newIndex = items.findIndex((item) => item.code === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        return reordered.map((item, index) => ({
          ...item,
          sortOrder: index,
        }));
      });
    }
  };

  const handleToggleActive = (code) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.code === code ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  const handleEdit = (provider) => {
    setEditingProvider({ ...provider });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingProvider) return;

    setProviders((prev) =>
      prev.map((p) =>
        p.code === editingProvider.code ? editingProvider : p
      )
    );

    setShowEditModal(false);
    setEditingProvider(null);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const response = await fetch('/api/admin/paygate-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providers }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Saved successfully!' });
        
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Provider settings saved successfully',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#06b6d4',
        });
        
        await fetchProviders();
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message,
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#06b6d4',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    const result = await Swal.fire({
      title: 'Reset to defaults?',
      text: 'This will overwrite your current configuration and update all providers with the latest defaults (including region updates).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#06b6d4',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch('/api/admin/paygate-providers', {
        method: 'PUT',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Sort providers by sortOrder
        const sortedProviders = data.providers.sort((a, b) => a.sortOrder - b.sortOrder);
        setProviders(sortedProviders);
        setMessage({ type: 'success', text: `Reset complete! ${data.providers.length} providers loaded.` });
        
        await Swal.fire({
          icon: 'success',
          title: 'Reset Complete!',
          text: `Providers have been reset to defaults. ${data.providers.length} providers loaded with updated configurations.`,
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#06b6d4',
        });
        
        // Reload the page to ensure fresh data everywhere
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to reset providers');
      }
    } catch (error) {
      console.error('Reset error:', error);
      setMessage({ type: 'error', text: error.message });
      
      await Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: error.message,
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            PayGate Provider Configuration
          </h3>
          <p className="text-gray-400 text-sm">
            🔀 Drag and drop to reorder • 🎚️ Toggle to enable/disable • ✏️ Click edit to customize
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResetToDefaults}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={providers.map(p => p.code)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {providers.map((provider) => (
              <SortableProviderRow
                key={provider.code}
                provider={provider}
                onEdit={handleEdit}
                onToggle={handleToggleActive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {providers.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-4">No providers configured</p>
          <button
            onClick={handleResetToDefaults}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Load Default Providers
          </button>
        </div>
      )}

      {showEditModal && editingProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Provider</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={editingProvider.name}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingProvider.description}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, description: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Amount ($)
                  </label>
                  <input
                    type="number"
                    value={editingProvider.minAmount}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        minAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon/Emoji
                  </label>
                  <input
                    type="text"
                    value={editingProvider.icon}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, icon: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayGateProvidersManagement;
