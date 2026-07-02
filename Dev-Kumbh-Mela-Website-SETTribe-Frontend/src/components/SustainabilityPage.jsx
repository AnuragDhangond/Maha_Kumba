import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/SustainabilityPage.css';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Flame, Train, Users, Bike, Recycle, Droplets, ShoppingBag, Heart, ShieldCheck, MapPin, Wind, Leaf, Sparkles, ExternalLink } from 'lucide-react';
import wholeKumbh from '../assets/whole_kumbh_mela.png';
import HeadingOrnament from './HeadingOrnament';

// Custom icons for bins
const createBinIcon = (color) => {
    return L.divIcon({
        className: 'bin-marker',
        html: `<div class="bin-pin" style="background-color: ${color}">
                 <div class="bin-dot"></div>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });
};

const binLocations = [
    { id: 1, name: "Ramkund North Bin", type: "mixed", coords: [20.0058, 73.7895], status: "Active" },
    { id: 2, name: "Gautami Ghat Point", type: "wet", coords: [20.0045, 73.7885], status: "Active" },
    { id: 3, name: "Kalaram Temple Entry", type: "dry", coords: [20.0069, 73.7915], status: "Active" },
    { id: 4, name: "Tapovan Main Camp", type: "mixed", coords: [20.0069, 73.8166], status: "Active" },
    { id: 5, name: "Panchavati Police Chowki", type: "dry", coords: [20.0080, 73.7900], status: "Active" },
    { id: 6, name: "Nashik Road Rly Station", type: "mixed", coords: [19.9575, 73.8290], status: "Active" },
    { id: 7, name: "Sadhugram Tapovan Ext.", type: "wet", coords: [20.0075, 73.8220], status: "Active" },
    { id: 8, name: "Sadhugram Nilgiri Baug", type: "mixed", coords: [20.0102, 73.8295], status: "Active" },
    { id: 9, name: "CBS Main Bus Stand", type: "dry", coords: [19.9984, 73.7844], status: "Active" },
    { id: 10, name: "Dwarka Circle Point", type: "mixed", coords: [19.9912, 73.7995], status: "Active" },
    { id: 11, name: "Gangapur Dam Road Ghat", type: "wet", coords: [20.0210, 73.7550], status: "Full" },
    { id: 12, name: "Trimbakeshwar Main Entry", type: "mixed", coords: [19.9400, 73.5350], status: "Active" }
];


const SustainabilityPage = () => {
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleLangChange = () => setLang(localStorage.getItem('preferredLang') || 'en');
        window.addEventListener('langchange', handleLangChange);
        return () => window.removeEventListener('langchange', handleLangChange);
    }, []);

    const { t } = useTranslation();

    const [mapCenter] = useState([20.000, 73.780]); // Adjusted to show more of Nashik
    const [zoom] = useState(13); // Lower zoom to see all points

    return (
        <div className="sustainability-container">
            <section className="sustainability-hero">
                <div className="hero-content">
                    <h1>{t('sustainabilityHero')}</h1>
                    <HeadingOrnament variant="trishul" />
                    <p className="hero-subtitle">{t('sustainabilityHeroSub')}</p>
                </div>
            </section>

            <section className="sustainability-section">
                <div className="section-header-center" style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 className="section-title">{t('ecoFriendlyTravelTitle')}</h2>
                    <p style={{ color: '#666', maxWidth: '700px', margin: '15px auto' }}>{t('chooseSustainableSub')}</p>
                </div>

                <div className="section-grid">
                    <div className="sustainability-card">
                        <div className="card-icon"><Train size={32} /></div>
                        <h3 className="card-title">{t('usePublicTransport')}</h3>
                        <p className="card-text">{t('publicTransportDesc')}</p>
                    </div>

                    <div className="sustainability-card">
                        <div className="card-icon"><Users size={32} /></div>
                        <h3 className="card-title">{t('carpoolingTitle')}</h3>
                        <p className="card-text">{t('carpoolingDesc')}</p>
                    </div>

                    <div className="sustainability-card">
                        <div className="card-icon"><Bike size={32} /></div>
                        <h3 className="card-title">{t('localNatureTransport')}</h3>
                        <p className="card-text">{t('localNatureDesc')}</p>
                    </div>
                </div>
            </section>

            <div className="guide-banner">
                <h2>{t('mindfulPracticesBanner')}</h2>
                <p>{t('mindfulPracticesSub')}</p>
            </div>

            <section className="sustainability-section">
                <div className="section-grid" style={{ marginTop: '0' }}>
                    <div className="sustainability-card">
                        <div className="card-icon"><Recycle size={32} /></div>
                        <h3 className="card-title">{t('properWasteDisposal')}</h3>
                        <div className="card-text">
                            {(() => {
                                const desc = t('wasteDisposalDesc') || "";
                                if (lang === 'en' && desc.includes('Green') && desc.includes('Blue')) {
                                    const parts = desc.split('Green');
                                    const subParts = parts[1].split('Blue');
                                    return (
                                        <>
                                            {parts[0]}
                                            <span style={{ color: '#2d5a27', fontWeight: 'bold' }}> Green</span> 
                                            {subParts[0]}
                                            <span style={{ color: '#1a73e8', fontWeight: 'bold' }}> Blue</span>
                                            {subParts[1]}
                                        </>
                                    );
                                }
                                return desc;
                            })()}
                        </div>
                    </div>

                    <div className="sustainability-card">
                        <div className="card-icon"><Droplets size={32} /></div>
                        <h3 className="card-title">{t('respectHolyRiver')}</h3>
                        <p className="card-text">{t('respectRiverDesc')}</p>
                    </div>

                    <div className="sustainability-card">
                        <div className="card-icon"><ShoppingBag size={32} /></div>
                        <h3 className="card-title">{t('zeroPlasticMindset')}</h3>
                        <p className="card-text">{t('zeroPlasticDesc')}</p>
                    </div>
                </div>
            </section>

            <section className="donation-section">
                <div className="donation-grid">
                    <div className="donation-info">
                        <h2 className="donation-title">{t('consciousDonationTitle')}</h2>
                        <p style={{ marginBottom: '30px', color: '#666' }}>{t('consciousDonationSub')}</p>

                        <ul className="donation-list">
                            <li>{t('donationTip1')}</li>
                            <li>{t('donationTip2')}</li>
                            <li>{t('donationTip3')}</li>
                            <li>{t('donationTip4')}</li>
                            <li>{t('donationTip5')}</li>
                        </ul>
                    </div>
                    <div className="donation-visual" style={{ textAlign: 'center' }}>
                        <img
                            src={wholeKumbh}
                            alt="Sacred Kumbh Collective"
                            style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                        />
                    </div>
                </div>
            </section>

            <section id="disposal-map" className="waste-map-section">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="live-status-pill"><Sparkles size={14} /> {t('liveReceptacleTracking')}</div>
                    <h2 className="map-title">{t('disposalManagementMap')}</h2>
                    <p style={{ color: '#666', marginTop: '10px' }}>{t('locateBinsSub')}</p>
                </div>

                <div className="map-view-wrapper glass-panel">
                    <div className="map-container-inner">
                        <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }} attributionControl={false}>
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />
                            {binLocations.map(bin => (
                                <Marker 
                                    key={bin.id} 
                                    position={bin.coords} 
                                    icon={createBinIcon(bin.type === 'wet' ? '#00C853' : bin.type === 'dry' ? '#2979FF' : '#FF9100')}
                                >
                                    <Popup>
                                        <div className="bin-popup">
                                            <h4 style={{ margin: '0 0 5px 0' }}>{bin.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem' }}>{t('typeLabel')} <strong>{bin.type.toUpperCase()}</strong></p>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: bin.status === 'Full' ? '#e53e3e' : '#38a169', fontWeight: 'bold' }}>
                                                {t('liveCrowdStatus')}: {bin.status}
                                            </p>
                                        </div>
                                    </Popup>
                                    <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                                        <span>{bin.name}</span>
                                    </Tooltip>
                                </Marker>
                            ))}
                        </MapContainer>
                        
                        <a 
                            href="https://www.google.com/maps/search/dustbins+in+panchavati+nashik/@20.0051,73.7896,15z" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="google-maps-redirect"
                        >
                            <ExternalLink size={14} /> {t('viewGoogleMaps')}
                        </a>
                    </div>
                </div>

                <div className="bin-legend">
                    <div className="legend-item">
                        <div className="bin-color-box" style={{ background: '#00C853' }}></div>
                        <span>{t('greenBinWet')}</span>
                    </div>
                    <div className="legend-item">
                        <div className="bin-color-box" style={{ background: '#2979FF' }}></div>
                        <span>{t('blueBinDry')}</span>
                    </div>
                    <div className="legend-item">
                        <div className="bin-color-box" style={{ background: '#FF9100' }}></div>
                        <span>{t('otherDisposalPoint')}</span>
                    </div>
                </div>
            </section>

            {/* ══ CAMPAIGN BANNER ══ */}
            <section className="campaign-banner">
                <h2 className="campaign-title">{t('joinConsciousKumbh')}</h2>
                <p className="campaign-subtitle">{t('protectSacredSub')}</p>

                <div className="campaign-grid">
                    <div className="campaign-item">
                        <i><ShieldCheck size={48} /></i>
                        <h4>{t('reusableVessels')}</h4>
                        <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>{t('reusableVesselsDesc')}</p>
                    </div>
                    <div className="campaign-item">
                        <i><ShoppingBag size={48} /></i>
                        <h4>{t('cottonClothBags')}</h4>
                        <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>{t('cottonBagsDesc')}</p>
                    </div>
                    <div className="campaign-item">
                        <i><Wind size={48} /></i>
                        <h4>{t('supportEcoVendors')}</h4>
                        <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>{t('ecoVendorsDesc')}</p>
                    </div>
                    <div className="campaign-item">
                        <i><Heart size={48} /></i>
                        <h4>{t('mindfulInfluence')}</h4>
                        <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>{t('mindfulInfluenceDesc')}</p>
                    </div>
                </div>


            </section>
        </div>
    );
};

export default SustainabilityPage;
