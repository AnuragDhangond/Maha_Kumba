import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/UnderMaintenance.css';
import kalashIcon from '../assets/image copy.png';
import goldenMandala from '../assets/golden_mandala.png';

const UnderMaintenance = () => {
    const navigate = useNavigate();
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');

    useEffect(() => {
        const handleLangChange = () => setLang(localStorage.getItem('preferredLang') || 'en');
        window.addEventListener('langchange', handleLangChange);
        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);

    const { t } = useTranslation();

    return (
        <div className="maintenance-container">
            {/* Spiritual Background Elements */}
            <div className="maintenance-bg-overlay"></div>
            <div className="sacred-mandala left">
                <img src={goldenMandala} alt="" />
            </div>
            <div className="sacred-mandala right">
                <img src={goldenMandala} alt="" />
            </div>

            <div className="maintenance-card">
                <div className="maintenance-header">
                    <img src={kalashIcon} alt="Kumbh Mela" className="maintenance-logo" />
                    <div className="logo-divider"></div>
                    <h2 className="brand-name">{t('brand')}</h2>
                </div>

                <div className="maintenance-body">
                    <div className="status-indicator">
                        <div className="pulse-circle"></div>
                        <span>{t('divineRenovations')}</span>
                    </div>
                    
                    <h1 className="maintenance-title">{t('underSacredMaintenance')}</h1>
                    
                    <p className="maintenance-text">
                        {t('maintenanceSub')}
                    </p>

                    <div className="spiritual-quote">
                        {t('spiritualQuote')}
                    </div>

                    <div className="expected-time">
                        <div className="time-icon"></div>
                        <div className="time-details">
                            <span>{t('estimatedReturn')}</span>
                            <strong>{t('comingSoon')}</strong>
                        </div>
                    </div>
                </div>

                <div className="maintenance-footer">
                    <button 
                        className="back-home-btn" 
                        onClick={() => navigate('/')}
                        style={{
                            background: '#795d4d',
                            color: 'white',
                            border: 'none',
                            padding: '12px 30px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                    >
                        {t('backHome') || 'Back to Home'}
                    </button>
                    <div className="social-connect">
                        <span>{t('stayConnected')}</span>
                        <div className="social-icons">
                            {/* Simple placeholders for social icons */}
                            
                            
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Particles */}
            <div className="spiritual-particles">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`particle p${i + 1}`}></div>
                ))}
            </div>
        </div>
    );
};

export default UnderMaintenance;
