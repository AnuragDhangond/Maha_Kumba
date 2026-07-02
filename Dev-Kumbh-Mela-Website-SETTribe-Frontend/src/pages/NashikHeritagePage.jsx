import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/NashikHeritagePage.css';
import HeadingOrnament from '../components/HeadingOrnament';
import axiosInstance from '../api/axiosConfig';

// Fallback background image if none is provided
import fallbackHeroBg from '../assets/history-hero-hd.png';

import ramkundImg from '../assets/ramkund.webp';
import trimbakeshwarImg from '../assets/trimbakeshwar.webp';
import godavariImg from '../assets/godavari_river_hero.webp';
import holyDipImg from '../assets/holy_dip_real.webp';
import spiritualBgImg from '../assets/spiritual_bg.webp';
import templeCrowdImg from '../assets/temple_crowd_card.webp';
import sadhuEventImg from '../assets/sadhu_event.webp';
import kalaramImg from '../assets/kalaram.webp';
import nandiniImg from '../assets/sacred_ghat_card.webp';
import snanEventImg from '../assets/snan_event.webp';

import T from '../components/DynamicText';

const sacredGhats = [
    {
        id: 1,
        title: "Ramkund",
        location: "Panchavati, Nashik (on the Godavari)",
        description: "The holiest urban ghat of the Kumbh. Believed to be where Lord Rama bathed during his exile. Primary site for Pitru Tarpana (ancestral rites) and the focal point of Simhastha processions.",
        image: ramkundImg,
        highlights: [
            "Hosts the main Shahi Snan processions.",
            "Expect heavy crowds, especially at dawn.",
            "Multiple bathing ghats, security checkpoints, and volunteer stations are set up."
        ]
    },
    {
        id: 2,
        title: "Kushavarta Tirtha",
        location: "Trimbakeshwar town, ~30 km from Nashik",
        description: "Sacred kund where the Godavari is believed to have re-emerged after Sage Gautama's penance. Regarded as the actual origin point of the Godavari for ritual purposes.",
        image: trimbakeshwarImg,
        highlights: [
            "Focus of Shaiva akhada processions.",
            "The kund area is heavily regulated — entry by timed batches.",
            "Long queues expected; arrive before dawn for the best experience."
        ]
    },
    {
        id: 3,
        title: "Ganga Ghat",
        location: "Panchavati, Nashik",
        description: "Named for the belief that the Godavari carries the essence of the Ganga in the south. Adjacent to Ramkund and used for overflow during peak bathing hours.",
        image: godavariImg,
        highlights: [
            "Serves as an extension of the Ramkund bathing zone.",
            "Well-lit with dedicated volunteer guides and accessible ramps for elderly pilgrims."
        ]
    },
    {
        id: 4,
        title: "Lakshminarayan Ghat",
        location: "Near Ramkund, Nashik",
        description: "A quieter ghat downstream of Ramkund, associated with Vishnu worship. Used for puja and tarpana rituals. The adjacent Lakshminarayan temple adds to its sacred character.",
        image: holyDipImg,
        highlights: [
            "Recommended for pilgrims who prefer a calmer environment.",
            "Ideal for families with children.",
            "Volunteer-aided bathing assistance available."
        ]
    },
    {
        id: 5,
        title: "Kapila Sangam",
        location: "Tapovan, Nashik",
        description: "The confluence of the Kapila river with the Godavari. Sangam points are considered especially potent for spiritual purification. Linked to Sage Kapila's ashram.",
        image: snanEventImg,
        highlights: [
            "Popular among sadhus for morning rituals.",
            "Limited infrastructure, so bring your own essentials.",
            "Best reached early morning before the crowds arrive."
        ]
    },
    {
        id: 6,
        title: "Ahilya Ghat",
        location: "Panchavati, Nashik",
        description: "Named after Ahilyabai Holkar, the Maratha queen who renovated many ghats and temples in Nashik. A well-maintained ghat used for daily and Kumbh bathing.",
        image: templeCrowdImg,
        highlights: [
            "Well-maintained with good lighting and security.",
            "Close to Ramkund but less chaotic.",
            "Suitable for pilgrims who want easy access without the peak-hour crush."
        ]
    },
    {
        id: 7,
        title: "Nath Ghat",
        location: "Near Panchavati, Nashik",
        description: "Associated with the Nath Sampradaya tradition of Shaiva ascetics. Used by Nath sadhus for ritual bathing and meditation during the Kumbh.",
        image: sadhuEventImg,
        highlights: [
            "Primarily used by Nath sect sadhus.",
            "Public access may be limited during processions.",
            "A culturally rich site to observe traditional ascetic practices."
        ]
    },
    {
        id: 8,
        title: "Tapovan Ghat",
        location: "Tapovan, Nashik (on the Godavari)",
        description: "Linked to the Ramayana — where Lakshmana performed tapas. The Kapila-Godavari confluence makes this a sacred area.",
        image: kalaramImg,
        highlights: [
            "Important site for meditation and quieter bathing rituals away from the main city center."
        ]
    },
    {
        id: 9,
        title: "Nandini Sangam",
        location: "Near Trimbakeshwar road, Nashik",
        description: "Confluence of the Nandini tributary with the Godavari. A less-known but ritually important sangam site.",
        image: nandiniImg,
        highlights: [
            "Quieter spot preferred by locals and specific sects for specialized rituals."
        ]
    }
];


const NashikHeritagePage = () => {
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    
    // Dynamic State
    const [historyData, setHistoryData] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [saints, setSaints] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedGhats, setExpandedGhats] = useState({});
    const [playingVideoId, setPlayingVideoId] = useState(null);
    const [playingHighlightId, setPlayingHighlightId] = useState(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [selectedGhat, setSelectedGhat] = useState(null);
    const [selectedAkhada, setSelectedAkhada] = useState('ALL');

    const toggleGhatExpand = (id) => {
        setExpandedGhats(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    useEffect(() => {
        const handleLangChange = () => setLang(localStorage.getItem('preferredLang') || 'en');
        window.addEventListener('langchange', handleLangChange);
        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);

    useEffect(() => {
        const fetchDynamicData = async () => {
            try {
                setLoading(true);
                const timestamp = new Date().getTime();
                const [histRes, highRes, saintsRes, placesRes] = await Promise.all([
                    axiosInstance.get(`/api/public/heritage/history?page=0&size=100&_t=${timestamp}`),
                    axiosInstance.get(`/api/public/heritage/highlights?page=0&size=100&_t=${timestamp}`),
                    axiosInstance.get(`/api/public/heritage/saints?page=0&size=100&_t=${timestamp}`),
                    axiosInstance.get(`/api/public/heritage/places?page=0&size=100&_t=${timestamp}`)
                ]);
                
                // Helper to extract data from array or paginated object
                const extractData = (res) => {
                    if (res.data && res.data.content !== undefined) return res.data.content;
                    return Array.isArray(res.data) ? res.data : [];
                };

                setHistoryData(extractData(histRes));
                setHighlights(extractData(highRes));
                setSaints(extractData(saintsRes));
                setPlaces(extractData(placesRes));
            } catch (error) {
                console.error("Error fetching heritage data from backend:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDynamicData();
    }, []);

    const { t } = useTranslation();

    const getEmbedUrl = (url) => {
        if (!url) return '';
        try {
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${videoId}`;
            }
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                const videoId = urlObj.searchParams.get('v');
                return `https://www.youtube.com/embed/${videoId}`;
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        try {
            if (url.includes('youtu.be/')) {
                return url.split('youtu.be/')[1].split('?')[0];
            }
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('v');
            }
            if (url.includes('youtube.com/embed/')) {
                return url.split('youtube.com/embed/')[1].split('?')[0];
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    if (loading) {
        return <div className="heritage-page" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2><T>Loading Heritage Data...</T></h2></div>;
    }

    // Default main history object
    const mainHistory = historyData.length > 0 ? historyData[0] : null;

    // Dynamic lists for Saints directory
    const uniqueAkhadas = ['ALL', ...Array.from(new Set(saints.map(saint => saint.akhada).filter(Boolean)))];
    const filteredSaints = selectedAkhada === 'ALL' 
        ? saints 
        : saints.filter(saint => saint.akhada === selectedAkhada);

    return (
        <div className="heritage-page">
            {/* Hero Section */}
            <header className="heritage-hero" style={{ backgroundImage: `url(${fallbackHeroBg})` }}>
                <div className="heritage-hero-overlay"></div>
                <div className="hero-content fade-in-up">
                    <h1 className="hero-title">{t('heritageHeroTitle')}</h1>
                    <HeadingOrnament variant="dot" />
                    <p className="hero-subtitle">{t('heritageHeroSubtitle')}</p>
                </div>
            </header>

            {/* Sacred Chronicles & Legacy Section */}
            {historyData.length > 0 && (
                <section className="heritage-section bg-light history-section">
                    <div className="section-head text-center">
                        <h2><T>SACRED ORIGINS & LEGENDS</T></h2>
                        <div className="underline"></div>
                        <p><T>Explore the divine tales, celestial alignments, and rich history that define the spiritual essence of Nashik.</T></p>
                    </div>

                    <div className="history-cards-grid">
                        {historyData.map((historyItem) => {
                            const ytId = getYoutubeId(historyItem.videoUrl);
                            const resolvedImg = ytId 
                                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                                : (historyItem.backgroundImage
                                    ? (historyItem.backgroundImage.includes('localhost:5173/src/')
                                        ? historyItem.backgroundImage.replace('http://localhost:5173/src/', '/src/').replace('.png', '.webp')
                                        : (historyItem.backgroundImage.startsWith('http')
                                            ? historyItem.backgroundImage
                                            : `${axiosInstance.defaults.baseURL}${historyItem.backgroundImage.startsWith('/') ? '' : '/'}${historyItem.backgroundImage}`))
                                    : fallbackHeroBg);

                            const isPlaying = playingVideoId === historyItem.id;

                            return (
                                <div className="history-card" key={historyItem.id}>
                                    <div className="history-card-media">
                                        {isPlaying ? (
                                            <>
                                                <iframe
                                                    src={`${getEmbedUrl(historyItem.videoUrl)}?autoplay=1`}
                                                    title={historyItem.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    sandbox="allow-scripts allow-same-origin allow-presentation"
                                                    allowFullScreen
                                                    className="history-card-iframe"
                                                ></iframe>
                                                <button className="stop-video-btn" onClick={() => setPlayingVideoId(null)} aria-label="Stop video">
                                                    &times;
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <img 
                                                    src={resolvedImg} 
                                                    alt={historyItem.title} 
                                                    className="history-card-img" 
                                                />
                                                {historyItem.videoUrl && (
                                                    <div className="history-card-video-overlay" onClick={() => setPlayingVideoId(historyItem.id)}>
                                                        <button className="play-btn" aria-label="Play video">
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="history-card-content">
                                        <h3 className="history-card-title"><T>{historyItem.heading || historyItem.title}</T></h3>
                                        <h4 className="history-card-subtitle"><T>{historyItem.subtitle}</T></h4>
                                        <p className="history-card-text">
                                            <T>{historyItem.paragraph1}</T>
                                        </p>
                                        <div className="history-card-actions">
                                            <button className="btn-read-more" onClick={() => setSelectedHistoryItem(historyItem)}>
                                                <T>Read Full Legend</T>
                                            </button>
                                            {historyItem.videoUrl && (
                                                <button 
                                                    className={isPlaying ? "btn-watch-video playing" : "btn-watch-video"} 
                                                    onClick={() => setPlayingVideoId(isPlaying ? null : historyItem.id)}
                                                >
                                                    {isPlaying ? (
                                                        <>
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                                                                <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                                                            </svg>
                                                            <T>Stop Video</T>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                                                            </svg>
                                                            <T>Watch Video</T>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail Modal Overlay */}
                    {selectedHistoryItem && (
                        <div className="history-detail-modal" onClick={() => setSelectedHistoryItem(null)}>
                            <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="close-modal-btn" onClick={() => setSelectedHistoryItem(null)}>&times;</button>
                                <h2><T>{selectedHistoryItem.heading || selectedHistoryItem.title}</T></h2>
                                <h3><T>{selectedHistoryItem.subtitle}</T></h3>
                                <div className="detail-modal-body">
                                    {selectedHistoryItem.paragraph1 && <p><T>{selectedHistoryItem.paragraph1}</T></p>}
                                    {selectedHistoryItem.paragraph2 && <p><T>{selectedHistoryItem.paragraph2}</T></p>}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Past Events Highlights Section */}
            {highlights.length > 0 && (
                <section className="heritage-section past-events-section bg-pattern">
                    <div className="section-head text-center">
                        <h2>{t('pastHighlightsTitle')}</h2>
                        <div className="underline"></div>
                        <p>{t('reliveDivineMoments')}</p>
                    </div>

                    <div className="highlights-cards-grid">
                        {highlights.map((event) => {
                            const ytId = getYoutubeId(event.videoUrl);
                            const resolvedImg = ytId 
                                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                                : (event.thumbnailImage
                                    ? (event.thumbnailImage.includes('localhost:5173/src/')
                                        ? event.thumbnailImage.replace('http://localhost:5173/src/', '/src/').replace('.png', '.webp')
                                        : (event.thumbnailImage.startsWith('http')
                                            ? event.thumbnailImage
                                            : `${axiosInstance.defaults.baseURL}${event.thumbnailImage.startsWith('/') ? '' : '/'}${event.thumbnailImage}`))
                                    : fallbackHeroBg);

                            const isPlaying = playingHighlightId === event.id;

                            return (
                                <div className="highlight-card" key={event.id}>
                                    <div className="highlight-card-media">
                                        {isPlaying ? (
                                            <>
                                                <iframe
                                                    src={`${getEmbedUrl(event.videoUrl)}?autoplay=1`}
                                                    title={event.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    sandbox="allow-scripts allow-same-origin allow-presentation"
                                                    allowFullScreen
                                                    className="highlight-card-iframe"
                                                ></iframe>
                                                <button className="stop-video-btn" onClick={() => setPlayingHighlightId(null)} aria-label="Stop video">
                                                    &times;
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <img 
                                                    src={resolvedImg} 
                                                    alt={event.title} 
                                                    className="highlight-card-img" 
                                                />
                                                <div className="highlight-card-year">{event.year}</div>
                                                {event.videoUrl && (
                                                    <div className="highlight-card-video-overlay" onClick={() => setPlayingHighlightId(event.id)}>
                                                        <button className="play-btn" aria-label="Play video">
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="highlight-card-content">
                                        <h3 className="highlight-card-title"><T>{event.title}</T></h3>
                                        <p className="highlight-card-text"><T>{event.description}</T></p>
                                        {event.videoUrl && (
                                            <div className="highlight-card-actions">
                                                <button 
                                                    className={isPlaying ? "btn-watch-video playing" : "btn-watch-video"} 
                                                    onClick={() => setPlayingHighlightId(isPlaying ? null : event.id)}
                                                >
                                                    {isPlaying ? (
                                                        <>
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                                                                <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                                                            </svg>
                                                            <T>Stop Video</T>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                                                            </svg>
                                                            <T>Watch Video</T>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Directory of Saints Section */}
            {saints.length > 0 && (
                <section className="heritage-section saints-section bg-premium">
                    <div className="section-head text-center light-text">
                        <h2>{t('directorySaints')} ({filteredSaints.length})</h2>
                        <p>{t('discoverSaintsSub')}</p>
                        <div className="underline light-underline"></div>
                    </div>

                    <div className="akhada-filters">
                        {uniqueAkhadas.map((akhada) => (
                            <button
                                key={akhada}
                                className={`akhada-filter-btn ${selectedAkhada === akhada ? 'active' : ''}`}
                                onClick={() => setSelectedAkhada(akhada)}
                            >
                                <T>{akhada === 'ALL' ? 'All Saints' : akhada}</T>
                            </button>
                        ))}
                    </div>

                    <div className="saints-grid">
                        {filteredSaints.map((saint) => (
                            <div className="saint-card" key={saint.id}>
                                <div className="saint-photo-container">
                                    <img 
                                        src={saint.image ? (saint.image.startsWith('http') ? saint.image : `${axiosInstance.defaults.baseURL}${saint.image.startsWith('/') ? '' : '/'}${saint.image}`) : ''} 
                                        alt={saint.name} 
                                        className="saint-photo" 
                                    />
                                </div>
                                <div className="saint-info">
                                    <h3><T>{saint.name}</T></h3>
                                    <span className="saint-akhada"><T>{saint.akhada}</T></span>
                                    <p className="saint-desc"><T>{saint.description}</T></p>
                                    <span className="saint-role-badge"><T>{saint.role}</T></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="akhada-info-box">
                        <h3>{t('sacredAkhadasTitle')}</h3>
                        <p>{t('akhadaInfoDesc')}</p>
                    </div>
                </section>
            )}

            {/* Sacred Ghats & Sangams Section */}
            <section className="heritage-section bg-premium-alt">
                <div className="section-head text-center light-text">
                    <h2><T>SACRED GHATS & SANGAMS</T></h2>
                    <div className="underline light-underline"></div>
                </div>

                <div className="ghats-grid">
                    {sacredGhats.map((ghat) => (
                        <div className="ghat-card" key={ghat.id}>
                            <div className="ghat-image-wrapper">
                                <img src={ghat.image} alt={ghat.title} className="ghat-image" />
                            </div>
                            <div className="ghat-content">
                                <h3 className="ghat-title"><T>{ghat.title}</T></h3>
                                <div className="ghat-location">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
                                    <span><T>{ghat.location}</T></span>
                                </div>
                                <p className="ghat-description"><T>{ghat.description}</T></p>
                                
                                <div 
                                    className="ghat-expand-toggle" 
                                    onClick={() => setSelectedGhat(ghat)}
                                >
                                    <T>During Kumbh</T>
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"></path></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ghat Details Modal Overlay */}
                {selectedGhat && (
                    <div className="history-detail-modal" onClick={() => setSelectedGhat(null)}>
                        <div className="detail-modal-content ghat-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-modal-btn" onClick={() => setSelectedGhat(null)}>&times;</button>
                            <div className="modal-ghat-image-container">
                                <img src={selectedGhat.image} alt={selectedGhat.title} className="modal-ghat-image" />
                            </div>
                            <h2><T>{selectedGhat.title}</T></h2>
                            <div className="ghat-location">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path></svg>
                                <span><T>{selectedGhat.location}</T></span>
                            </div>
                            <div className="detail-modal-body">
                                <p><T>{selectedGhat.description}</T></p>
                                
                                {selectedGhat.highlights && selectedGhat.highlights.length > 0 && (
                                    <div className="ghat-highlight-box">
                                        <div className="ghat-highlight-title">
                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M256 32L20.12 365.9c-8.98 12.7-10.45 29.5-3.83 43.4S37.5 432 52.17 432h407.7c14.6 0 28.5-8.4 35.8-22.7s5.1-30.7-3.8-43.4L256 32zm0 82.6l165.6 234.4H90.44L256 114.6zM240 216v72h32v-72h-32zm0 104v32h32v-32h-32z"></path></svg>
                                            <h4><T>During Kumbh Mela Information</T></h4>
                                        </div>
                                        <ul className="ghat-highlight-list">
                                            {selectedGhat.highlights.map((item, index) => (
                                                <li key={index}><T>{item}</T></li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Important Cultural Places */}
            {places.length > 0 && (
                <section className="heritage-section bg-premium">
                    <div className="section-head text-center light-text">
                        <h2>{t('spiritualPillarsTitle')} ({places.length})</h2>
                        <div className="underline light-underline"></div>
                        <p>{t('culturalLandmarksSub')}</p>
                    </div>

                    <div className="places-grid">
                        {places.map((place, index) => (
                            <div className="place-card" key={place.id}>
                                <div className="place-image-wrapper">
                                    <img 
                                        src={place.image ? (place.image.startsWith('http') ? place.image : `${axiosInstance.defaults.baseURL}${place.image.startsWith('/') ? '' : '/'}${place.image}`) : ''} 
                                        alt={place.placeName} 
                                        className="place-image" 
                                    />
                                    <div className="place-number">0{index + 1}</div>
                                </div>
                                <div className="place-content">
                                    <h3><T>{place.placeName}</T></h3>
                                    <p><T>{place.description}</T></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default NashikHeritagePage;
