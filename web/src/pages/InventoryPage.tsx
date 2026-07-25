import React, { useState } from 'react';
import type { Medicine } from '../types/pharmacy';

interface InventoryPageProps {
  medicines: Medicine[];
  onAddMedicine: () => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onDeleteMedicine?: (id: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  medicines,
  onAddMedicine,
  onUpdateStock,
  onDeleteMedicine
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [adjustStockVal, setAdjustStockVal] = useState<string>('');

  const filterTabs = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon'];

  // Check if expiring within 90 days
  const isExpiringSoon = (expiryDateStr: string) => {
    const today = new Date();
    const exp = new Date(expiryDateStr);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  };

  const filteredMedicines = medicines.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.genericName && item.genericName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (selectedFilter === 'In Stock') return item.stock > 0;
    if (selectedFilter === 'Low Stock') return item.stock > 0 && item.stock <= item.minStock;
    if (selectedFilter === 'Out of Stock') return item.stock === 0;
    if (selectedFilter === 'Expiring Soon') return isExpiringSoon(item.expiryDate);

    return true;
  });

  const getIconForMedicine = (category: string, name: string) => {
    if (category === 'Emergency') return { icon: 'emergency_home', bg: 'bg-error-container/30 text-error' };
    if (category === 'Chronic Care') return { icon: 'pill', bg: 'bg-yellow-100 text-yellow-700' };
    if (name.toLowerCase().includes('paracetamol')) return { icon: 'vaccines', bg: 'bg-primary-fixed-dim/30 text-primary' };
    return { icon: 'medication', bg: 'bg-primary-fixed-dim/30 text-primary' };
  };

  const handleAdjustStock = () => {
    if (!selectedMedicine) return;
    const newStock = parseInt(adjustStockVal, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      onUpdateStock(selectedMedicine.id, newStock);
      // Update selected medicine in state to reflect change immediately in UI details view
      setSelectedMedicine({
        ...selectedMedicine,
        stock: newStock,
        status: newStock > selectedMedicine.minStock ? 'In Stock' : newStock === 0 ? 'Out of Stock' : 'Low Stock'
      });
      setAdjustStockVal('');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Inventory Management
          </h2>
          <p className="text-xs md:text-sm text-secondary mt-0.5">
            Monitor real-time pharmacy drug stock levels, batch numbers, and ETB pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddMedicine}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary-container shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add New Medicine
          </button>
        </div>
      </div>

      {/* Search & Filter Area */}
      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicines by name or generic..."
            className="block w-full pl-12 pr-12 py-3.5 bg-surface-container-lowest border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/60 transition-shadow hover:shadow-md text-sm outline-none"
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-secondary hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filterTabs.map((f) => {
            const isActive = selectedFilter === f;
            return (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-5 py-2 rounded-full font-label-md text-xs flex-shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant/30'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-[0px_4px_20px_rgba(22,163,74,0.05)] overflow-hidden">
        {/* Header (Desktop Only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container text-secondary font-label-md border-b border-outline-variant text-xs font-semibold uppercase tracking-wider">
          <div className="col-span-4">Medicine Details</div>
          <div className="col-span-2">Stock Level</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Expiry Date</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-outline-variant/20">
          {filteredMedicines.length === 0 ? (
            <div className="p-12 text-center text-secondary">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
              <p className="text-sm font-semibold">No medicines found matching your filter.</p>
              <p className="text-xs text-outline mt-1">Try adjusting search terms or add a new medicine.</p>
            </div>
          ) : (
            filteredMedicines.map((item) => {
              const { icon, bg } = getIconForMedicine(item.category, item.name);
              const isOutOfStock = item.stock === 0;
              const isLowStock = !isOutOfStock && item.stock <= item.minStock;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedicine(item)}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center border-b border-outline-variant/30 hover:bg-surface-container-low/50 transition-colors cursor-pointer ${
                    isOutOfStock ? 'opacity-75' : ''
                  }`}
                >
                  {/* Medicine Details */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className={`w-10 h-10 flex-shrink-0 ${bg} rounded-xl flex items-center justify-center`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <p className="font-title-md text-on-surface leading-tight font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-secondary mt-0.5">
                        {item.category} • {item.dosage}
                      </p>
                    </div>
                  </div>

                  {/* Stock Level Badge */}
                  <div className="col-span-2 flex items-center">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-error-container text-error font-label-sm text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-error mr-2"></span>
                        0 units
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-label-sm text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        {item.stock} units
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-primary font-label-sm text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                        {item.stock} units
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex items-center text-on-surface font-body-md text-sm font-semibold">
                    ETB {item.unitPriceETB.toFixed(2)}
                  </div>

                  {/* Expiry Date */}
                  <div
                    className={`col-span-2 flex items-center font-label-md text-xs ${
                      isOutOfStock ? 'text-error font-semibold' : 'text-secondary'
                    }`}
                  >
                    Exp: {item.expiryDate}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onUpdateStock(item.id, item.stock + 50)}
                      title="Quick Restock +50"
                      className="p-2 text-secondary hover:text-primary hover:bg-primary-container/10 rounded-lg transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    {onDeleteMedicine && (
                      <button
                        onClick={() => onDeleteMedicine(item.id)}
                        title="Delete Medicine"
                        className="p-2 text-secondary hover:text-error hover:bg-error-container/20 rounded-lg transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination / Footer Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/30">
          <p className="text-sm text-secondary">
            Showing {filteredMedicines.length} of {medicines.length} items in catalog
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-4 h-10 flex items-center justify-center rounded-xl font-label-md text-xs font-semibold cursor-pointer ${
                currentPage === 1
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Medicine Details View Modal / Drawer */}
      {selectedMedicine && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-md p-8 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{selectedMedicine.name}</h3>
                  <p className="text-xs text-secondary mt-0.5">{selectedMedicine.genericName || 'No Generic Name'}</p>
                </div>
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="p-1.5 hover:bg-surface-container-high rounded-lg text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Category</label>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedMedicine.category}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Strength</label>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedMedicine.dosage}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Brand Name</label>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedMedicine.brandName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Manufacturer</label>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedMedicine.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Dosage Form</label>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedMedicine.dosageForm || 'Tablet'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-secondary">Prescription Required</label>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{selectedMedicine.prescriptionRequired ? 'Yes (Rx)' : 'No (OTC)'}</p>
                  </div>
                </div>

                {/* Stock Details */}
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium">Current Stock</span>
                    <span className="font-bold text-on-surface">{selectedMedicine.stock} units</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium">Min Threshold</span>
                    <span className="font-bold text-on-surface">{selectedMedicine.minStock} units</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-medium">Price</span>
                    <span className="font-bold text-primary">ETB {selectedMedicine.unitPriceETB.toFixed(2)}</span>
                  </div>
                </div>

                {/* Batch Information */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-secondary block mb-3">Batch Information</label>
                  <div className="border border-outline-variant/30 rounded-2xl overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-surface-container p-3 text-secondary font-bold border-b border-outline-variant/30">
                      <span>Batch Number</span>
                      <span>Quantity</span>
                      <span>Expiry</span>
                    </div>
                    <div className="grid grid-cols-3 p-3 text-on-surface font-medium bg-white">
                      <span className="font-mono">{selectedMedicine.batchNo || 'B-2026-001'}</span>
                      <span>{selectedMedicine.stock} units</span>
                      <span className={isExpiringSoon(selectedMedicine.expiryDate) ? 'text-error font-bold' : ''}>
                        {selectedMedicine.expiryDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adjust Stock Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface block">Adjust Stock</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="New stock quantity"
                      value={adjustStockVal}
                      onChange={(e) => setAdjustStockVal(e.target.value)}
                      className="border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary flex-1"
                    />
                    <button
                      onClick={handleAdjustStock}
                      className="bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete/Edit Operations */}
            <div className="pt-6 border-t border-outline-variant/20 flex gap-3">
              {onDeleteMedicine && (
                <button
                  onClick={() => {
                    onDeleteMedicine(selectedMedicine.id);
                    setSelectedMedicine(null);
                  }}
                  className="flex-1 py-3 border border-error-container text-error rounded-2xl text-xs font-bold hover:bg-error/5 transition-colors cursor-pointer"
                >
                  Delete Medicine
                </button>
              )}
              <button
                onClick={() => setSelectedMedicine(null)}
                className="flex-1 py-3 bg-surface-container text-on-surface-variant rounded-2xl text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
