import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: (phone: string, password: string) => Promise<void>;
  onRegisterClick?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onRegisterClick }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowToast(true);
    setError(null);

    try {
      await onLoginSuccess(phone, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
      setShowToast(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 ethiopian-pattern pointer-events-none -z-10"></div>

      {/* TopAppBar */}
      <header className="bg-surface w-full h-16 flex justify-center items-center px-margin-mobile md:px-margin-desktop z-50 sticky top-0 border-b border-outline-variant/30">
        <div className="max-w-container-max w-full flex items-center justify-between">
          <div className="flex items-center gap-3 transition-transform active:scale-95 cursor-pointer">
            <img
              alt="MedhaNet AI Logo"
              className="h-10 w-10 object-contain"
              src="https://lh3.googleusercontent.com/aida/AP1WRLs1RZjW4wb9BO41QMtPQ4_hoiBle3rnacYQbTICBdapiOZ6oPzLoq-AxJ481GFCL8_ijnEusYaQ0OdSZFRu1kMuSAchTkEJLeY3NgGmGUrOqbotH2bHsoj3_UDYxiFn7gPxIduo4J2rLaN2hhkVLi0tCR9bhP0nB-kmr4ZMPMtRklN26rsKsZ_huG7bZgHkPoZuFnRWNbK3aJrTnTt99P2rLk6wX8n1C3O_j1-ccC7XaF6898cvCH10ec8"
            />
            <span className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight">
              MedhaNet AI
            </span>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-on-surface-variant font-label-md">Clinical Standards</span>
            <span className="text-on-surface-variant font-label-md">Secure Portal</span>
            <span className="material-symbols-outlined text-primary">lock</span>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop relative">
        {/* Decorative geometric accents */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-tertiary/5 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-[480px]">
          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(22,163,74,0.05)] border border-outline-variant/20 overflow-hidden relative">
            {/* Tilet accent strip */}
            <div className="h-1 w-full tilet-border opacity-100"></div>

            <div className="p-8 md:p-10">
              <div className="mb-10 text-center md:text-left">
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
                  Partner Portal
                </h1>
                <p className="text-on-surface-variant font-body-md leading-relaxed">
                  Login to manage your pharmacy's reservations and stock.
                </p>
              </div>

              <form className="space-y-6" id="loginForm" onSubmit={handleSubmit}>
                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block font-label-md text-on-surface-variant" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">
                        call
                      </span>
                    </div>
                    <input
                      className="w-full pl-11 pr-4 h-[48px] bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body-md rounded-t-lg outline-none text-on-surface"
                      id="phone"
                      name="phone"
                      placeholder="0912345678"
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block font-label-md text-on-surface-variant" htmlFor="password">
                      Password
                    </label>
                    <a
                      className="text-primary font-label-md hover:underline decoration-2 underline-offset-4"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password recovery link has been sent to your email.');
                      }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">
                        lock
                      </span>
                    </div>
                    <input
                      className="w-full pl-11 pr-12 h-[48px] bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 transition-all font-body-md rounded-t-lg outline-none text-on-surface"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      <span className="material-symbols-outlined" id="passwordIcon">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-error-container text-on-error-container rounded-lg px-4 py-3 font-label-md">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Button */}
                <button
                  className="w-full h-[48px] bg-primary text-on-primary font-title-md rounded-lg shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                  ) : (
                    <>
                      <span>Login</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Portal Footer */}
          <div className="mt-8 text-center">
            <p className="text-on-surface-variant font-body-md">
              Interested in partnering with us?
              <a
                className="text-primary font-semibold hover:underline decoration-1 underline-offset-4 ml-1"
                href="mailto:support@medhanet.ai"
              >
                Contact MedhaNet Support.
              </a>
            </p>
            <div className="mt-6 flex justify-center gap-4 text-outline font-label-sm items-center">
              <span>Privacy Policy</span>
              <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
              <span>Terms of Service</span>
              <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
              <span>HIPAA Compliant</span>
            </div>
            {onRegisterClick && (
              <div className="mt-5 text-center">
                <span className="text-xs text-secondary">New to MedhaNet? </span>
                <button onClick={onRegisterClick} className="text-xs font-bold text-primary hover:underline">
                  Register your pharmacy →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>


      {/* Success Feedback Toast */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-on-background text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 pointer-events-none z-[100] ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        id="successToast"
      >
        <span
          className="material-symbols-outlined text-primary-fixed"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <span className="font-label-md">Authenticating secure connection...</span>
      </div>
    </div>
  );
};
