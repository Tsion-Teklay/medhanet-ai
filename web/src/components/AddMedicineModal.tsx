import React, { useState } from 'react';
import type { Medicine } from '../types/pharmacy';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medicine: Omit<Medicine, 'id'>) => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<{
    name: string;
    genericName: string;
    category: Medicine['category'];
    dosage: string;
    stock: number;
    minStock: number;
    unitPriceETB: number;
    expiryDate: string;
  }>({
    name: '',
    genericName: '',
    category: 'Antibiotic',
    dosage: '',
    stock: 100,
    minStock: 25,
    unitPriceETB: 45.0,
    expiryDate: '2027-12-31'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage) return;

    let status: Medicine['status'] = 'In Stock';
    if (formData.stock === 0) status = 'Out of Stock';
    else if (formData.stock <= formData.minStock) status = 'Low Stock';

    onAdd({
      ...formData,
      status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden relative">
        <div className="h-1.5 tilet-border w-full"></div>
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Add New Medicine</h3>
                <p className="text-xs text-secondary">Enter details to update inventory stock</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Paracetamol Extra"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Generic Name</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  placeholder="e.g. Acetaminophen"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Dosage / Strength *</label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g. 500mg"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Medicine['category'] })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Chronic Care">Chronic Care</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Painkiller">Painkiller</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Price (ETB) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={formData.unitPriceETB}
                  onChange={(e) => setFormData({ ...formData, unitPriceETB: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Initial Stock *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                Save Medicine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
