import React, { useState, useRef } from 'react';

interface BulkRow {
  id: number;
  medicine_name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  strength: string;
  dosage_form: string;
  quantity: string;
  price: string;
  batch_number: string;
  expiry_date: string;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
}

// Sample preview rows (simulates parsed CSV)
const SAMPLE_ROWS: BulkRow[] = [
  { id: 1, medicine_name: 'Paracetamol', generic_name: 'Acetaminophen', brand_name: 'Panadol', category: 'Analgesic', strength: '500mg', dosage_form: 'Tablet', quantity: '200', price: '15.00', batch_number: 'B-2025-001', expiry_date: '2027-12-01', status: 'valid', errors: [] },
  { id: 2, medicine_name: 'Amoxicillin', generic_name: 'Amoxicillin Trihydrate', brand_name: 'Amoxil', category: 'Antibiotic', strength: '500mg', dosage_form: 'Capsule', quantity: '150', price: '120.00', batch_number: 'B-2025-002', expiry_date: '2026-08-15', status: 'warning', errors: ['Expiry date is within 12 months'] },
  { id: 3, medicine_name: '', generic_name: 'Ibuprofen', brand_name: 'Brufen', category: 'Analgesic', strength: '400mg', dosage_form: 'Tablet', quantity: '100', price: '22.00', batch_number: 'B-2025-003', expiry_date: '2028-03-01', status: 'error', errors: ['Medicine name is required'] },
  { id: 4, medicine_name: 'Metformin', generic_name: 'Metformin HCl', brand_name: 'Glucophage', category: 'Chronic Care', strength: '850mg', dosage_form: 'Tablet', quantity: '80', price: '', batch_number: 'B-2025-004', expiry_date: '2027-06-20', status: 'error', errors: ['Price is required'] },
  { id: 5, medicine_name: 'Insulin NPH', generic_name: 'Isophane Insulin', brand_name: 'Humulin N', category: 'Emergency', strength: '100 IU/ml', dosage_form: 'Injection', quantity: '40', price: '340.00', batch_number: 'B-2025-005', expiry_date: '2026-09-10', status: 'warning', errors: ['Expiry date is within 12 months'] },
];

type ImportStep = 'upload' | 'validate' | 'preview' | 'success';

export const BulkImportPage: React.FC = () => {
  const [importStep, setImportStep] = useState<ImportStep>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validCount = rows.filter((r) => r.status === 'valid').length;
  const warningCount = rows.filter((r) => r.status === 'warning').length;
  const errorCount = rows.filter((r) => r.status === 'error').length;

  const simulateFileLoad = (name: string) => {
    setFileName(name);
    setIsProcessing(true);
    setTimeout(() => {
      setRows(SAMPLE_ROWS);
      setIsProcessing(false);
      setImportStep('validate');
    }, 1400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateFileLoad(file.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateFileLoad(file.name);
  };

  const handleImport = () => {
    setIsProcessing(true);
    const validRows = rows.filter((r) => r.status !== 'error').length;
    setTimeout(() => {
      setImportedCount(validRows);
      setIsProcessing(false);
      setImportStep('success');
    }, 1800);
  };

  const reset = () => {
    setImportStep('upload');
    setFileName('');
    setRows([]);
  };

  const statusBadge = (status: BulkRow['status']) => {
    if (status === 'valid') return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">✓ Valid</span>;
    if (status === 'warning') return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">⚠ Warning</span>;
    return <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">✗ Error</span>;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Bulk Inventory Import</h2>
          <p className="text-sm text-secondary mt-0.5">Import hundreds of medicines at once using a CSV or Excel file.</p>
        </div>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-2 border border-primary/30 text-primary px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Download Template
        </a>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-3">
        {(['upload', 'validate', 'preview', 'success'] as ImportStep[]).map((s, i) => {
          const labels = ['Upload File', 'Validate', 'Preview', 'Done'];
          const idx = ['upload', 'validate', 'preview', 'success'].indexOf(importStep);
          const isDone = i < idx;
          const isActive = s === importStep;
          return (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 text-xs font-bold transition-all ${isActive ? 'text-primary' : isDone ? 'text-primary/60' : 'text-secondary'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isDone ? 'bg-primary text-on-primary' : isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary'}`}>
                  {isDone ? '✓' : i + 1}
                </div>
                {labels[i]}
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${isDone ? 'bg-primary' : 'bg-outline-variant/30'}`}></div>}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP: Upload */}
      {importStep === 'upload' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl py-20 flex flex-col items-center gap-5 cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low'}`}
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-on-surface">Drag & drop your file here</p>
              <p className="text-xs text-secondary mt-1">Supports CSV or Excel (.xlsx) format</p>
            </div>
            <button className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all">
              Choose File
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </div>

          {isProcessing && (
            <div className="mt-6 flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-primary">Parsing and validating file…</span>
            </div>
          )}

          <div className="mt-8 border-t border-outline-variant/20 pt-6">
            <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Required CSV Columns</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['medicine_name', 'generic_name', 'category', 'strength', 'dosage_form', 'quantity', 'price', 'batch_number', 'expiry_date', 'brand_name'].map((col) => (
                <span key={col} className="text-[11px] font-mono bg-surface-container-low text-on-surface-variant border border-outline-variant/30 px-3 py-1.5 rounded-lg">{col}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP: Validate */}
      {importStep === 'validate' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-on-surface mb-1">Validation Report</h3>
            <p className="text-xs text-secondary mb-6">File: <strong>{fileName}</strong></p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Rows', value: rows.length, color: 'bg-surface-container-low text-on-surface' },
                { label: 'Valid', value: validCount, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Warnings', value: warningCount, color: 'bg-amber-50 text-amber-700' },
                { label: 'Errors', value: errorCount, color: 'bg-red-50 text-red-700' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-2xl p-5 text-center`}>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-xs font-semibold mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {rows.map((row) => (
                <div key={row.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${row.status === 'valid' ? 'border-emerald-100 bg-emerald-50/50' : row.status === 'warning' ? 'border-amber-100 bg-amber-50/50' : 'border-red-100 bg-red-50/50'}`}>
                  <span className={`material-symbols-outlined text-base mt-0.5 ${row.status === 'valid' ? 'text-emerald-600' : row.status === 'warning' ? 'text-amber-600' : 'text-red-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {row.status === 'valid' ? 'check_circle' : row.status === 'warning' ? 'warning' : 'cancel'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Row {row.id} — {row.medicine_name || '(No name)'}</p>
                    {row.errors.map((err) => (
                      <p key={err} className="text-[11px] text-secondary mt-0.5">{err}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={reset} className="px-6 py-3 border border-outline-variant/40 text-secondary rounded-2xl font-semibold text-sm hover:bg-surface-container-low transition-colors">← Start Over</button>
            <button onClick={() => setImportStep('preview')} className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all">
              Preview Valid Rows →
            </button>
          </div>
        </div>
      )}

      {/* STEP: Preview */}
      {importStep === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface">Preview Medicines to Import</h3>
              <p className="text-xs text-secondary mt-1">{validCount + warningCount} medicines will be imported. {errorCount} rows with errors will be skipped.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant/20">
                  <tr>
                    {['Medicine Name', 'Category', 'Strength', 'Form', 'Qty', 'Price (ETB)', 'Expiry', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-secondary font-semibold text-[11px] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {rows.map((row) => (
                    <tr key={row.id} className={`transition-colors hover:bg-surface-container-low/50 ${row.status === 'error' ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-3.5 font-semibold text-on-surface">{row.medicine_name || <span className="text-error italic">Missing</span>}</td>
                      <td className="px-5 py-3.5 text-secondary">{row.category}</td>
                      <td className="px-5 py-3.5 text-secondary">{row.strength}</td>
                      <td className="px-5 py-3.5 text-secondary">{row.dosage_form}</td>
                      <td className="px-5 py-3.5 font-semibold">{row.quantity}</td>
                      <td className="px-5 py-3.5 font-semibold text-primary">{row.price ? `ETB ${row.price}` : <span className="text-error italic">Missing</span>}</td>
                      <td className="px-5 py-3.5 text-secondary">{row.expiry_date}</td>
                      <td className="px-5 py-3.5">{statusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setImportStep('validate')} className="px-6 py-3 border border-outline-variant/40 text-secondary rounded-2xl font-semibold text-sm hover:bg-surface-container-low transition-colors">← Back</button>
            <button onClick={handleImport} disabled={isProcessing} className="flex-1 bg-primary text-on-primary py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div> Importing…</>
              ) : (
                <><span className="material-symbols-outlined text-base">check_circle</span> Confirm Import ({validCount + warningCount} medicines)</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP: Success */}
      {importStep === 'success' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-600 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-on-surface">Import Successful!</h3>
            <p className="text-sm text-secondary mt-2">{importedCount} medicines have been added to your inventory.</p>
          </div>
          <button onClick={reset} className="bg-primary text-on-primary px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all">
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
};
