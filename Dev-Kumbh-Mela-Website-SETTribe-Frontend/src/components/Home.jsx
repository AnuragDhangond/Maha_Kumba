import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import '../styles/LandingPage.css';
import '../styles/Home.css';

import heroBgNew from '../assets/hero-background-new.jpg';
import kumbhHeroPremium from '../assets/kumbh-mela-hero-premium.png';
import heroGallery from '../assets/hero-gallery1.jpg';
import heroBg from '../assets/hero-background.jpg';
import heroGallery7 from '../assets/gallery7.jpg';
import aartiIcon from '../assets/aarti_icon.png';
import aartiIcon1 from '../assets/aarti_icon1.png';
import trishulLogo from '../assets/trishul_logo.png';
import kalashIcon from '../assets/image copy.png';
import sacredGhatCard from '../assets/sacred_ghat_card.png';
import templeCrowdCard from '../assets/temple_crowd_card.png';
import { useTranslation } from 'react-i18next';
import gallery1 from '../assets/gallery1.jpg';
import gallery2 from '../assets/gallery2.jpg';
import gallery3 from '../assets/gallery3.jpg';
import gallery4 from '../assets/gallery4.jpg';
import gallery5 from '../assets/gallery5.jpg';
import gallery6 from '../assets/gallery6.jpg';
import gallery8 from '../assets/gallery8.jpg';
import gallery9 from '../assets/new-gallery7.jpg';
import rudraEvent from '../assets/rudra_event.png';
import deepotsavEvent from '../assets/deepotsav_event.png';
import snanEvent from '../assets/snan_event.png';
import aartiEvent from '../assets/aarti_event.png';
import sadhuEvent from '../assets/sadhu_event.png';
import laserEvent from '../assets/laser_event.png';
import annadanEvent from '../assets/annadan_event.png';
import travelRealImg from '../assets/travel_stay_combined.png';
import holyDipRealImg from '../assets/holy_dip_real.png';
import stayOptionsRealImg from '../assets/stay_options_real.png';
import liveDarshanRealImg from '../assets/live_darshan_real.png';
import poojaBookingRealImg from '../assets/pooja_booking_real.png';
import lostFoundRealImg from '../assets/lost_found_real.png';
import liveUpdatesBg from '../assets/live_updates_bg.png';
import goldenMandala from '../assets/golden_mandala.png';
import medicalCenterIcon from '../assets/medical_center.png';
import shopHeroIcon from '../assets/shop_hero.png';
import HeadingOrnament from './HeadingOrnament';
import OptimizedImage from './OptimizedImage';
import { liveUpdateService } from '../api/services/liveUpdateService';
import homepageConfigService from '../api/services/homepageConfigService';
import useAuth from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import T from './DynamicText';
import WeatherHeaderWidget from './WeatherHeaderWidget';
import { useAdminSettings } from '../contexts/AdminSettingsContext';

const API_URL = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`).replace(/\/$/, '');
console.log("Home: Detected API_URL:", API_URL);


const LandingPage = () => {
    const { settings } = useAdminSettings();
    const { user, logout, isAuthenticated } = useAuth();
    const userName = user?.name || user?.username || user?.email?.split('@')[0] || "Pilgrim";
    const [scrolled, setScrolled] = useState(false);
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null); // stores full { img, title, desc } object
    const [isGalleryLoading, setIsGalleryLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeEventIndex, setActiveEventIndex] = useState(0);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [timeLeft, setTimeLeft] = useState({});
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = viewportWidth <= 768;
    const maxVisibleCards = isMobile ? 1 : 3;
    const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
    const [activePolicyModal, setActivePolicyModal] = useState(null);

    // Hero Background Carousel Logic - Using HD assets (3MB+ files)
    const [currentHeroImage, setCurrentHeroImage] = useState(0);
    const heroImages = [heroBgNew, kumbhHeroPremium, heroGallery, heroBg, heroGallery7];

    const { t, i18n } = useTranslation();
    const langRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const changeLanguage = (l) => {
        i18n.changeLanguage(l);
        setLang(l);
        localStorage.setItem('preferredLang', l);
        setLangMenuOpen(false);
        window.dispatchEvent(new Event('langchange'));
    };
    useEffect(() => {
        const handleLangChange = () => {
            const newLang = localStorage.getItem('preferredLang') || 'en';
            setLang(newLang);
        };
        window.addEventListener('langchange', handleLangChange);
        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);
    // 1. One-time setup: scroll observer, gallery loading, reveal animations
    useEffect(() => {
        const scrollObserver = new IntersectionObserver(
            ([entry]) => {
                setScrolled(!entry.isIntersecting);
            },
            { rootMargin: '-50px 0px 0px 0px', threshold: [1.0] }
        );
        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) scrollObserver.observe(sentinel);

        // Simulate gallery loading
        const timer = setTimeout(() => {
            setIsGalleryLoading(false);
        }, 2000);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach((el) => observer.observe(el));

        return () => {
            if (sentinel) scrollObserver.disconnect();
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    // 2. Click-outside handler (depends on langMenuOpen and isProfileOpen)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuOpen && !event.target.closest('.lang-select-container')) {
                setLangMenuOpen(false);
            }
            if (isProfileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        window.addEventListener('mousedown', handleClickOutside, { passive: true });
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [langMenuOpen, isProfileOpen]);

    // 3. Countdown timer (runs once, independent of any state)
    useEffect(() => {
        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const mockTarget = new Date().setHours(new Date().getHours() + 2, 45, 0, 0);
            const distance = mockTarget - now;
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft({
                h: hours.toString().padStart(2, '0'),
                m: minutes.toString().padStart(2, '0'),
                s: seconds.toString().padStart(2, '0')
            });
        }, 1000);
        return () => clearInterval(timerInterval);
    }, []);

    // Background Image Carousel Interval (6 seconds, runs once)
    useEffect(() => {
        const HERO_COUNT = 5;
        const bgInterval = setInterval(() => {
            setCurrentHeroImage((prev) => (prev + 1) % HERO_COUNT);
        }, 6000);
        return () => clearInterval(bgInterval);
    }, []);

    const [liveEvents, setLiveEvents] = useState([]);
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [homepageConfig, setHomepageConfig] = useState(null);
    const [otherEvents, setOtherEvents] = useState([]);
    const [dynamicServices, setDynamicServices] = useState([]);
    const host = window.location.hostname;
    const getEventStatus = (start, end) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now >= startTime && now <= endTime) {
            return { label: "Live Now", className: "live" };
        } else if (now < startTime) {
            const diffInMinutes = (startTime - now) / (1000 * 60);
            if (diffInMinutes <= 60) {
                return { label: "🟡 Starting Soon", className: "starting" };
            }
            return { label: "Upcoming", className: "upcoming" };
        } else {
            return { label: "Completed", className: "completed" };
        }
    };
    const processUpdates = (allUpdates) => {
        const liveUpdateData = allUpdates.filter(u => !u.category || u.category === 'LIVE_UPDATE');
        const processedLiveEvents = liveUpdateData.map(event => {
            const status = getEventStatus(event.startTime, event.endTime);
            return {
                id: event.id,
                title: event.title,
                description: event.description,
                location: event.location,
                image: event.imagePath
                    ? `${API_URL}${event.imagePath.startsWith('/') ? '' : '/'}${event.imagePath}`
                    : rudraEvent,
                startTime: event.startTime,
                endTime: event.endTime,
                statusLabel: status.label,
                statusClass: status.className,
                timeLabel: event.startTime && event.endTime
                    ? `${new Date(event.startTime).toLocaleTimeString([localStorage.getItem('preferredLang') || 'en-IN'], { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.endTime).toLocaleTimeString([localStorage.getItem('preferredLang') || 'en-IN'], { hour: '2-digit', minute: '2-digit' })}`
                    : "Ongoing",
                featured: event.featured || event.isFeatured
            };
        });
        setLiveEvents(processedLiveEvents);
        let featured = processedLiveEvents.filter(e => e.featured === true || e.isFeatured === true);
        if (featured.length === 0 && processedLiveEvents.length > 0) {
            featured = processedLiveEvents;
        }
        setFeaturedEvents(featured);
        setOtherEvents(processedLiveEvents);
        setActiveEventIndex(prev => prev >= featured.length ? 0 : prev);
    };

    const fetchLiveUpdates = async () => {
        try {
            const response = await liveUpdateService.getAllUpdates();
            const allUpdates = response.data;
            // 1. Process Live Updates (default category or LIVE_UPDATE)
            const liveUpdateData = allUpdates.filter(u => !u.category || u.category === 'LIVE_UPDATE');
            const processedLiveEvents = liveUpdateData.map(event => {
                const status = getEventStatus(event.startTime, event.endTime);
                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    image: event.imagePath
                        ? (event.imagePath.startsWith('http') ? event.imagePath : `${API_URL}${event.imagePath.startsWith('/') ? '' : '/'}${event.imagePath}`)
                        : rudraEvent,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    statusLabel: status.label,
                    statusClass: status.className,
                    timeLabel: event.startTime && event.endTime
                        ? `${new Date(event.startTime).toLocaleTimeString([localStorage.getItem('preferredLang') || 'en-IN'], { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.endTime).toLocaleTimeString([localStorage.getItem('preferredLang') || 'en-IN'], { hour: '2-digit', minute: '2-digit' })}`
                        : "Ongoing",
                    featured: event.featured || event.isFeatured
                };
            });
            setLiveEvents(processedLiveEvents);
            let featured = processedLiveEvents.filter(e => e.featured === true || e.isFeatured === true);
            if (featured.length === 0 && processedLiveEvents.length > 0) {
                featured = processedLiveEvents;
            }
            setFeaturedEvents(featured);
            setOtherEvents(processedLiveEvents);
            // 2. Process Dynamic Essential Services (Commented out as requested)
            /* const serviceData = allUpdates.filter(u => u.category === 'ESSENTIAL_SERVICE');
            const processedServices = serviceData.map(s => ({
                id: `dynamic-${s.id}`,
                title: s.title,
                description: s.description,
                icon: <img src={s.imagePath ? `${API_URL}${s.imagePath.startsWith('/') ? '' : '/'}${s.imagePath}` : sacredGhatCard} alt={s.title} className="service-icon-new" />,
                link: s.externalLink || '#'
            }));
            setDynamicServices(processedServices); */
            setActiveEventIndex(prev => prev >= featured.length ? 0 : prev);
        } catch (error) {
            console.error("Error fetching live updates:", error);
        }
    };

    useWebSocket('/topic/updates', (message) => {
        if (Array.isArray(message)) {
            processUpdates(message);
        }
    });

    const fetchHomepageConfig = async () => {
        try {
            const config = await homepageConfigService.getConfig();
            if (config) setHomepageConfig(config);
        } catch (error) {
            console.error("Error fetching homepage config:", error);
        }
    };

    useEffect(() => {
        fetchLiveUpdates();
        fetchHomepageConfig();

        const handleLangChange = () => {
            fetchLiveUpdates();
        };
        window.addEventListener('langchange', handleLangChange);
        return () => {
            window.removeEventListener('langchange', handleLangChange);
        };
    }, []);
    const staticServices = [
        {
            id: 'service-crowd',
            title: "Crowd Status",
            description: "Real-time Crowd Map, Zone Alerts, Safe Routes",
            icon: <img src={templeCrowdCard} alt="Crowd Status" className="service-icon-new" />,
            link: '/crowd-status'
        },
        {
            id: 'service-travel',
            title: "Travel & Stay",
            description: "Hotels, Transport, Food, Booking Services",
            icon: <img src={travelRealImg} alt="Travel" className="service-icon-new" />,
            link: '/travel'
        },
        {
            id: 'service-pooja',
            title: "Virtual Pooja",
            description: "Online Darshan, Pooja Booking, Live Streaming",
            icon: <img src={poojaBookingRealImg} alt="Virtual Pooja" className="service-icon-new" />,
            link: '/virtual-pooja'
        },
        {
            id: 'service-health',
            title: "Health & Safety",
            description: "Emergency Help, Ambulance, Medical Support",
            icon: <img src={medicalCenterIcon} alt="Health" className="service-icon-new" />,
            link: '/health'
        },
        {
            id: 'service-heritage',
            title: "Nashik Heritage",
            description: "Temples, Tourist Places, Historical Information",
            icon: <img src={sacredGhatCard} alt="Heritage" className="service-icon-new" />,
            link: '/heritage'
        },
        {
            id: 'service-shop',
            title: "Shop",
            description: "Prasad, Religious Items, Souvenirs",
            icon: <img src={shopHeroIcon} alt="Shop" className="service-icon-new" />,
            link: '/shop'
        },
        {
            id: 'service-donate',
            title: "Donate",
            description: "Donation Campaigns, Temple Donations, NGO Support",
            icon: <img src={annadanEvent} alt="Donate" className="service-icon-new" />,
            link: '/donate'
        },
        {
            id: 'service-green',
            title: "Green Kumbh",
            description: "Cleanliness Drive, Waste Management, Eco Awareness",
            icon: <img src={holyDipRealImg} alt="Green Kumbh" className="service-icon-new" />,
            link: '/sustainability'
        }
    ];
    const services = staticServices;
    const galleryItems = [
        { id: 1, title: t('gallery_1_title'), desc: t('gallery_1_desc'), img: gallery1 },
        { id: 2, title: t('gallery_2_title'), desc: t('gallery_2_desc'), img: gallery2 },
        { id: 3, title: t('gallery_3_title'), desc: t('gallery_3_desc'), img: gallery3 },
        { id: 4, title: t('gallery_4_title'), desc: t('gallery_4_desc'), img: gallery4 },
        { id: 5, title: t('gallery_5_title'), desc: t('gallery_5_desc'), img: gallery5 },
        { id: 6, title: t('gallery_6_title'), desc: t('gallery_6_desc'), img: gallery6 },
        { id: 7, title: t('gallery_7_title'), desc: t('gallery_7_desc'), img: heroGallery7 },
        { id: 8, title: t('gallery_8_title'), desc: t('gallery_8_desc'), img: gallery8 },
        { id: 9, title: t('gallery_9_title'), desc: t('gallery_9_desc'), img: gallery9 },
    ];
    const galleryBgRef = useRef(null);
    // Auto-advance Live Updates Carousel
    useEffect(() => {
        if (showAllEvents || featuredEvents.length <= 1) return;
        const interval = setInterval(() => {
            setActiveEventIndex((prev) => (prev + 1) % featuredEvents.length);
        }, 5000); // Advance every 5 seconds
        return () => clearInterval(interval);
    }, [showAllEvents, featuredEvents.length]);
    const nextEvent = () => setActiveEventIndex((activeEventIndex + 1) % featuredEvents.length);
    const prevEvent = () => setActiveEventIndex((activeEventIndex - 1 + featuredEvents.length) % featuredEvents.length);
    return (
        <div className="landing-page-container">
            {/* Zero-paint sentinel for high-performance scroll tracking */}
            <div id="scroll-sentinel" style={{ position: 'absolute', top: 0, height: '1px', width: '100%', visibility: 'hidden', pointerEvents: 'none' }} aria-hidden="true"></div>
            {/* Global Background Carousel */}
            <div className="page-background-carousel">
                {heroImages.map((img, index) => (
                    <div
                        key={index}
                        className={`hero-bg-layer ${currentHeroImage === index ? 'active' : ''}`}
                        style={{
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.55)), url(${img})`
                        }}
                    />
                ))}
            </div>
            {/* Navbar Section */}
            {/* <nav className={`navbar ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="navbar-top">
                    <div className="nav-left">
                        <img src={trishulLogo} alt="Kalash Icon" className="nav-kalash-icon" />
                    </div>
                    <div className="nav-center">
                        <ul className="nav-menu">
                            <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('home')}</a></li>
                            <li><a href="#explore">{t('services')}</a></li>
                            <li><a href="#glimpses">{t('glimpses')}</a></li>
                            <li><a href="#plan">{t('plan')}</a></li>
                            <li><a href="#footer">{t('contact')}</a></li>
                            <li><a href="/login" className="login-nav-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>{t('login')}</a></li>
                        </ul>
                    </div>
                    <div className="nav-right">
                        <a href="/login" className="login-nav-link mobile-only-login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>{t('login')}</a>
                        <div className={`lang-select-container ${langMenuOpen ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLangMenuOpen(!langMenuOpen); }}>
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
                                    <div className={`lang-option ${lang === 'en' ? 'selected' : ''}`} onClick={() => { setLang('en'); setLangMenuOpen(false); }}>English</div>
                                    <div className={`lang-option ${lang === 'hi' ? 'selected' : ''}`} onClick={() => { setLang('hi'); setLangMenuOpen(false); }}>हिन्दी</div>
                                    <div className={`lang-option ${lang === 'mr' ? 'selected' : ''}`} onClick={() => { setLang('mr'); setLangMenuOpen(false); }}>मराठी</div>
                                    <div className={`lang-option ${lang === 'sa' ? 'selected' : ''}`} onClick={() => { setLang('sa'); setLangMenuOpen(false); }}>संस्कृत</div>
                                </div>
                            )}
                        </div>
                        <a href="/login" className="nav-login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                            {t('login')}
                        </a>
                    </div>
                </div>
            </nav> */}
            <header className="home-header">
                <Link to="/" className="home-brand">
                    <img src={kalashIcon} alt="Kalash" className="home-logo-img" />
                </Link>
                {/* Sidebar Backdrop Overlay */}
                {isMenuOpen && (
                    <div
                        className="sidebar-backdrop"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}

                {settings?.maintenanceMode && (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <div className="maintenance-pill" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#d32f2f', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ⚠️ MAINTENANCE MODE
                        </div>
                    </div>
                )}

                <div className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
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
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/' ? 'active' : ''}
                            >
                                {t('home')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/travel"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/travel' ? 'active' : ''}
                            >
                                {t('travel')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/virtual-pooja"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/virtual-pooja' ? 'active' : ''}
                            >
                                {t('virtualPooja') || "Virtual Pooja"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/health"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/health' ? 'active' : ''}
                            >
                                {t('healthSafety')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/heritage"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/heritage' ? 'active' : ''}
                            >
                                {t('heritage')}
                            </Link>
                        </li>
                        {/* <li><a href="#shop" onClick={() => setIsMenuOpen(false)}>{t('shop')}</a></li> */}
                        <li>
                            <Link
                                to="/shop"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/shop' ? 'active' : ''}
                            >
                                {t('shop')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/donate"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/donate' ? 'active' : ''}
                            >
                                {t('donate')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/sustainability"
                                onClick={() => setIsMenuOpen(false)}
                                className={path === '/sustainability' ? 'active' : ''}
                            >
                                {t('greenKumbh')}
                            </Link>
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
                        <div className="user-profile-wrapper" ref={profileRef} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                    <button onClick={() => { logout(); setIsProfileOpen(false); }} className="logout-action">{t('signOut')}</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="desktop-login-btn" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="login-icon-svg">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span className="login-label">{t('login') || 'Login'}</span>
                        </Link>
                    )}
                </div>
            </header>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-crowd-alert"
                    onClick={() => navigate('/crowd-status')}
                    style={{
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        marginBottom: '15px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        // justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem',
                        // fontWeight: '600',
                        backdropFilter: 'blur(5px)',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        // boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}>
                    <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></span>
                    {t('liveCrowdStatus')} <span style={{ opacity: 0.8, marginLeft: '5px', fontSize: '1rem' }}>→</span>
                </div>

                <h1 className="hero-title">{t('title')} {t('location')}</h1>

                <div className="hero-divider-wrap">
                    <div className="hero-divider-line"></div>
                    <div className="hero-divider-diamond"></div>
                    <div className="hero-divider-line"></div>
                </div>

                <div className="hero-dates-glass">
                    <div className="hero-calendar-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div className="hero-dates-content">
                        <span className="hero-dates-label">
                            {homepageConfig && homepageConfig.shahiSnanHeading ? homepageConfig.shahiSnanHeading : t('datesLabel')}
                        </span>
                        <span className="hero-dates-value">
                            {homepageConfig && homepageConfig.shahiSnanStartDate && homepageConfig.shahiSnanEndDate
                                ? `${homepageConfig.shahiSnanStartDate} — ${homepageConfig.shahiSnanEndDate}`
                                : t('dates')}
                        </span>
                    </div>
                </div>

                <button
                    className="hero-cta-main"
                    onClick={() => {
                        const exploreSection = document.getElementById('explore');
                        if (exploreSection) {
                            exploreSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    {t('explore')}
                </button>

                <button
                    className="hero-sos-btn-main"
                    onClick={() => navigate('/health', { state: { triggerSOS: true } })}
                >
                    <AlertTriangle size={16} />
                    <span>SOS</span>
                </button>
            </section>

            {/* Live Kumbh Updates Section */}
            <section className="live-updates-section ultra-premium reveal-on-scroll" style={{ backgroundImage: `url(${liveUpdatesBg})` }}>
                {/* Sacred Atmosphere Particles */}
                <div className="sacred-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`particle p${i + 1}`}></div>
                    ))}
                </div>
                <div className="ornamental-flourish top-left">
                    <img src={goldenMandala} alt="" />
                </div>
                <div className="ornamental-flourish bottom-right">
                    <img src={goldenMandala} alt="" />
                </div>
                <div className="section-header">
                    <div className="header-ornament-wrap">
                        <img src={aartiIcon1} className="header-mini-icon" alt="" />
                        <h2 className="section-title">{t('liveUpdatesTitle')}</h2>
                    </div>
                    <p className="section-subtitle">{t('liveUpdatesSub')}</p>
                    <div className="premium-ornamental-divider">
                        <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0,5 Q25,0 50,5 T100,5" fill="none" stroke="var(--home-primary)" strokeWidth="0.5" />
                            <circle cx="50" cy="5" r="1.5" fill="var(--home-primary)" />
                        </svg>
                    </div>
                </div>
                <div className="enhanced-events-carousel-wrapper">
                    {!showAllEvents ? (
                        <div className="enhanced-events-carousel">
                            {featuredEvents.length > 0 ? (
                                <div className="carousel-main-slide">
                                    <div className="slide-content-split" key={activeEventIndex}>
                                        <div className="slide-visual-area">
                                            <OptimizedImage
                                                src={featuredEvents[activeEventIndex].image}
                                                placeholder={featuredEvents[activeEventIndex].image}
                                                alt={featuredEvents[activeEventIndex].title}
                                                className="slide-bg-img"
                                                ratio="16 / 9"
                                            />
                                            <div className="slide-glass-overlay">
                                                <div className="slide-info-header">
                                                    <div className="status-badge-wrap">
                                                        <span className={`status-pill ${featuredEvents[activeEventIndex].statusClass}`}>{t[featuredEvents[activeEventIndex].statusLabel] || featuredEvents[activeEventIndex].statusLabel}</span>
                                                    </div>
                                                    <span className="slide-loc">{featuredEvents[activeEventIndex].location}</span>
                                                </div>
                                                <h3 className="slide-event-title"><T>{featuredEvents[activeEventIndex].title}</T></h3>
                                                <p className="slide-event-desc"><T>{featuredEvents[activeEventIndex].description}</T></p>
                                                <div className="slide-info-footer">
                                                    <div className="slide-time">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                        </svg>
                                                        {featuredEvents[activeEventIndex].timeLabel}
                                                    </div>
                                                    <button className="join-ritual-btn tilt-btn" onClick={() => navigate('/virtual-pooja')}>{t('joinRitualLive')}</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="slide-map-area premium-map-glow">
                                            <iframe
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent((featuredEvents[activeEventIndex].location || "Kumbh Mela") + ", Nashik, India")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title="Dynamic Event Location"
                                            ></iframe>
                                        </div>
                                    </div>
                                    {featuredEvents.length > 1 && (
                                        <div className="carousel-nav-controls">
                                            <button className="nav-btn prev" onClick={prevEvent}>
                                                <span>←</span>
                                            </button>
                                            <div className="carousel-indicators">
                                                {featuredEvents.map((_, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`indicator ${idx === activeEventIndex ? 'active' : ''}`}
                                                        onClick={() => setActiveEventIndex(idx)}
                                                    ></span>
                                                ))}
                                            </div>
                                            <button className="nav-btn next" onClick={nextEvent}>
                                                <span>→</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '100px', color: 'white', background: 'rgba(0,0,0,0.2)', borderRadius: '30px' }}>
                                    <h3>{t('stayTunedFeatured')}</h3>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="all-events-grid animate-fade-up">
                            {liveEvents.map((event) => (
                                <div className="event-grid-card tilt-card" key={event.id}>
                                    <div className="grid-card-img-wrap">
                                        <OptimizedImage
                                            src={event.image}
                                            placeholder={event.image}
                                            alt={event.title}
                                            ratio="16 / 9"
                                            className="grid-card-img"
                                        />
                                        <div className={`grid-card-badge ${event.statusClass}`}><T>{event.statusLabel}</T></div>
                                        <div className="card-glare"></div>
                                    </div>
                                    <div className="grid-card-body">
                                        <div className="grid-card-loc">{event.location}</div>
                                        <h4 className="grid-card-title"><T>{event.title}</T></h4>
                                        <p className="grid-card-time">{event.timeLabel}</p>
                                        <button className="grid-card-btn" onClick={() => navigate('/virtual-pooja')}>{t('exploreRitual')}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Continuous Horizontal Scrolling Ticker Below Map Section - Moved Outside for Full Width */}
                {!showAllEvents && otherEvents.length > 0 && (() => {
                    const shouldRotate = otherEvents.length > maxVisibleCards;
                    return (
                        <div className="marquee-events-outer-wrap">
                            <div className={`continuous-scroll-track ${!shouldRotate ? 'no-animation' : ''}`}>
                                {(shouldRotate ? [...otherEvents, ...otherEvents] : otherEvents).map((event, idx) => (
                                    <div
                                        className="scroll-event-card-full"
                                        key={`${event.id}-${idx}`}
                                    >
                                        <div className="full-card-img-wrap">
                                            <OptimizedImage
                                                src={event.image}
                                                placeholder={event.image}
                                                alt={event.title}
                                                ratio="16 / 9"
                                                className="full-card-img"
                                            />
                                            <div className={`grid-card-badge ${event.statusClass}`} style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                                <T>{event.statusLabel}</T>
                                            </div>
                                        </div>
                                        <div className="full-card-content">
                                            <div className="full-card-loc">{event.location}</div>
                                            <h4 className="full-card-title"><T>{event.title}</T></h4>
                                            <div className="grid-card-time" style={{ marginBottom: '20px' }}>{event.timeLabel}</div>
                                            <button
                                                className="grid-card-btn"
                                                style={{ background: 'var(--home-primary)', color: 'white', width: '100%' }}
                                                onClick={() => navigate('/virtual-pooja')}
                                            >
                                                {t('exploreRitual')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
                <div className="view-more-container">
                    {!showAllEvents ? (
                        <button className="view-more-btn" onClick={() => {
                            setShowAllEvents(true);
                            setTimeout(() => {
                                document.querySelector('.live-updates-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }}>
                            {t('viewAllEvents')}
                        </button>
                    ) : (
                        <button className="view-more-btn featured" onClick={() => setShowAllEvents(false)}>
                            {t('showFeaturedEvents')}
                        </button>
                    )}
                </div>
            </section>
            {/* Essential Services Section */}
            <section id="explore" className="section reveal-on-scroll">
                <div className="section-header">
                    <h2 className="section-title">{t('servicesTitle')}</h2>
                </div>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div
                            className="service-card reveal-on-scroll"
                            key={service.id}
                            style={{ transitionDelay: `${index * 0.1}s` }}
                        >
                            <div className="service-icon-wrapper">
                                {service.icon}
                            </div>
                            <h3 className="service-title"><T>{service.title}</T></h3>
                            <p className="service-desc"><T>{service.description}</T></p>
                            <div 
                                className="service-link"
                                onClick={() => navigate(service.link)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span>{t('learnMore') || "Learn More"}</span>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            {/* Gallery Section */}
            <section id="glimpses" className="section gallery-section reveal-on-scroll">
                <div className="gallery-dynamic-bg" ref={galleryBgRef} style={{ backgroundImage: `url('${gallery1}')` }}></div>
                <div className="section-header">
                    <h2 className="section-title" style={{ color: 'white' }}>{t('gallery_title')}</h2>

                </div>
                {isGalleryLoading ? (
                    <div className="gallery-loader-wrapper">
                        <div className="sacred-loader-inner">
                            <div className="loader-ring"></div>
                            <div className="loader-ring-slow"></div>

                        </div>
                        <div className="loader-text">{t('loadingGlimpses') || "Revealing Sacred Glimpses..."}</div>
                    </div>
                ) : (
                    <div className="gallery-grid fade-in">
                        {galleryItems.map(item => (
                            <div
                                className="gallery-item-card"
                                key={item.id}
                                onMouseEnter={() => {
                                    if (galleryBgRef.current) {
                                        galleryBgRef.current.style.backgroundImage = `url('${item.img}')`;
                                    }
                                }}
                            >
                                <div className="gallery-img-container">
                                    <OptimizedImage
                                        src={item.img}
                                        placeholder={item.img}
                                        alt={item.title}
                                        ratio="1 / 1"
                                        className="gallery-card-img"
                                    />
                                </div>
                                <div className="gallery-card-content">
                                    <h3>{item.title}</h3>
                                    <p className="gallery-card-desc">{item.desc}</p>
                                    <div className="gallery-card-view" onClick={() => setSelectedImage(item)} style={{ cursor: 'pointer' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="7" y1="17" x2="17" y2="7"></line>
                                            <polyline points="7 7 17 7 17 17"></polyline>
                                        </svg>
                                        <span>{t('exploreView')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            {/* Call to Action Banner */}
            <section id="plan" className="cta-banner reveal-on-scroll">
                <h2>{t('joinTitle')}</h2>
                <p>{t('joinDesc')}</p>
                <button className="hero-cta" onClick={() => navigate('/travel')}>{t('planJourney')}</button>
            </section>
            {/* Footer Section */}
            <footer id="footer" className="footer reveal-on-scroll">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>{t('brand')}</h3>
                        <p>{t('joinDesc')}</p>
                    </div>
                    <div className="footer-column">
                        <h4>{t('quickLinks')}</h4>
                        <ul>
                            <li><a href="#travel-guide" onClick={(e) => { e.preventDefault(); setIsTravelModalOpen(true); }}>{t('travelGuide')}</a></li>
                            <li><a href="/travel" onClick={(e) => { e.preventDefault(); navigate('/travel'); }}>{t('verifiedStays')}</a></li>
                            <li><a href="/virtual-pooja" onClick={(e) => { e.preventDefault(); navigate('/virtual-pooja'); }}>{t('shahiSnanStatus')}</a></li>
                            <li><a href="#gallery" onClick={(e) => {
                                e.preventDefault();
                                const gallerySection = document.getElementById('glimpses');
                                if (gallerySection) gallerySection.scrollIntoView({ behavior: 'auto' });
                            }}>{t('vedicGallery')}</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>{t('info')}</h4>
                        <ul>
                            <li><a href="/health" onClick={(e) => { e.preventDefault(); navigate('/health'); }}>{t('healthClinics')}</a></li>
                            <li><a href="/heritage" onClick={(e) => { e.preventDefault(); navigate('/heritage'); }}>{t('historicalNashik')}</a></li>
                            <li><a href="/sustainability" onClick={(e) => { e.preventDefault(); navigate('/sustainability'); }}>{t('greenKumbh')}</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>{t('legalPolicies')}</h4>
                        <ul>
                            <li><a href="#terms" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }}>{t('usageTerms')}</a></li>
                            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }}>{t('dataPrivacy')}</a></li>
                            <li><a href="#accessibility" onClick={(e) => { e.preventDefault(); setActivePolicyModal('accessibility'); }}>{t('accessibilityStandards')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 {t('title')} {t('location')}. {t('rights')} <a href="https://settribe.com/dev-settribe-website/index_main.php" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}> SETTribe.</a></p>
                </div>
            </footer>
            {/* Image Modal Lightbox */}
            {selectedImage && (
                <div className="gallery-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="gallery-modal-box" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button className="gallery-modal-close" onClick={() => setSelectedImage(null)} aria-label="Close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        {/* Image */}
                        <div className="gallery-modal-img-wrap">
                            <img
                                src={selectedImage.img}
                                alt={selectedImage.title}
                                className="gallery-modal-img"
                            />
                        </div>
                        {/* Caption */}
                        <div className="gallery-modal-caption">
                            <h3 className="gallery-modal-title">{selectedImage.title}</h3>
                            <p className="gallery-modal-desc">{selectedImage.desc}</p>
                        </div>
                    </div>
                </div>
            )}
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
                            <h2>{t('sacredTravelGuideHeader')}</h2>
                            <div className="ornament"></div>
                        </div>
                        <div className="theme-modal-body">
                            <div className="policy-text">
                                <strong>{t('importantGuidelines')}</strong> {t('travelGuideText')}
                            </div>
                            <ul>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        setIsTravelModalOpen(false);
                                        setActivePolicyModal('guide');
                                    }}>
                                        <span className="link-title">{t('officialKumbhGuidelines')}</span>
                                        <span className="link-desc">{t('importantRulesInstructions')}</span>
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
                                        <span className="link-desc">{t('interactiveSacredSites')}</span>
                                    </a>
                                </li>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/travel');
                                        setIsTravelModalOpen(false);
                                    }}>
                                        <span className="link-title">{t('transportRoutes')}</span>
                                        <span className="link-desc">{t('localBusesTrains')}</span>
                                    </a>
                                </li>
                                <li>

                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/heritage');
                                        setIsTravelModalOpen(false);
                                    }}>
                                        <span className="link-title">{t('templeItinerary')}</span>
                                        <span className="link-desc">{t('curatedSpiritualVisit')}</span>
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
        </div>
    );
};
export default LandingPage;