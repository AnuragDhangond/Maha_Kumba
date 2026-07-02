import React, { useEffect, useState } from 'react';
import '../../styles/AdminLiveUpdates.css';
import '../../styles/DashboardForms.css';
import { poojaBookingService } from '../../api/services/poojaBookingService';

const statusOptions = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const PoojaBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const fetchBookings = async (search = searchTerm, page = currentPage, showLoading = false) => {
        if (showLoading) setIsLoading(true);
        try {
            const response = await poojaBookingService.getAllBookings(search, page - 1, entriesPerPage);
            const data = response.data;
            if (data && data.content !== undefined) {
                setBookings(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                const list = Array.isArray(data) ? data : [];
                setBookings(list);
                setTotalPages(1);
                setTotalElements(list.length);
            }
        } catch (error) {
            console.error('Error fetching pooja bookings:', error);
            setBookings([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings(searchTerm, currentPage, true);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    // Setup periodic polling to fetch updates in real-time
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchBookings(searchTerm, currentPage, false);
        }, 5000);
        return () => clearInterval(intervalId);
    }, [searchTerm, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const updateStatus = async (bookingId, status) => {
        try {
            const response = await poojaBookingService.updateStatus(bookingId, status);
            setBookings(prev => prev.map(booking => booking.id === bookingId ? response.data : booking));
        } catch (error) {
            console.error('Error updating pooja booking status:', error);
            alert('Failed to update booking status.');
        }
    };

    const formatDateTime = (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleString();
    };

    const formatBookingDate = (date, slot) => {
        if (!date && !slot) return 'N/A';
        const formattedDate = date ? new Date(`${date}T00:00:00`).toLocaleDateString() : 'No date';
        return `${formattedDate}${slot ? ` at ${slot}` : ''}`;
    };

    if (isLoading && bookings.length === 0) {
        return (
            <div className="admin-page-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div className="text-center">
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>...</div>
                    <h3>Loading Pooja Bookings...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Pooja Bookings</h1>
                </div>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(255, 126, 54, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#ff7e36' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Virtual Pooja Booking Registry</h2>
                        <span className="subtitle-static">Maha Kumbh - Devotee ritual requests</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff7e36' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Bookings</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search by devotee, acharya, pooja, city, or status..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>

            <div className="table-wrapper-premium">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Booking</th>
                                <th>Devotee</th>
                                <th>Schedule</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                        No pooja bookings found.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map(booking => (
                                    <tr key={booking.id} className={(booking.status || '').toUpperCase() === 'PENDING' ? 'booking-pending-blink' : ''}>
                                        <td>
                                            <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className={`id-badge-stress ${(booking.status || '').toUpperCase() === 'PENDING' ? 'booking-pending-badge' : ''}`}>
                                                    #{booking.id}
                                                </span>
                                                <span className={(booking.status || '').toUpperCase() === 'PENDING' ? 'sos-blink' : ''}>{booking.poojaName}</span>
                                            </div>
                                            <div style={{ color: '#ff7e36', fontWeight: '700', fontSize: '0.9rem', marginTop: '4px' }}>With {booking.acharyaName}</div>
                                            <div style={{ fontSize: '0.85rem', opacity: 0.65 }}>
                                                Rs.{booking.price} - {booking.poojaDuration || 'Duration N/A'} - {formatDateTime(booking.createdAt)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '800' }}>{booking.devoteeName}</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.75 }}>Gotra: {booking.gotra || 'N/A'}</div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.75 }}>Family: {booking.familyCount || 1} - {booking.location || 'N/A'}</div>
                                            <div style={{ fontSize: '0.85rem', marginTop: '6px', maxWidth: '380px' }}>{booking.sankalpa}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '700' }}>{formatBookingDate(booking.preferredDate, booking.preferredSlot)}</div>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select-modern"
                                                value={booking.status || 'PENDING'}
                                                onChange={(e) => updateStatus(booking.id, e.target.value)}
                                                style={{ minWidth: '150px' }}
                                            >
                                                {statusOptions.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="pagination-bar-premium">
                    <button
                        className="pager-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        Previous
                    </button>
                    <div className="pager-info">
                        Page <strong>{currentPage}</strong> of {totalPages}
                    </div>
                    <button
                        className="pager-btn"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes bookingBlinkBg {
                    0% { background-color: rgba(239, 68, 68, 0.02); }
                    50% { background-color: rgba(239, 68, 68, 0.12); }
                    100% { background-color: rgba(239, 68, 68, 0.02); }
                }
                @keyframes bookingBlinkBorder {
                    0% { box-shadow: inset 4px 0 0 rgba(239, 68, 68, 0.3); }
                    50% { box-shadow: inset 4px 0 0 rgba(239, 68, 68, 1); }
                    100% { box-shadow: inset 4px 0 0 rgba(239, 68, 68, 0.3); }
                }
                .booking-pending-blink td {
                    animation: bookingBlinkBg 1.5s infinite ease-in-out;
                }
                .booking-pending-blink td:first-child {
                    animation: bookingBlinkBg 1.5s infinite ease-in-out, bookingBlinkBorder 1.5s infinite ease-in-out !important;
                }
                .booking-pending-badge {
                    animation: bookingBadgePulse 1.5s infinite ease-in-out;
                    background: rgba(239, 68, 68, 0.1) !important;
                    color: #ef4444 !important;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }
                @keyframes bookingBadgePulse {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
                .sos-blink {
                    animation: sos-soft-blink 1.5s infinite ease-in-out;
                    color: #ef4444 !important;
                    text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
                    font-weight: 800;
                }
                @keyframes sos-soft-blink {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.02); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default PoojaBookingsPage;
