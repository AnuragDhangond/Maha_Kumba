import React from 'react';
import { 
    X, MapPin, Phone, Mail, Package, 
    Calendar, User, ShieldCheck, Truck,
    Maximize2, Info
} from 'lucide-react';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
    if (!isOpen || !product) return null;

    const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;
    const getImgUrl = (url) => (!url ? null : url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`);

    const images = product.images ? product.images.split(',') : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-[#fffbf5] border border-[#ffd8a8]/60 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[32px] flex flex-col md:flex-row shadow-2xl">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-3 bg-white hover:bg-[#fff3e0] rounded-2xl border border-[#ffd8a8] text-[#795d4d] hover:text-[#d84315] transition-all active:scale-95 shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* Left: Image Gallery */}
                <div className="flex-1 bg-[#ffe0b2]/10 p-8 flex flex-col gap-6 overflow-y-auto">
                    <div className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-white">
                        <img 
                            src={getImgUrl(product.thumbnail || product.imageUrl)} 
                            alt={product.productName}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <button className="flex items-center gap-2 bg-[#d84315] text-white px-4 py-2 rounded-full font-bold text-xs shadow-md">
                                <Maximize2 size={14} /> View Large
                            </button>
                        </div>
                    </div>
                    
                    {images.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#ffd8a8] hover:border-[#d84315] transition-colors cursor-pointer bg-white">
                                    <img src={getImgUrl(img)} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details Content */}
                <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-[#ffe0b2]/40 text-[#d84315] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#ffcc80]/50">
                                {product.category}
                            </span>
                            <span className="text-[10px] font-bold text-[#795d4d] uppercase tracking-widest">
                                ID: #{product.id}
                            </span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-[#bf360c] leading-tight mb-4">{product.productName}</h2>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-[#2e7d32]">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                            {product.discountedPrice && (
                                <span className="text-lg font-bold text-[#a1887f] line-through">₹{product.discountedPrice}</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#795d4d] flex items-center gap-2">
                                    <Info size={12} className="text-[#d84315]" /> Description
                                </label>
                                <p className="text-sm text-[#5c4033] leading-relaxed">{product.description || 'No description provided.'}</p>
                            </div>
                            
                            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#ffd8a8] shadow-sm shadow-[#bf360c]/5">
                                <Package className="text-[#d84315]" size={20} />
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#795d4d]">Stock Availability</div>
                                    <div className="text-sm font-bold text-[#3e2723]">{product.stockQuantity} Units in hand</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#795d4d] flex items-center gap-2">
                                    <User size={12} className="text-[#d84315]" /> Seller Information
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-bold text-[#3e2723]">
                                        <div className="w-8 h-8 rounded-full bg-[#ffe0b2] text-[#d84315] border border-[#ffcc80]/50 flex items-center justify-center text-xs font-bold">
                                            {product.sellerName ? product.sellerName[0] : 'U'}
                                        </div>
                                        {product.sellerName || 'Anonymous Seller'}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#5c4033]">
                                        <Mail size={14} className="text-[#8d6e63]" /> {product.sellerEmail || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#5c4033]">
                                        <Phone size={14} className="text-[#8d6e63]" /> {product.sellerPhone || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#795d4d] flex items-center gap-2">
                                    <MapPin size={12} className="text-[#d84315]" /> Pickup & Delivery
                                </label>
                                <div className="space-y-3">
                                    <div className="text-xs text-[#3e2723] font-bold">{product.sellerCity}</div>
                                    <div className="text-[10px] text-[#795d4d] leading-tight">{product.sellerAddress || product.pickupLocation}</div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#2e7d32]">
                                        <Truck size={14} /> {product.deliveryAvailable ? 'Delivery Available' : 'Pickup Only'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-[#ffe0b2]/10 rounded-3xl border border-[#ffcc80]/40">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar size={16} className="text-[#d84315]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#bf360c]">Submission Details</span>
                        </div>
                        <div className="text-xs text-[#5c4033]">
                            Submitted on <span className="text-[#3e2723] font-bold">{new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(216,67,21,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(216,67,21,0.2); }
            `}</style>
        </div>
    );
};

export default ProductDetailsModal;
