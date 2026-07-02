import React, { useState, useEffect } from 'react';
import shopService from '../../services/shopService';
import '../../../styles/AdminLiveUpdates.css';

const DeliverProductManagement = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const fetchOrders = async () => {
        try {
            const params = {
                page: currentPage - 1,
                size: entriesPerPage,
                search: searchTerm || undefined,
                status: 'Delivered',
                sortBy: sortConfig.key,
                direction: sortConfig.direction
            };
            const res = await shopService.getAllOrdersOperator(params);
            setOrders(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, sortConfig]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Delivery Management</h1>
                </div>
            </div>

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(156, 39, 176, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#9c27b0' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Delivery Operations</h2>
                        <span className="subtitle-static">Maha Kumbh • Logistics & Fulfillment</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #9c27b0' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search by order number, customer name, or address..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>
            <div className="table-wrapper-premium">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('orderNumber')} style={{ cursor: 'pointer' }}>
                                Order Details {sortConfig.key === 'orderNumber' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                                Customer Name {sortConfig.key === 'customerName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                            <th>Shipping Address</th>
                            <th onClick={() => handleSort('deliveryStatus')} style={{ cursor: 'pointer' }}>
                                Delivery Status {sortConfig.key === 'deliveryStatus' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No delivered orders found.</td></tr>
                        ) : (
                            orders.map(o => (
                                <tr key={o.id}>
                                    <td>
                                        <div style={{ fontWeight: '800' }}>#{o.orderNumber}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#4a2a18', marginTop: '5px', fontWeight: '500' }}>
                                            {o.orderItems?.map(item => item.productName).join(', ') || 'No products listed'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{o.customerName || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{o.address}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill status-${o.deliveryStatus === 'Delivered' ? 'resolved' : 'pending'}`}>{o.deliveryStatus}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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


        </div>
    );
};

export default DeliverProductManagement;
