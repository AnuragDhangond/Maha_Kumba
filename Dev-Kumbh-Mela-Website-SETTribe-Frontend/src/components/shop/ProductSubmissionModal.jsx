import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    X, Upload, Check, ChevronRight, ChevronLeft, 
    Package, DollarSign, Image as ImageIcon, 
    User, AlertCircle, Trash2, MapPin, 
    Phone, Mail, Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import shopService from '../../operatordashboard/services/shopService';
import useAuthStore from '../../store/authStore';
import { scrollAndFocusError } from '../../utils/validationUtils';

// Import project standard CSS
import '../../styles/DashboardForms.css';
import '../../styles/ShopPage.css';

import { getProductSchema } from '../../schemas/shopSchemas';

const ProductSubmissionModal = ({ isOpen, onClose, onRefresh, initialData }) => {
    const user = useAuthStore(state => state.user);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState({ thumbnail: null, images: [] });
    const isEditMode = !!initialData;

    const methods = useForm({
        resolver: zodResolver(getProductSchema(!!initialData)),
        defaultValues: {
            productName: initialData?.productName || '',
            category: initialData?.category || '',
            description: initialData?.description || '',
            tags: initialData?.tags || '',
            price: initialData?.price || '',
            discountedPrice: initialData?.discountedPrice || '',
            stockQuantity: initialData?.stockQuantity || 1,
            deliveryAvailable: initialData?.deliveryAvailable ?? true,
            weight: initialData?.weight || '',
            dimensions: initialData?.dimensions || '',
            sellerName: initialData?.sellerName || user?.name || '',
            sellerEmail: initialData?.sellerEmail || user?.email || '',
            sellerPhone: initialData?.sellerPhone || '',
            whatsappNumber: initialData?.whatsappNumber || '',
            pickupLocation: initialData?.pickupLocation || '',
            sellerCity: initialData?.sellerCity || 'Nashik',
            sellerAddress: initialData?.sellerAddress || ''
        },
        mode: 'onChange'
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, trigger } = methods;

    const { onChange: priceOnChange, ...priceRegister } = register('price');
    const { onChange: discountedPriceOnChange, ...discountedPriceRegister } = register('discountedPrice');
    const { onChange: stockQuantityOnChange, ...stockQuantityRegister } = register('stockQuantity');
    const { onChange: weightOnChange, ...weightRegister } = register('weight');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                Object.keys(initialData).forEach(key => {
                    setValue(key, initialData[key] === null ? '' : initialData[key]);
                });
                if (initialData.thumbnail || initialData.imageUrl) {
                    setPreviews(prev => ({ ...prev, thumbnail: shopService.buildImageUrl(initialData.thumbnail || initialData.imageUrl) }));
                }
            } else if (user) {
                setValue('sellerName', user.name || '');
                setValue('sellerEmail', user.email || '');
            }
        }
    }, [isOpen, user, initialData, setValue]);

    if (!isOpen) return null;

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'Image size must be less than 2MB', 'error');
                return;
            }
            setThumbnail(file);
            setPreviews(prev => ({ ...prev, thumbnail: URL.createObjectURL(file) }));
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024);
        
        if (validFiles.length < files.length) {
            Swal.fire('Warning', 'Some images were skipped because they exceed 2MB', 'warning');
        }

        setImages(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => ({ ...prev, images: [...prev.images, ...newPreviews] }));
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const validateStep = async () => {
        let fieldsToValidate = [];
        if (step === 1) fieldsToValidate = ['productName', 'category', 'description'];
        if (step === 2) fieldsToValidate = ['price', 'stockQuantity'];
        if (step === 4) fieldsToValidate = ['sellerPhone', 'sellerCity', 'sellerAddress', 'pickupLocation'];

        const result = await trigger(fieldsToValidate);
        if (result) {
            if (step === 3 && !thumbnail && !previews.thumbnail) {
                Swal.fire('Required', 'Please upload a main thumbnail image', 'info');
                return;
            }
            setStep(prev => prev + 1);
        } else {
            setTimeout(() => {
                const firstErrorField = fieldsToValidate.find(field => errors[field]);
                if (firstErrorField) {
                    const element = document.getElementsByName(firstErrorField)[0];
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.focus();
                    }
                }
            }, 50);
        }
    };

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const finalData = { ...methods.getValues(), ...formData };
            const data = new FormData();
            data.append('product', new Blob([JSON.stringify(finalData)], { type: 'application/json' }));
            if (thumbnail) data.append('thumbnail', thumbnail);
            images.forEach(img => data.append('images', img));

            if (initialData?.id) {
                await shopService.updateSubmittedProductUser(initialData.id, data);
            } else {
                await shopService.submitProduct(data);
            }
            
            Swal.fire({
                icon: 'success',
                title: initialData ? 'Product Updated!' : 'Product Submitted!',
                text: 'Your product has been submitted successfully.',
                confirmButtonColor: '#ff6b00'
            });
            
            onClose();
            if (onRefresh) onRefresh();
            reset();
            setPreviews({ thumbnail: null, images: [] });
            setThumbnail(null);
            setImages([]);
            setStep(1);
        } catch (error) {
            console.error('Submission error:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to submit product', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formValues = watch();

    return (
        <FormProvider {...methods}>
            <div className="track-modal-overlay" style={{ zIndex: 11000 }} onClick={onClose}>
                <div className="track-modal" style={{ maxWidth: '850px', width: '95%', height: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="track-modal-header" style={{ padding: '25px 30px', borderBottom: '1px solid #eee', position: 'relative' }}>
                        <button className="track-modal-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                        <h2 className="track-modal-title" style={{ margin: 0, color: '#ff6b00', fontSize: '1.8rem' }}>{initialData ? 'Edit Product' : 'Sell Your Product'}</h2>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <div key={s} style={{ 
                                    height: '6px', 
                                    flex: 1, 
                                    borderRadius: '10px', 
                                    background: s <= step ? '#ff6b00' : '#f0f0f0',
                                    transition: 'all 0.3s'
                                }} />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Step {step} of 5: {
                                step === 1 ? 'Basic Info' : 
                                step === 2 ? 'Pricing & Inventory' : 
                                step === 3 ? 'Media Upload' : 
                                step === 4 ? 'Seller Details' : 'Review'
                            }
                        </p>
                    </div>

                    {/* Form Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                        <form id="sell-product-form" onSubmit={handleSubmit(onSubmit, scrollAndFocusError)}>
                            
                            {/* STEP 1: PRODUCT INFO */}
                            {step === 1 && (
                                <div className="form-grid-modern" style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Product Name <span className="required-mark">*</span></label>
                                        <input 
                                            {...register('productName')}
                                            placeholder="e.g. Traditional Copper Kalash"
                                            className={`form-input-modern ${errors.productName ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.productName && <p className="form-error-message">{errors.productName.message}</p>}
                                    </div>
 
                                    <div className="form-grid-modern">
                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Category <span className="required-mark">*</span></label>
                                            <select 
                                                {...register('category')}
                                                className={`form-select-modern ${errors.category ? 'input-error' : ''}`}
                                                disabled={isEditMode}
                                                style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Pooja Essentials">Pooja Essentials</option>
                                                <option value="Handicrafts">Handicrafts</option>
                                                <option value="Spiritual Books">Spiritual Books</option>
                                                <option value="Ayurveda">Ayurveda</option>
                                                <option value="Souvenirs">Souvenirs</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.category && <p className="form-error-message">{errors.category.message}</p>}
                                        </div>
                                        <div className="form-group-modern">
                                            <label className="form-label-modern">Tags</label>
                                            <input 
                                                {...register('tags')}
                                                placeholder="spiritual, brass, handmade"
                                                className="form-input-modern"
                                                readOnly={isEditMode}
                                                style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                            />
                                        </div>
                                    </div>
 
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Description <span className="required-mark">*</span></label>
                                        <textarea 
                                            {...register('description')}
                                            rows="4" 
                                            placeholder="Tell buyers about your product's quality, history, and usage..."
                                            className={`form-textarea-modern ${errors.description ? 'input-error' : ''}`}
                                            style={isEditMode ? { resize: 'none', backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : { resize: 'none' }}
                                            readOnly={isEditMode}
                                        ></textarea>
                                        {errors.description && <p className="form-error-message">{errors.description.message}</p>}
                                    </div>
                                </div>
                            )}
 
                            {/* STEP 2: PRICING & STOCK */}
                            {step === 2 && (
                                <div className="form-grid-modern">
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Price (₹) <span className="required-mark">*</span></label>
                                        <input 
                                            type="text" {...priceRegister}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                val = val.replace(/[^0-9.]/g, '');
                                                const parts = val.split('.');
                                                if (parts.length > 2) {
                                                    val = parts[0] + '.' + parts.slice(1).join('');
                                                }
                                                e.target.value = val;
                                                priceOnChange(e);
                                            }}
                                            className={`form-input-modern ${errors.price ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.price && <p className="form-error-message">{errors.price.message}</p>}
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Discounted Price (₹)</label>
                                        <input 
                                            type="text" {...discountedPriceRegister}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                val = val.replace(/[^0-9.]/g, '');
                                                const parts = val.split('.');
                                                if (parts.length > 2) {
                                                    val = parts[0] + '.' + parts.slice(1).join('');
                                                }
                                                e.target.value = val;
                                                discountedPriceOnChange(e);
                                            }}
                                            className={`form-input-modern ${errors.discountedPrice ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.discountedPrice && <p className="form-error-message">{errors.discountedPrice.message}</p>}
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Stock Quantity <span className="required-mark">*</span></label>
                                        <input 
                                            type="text" {...stockQuantityRegister}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                val = val.replace(/[^0-9]/g, '');
                                                e.target.value = val;
                                                stockQuantityOnChange(e);
                                            }}
                                            className={`form-input-modern ${errors.stockQuantity ? 'input-error' : ''}`}
                                        />
                                        {errors.stockQuantity && <p className="form-error-message">{errors.stockQuantity.message}</p>}
                                    </div>
                                    <div className="form-group-modern" style={{ justifyContent: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isEditMode ? 'not-allowed' : 'pointer', fontWeight: '700', color: '#4a2a18' }}>
                                            <input 
                                                type="checkbox" {...register('deliveryAvailable')}
                                                style={{ width: '20px', height: '20px', accentColor: '#ff6b00', cursor: isEditMode ? 'not-allowed' : 'pointer' }}
                                                disabled={isEditMode}
                                            />
                                            Home Delivery Available
                                        </label>
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Weight (grams)</label>
                                        <input 
                                            type="text" {...weightRegister}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                val = val.replace(/[^0-9]/g, '');
                                                e.target.value = val;
                                                weightOnChange(e);
                                            }}
                                            className="form-input-modern"
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Dimensions (LxWxH cm)</label>
                                        <input 
                                            type="text" {...register('dimensions')}
                                            placeholder="10x10x15"
                                            className="form-input-modern"
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: PRODUCT IMAGES */}
                            {step === 3 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    <div>
                                        <label className="form-label-modern" style={{ marginBottom: '15px' }}>Main Thumbnail <span className="required-mark">*</span></label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
                                            <div className="preview-container-form" style={{ width: '200px', height: '200px', flexShrink: 0, cursor: isEditMode ? 'not-allowed' : 'pointer' }}>
                                                {previews.thumbnail ? (
                                                    <img src={previews.thumbnail} alt="Preview" />
                                                ) : (
                                                    <div className="preview-placeholder-form" style={{ width: '100%', height: '100%' }}>
                                                        <ImageIcon size={40} />
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleThumbnailChange} 
                                                    disabled={isEditMode}
                                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: isEditMode ? 'not-allowed' : 'pointer' }}
                                                />
                                            </div>
                                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                                <p><strong>Recommended:</strong> Square (1:1) aspect ratio.</p>
                                                <p>Max file size: 2MB.</p>
                                                <p>This is the first image buyers will see.</p>
                                                <button type="button" className="btn-dashboard-secondary" disabled={isEditMode} style={{ marginTop: '10px', padding: '8px 20px', cursor: isEditMode ? 'not-allowed' : 'pointer' }} onClick={() => !isEditMode && document.querySelector('input[type="file"]').click()}>
                                                    Choose Image
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label-modern" style={{ marginBottom: '15px' }}>Additional Gallery Images ({previews.images.length}/10)</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                            {previews.images.map((url, i) => (
                                                <div key={i} className="preview-container-form" style={{ width: '120px', height: '120px' }}>
                                                    <img src={url} alt="Gallery" />
                                                    {!isEditMode && <button type="button" onClick={() => removeImage(i)} className="remove-img-btn">×</button>}
                                                </div>
                                            ))}
                                            {previews.images.length < 10 && (
                                                <div className="preview-placeholder-form" style={{ width: '120px', height: '120px', cursor: isEditMode ? 'not-allowed' : 'pointer', position: 'relative' }}>
                                                    <Upload size={24} />
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        multiple 
                                                        onChange={handleImagesChange} 
                                                        disabled={isEditMode}
                                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: isEditMode ? 'not-allowed' : 'pointer' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: SELLER INFO */}
                            {step === 4 && (
                                <div className="form-grid-modern">
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Full Name <span className="required-mark">*</span></label>
                                        <input 
                                            {...register('sellerName')}
                                            className={`form-input-modern ${errors.sellerName ? 'input-error' : ''}`} 
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.sellerName && <p className="form-error-message">{errors.sellerName.message}</p>}
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Email Address</label>
                                        <input 
                                            {...register('sellerEmail')}
                                            className="form-input-modern" 
                                            readOnly 
                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Phone Number <span className="required-mark">*</span></label>
                                        <input 
                                            type="tel" {...register('sellerPhone')}
                                            placeholder="10-digit mobile number"
                                            className={`form-input-modern ${errors.sellerPhone ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.sellerPhone && <p className="form-error-message">{errors.sellerPhone.message}</p>}
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">WhatsApp (Optional)</label>
                                        <input 
                                            type="tel" {...register('whatsappNumber')}
                                            className={`form-input-modern ${errors.whatsappNumber ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.whatsappNumber && <p className="form-error-message">{errors.whatsappNumber.message}</p>}
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Pickup City <span className="required-mark">*</span></label>
                                        <input 
                                            {...register('sellerCity')}
                                            className={`form-input-modern ${errors.sellerCity ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.sellerCity && <p className="form-error-message">{errors.sellerCity.message}</p>}
                                    </div>
                                    <div className="form-group-modern">
                                        <label className="form-label-modern">Pickup Landmark <span className="required-mark">*</span></label>
                                        <input 
                                            {...register('pickupLocation')}
                                            placeholder="e.g. Near Ram Kund"
                                            className={`form-input-modern ${errors.pickupLocation ? 'input-error' : ''}`}
                                            readOnly={isEditMode}
                                            style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                                        />
                                        {errors.pickupLocation && <p className="form-error-message">{errors.pickupLocation.message}</p>}
                                    </div>
                                    <div className="form-group-modern form-span-2">
                                        <label className="form-label-modern">Full Pickup Address <span className="required-mark">*</span></label>
                                        <textarea 
                                            {...register('sellerAddress')}
                                            rows="2" 
                                            className={`form-textarea-modern ${errors.sellerAddress ? 'input-error' : ''}`}
                                            style={isEditMode ? { resize: 'none', backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : { resize: 'none' }}
                                            readOnly={isEditMode}
                                        ></textarea>
                                        {errors.sellerAddress && <p className="form-error-message">{errors.sellerAddress.message}</p>}
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: REVIEW */}
                            {step === 5 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    <div style={{ background: '#fff9f0', border: '1px solid #ffe2ce', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px' }}>
                                        <AlertCircle className="text-orange-600" style={{ flexShrink: 0 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a2a18', fontWeight: '500' }}>
                                            Please review your details. False info or low-quality images may lead to rejection. Your product goes live after operator approval.
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', background: '#fdf8f4', borderRadius: '12px', padding: '20px', border: '1px solid #fee2ce' }}>
                                        <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #fff', flexShrink: 0 }}>
                                            <img src={previews.thumbnail} alt="Final Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{formValues.productName}</h3>
                                            
                                            {/* Price Calculation Display */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                {parseFloat(formValues.discountedPrice) > 0 ? (
                                                    <>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ff6b00' }}>
                                                                ₹{Math.max(0, parseFloat(formValues.price) - parseFloat(formValues.discountedPrice))}
                                                            </span>
                                                            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9rem' }}>₹{formValues.price}</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: '600' }}>
                                                            (Includes ₹{formValues.discountedPrice} discount)
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ff6b00' }}>
                                                        ₹{formValues.price}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666' }}>{formValues.category} • Stock: {formValues.stockQuantity}</p>
                                        </div>
                                    </div>

                                    <div className="form-grid-modern">
                                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888' }}>Seller Info</h4>
                                            <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '700' }}>{formValues.sellerName}</p>
                                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#555' }}>{formValues.sellerCity}, {formValues.pickupLocation}</p>
                                        </div>
                                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', textTransform: 'uppercase', color: '#888' }}>Contact Info</h4>
                                            <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '700' }}>{formValues.sellerPhone}</p>
                                            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#555' }}>{formValues.sellerEmail}</p>
                                        </div>
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '10px 0' }}>
                                        <input type="checkbox" required style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: '#ff6b00' }} />
                                        <span style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.4' }}>
                                            I certify that I am the legal owner of this product and it complies with the marketplace guidelines.
                                        </span>
                                    </label>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Navigation Footer */}
                    <div className="form-actions-modern" style={{ padding: '25px 30px', background: '#f9f9f9', borderTop: '1px solid #eee', marginTop: 0, justifyContent: 'space-between' }}>
                        <button 
                            type="button"
                            onClick={step === 1 ? onClose : () => setStep(step - 1)}
                            className="btn-dashboard-secondary"
                            style={{ padding: '12px 30px' }}
                        >
                            {step === 1 ? 'Cancel' : 'Previous'}
                        </button>
                        
                        {step < 5 ? (
                            <button 
                                type="button"
                                onClick={validateStep}
                                className="btn-dashboard-primary"
                                style={{ padding: '12px 40px' }}
                            >
                                Next Step <ChevronRight size={18} style={{ marginLeft: '5px' }} />
                            </button>
                        ) : (
                            <button 
                                type="submit"
                                form="sell-product-form"
                                disabled={loading}
                                className="btn-dashboard-primary"
                                style={{ padding: '12px 50px', background: '#2e7d32' }}
                            >
                                {loading ? 'Submitting...' : (initialData ? 'Update & Resubmit' : 'Submit Product')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default ProductSubmissionModal;
