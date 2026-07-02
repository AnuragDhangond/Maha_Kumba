import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import shopService from '../../operatordashboard/services/shopService';
import ProductSubmissionModal from '../../components/shop/ProductSubmissionModal';
import ProductCard from '../../components/shop/ProductCard';
import './MyProducts.css';

export default function MyProducts() {
    const [products, setProducts]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await shopService.getMyProductsUser();
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const stats = {
        total:    products.length,
        pending:  products.filter(p => ['PENDING', 'UNDER_REVIEW'].includes(p.moderationStatus)).length,
        approved: products.filter(p => p.moderationStatus === 'APPROVED').length,
        rejected: products.filter(p => ['REJECTED', 'CHANGES_REQUESTED'].includes(p.moderationStatus)).length,
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    return (
        <div className="my-products-page">

            {/* Back Link */}
            <Link to="/" className="my-products-back-link">
                <ArrowLeft size={16} /> Back to Home
            </Link>

            {/* Header / Hero Banner */}
            <div className="my-products-hero-banner">
                <div className="my-products-hero-content">
                    <h1 className="my-products-title">My Submitted Products</h1>
                    <p className="my-products-subtitle">Track your product moderation and marketplace visibility.</p>
                </div>
                <button
                    className="my-products-submit-btn"
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                >
                    <Plus size={16} /> Submit Product
                </button>
            </div>

            {/* Stats */}
            <div className="my-products-stats">
                <div className="stat-card total">
                    <div className="stat-card-left">
                        <p className="stat-label">Total Products</p>
                        <h3 className="stat-value">{stats.total}</h3>
                    </div>
                    <div className="stat-icon-wrapper">
                        <Package size={24} />
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-card-left">
                        <p className="stat-label">Pending Review</p>
                        <h3 className="stat-value">{stats.pending}</h3>
                    </div>
                    <div className="stat-icon-wrapper">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-card-left">
                        <p className="stat-label">Approved & Live</p>
                        <h3 className="stat-value">{stats.approved}</h3>
                    </div>
                    <div className="stat-icon-wrapper">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="stat-card attention">
                    <div className="stat-card-left">
                        <p className="stat-label">Needs Attention</p>
                        <h3 className="stat-value">{stats.rejected}</h3>
                    </div>
                    <div className="stat-icon-wrapper">
                        <AlertCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="my-products-loading">Loading your products...</div>
            ) : products.length > 0 ? (
                <div className="submitted-products-list">
                    {products.map(p => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            onEdit={openEdit}
                        />
                    ))}
                </div>
            ) : (
                <div className="my-products-empty">
                    <h3>No products submitted yet.</h3>
                    <p>Submit your first product to get started on the marketplace.</p>
                    <button onClick={() => setIsModalOpen(true)}>Submit your first product</button>
                </div>
            )}

            {/* Submission Modal */}
            <ProductSubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={loadProducts}
                initialData={editingProduct}
            />
        </div>
    );
}
