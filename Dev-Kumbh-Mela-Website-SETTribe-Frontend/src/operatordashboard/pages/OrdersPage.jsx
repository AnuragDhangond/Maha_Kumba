import React, { useState } from 'react';
import '../../styles/AdminLiveUpdates.css';

const OrdersPage = () => {
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
    const entriesPerPage = 10;

    const ordersData = [
        { id: 'ORD-84920', item: 'Virtual Pooja Entry', user: 'Rahul Verma', status: 'Completed', amount: '₹501' },
        { id: 'ORD-84921', item: 'Green Kumbh Donation', user: 'Sita Devi', status: 'Completed', amount: '₹1,100' },
        { id: 'ORD-84922', item: 'Ganga Jal Delivery', user: 'Vikram Singh', status: 'Pending', amount: '₹251' },
        { id: 'ORD-84923', item: 'VIP Darshan Pass', user: 'Amit Kumar', status: 'Failed', amount: '₹2,500' },
        { id: 'ORD-84924', item: 'Prasad Box', user: 'Priya Joshi', status: 'Completed', amount: '₹150' }
    ];

    return (
        <div className="admin-page-content animate-fade-in">
            <div className="admin-header-flex">
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
                            <span className="digit">{ordersData.length}</span>
                            <span className="lab">Bookings</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper-premium">
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
                        {ordersData.slice((ordersCurrentPage - 1) * entriesPerPage, ordersCurrentPage * entriesPerPage).map(order => (
                            <tr key={order.id}>
                                <td><span className="id-badge-alt">#{order.id}</span></td>
                                <td className="font-semibold">{order.item}</td>
                                <td>{order.user}</td>
                                <td><span className={`status-pill status-${(order.status || '').toLowerCase()}`}>{order.status}</span></td>
                                <td className="font-bold text-accent">{order.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination-bar-premium">
                    <button 
                        className="pager-btn" 
                        disabled={ordersCurrentPage === 1} 
                        onClick={() => setOrdersCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        Previous
                    </button>
                    <div className="pager-info">
                        Page <strong>{ordersCurrentPage}</strong> of {Math.ceil(ordersData.length / entriesPerPage) || 1}
                    </div>
                    <button 
                        className="pager-btn" 
                        disabled={ordersCurrentPage >= Math.ceil(ordersData.length / entriesPerPage)} 
                        onClick={() => setOrdersCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
