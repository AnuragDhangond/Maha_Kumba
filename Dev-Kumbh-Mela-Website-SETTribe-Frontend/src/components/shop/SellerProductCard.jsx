import React from 'react';
import { 
    Package, Clock, CheckCircle, XCircle, 
    AlertCircle, Info, Edit, Trash2, ChevronRight
} from 'lucide-react';
import shopService from '../../operatordashboard/services/shopService';

const StatusBadge = ({ status }) => {
    const configs = {
        APPROVED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' },
        REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
        CHANGES_REQUESTED: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Changes Requested' },
        UNDER_REVIEW: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Under Review' },
        PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' }
    };
    
    const { icon: Icon, color, bg, label } = configs[status] || configs.PENDING;
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${bg} ${color} border border-transparent`}>
            <Icon size={10} /> {label}
        </span>
    );
};

export const SellerProductCard = ({ product, onEdit, onDelete }) => {
    if (!product) return null;

    return (
        <div className="group bg-[#121218] border border-white/5 hover:border-orange-500/30 rounded-3xl p-4 transition-all duration-300 flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            {/* Compact Image */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-white/10 shadow-inner">
                <img 
                    src={shopService.buildImageUrl(product.thumbnail || product.imageUrl)} 
                    alt={product.productName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{product.productName || 'Untitled Product'}</h3>
                    <StatusBadge status={product.moderationStatus} />
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>₹{parseFloat(product.price || 0).toLocaleString('en-IN')}</span>
                    <span className="opacity-50">•</span>
                    <span>{product.category || 'General'}</span>
                </div>
                
                {/* Moderator Feedback - Compact */}
                {(product.moderationRemarks || product.rejectionReason) && (
                    <div className="mt-2 flex items-start gap-2 text-[9px] text-orange-500 bg-orange-500/5 px-2 py-1 rounded-lg border border-orange-500/10">
                        <Info size={10} className="mt-0.5 flex-shrink-0" />
                        <span className="truncate italic">"{product.moderationRemarks || product.rejectionReason}"</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {product.moderationStatus === 'CHANGES_REQUESTED' && (
                    <button onClick={() => onEdit(product)} className="p-2 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-black transition-all">
                        <Edit size={16} />
                    </button>
                )}
                <button onClick={() => onDelete(product.id)} className="p-2 bg-white/5 text-gray-500 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                </button>
                <button className="p-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
