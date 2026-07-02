import React, { useState, useEffect } from 'react';
import shopService from '../../services/shopService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDeliveryTrackingSchema } from '../../../schemas/shopSchemas';
import { scrollAndFocusError } from '../../../utils/validationUtils';
import '../../../styles/DashboardForms.css';

const TrackProductManagement = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentOrder, setCurrentOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const entriesPerPage = 10;

    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(getDeliveryTrackingSchema()),
        mode: 'onTouched',
        defaultValues: {
            currentStatus: '',
            currentLocation: '',
            courierPartner: '',
            trackingNumber: '',
            expectedDeliveryDate: '',
            latestUpdate: ''
        }
    });

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

    const openTrackingModal = (order) => {
        setCurrentOrder(order);
        reset({
            currentStatus: order.tracking?.currentStatus || '',
            currentLocation: order.tracking?.currentLocation || '',
            courierPartner: order.tracking?.courierPartner || '',
            trackingNumber: order.tracking?.trackingNumber || order.orderNumber || '',
            latestUpdate: order.tracking?.latestUpdate || '',
            expectedDeliveryDate: order.tracking?.expectedDeliveryDate ? order.tracking.expectedDeliveryDate.substring(0, 16) : ''
        });
        const scrollContainer = document.querySelector('.admin-content');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const closeForm = () => {
        setCurrentOrder(null);
        reset({
            currentStatus: '',
            currentLocation: '',
            courierPartner: '',
            trackingNumber: '',
            expectedDeliveryDate: '',
            latestUpdate: ''
        });
    };

    const onSubmitForm = async (data) => {
        setIsLoading(true);
        try {
            await shopService.updateTracking(currentOrder.id, data);
            Swal.fire('Success', 'Tracking information updated.', 'success');
            closeForm();
            fetchOrders();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to update tracking information.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">Tracking Management</h1>
                </div>
                {currentOrder && (
                    <button onClick={closeForm} className="pager-btn" style={{ background: '#795d4d', color: 'white' }}>Cancel Update</button>
                )}
            </div>

            {currentOrder && (
                <div className="dashboard-form-container">
                    <div className="form-header-modern">
                        <h3>Update Tracking - #{currentOrder?.orderNumber}</h3>
                    </div>
                    <form onSubmit={handleSubmit(onSubmitForm, scrollAndFocusError)}>
                        <div className="form-grid-modern">
                            <div className={`form-group-modern ${errors.currentStatus ? 'has-error' : ''}`}>
                                <label className="form-label-modern">Current Status <span className="required-mark">*</span></label>
                                <select {...register('currentStatus')} className={`form-select-modern ${errors.currentStatus ? 'has-error' : ''}`}>
                                    <option value="">Select Status</option>
                                    {['Ordered', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((status) => {
                                        const statusRanks = { 'Ordered': 0, 'Processing': 1, 'Shipped': 2, 'Out for Delivery': 3, 'Delivered': 4 };
                                        const currentRank = statusRanks[currentOrder.tracking?.currentStatus] ?? -1;
                                        return (
                                            <option key={status} value={status} disabled={statusRanks[status] < currentRank}>
                                                {status}
                                            </option>
                                        );
                                    })}
                                </select>
                                {errors.currentStatus && <div className="form-error-message">{errors.currentStatus.message}</div>}
                            </div>
                            <div className={`form-group-modern ${errors.currentLocation ? 'has-error' : ''}`}>
                                <label className="form-label-modern">Current Location <span className="required-mark">*</span></label>
                                <input type="text" {...register('currentLocation')} className={`form-input-modern ${errors.currentLocation ? 'has-error' : ''}`} placeholder="e.g. Nashik Sorting Center" />
                                {errors.currentLocation && <div className="form-error-message">{errors.currentLocation.message}</div>}
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">Courier Partner</label>
                                <input type="text" {...register('courierPartner')} className="form-input-modern" placeholder="e.g. India Post / Mahakumbh Logistics" />
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">Tracking Number</label>
                                <input type="text" {...register('trackingNumber')} className="form-input-modern" placeholder="e.g. 123456789" />
                            </div>
                            <div className={`form-group-modern ${errors.expectedDeliveryDate ? 'has-error' : ''}`}>
                                <label className="form-label-modern">Expected Delivery Date <span className="required-mark">*</span></label>
                                <input type="datetime-local" {...register('expectedDeliveryDate')} className={`form-input-modern ${errors.expectedDeliveryDate ? 'has-error' : ''}`} />
                                {errors.expectedDeliveryDate && <div className="form-error-message">{errors.expectedDeliveryDate.message}</div>}
                            </div>
                            <div className="form-group-modern form-span-2">
                                <label className="form-label-modern">Latest Update</label>
                                <input type="text" {...register('latestUpdate')} className="form-input-modern" placeholder="Package has arrived at Prayagraj Sorting Center." />
                            </div>
                        </div>
                        <div className="form-actions-modern">
                            <button type="submit" className="btn-dashboard-primary" style={{ width: '100%' }} disabled={isLoading}>
                                Update Tracking Info
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(255, 152, 0, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#FF9800' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">Tracking Registry</h2>
                        <span className="subtitle-static">Maha Kumbh • Order Location & ETA tracking</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed" style={{ borderBottom: '3px solid #FF9800' }}>
                        
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Shipments</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search by order number, customer name, status or location..." 
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
                            <th>Status</th>
                            <th>Location</th>
                            <th>Expected Delivery</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>No orders found.</td></tr>
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
                                        <span className={`status-pill status-${o.tracking?.currentStatus === 'Delivered' ? 'resolved' : 'pending'}`} style={{ color: '#ff7e36', borderColor: '#ff7e36' }}>{o.tracking?.currentStatus || 'N/A'}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{o.tracking?.currentLocation || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{o.tracking?.expectedDeliveryDate ? new Date(o.tracking.expectedDeliveryDate).toLocaleString() : 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div className="table-actions-modern">
                                            <button onClick={() => openTrackingModal(o)} className="btn-edit-modern">
                                                {currentOrder?.id === o.id ? 'Updating...' : 'Update Tracking'}
                                            </button>
                                        </div>
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

export default TrackProductManagement;
