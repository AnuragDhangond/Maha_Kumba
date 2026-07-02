import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { State, City } from 'country-state-city';
import Swal from 'sweetalert2';
import '../../styles/ShopPage.css';
import { X, CheckCircle, MapPin, ShoppingCart, Trash2, Plus, Minus, ChevronLeft, AlertCircle, ClipboardCopy, Hourglass, LifeBuoy, MapPinned, PackageCheck, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userAddressSchema } from '../../schemas/shopSchemas';
import { scrollAndFocusError } from '../../utils/validationUtils';
import HeadingOrnament from '../../components/HeadingOrnament';
import rudrakshaImg from '../../assets/rudraksha_mala.png';
import ganeshaImg from '../../assets/ganesha_idol.png';
import potteryImg from '../../assets/blue_pottery.png';
import prasadImg from '../../assets/prasad_box.png';
import brassDiyaImg from '../../assets/brass_diya.png';
import incenseImg from '../../assets/incense_sticks.png';
import shopHeroImg from '../../assets/shop_hero.png';
import shopService from '../../operatordashboard/services/shopService';
import useAuthStore from '../../store/authStore';
import ProductSubmissionModal from '../../components/shop/ProductSubmissionModal';

// New high-quality images
import gangaJalImg from '../../assets/ganga_jal.png';
import sandalwoodImg from '../../assets/sandalwood.png';
import tulsiMalaImg from '../../assets/tulsi_mala_new.png';
import poojaThaliImg from '../../assets/pooja_thali.png';
import shivalingamImg from '../../assets/shivalingam.png';

// Sample shop data 


const ShopPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const [artisanModalOpen, setArtisanModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [activeOrderTab, setActiveOrderTab] = useState('active');
    const [visiblePastCount, setVisiblePastCount] = useState(3);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [artisansData, setArtisansData] = useState([]);

    // Checkout states: 0 = Cart, 1 = Address, 2 = Payment, 3 = Success
    const [checkoutStep, setCheckoutStep] = useState(0);
    const [placedOrderId, setPlacedOrderId] = useState(null);

    // Saved address states
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        trigger,
        formState: { errors: addressErrors }
    } = useForm({
        resolver: zodResolver(userAddressSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '', phone: '', pincode: '', houseNo: '', area: '', landmark: '', city: '', state: '', stateCode: '', cityVillage: '', addressType: 'Home'
        }
    });

    const addressDetails = watch();

    const resetAddressForm = () => {
        reset({
            name: '', phone: '', pincode: '', houseNo: '', area: '', landmark: '', city: '', state: '', stateCode: '', cityVillage: '', addressType: 'Home'
        });
    };


    const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);
    const citiesOfState = useMemo(() => addressDetails.stateCode ? City.getCitiesOfState('IN', addressDetails.stateCode) : [], [addressDetails.stateCode]);
    const [isOtherCity, setIsOtherCity] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [animateCart, setAnimateCart] = useState(false);

    const fetchProducts = async (category = '', query = '') => {
        try {
            const params = { page: 0, size: 50 };
            if (category) params.category = category;
            if (query) params.query = query;
            
            const res = await shopService.getPublicProducts(params);
            let publicProducts = res.data.content || res.data || [];
            
            setProducts(publicProducts);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUserOrders = async () => {
        if (!isAuthenticated) {
            setUserOrders([]);
            setOrdersError('');
            return;
        }

        setOrdersLoading(true);
        try {
            const res = await shopService.getUserOrders();
            const orders = Array.isArray(res.data) ? res.data : [];
            setUserOrders(orders);
            setOrdersError('');
        } catch (err) {
            console.error('Failed to fetch user orders:', err);
            setOrdersError('Unable to load your orders right now.');
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchUserOrders();
        if (isAuthenticated) {
            shopService.getCart().then(res => {
                if (res.data && res.data.cartItems) {
                    setCart(res.data.cartItems.map(item => ({
                        id: item.productId,
                        title: item.productName,
                        price: item.price,
                        imgSource: item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : `${shopService.API_URL}${item.imageUrl && !item.imageUrl.startsWith('/') ? '/' : ''}${item.imageUrl}`,
                        quantity: item.quantity
                    })));
                }
            }).catch(() => console.log("Cart fetch failed or empty"));
        } else {
            setCart([]);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleLangChange = () => {
            setLang(localStorage.getItem('preferredLang') || 'en');
        };
        window.addEventListener('langchange', handleLangChange);

        fetchProducts();
        shopService.getPublicArtisans().then(res => setArtisansData(res.data)).catch(console.error);


        return () => {
            window.removeEventListener('langchange', handleLangChange);
        };
    }, []);

    const fetchSavedAddresses = async (shouldAutoSelect = true) => {
        try {
            const res = await shopService.getUserAddresses();
            if (res.data) {
                setSavedAddresses(res.data);
                if (shouldAutoSelect) {
                    // If there's a default address, select it
                    const defaultAddress = res.data.find(addr => addr.isDefault);
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.id);
                        populateAddressForm(defaultAddress);
                    } else if (res.data.length > 0) {
                        setSelectedAddressId(res.data[0].id);
                        populateAddressForm(res.data[0]);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to fetch saved addresses", err);
        }
    };

    const populateAddressForm = (address) => {
        reset({
            name: address.name || '',
            phone: address.phone || '',
            pincode: address.pincode || '',
            houseNo: address.houseNo || '',
            area: address.area || '',
            landmark: address.landmark || '',
            city: address.city || '',
            state: address.state || '',
            stateCode: address.stateCode || '',
            cityVillage: address.cityVillage || '',
            addressType: address.addressType || 'Home'
        });
        setIsOtherCity(false);
    };

    const handleSelectSavedAddress = (address) => {
        setSelectedAddressId(address.id);
        populateAddressForm(address);
        setIsEditingAddress(false);
        setEditingAddressId(null);
    };

    const handleAddNewAddressClick = () => {
        setSelectedAddressId(null);
        setIsEditingAddress(false);
        setEditingAddressId(null);
        resetAddressForm();
        setIsOtherCity(false);
    };

    const handleClearAddress = () => {
        setSelectedAddressId(null);
        setIsEditingAddress(false);
        setEditingAddressId(null);
        resetAddressForm();
        setIsOtherCity(false);
    };

    const handleEditAddress = (address, e) => {
        e.stopPropagation();
        setSelectedAddressId(address.id);
        populateAddressForm(address);
        setIsEditingAddress(true);
        setEditingAddressId(address.id);
    };

    const handleDeleteAddress = async (id, e) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this address?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#661a1a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await shopService.deleteUserAddress(id);
                    Swal.fire('Deleted!', 'Address has been deleted.', 'success');
                    
                    if (selectedAddressId === id) {
                        setSelectedAddressId(null);
                        resetAddressForm();
                    }
                    if (editingAddressId === id) {
                        setIsEditingAddress(false);
                        setEditingAddressId(null);
                    }
                    fetchSavedAddresses(false);
                } catch (err) {
                    Swal.fire('Error', 'Failed to delete address.', 'error');
                }
            }
        });
    };

    const handleSaveAddress = async () => {
        const isValid = await trigger();
        if (!isValid) {
            setTimeout(() => {
                scrollAndFocusError(addressErrors);
            }, 50);
            return;
        }

        try {
            const payload = {
                name: addressDetails.name,
                phone: addressDetails.phone,
                pincode: addressDetails.pincode,
                houseNo: addressDetails.houseNo,
                area: addressDetails.area,
                landmark: addressDetails.landmark,
                city: addressDetails.city,
                state: addressDetails.state,
                stateCode: addressDetails.stateCode,
                cityVillage: addressDetails.cityVillage,
                addressType: addressDetails.addressType || 'Home',
                isDefault: savedAddresses.length === 0
            };

            if (isEditingAddress && editingAddressId) {
                await shopService.updateUserAddress(editingAddressId, payload);
                Swal.fire('Updated!', 'Address updated successfully.', 'success');
            } else {
                await shopService.saveUserAddress(payload);
                Swal.fire('Saved!', 'New address saved successfully.', 'success');
            }

            setIsEditingAddress(false);
            setEditingAddressId(null);
            resetAddressForm();
            setIsOtherCity(false);
            fetchSavedAddresses(false);
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Failed to save address.';
            Swal.fire('Error', errMsg, 'error');
        }
    };

    useEffect(() => {
        if (checkoutStep === 1 && isAuthenticated) {
            fetchSavedAddresses();
        }
    }, [checkoutStep, isAuthenticated]);

    const { t } = useTranslation();

    const orderSteps = ['Ordered', 'Prasad Prepared / Packed', 'Dispatched / In Transit', 'Out for Delivery', 'Delivered'];
    const statusAliases = {
        pending: 0,
        ordered: 0,
        confirmed: 0,
        processing: 1,
        packed: 1,
        'prasad prepared / packed': 1,
        shipped: 2,
        'in transit': 2,
        dispatched: 2,
        'dispatched / in transit': 2,
        'out for delivery': 3,
        delivered: 4,
    };

    const normalizeStatus = (order) => (
        order?.tracking?.currentStatus ||
        order?.deliveryStatus ||
        order?.orderStatus ||
        'Ordered'
    );

    const getStepIndex = (status) => {
        const normalized = String(status || '').trim().toLowerCase();
        return statusAliases[normalized] ?? 0;
    };

    const isPastOrder = (order) => {
        const normalized = normalizeStatus(order).toLowerCase();
        return ['delivered', 'cancelled', 'refunded'].some(status => normalized.includes(status));
    };

    const activeOrders = useMemo(() => userOrders.filter(order => !isPastOrder(order)), [userOrders]);
    const pastOrders = useMemo(() => userOrders.filter(isPastOrder), [userOrders]);

    const formatOrderDate = (dateValue) => {
        if (!dateValue) return 'Pending';
        return new Date(dateValue).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);
        return `Rs ${amount.toLocaleString('en-IN')}`;
    };

    const getOrderAmount = (order) => order.grandTotal || order.totalAmount || 0;

    const getPrimaryItem = (order) => {
        const item = order.orderItems?.[0];
        return {
            name: item?.productName || 'Mahakumbh Shop Order',
            image: item?.imageUrl
                ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${shopService.API_URL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`)
                : prasadImg,
        };
    };

    const copyTrackingNumber = async (trackingNumber) => {
        if (!trackingNumber) return;
        try {
            await navigator.clipboard.writeText(trackingNumber);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Tracking number copied',
                showConfirmButton: false,
                timer: 1400
            });
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleSellProductClick = () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'info',
                title: 'Sign In Required',
                text: 'You need to be logged in to sell products on Mahakumbh Marketplace.',
                confirmButtonColor: '#ff6b00',
                showCancelButton: true,
                confirmButtonText: 'Login Now'
            }).then(result => {
                if (result.isConfirmed) navigate('/login');
            });
            return;
        }
        setIsSellModalOpen(true);
    };

    const handleNeedHelpClick = () => {
        let titleText = '';
        let contentHtml = '';

        if (lang === 'hi') {
            titleText = 'सहायता और दिशानिर्देश';
            contentHtml = `
                <div style="text-align: left; font-family: sans-serif; line-height: 1.6; font-size: 0.95rem; color: #444;">
                    <div style="background: #fff9f0; border-left: 4px solid #ff6b00; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #ff6b00; font-size: 1.05rem;">📞 पूछताछ और सहायता (24/7)</h4>
                        <p style="margin: 4px 0;"><strong>मेला पूछताछ (टोल-फ्री):</strong> <a href="tel:18002334600" style="color: #ff6b00; font-weight: bold; text-decoration: none;">1800 233 4600</a></p>
                        <p style="margin: 4px 0;"><strong>दुकान और वितरण सहायता:</strong> <a href="tel:+912245678901" style="color: #ff6b00; font-weight: bold; text-decoration: none;">+91 22 4567 8901</a></p>
                        <p style="margin: 4px 0;"><strong>ईमेल सहायता:</strong> <a href="mailto:support@mahakumbh.in" style="color: #ff6b00; font-weight: bold; text-decoration: none;">support@mahakumbh.in</a></p>
                    </div>
                    <div style="margin-top: 15px; background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 1.05rem; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">📦 ऑर्डर और डिलीवरी दिशानिर्देश</h4>
                        <ul style="margin: 0; padding-left: 18px; color: #555;">
                            <li style="margin-bottom: 6px;">डिलीवरी में सामान्यतः 3-5 कार्य दिवस लगते हैं।</li>
                            <li style="margin-bottom: 6px;">अपने ऑर्डर की स्थिति ट्रैक करने के लिए दिए गए ट्रैकिंग नंबर का उपयोग करें।</li>
                            <li style="margin-bottom: 6px;">किसी भी उत्पाद संबंधी पूछताछ के लिए, कृपया राम कुंड के पास स्थित मुख्य सहायता डेस्क पर जाएँ।</li>
                        </ul>
                    </div>
                </div>
            `;
        } else if (lang === 'mr') {
            titleText = 'मदत आणि मार्गदर्शक तत्त्वे';
            contentHtml = `
                <div style="text-align: left; font-family: sans-serif; line-height: 1.6; font-size: 0.95rem; color: #444;">
                    <div style="background: #fff9f0; border-left: 4px solid #ff6b00; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #ff6b00; font-size: 1.05rem;">📞 चौकशी आणि मदत (24/7)</h4>
                        <p style="margin: 4px 0;"><strong>मेळा चौकशी (टोल-फ्री):</strong> <a href="tel:18002334600" style="color: #ff6b00; font-weight: bold; text-decoration: none;">1800 233 4600</a></p>
                        <p style="margin: 4px 0;"><strong>दुकान आणि वितरण मदत:</strong> <a href="tel:+912245678901" style="color: #ff6b00; font-weight: bold; text-decoration: none;">+91 22 4567 8901</a></p>
                        <p style="margin: 4px 0;"><strong>ईमेल मदत:</strong> <a href="mailto:support@mahakumbh.in" style="color: #ff6b00; font-weight: bold; text-decoration: none;">support@mahakumbh.in</a></p>
                    </div>
                    <div style="margin-top: 15px; background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 1.05rem; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">📦 ऑर्डर आणि डिलिव्हरी मार्गदर्शक तत्त्वे</h4>
                        <ul style="margin: 0; padding-left: 18px; color: #555;">
                            <li style="margin-bottom: 6px;">डिलिव्हरीसाठी साधारणपणे ३-५ कामाचे दिवस लागतात.</li>
                            <li style="margin-bottom: 6px;">तुमच्या ऑर्डरची स्थिती ट्रॅक करण्यासाठी दिलेल्या ट्रॅकिंग नंबरचा वापर करा.</li>
                            <li style="margin-bottom: 6px;">उत्पादनाशी संबंधित कोणत्याही समस्येसाठी, कृपया राम कुंडाजवळील मुख्य मदत डेस्कला भेट द्या.</li>
                        </ul>
                    </div>
                </div>
            `;
        } else if (lang === 'sa') {
            titleText = 'साहाय्यं मार्गदर्शिका च';
            contentHtml = `
                <div style="text-align: left; font-family: sans-serif; line-height: 1.6; font-size: 0.95rem; color: #444;">
                    <div style="background: #fff9f0; border-left: 4px solid #ff6b00; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #ff6b00; font-size: 1.05rem;">📞 पृच्छा साहाय्यं च (24/7)</h4>
                        <p style="margin: 4px 0;"><strong>मेला-पृच्छा (टोल-फ्री):</strong> <a href="tel:18002334600" style="color: #ff6b00; font-weight: bold; text-decoration: none;">1800 233 4600</a></p>
                        <p style="margin: 4px 0;"><strong>विपणि वितरण साहाय्यम्:</strong> <a href="tel:+912245678901" style="color: #ff6b00; font-weight: bold; text-decoration: none;">+91 22 4567 8901</a></p>
                        <p style="margin: 4px 0;"><strong>ईमेल साहाय्यम्:</strong> <a href="mailto:support@mahakumbh.in" style="color: #ff6b00; font-weight: bold; text-decoration: none;">support@mahakumbh.in</a></p>
                    </div>
                    <div style="margin-top: 15px; background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 1.05rem; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">📦 आदेशः वितरण-मार्गदर्शिका च</h4>
                        <ul style="margin: 0; padding-left: 18px; color: #555;">
                            <li style="margin-bottom: 6px;">वितरणाय सामान्यतः ३-५ कार्यदिनाः अपेक्षन्ते।</li>
                            <li style="margin-bottom: 6px;">भवतः आदेशस्य स्थितिं अनुवर्तितुं दत्तस्य अनुवर्तन-सङ्ख्यायाः उपयोगं कुर्वन्तु।</li>
                            <li style="margin-bottom: 6px;">कस्यापि उत्पादसम्बद्ध-समस्यायाः कृते, कृपया रामकुण्डसमीपे स्थितां मुख्यसहायतामञ्चं गच्छन्तु।</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            titleText = 'Support & Guidelines';
            contentHtml = `
                <div style="text-align: left; font-family: sans-serif; line-height: 1.6; font-size: 0.95rem; color: #444;">
                    <div style="background: #fff9f0; border-left: 4px solid #ff6b00; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #ff6b00; font-size: 1.05rem;">📞 Inquiry & Support (24/7)</h4>
                        <p style="margin: 4px 0;"><strong>Mela Inquiry (Toll-Free):</strong> <a href="tel:18002334600" style="color: #ff6b00; font-weight: bold; text-decoration: none;">1800 233 4600</a></p>
                        <p style="margin: 4px 0;"><strong>Shop & Delivery Support:</strong> <a href="tel:+912245678901" style="color: #ff6b00; font-weight: bold; text-decoration: none;">+91 22 4567 8901</a></p>
                        <p style="margin: 4px 0;"><strong>Email Support:</strong> <a href="mailto:support@mahakumbh.in" style="color: #ff6b00; font-weight: bold; text-decoration: none;">support@mahakumbh.in</a></p>
                    </div>
                    <div style="margin-top: 15px; background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 1.05rem; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">📦 Order & Delivery Guidelines</h4>
                        <ul style="margin: 0; padding-left: 18px; color: #555;">
                            <li style="margin-bottom: 6px;">Delivery typically takes 3-5 business days.</li>
                            <li style="margin-bottom: 6px;">Use the provided tracking number to check the delivery progress.</li>
                            <li style="margin-bottom: 6px;">For any product related issues, please visit the main help desk located near Ram Kund.</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        Swal.fire({
            title: titleText,
            html: contentHtml,
            showCloseButton: true,
            confirmButtonText: lang === 'hi' ? 'ठीक है' : (lang === 'mr' ? 'ठीक आहे' : (lang === 'sa' ? 'अस्तु' : 'Close')),
            confirmButtonColor: '#ff6b00',
        });
    };


    const handleAddToCart = async (item) => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please log in to add items to your cart and complete purchases.',
                confirmButtonColor: '#ff6b00',
                confirmButtonText: 'Go to Login',
                showCancelButton: true,
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) navigate('/login');
            });
            return;
        }

        const productFromStore = products.find(p => Number(p.id) === Number(item.id));
        const stockQty = (productFromStore && productFromStore.stockQuantity != null) ? productFromStore.stockQuantity : (item.stockQuantity != null ? item.stockQuantity : Infinity);

        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        const currentQty = existingItem ? existingItem.quantity : 0;

        if (stockQty === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Out of Stock',
                text: 'Currently unavailable product',
                confirmButtonColor: '#ff6b00'
            });
            return;
        } else if (currentQty >= stockQty) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Limit Reached',
                text: `We only have ${stockQty} in stock!`,
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        // Update local UI state immediately
        setCart(prevCart => {
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1, stockQuantity: stockQty }];
        });
        setAnimateCart(true);
        setTimeout(() => setAnimateCart(false), 500);

        // Try syncing to backend silently
        try {
            await shopService.addToCart(item.id, 1);
        } catch (e) {
            console.error("Cart backend sync failed (possibly guest user):", e);
        }
    };

    const updateQuantity = async (id, delta) => {
        const item = cart.find(cartItem => Number(cartItem.id) === Number(id));
        if (!item) {
            console.error("Item not found in cart:", id);
            return;
        }

        const productFromStore = products.find(p => Number(p.id) === Number(id));
        const stockQty = (productFromStore && productFromStore.stockQuantity != null) ? productFromStore.stockQuantity : (item.stockQuantity != null ? item.stockQuantity : Infinity);

        if (delta > 0 && item.quantity >= stockQty) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Limit Reached',
                text: `We only have ${stockQty} in stock!`,
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        const newQuantity = item.quantity + delta;
        console.log(`Updating quantity for ${id}: ${item.quantity} + ${delta} = ${newQuantity}`);

        // Optimistic UI Update
        if (newQuantity <= 0) {
            setCart(prevCart => prevCart.filter(c => Number(c.id) !== Number(id)));
        } else {
            setCart(prevCart => prevCart.map(c => Number(c.id) === Number(id) ? { ...c, quantity: newQuantity } : c));
        }

        try {
            if (newQuantity <= 0) {
                await shopService.removeFromCart(id);
                console.log(`Successfully removed item ${id} from backend`);
            } else {
                // If delta is -1, try removing and re-adding as a workaround if direct decrement fails
                if (delta < 0) {
                    await shopService.removeFromCart(id);
                    await shopService.addToCart(id, newQuantity);
                    console.log(`Successfully removed and re-added item ${id} with quantity ${newQuantity}`);
                } else {
                    await shopService.addToCart(id, delta);
                    console.log(`Successfully updated item ${id} quantity in backend by ${delta}`);
                }
            }
        } catch (e) {
            console.error("API update failed", e);
            // Revert on error
            if (newQuantity <= 0) {
                setCart(prev => [...prev, item]);
            } else {
                setCart(prevCart => prevCart.map(c => Number(c.id) === Number(id) ? { ...c, quantity: item.quantity } : c));
            }
        }
    };

    const removeFromCart = async (id) => {
        try {
            await shopService.removeFromCart(id);
            setCart(prevCart => prevCart.filter(item => item.id !== id));
        } catch (e) { console.error(e); }
    };

    const cartTotal = cart.reduce((total, item) => {
        const priceNum = Number(item.price);
        return total + (priceNum * item.quantity);
    }, 0);

    const deliveryCharge = Math.round(cartTotal * 0.08);
    const finalTotal = cartTotal + deliveryCharge;

    const onSubmitAddress = async (data) => {
        try {
            const payload = {
                name: data.name,
                phone: data.phone,
                pincode: data.pincode,
                houseNo: data.houseNo,
                area: data.area,
                landmark: data.landmark,
                city: data.city,
                state: data.state,
                stateCode: data.stateCode,
                addressType: data.addressType || 'Home',
                isDefault: savedAddresses.length === 0
            };

            // Check if this address is already saved
            const isAlreadySaved = savedAddresses.some(addr => 
                addr.name === payload.name &&
                addr.phone === payload.phone &&
                addr.pincode === payload.pincode &&
                addr.houseNo === payload.houseNo &&
                addr.area === payload.area &&
                addr.city === payload.city &&
                addr.state === payload.state
            );

            if (!isAlreadySaved) {
                if (isEditingAddress && editingAddressId) {
                    await shopService.updateUserAddress(editingAddressId, payload);
                } else {
                    await shopService.saveUserAddress(payload);
                }
            }
        } catch (err) {
            console.error("Auto-saving address failed:", err);
        }
        setCheckoutStep(2);
    };

    // Payment input states
    const [upiId, setUpiId] = useState('');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

    // Helper to allow only numeric input
    const handleNumericInput = (e, maxLength) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (maxLength && val.length > maxLength) return e.target.value;
        return val;
    };

    const validatePayment = () => {
        if (paymentMethod === 'UPI') {
            if (!/^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
                Swal.fire('Error', 'Please enter a valid UPI ID', 'error');
                return false;
            }
        } else if (paymentMethod === 'CARD') {
            if (cardDetails.number.length !== 16) {
                Swal.fire('Error', 'Card number must be 16 digits', 'error');
                return false;
            }
            if (cardDetails.expiry.length !== 4) {
                Swal.fire('Error', 'Invalid expiry format (MMYY)', 'error');
                return false;
            }
            if (cardDetails.cvv.length !== 3) {
                Swal.fire('Error', 'CVV must be 3 digits', 'error');
                return false;
            }
        }
        return true;
    };

    const handlePaymentSubmit = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (!validatePayment()) return;

        try {
            const fullAddress = `${addressDetails.houseNo}, ${addressDetails.area}, ${addressDetails.landmark ? addressDetails.landmark + ', ' : ''}${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`;

            const res = await shopService.checkout(fullAddress, paymentMethod, addressDetails.name);
            if (res.data && res.data.orderNumber) {
                setPlacedOrderId(res.data.orderNumber);
            }

            setCheckoutStep(3); // Success Screen
            fetchUserOrders();

            try {
                const updatedProducts = await shopService.getPublicProducts();
                setProducts(updatedProducts.data.content || updatedProducts.data || []);
            } catch (e) {
                console.error("Failed to refresh products after checkout", e);
            }

            setTimeout(() => {
                setCart([]);
                setCheckoutStep(0);
                setIsCartOpen(false);
                setPaymentMethod('');
                setPlacedOrderId(null);
                setUpiId('');
                setCardDetails({ number: '', expiry: '', cvv: '' });
                resetAddressForm();
            }, 6000);
        } catch (e) {
            console.error(e);
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Please login first.";
            alert("Checkout failed. " + errorMsg);
        }
    };

    const closeCart = () => {
        setIsCartOpen(false);
        setCheckoutStep(0);
    };

    const handleReorder = async (order) => {
        const items = order.orderItems || [];
        if (items.length === 0) return;
        for (const item of items) {
            await handleAddToCart({
                id: item.productId,
                title: item.productName,
                price: item.price,
                imgSource: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${shopService.API_URL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`) : prasadImg,
                stockQuantity: 999,
            });
        }
    };

    return (
        <div className="shop-page">
            {/* Hero Section */}
            <section className="shop-hero" style={{ backgroundImage: `url(${shopHeroImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                <div className="shop-hero-overlay"></div>
                <div className="shop-hero-content fade-in-up" style={{ textAlign: 'center', width: '100%' }}>
                    <div className="hero-branding">
                        <span className="hero-badge">{t('divineOfferings')}</span>
                    </div>
                    <h1 className="hero-title">{t('shopHeroTitle')}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <HeadingOrnament variant="diamond" />
                    </div>
                    <div className="hero-divider"></div>
                    <p className="hero-subtitle">
                        {t('shopHeroSubtitle')}
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary-shop" onClick={() => document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' })}>
                            {t('exploreMarketplace')}
                        </button>
                        <button className="btn-secondary-shop" onClick={handleSellProductClick}>
                            Sell Your Product
                        </button>
                    </div>
                </div>
                {/* <div className="hero-scroll-guide">
                    <div className="mouse">
                        <div className="wheel"></div>
                    </div>
                    <span>Scroll to Browse</span>
                </div> */}
            </section>

            {/* Marketplace Section */}
            <section className="marketplace-section" id="marketplace">
                <div className="section-head text-center">
                    <h2 className="shop-section-title">{t('marketplaceTitle')}</h2>
                    <p className="section-description">{t('marketplaceSubtitle')}</p>
                </div>
                <div className="products-grid">
                    {products.map(item => (
                        <div className="product-card" key={item.id}>
                            <div className="product-image-container">
                                <span className="premium-badge">{t('authenticBadge')}</span>
                                <img src={item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : `${shopService.API_URL}${item.imageUrl && !item.imageUrl.startsWith('/') ? '/' : ''}${item.imageUrl}`} alt={item.productName} className="product-real-image" />
                                <div className="overlay-actions">
                                    <button className="quick-view-btn">{t('quickView')}</button>
                                </div>
                            </div>
                            <div className="product-details">
                                <h3 className="product-title">{item.productName}</h3>
                                <p className="product-location">
                                    <MapPin size={14} style={{ marginRight: '6px', color: '#8d8076' }} />
                                    {item.pickupLocation || item.sellerCity || item.category}
                                </p>
                                {item.stockQuantity != null && item.stockQuantity <= 5 && item.stockQuantity > 0 && (
                                    <p style={{ color: '#d32f2f', fontSize: '0.75rem', fontWeight: 'bold', margin: '2px 0' }}>
                                        {t('onlyLeft').replace('{count}', item.stockQuantity)}
                                    </p>
                                )}
                                <div className="product-bottom-row">
                                    <span className="product-price">₹{item.price}</span>
                                    <button className="add-to-cart-btn" onClick={() => handleAddToCart({id: item.id, title: item.productName, price: item.price, imgSource: item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : `${shopService.API_URL}${item.imageUrl && !item.imageUrl.startsWith('/') ? '/' : ''}${item.imageUrl}`})}>
                                        <ShoppingCart size={16} /> {t('addToCart')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Support Local Artisans Section */}
            <section className="artisans-section">
                <div className="artisans-content">
                    <div className="artisans-text">
                        <h2 className="shop-section-title">{t('supportArtisansTitle')}</h2>
                        <HeadingOrnament variant="leaf" />
                        <p>
                            {t('supportArtisansDesc')}
                        </p>
                        <ul className="artisan-benefits">
                            <li><span className="check-icon">✓</span> {t('fairPricing')}</li>
                            <li><span className="check-icon">✓</span> {t('globalReach')}</li>
                            <li><span className="check-icon">✓</span> {t('preservationOfCrafts')}</li>
                        </ul>
                        <button className="btn-artisans-outline" onClick={() => setArtisanModalOpen(true)}>{t('meetArtisans')}</button>
                    </div>
                    <div className="artisans-visual">
                        <div className="artisan-collage">
                            {/* Decorative elements representing artisans with real images from database */}
                            <div className="collage-shape shape-1">
                                <img src={artisansData.length > 0 && artisansData[0]?.imageUrl ? (artisansData[0].imageUrl.includes('localhost:5173/src/') ? artisansData[0].imageUrl.replace('http://localhost:5173/src/', '/src/') : artisansData[0].imageUrl) : potteryImg} alt={artisansData.length > 0 ? artisansData[0].artisanName : "Artisan Pottery"} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            </div>
                            <div className="collage-shape shape-2">
                                <img src={artisansData.length > 1 && artisansData[1]?.imageUrl ? (artisansData[1].imageUrl.includes('spiritual_bg.png') ? ganeshaImg : (artisansData[1].imageUrl.includes('localhost:5173/src/') ? artisansData[1].imageUrl.replace('http://localhost:5173/src/', '/src/') : artisansData[1].imageUrl)) : ganeshaImg} alt={artisansData.length > 1 ? artisansData[1].artisanName : "Artisan Idol"} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            </div>
                            <div className="collage-shape shape-3">
                                <img src={artisansData.length > 2 && artisansData[2]?.imageUrl ? (artisansData[2].imageUrl.includes('sandalwood.png') ? rudrakshaImg : (artisansData[2].imageUrl.includes('localhost:5173/src/') ? artisansData[2].imageUrl.replace('http://localhost:5173/src/', '/src/') : artisansData[2].imageUrl)) : rudrakshaImg} alt={artisansData.length > 2 ? artisansData[2].artisanName : "Handcrafted Mala"} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            </div>                        </div>
                    </div>
                </div>
            </section>

            {/* My Orders Section */}
            <section className="my-orders-section" id="my-orders">
                <div className="orders-shell">
                    <h2 className="orders-title">{t('myOrders', 'My Orders')}</h2>

                    <div className="orders-tabs" role="tablist" aria-label="My orders">
                        <button
                            type="button"
                            className={`orders-tab ${activeOrderTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveOrderTab('active')}
                        >
                            [ {t('activeOrders', 'Active Orders')} ({activeOrders.length}) ]
                            {activeOrders.length > 0 && <span className="orders-tab-dot">{activeOrders.length}</span>}
                        </button>
                        <button
                            type="button"
                            className={`orders-tab ${activeOrderTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveOrderTab('past')}
                        >
                            [ {t('pastOrders', 'Past Orders')} ]
                        </button>
                    </div>

                    {!isAuthenticated ? (
                        <div className="orders-empty-state">
                            <PackageCheck size={34} />
                            <p>{t('loginToViewOrders', 'Log in to view your active and past shop orders.')}</p>
                            <button type="button" onClick={() => navigate('/login')}>{t('loginToViewOrdersBtn', 'Login to View Orders')}</button>
                        </div>
                    ) : ordersLoading ? (
                        <div className="orders-empty-state">
                            <Hourglass size={34} />
                            <p>{t('loadingOrders', 'Loading your Mahakumbh orders...')}</p>
                        </div>
                    ) : ordersError ? (
                        <div className="orders-empty-state error">
                            <AlertCircle size={34} />
                            <p>{ordersError}</p>
                            <button type="button" onClick={fetchUserOrders}>Retry</button>
                        </div>
                    ) : activeOrderTab === 'active' ? (
                        activeOrders.length === 0 ? (
                            <div className="orders-empty-state">
                                <PackageCheck size={34} />
                                <p>{t('noActiveOrders', 'No active orders right now.')}</p>
                            </div>
                        ) : (
                            <div className="active-orders-list">
                                {activeOrders.map(order => {
                                    const primaryItem = getPrimaryItem(order);
                                    const itemCount = order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                                    const status = normalizeStatus(order);
                                    const statusIndex = getStepIndex(status);
                                    const tracking = order.tracking || {};
                                    const mapQuery = encodeURIComponent(tracking.currentLocation || 'Nashik');

                                    return (
                                        <article className="active-order-card" key={order.id || order.orderNumber}>
                                            <div className="order-card-top">
                                                <img src={primaryItem.image} alt={primaryItem.name} className="order-product-thumb" />
                                                <div className="order-card-summary">
                                                    <h3>{t('orderNumber', 'Order')} #{order.orderNumber}</h3>
                                                    <p>{t('placedOn', 'Placed On')}: <strong>{formatOrderDate(order.createdAt)}</strong></p>
                                                    <p>{t('estimatedDelivery', 'Estimated Delivery')}: <strong>{formatOrderDate(tracking.expectedDeliveryDate)}</strong></p>
                                                    <p>{t('amount', 'Amount')}: <strong>{formatCurrency(getOrderAmount(order))} ({itemCount || 1} {itemCount > 1 ? t('items', 'Items') : t('item', 'Item')})</strong></p>
                                                </div>
                                            </div>

                                            <div className="orders-progress" aria-label={`Order status ${status}`}>
                                                {orderSteps.map((step, index) => (
                                                    <div
                                                        key={step}
                                                        className={`orders-progress-step ${index < statusIndex ? 'done' : ''} ${index === statusIndex ? 'current' : ''}`}
                                                    >
                                                        <span className="orders-step-icon">
                                                            {index === statusIndex && index < orderSteps.length - 1 ? <Hourglass size={15} /> : <CheckCircle size={15} />}
                                                        </span>
                                                        <span className="orders-step-label">{step}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="order-detail-lines">
                                                <p><strong>{t('courierPartner', 'Courier Partner')}:</strong> {tracking.courierPartner || 'Mahakumbh Logistics'}</p>
                                                <p>
                                                    <strong>{t('trackingNumber', 'Tracking Number')}:</strong> {tracking.trackingNumber || order.orderNumber}
                                                    <button type="button" className="copy-tracking-btn" onClick={() => copyTrackingNumber(tracking.trackingNumber || order.orderNumber)} aria-label={t('copyTrackingNumber', 'Copy tracking number')}>
                                                        <ClipboardCopy size={15} />
                                                    </button>
                                                </p>
                                                <p><strong>{t('latestUpdate', 'Latest Update')}:</strong> "{tracking.latestUpdate || tracking.currentLocation || status}"</p>
                                            </div>

                                            <div className="order-actions-row">
                                                <button type="button" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${mapQuery}`, '_blank', 'noopener,noreferrer')}>
                                                    <MapPinned size={17} /> {t('trackOnMap', 'Track on Map')}
                                                </button>
                                                <button type="button" onClick={handleNeedHelpClick}>
                                                    <LifeBuoy size={17} /> {t('needHelpSupport', 'Need Help / Support')}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        pastOrders.length === 0 ? (
                            <div className="orders-empty-state">
                                <PackageCheck size={34} />
                                <p>{t('noPastOrders', 'No past orders yet.')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="past-orders-list">
                                    {pastOrders.slice(0, visiblePastCount).map(order => {
                                        const primaryItem = getPrimaryItem(order);
                                        const itemCount = order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                                        const deliveredOn = order.tracking?.updatedAt || order.updatedAt || order.tracking?.expectedDeliveryDate;

                                        return (
                                            <article className="past-order-row" key={order.id || order.orderNumber}>
                                                <img src={primaryItem.image} alt={primaryItem.name} className="order-product-thumb" />
                                                <div className="past-order-main">
                                                    <div className="past-order-header">
                                                        <h3>{t('orderNumber', 'Order')} #{order.orderNumber}</h3>
                                                        <span><CheckCircle size={15} /> {t('deliveredStatus', 'Delivered')}</span>
                                                    </div>
                                                    <div className="past-order-meta">
                                                        <p>{t('placedOn', 'Placed On')}: <strong>{formatOrderDate(order.createdAt)}</strong></p>
                                                        <p>{t('deliveredOn', 'Delivered On')}: <strong>{formatOrderDate(deliveredOn)}</strong></p>
                                                        <p>{t('amount', 'Amount')}: <strong>{formatCurrency(getOrderAmount(order))} ({itemCount || 1} {itemCount > 1 ? t('items', 'Items') : t('item', 'Item')})</strong></p>
                                                    </div>
                                                    <div className="past-order-actions">
                                                        <button type="button" onClick={() => handleReorder(order)}>
                                                            <RotateCcw size={16} /> {t('reorderItems', 'Reorder Item(s)')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                                {pastOrders.length > visiblePastCount && (
                                    <button type="button" className="load-more-orders" onClick={() => setVisiblePastCount(count => count + 3)}>
                                        {t('loadMore', 'Load More')}
                                    </button>
                                )}
                            </>
                        )
                    )}
                </div>
            </section>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button className={`floating-cart-btn yoyo-bounce ${animateCart ? 'blink-cart' : ''}`} onClick={() => setIsCartOpen(true)}>
                    <ShoppingCart size={24} />
                    <span className="cart-badge">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                </button>
            )}

            {/* Cart & Checkout Modal */}
            {isCartOpen && (

                <div className="track-modal-overlay" onClick={checkoutStep === 3 ? null : closeCart}>
                    
                    <div className="track-modal cart-modal" onClick={(e) => e.stopPropagation()}>
                  
                        {checkoutStep !== 3 && (
                            <button className="track-modal-close" onClick={closeCart}>
                                <X size={24} />
                            </button>
                        )}
                        <div className="track-modal-header cart-multi-header" style={{ flexDirection: 'column' }}>
                            {checkoutStep > 0 && checkoutStep < 3 && (
                                <button className="modal-back-btn" onClick={() => setCheckoutStep(step => step - 1)} style={{ alignSelf: 'flex-start', position: 'absolute', left: '20px', top: '25px' }}>
                                    <ChevronLeft size={20} /> {t('back')}
                                </button>
                            )}
                            
                            
                            {/* PROGRESS TRACKER */}
                            {checkoutStep < 3 && (
                                <div className="cart-progress-tracker">
                                    <div className={`progress-node ${checkoutStep >= 0 ? 'active' : ''}`}>
                                        <div className="progress-icon"><CheckCircle size={14} /></div>
                                        <span>Cart</span>
                                    </div>
                                    <div className={`progress-line ${checkoutStep >= 1 ? 'active' : ''}`}></div>
                                    <div className={`progress-node ${checkoutStep >= 1 ? 'active' : ''}`}>
                                        <div className="progress-icon"><CheckCircle size={14} /></div>
                                        <span>Delivery Address</span>
                                    </div>
                                    <div className={`progress-line ${checkoutStep >= 2 ? 'active' : ''}`}></div>
                                    <div className={`progress-node ${checkoutStep >= 2 ? 'active' : ''}`}>
                                        <div className="progress-icon"><CheckCircle size={14} /></div>
                                        <span>Payment</span>
                                    </div>
                                </div>
                            )}

                            <div style={{ flex: 1, textAlign: 'center', width: '100%' }}>
                                <h2 className="track-modal-title">
                                    {checkoutStep === 0 && 'Your Cart'}
                                    {checkoutStep === 1 && t('deliveryAddress')}
                                    {checkoutStep === 2 && t('paymentOption')}
                                    {checkoutStep === 3 && t('orderConfirmed')}
                                </h2>
                            </div>
                        </div>

                        <div className="track-modal-body cart-modal-body">
                            {/* STEP 0: CART ITEMS */}
                            {checkoutStep === 0 && (
                                cart.length === 0 ? (
                                    <div className="cart-empty-state">
                                        <ShoppingCart size={48} color="#ccc" />
                                        <p>{t('cartEmpty')}</p>
                                        <button className="btn-primary-shop" onClick={closeCart}>{t('continueShopping')}</button>
                                    </div>
                                ) : (
                                    <div className="cart-layout-grid">
                                        <div className="cart-left-col">
                                            <div className="cart-items-list">
                                                {cart.map(item => {
                                                    const productFromStore = products.find(p => Number(p.id) === Number(item.id));
                                                    const stockQty = productFromStore ? productFromStore.stockQuantity : item.stockQuantity;
                                                    const priceNum = Number(item.price);
                                                    return (
                                                        <div className="cart-item" key={item.id}>
                                                            <div className="cart-item-image">
                                                                <img src={item.imgSource} alt={item.title} />
                                                            </div>
                                                            <div className="cart-item-details">
                                                                <h4>{item.title}</h4>
                                                                <p className="cart-item-desc">{productFromStore?.description?.substring(0, 40) || 'Authentic Kumbh product'}</p>
                                                                <div className="cart-item-price-wrapper">
                                                                    <p className="cart-item-price">
                                                                        {item.quantity === 1 ? `₹${priceNum} each` : `₹${priceNum * item.quantity}`}
                                                                    </p>
                                                                    {item.quantity > 1 && (
                                                                        <p className="cart-item-price-calc">({item.quantity} x ₹{priceNum})</p>
                                                                    )}
                                                                </div>
                                                                {stockQty != null && stockQty <= 5 && stockQty > 0 && (
                                                                    <p style={{ color: '#d32f2f', fontSize: '0.75rem', fontWeight: 'bold', margin: '4px 0 0' }}>
                                                                        {t('onlyLeft').replace('{count}', stockQty)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="cart-item-right">
                                                                <div className="quantity-controls">
                                                                    <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                                                    <span>{item.quantity}</span>
                                                                    <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                                                </div>
                                                                <button className="remove-item-btn-text" onClick={() => removeFromCart(item.id)}>
                                                                    <Trash2 size={14} /> Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* SUGGESTED PRODUCTS */}
                                            <div className="suggested-section">
                                                <h3>You Might Also Need</h3>
                                                <div className="suggested-grid">
                                                    {products.slice(0, 3).map(p => (
                                                        <div className="suggested-card" key={p.id}>
                                                            <div className="suggested-img">
                                                                <img src={p.imageUrl && p.imageUrl.startsWith('http') ? p.imageUrl : `${shopService.API_URL}${p.imageUrl && !p.imageUrl.startsWith('/') ? '/' : ''}${p.imageUrl}`} alt={p.productName} />
                                                            </div>
                                                            <div className="suggested-info">
                                                                <h4>{p.productName.length > 25 ? p.productName.substring(0, 25) + '...' : p.productName}</h4>
                                                                <button className="add-btn-small" onClick={() => handleAddToCart({id: p.id, title: p.productName, price: p.price, imgSource: p.imageUrl && p.imageUrl.startsWith('http') ? p.imageUrl : `${shopService.API_URL}${p.imageUrl && !p.imageUrl.startsWith('/') ? '/' : ''}${p.imageUrl}`})}>Add +</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="cart-right-col">
                                            <div className="cart-summary">
                                                <h3>Cart Summary</h3>
                                                <div className="cart-summary-row">
                                                    <span>Items ({cart.length}):</span>
                                                    <span>₹{cartTotal}</span>
                                                </div>
                                                <div className="cart-summary-row">
                                                    <span>Delivery Charge:</span>
                                                    {deliveryCharge === 0 ? (
                                                        <span className="free-delivery">{t('free')}</span>
                                                    ) : (
                                                        <span>₹{deliveryCharge}</span>
                                                    )}
                                                </div>
                                                <div className="cart-summary-row total-row">
                                                    <span>Total Amount:</span>
                                                    <span>₹{finalTotal}</span>
                                                </div>
                                                <button className="btn-proceed" onClick={() => setCheckoutStep(1)}>Proceed to Delivery Address</button>
                                                <a className="add-more-link" onClick={closeCart}>Add more items</a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* STEP 1: ADDRESS */}
                            {checkoutStep === 1 && (
                                <div className="address-layout-single" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                                    <div className="address-layout-left">
                                        
                                        {/* Saved Addresses Section */}
                                        {savedAddresses.length > 0 && (
                                            <div className="saved-addresses-section" style={{ marginBottom: '25px' }}>
                                                <h3 className="delivery-section-title">Select Saved Address</h3>
                                                <div className="saved-addresses-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {savedAddresses.map(addr => (
                                                        <div 
                                                            key={addr.id} 
                                                            className={`saved-address-box ${selectedAddressId === addr.id ? 'active-address' : ''}`}
                                                            onClick={() => handleSelectSavedAddress(addr)}
                                                        >
                                                            <p><strong>{addr.name}</strong>, {addr.phone}</p>
                                                            <p>{addr.houseNo}, {addr.area}, {addr.cityVillage ? addr.cityVillage + ', ' : ''}{addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode} ({addr.addressType})</p>
                                                            <div className="saved-address-actions">
                                                                {selectedAddressId === addr.id ? (
                                                                    <span className="selected-text">[✓ Selected]</span>
                                                                ) : (
                                                                    <span className="select-text" style={{ color: 'var(--primary-color)', cursor: 'pointer' }}>[Select]</span>
                                                                )}
                                                                <span className="edit-text" onClick={(e) => handleEditAddress(addr, e)}>[Edit]</span>
                                                                <span className="delete-text" onClick={(e) => handleDeleteAddress(addr.id, e)}>[Delete]</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button 
                                                    className="btn-add-new-address"
                                                    onClick={handleAddNewAddressClick}
                                                    style={{ marginTop: '15px', padding: '10px 15px', background: 'transparent', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                                                >
                                                    + Add New Address
                                                </button>
                                            </div>
                                        )}

                                        {/* Add New Address Form */}
                                        <div className="add-address-section">
                                            <h3 className="delivery-section-title">
                                                {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                                            </h3>
                                            <form onSubmit={handleSubmit(onSubmitAddress, scrollAndFocusError)}>
                                                <div className="address-form-grid">
                                                    {/* Row 1 */}
                                                    <div className="form-group">
                                                        <label>{t('fullName')}</label>
                                                        <input 
                                                            type="text" 
                                                            {...register('name', {
                                                                pattern: {
                                                                    value: /^[A-Za-z\s]+$/,
                                                                    message: 'Full Name should only contain letters and spaces'
                                                                }
                                                            })} 
                                                            className={`address-input ${addressErrors.name ? 'invalid' : ''}`} 
                                                        />
                                                        {addressErrors.name && <div className="form-error-message">{addressErrors.name.message}</div>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('phoneNumber')}</label>
                                                        <input type="tel" {...register('phone')} className={`address-input ${addressErrors.phone ? 'invalid' : ''}`} />
                                                        {addressErrors.phone && <div className="form-error-message">{addressErrors.phone.message}</div>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('pincode')}</label>
                                                        <input type="text" {...register('pincode')} maxLength="6" className={`address-input ${addressErrors.pincode ? 'invalid' : ''}`} />
                                                        {addressErrors.pincode && <div className="form-error-message">{addressErrors.pincode.message}</div>}
                                                    </div>

                                                    {/* Row 2 */}
                                                    <div className="form-group">
                                                        <label>{t('state')}</label>
                                                        <select
                                                            {...register('stateCode')}
                                                            value={addressDetails.stateCode || ''}
                                                            className={`address-input ${addressErrors.stateCode ? 'invalid' : ''}`}
                                                            onChange={e => {
                                                                const code = e.target.value;
                                                                const stateObj = indianStates.find(s => s.isoCode === code);
                                                                setIsOtherCity(false);
                                                                setValue('stateCode', code, { shouldValidate: true });
                                                                setValue('state', stateObj ? stateObj.name : '', { shouldValidate: true });
                                                                setValue('city', '', { shouldValidate: true });
                                                            }}
                                                        >
                                                            <option value="" disabled>{t('selectState')}</option>
                                                            {indianStates.map(state => (
                                                                <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                                            ))}
                                                        </select>
                                                        {addressErrors.stateCode && <div className="form-error-message">{addressErrors.stateCode.message}</div>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('cityDistrict')}</label>
                                                        <select
                                                            {...register('city')}
                                                            value={isOtherCity ? 'Other' : (addressDetails.city || '')}
                                                            className={`address-input ${addressErrors.city ? 'invalid' : ''}`}
                                                            onChange={e => {
                                                                if (e.target.value === 'Other') {
                                                                    setIsOtherCity(true);
                                                                    setValue('city', '', { shouldValidate: true });
                                                                } else {
                                                                    setIsOtherCity(false);
                                                                    setValue('city', e.target.value, { shouldValidate: true });
                                                                }
                                                            }}
                                                            disabled={!addressDetails.stateCode}
                                                        >
                                                            <option value="" disabled>{t('selectCity')}</option>
                                                            {citiesOfState.map(city => (
                                                                <option key={`${city.name}-${city.latitude}`} value={city.name}>{city.name}</option>
                                                            ))}
                                                            {addressDetails.stateCode && <option value="Other">{t('other')}</option>}
                                                        </select>
                                                        {addressErrors.city && <div className="form-error-message">{addressErrors.city.message}</div>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('cityVillage')}</label>
                                                        <input
                                                            type="text"
                                                            {...register('cityVillage')}
                                                            className={`address-input ${addressErrors.cityVillage ? 'invalid' : ''}`}
                                                        />
                                                        {addressErrors.cityVillage && <div className="form-error-message">{addressErrors.cityVillage.message}</div>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('houseNoBuilding')}</label>
                                                        <input type="text" {...register('houseNo')} className={`address-input ${addressErrors.houseNo ? 'invalid' : ''}`} />
                                                        {addressErrors.houseNo && <div className="form-error-message">{addressErrors.houseNo.message}</div>}
                                                    </div>

                                                    {/* Extra manual city field if Other is selected */}
                                                    {isOtherCity && (
                                                        <div className="form-group col-span-2">
                                                            <label>{t('enterCityNameManually')}</label>
                                                            <input
                                                                type="text"
                                                                {...register('city')}
                                                                placeholder={t('typeYourCityName')}
                                                                className={`address-input ${addressErrors.city ? 'invalid' : ''}`}
                                                            />
                                                            {addressErrors.city && <div className="form-error-message">{addressErrors.city.message}</div>}
                                                        </div>
                                                    )}

                                                    {/* Row 3 */}
                                                    <div className="form-group">
                                                        <label>{t('streetColonyArea')}</label>
                                                        <input type="text" {...register('area')} className={`address-input ${addressErrors.area ? 'invalid' : ''}`} />
                                                        {addressErrors.area && <div className="form-error-message">{addressErrors.area.message}</div>}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>{t('landmarkOptional')}</label>
                                                        <input type="text" {...register('landmark')} className="address-input" />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Address Type</label>
                                                        <div className="radio-group-inline">
                                                            <label className="radio-label">
                                                                <input 
                                                                    type="radio" 
                                                                    {...register('addressType')}
                                                                    value="Home" 
                                                                /> Home
                                                            </label>
                                                            <label className="radio-label">
                                                                <input 
                                                                    type="radio" 
                                                                    {...register('addressType')}
                                                                    value="Work" 
                                                                /> Work
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="address-action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                                    <button type="button" className="btn-save-outline" onClick={handleClearAddress} style={{ borderColor: '#ccc', color: '#666', flex: 1 }}>
                                                        Clear Address
                                                    </button>
                                                    <button type="button" className="btn-save-outline" onClick={handleSaveAddress} style={{ flex: 1 }}>
                                                        {isEditingAddress ? 'Update Saved Address' : 'Save Address'}
                                                    </button>
                                                    <button type="submit" className="btn-use-address" style={{ flex: 1 }}>USE THIS ADDRESS</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PAYMENT OVERVIEW */}
                            {checkoutStep === 2 && (
                                <div className="payment-step flipkart-style">
                                    <div className="payment-summary-box">
                                        <p>Amount Payable: <strong>₹{finalTotal}</strong></p>
                                    </div>

                                    <h3 className="payment-options-title">Select Payment Method</h3>

                                    {/* UPI Section */}
                                    <div className={`payment-group ${paymentMethod === 'UPI' ? 'expanded' : ''}`}>
                                        <div className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                                            <div className="radio-circle"></div>
                                            <div className="payment-details">
                                                <h4>UPI (GPay, PhonePe, Paytm)</h4>
                                                <p>Instant transfer</p>
                                            </div>
                                        </div>
                                        <div className="payment-sub-options-container">
                                            <div className="upi-apps-grid">
                                                <div className="upi-app-chip">GPay</div>
                                                <div className="upi-app-chip">PhonePe</div>
                                                <div className="upi-app-chip">Paytm</div>
                                                <div className="upi-app-chip">Any UPI ID</div>
                                            </div>
                                            <div className="checkout-form mt-3">
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter UPI ID (e.g. name@bank)" 
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value)}
                                                />
                                                <button className="btn-primary-shop pay-btn mt-3" onClick={handlePaymentSubmit}>PAY ₹{finalTotal}</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Section */}
                                    <div className={`payment-group ${paymentMethod === 'CARD' ? 'expanded' : ''}`}>
                                        <div className={`payment-option ${paymentMethod === 'CARD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('CARD')}>
                                            <div className="radio-circle"></div>
                                            <div className="payment-details">
                                                <h4>Credit / Debit Card</h4>
                                                <p>Visa, MasterCard, RuPay</p>
                                            </div>
                                        </div>
                                        <div className="payment-sub-options-container card-form">
                                            <div className="checkout-form">
                                                <input 
                                                    type="text" 
                                                    placeholder="Card Number (16 digits)"
                                                    maxLength="16"
                                                    value={cardDetails.number}
                                                    onChange={(e) => setCardDetails({...cardDetails, number: handleNumericInput(e, 16)})}
                                                />
                                                <div className="form-row">
                                                    <input 
                                                        type="text" 
                                                        placeholder="MMYY" 
                                                        maxLength="4"
                                                        value={cardDetails.expiry}
                                                        onChange={(e) => setCardDetails({...cardDetails, expiry: handleNumericInput(e, 4)})}
                                                    />
                                                    <input 
                                                        type="password" 
                                                        placeholder="CVV" 
                                                        maxLength="3"
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => setCardDetails({...cardDetails, cvv: handleNumericInput(e, 3)})}
                                                    />
                                                </div>
                                                <button className="btn-primary-shop pay-btn mt-3" onClick={handlePaymentSubmit}>PAY ₹{finalTotal}</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COD Section */}
                                    <div className={`payment-group ${paymentMethod === 'COD' ? 'expanded' : ''}`}>
                                        <div className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('COD')}>
                                            <div className="radio-circle"></div>
                                            <div className="payment-details">
                                                <h4>Cash on Delivery</h4>
                                                <p>Pay at your doorstep</p>
                                            </div>
                                        </div>
                                        <div className="payment-sub-options-container">
                                            <p className="cod-info">You can pay via Cash/UPI to the delivery person.</p>
                                            <button className="btn-primary-shop pay-btn mt-2" onClick={handlePaymentSubmit}>CONFIRM ORDER</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: SUCCESS ANIMATION */}
                            {checkoutStep === 3 && (
                                <div className="checkout-success">
                                    <div className="success-icon-wrap">
                                        <CheckCircle size={60} color="#2e7d32" />
                                    </div>
                                    <h3>Order Placed Successfully!</h3>
                                    <p>Your divine offerings are on the way.</p>
                                    {placedOrderId && (
                                        <div className="order-id-display" style={{ background: '#f5f5f5', padding: '10px 20px', borderRadius: '8px', margin: '15px 0', display: 'inline-block' }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Your Order ID</p>
                                            <h4 style={{ margin: 0, color: '#ff6b00', letterSpacing: '1px' }}>{placedOrderId}</h4>
                                        </div>
                                    )}
                                    <p className="redirect-note">Returning to marketplace...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Meet Artisans Modal */}
            {artisanModalOpen && (
                <div className="track-modal-overlay" onClick={() => setArtisanModalOpen(false)} style={{ zIndex: 10000 }}>
                    <div className="track-modal artisan-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                        <button className="track-modal-close" onClick={() => setArtisanModalOpen(false)}>
                            <X size={24} />
                        </button>

                        <div className="track-modal-header text-center">
                            <h2 className="track-modal-title" style={{ fontSize: '1.8rem', color: '#ff6b00', marginBottom: '10px' }}>Meet Our Local Artisans</h2>
                            <p style={{ color: '#555' }}>Discover the master craftsmen preserving our sacred heritage.</p>
                        </div>

                        <div className="track-modal-body artisan-modal-body">
                            <div className="artisans-grid">
                                {artisansData.map(artisan => (
                                    <div key={artisan.id} className="artisan-info-card">
                                        <div className="artisan-img-wrapper">
                                            <img src={artisan.imageUrl && artisan.imageUrl.startsWith('http') ? artisan.imageUrl : `${shopService.API_URL}${artisan.imageUrl && !artisan.imageUrl.startsWith('/') ? '/' : ''}${artisan.imageUrl}`} alt={artisan.artisanName} />
                                        </div>
                                        <div className="artisan-details">
                                            <h3>{artisan.artisanName}</h3>
                                            <div className="artisan-meta">
                                                <span className="artisan-craft-tag">{artisan.craft}</span>
                                                <span className="artisan-region">
                                                    <MapPin size={14} /> {artisan.region}
                                                </span>
                                            </div>
                                            <p className="artisan-description">{artisan.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Submission Modal */}
            <ProductSubmissionModal 
                isOpen={isSellModalOpen} 
                onClose={() => setIsSellModalOpen(false)} 
                onRefresh={fetchProducts}
            />
        </div>
    );
};

export default ShopPage;
