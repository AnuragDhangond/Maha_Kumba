import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [languages] = useState([
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'mr', label: 'मराठी' },
        { code: 'sa', label: 'संस्कृत' }
    ]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // No longer strictly needed to fetch from backend for instant experience,
        // but we can keep it as a background sync if the backend might provide new languages.
        // For now, we prioritize the local list for "instant" feel.
    }, []);

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('preferredLang', code);
        localStorage.setItem('i18nextLng', code);
        window.dispatchEvent(new Event('langchange'));
        setMenuOpen(false);
    };

    if (loading) return null;

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div 
            className={`lang-select-container ${menuOpen ? 'active' : ''}`} 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
        >
            <span className="lang-globe-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </span>
            <div className="lang-current-selection">
                {currentLang?.label}
            </div>
            <span className="lang-select-icon">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>

            {menuOpen && (
                <div className="lang-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {languages.map((lang) => (
                        <div 
                            key={lang.code}
                            className={`lang-option ${i18n.language === lang.code ? 'selected' : ''}`} 
                            onClick={() => changeLanguage(lang.code)}
                        >
                            {lang.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
