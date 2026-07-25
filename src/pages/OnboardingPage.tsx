import React, { useState } from 'react';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface Day {
  label: string;
  open: string;
  close: string;
  is24h: boolean;
}

const defaultHours: Day[] = [
  { label: 'Monday', open: '08:00', close: '22:00', is24h: false },
  { label: 'Tuesday', open: '08:00', close: '22:00', is24h: false },
  { label: 'Wednesday', open: '08:00', close: '22:00', is24h: false },
  { label: 'Thursday', open: '08:00', close: '22:00', is24h: false },
  { label: 'Friday', open: '08:00', close: '22:00', is24h: false },
  { label: 'Saturday', open: '09:00', close: '20:00', is24h: false },
  { label: 'Sunday', open: '09:00', close: '18:00', is24h: false },
];

const STEP_LABELS = [
  'Account',
  'Pharmacy Info',
  'Location',
  'Hours',
  'Documents',
  'Review',
];

interface DocUpload {
  key: string;
  label: string;
  uploaded: boolean;
  licenseNo: string;
  issueDate: string;
  expiryDate: string;
}

const defaultDocs: DocUpload[] = [
  { key: 'coc', label: 'Certificate of Competency (CoC)', uploaded: false, licenseNo: '', issueDate: '', expiryDate: '' },
  { key: 'biz', label: 'Business / Pharmacy License', uploaded: false, licenseNo: '', issueDate: '', expiryDate: '' },
  { key: 'pharmacist', label: 'Pharmacist Professional License', uploaded: false, licenseNo: '', issueDate: '', expiryDate: '' },
  { key: 'id', label: 'Pharmacist National ID', uploaded: false, licenseNo: '', issueDate: '', expiryDate: '' },
  { key: 'tin', label: 'TIN Certificate', uploaded: false, licenseNo: '', issueDate: '', expiryDate: '' },
];

interface OnboardingPageProps {
  onOnboardingComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Step 2
  const [pharmacyName, setPharmacyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [tin, setTin] = useState('');
  const [tinVerified, setTinVerified] = useState(false);
  const [tinLoading, setTinLoading] = useState(false);
  const [tinError, setTinError] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [pharmacyType, setPharmacyType] = useState('Retail Pharmacy');

  // Step 3
  const [region, setRegion] = useState('Addis Ababa');
  const [city, setCity] = useState('');
  const [subCity, setSubCity] = useState('');
  const [woreda, setWoreda] = useState('');
  const [street, setStreet] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Step 4
  const [hours, setHours] = useState<Day[]>(defaultHours);

  // Step 5
  const [docs, setDocs] = useState<DocUpload[]>(defaultDocs);

  const handleGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      () => {
        setLat('9.005401');
        setLng('38.763611');
        setGpsLoading(false);
      }
    );
  };

  const toggleHour = (i: number, field: 'open' | 'close', val: string) => {
    setHours((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)));
  };

  const toggle24h = (i: number) => {
    setHours((prev) => prev.map((d, idx) => (idx === i ? { ...d, is24h: !d.is24h } : d)));
  };

  const toggleDocUpload = (key: string) => {
    setDocs((prev) => prev.map((d) => (d.key === key ? { ...d, uploaded: !d.uploaded } : d)));
  };

  const updateDoc = (key: string, field: keyof DocUpload, val: string) => {
    setDocs((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: val } : d)));
  };

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              hourglass_top
            </span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Verification Pending</h2>
          <p className="text-sm text-secondary leading-relaxed">
            Your documents are being reviewed by the <strong>MedhaNet administration team</strong>. You will receive an email confirmation once your pharmacy is approved and visible to patients.
          </p>
          <div className="space-y-3 text-left bg-surface-container-low rounded-2xl p-5">
            {['Account Created ✓', 'Pharmacy Information ✓', 'Location Submitted ✓', 'Operating Hours ✓', 'Documents Uploaded ✓'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-on-surface font-medium">
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={onOnboardingComplete}
            className="w-full bg-primary text-on-primary py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all"
          >
            Go to Login Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant/30 px-8 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">መ</div>
        <div>
          <span className="font-bold text-primary text-lg">MedhaNet AI</span>
          <p className="text-xs text-secondary">Pharmacy Partner Registration</p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-outline-variant/20 px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-outline-variant/30 z-0"></div>
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? 'bg-primary text-on-primary' : isActive ? 'bg-primary text-on-primary ring-4 ring-primary/20' : 'bg-surface-container-high text-secondary'
                  }`}
                >
                  {isDone ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : stepNum}
                </div>
                <span className={`text-[10px] font-semibold hidden md:block ${isActive ? 'text-primary' : isDone ? 'text-primary/70' : 'text-secondary'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-10 space-y-8">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Create Your Pharmacy Account</h2>
                <p className="text-sm text-secondary mt-1">Start your journey with MedhaNet AI as a verified pharmacy partner.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Email Address</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">mail</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" placeholder="pharmacy@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Phone Number</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">phone</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" placeholder="+251 91 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">lock</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={() => setShowPassword(!showPassword)}>
                      <span className="material-symbols-outlined text-secondary text-base">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Confirm Password</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">lock_reset</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span className="text-xs text-secondary leading-relaxed">I agree to MedhaNet AI's <span className="text-primary font-semibold underline">Terms of Service</span> and <span className="text-primary font-semibold underline">Privacy Policy</span> for pharmacy partners.</span>
                </label>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-on-surface font-sans">Tell us about your pharmacy</h2>
                <p className="text-sm text-secondary mt-1">Provide your official pharmacy details and TIN number for Ethiopian revenue authority verification.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Official Pharmacy Name *</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">local_pharmacy</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" placeholder="MedCare Pharmacy" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Business / Trade Name</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">business</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Optional trade name" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Owner or Manager Full Name *</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">person</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Abebe Kebede" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  </div>
                </div>

                {/* TIN Number with Live Lookup Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-on-surface">Tax Identification Number (TIN) *</label>
                    {tinVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        ERCA Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors bg-white">
                      <span className="material-symbols-outlined text-secondary text-base">badge</span>
                      <input
                        className="flex-1 text-sm outline-none bg-transparent font-mono tracking-wider"
                        placeholder="0049281734 (10 digits)"
                        maxLength={10}
                        value={tin}
                        onChange={(e) => {
                          setTin(e.target.value.replace(/\D/g, ''));
                          setTinVerified(false);
                          setTinError('');
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={tin.length < 9 || tinLoading}
                      onClick={() => {
                        setTinLoading(true);
                        setTinError('');
                        setTimeout(() => {
                          setTinLoading(false);
                          if (tin.length >= 9) {
                            setTinVerified(true);
                          } else {
                            setTinError('Invalid TIN length. Ethiopian TIN must be 10 digits.');
                          }
                        }, 800);
                      }}
                      className="px-4 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      {tinLoading ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          Verifying...
                        </>
                      ) : tinVerified ? (
                        <>
                          <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                          Verified
                        </>
                      ) : (
                        'Verify TIN'
                      )}
                    </button>
                  </div>
                  {tinError && <p className="text-xs text-error mt-1.5 font-semibold">{tinError}</p>}
                  {tinVerified && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-emerald-600 text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>domain_verification</span>
                      <div>
                        <p className="font-bold">Match Found on ERCA Database</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Registered Entity: <strong>{pharmacyName || 'Registered Pharmacy Entity'}</strong> · Status: <span className="font-bold text-emerald-800 uppercase">Active</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Business Registration Number *</label>
                  <div className="flex items-center gap-3 border border-outline-variant/50 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-base">article</span>
                    <input className="flex-1 text-sm outline-none bg-transparent" placeholder="REG-2024-ET-0001" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Pharmacy Type</label>
                  <select className="w-full border border-outline-variant/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors bg-white" value={pharmacyType} onChange={(e) => setPharmacyType(e.target.value)}>
                    {['Retail Pharmacy', 'Hospital Pharmacy', 'Specialty Pharmacy', 'Community Pharmacy', 'Compounding Pharmacy'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Pharmacy Location</h2>
                <p className="text-sm text-secondary mt-1">Patients will use this to find your pharmacy and calculate distances.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Region', val: region, set: setRegion, placeholder: 'Addis Ababa' },
                    { label: 'City', val: city, set: setCity, placeholder: 'Addis Ababa' },
                    { label: 'Sub-city', val: subCity, set: setSubCity, placeholder: 'Bole' },
                    { label: 'Woreda', val: woreda, set: setWoreda, placeholder: 'Woreda 03' },
                  ].map(({ label, val, set, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-on-surface mb-1.5">{label}</label>
                      <input className="w-full border border-outline-variant/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder={placeholder} value={val} onChange={(e) => set(e.target.value)} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Street / Landmark</label>
                  <input className="w-full border border-outline-variant/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" placeholder="Near Bole Medhanealem Church" value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">GPS Coordinates</label>
                  <button onClick={handleGPS} disabled={gpsLoading} className="w-full flex items-center justify-center gap-3 bg-primary/10 text-primary border border-primary/30 rounded-xl py-3 font-semibold text-sm hover:bg-primary/20 transition-all">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
                    {gpsLoading ? 'Getting Location...' : '📍 Use My Current Location'}
                  </button>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">Latitude</label>
                      <input className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none bg-surface-container-low" placeholder="9.005401" value={lat} onChange={(e) => setLat(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">Longitude</label>
                      <input className="w-full border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm outline-none bg-surface-container-low" placeholder="38.763611" value={lng} onChange={(e) => setLng(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-outline-variant/30 h-48 bg-surface-container-low flex items-center justify-center">
                  <div className="text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl mb-2 block text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
                    <p className="text-xs font-semibold">Interactive Map</p>
                    <p className="text-[11px]">Google Maps integration will be added here</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Operating Hours</h2>
                <p className="text-sm text-secondary mt-1">Let patients know when your pharmacy is open.</p>
              </div>
              <div className="space-y-3">
                {hours.map((day, i) => (
                  <div key={day.label} className="flex items-center gap-4 py-3 border-b border-outline-variant/20 last:border-none">
                    <span className="text-sm font-semibold text-on-surface w-24">{day.label}</span>
                    {day.is24h ? (
                      <span className="flex-1 text-xs font-bold text-primary bg-primary/10 rounded-xl px-4 py-2.5">Open 24 Hours</span>
                    ) : (
                      <div className="flex-1 flex items-center gap-2">
                        <input type="time" value={day.open} onChange={(e) => toggleHour(i, 'open', e.target.value)} className="border border-outline-variant/40 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary flex-1" />
                        <span className="text-secondary text-xs">–</span>
                        <input type="time" value={day.close} onChange={(e) => toggleHour(i, 'close', e.target.value)} className="border border-outline-variant/40 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary flex-1" />
                      </div>
                    )}
                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input type="checkbox" className="accent-primary" checked={day.is24h} onChange={() => toggle24h(i)} />
                      <span className="text-[11px] text-secondary">24h</span>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Upload Required Documents</h2>
                <p className="text-sm text-secondary mt-1">All documents are required for Ethiopian FDA compliance and admin verification.</p>
              </div>
              <div className="space-y-4">
                {docs.map((doc) => (
                  <div key={doc.key} className={`rounded-2xl border p-5 transition-all ${doc.uploaded ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/30 bg-surface-container-low'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-on-surface">{doc.label}</span>
                      <button
                        onClick={() => toggleDocUpload(doc.key)}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all ${doc.uploaded ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary border border-outline-variant/40 hover:border-primary/40'}`}
                      >
                        {doc.uploaded ? '✓ Uploaded' : '+ Upload'}
                      </button>
                    </div>
                    {doc.uploaded && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-secondary mb-1">License / Doc Number</label>
                          <input className="w-full border border-outline-variant/40 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary" placeholder="LIC-12345" value={doc.licenseNo} onChange={(e) => updateDoc(doc.key, 'licenseNo', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-secondary mb-1">Issue Date</label>
                          <input type="date" className="w-full border border-outline-variant/40 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary" value={doc.issueDate} onChange={(e) => updateDoc(doc.key, 'issueDate', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-secondary mb-1">Expiry Date</label>
                          <input type="date" className="w-full border border-outline-variant/40 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary" value={doc.expiryDate} onChange={(e) => updateDoc(doc.key, 'expiryDate', e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Review & Submit</h2>
                <p className="text-sm text-secondary mt-1">Please review your information before submitting to MedhaNet administration.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Account Details', icon: 'manage_accounts', value: email || 'Not entered', check: !!email },
                  { label: 'Pharmacy Information', icon: 'local_pharmacy', value: pharmacyName || 'Not entered', check: !!pharmacyName },
                  { label: 'Location', icon: 'location_on', value: `${subCity || '—'}, ${city || '—'}`, check: !!city },
                  { label: 'Operating Hours', icon: 'schedule', value: 'Monday – Sunday configured', check: true },
                  { label: 'Verification Documents', icon: 'folder_open', value: `${docs.filter((d) => d.uploaded).length} of ${docs.length} uploaded`, check: docs.filter((d) => d.uploaded).length === docs.length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                    <span className={`material-symbols-outlined text-xl ${item.check ? 'text-primary' : 'text-error'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.check ? 'check_circle' : 'cancel'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">{item.label}</p>
                      <p className="text-xs text-secondary">{item.value}</p>
                    </div>
                    <button onClick={() => setStep((STEP_LABELS.indexOf(item.label.replace(' Details', '').replace(' Information', ' Info')) + 1) as OnboardingStep)} className="text-xs text-primary font-semibold hover:underline">
                      Edit
                    </button>
                  </div>
                ))}
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p>By submitting, your pharmacy will be placed in a <strong>pending review</strong> state. You will not be visible to patients until MedhaNet admins approve your documents (typically 1–3 business days).</p>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
            <button
              onClick={() => step > 1 && setStep((step - 1) as OnboardingStep)}
              className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${step === 1 ? 'invisible' : 'border border-outline-variant/40 text-secondary hover:bg-surface-container-low'}`}
            >
              ← Back
            </button>
            {step < 6 ? (
              <button
                onClick={() => setStep((step + 1) as OnboardingStep)}
                className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                Submit for Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
