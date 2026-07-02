import React, { useState } from 'react';
import { MapPin, Check, X, Edit3, ExternalLink } from 'lucide-react';
import shopService from '../../operatordashboard/services/shopService';
import ProductDetailsModal from './ProductDetailsModal';
import '../../styles/ShopPage.css';

const STATUS_LABEL = {
    APPROVED:          'Approved',
    REJECTED:          'Rejected',
    CHANGES_REQUESTED: 'Changes Requested',
    UNDER_REVIEW:      'In Review',
    PENDING:           'Pending',
};

const ProductRequestCard = ({ product, onApprove, onReject, onRequestChanges, acting }) => {
    const [remarks, setRemarks] = useState('');
    const [mode, setMode] = useState(null); // 'REJECT' | 'CHANGES' | null
    const [showDetails, setShowDetails] = useState(false);

    if (!product) return null;

    const isSubmitting = acting === product.id;
    const status = product.moderationStatus || 'PENDING';
    const badgeCls = 'status-badge ' + status.toLowerCase().replace('_', '_');
    const imageUrl = shopService.buildImageUrl(product.thumbnail || product.imageUrl);
    const price = parseFloat(product.price || 0).toLocaleString('en-IN');

    const handleConfirm = () => {
        if (mode === 'REJECT') {
            onReject(product.id, remarks);
        } else if (mode === 'CHANGES') {
            onRequestChanges(product.id, remarks);
        }
        setRemarks('');
        setMode(null);
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <span className={badgeCls}>{STATUS_LABEL[status] || status}</span>
                <img
                    src={imageUrl}
                    alt={product.productName}
                    className="product-real-image"
                    onError={e => { e.target.src = '/placeholder.png'; }}
                />
            </div>

            <div className="product-details">
                <h3 className="product-title">{product.productName}</h3>
                <p className="product-location">
                    <MapPin size={14} style={{ marginRight: '6px', color: '#8d8076' }} />
                    {product.sellerName || 'Vendor'} | {product.pickupLocation || product.sellerCity || product.category}
                </p>
                <div className="product-bottom-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="product-price">₹{price}</span>
                        <button 
                            onClick={() => setShowDetails(true)}
                            className="vendor-action-btn details"
                            title="View Full Details"
                        >
                            <ExternalLink size={16} /> Details
                        </button>
                    </div>

                    {!mode ? (
                        <div className="vendor-actions">
                            <button 
                                className="vendor-action-btn approve" 
                                onClick={() => onApprove(product.id)}
                                disabled={isSubmitting}
                                title="Approve"
                            >
                                <Check size={16} /> {isSubmitting ? '...' : 'Approve'}
                            </button>
                            <button 
                                className="vendor-action-btn changes" 
                                onClick={() => setMode('CHANGES')}
                                disabled={isSubmitting}
                                title="Request Changes"
                            >
                                <Edit3 size={16} />
                            </button>
                            <button 
                                className="vendor-action-btn reject" 
                                onClick={() => setMode('REJECT')}
                                disabled={isSubmitting}
                                title="Reject"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="remarks-form-container">
                            <input 
                                type="text"
                                placeholder={mode === 'REJECT' ? "Rejection reason..." : "Required changes..."}
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="remarks-input"
                            />
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={!remarks.trim() || isSubmitting}
                                    className={`remarks-confirm-btn ${mode === 'REJECT' ? 'reject' : 'changes'}`}
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={() => setMode(null)} 
                                    className="remarks-cancel-btn"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ProductDetailsModal 
                product={product} 
                isOpen={showDetails} 
                onClose={() => setShowDetails(false)} 
            />
        </div>
    );
};

export default ProductRequestCard;
