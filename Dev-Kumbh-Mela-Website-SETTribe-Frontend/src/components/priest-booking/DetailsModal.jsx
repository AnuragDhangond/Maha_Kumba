import React from 'react';
import { 
    X, 
    Star, 
    MapPin, 
    User, 
    Clock, 
    CheckCircle2, 
    Info, 
    HandPlatter,
    Languages,
    Briefcase
} from 'lucide-react';
import T from '../DynamicText';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosConfig';

const DetailsModal = ({ acharya, isOpen, onClose, onBookPooja, panditPlaceholder }) => {
    const { t } = useTranslation();

    if (!isOpen || !acharya) return null;

    const acharyaImage = acharya.imagePath 
        ? (acharya.imagePath.startsWith('http') ? acharya.imagePath : `${axiosInstance.defaults.baseURL}${acharya.imagePath.startsWith('/') ? '' : '/'}${acharya.imagePath}`) 
        : panditPlaceholder;

    return (
        <div className="mk-modal-overlay" onClick={onClose}>
            <div className="mk-modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button className="mk-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="mk-modal-header">
                    <img 
                        src={acharyaImage} 
                        alt={acharya.name} 
                        className="mk-modal-avatar"
                        onError={(e) => { e.target.src = panditPlaceholder; }}
                    />
                    <div className="mk-modal-header-info">
                        <span className="mk-specialty">
                            <T>{acharya.specialty}</T>
                        </span>
                        <h2 className="mk-name">
                            <T>{acharya.name}</T>
                        </h2>
                        <div className="mk-meta-row mk-modal-header-meta">
                            <div className="mk-meta-item">
                                <Star size={16} fill="#ffcc00" color="#ffcc00" />
                                <strong>{acharya.rating || '5.0'}</strong> ({acharya.reviews || '0'} reviews)
                            </div>
                            <div className="mk-meta-item">
                                <Briefcase size={16} color="#ff7e36" />
                                <T>{acharya.experience}</T> {t('yearsExp')}
                            </div>
                            <div className="mk-meta-item">
                                <MapPin size={16} color="#ff7e36" />
                                <T>{acharya.location || 'Trimbakeshwar'}</T>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mk-modal-body">
                    <div className="mk-modal-grid">
                        <div className="mk-modal-left">
                            <section className="mk-modal-about-section">
                                <h3 className="mk-modal-section-title">
                                    <User size={20} color="#ff7e36" /> {t('aboutAcharya', 'About Acharya')}
                                </h3>
                                <p className="mk-bio-text">
                                    <T>{acharya.bio || 'Highly experienced Vedic priest specializing in traditional rituals and planetary peace ceremonies. Dedicated to bringing spiritual clarity and divine blessings to your life.'}</T>
                                </p>
                                
                                <div className="mk-meta-row mk-modal-about-meta">
                                    <div className="mk-meta-item">
                                        <Languages size={18} color="#ff7e36" />
                                        <strong>{t('languages', 'Languages')}:</strong> Hindi, Sanskrit, Marathi
                                    </div>
                                    <div className="mk-meta-item">
                                        <CheckCircle2 size={18} color="#10b981" />
                                        <strong>{t('availability', 'Availability')}:</strong> {t('availableToday', 'Available Today')}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="mk-modal-section-title">
                                    <HandPlatter size={20} color="#ff7e36" /> {t('ritualsOffered', 'Sacred Rituals Offered')}
                                </h3>
                                <div className="mk-modal-pooja-list">
                                    {acharya.poojas && acharya.poojas.length > 0 ? (
                                        acharya.poojas.map((pooja) => (
                                            <div key={pooja.id} className="mk-modal-pooja-card">
                                                <div className="mk-modal-pooja-info">
                                                    <h4 className="pooja-title-enterprise">
                                                        <T>{pooja.name}</T>
                                                    </h4>
                                                    <div className="mk-meta-row mk-pooja-card-meta">
                                                        <span className="mk-meta-item">
                                                            <Clock size={14} color="var(--mk-saffron)" />
                                                            <T>{pooja.duration}</T>
                                                        </span>
                                                        <span className="mk-meta-item">
                                                            <Info size={14} color="var(--mk-saffron)" />
                                                            {t('vedicRitual')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mk-modal-pooja-action">
                                                    <span className="pooja-price-enterprise">₹{pooja.price}</span>
                                                    <button 
                                                        className="mk-modal-btn-book"
                                                        onClick={() => onBookPooja(acharya, pooja)}
                                                    >
                                                        {t('bookNow')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="mk-empty-state">
                                            <p>{t('noRitualsAvailable', 'No specific rituals listed yet.')}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="mk-modal-right">
                            <div className="glass-panel-light mk-modal-why-box">
                                <h4 className="mk-modal-why-title">{t('whyChoose', 'Why this Acharya?')}</h4>
                                <ul className="mk-why-list">
                                    <li>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        Certified Vedic Scholar
                                    </li>
                                    <li>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        Expert in planetary dosha removal
                                    </li>
                                    <li>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        Personalized Sankalpa included
                                    </li>
                                    <li>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        High resolution video support
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsModal;
