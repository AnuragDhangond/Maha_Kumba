import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import trishulLogo from '../assets/trishul_logo-320w.png';
import kalashIcon from '../assets/image copy.png';
import '../styles/Home.css'; // Header and Footer styles are here
import OptimizedImage from './OptimizedImage';
import WeatherHeaderWidget from './WeatherHeaderWidget';
import LocationSharingBanner from './LocationSharingBanner';
import { useAdminSettings } from '../contexts/AdminSettingsContext';

const AuthenticatedLayout = ({ children }) => {
    const { settings } = useAdminSettings();
    const { user, logout, isAuthenticated, checkAuth } = useAuth();


    // Robust name extraction
    const userName = user?.name || user?.username || user?.email?.split('@')[0] || "Pilgrim";

    const { pathname: path } = useLocation();

    useEffect(() => {
        // Fetch user data if authenticated (source of truth is the session cookie)
        if (!user && isAuthenticated) {
            checkAuth();
        }
    }, [user, isAuthenticated, checkAuth]);
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
    const [activePolicyModal, setActivePolicyModal] = useState(null);
    const profileRef = useRef(null);
    const langRef = useRef(null);

    const { t, i18n } = useTranslation();

    const navigate = useNavigate();

    const changeLanguage = (l) => {
        i18n.changeLanguage(l);
        setLang(l);
        localStorage.setItem('preferredLang', l);
        setLangMenuOpen(false);
        // Dispatch event so children can react if needed
        window.dispatchEvent(new Event('langchange'));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (langRef.current && !langRef.current.contains(event.target)) {
                setLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const handleLangChange = () => {
            setLang(localStorage.getItem('preferredLang') || 'en');
        };
        window.addEventListener('langchange', handleLangChange);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('langchange', handleLangChange);
        };
    }, []);

    // Listen for external lang changes (e.g. from children)
    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem('preferredLang') || 'en');
        };
        window.addEventListener('langchange', handleLangChange);
        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);


    return (
        <div className="home-container mounted">
            {/* ══ FIXED HEADER ══ */}
            <header className="home-header">
                <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="home-brand">
                    <img src={kalashIcon} alt="Kalash" className="home-logo-img" />
                </a>

                <div className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {isMenuOpen && (
                    <div
                        className="sidebar-backdrop"
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {settings?.maintenanceMode && (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <div className="maintenance-pill" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#d32f2f', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ⚠️ MAINTENANCE MODE
                        </div>
                    </div>
                )}

                <nav className={`home-nav ${isMenuOpen ? 'active' : ''}`}>
                    {/* Persistent Close Button for Mobile */}
                    <button
                        className="sidebar-close-btn-persistent"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close Menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <ul>
                        <li>
                            <a
                                href="#home"
                                onClick={(e) => { e.preventDefault(); navigate('/home'); setIsMenuOpen(false); }}
                                className={path === '/home' ? 'active' : ''}
                            >
                                {t('home')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#travel"
                                onClick={(e) => { e.preventDefault(); navigate('/travel'); setIsMenuOpen(false); }}
                                className={path === '/travel' ? 'active' : ''}
                            >
                                {t('travel')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#pooja"
                                onClick={(e) => { e.preventDefault(); navigate('/virtual-pooja'); setIsMenuOpen(false); }}
                                className={path === '/virtual-pooja' ? 'active' : ''}
                            >
                                {t('virtualPooja') || "Virtual Pooja"}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#health"
                                onClick={(e) => { e.preventDefault(); navigate('/health'); setIsMenuOpen(false); }}
                                className={path === '/health' ? 'active' : ''}
                            >
                                {t('healthSafety')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#culture"
                                onClick={(e) => { e.preventDefault(); navigate('/heritage'); setIsMenuOpen(false); }}
                                className={path === '/heritage' ? 'active' : ''}
                            >
                                {t('heritage')}
                            </a>
                        </li>
                        {/* <li><a href="#shop" onClick={() => setIsMenuOpen(false)}>{t('shop')}</a></li> */}

                        {/* added shop routing here */}
                        <li>
                            <a
                                href="#shop"
                                onClick={(e) => { e.preventDefault(); navigate('/shop'); setIsMenuOpen(false); }}
                                className={path === '/shop' ? 'active' : ''}
                            >
                                {t('shop')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#donate"
                                onClick={(e) => { e.preventDefault(); navigate('/donate'); setIsMenuOpen(false); }}
                                className={path === '/donate' ? 'active' : ''}
                            >
                                {t('donate')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#sustainability"
                                onClick={(e) => { e.preventDefault(); navigate('/sustainability'); setIsMenuOpen(false); }}
                                className={path === '/sustainability' ? 'active' : ''}
                            >
                                {t('greenKumbh')}
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="header-actions">
                    <WeatherHeaderWidget />
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
                                <div className={`lang-option ${lang === 'en' ? 'selected' : ''}`} onClick={() => changeLanguage('en')}>English</div>
                                <div className={`lang-option ${lang === 'hi' ? 'selected' : ''}`} onClick={() => changeLanguage('hi')}>हिन्दी</div>
                                <div className={`lang-option ${lang === 'mr' ? 'selected' : ''}`} onClick={() => changeLanguage('mr')}>मराठी</div>
                                <div className={`lang-option ${lang === 'sa' ? 'selected' : ''}`} onClick={() => changeLanguage('sa')}>संस्कृत</div>
                            </div>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div className="user-profile-wrapper desktop-only-profile" ref={profileRef} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button className="user-profile-trigger" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4a2a18&color=fff&bold=true&rounded=true`}
                                    alt="User"
                                    className="user-avatar-img"
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </button>
                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-info">
                                        <span className="user-name">{userName}</span>
                                        <span className="user-role">{user?.role || t('premiumPilgrim')}</span>
                                    </div>
                                    <button 
                                        onClick={() => { navigate('/my-products'); setIsProfileOpen(false); }} 
                                        className="profile-action"
                                        style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'transparent', border: 'none', color: '#4a2a18', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        My Products
                                    </button>
                                    <button onClick={() => { logout(); navigate('/home'); }} className="logout-action">{t('signOut')}</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="desktop-login-btn"
                            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-icon-svg">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="login-label">{t('login') || 'Login'}</span>
                        </a>
                    )}
                </div>
            </header>

            {children}

            {/* ══ MATCHING THEME FOOTER ══ */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>{t('brand')}</h3>
                        <p>{t('joinDesc')}</p>
                    </div>
                    <div className="footer-column">
                        <h4>{t('exploreLinks') || "Explore"}</h4>
                        <ul>
                            <li>
                                <a
                                    href="#travel-guide"
                                    onClick={(e) => { e.preventDefault(); setIsTravelModalOpen(true); }}
                                    className={path === '/travel' ? 'active' : ''}
                                >
                                    {t('travelGuide') || "Travel Guide"}
                                </a>
                            </li>
                            <li><a href="/travel" onClick={(e) => { e.preventDefault(); navigate('/travel'); }}>{t('verifiedStaysFooter') || "Verified Stays"}</a></li>
                            <li><a href="/virtual-pooja" onClick={(e) => { e.preventDefault(); navigate('/virtual-pooja'); }}>{t('shahiSnanStatus') || "Shahi Snan Status"}</a></li>
                            <li>
                                <a href="#gallery" onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/');
                                    // Use multiple timeouts to catch the render frame and scroll instantly
                                    setTimeout(() => {
                                        const gallerySection = document.getElementById('glimpses');
                                        if (gallerySection) gallerySection.scrollIntoView({ behavior: 'auto' });
                                    }, 100);
                                    setTimeout(() => {
                                        const gallerySection = document.getElementById('glimpses');
                                        if (gallerySection) gallerySection.scrollIntoView({ behavior: 'auto' });
                                    }, 400);
                                }}>
                                    {t('vedicGallery') || "Vedic Gallery"}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>{t('melaInfo') || "Mela Info"}</h4>
                        <ul>
                            <li><a href="/health" onClick={(e) => { e.preventDefault(); navigate('/health'); }}>{t('healthClinics') || "Health Clinics"}</a></li>
                            <li><a href="/heritage" onClick={(e) => { e.preventDefault(); navigate('/heritage'); }}>{t('historicalNashik') || "Historical Nashik"}</a></li>
                            <li><a href="/sustainability" onClick={(e) => { e.preventDefault(); navigate('/sustainability'); }}>{t('holyGodavariCleanup') || "Holy Godavari Cleanup"}</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>{t('legalPolicies') || "Policies"}</h4>
                        <ul>
                            <li><a href="#terms" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }}>{t('usageTerms') || "Usage Terms"}</a></li>
                            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }}>{t('dataPrivacy') || "Data Privacy"}</a></li>
                            <li><a href="#accessibility" onClick={(e) => { e.preventDefault(); setActivePolicyModal('accessibility'); }}>{t('accessibilityStandards') || "Accessibility Standards"}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Maha Kumbh Mela Nashik. Developed and maintained by <a href="https://settribe.com/dev-settribe-website/index_main.php" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}> SETTribe.</a></p>
                </div>
            </footer>

            {/* Travel Guide Modal */}
            {isTravelModalOpen && (
                <div className="gallery-modal-overlay" onClick={() => setIsTravelModalOpen(false)} style={{ zIndex: 3000 }}>
                    <div className="theme-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button className="theme-modal-close" onClick={() => setIsTravelModalOpen(false)} aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <div className="theme-modal-header">
                            <h2>The Sacred Travel Guide</h2>
                            <div className="ornament"></div>
                        </div>
                        <div className="theme-modal-body">
                            <div className="policy-text">
                                <strong>Important Guidelines:</strong> Follow all marked routes. Maintain decorum at the ghats. Do not litter the sacred river. Carry valid ID at all times.
                            </div>
                            <ul>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        setIsTravelModalOpen(false);
                                        setActivePolicyModal('guide');
                                    }}>
                                        <span className="link-title">Official Kumbh Guidelines</span>
                                        <span className="link-desc">Important rules and instructions</span>
                                    </a>
                                </li>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/sustainability');
                                        setIsTravelModalOpen(false);
                                        setTimeout(() => {
                                            const mapSection = document.getElementById('disposal-map');
                                            if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }, 300);
                                    }}>
                                        <span className="link-title">{t('nashikCityMap')}</span>
                                        <span className="link-desc">{t('nashikCityMapDesc')}</span>
                                    </a>
                                </li>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/travel');
                                        setIsTravelModalOpen(false);
                                    }}>
                                        <span className="link-title">{t('transportRoutes')}</span>
                                        <span className="link-desc">{t('transportRoutesDesc')}</span>
                                    </a>
                                </li>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/heritage');
                                        setIsTravelModalOpen(false);
                                    }}>
                                        <span className="link-title">{t('templeItinerary')}</span>
                                        <span className="link-desc">{t('templeItineraryDesc')}</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

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
                                {activePolicyModal === 'terms' ? t('usageTerms') : activePolicyModal === 'privacy' ? t('dataPrivacy') : activePolicyModal === 'guide' ? t('officialGuidelines') : t('accessibilityStandards')}
                            </h2>
                            <div className="ornament"></div>
                        </div>
                        <div className="theme-modal-body">
                            {activePolicyModal === 'guide' && (
                                <>
                                    <div className="policy-text">
                                        {t('policy_guide_1')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_guide_2')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_guide_3')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_guide_4')}
                                    </div>
                                </>
                            )}
                            {activePolicyModal === 'terms' && (
                                <>
                                    <div className="policy-text">
                                        {t('policy_terms_1')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_terms_2')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_terms_3')}
                                    </div>
                                </>
                            )}
                            {activePolicyModal === 'privacy' && (
                                <>
                                    <div className="policy-text">
                                        {t('policy_privacy_1')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_privacy_2')}
                                    </div>
                                </>
                            )}
                            {activePolicyModal === 'accessibility' && (
                                <>
                                    <div className="policy-text">
                                        {t('policy_accessibility_1')}
                                    </div>
                                    <div className="policy-text">
                                        {t('policy_accessibility_2')}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ CROWD INTELLIGENCE BANNER ══
                Anonymous GPS sharing for live heatmap — Nashik zone only.
                Renders once per device (consent stored in localStorage).
            */}
            <LocationSharingBanner />

        </div>
    );
};

export default AuthenticatedLayout;
