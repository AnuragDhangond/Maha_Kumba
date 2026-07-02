import React from 'react';
import { Star, MapPin, User, ChevronRight } from 'lucide-react';
import T from '../DynamicText';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosConfig';
import PoojaPreviewChip from './PoojaPreviewChip';

const AcharyaCard = ({ acharya, onViewDetails, panditPlaceholder }) => {
    const { t } = useTranslation();

    const acharyaImage = acharya.imagePath 
        ? (acharya.imagePath.startsWith('http') ? acharya.imagePath : `${axiosInstance.defaults.baseURL}${acharya.imagePath.startsWith('/') ? '' : '/'}${acharya.imagePath}`) 
        : panditPlaceholder;

    const poojaPreviews = (acharya.poojas || []).slice(0, 3);
    const remainingPoojas = (acharya.poojas || []).length - 3;

    return (
        <div className="mk-acharya-card">
            {/* Left Section: Profile Summary */}
            <div className="mk-profile-summary">
                <div className="mk-avatar-container">
                    <img 
                        src={acharyaImage} 
                        alt={acharya.name} 
                        className="mk-avatar"
                        onError={(e) => { e.target.src = panditPlaceholder; }}
                    />
                    <div className="mk-rating-tag">
                        <Star size={10} fill="#2c1a0e" />
                        <span>{acharya.rating || '5.0'}</span>
                    </div>
                </div>
                <div className="mk-info-content">
                    <span className="mk-specialty"><T>{acharya.specialty}</T></span>
                    <h3 className="mk-name"><T>{acharya.name}</T></h3>
                    <div className="mk-meta-row">
                        <div className="mk-meta-item">
                            <User size={12} />
                            <span><T>{acharya.experience}</T> {t('yearsExp')}</span>
                        </div>
                        <div className="mk-meta-item">
                            <MapPin size={12} />
                            <span><T>{acharya.location || 'Nashik'}</T></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Section: Pooja Previews */}
            <div className="mk-pooja-previews">
                {poojaPreviews.length > 0 ? (
                    <>
                        {poojaPreviews.map((pooja) => (
                            <PoojaPreviewChip key={pooja.id} pooja={pooja} />
                        ))}
                        {remainingPoojas > 0 && (
                            <span className="mk-more-rituals" onClick={() => onViewDetails(acharya)}>
                                +{remainingPoojas} {t('more', 'more')}
                            </span>
                        )}
                    </>
                ) : (
                    <span className="mk-text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                        {t('noRitualsListed', 'Availability on request')}
                    </span>
                )}
            </div>

            {/* Right Section: Action */}
            <div className="mk-action-section">
                <button className="mk-btn-details" onClick={() => onViewDetails(acharya)}>
                    {t('viewDetails')}
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default AcharyaCard;
