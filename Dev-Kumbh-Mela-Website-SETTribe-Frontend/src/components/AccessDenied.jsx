import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeadingOrnament from './HeadingOrnament';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#fff9f5',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                width: '100%',
                border: '2px solid #fee2e2'
            }}>
                
                <h1 style={{ fontFamily: 'var(--font-dashboard-heading)', color: '#991b1b', fontSize: '2.5rem', marginBottom: '10px' }}>
                    ACCESS DENIED
                </h1>
                <HeadingOrnament variant="diamond" />
                <p style={{ color: '#795d4d', fontSize: '1.1rem', margin: '20px 0', lineHeight: '1.6' }}>
                    This area is reserved for the sacred temple administrators. Your current credentials do not grant access to the Command Center.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                    <button
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
                        Back to Home
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'transparent',
                            color: '#795d4d',
                            border: '2px solid #795d4d',
                            padding: '12px 30px',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Admin Login
                    </button>
                </div>
            </div>
            <p style={{ marginTop: '30px', color: '#94a3b8', fontSize: '0.9rem' }}>
                Error 403: Forbidden Access • Maha Kumbh Security System
            </p>
        </div>
    );
};

export default AccessDenied;
