import React, { useState, useEffect, useCallback } from 'react';
import shopService from '../../services/shopService';
import ProductRequestCard from '../../../components/operator/ProductRequestCard';
import EmptyModerationState from '../../../components/operator/EmptyModerationState';
import { 
    RefreshCcw, Filter, ChevronLeft, ChevronRight, 
    Search, AlertCircle, X
} from 'lucide-react';

import '../../../styles/ShopPage.css'; // Use premium shop aesthetics
import '../../../styles/DashboardForms.css';

export default function OperatorProductQueue() {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalApproved, setTotalApproved] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [pendingRes, allRes] = await Promise.all([
                shopService.getProductQueue({ page, size: 10 }),
                shopService.getAllProductsOperator({ page: 0, size: 1 })
            ]);
            
            setProducts(pendingRes.data.content || []);
            setTotal(pendingRes.data.totalElements || 0);
            setTotalApproved(allRes.data.totalElements || 0);
        } catch (err) { 
            setError('Failed to load moderation queue. Please check your connection.'); 
        } finally { 
            setLoading(false); 
        }
    }, [page]);

    useEffect(() => { load(); }, [load]);

    const handleApprove = async (id) => {
        setActing(id);
        try {
            await shopService.moderateProduct(id, { status: 'APPROVED', remarks: 'Product approved by operator.' });
            await load();
        } catch (err) { 
            setError(err?.response?.data?.message || 'Approval failed.'); 
        } finally { 
            setActing(null); 
        }
    };

    const handleReject = async (id, reason) => {
        setActing(id);
        try {
            await shopService.moderateProduct(id, { status: 'REJECTED', remarks: reason, rejectionReason: reason });
            await load();
        } catch (err) { 
            setError(err?.response?.data?.message || 'Rejection failed.'); 
        } finally { 
            setActing(null); 
        }
    };

    const handleRequestChanges = async (id, reason) => {
        setActing(id);
        try {
            await shopService.moderateProduct(id, { status: 'CHANGES_REQUESTED', remarks: reason });
            await load();
        } catch (err) {
            setError(err?.response?.data?.message || 'Request changes failed.');
        } finally {
            setActing(null);
        }
    };

    return (
        <div className="admin-page-content animate-fade-in">
        <div className="op-queue-container" style={{ padding: 0 }}>
            
            {/* TOP NAVIGATION BAR */}
            <div className="op-queue-header">
                <div>
                    <div className="dashboard-header-modern" style={{ marginBottom: '10px' }}>
                        <h1 className="page-title">Product Moderation Queue</h1>
                    </div>
                    <div className="op-queue-meta-row">
                        <div className="op-queue-badge">
                            <div className="op-badge-pulse-dot"></div>
                            <span className="op-badge-text">
                                {total} Requests Pending
                            </span>
                        </div>
                        <div className="op-badge-text">
                            Spiritual Marketplace
                        </div>
                    </div>
                </div>

                <div className="op-queue-actions">
                    <div className="op-search-wrapper">
                        <input 
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="op-search-input"
                        />
                        <Search className="op-search-icon" size={18} />
                    </div>
                    <button 
                        onClick={load}
                        className="op-header-btn"
                        title="Refresh Queue"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="op-header-btn" title="Filter Settings">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="op-grid-wrapper">
                
                {error && (
                    <div className="op-alert-error">
                        <AlertCircle size={24} />
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{error}</p>
                        <button onClick={() => setError('')} className="op-alert-error-close">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {loading && products.length === 0 ? (
                    <div className="op-loading-wrapper">
                        <div className="op-loading-spinner"></div>
                        <p className="op-loading-text">Synchronizing Queue...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="products-grid op-grid">
                        {products.filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                            <ProductRequestCard 
                                key={product.id}
                                product={product}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onRequestChanges={handleRequestChanges}
                                acting={acting}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyModerationState totalApproved={totalApproved} />
                )}

                {/* PAGINATION */}
                {total > 10 && (
                    <div className="op-pagination-bar">
                        <div className="op-pagination-text">
                            Showing <span>{products.length}</span> of <span>{total}</span> pending requests
                        </div>
                        <div className="op-pagination-btn-group">
                            <button 
                                disabled={page === 0 || loading}
                                onClick={() => setPage(p => p - 1)}
                                className="op-pagination-btn"
                                title="Previous Page"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="op-page-btn-group">
                                {[...Array(Math.ceil(total / 10))].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`op-page-btn ${page === i ? 'active' : 'inactive'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={(page + 1) * 10 >= total || loading}
                                onClick={() => setPage(p => p + 1)}
                                className="op-pagination-btn"
                                title="Next Page"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
        </div>
    );
}
