import React, { useState } from 'react';
import useLocationSharing from '../hooks/useLocationSharing';
import '../styles/LocationSharingBanner.css';

// ─────────────────────────────────────────────────────────────────────────────
// LocationSharingBanner
//
// Renders a non-intrusive consent prompt at the bottom of the page.
// On consent → starts anonymous GPS sharing via useLocationSharing hook.
// On dismiss  → hides permanently for this device (localStorage flag).
//
// Placement: Inside <AuthenticatedLayout> above {children}
// ─────────────────────────────────────────────────────────────────────────────
const LocationSharingBanner = () => {
    const { isSharing, permissionState, error, startSharing, stopSharing } = useLocationSharing();

    const [dismissed, setDismissed] = useState(
        () => localStorage.getItem('kumbh_location_consent_dismissed') === 'true'
    );

    // Once banner is dismissed, render nothing — zero layout cost
    if (dismissed) return null;

    const handleConsent = () => {
        startSharing();
    };

    const handleDismiss = () => {
        stopSharing();
        localStorage.setItem('kumbh_location_consent_dismissed', 'true');
        setDismissed(true);
    };

    return (
        <div
            className={`lsb-banner ${isSharing ? 'lsb-banner--active' : ''} ${permissionState === 'denied' ? 'lsb-banner--denied' : ''}`}
            role="region"
            aria-label="Location sharing consent"
        >
            {/* Left: Icon + Content */}
            <div className="lsb-left">
                <div className="lsb-icon-wrap">
                    {isSharing ? (
                        <span className="lsb-pulse-dot" aria-hidden="true" />
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    )}
                </div>

                <div className="lsb-text">
                    {permissionState === 'denied' ? (
                        <>
                            <strong className="lsb-title">Location access blocked</strong>
                            <span className="lsb-desc">
                                Enable location in browser settings to help fellow pilgrims see crowd density.
                            </span>
                        </>
                    ) : isSharing ? (
                        <>
                            <strong className="lsb-title">Sharing live location</strong>
                            <span className="lsb-desc">
                                Your anonymous location is helping pilgrims navigate safely. Thank you.
                            </span>
                        </>
                    ) : (
                        <>
                            <strong className="lsb-title">Help fellow pilgrims navigate safely</strong>
                            <span className="lsb-desc">
                                Share your anonymous location to show live crowd density on the map. No personal data is stored.
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="lsb-actions">
                {permissionState !== 'denied' && !isSharing && (
                    <button
                        id="lsb-consent-btn"
                        className="lsb-btn lsb-btn--primary"
                        onClick={handleConsent}
                        aria-label="Allow location sharing"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Allow
                    </button>
                )}

                {isSharing && (
                    <button
                        id="lsb-stop-btn"
                        className="lsb-btn lsb-btn--stop"
                        onClick={stopSharing}
                        aria-label="Stop sharing location"
                    >
                        Stop Sharing
                    </button>
                )}

                <button
                    id="lsb-dismiss-btn"
                    className="lsb-btn lsb-btn--ghost"
                    onClick={handleDismiss}
                    aria-label="Dismiss location sharing banner"
                >
                    {isSharing ? 'Stop & Close' : 'Not Now'}
                </button>
            </div>
        </div>
    );
};

export default LocationSharingBanner;
