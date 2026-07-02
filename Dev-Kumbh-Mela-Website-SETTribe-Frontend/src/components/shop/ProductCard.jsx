import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import shopService from '../../operatordashboard/services/shopService';
import '../../styles/ShopPage.css';

const STATUS_LABEL = {
    APPROVED:          'Approved',
    REJECTED:          'Rejected',
    CHANGES_REQUESTED: 'Changes Requested',
    UNDER_REVIEW:      'In Review',
    PENDING:           'Pending',
};

const ProductCard = ({ product, onEdit, onDelete }) => {
    if (!product) return null;

    const status    = product.moderationStatus || 'PENDING';
    const badgeCls  = 'submitted-status-badge ' + status.toLowerCase().replace('_', '_');
    const imageUrl  = shopService.buildImageUrl(product.thumbnail || product.imageUrl);
    const price     = parseFloat(product.price || 0).toLocaleString('en-IN');
    const submitted = product.createdAt
        ? new Date(product.createdAt).toLocaleDateString('en-IN')
        : '—';

    return (
        <div className="submitted-product-card">

            {/* Image */}
            <div className="submitted-product-image-section">
                <span className={badgeCls}>{STATUS_LABEL[status] || status}</span>
                <img
                    src={imageUrl}
                    alt={product.productName}
                    className="submitted-product-image"
                    onError={e => { e.target.src = '/placeholder.png'; }}
                />
            </div>

            {/* Details */}
            <div className="submitted-product-details-section">

                <div className="submitted-product-top-row">
                    <h2>{product.productName}</h2>
                </div>

                <p className="submitted-product-category">{product.category}</p>
                <p className="submitted-product-price">₹{price}</p>
                <p className="submitted-product-description">{product.description || 'No description provided.'}</p>
                <p className="submitted-product-date">Submitted: {submitted}</p>

            </div>

            {/* Actions */}
            <div className="submitted-product-actions-section">
                <button className="submitted-btn-view">
                    <Eye size={14} style={{ marginRight: '6px' }} /> View Details
                </button>
                {(status === 'REJECTED' || status === 'CHANGES_REQUESTED') && (
                    <button className="submitted-btn-edit" onClick={() => onEdit && onEdit(product)}>
                        <Edit size={14} style={{ marginRight: '6px' }} /> Edit
                    </button>
                )}
                {onDelete && (
                    <button className="submitted-btn-delete" onClick={() => onDelete(product)}>
                        <Trash2 size={14} style={{ marginRight: '6px' }} /> Delete
                    </button>
                )}
            </div>

        </div>
    );
};

export default ProductCard;
