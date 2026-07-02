import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../../styles/LoginPage.css';
import '../../styles/Home.css';

/* ── Kalash SVG illustration ──────────────────────────────── */
const KalashSVG = () => (
  <svg viewBox="0 0 280 360" className="lp-kalash" aria-label="Sacred Kumbh Kalash">
    <defs>
      <radialGradient id="lpGold" cx="37%" cy="27%" r="73%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="44%" stopColor="#D4900A" />
        <stop offset="100%" stopColor="#7A4D00" />
      </radialGradient>
      <radialGradient id="lpWater" cx="50%" cy="26%" r="63%">
        <stop offset="0%" stopColor="rgba(130,210,255,0.78)" />
        <stop offset="100%" stopColor="rgba(25,118,210,0.45)" />
      </radialGradient>
      <filter id="lpGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    {/* Ambient halo */}
    <ellipse cx="140" cy="190" rx="108" ry="108" fill="rgba(230,81,0,0.055)" />

    {/* Pot body */}
    <path
      d="M88,110 C65,134 49,170 55,216 C61,262 86,298 140,308 C194,298 219,262 225,216 C231,170 215,134 192,110 Z"
      fill="url(#lpGold)" stroke="rgba(160,100,0,0.3)" strokeWidth="1.5" />

    {/* Decorative bands */}
    <path d="M75,170 Q140,156 205,170" fill="none" stroke="rgba(255,220,80,0.52)" strokeWidth="2.5" />
    <path d="M65,204 Q140,190 215,204" fill="none" stroke="rgba(255,220,80,0.38)" strokeWidth="2" />
    <path d="M68,240 Q140,228 212,240" fill="none" stroke="rgba(255,220,80,0.26)" strokeWidth="1.5" />

    {/* Neck */}
    <rect x="109" y="87" width="62" height="28" rx="8"
      fill="#C8870A" stroke="rgba(160,100,0,0.3)" strokeWidth="1" />
    {/* Mouth */}
    <ellipse cx="140" cy="87" rx="37" ry="11"
      fill="#DFA000" stroke="rgba(220,155,0,0.5)" strokeWidth="1.5" />
    {/* Water */}
    <ellipse cx="140" cy="91" rx="32" ry="9" fill="url(#lpWater)" />

    {/* Mango leaves */}
    {[-27, -9, 9, 27].map((a, i) => (
      <g key={i} transform={`translate(140,82) rotate(${a})`}>
        <path d="M0,-4 C-10,-26 -7,-52 0,-64 C7,-52 10,-26 0,-4Z"
          fill={i % 2 === 0 ? '#2E7D32' : '#43A047'} opacity="0.9" />
      </g>
    ))}

    {/* Coconut */}
    <ellipse cx="140" cy="55" rx="19" ry="16" fill="#8B6914" />
    <ellipse cx="140" cy="52" rx="13" ry="11" fill="#A67C22" />

    {/* Base */}
    <ellipse cx="140" cy="306" rx="54" ry="14" fill="#8B5E00" />
    <rect x="100" y="305" width="80" height="14" rx="5" fill="#7A5000" />
    <ellipse cx="140" cy="319" rx="42" ry="8" fill="#6A4200" />

    {/* Om */}
    <text x="140" y="248" textAnchor="middle" fontSize="38"
      fontFamily="serif" fill="rgba(255,232,100,0.58)"
      filter="url(#lpGlow)">ॐ</text>

    {/* Shine */}
    <path d="M97,135 C101,122 114,117 120,130"
      fill="none" stroke="rgba(255,255,210,0.6)"
      strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ── Sacred geometry ───────────────────────────────────────── */
const SacredRing = () => (
  <svg className="lp-geo" viewBox="0 0 500 500" aria-hidden="true">
    <g transform="translate(250,250)">
      {Array.from({ length: 16 }).map((_, i) => (
        <ellipse key={i} cx="0" cy="0" rx="205" ry="68"
          fill="none" stroke="rgba(230,81,0,0.065)" strokeWidth="1"
          transform={`rotate(${i * 11.25})`} />
      ))}
      <circle r="215" fill="none" stroke="rgba(255,179,0,0.1)" strokeWidth="1" />
      <circle r="168" fill="none" stroke="rgba(255,179,0,0.07)" strokeWidth="1" />
      <circle r="110" fill="none" stroke="rgba(255,179,0,0.05)" strokeWidth="1" />
    </g>
  </svg>
);

const AuthLayout = ({ children, isRegisterPage = false, isForgotPasswordPage = false }) => {
  const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState(null);
  const langRef = useRef(null);

  const { t } = useTranslation();

  const handleLangChange = (l) => {
    setLang(l);
    localStorage.setItem('preferredLang', l);
    setLangMenuOpen(false);
    window.dispatchEvent(new Event('langchange'));
  };

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`lp-root ${isRegisterPage ? 'rp-root' : ''} ${mounted ? 'lp-on' : ''}`}>

      {/* ── BACKGROUND ─────────────────────────────── */}
      <div className="lp-bg" aria-hidden="true">
        <div className="lp-bg-grad" />
        <div className="lp-bg-dots" />
        <SacredRing />
        {/* Floating ember particles */}
        <div className="lp-embers">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="lp-ember" style={{
              left: `${5 + i * 9.5}%`,
              animationDelay: `${i * 0.82}s`,
              animationDuration: `${3.4 + (i % 4) * 0.75}s`,
            }} />
          ))}
        </div>
        {/* River wave */}
        <svg className="lp-wave" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path d="M0,45 C360,82 720,8 1080,48 C1260,70 1380,26 1440,45 L1440,90 L0,90 Z"
            fill="rgba(230,81,0,0.1)" />
          <path d="M0,62 C280,28 560,78 840,46 C1120,14 1320,55 1440,62 L1440,90 L0,90 Z"
            fill="rgba(255,179,0,0.06)" />
        </svg>
      </div>

      {/* ── NAVBAR ──────── */}
      <nav className="lp-nav" role="navigation" aria-label="Authentication navigation">
        <div className="lp-nav-inner">
          {isForgotPasswordPage ? (
              <Link to="/login" className="lp-back" aria-label="Back to Login">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Login
              </Link>
          ) : (
              <Link to="/" className="lp-back" aria-label="Back to Home">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Home
              </Link>
          )}

          <Link to="/" className="lp-nav-brand">
            {t('brand')}
          </Link>

          <div className="lp-nav-right">
            <div className={`lang-select-container ${langMenuOpen ? 'active' : ''}`} ref={langRef} onClick={() => setLangMenuOpen(!langMenuOpen)}>
              <span className="lang-globe-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </span>
              <div className="lang-current-selection">
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'संस्कृत'}
              </div>
              <span className="lang-select-icon">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              {langMenuOpen && (
                <div className="lang-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                  <div className={`lang-option ${lang === 'en' ? 'selected' : ''}`} onClick={() => handleLangChange('en')}>English</div>
                  <div className={`lang-option ${lang === 'hi' ? 'selected' : ''}`} onClick={() => handleLangChange('hi')}>हिन्दी</div>
                  <div className={`lang-option ${lang === 'mr' ? 'selected' : ''}`} onClick={() => handleLangChange('mr')}>मराठी</div>
                  <div className={`lang-option ${lang === 'sa' ? 'selected' : ''}`} onClick={() => handleLangChange('sa')}>संस्कृत</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN GRID ───────────────────────────────── */}
      <main className="lp-grid" role="main" style={isRegisterPage ? { minHeight: 'calc(100vh - 60px)', flex: 'none', height: 'auto', padding: '20px 0' } : {}}>

        {/* ════ LEFT PANEL ════ */}
        <section className="lp-left" aria-label="Brand panel" style={isRegisterPage ? { alignSelf: 'center' } : {}}>

          {/* Brand pill */}
          <div className="lp-pill">
            <span className="lp-pill-om" aria-hidden="true">ॐ</span>
            <span className="lp-pill-text">{t('brand')}</span>
          </div>

          {/* Kalash */}
          <div className="lp-kalash-wrap">
            <KalashSVG />
            <div className="lp-kalash-shadow" aria-hidden="true" />
          </div>

          {/* Taglines */}
          <div className="lp-taglines">
            <p className="lp-tl-hi">{t('taglineHi')}</p>
            <p className="lp-tl-en">{t('taglineEn')}</p>
            <div className="lp-dots" aria-hidden="true">
              <span /><span /><span />
            </div>
          </div>

          {/* Info chips */}
          <div className="lp-chips">
            {[t('fact1'), t('fact2'), t('fact3')].map((f, i) => (
              <div className="lp-chip" key={i}
                style={{ animationDelay: `${i * 0.15}s` }}>{f}</div>
            ))}
          </div>
        </section>

        {/* ════ RIGHT PANEL ════ */}
        <section className="lp-right" aria-label="Authentication form" style={isRegisterPage ? { alignSelf: 'center', justifyContent: 'flex-start' } : {}}>
          {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                  return React.cloneElement(child, { t, setActivePolicyModal });
              }
              return child;
          })}
        </section>
      </main>

      {/* Policy Modals */}
      {activePolicyModal && (
        <div className="gallery-modal-overlay" onClick={() => setActivePolicyModal(null)} style={{ zIndex: 3000 }}>
          <div className="theme-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="theme-modal-close" onClick={() => setActivePolicyModal(null)} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="theme-modal-header">
              <h2>
                {activePolicyModal === 'terms' ? t('usageTerms') : activePolicyModal === 'privacy' ? t('dataPrivacy') : t('accessibilityStandards')}
              </h2>
              <div className="ornament"></div>
            </div>
            <div className="theme-modal-body">
              {activePolicyModal === 'terms' && (
                <>
                  <div className="policy-text">
                    By using this spiritual platform, you agree to our standard terms of service. You must be responsible for complying with any applicable local laws.
                  </div>
                  <div className="policy-text">
                    Our platform handles bookings on a best-effort basis and acts as a facilitator for various services related to the Maha Kumbh Mela.
                  </div>
                  <div className="policy-text">
                    Please note that all ticket purchases, pooja bookings, and accommodation reservations are subject to the respective service providers' unique terms.
                  </div>
                </>
              )}
              {activePolicyModal === 'privacy' && (
                <>
                  <div className="policy-text">
                    We take your sacred privacy seriously. We only collect essential information required to provide you with our services and update you on the Kumbh Mela.
                  </div>
                  <div className="policy-text">
                    Your personal data is securely stored using advanced encryption and never shared with third parties for marketing purposes without your explicit prior consent.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FOOTER  */}
      <footer className="footer" style={isRegisterPage ? { marginTop: 'auto' } : {}}>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Maha Kumbh Mela Nashik. Developed and maintained by <a href="https://settribe.com/dev-settribe-website/index_main.php" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}> SETTribe.</a></p>
        </div>
      </footer>

    </div>
  );
};

export default AuthLayout;
