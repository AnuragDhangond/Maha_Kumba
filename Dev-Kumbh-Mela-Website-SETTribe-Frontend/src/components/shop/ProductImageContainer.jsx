import React from 'react';
import { Package } from 'lucide-react';
import shopService from '../../operatordashboard/services/shopService';

const ProductImageContainer = ({ src, alt }) => {
    const [error, setError] = React.useState(false);

    const imageUrl = shopService.buildImageUrl(src);

    return (
        <div className="w-full md:w-[220px] h-[180px] md:h-[220px] flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100">
            {(!imageUrl || error) ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <Package size={40} />
                    <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">No Image</span>
                </div>
            ) : (
                <img 
                    src={imageUrl} 
                    alt={alt || 'Product'}
                    className="w-full h-full object-cover object-center block"
                    onError={() => setError(true)}
                    loading="lazy"
                />
            )}
        </div>
    );
};

export default ProductImageContainer;
