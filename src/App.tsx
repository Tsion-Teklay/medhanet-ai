import React, { useState } from 'react';
import {
  Pill,
  LayoutDashboard,
  FileText,
  Package,
  Bot,
  BarChart3,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  category: string;
  dosage: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Critical';
}

interface Order {
  id: string;
  patientName: string;
  rxId: string;
  doctorName: string;
  medication: string;
  date: string;
  status: 'Processing' | 'Dispensed' | 'Pending Review' | 'Cancelled';
  amount: number;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'ai-assistant' | 'analytics'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // AI Drug Checker state
  const [drug1, setDrug1] = useState('Warfarin 5mg');
  const [drug2, setDrug2] = useState('Aspirin 81mg');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(
    'Warning: Concurrent use of Warfarin and Aspirin increases major hemorrhage risk. MedhaNet AI recommends clinical review.'
  );

  // Mock Inventory Data
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: 'MED-101', name: 'Amoxicillin Trihydrate', category: 'Antibiotic', dosage: '500mg', stock: 450, minStock: 100, unitPrice: 12.50, expiryDate: '2027-04-15', status: 'In Stock' },
    { id: 'MED-102', name: 'Lipitor (Atorvastatin)', category: 'Cardiovascular', dosage: '20mg', stock: 85, minStock: 150, unitPrice: 28.00, expiryDate: '2026-11-30', status: 'Low Stock' },
    { id: 'MED-103', name: 'Metformin HCl', category: 'Diabetes', dosage: '850mg', stock: 620, minStock: 200, unitPrice: 9.75, expiryDate: '2027-08-20', status: 'In Stock' },
    { id: 'MED-104', name: 'Lisinopril', category: 'Hypertension', dosage: '10mg', stock: 18, minStock: 100, unitPrice: 15.20, expiryDate: '2026-09-10', status: 'Critical' },
    { id: 'MED-105', name: 'Omeprazole Delayed-Release', category: 'Gastroenterology', dosage: '40mg', stock: 310, minStock: 120, unitPrice: 18.50, expiryDate: '2027-01-05', status: 'In Stock' },
  ]);

  // Mock Orders Data
  const [orders, setOrders] = useState<Order[]>([
    { id: 'RX-9082', patientName: 'Eleanor Vance', rxId: 'DR-4421', doctorName: 'Dr. Sarah Lin', medication: 'Amoxicillin 500mg (x21 caps)', date: 'Today, 09:30 AM', status: 'Processing', amount: 37.50 },
    { id: 'RX-9083', patientName: 'Marcus Holloway', rxId: 'DR-8820', doctorName: 'Dr. James Thorne', medication: 'Metformin 850mg (x60 tabs)', date: 'Today, 08:45 AM', status: 'Dispensed', amount: 19.50 },
    { id: 'RX-9084', patientName: 'Clara Oswald', rxId: 'DR-1192', doctorName: 'Dr. Aris Vance', medication: 'Lisinopril 10mg (x30 tabs)', date: 'Today, 08:15 AM', status: 'Pending Review', amount: 15.20 },
    { id: 'RX-9085', patientName: 'David Zhang', rxId: 'DR-7734', doctorName: 'Dr. Sarah Lin', medication: 'Lipitor 20mg (x30 tabs)', date: 'Yesterday', status: 'Dispensed', amount: 28.00 },
  ]);

  // Form State for Add Medicine Modal
  const [newMed, setNewMed] = useState({
    name: '',
    category: 'General',
    dosage: '',
    stock: 100,
    minStock: 50,
    unitPrice: 10.0,
    expiryDate: '2027-12-31'
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;

    const created: Medicine = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: newMed.name,
      category: newMed.category,
      dosage: newMed.dosage,
      stock: Number(newMed.stock),
      minStock: Number(newMed.minStock),
      unitPrice: Number(newMed.unitPrice),
      expiryDate: newMed.expiryDate,
      status: Number(newMed.stock) <= Number(newMed.minStock) ? (Number(newMed.stock) < 20 ? 'Critical' : 'Low Stock') : 'In Stock'
    };

    setMedicines([created, ...medicines]);
    setShowAddModal(false);
    showToast(`Added ${created.name} to Smart Inventory`);
    setNewMed({ name: '', category: 'General', dosage: '', stock: 100, minStock: 50, unitPrice: 10.0, expiryDate: '2027-12-31' });
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    showToast(`Order ${orderId} updated to ${nextStatus}`);
  };

  const handleAnalyzeInteraction = () => {
    setAiAnalysisResult(`Analyzing interaction between "${drug1}" and "${drug2}"...`);
    setTimeout(() => {
      setAiAnalysisResult(
        `MedhaNet AI Safety Report:\n• Moderate synergistic effect detected.\n• Recommendation: Monitor renal function and blood pressure weekly.\n• Risk Index: Low-Moderate (Level 2).`
      );
    }, 600);
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.medication.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container" data-theme={theme}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Pill size={22} />
          </div>
          <div>
            <div className="logo-text">MedhaNet AI</div>
            <div className="logo-sub">Pharmacy Portal</div>
          </div>
        </div>

        <nav className="nav-section">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FileText />
            <span>Prescriptions & Orders</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package />
            <span>Smart Inventory</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-assistant')}
          >
            <Bot />
            <span>AI Copilot & Safety</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 />
            <span>Analytics & Reports</span>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: 'var(--bg-card-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            Connected Remote:
            <div style={{ wordBreak: 'break-all', color: 'var(--primary)', marginTop: '4px', fontSize: '0.7rem' }}>
              MedhaNet-Pharmacies-frontend-
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <Search />
            <input
              type="text"
              placeholder="Search medications, patients, or prescription IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="icon-btn" title="System Notifications">
              <Bell size={18} />
              <span className="badge-dot"></span>
            </button>

            <div className="user-profile">
              <div className="avatar">DR</div>
              <div className="user-info">
                <span className="user-name">Dr. Raymond Vance</span>
                <span className="user-role">Lead Pharmacist</span>
              </div>
            </div>
          </div>
        </header>

        {/* Toast Alert */}
        {notification && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--primary)',
            color: '#0b0f17',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            boxShadow: '0 10px 25px rgba(6, 182, 212, 0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={18} />
            {notification}
          </div>
        )}

        {/* Content Body */}
        <div className="content-body">
          {/* AI Banner Alert */}
          <div className="ai-copilot-card">
            <div className="ai-icon">
              <Bot size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>MedhaNet AI Intelligence System Active</span>
                <span className="status-pill status-active" style={{ fontSize: '0.65rem' }}>Live Monitoring</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Automated drug safety check complete. 1 inventory item requires urgent restocking (Lisinopril 10mg - 18 units left).
              </p>
            </div>
            <button className="btn-primary" onClick={() => setActiveTab('ai-assistant')}>
              Open Copilot
            </button>
          </div>

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stat Cards */}
              <div className="stats-grid">
                <div className="glass-panel stat-card">
                  <div className="stat-info">
                    <p>Total Prescriptions Today</p>
                    <div className="stat-value">124</div>
                    <div className="stat-trend trend-up">
                      <TrendingUp size={14} /> +14.2% from yesterday
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}>
                    <FileText size={24} />
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div className="stat-info">
                    <p>Active Inventory Items</p>
                    <div className="stat-value">{medicines.length} Types</div>
                    <div className="stat-trend trend-up">
                      <ShieldCheck size={14} /> 98.4% Compliance
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ color: 'var(--accent-emerald)' }}>
                    <Package size={24} />
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div className="stat-info">
                    <p>Low Stock Alerts</p>
                    <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>2 Items</div>
                    <div className="stat-trend trend-down">
                      <AlertTriangle size={14} /> Reorder suggested
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ color: 'var(--accent-amber)' }}>
                    <AlertTriangle size={24} />
                  </div>
                </div>

                <div className="glass-panel stat-card">
                  <div className="stat-info">
                    <p>Fulfillment Revenue</p>
                    <div className="stat-value">$4,285.00</div>
                    <div className="stat-trend trend-up">
                      <DollarSign size={14} /> +8.5% this week
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ color: 'var(--secondary)' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              {/* Main Dashboard Section */}
              <div className="grid-2col">
                {/* Recent Prescriptions */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div className="section-header">
                    <div className="section-title">
                      <Clock size={20} style={{ color: 'var(--primary)' }} />
                      Recent Prescriptions & Dispenses
                    </div>
                    <button className="btn-secondary" onClick={() => setActiveTab('orders')}>View All</button>
                  </div>

                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Rx ID</th>
                          <th>Medication</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice(0, 4).map(o => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: 600 }}>{o.patientName}</td>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{o.id}</td>
                            <td>{o.medication}</td>
                            <td>
                              <span className={`status-pill status-${o.status.toLowerCase().replace(' ', '')}`}>
                                {o.status}
                              </span>
                            </td>
                            <td>
                              {o.status === 'Processing' && (
                                <button
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Dispensed')}
                                >
                                  Dispense
                                </button>
                              )}
                              {o.status === 'Pending Review' && (
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => handleUpdateOrderStatus(o.id, 'Processing')}
                                >
                                  Approve
                                </button>
                              )}
                              {o.status === 'Dispensed' && (
                                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
                                  ✓ Ready
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Monitoring Widget */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div className="section-header">
                    <div className="section-title">
                      <AlertTriangle size={20} style={{ color: 'var(--accent-amber)' }} />
                      Inventory Health
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {medicines.map(m => (
                      <div key={m.id} style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: 'var(--bg-card-border)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</span>
                          <span className={`status-pill status-${m.status.toLowerCase().replace(' ', '')}`}>
                            {m.stock} left
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, (m.stock / 500) * 100)}%`,
                            background: m.status === 'Critical' ? 'var(--accent-rose)' : m.status === 'Low Stock' ? 'var(--accent-amber)' : 'var(--primary)'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <Package style={{ color: 'var(--primary)' }} />
                    MedhaNet Smart Inventory Management
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Real-time stock monitoring, batch expirations, and automatic reorder thresholds.
                  </p>
                </div>

                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                  <Plus size={16} /> Add Medication
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>SKU Code</th>
                      <th>Medication Name</th>
                      <th>Category</th>
                      <th>Dosage</th>
                      <th>Stock Qty</th>
                      <th>Unit Price</th>
                      <th>Expiry Date</th>
                      <th>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{m.id}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.name}</td>
                        <td>{m.category}</td>
                        <td>{m.dosage}</td>
                        <td style={{ fontWeight: 700 }}>{m.stock} units</td>
                        <td>${m.unitPrice.toFixed(2)}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{m.expiryDate}</td>
                        <td>
                          <span className={`status-pill status-${m.status.toLowerCase().replace(' ', '')}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PRESCRIPTIONS & ORDERS */}
          {activeTab === 'orders' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <FileText style={{ color: 'var(--secondary)' }} />
                    Prescriptions & Patient Orders
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Digital prescription validation, clinical verification, and dispensation logs.
                  </p>
                </div>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Prescription ID</th>
                      <th>Patient Name</th>
                      <th>Prescribing Doctor</th>
                      <th>Medication & Quantity</th>
                      <th>Timestamp</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{o.id}</td>
                        <td style={{ fontWeight: 600 }}>{o.patientName}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{o.doctorName}</td>
                        <td>{o.medication}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.date}</td>
                        <td style={{ fontWeight: 700 }}>${o.amount.toFixed(2)}</td>
                        <td>
                          <span className={`status-pill status-${o.status.toLowerCase().replace(' ', '')}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          {o.status !== 'Dispensed' ? (
                            <button
                              className="btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              onClick={() => handleUpdateOrderStatus(o.id, 'Dispensed')}
                            >
                              Mark Dispensed
                            </button>
                          ) : (
                            <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600 }}>
                              ✓ Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: AI ASSISTANT & SAFETY */}
          {activeTab === 'ai-assistant' && (
            <div className="grid-2col">
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div className="section-title" style={{ marginBottom: '1rem' }}>
                  <Bot style={{ color: 'var(--primary)' }} />
                  MedhaNet AI Drug Interaction Checker
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Instant deep clinical AI cross-reference engine for contraindications, dosages, and drug-drug interaction alerts.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Primary Medication</label>
                    <input
                      type="text"
                      value={drug1}
                      onChange={(e) => setDrug1(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'var(--bg-card-border)',
                        color: 'white',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Secondary Medication</label>
                    <input
                      type="text"
                      value={drug2}
                      onChange={(e) => setDrug2(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'var(--bg-card-border)',
                        color: 'white',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <button className="btn-primary" onClick={handleAnalyzeInteraction} style={{ marginTop: '0.5rem' }}>
                    <Zap size={16} /> Run MedhaNet AI Safety Analysis
                  </button>
                </div>

                {aiAnalysisResult && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-line'
                  }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Analysis Output:</strong>
                    {aiAnalysisResult}
                  </div>
                )}
              </div>

              {/* AI Demand Forecasting */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div className="section-title" style={{ marginBottom: '1rem' }}>
                  <TrendingUp style={{ color: 'var(--accent-emerald)' }} />
                  Predictive Demand Insights
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: 'var(--bg-card-border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Seasonal Antibiotics Spikes</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      MedhaNet AI predicts a +25% increase in Amoxicillin demands over the next 14 days based on regional clinic prescriptions.
                    </p>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: 'var(--bg-card-border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>Automated Supplier Reorder</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Lisinopril stock is critically low. Recommended reorder batch size: 250 units from MedhaSupply Hub.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="section-title" style={{ marginBottom: '1rem' }}>
                <BarChart3 style={{ color: 'var(--primary)' }} />
                Operational & Fulfillment Analytics
              </div>

              <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Dispense Speed</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>4.2 min</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Verification Accuracy</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>99.8%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Inventory Turnover</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>3.8x</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="glass-panel" style={{ width: '480px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Medication to Smart Stock</h3>
            <form onSubmit={handleAddMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ciprofloxacin"
                  value={newMed.name}
                  onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'var(--bg-card-border)', color: 'white', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</label>
                  <input
                    type="text"
                    value={newMed.category}
                    onChange={e => setNewMed({ ...newMed, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'var(--bg-card-border)', color: 'white', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg"
                    value={newMed.dosage}
                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'var(--bg-card-border)', color: 'white', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Initial Stock Qty</label>
                  <input
                    type="number"
                    value={newMed.stock}
                    onChange={e => setNewMed({ ...newMed, stock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'var(--bg-card-border)', color: 'white', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMed.unitPrice}
                    onChange={e => setNewMed({ ...newMed, unitPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'var(--bg-card-border)', color: 'white', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
