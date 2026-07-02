import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, 
    MapPin, 
    User, 
    HandPlatter, 
    Info, 
    CheckCircle2, 
    X, 
    PlayCircle, 
    Radio,
    AlertCircle,
} from 'lucide-react';
import HeadingOrnament from './HeadingOrnament';

// Styles
import '../styles/VirtualPooja.css';
import '../styles/VirtualPoojaEnterprise.css';
import '../styles/VirtualPoojaMarketplace.css';

// Components
import AcharyaCard from './priest-booking/AcharyaCard';
import DetailsModal from './priest-booking/DetailsModal';
import ValidationError from './ValidationError';
import T from './DynamicText';

// Services
import { liveDarshanService } from '../api/services/liveDarshanService';
import { poojaScheduleService } from '../api/services/poojaScheduleService';
import { acharyaService } from '../api/services/acharyaService';
import { poojaBookingService } from '../api/services/poojaBookingService';
import axiosInstance from '../api/axiosConfig';
import useAuthStore from '../store/authStore';
import useValidation from '../hooks/useValidation';
import { 
    validateRequired, 
    validateTextLength, 
    validateNumber, 
    validateDate, 
    validateIndianMobile,
    validateName
} from '../utils/validationUtils';

// Placeholder Images
import heroBg from '../assets/hero-background-new.jpg';
import pandit1 from '../assets/gallery1.jpg';

const timeSlots = [
    "06:00 AM", "08:00 AM", "10:30 AM", "01:00 PM", "04:00 PM", "06:30 PM", "08:00 PM"
];

const VirtualPooja = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, user: authUser } = useAuthStore();
    
    // UI State
    const [viewingAcharya, setViewingAcharya] = useState(null);
    const [selectedPoojaInfo, setSelectedPoojaInfo] = useState(null);
    const [selectedDayInfo, setSelectedDayInfo] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    
    // Data State
    const [liveStreams, setLiveStreams] = useState([]);
    const [dynamicPoojaSchedule, setDynamicPoojaSchedule] = useState([]);
    const [dynamicAcharyas, setDynamicAcharyas] = useState([]);
    
    // Booking State
    const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const bookingValidationSchema = {
        devoteeName: [(v) => validateRequired(v), (v) => validateName(v, 'Devotee Name')],
        gotra: [(v) => validateTextLength(v, 0, 50, 'Gotra')],
        sankalpa: [(v) => validateRequired(v, 'Purpose'), (v) => validateTextLength(v, 5, 500, 'Purpose')],
        familyCount: [(v) => validateNumber(v, { min: 1, max: 25, fieldName: 'Family Members' })],
        location: [(v) => validateTextLength(v, 0, 100, 'Location')],
        preferredDate: [(v) => validateRequired(v), (v) => validateDate(v, { preventPast: true })],
        preferredSlot: [(v) => validateRequired(v)],
        mobileNumber: [(v) => validateIndianMobile(v)]
    };

    const { 
        values: bookingData, 
        errors: bookingErrors, 
        handleChange: handleBookingChange, 
        validateForm: validateBookingForm, 
        resetForm: resetBookingForm,
        setValues: setBookingValues
    } = useValidation({
        devoteeName: '',
        gotra: '',
        sankalpa: '',
        familyCount: 1,
        location: '',
        preferredDate: '',
        preferredSlot: '',
        mobileNumber: ''
    }, bookingValidationSchema);

    // Effect: Prefill user data
    useEffect(() => {
        if (authUser) {
            setBookingValues(prev => ({
                ...prev,
                devoteeName: authUser.fullName || authUser.name || '',
                mobileNumber: authUser.phoneNumber || ''
            }));
        }
    }, [authUser, setBookingValues]);

    // Effect: Fetch Page Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [liveRes, scheduleRes, acharyaRes] = await Promise.all([
                    liveDarshanService.getAllLiveDarshans(),
                    poojaScheduleService.getAllSchedules(),
                    acharyaService.getAllAcharyas()
                ]);
                
                setLiveStreams(liveRes.data?.content || (Array.isArray(liveRes.data) ? liveRes.data : []));
                setDynamicPoojaSchedule(scheduleRes.data?.content || (Array.isArray(scheduleRes.data) ? scheduleRes.data : []));
                setDynamicAcharyas(acharyaRes.data?.content || (Array.isArray(acharyaRes.data) ? acharyaRes.data : []));
            } catch (error) {
                console.error("Error fetching Virtual Pooja data:", error);
            }
        };
        fetchData();
    }, []);

    // Effect: Fetch Booked Slots
    useEffect(() => {
        const fetchSlots = async () => {
            if (selectedPoojaInfo?.pandit?.id && bookingData.preferredDate) {
                setIsLoadingSlots(true);
                try {
                    const response = await poojaBookingService.getBookedSlots(
                        selectedPoojaInfo.pandit.id, 
                        bookingData.preferredDate
                    );
                    setBookedSlots(response.data || []);
                } catch (error) {
                    console.error("Error fetching booked slots:", error);
                    setBookedSlots([]);
                } finally {
                    setIsLoadingSlots(false);
                }
            } else {
                setBookedSlots([]);
            }
        };
        fetchSlots();
    }, [selectedPoojaInfo?.pandit?.id, bookingData.preferredDate]);

    // Validation helper
    const isSlotInPast = (slotTimeStr) => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (bookingData.preferredDate !== todayStr) return false;

        const [time, modifier] = slotTimeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const slotMinutes = hours * 60 + minutes;
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        return slotMinutes <= currentMinutes;
    };

    const handleOpenDetails = (acharya) => {
        setViewingAcharya(acharya);
    };

    const handleStartBooking = (pandit, pooja) => {
        setSelectedPoojaInfo({ pandit, pooja });
        setViewingAcharya(null); // Close details modal to show booking form
    };

    const submitPoojaBooking = async () => {
        if (!selectedPoojaInfo || !validateBookingForm()) return;

        setIsBookingSubmitting(true);
        try {
            const { pandit, pooja } = selectedPoojaInfo;
            await poojaBookingService.createBooking({
                acharyaId: pandit.id,
                poojaId: pooja.id,
                acharyaName: pandit.name,
                poojaName: pooja.name,
                poojaDuration: pooja.duration,
                price: Number(pooja.price) || 0,
                devoteeName: bookingData.devoteeName,
                gotra: bookingData.gotra,
                sankalpa: bookingData.sankalpa,
                familyCount: Number(bookingData.familyCount) || 1,
                location: bookingData.location,
                preferredDate: bookingData.preferredDate,
                preferredSlot: bookingData.preferredSlot,
                mobileNumber: bookingData.mobileNumber
            });

            setBookingSuccess(true);
            setSelectedPoojaInfo(null);
            resetBookingForm();
            setTimeout(() => setBookingSuccess(false), 5000);
        } catch (error) {
            console.error('Error creating pooja booking:', error);
            alert(error.response?.data?.message || 'Unable to submit your booking. Please try again.');
        } finally {
            setIsBookingSubmitting(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        try {
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hh = h % 12 || 12;
            return `${hh}:${minutes} ${ampm}`;
        } catch (e) { return timeStr; }
    };

    return (
        <div className="pooja-page-container">
            {/* Hero Section */}
            <div className="pooja-hero" style={{ backgroundImage: `url(${heroBg})` }}>
                <div className="pooja-hero-overlay"></div>
                <div className="pooja-hero-content fade-in-up">
                    <div className="badge-divine">{t('liveNow')}</div>
                    <h1 className="hero-title">{t('experienceDivineHero')}</h1>
                    <HeadingOrnament variant="swirl" />
                    <p className="hero-subtitle">{t('experienceDivineHeroSub')}</p>
                    <button className="btn-premium-cta" onClick={() => document.getElementById('marketplace-section').scrollIntoView({ behavior: 'smooth' })}>
                        {t('bookVirtualPooja')}
                    </button>
                </div>
            </div>

            <div className="pooja-content-wrapper">
                {/* Live Darshan - Kept standard as it's separate from Acharya cards */}
                <section className="live-darshan-section">
                    <div className="section-header">
                        <div className="header-with-badge">
                            <span className="live-pill"><Radio size={14} className="pulse" /> {t('liveNow')}</span>
                            <h2>{t('liveDarshanTitle')}</h2>
                        </div>
                        <p>{t('liveDarshanSub')}</p>
                    </div>

                    <div className="live-streams-grid">
                        {liveStreams.map((stream) => (
                            <div key={stream.id} className="live-stream-card glass-panel-light hover-glow">
                                <div className="stream-thumbnail">
                                    <img 
                                        src={stream.imagePath ? (stream.imagePath.startsWith('http') ? stream.imagePath : `${axiosInstance.defaults.baseURL || ''}${stream.imagePath.startsWith('/') ? '' : '/'}${stream.imagePath}`) : pandit1} 
                                        alt={stream.title} 
                                        onError={(e) => { e.target.src = pandit1; }}
                                    />
                                    <div className="stream-overlay">
                                        <button className="play-btn-overlay" onClick={() => (stream.link && stream.link !== '#') && window.open(stream.link, '_blank')}>
                                            <PlayCircle size={48} />
                                        </button>
                                    </div>
                                </div>
                                <div className="stream-info">
                                    <h3><T>{stream.title}</T></h3>
                                    <p><MapPin size={12} /> <T>{stream.location}</T></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Acharya Marketplace Section - The Core Refactor */}
                <section id="marketplace-section" className="mk-marketplace-container">
                    <div className="section-header-center">
                        <h2>{t('esteemedAcharyas')}</h2>
                        <div className="title-underline"></div>
                        <p>{t('selectPriestSub', 'Discover world-class Vedic scholars for your personal rituals.')}</p>
                    </div>

                    <div className="mk-acharya-list">
                        {dynamicAcharyas.length > 0 ? (
                            dynamicAcharyas.map((acharya) => (
                                <AcharyaCard 
                                    key={acharya.id} 
                                    acharya={acharya} 
                                    onViewDetails={handleOpenDetails}
                                    panditPlaceholder={pandit1}
                                />
                            ))
                        ) : (
                            <div className="mk-empty-state">
                                <AlertCircle size={40} color="var(--mk-saffron)" style={{ marginBottom: '15px' }} />
                                <h3>{t('noAcharyasFound', 'No Acharyas currently online.')}</h3>
                                <p>{t('checkBackLater', 'Please check back in some time for live scheduling.')}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Details Modal */}
            <DetailsModal 
                acharya={viewingAcharya}
                isOpen={!!viewingAcharya}
                onClose={() => setViewingAcharya(null)}
                onBookPooja={handleStartBooking}
                panditPlaceholder={pandit1}
            />

            {/* Booking Form Overlay (Opens after selection from Modal) */}
            {selectedPoojaInfo && (
                <div className="pooja-modal-overlay" onClick={() => setSelectedPoojaInfo(null)}>
                    <div className="mk-modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
                        <button className="mk-modal-close" onClick={() => setSelectedPoojaInfo(null)}>
                            <X size={20} />
                        </button>
                        
                        <div className="mk-modal-header" style={{ padding: '25px', gap: '20px' }}>
                            <div style={{ background: 'var(--mk-saffron-light)', padding: '15px', borderRadius: '15px' }}>
                                <HandPlatter size={32} color="var(--mk-saffron)" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0 }}>{t('bookingFormTitle', 'Secure Ritual Booking')}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--mk-text-muted)', margin: '5px 0 0 0' }}>
                                    <T>{selectedPoojaInfo.pooja.name}</T> with <T>{selectedPoojaInfo.pandit.name}</T>
                                </p>
                            </div>
                        </div>

                        <div className="mk-modal-body" style={{ padding: '30px' }}>
                            {!isAuthenticated ? (
                                <div className="auth-warning-box">
                                    <AlertCircle size={48} color="#e53e3e" />
                                    <h4>{t('loginRequired', 'Identity Verification Required')}</h4>
                                    <p>{t('loginToSchedule', 'Please sign in to confirm your identity for the sacred ritual.')}</p>
                                    <button className="btn-login-redirect" onClick={() => navigate('/auth/login')}>
                                        {t('loginNow')}
                                    </button>
                                </div>
                            ) : (
                                <form className="pooja-details-form-enterprise" onSubmit={(e) => { e.preventDefault(); submitPoojaBooking(); }}>
                                    <div className="form-grid-enterprise">
                                        <div className="form-group-enterprise">
                                            <label>{t('devoteeNameLabel')}</label>
                                            <input type="text" name="devoteeName" value={bookingData.devoteeName} onChange={handleBookingChange} className={bookingErrors.devoteeName ? 'invalid' : ''} />
                                            <ValidationError error={bookingErrors.devoteeName} />
                                        </div>
                                        <div className="form-group-enterprise">
                                            <label>{t('mobileNumberLabel', 'Mobile Number')}</label>
                                            <input type="text" name="mobileNumber" value={bookingData.mobileNumber} onChange={handleBookingChange} className={bookingErrors.mobileNumber ? 'invalid' : ''} />
                                            <ValidationError error={bookingErrors.mobileNumber} />
                                        </div>
                                        <div className="form-group-enterprise">
                                            <label>{t('gotraLabel')}</label>
                                            <input type="text" name="gotra" value={bookingData.gotra} onChange={handleBookingChange} className={bookingErrors.gotra ? 'invalid' : ''} />
                                            <ValidationError error={bookingErrors.gotra} />
                                        </div>
                                        <div className="form-group-enterprise">
                                            <label>{t('familyCountLabel')}</label>
                                            <input type="number" name="familyCount" value={bookingData.familyCount} onChange={handleBookingChange} className={bookingErrors.familyCount ? 'invalid' : ''} />
                                            <ValidationError error={bookingErrors.familyCount} />
                                        </div>
                                        <div className="form-group-enterprise full-width">
                                            <label>{t('purposePoojaLabel')}</label>
                                            <textarea name="sankalpa" value={bookingData.sankalpa} onChange={handleBookingChange} rows="2" className={bookingErrors.sankalpa ? 'invalid' : ''}></textarea>
                                            <ValidationError error={bookingErrors.sankalpa} />
                                        </div>
                                        <div className="form-group-enterprise">
                                            <label>{t('preferredDateLabel')}</label>
                                            <input type="date" name="preferredDate" value={bookingData.preferredDate} onChange={handleBookingChange} min={new Date().toISOString().split('T')[0]} className={bookingErrors.preferredDate ? 'invalid' : ''} />
                                            <ValidationError error={bookingErrors.preferredDate} />
                                        </div>
                                        <div className="form-group-enterprise">
                                            <label>{t('preferredSlotLabel')}</label>
                                            <select name="preferredSlot" value={bookingData.preferredSlot} onChange={handleBookingChange} disabled={isLoadingSlots || !bookingData.preferredDate} className={bookingErrors.preferredSlot ? 'invalid' : ''}>
                                                <option value="">{isLoadingSlots ? t('loadingSlots') : t('selectTimeSlot')}</option>
                                                {timeSlots.map(slot => (
                                                    <option 
                                                        key={slot} 
                                                        value={slot} 
                                                        disabled={bookedSlots.includes(slot) || isSlotInPast(slot)}
                                                    >
                                                        {slot} {bookedSlots.includes(slot) ? `(${t('booked')})` : (isSlotInPast(slot) ? `(${t('passed')})` : '')}
                                                    </option>
                                                ))}
                                            </select>
                                            <ValidationError error={bookingErrors.preferredSlot} />
                                        </div>
                                    </div>
                                    <div className="form-actions-enterprise" style={{ marginTop: '30px' }}>
                                        <button type="submit" className="mk-btn-details" style={{ width: '100%', justifyContent: 'center' }} disabled={isBookingSubmitting}>
                                            {isBookingSubmitting ? t('processing', 'Processing...') : `Confirm & Pay ₹${selectedPoojaInfo.pooja.price}`}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {bookingSuccess && (
                <div className="pooja-booking-toast">
                    <CheckCircle2 size={20} />
                    <span>{t('poojaBookingSuccess')}</span>
                </div>
            )}

            {/* Day Info Modal (Kept for compatibility) */}
            {selectedDayInfo && (
                <div className="pooja-modal-overlay" onClick={() => setSelectedDayInfo(null)}>
                    <div className="pooja-modal day-info-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-icon" onClick={() => setSelectedDayInfo(null)}><X size={24} /></button>
                        <div className="day-modal-header">
                            <div className="day-icon-large">{selectedDayInfo.icon}</div>
                            <div>
                                <h2><T>{selectedDayInfo.day}</T></h2>
                                <h3 className="deity-name"><T>{selectedDayInfo.deity}</T></h3>
                            </div>
                        </div>
                        <div className="modal-info day-modal-content">
                            <div className="special-pooja-highlight">
                                <HandPlatter size={20} className="orange-text" />
                                <span><strong>{t('specialPoojaLabel')}</strong> <T>{selectedDayInfo.specialPooja}</T></span>
                            </div>
                            <div className="modal-meta-info">
                                <div className="meta-item">
                                    <Clock size={18} className="orange-text" />
                                    <span>{formatTime(selectedDayInfo.startTime)} - {formatTime(selectedDayInfo.endTime)}</span>
                                </div>
                                <div className="meta-item">
                                    <MapPin size={18} className="orange-text" />
                                    <span><T>{selectedDayInfo.place}</T></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualPooja;
