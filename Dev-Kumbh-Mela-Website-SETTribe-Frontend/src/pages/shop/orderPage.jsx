import React, { useState, useEffect } from 'react';
import '../../styles/AdminLiveUpdates.css';
import shopService from '../../operatordashboard/services/shopService';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: ordersCurrentPage - 1,
                size: entriesPerPage,
                sortBy: 'createdAt',
                direction: 'desc'
            };
            const res = await shopService.getAllOrdersOperator(params);
            if (res.data) {
                setOrders(res.data.content || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalElements(res.data.totalElements || 0);
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [ordersCurrentPage]);

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">E-Commerce Hub</h1>
                </div>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(76, 175, 80, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#4CAF50' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Service Orders</h2>
                        <span className="subtitle-static">Maha Kumbh • Fulfillment Hub</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #4CAF50' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Bookings</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#ff7e36' }}>
                        <div className="loading-spinner"></div>
                        <p>Fetching divine orders...</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Item / Service</th>
                                <th>Pilgrim Name</th>
                                <th>Status</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        No real-time orders found in the registry.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td><span className="id-badge-alt">#{order.orderNumber || order.id}</span></td>
                                        <td className="font-semibold">
                                            {order.orderItems && order.orderItems.length > 0 
                                                ? order.orderItems.map(item => item.productName).join(', ') 
                                                : 'General Service'}
                                        </td>
                                        <td>{order.customerName || 'Anonymous Pilgrim'}</td>
                                        <td>
                                            <span className={`status-pill status-${(order.tracking?.currentStatus || order.deliveryStatus || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {order.tracking?.currentStatus || order.deliveryStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="font-bold text-accent">₹{order.totalAmount || '0'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <div></div>
            {!loading && totalPages > 1 && (
                <div className="pagination-bar-premium">
                    <button 
                        className="pager-btn" 
                        disabled={ordersCurrentPage === 1} 
                        onClick={() => setOrdersCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    <div className="pager-info">Page <strong>{ordersCurrentPage}</strong> of {totalPages}</div>
                    <button 
                        className="pager-btn" 
                        disabled={ordersCurrentPage === totalPages} 
                        onClick={() => setOrdersCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
