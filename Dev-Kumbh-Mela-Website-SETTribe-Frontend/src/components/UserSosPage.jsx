import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AlertTriangle,
    Phone,
    Shield,
    Truck,
    MapPin,
    User,
    Clock,
    ChevronRight,
    HeartPulse,
    Flame,
    Users,
    Info,
    XCircle
} from 'lucide-react';
import { emergencyService } from '../api/services/emergencyService';
import HeadingOrnament from './HeadingOrnament';
import Swal from 'sweetalert2';
import '../styles/SosPage.css';

const SosPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeSOS, setActiveSOS] = useState(JSON.parse(localStorage.getItem('activeSOS')) || null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Initial check for state trigger
    useEffect(() => {
        if (location.state?.triggerSOS) {
            handleQuickSOS();
            // Clear state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    // Status Polling for active SOS
    useEffect(() => {
        let interval;
        if (activeSOS && activeSOS.status?.toLowerCase() !== 'resolved') {
            interval = setInterval(async () => {
                try {
                    const response = await emergencyService.getEmergencyStatus(activeSOS.alertId);
                    if (response.status === 200) {
                        const updatedData = response.data;
                        setActiveSOS(updatedData);
                        localStorage.setItem('activeSOS', JSON.stringify(updatedData));

                        if (updatedData.status?.toLowerCase() === 'resolved') {
                            Swal.fire({
                                title: t('resolvedStatusText') || 'Emergency Resolved',
                                text: 'Help has arrived and the situation is marked as resolved. Stay safe!',
                                icon: 'success',
                                confirmButtonColor: '#2E7D32'
                            });
                            setTimeout(() => {
                                localStorage.removeItem('activeSOS');
                                setActiveSOS(null);
                            }, 5000);
                        }
                    }
                } catch (error) {
                    console.error("SOS status poll failed", error);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [activeSOS, t]);

    const handleQuickSOS = () => {
        Swal.fire({
            title: `<span style="color: #D32F2F; font-weight: 800; font-family: Cinzel, serif;">🚨 ${t('emergencySosTitle') || 'EMERGENCY SOS'}</span>`,
            text: t('sosConfirmation') || 'Are you sure you want to broadcast your current coordinates?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D32F2F',
            cancelButtonColor: '#795d4d',
            confirmButtonText: t('broadcastAlert') || 'BROADCAST ALERT',
            cancelButtonText: t('ignore') || 'IGNORE',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                startSOSProcess('General Emergency');
            }
        });
    };

    const startSOSProcess = (type) => {
        if (!navigator.geolocation) {
            Swal.fire('Error', 'Geolocation not supported', 'error');
            return;
        }

        setIsBroadcasting(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                sendSOSToControlRoom(latitude, longitude, type);
            },
            (err) => {
                setIsBroadcasting(false);
                Swal.fire(t('locationError') || 'Location Error', t('failedToGetCoordinates') || 'Failed to get GPS', 'error');
            }
        );
    };

    const sendSOSToControlRoom = async (lat, lon, type) => {
        try {
            const response = await emergencyService.createEmergency({
                latitude: lat,
                longitude: lon,
                emergencyType: type
            });
            const data = response.data;
            setActiveSOS(data);
            localStorage.setItem('activeSOS', JSON.stringify(data));
            setIsBroadcasting(false);

            Swal.fire({
                title: t('emergencySignalReceived') || 'SIGNAL RECEIVED',
                text: t('emergencyUrgentStatus') || 'Authorities have been notified.',
                icon: 'success',
                confirmButtonColor: '#2E7D32'
            });
        } catch (error) {
            setIsBroadcasting(false);
            Swal.fire(t('offlineAlert') || 'Offline', t('serverConnectionFailed') || 'Failed to connect', 'error');
        }
    };

    const emergencyActions = [
        {
            id: 'medical',
            label: t('medical') || 'Medical',
            icon: <HeartPulse size={32} />,
            desc: 'Ambulance & Doctor',
            color: '#ef4444',
            bg: '#fef2f2',
            type: 'Medical'
        },
        {
            id: 'police',
            label: 'Security',
            icon: <Shield size={32} />,
            desc: 'Police & Security',
            color: '#2563eb',
            bg: '#eff6ff',
            type: 'Police'
        },
        {
            id: 'fire',
            label: t('fire') || 'Fire',
            icon: <Flame size={32} />,
            desc: 'Fire Brigade',
            color: '#f97316',
            bg: '#fff7ed',
            type: 'Fire'
        },
        {
            id: 'lost',
            label: t('lostPerson') || 'Lost Person',
            icon: <Users size={32} />,
            desc: 'Missing People',
            color: '#8b5cf6',
            bg: '#f5f3ff',
            type: 'Lost Person'
        }
    ];

    const helplines = [
        { name: 'Mela Control Room', number: '1077', icon: <Phone size={20} /> },
        { name: 'Ambulance', number: '108', icon: <Truck size={20} /> },
        { name: 'Police', number: '100', icon: <Shield size={20} /> },
        { name: 'Fire Station', number: '101', icon: <Flame size={20} /> },
        { name: 'Child Helpline', number: '1098', icon: <Users size={20} /> }
    ];

    return (
        <div className="sos-page">
            {/* ══ HERO SECTION ══ */}
            <section className="sos-hero">
                <div className="sos-hero-overlay"></div>
                <div className="sos-hero-content animate-fade-in-up">
                    <div className="sos-badge">
                        <AlertTriangle size={16} />
                        <span>EMERGENCY ASSISTANCE</span>
                    </div>
                    <h1 className="sos-title">{t('emergencySosTitle') || 'EMERGENCY SOS'}</h1>
                    <HeadingOrnament variant="leaf" />
                    <p className="sos-subtitle">
                        Immediate assistance for pilgrims. Signal the Nashik Mela Control Room instantly.
                    </p>
                </div>
            </section>

            <div className="sos-container">
                {/* ══ ACTIVE STATUS PANEL ══ */}
                {activeSOS && (
                    <div className="active-status-panel animate-pulse-border">
                        <div className="status-header">
                            <div className="status-indicator">
                                <div className="status-dot-pulsing"></div>
                                <span>{activeSOS.status?.toUpperCase() || 'BROADCASTING'}</span>
                            </div>
                            <span className="tracking-id">ID: {activeSOS.alertId}</span>
                        </div>
                        <div className="status-body">
                            <h3>{t('helpOnWay') || 'Aid is En Route'}</h3>
                            <p>{t('emergencyUrgentStatus') || 'Your coordinates are being tracked. Please stay where you are.'}</p>
                            <div className="status-progress">
                                <div className="progress-step active">Signal</div>
                                <div className={`progress-step ${['accepted', 'resolving', 'resolved'].includes(activeSOS.status?.toLowerCase()) ? 'active' : ''}`}>Accepted</div>
                                <div className={`progress-step ${activeSOS.status?.toLowerCase() === 'resolved' ? 'active' : ''}`}>Resolved</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ MAIN SOS ACTION ══ */}
                {!activeSOS && (
                    <div className="main-sos-action-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="sos-button-wrapper" onClick={handleQuickSOS}>
                            <div className="sos-ring ring-1"></div>
                            <div className="sos-ring ring-2"></div>
                            <div className="sos-ring ring-3"></div>
                            <button className={`massive-sos-btn ${isBroadcasting ? 'loading' : ''}`}>
                                {isBroadcasting ? <Clock size={48} className="animate-spin" /> : 'SOS'}
                            </button>
                        </div>
                        <p className="sos-instruction">Press and hold or tap to broadcast emergency signal</p>
                    </div>
                )}

                {/* ══ EMERGENCY CATEGORIES ══ */}
                <section className="sos-categories-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="section-title-box">
                        <div className="title-line"></div>
                        <h2>Specific Assistance</h2>
                        <div className="title-line"></div>
                    </div>

                    <div className="sos-grid">
                        {emergencyActions.map(action => (
                            <div
                                key={action.id}
                                className="sos-action-card"
                                style={{ '--action-color': action.color, '--action-bg': action.bg }}
                                onClick={() => startSOSProcess(action.type)}
                            >
                                <div className="action-icon">{action.icon}</div>
                                <div className="action-info">
                                    <h3>{action.label}</h3>
                                    <p>{action.desc}</p>
                                </div>
                                <ChevronRight className="action-arrow" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══ QUICK HELPLINES ══ */}
                <section className="helplines-section animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="glass-panel">
                        <div className="panel-header">
                            <Phone size={24} className="panel-icon" />
                            <h3>Direct Helplines</h3>
                        </div>
                        <div className="helplines-list">
                            {helplines.map((help, idx) => (
                                <a key={idx} href={`tel:${help.number}`} className="helpline-item">
                                    <div className="help-icon">{help.icon}</div>
                                    <div className="help-details">
                                        <span className="help-name">{help.name}</span>
                                        <span className="help-num">{help.number}</span>
                                    </div>
                                    <div className="call-badge">Call Now</div>
                                </a>
                            ))}
                        </div>
                        <div className="panel-footer">
                            <Info size={16} />
                            <p>{t('sosCriticalNote') || 'Misuse is strictly prohibited and may lead to legal action.'}</p>
                        </div>
                    </div>
                </section>

                {/* ══ SAFETY TIPS MINI CARD ══ */}
                <div className="safety-tip-card animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                    <div className="tip-content">
                        <MapPin size={24} className="tip-icon" />
                        <div className="tip-text">
                            <h4>Stay Connected</h4>
                            <p>Enable "Live Location Sharing" in settings to help us find you faster during peak hours.</p>
                        </div>
                    </div>
                    <button className="tip-btn" onClick={() => navigate('/health')}>View Map</button>
                </div>
            </div>

            {/* ══ BACK TO HOME ══ */}
            <div className="sos-footer-nav">
                <button onClick={() => navigate('/')} className="back-link">
                    <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default SosPage;
