import { Backpack, IdCard, Clock, Maximize, Minimize, MapPin, Navigation, Users, Plus, Key, Calendar, Train, Info, ShieldAlert, Phone, UserCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/TravelPage.css';
import HeadingOrnament from './HeadingOrnament';
import travelBg from '../assets/godavari_river_hero.png';
import stayImg1 from '../assets/gallery5.jpg';
import stayImg2 from '../assets/gallery6.jpg';
import stayImg3 from '../assets/gallery7.jpg';
import stayImg4 from '../assets/gallery8.jpg';
import kitImg1 from '../assets/rudraksha_mala.png';
import mapImg from '../assets/interactive_route_map.png';

import { stayService } from '../api/services/stayService';
import axiosInstance from '../api/axiosConfig';
import SmartNavigationMap from './SmartNavigationMap';
import useAuth from '../hooks/useAuth';
import { travelGroupService } from '../api/services/travelGroupService';
import Swal from 'sweetalert2';

const TravelPage = () => {
    const navigate = useNavigate();
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [activeTab, setActiveTab] = useState('bus');
    const [mapFilter, setMapFilter] = useState('stay');
    const [dynamicStays, setDynamicStays] = useState([]);

    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // const [select
    const [selectedMapLocation, setSelectedMapLocation] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        from: '',
        to: 'Nashik',
        date: today
    });

    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [destination, setDestination] = useState({ name: 'Ramkund', lat: 20.0051, lng: 73.7896 });
    const [isNavMode, setIsNavMode] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [locationError, setLocationError] = useState(false);

    const { user } = useAuth();
    const [subSection, setSubSection] = useState('stays');
    const [travelGroups, setTravelGroups] = useState([]);
    const [searchSource, setSearchSource] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [newGroupForm, setNewGroupForm] = useState({
        groupName: '',
        sourceLocation: '',
        travelDate: '',
        travelMode: 'Train',
        contactNumber: '',
        maxMembers: 10,
        description: ''
    });
    const [joinForm, setJoinForm] = useState({
        memberName: '',
        memberPhone: ''
    });
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem('preferredLang') || 'en');
        };
        window.addEventListener('langchange', handleLangChange);
        fetchDynamicStays();

        // Get user's live GPS coordinates for directions
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocationError(true),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocationError(true);
        }

        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);

    const sacredSites = {
        'Ramkund': { lat: 20.0051, lng: 73.7896 },
        'Panchvati': { lat: 20.0065, lng: 73.7915 },
        'Trimbakeshwar': { lat: 19.9324, lng: 73.5308 },
        'Kalaram Temple': { lat: 20.0065, lng: 73.7915 },
        'Muktidham': { lat: 19.9483, lng: 73.8183 },
        'Nashik': { lat: 20.0051, lng: 73.7896 }
    };

    const fetchTravelGroups = async (source = '', date = '') => {
        setIsLoadingGroups(true);
        try {
            const res = await travelGroupService.getTravelGroups(source, date);
            setTravelGroups(res.data || []);
        } catch (err) {
            console.error("Error fetching travel groups:", err);
            setTravelGroups([]);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    useEffect(() => {
        if (subSection === 'circles') {
            fetchTravelGroups(searchSource, searchDate);
        }
    }, [subSection, searchSource, searchDate]);

    const handleJoinByCode = async (e) => {
        e.preventDefault();
        if (!joinCode || !joinCode.trim()) {
            Swal.fire('Error', 'Please enter a group code.', 'error');
            return;
        }
        const memberName = user?.name || joinForm.memberName;
        const memberPhone = joinForm.memberPhone || user?.contactNo || '';
        if (!memberName || !memberName.trim()) {
            Swal.fire('Error', 'Please enter your name.', 'error');
            return;
        }
        try {
            await travelGroupService.joinTravelGroupByCode({
                groupCode: joinCode.trim().toUpperCase(),
                memberName,
                memberPhone
            });
            Swal.fire('Success', 'Successfully joined the travel circle!', 'success');
            setJoinCode('');
            setJoinForm({ memberName: '', memberPhone: '' });
            fetchTravelGroups(searchSource, searchDate);
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && typeof backendErrors === 'object') {
                const errorMessages = Object.values(backendErrors).join('\n');
                Swal.fire('Error', errorMessages, 'error');
            } else {
                Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to join group.', 'error');
            }
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupForm.groupName || !newGroupForm.sourceLocation || !newGroupForm.travelDate) {
            Swal.fire('Error', 'Group Name, Origin City, and Travel Date are required.', 'error');
            return;
        }
        if (newGroupForm.travelDate < today) {
            Swal.fire('Error', 'Travel date cannot be in the past.', 'error');
            return;
        }
        try {
            const res = await travelGroupService.createTravelGroup({
                ...newGroupForm,
                creatorName: user?.name || 'Anonymous Pilgrim'
            });
            Swal.fire({
                title: 'Circle Created!',
                html: `
                    <div style="padding: 10px;">
                        <p>Your travel group <strong>${res.data.groupName}</strong> has been registered.</p>
                        <p style="font-size: 1.2rem; margin-top: 15px;">Unique Join Code:</p>
                        <div style="font-size: 2.2rem; font-weight: 800; color: #e65c00; background: #FFF3E0; padding: 10px; border-radius: 10px; border: 2px dashed #ff7e36; display: inline-block; margin-bottom: 15px; letter-spacing: 2px;">
                            ${res.data.groupCode}
                        </div>
                        <p style="font-size: 0.9rem; color: #666;">Share this code with co-travellers to let them join directly!</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: '#e65c00',
                confirmButtonText: 'Great!'
            });
            setShowCreateGroupModal(false);
            setNewGroupForm({ groupName: '', sourceLocation: '', travelDate: '', travelMode: 'Train', contactNumber: '', maxMembers: 10, description: '' });
            fetchTravelGroups(searchSource, searchDate);
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && typeof backendErrors === 'object') {
                const errorMessages = Object.values(backendErrors).join('\n');
                Swal.fire('Error', errorMessages, 'error');
            } else {
                Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to create group.', 'error');
            }
        }
    };

    const handleOpenDetails = async (group) => {
        setSelectedGroup(group);
        try {
            const res = await travelGroupService.getTravelGroupMembers(group.id);
            setGroupMembers(res.data || []);
            setShowDetailsModal(true);
        } catch (err) {
            Swal.fire('Error', 'Failed to retrieve group members.', 'error');
        }
    };

    const handleJoinSelectedGroup = async (e) => {
        e.preventDefault();
        const memberName = user?.name || joinForm.memberName;
        const memberPhone = joinForm.memberPhone || user?.contactNo || '';
        if (!memberName || !memberName.trim()) {
            Swal.fire('Error', 'Please enter your name.', 'error');
            return;
        }
        try {
            await travelGroupService.joinTravelGroup(selectedGroup.id, {
                memberName,
                memberPhone
            });
            Swal.fire('Success', 'Successfully joined the travel circle!', 'success');
            setJoinForm({ memberName: '', memberPhone: '' });
            const res = await travelGroupService.getTravelGroupMembers(selectedGroup.id);
            setGroupMembers(res.data || []);
            fetchTravelGroups(searchSource, searchDate);
        } catch (err) {
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && typeof backendErrors === 'object') {
                const errorMessages = Object.values(backendErrors).join('\n');
                Swal.fire('Error', errorMessages, 'error');
            } else {
                Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to join group.', 'error');
            }
        }
    };

    const fetchDynamicStays = async () => {
        try {
            // Fetch a larger number of stays for the public page
            const response = await stayService.getStays('', 0, 50);
            const data = response.data;

            // Handle both paginated (data.content) and non-paginated (data as array) responses
            const stayList = data && data.content !== undefined ? data.content : (Array.isArray(data) ? data : []);

            if (stayList && stayList.length > 0) {
                // Map API data to the structure needed by our UI
                const mapped = stayList.map(item => {
                    // Format price: if it's just a number, add ₹ and /night
                    const displayPrice = !isNaN(item.price)
                        ? `₹${Number(item.price).toLocaleString('en-IN')}/night`
                        : item.price;

                    // Format rating: if it's a number, add star icon
                    const displayRating = !isNaN(item.rating)
                        ? `${item.rating} ★`
                        : item.rating;

                    // Get category-specific default image
                    const getDefaultImg = (cat) => {
                        switch (cat) {
                            case 'Traditional Ashrams': return stayImg2;
                            case 'Luxury Tents': return stayImg3;
                            case 'Heritage Homestays': return stayImg4;
                            default: return stayImg1;
                        }
                    };

                    const baseUrl = axiosInstance.defaults.baseURL || '';

                    return {
                        id: item.id,
                        icon: getIconByCategory(item.category),
                        title: item.title,
                        category: item.category, // Include category for onError fallback
                        rating: displayRating,
                        img: item.imagePath ? (item.imagePath.startsWith('http') ? item.imagePath : `${baseUrl}${item.imagePath.startsWith('/') ? '' : '/'}${item.imagePath}`) : getDefaultImg(item.category),
                        price: displayPrice,
                        features: item.features,
                        navigationLink: item.navigationLink
                    };
                });
                setDynamicStays(mapped);
            }
        } catch (error) {
            console.error("Error fetching dynamic stays:", error);
        }
    };

    const openRouteMap = (destName) => {
        const site = sacredSites[destName] || sacredSites['Ramkund'];
        setDestination({ name: destName, ...site });
        setIsNavMode(false);
        setIsRouteModalOpen(true);
    };

    const getIconByCategory = (category) => {
        switch (category) {
            case 'Premium Hotels': return '🏨';
            case 'Traditional Ashrams': return '🕉️';
            case 'Luxury Tents': return '🏕️';
            case 'Heritage Homestays': return '🏡';
            default: return '🏠';
        }
    };

        const { t } = useTranslation();
;

    

    const handleSearch = () => {
        const { from, to, date } = formData;
        let url = '';

        if (activeTab === 'bus') {
            url = `https://www.redbus.in/bus-tickets/${from.toLowerCase()}-to-${to.toLowerCase()}?onwardpostdate=${date}`;
        } else if (activeTab === 'train') {
            url = `https://www.irctc.co.in/nget/booking/train-list?fromStation=${from.toUpperCase()}&toStation=${to.toUpperCase()}&journeyDate=${date.replace(/-/g, '')}`;
        } else if (activeTab === 'flight') {
            url = `https://www.makemytrip.com/flight/search?itinerary=${from.toUpperCase()}-${to.toUpperCase()}-${date}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
        }

        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleStaySearch = (opt) => {
        if (opt.navigationLink) {
            window.open(opt.navigationLink, '_blank');
        } else {
            const url = `https://www.booking.com/searchresults.html?ss=Nashik&checkin=${formData.date}`;
            window.open(url, '_blank');
        }
    };

    const setQuickDate = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setFormData({ ...formData, date: d.toISOString().split('T')[0] });
    };

    const transportOptions = [
        { id: 'bus', icon: '🚌', title: t('bus'), price: '₹499' },
        { id: 'train', icon: '🚂', title: t('train'), price: '₹899' },
        { id: 'flight', icon: '✈️', title: t('flight'), price: '₹2,499' },
    ];

        const defaultStayOptions = [
        {
            id: "hotel",
            icon: "🏨",
            title: t("hotel"),
            rating: "5 ★",
            img: stayImg1,
            price: "₹2,999/night",
            features: ["freeWifi", "ac", "nearGhat"]
        },
        {
            id: "ashram",
            icon: "🕉️",
            title: t("ashram"),
            rating: "Spiritual",
            img: stayImg2,
            price: "₹299/night",
            features: ["sattvicMeal", "meditationHall", "riverFacing"]
        },
        {
            id: "tent",
            icon: "🏕️",
            title: t("tent"),
            rating: "Premium",
            img: stayImg3,
            price: "₹5,499/night",
            features: ["luxuryTent", "ecoFriendly", "nearArathi"]
        },
        {
            id: "homestay",
            icon: "🏡",
            title: t("homestay"),
            rating: "Heritage",
            img: stayImg4,
            price: "₹1,499/night",
            features: ["localHost", "vedicTheme", "homeCooked"]
        }
    ];

    const stayOptions = dynamicStays.length > 0 ? dynamicStays : defaultStayOptions;

    const mapResults = {
        stay: [
            { id: 1, name: "Gateway Hotel Nashik", type: "Luxury", dist: "2.4 km", rating: "4.8", price: "₹8,500" },
            { id: 2, name: "Panchvati Yatri", type: "Classic", dist: "0.8 km", rating: "4.2", price: "₹2,200" },
            { id: 3, name: "Ginger Nashik", type: "Business", dist: "3.1 km", rating: "4.0", price: "₹4,100" },
            { id: 4, name: "Ibis Nashik", type: "Modern", dist: "4.5 km", rating: "4.1", price: "₹3,800" }
        ],
        food: [
            { id: 1, name: "Sadhana Misal", type: "Traditional", dist: "1.2 km", rating: "4.9", price: "₹250" },
            { id: 2, name: "The Saffron", type: "Fine Dine", dist: "2.1 km", rating: "4.5", price: "₹1,200" },
            { id: 3, name: "Hotel Panchvati Manor", type: "Pure Veg", dist: "0.5 km", rating: "4.3", price: "₹600" },
            { id: 4, name: "Barbeque Nation", type: "Buffet", dist: "3.2 km", rating: "4.4", price: "₹900" }
        ]
    };

    return (
        <div className="travel-page">
            <header className="travel-hero" style={{ backgroundImage: `url(${travelBg})` }}>
                <div className="hero-content">
                    <h1 className="hero-title">{t('travelTitle')}</h1>
                    <HeadingOrnament variant="dot" />
                    <p className="hero-subtitle">{t('travelHeroSubtitle')}</p>
                </div>
            </header>

            <div className="pilgrim-subsection-tabs">
                <button 
                    onClick={() => setSubSection('stays')} 
                    className={`pilgrim-subsection-tab-btn ${subSection === 'stays' ? 'active' : ''}`}
                >
                    ✈️ Stays & Transport
                </button>
                <button 
                    onClick={() => setSubSection('circles')} 
                    className={`pilgrim-subsection-tab-btn ${subSection === 'circles' ? 'active' : ''}`}
                >
                    🤝 Co-Traveller Circles
                </button>
            </div>

            {subSection === 'stays' ? (
                <>
                    <div className="booking-section">
                        <div className="booking-container">
                            <h2>{t('bookJourney')}</h2>
                            <p className="booking-subtitle">{t('bookJourneySubtitle')}</p>
                            <div className="booking-tabs">
                                <div className={`tab-item ${activeTab === 'bus' ? 'active' : ''}`} onClick={() => setActiveTab('bus')}>
                                    {t('bus')}
                                </div>
                                <div className={`tab-item ${activeTab === 'train' ? 'active' : ''}`} onClick={() => setActiveTab('train')}>
                                    {t('train')}
                                </div>
                                <div className={`tab-item ${activeTab === 'flight' ? 'active' : ''}`} onClick={() => setActiveTab('flight')}>
                                    {t('flight')}
                                </div>
                            </div>

                            <div className="booking-form-card">
                                <div className="input-group">
                                    <label>{t('fromLabel')}</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="e.g., Mumbai"
                                            value={formData.from}
                                            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>{t('toLabel')}</label>
                                    <div className="input-wrapper">
                                        <input type="text" value={formData.to} readOnly />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>{t('dateJourneyLabel')}</label>
                                    <div className="date-row">
                                        <div className="input-wrapper">
                                            <span></span>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val && val < today) {
                                                        setFormData({ ...formData, date: today });
                                                    } else {
                                                        setFormData({ ...formData, date: val });
                                                    }
                                                }}
                                                min={today}
                                            />
                                        </div>
                                        <div className="quick-dates">
                                            <button className="quick-date-btn" onClick={() => setQuickDate(0)}>{t('today')}</button>
                                            <button className="quick-date-btn" onClick={() => setQuickDate(1)}>{t('tomorrow')}</button>
                                        </div>
                                    </div>
                                </div>

                                <button className="search-btn" onClick={handleSearch}>
                                    {activeTab === 'bus' ? t('searchBuses') : activeTab === 'train' ? t('searchTrains') : t('searchFlights')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ══ SMART NAVIGATION SECTION ══ */}
                    <section className="travel-section map-section">
                        <div className="section-head">
                            <h2>Interactive Local Guide</h2>
                            <div className="underline"></div>
                            <p>Discover nearby accommodations, traditional eateries, and smart routes to sacred sites.</p>
                        </div>

                        <div className="map-explorer-container">
                            <div className="map-main-area">
                                <div className={`map-iframe-container ${isMapExpanded ? 'expanded' : ''}`}>
                                    <button className="map-expand-btn" onClick={() => setIsMapExpanded(!isMapExpanded)}>
                                        {isMapExpanded ? <Minimize size={20} /> : <Maximize size={20} />}
                                    </button>
                                    {!userCoords && !locationError ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#0f172a', color: 'white', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, border: '4px solid #f97316', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            <span style={{ fontSize: 14 }}>Getting your location for directions...</span>
                                        </div>
                                    ) : (
                                        <iframe
                                            key={selectedMapLocation || 'ramkund'}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={
                                                userCoords
                                                    ? `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=${encodeURIComponent((selectedMapLocation ? `${selectedMapLocation} Nashik` : 'Ramkund Nashik'))}&t=k&z=14&output=embed`
                                                    : `https://maps.google.com/maps?q=${encodeURIComponent(selectedMapLocation || 'Ramkund Nashik')}&t=k&z=15&output=embed`
                                            }
                                        ></iframe>
                                    )}
                                </div>

                                <div className="map-sidebar">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                        <h3 className="font-bold text-slate-800">Popular Hotels Nearby</h3> 
                                    </div>
                                    <div className="map-results-list">
                                        {mapResults[mapFilter].map(res => (
                                            <div
                                                className={`map-res-card ${selectedMapLocation === res.name ? 'active-location' : ''}`}
                                                key={res.id}
                                                onClick={() => setSelectedMapLocation(res.name)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="res-info">
                                                    <h4>{res.name}</h4>
                                                    <div className="res-meta">
                                                        <span>{res.type}</span> • <span>{res.dist}</span>
                                                    </div>
                                                    <div className="res-footer">
                                                        <span className="res-rating">{res.rating}</span>
                                                        <span className="res-price">Avg. {res.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="travel-section">
                        <div className="section-head">
                            <h2>{t('findStay')}</h2>
                            <div className="underline"></div>
                            <p>{t('stayDesc')}</p>
                        </div>

                        <div className="travel-grid">
                            {stayOptions.map(opt => (
                                <div className="stay-search-card" key={opt.id}>
                                    <div className="stay-img-container">
                                        <img
                                            src={opt.img}
                                            alt={opt.title}
                                            loading="lazy"
                                            onError={(e) => {
                                                const getDefaultImg = (cat) => {
                                                    switch (cat) {
                                                        case 'Traditional Ashrams': return stayImg2;
                                                        case 'Luxury Tents': return stayImg3;
                                                        case 'Heritage Homestays': return stayImg4;
                                                        default: return stayImg1;
                                                    }
                                                };
                                                e.target.src = getDefaultImg(opt.category);
                                            }}
                                        />
                                        <div className="stay-overlay">
                                            <div className="stay-rating-pill">
                                                <span className="rating-val">{opt.rating.split(' ')[0]}</span>
                                            </div>
                                            <div className="stay-price-pill">
                                                {opt.price.split('/')[0]}
                                                <span className="per-night">/night</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stay-details">
                                        <div className="stay-header">
                                            <div className="stay-category-icon">{opt.icon}</div>
                                            <div className="stay-title-area">
                                                <span className="stay-category-text">{opt.category || 'Spiritual Stay'}</span>
                                                <h3 className="stay-title">{opt.title}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="stay-features-grid">
                                            {opt.features.slice(0, 3).map((f, idx) => (
                                                <div className="feature-item" key={idx}>
                                                    <span className="feature-dot"></span>
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="stay-actions">
                                            <button className="premium-card-btn" onClick={() => handleStaySearch(opt)}>
                                                <span className="btn-text">{t('checkAvailability')}</span>
                                                <span className="btn-arrow">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <div className="circles-dashboard">
                    <div className="section-head">
                        <h2>Co-Traveller Circles</h2>
                        <div className="underline"></div>
                        <p>Join or create travel groups starting from your city. Travel together with fellow pilgrims for a safe, shared experience.</p>
                    </div>

                    <div className="circles-hub-grid">
                        {/* Card 1: Join with Code */}
                        <div className="circle-hub-card">
                            <h3><Key size={20} style={{marginRight: 8, verticalAlign: 'middle', color: '#ff8f00'}}/> Join with Group Code</h3>
                            <form onSubmit={handleJoinByCode}>
                                <div className="form-group-circles">
                                    <label>6-Character Group Code</label>
                                    <input 
                                        type="text" 
                                        className="form-input-circles" 
                                        placeholder="e.g. MUM92X" 
                                        maxLength={10}
                                        value={joinCode}
                                        onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                {user ? (
                                    <>
                                        <div style={{ fontSize: '0.9rem', color: '#795d4d', marginBottom: '1rem' }}>
                                            Joining as logged-in pilgrim: <strong>{user.name}</strong>
                                        </div>
                                        <div className="form-group-circles">
                                            <label>Phone Number *</label>
                                            <input 
                                                type="tel" 
                                                className="form-input-circles" 
                                                placeholder="Enter your phone number" 
                                                value={joinForm.memberPhone}
                                                maxLength={10}
                                                onKeyDown={(e) => {
                                                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                                                        val = '';
                                                    }
                                                    setJoinForm({...joinForm, memberPhone: val});
                                                }}
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group-circles">
                                            <label>Your Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-input-circles" 
                                                placeholder="Enter your name" 
                                                value={joinForm.memberName}
                                                onChange={e => setJoinForm({...joinForm, memberName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group-circles">
                                            <label>Phone Number *</label>
                                            <input 
                                                type="tel" 
                                                className="form-input-circles" 
                                                placeholder="Enter your phone number" 
                                                value={joinForm.memberPhone}
                                                maxLength={10}
                                                onKeyDown={(e) => {
                                                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={e => {
                                                    let val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                                                        val = '';
                                                    }
                                                    setJoinForm({...joinForm, memberPhone: val});
                                                }}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                <button type="submit" className="card-btn" style={{ background: '#4a2a18' }}>
                                    Join Circle
                                </button>
                            </form>
                        </div>

                        {/* Card 2: Create Group Call-to-action & Search Filters */}
                        <div className="circle-hub-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3><Users size={20} style={{marginRight: 8, verticalAlign: 'middle', color: '#ff8f00'}}/> Host a Travel Circle</h3>
                                <p style={{ fontSize: '0.95rem', color: '#795d4d', marginBottom: '1.5rem' }}>
                                    Are you travelling to Maha Kumbh Nashik with space in your vehicle or wanting companion pilgrims from your city? Register your travel circle.
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                <button 
                                    onClick={() => setShowCreateGroupModal(true)} 
                                    className="card-btn"
                                    style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <Plus size={20}/> Host New Circle
                                </button>
                            </div>

                            <div>
                                <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#4a2a18', marginBottom: '10px' }}>Filter Circles</h4>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Search origin city..." 
                                        className="form-input-circles"
                                        style={{ flex: 1, minWidth: '150px' }}
                                        value={searchSource}
                                        onChange={e => setSearchSource(e.target.value)}
                                    />
                                    <input 
                                        type="date" 
                                        className="form-input-circles"
                                        style={{ flex: 1, minWidth: '150px' }}
                                        value={searchDate}
                                        onChange={e => setSearchDate(e.target.value)}
                                    />
                                    {(searchSource || searchDate) && (
                                        <button 
                                            onClick={() => { setSearchSource(''); setSearchDate(''); }}
                                            style={{ background: '#eceff1', color: '#37474f', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="circle-cards-grid">
                        {isLoadingGroups ? (
                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div className="spiritual-loader"></div>
                            </div>
                        ) : travelGroups.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '20px', border: '1px dashed #dcd1c4' }}>
                                <ShieldAlert size={48} style={{ color: '#ff7e36', marginBottom: '1rem' }}/>
                                <h4 style={{ fontFamily: 'Cinzel, serif', color: '#4a2a18', margin: '0 0 10px 0' }}>No Circles Found</h4>
                                <p style={{ color: '#795d4d', margin: 0 }}>Be the first to host a circle or adjust your filters!</p>
                            </div>
                        ) : (
                            travelGroups.map(group => {
                                const percentage = Math.min(100, Math.round(((group.membersCount || 1) / (group.maxMembers || 10)) * 100));
                                return (
                                    <div className="circle-card" key={group.id}>
                                        <div className="circle-code-badge">{group.groupCode}</div>
                                        <div className="circle-card-header">
                                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#ff7e36', fontWeight: 700 }}>Travel Circle</span>
                                            <h4>{group.groupName}</h4>
                                        </div>
                                        <div className="circle-details-list">
                                            <div className="circle-detail-row">
                                                <MapPin size={16}/>
                                                <span>From: <strong>{group.sourceLocation}</strong></span>
                                            </div>
                                            <div className="circle-detail-row">
                                                <Calendar size={16}/>
                                                <span>Date: {new Date(group.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="circle-detail-row">
                                                <Train size={16}/>
                                                <span>Mode: {group.travelMode || 'Train'}</span>
                                            </div>
                                            {group.creatorName && (
                                                <div className="circle-detail-row">
                                                    <Info size={16}/>
                                                    <span>Hosted by: {group.creatorName}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="circle-capacity-bar">
                                            <div className="capacity-info">
                                                <span>Circle Capacity</span>
                                                <span>{group.membersCount || 1} / {group.maxMembers || 10} joined</span>
                                            </div>
                                            <div className="capacity-progress-bg">
                                                <div className="capacity-progress-fill" style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="circle-card-footer">
                                            <button onClick={() => handleOpenDetails(group)} className="card-btn">
                                                View details & Join
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Support & Tips Section split for better layout */}
            <section className="travel-section premium-bg">
                <div className="section-head premium-section-head">
                    <h2>{t('premiumPilgrimSupport')}</h2>
                    <div className="underline"></div>
                    <p>{t('exclusiveServicesSubtitle')}</p>
                </div>

                <div className="premium-support-grid">
                    <div className="support-card gold-border">
                        <div className="support-icon-top">
                            <img src={kitImg1} alt="Sacred Shop Collection" />
                        </div>
                        <div className="support-info centered-info">
                            <div className="support-badge">{t('specialOfferBadge')}</div>
                            <h3>{t('sacredShopCollection')}</h3>
                            <div className="support-price">{t('twentyPercentOff')}</div>
                            <p>{t('shopOfferDesc')}</p>
                            <button className="support-cta-outline" onClick={() => {
                                navigate('/shop');
                                setTimeout(() => {
                                    const marketSection = document.getElementById('marketplace');
                                    if (marketSection) marketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 300);
                            }}>{t('shopExclusiveDeals')}</button>
                        </div>
                    </div>
                    <div className="support-card saffron-border">
                        <div className="support-icon-top">
                            <Navigation size={48} color="#e65c00" />
                        </div>
                        <div className="support-info centered-info">
                            <div className="support-badge">{t('mostUsefulBadge')}</div>
                            <h3>{t('routeFinder')}</h3>
                            <p>{t('routeFinderDesc')}</p>
                            <div className="support-actions">
                                <button className="support-cta-outline" onClick={() => openRouteMap('Ramkund')}>
                                    {t('viewDigitalMap')}
                                </button>
                                <button className="support-cta-outline" onClick={() => {
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=Ramkund+Nashik&dir_action=navigate`, '_blank');
                                }}>{t('saveMapToPhone')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="travel-section">
                <div className="section-head">
                    <h2>{t('tipsSacredVisit')}</h2>
                    <div className="underline"></div>
                    <p>{t('expertAdviceSubtitle')}</p>
                </div>
                <div className="tips-flex">
                    <div className="tip-item">
                        <div className="tip-circle"><Backpack size={32} color="#1A237E" /></div>
                        <div className="tip-content">
                            <h3>{t('packLite')}</h3>
                            <p>{t('packLiteDesc')}</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-circle"><IdCard size={32} color="#1A237E" /></div>
                        <div className="tip-content">
                            <h3>{t('digitalIdentity')}</h3>
                            <p>{t('digitalIdentityDesc')}</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-circle"><Clock size={32} color="#1A237E" /></div>
                        <div className="tip-content">
                            <h3>{t('threeHourRule')}</h3>
                            <p>{t('threeHourRuleDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ SMART ROUTE POPUP MODAL ══ */}
            {isRouteModalOpen && (
                <div className="map-popup-overlay" onClick={() => setIsRouteModalOpen(false)}>
                    <div className="map-popup-content" onClick={e => e.stopPropagation()}>
                        <button className="close-popup" onClick={() => setIsRouteModalOpen(false)}>×</button>
                        <div className="popup-header">
                            <div className="popup-title-group">
                                <Navigation className="title-icon" size={24} />
                                <h3>Smart Route to {destination.name}</h3>
                            </div>
                            <p>Avoiding overcrowded zones for your safety.</p>
                        </div>
                        <div className="popup-map-container">
                            <SmartNavigationMap 
                                destination={destination} 
                                isNavMode={isNavMode}
                            />
                        </div>
                        <div className="popup-footer">
                            <div className="flex gap-4" style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center' }}>
                                <button className="support-cta-outline" style={{ flex: 1, maxWidth: '250px' }} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.name + ' Nashik')}`, '_blank')}>
                                    Open in Google Maps
                                </button>
                                <button 
                                    className="card-btn" 
                                    style={{ flex: 1, maxWidth: '250px', margin: 0, backgroundColor: isNavMode ? '#be123c' : undefined }} 
                                    onClick={() => setIsNavMode(!isNavMode)}
                                >
                                    {isNavMode ? 'Stop Navigation' : 'Start Navigation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ CREATE TRAVEL CIRCLE MODAL ══ */}
            {showCreateGroupModal && (
                <div className="circle-modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
                    <div className="circle-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="circle-modal-header">
                            <h3>Host a Travel Circle</h3>
                            <button className="circle-modal-close" onClick={() => setShowCreateGroupModal(false)}>×</button>
                        </div>
                        <div className="circle-modal-body">
                            <form onSubmit={handleCreateGroup}>
                                <div className="form-group-circles">
                                    <label>Group Name *</label>
                                    <input 
                                        type="text" 
                                        className="form-input-circles" 
                                        placeholder="e.g. Pune Shivneri Pilgrims" 
                                        value={newGroupForm.groupName}
                                        onChange={e => setNewGroupForm({...newGroupForm, groupName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group-circles">
                                        <label>Origin City *</label>
                                        <input 
                                            type="text" 
                                            className="form-input-circles" 
                                            placeholder="e.g. Pune" 
                                            value={newGroupForm.sourceLocation}
                                            onChange={e => setNewGroupForm({...newGroupForm, sourceLocation: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group-circles">
                                        <label>Destination City</label>
                                        <input 
                                            type="text" 
                                            className="form-input-circles" 
                                            value="Nashik" 
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group-circles">
                                        <label>Travel Date *</label>
                                        <input 
                                            type="date" 
                                            className="form-input-circles" 
                                            value={newGroupForm.travelDate}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val && val < today) {
                                                    setNewGroupForm({...newGroupForm, travelDate: today});
                                                } else {
                                                    setNewGroupForm({...newGroupForm, travelDate: val});
                                                }
                                            }}
                                            min={today}
                                            required
                                        />
                                    </div>
                                    <div className="form-group-circles">
                                        <label>Mode of Travel</label>
                                        <select 
                                            className="form-input-circles"
                                            value={newGroupForm.travelMode}
                                            onChange={e => setNewGroupForm({...newGroupForm, travelMode: e.target.value})}
                                        >
                                            <option value="Train">Train 🚂</option>
                                            <option value="Bus">Bus 🚌</option>
                                            <option value="Car">Car 🚗</option>
                                            <option value="Flight">Flight ✈️</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group-circles">
                                        <label>Contact Number</label>
                                        <input 
                                            type="tel" 
                                            className="form-input-circles" 
                                            placeholder="Contact number" 
                                            value={newGroupForm.contactNumber}
                                            onChange={e => setNewGroupForm({...newGroupForm, contactNumber: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group-circles">
                                        <label>Max Members</label>
                                        <input 
                                            type="number" 
                                            className="form-input-circles" 
                                            min={2} 
                                            max={50}
                                            value={newGroupForm.maxMembers}
                                            onChange={e => setNewGroupForm({...newGroupForm, maxMembers: parseInt(e.target.value) || 10})}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-circles">
                                    <label>Description & Route Plan</label>
                                    <textarea 
                                        className="form-input-circles" 
                                        rows={3} 
                                        placeholder="Describe your travel itinerary, meeting point, or timing details..."
                                        value={newGroupForm.description}
                                        onChange={e => setNewGroupForm({...newGroupForm, description: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="card-btn" style={{ marginTop: '10px' }}>
                                    Create & Host Group
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ VIEW TRAVEL CIRCLE DETAILS MODAL ══ */}
            {showDetailsModal && selectedGroup && (
                <div className="circle-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="circle-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="circle-modal-header">
                            <h3>{selectedGroup.groupName}</h3>
                            <button className="circle-modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
                        </div>
                        <div className="circle-modal-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', color: '#795d4d' }}>Join Code: <strong style={{ color: '#e65c00', fontSize: '1.1rem' }}>{selectedGroup.groupCode}</strong></p>
                                    <p style={{ margin: 0, color: '#795d4d' }}>Status: <span style={{ color: selectedGroup.status === 'OPEN' ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>{selectedGroup.status}</span></p>
                                </div>
                                {selectedGroup.travelMode && (
                                    <div style={{ background: '#FFF3E0', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', color: '#4a2a18' }}>
                                        <Train size={18}/> {selectedGroup.travelMode}
                                    </div>
                                )}
                            </div>

                            <div className="circle-details-list" style={{ background: '#fdfaf2', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(74,42,24,0.05)', marginBottom: '1.5rem' }}>
                                <div className="circle-detail-row">
                                    <MapPin size={18}/>
                                    <span>Route: <strong>{selectedGroup.sourceLocation}</strong> to <strong>{selectedGroup.destinationLocation || 'Nashik'}</strong></span>
                                </div>
                                <div className="circle-detail-row">
                                    <Calendar size={18}/>
                                    <span>Travel Date: {new Date(selectedGroup.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                {selectedGroup.contactNumber && (
                                    <div className="circle-detail-row">
                                        <Phone size={18}/>
                                        <span>Contact: {selectedGroup.contactNumber}</span>
                                    </div>
                                )}
                                {selectedGroup.description && (
                                    <div style={{ marginTop: '10px', fontSize: '0.95rem', color: '#546E7A', lineHeight: 1.5, borderTop: '1px solid #ffeed1', paddingTop: '10px' }}>
                                        {selectedGroup.description}
                                    </div>
                                )}
                            </div>

                            <div className="members-section">
                                <h5>Group Members ({groupMembers.length} / {selectedGroup.maxMembers || 10})</h5>
                                <div className="members-list-container">
                                    {groupMembers.map((member, i) => (
                                        <div className="member-item-row" key={member.id || i}>
                                            <div className="member-item-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <UserCheck size={16} color="#2e7d32"/>
                                                {member.memberName}
                                            </div>
                                            <div className="member-item-joined">
                                                Joined {new Date(member.joinedAt || member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedGroup.status === 'OPEN' && groupMembers.length < (selectedGroup.maxMembers || 10) && (
                                <div style={{ marginTop: '1.5rem', borderTop: '2px solid #ffeed1', paddingTop: '1.5rem' }}>
                                    <h4 style={{ fontFamily: 'Cinzel, serif', color: '#4a2a18', fontSize: '1.1rem', marginBottom: '15px' }}>Join this Travel Circle</h4>
                                    <form onSubmit={handleJoinSelectedGroup}>
                                        {user ? (
                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#795d4d', marginBottom: '10px' }}>
                                                    Joining as logged-in pilgrim: <strong>{user.name}</strong>
                                                </div>
                                                <div className="form-group-circles" style={{ marginBottom: 0 }}>
                                                    <label>Phone Number *</label>
                                                    <input 
                                                        type="tel" 
                                                        className="form-input-circles" 
                                                        placeholder="Enter your phone number" 
                                                        value={joinForm.memberPhone}
                                                        maxLength={10}
                                                        onKeyDown={(e) => {
                                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={e => {
                                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                                            if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                                                                val = '';
                                                            }
                                                            setJoinForm({...joinForm, memberPhone: val});
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                                <div className="form-group-circles" style={{ marginBottom: 0 }}>
                                                    <label>Your Name *</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-input-circles" 
                                                        placeholder="Enter your name" 
                                                        value={joinForm.memberName}
                                                        onChange={e => setJoinForm({...joinForm, memberName: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group-circles" style={{ marginBottom: 0 }}>
                                                    <label>Phone Number *</label>
                                                    <input 
                                                        type="tel" 
                                                        className="form-input-circles" 
                                                        placeholder="Enter phone" 
                                                        value={joinForm.memberPhone}
                                                        maxLength={10}
                                                        onKeyDown={(e) => {
                                                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        onChange={e => {
                                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                                            if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                                                                val = '';
                                                            }
                                                            setJoinForm({...joinForm, memberPhone: val});
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <button type="submit" className="card-btn" style={{ background: '#e65c00' }}>
                                            Confirm & Join Group
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TravelPage;


