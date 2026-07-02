const PAGE_LOCAL_STRINGS = {
en: {
supportSacredHero: "Support The Sacred Journey",
supportSacredSub: "Plan your spiritual path and contribute to the divine cause of Maha Kumbh Mela 2027.",
aiPlannerTitle: "AI-Based Budget Planner",
aiPlannerSub: "Discover the smartest way to manage your expenses during the Kumbh Mela. Our advanced AI analyzes real-time accommodation, travel, and food costs to create a personalized, optimized budget for your spiritual journey."
},
hi: {
supportSacredHero: "पावन यात्रा का समर्थन करें",
supportSacredSub: "अपने आध्यात्मिक मार्ग की योजना बनाएं और महाकुंभ मेला 2027 के दिव्य कार्य में योगदान दें।",
aiPlannerTitle: "एआई-आधारित बजट योजनाकार",
aiPlannerSub: "कुंभ मेले के दौरान अपने खर्चों को प्रबंधित करने का सबसे स्मार्ट तरीका खोजें। हमारा उन्नत एआई आपकी आध्यात्मिक यात्रा के लिए एक व्यक्तिगत, अनुकूलित बजट बनाने के लिए वास्तविक समय के आवास, यात्रा और भोजन की लागतों का विश्लेषण करता है।"
},
mr: {
supportSacredHero: "पावन यात्रेला पाठिंबा द्या",
supportSacredSub: "तुमच्या आध्यात्मिक मार्गाचे नियोजन करा आणि महाकुंभमेळा २०२७ च्या दैवी कार्यात योगदान द्या।",
aiPlannerTitle: "एआई-आधारित बजेट नियोजक",
aiPlannerSub: "कुंभमेळ्यादरम्यान तुमचे खर्च व्यवस्थापित करण्याचा सर्वात स्मार्ट मार्ग शोधा। आमचे प्रगत एआय तुमच्या आध्यात्मिक प्रवासासाठी वैयक्तिक, अनुकूलित बजेट तयार करण्यासाठी रिअल-टाइम निवास, प्रवास आणि खाद्य खर्चाचे विश्लेषण करते।"
},
sa: {
supportSacredHero: "पावनयात्रां समर्थयन्तु",
supportSacredSub: "स्वस्य आध्यात्मिकमार्गस्य योजनां कुर्वन्तु तथा च महाकुम्भमेला २०२७ इत्यस्य दैवीयकार्ये योगदानं यच्छन्तु।",
aiPlannerTitle: "एआई-आधारितं बजट-योजकम्",
aiPlannerSub: "कुम्भमेलायाः समये स्वव्ययप्रबन्धनस्य सर्वोत्तममार्गं अन्विष्यन्तु। अस्माकं उन्नतम् एआई भवतः आध्यात्मिकयात्रायाः कृते व्यक्तिगतं अनुकूलितं च बजटं निर्मातुं वास्तविकसमयस्य आवास-यात्रा-भोजनव्ययानां विश्लेषणं करोति।"
}
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HeadingOrnament from './HeadingOrnament';
import { QrCode, Calculator, Heart, Gift, ScanLine, IndianRupee, Sparkles } from 'lucide-react';
import '../styles/DonatePage.css';
import donationConfigService from '../api/services/donationConfigService';
import donationTransactionService from '../api/services/donationTransactionService';
import Swal from 'sweetalert2';
import useValidation from '../hooks/useValidation';
import { validateRequired, validateEmail, validateTextLength, validateName, validateUPI, validatePhone } from '../utils/validationUtils';
import ValidationError from './ValidationError';

import T from './DynamicText';

const DonatePage = () => {
const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'en');
const [donationAmount, setDonationAmount] = useState('');
const [scannerActive, setScannerActive] = useState(false);
const [config, setConfig] = useState(null);
const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);

const donorValidationSchema = {
        donorName: [(v) => validateRequired(v), (v) => validateName(v, 'Full Name')],
donorEmail: [(v) => validateEmail(v)],
        donorPhone: [(v) => validateRequired(v), (v) => validatePhone(v)],
        donorUPI: [(v) => validateUPI(v)],
message: [(v) => validateTextLength(v, 0, 500, 'Message')]
};

const { 
values: donorData, 
errors: donorErrors, 
handleChange: handleDonorInputChange, 
validateForm: validateDonorForm, 
resetForm: resetDonorForm 
} = useValidation({
donorName: '',
donorEmail: '',
        donorPhone: '',
        donorUPI: '',
message: ''
}, donorValidationSchema);

useEffect(() => {
const fetchConfig = async () => {
try {
const data = await donationConfigService.getConfig();
setConfig(data);
} catch (error) {
console.error("Error fetching donation config:", error);
} finally {
setLoading(false);
}
};
fetchConfig();
}, []);

// Listen for language changes across the app
useEffect(() => {
const handleLangChange = () => {
setLang(localStorage.getItem('preferredLang') || 'en');
};
window.addEventListener('langchange', handleLangChange);
return () => window.removeEventListener('langchange', handleLangChange);
}, []);

const { t, i18n } = useTranslation();

if (loading) {
return (
<div className="donate-page-container">
<div className="flex items-center justify-center min-h-screen">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
</div>
</div>
);
}

// Default values if config is missing (though backend handles it)
const displayConfig = config || {
heroTitle: "supportSacredHero",
heroSubtitle: "supportSacredSub",
plannerTitle: "aiPlannerTitle",
plannerDescription: "aiPlannerSub",
donationSectionTitle: "makeSacredDonation",
        presetAmounts: "501,1101,2101,5101,11001",
giftEligibilityAmount: 1000,
giftTitle: "divineBlessingIncluded",
giftDescription: "giftEligibilityDesc",
upiId: "kumbhmela2027@upi",
upiName: "Maha Kumbh Mela",
paymentMethods: "GPay,PhonePe,Paytm,BHIM"
};

const handleAmountSelect = (amt) => {
setDonationAmount(amt.toString());
};

const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d+$/.test(val)) {
            setDonationAmount(val);
        }
};

const isEligibleForGift = Number(donationAmount) >= displayConfig.giftEligibilityAmount;

const handleDonate = () => {
if (!donationAmount || Number(donationAmount) <= 0) {
Swal.fire(t('error'), t('enterValidAmount'), 'error');
return;
}
setShowForm(true);
};

const handleSubmitDonation = async (e) => {
e.preventDefault();
if (!validateDonorForm()) return;

try {
await donationTransactionService.submitDonation({
...donorData,
amount: Number(donationAmount),
transactionReference: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
});
Swal.fire({
title: t('donationSuccessTitle'),
text: t('donationSuccessText'),
icon: 'success',
confirmButtonColor: '#ff7e36'
});
setShowForm(false);
setDonationAmount('');
resetDonorForm();
} catch (error) {
Swal.fire(t('error'), error.response?.data?.message || t('donationSubmitError'), 'error');
}
};

const presetAmountsArray = displayConfig.presetAmounts.split(',').map(s => s.trim());
const paymentMethodsArray = displayConfig.paymentMethods.split(',').map(s => s.trim());
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(displayConfig.upiId)}&pn=${encodeURIComponent(displayConfig.upiName)}&am=${donationAmount}`;

return (
<div className="donate-page-container">
{/* Stunning Hero Section Parallax Background */}
<div className="donate-hero">
<div className="donate-hero-overlay"></div>
<div className="donate-hero-content pop-in">
<h1 className="hero-title">{PAGE_LOCAL_STRINGS[i18n.language]?.supportSacredHero || t("supportSacredHero")}</h1>
<HeadingOrnament variant="diamond" />
<p className="hero-subtitle">{PAGE_LOCAL_STRINGS[i18n.language]?.supportSacredSub || t("supportSacredSub")}</p>
</div>
</div>

<div className="donate-content-wrapper fade-in-up">

{/* AI Planner Section */}
<section className="planner-section glass-panel highlight-panel">
<div className="planner-graphics">
<div className="icon-glow">
<Sparkles size={40} className="floating-icon primary" />
</div>
</div>
<div className="planner-body">
<div className="donate-section-header">
<h2>{PAGE_LOCAL_STRINGS[i18n.language]?.aiPlannerTitle || t("aiPlannerTitle")}</h2>
<span className="badge-premium">{t('newBadge')}</span>
</div>
<p className="planner-desc">
{PAGE_LOCAL_STRINGS[i18n.language]?.aiPlannerSub || t("aiPlannerSub")}
</p>
<button className="btn-primary planner-btn" onClick={() => window.location.href = '/undermaintenance'}>
<Calculator size={20} />
{t('launchAIPlanner')}
</button>
</div>
</section>

{/* Donation Section */}
<section className="donation-section">
<div className="section-title-wrapper">
<Heart className="section-icon-large floating-icon" />
<h2 className="section-main-title">{t("makeSacredDonation")}</h2>
<div className="title-underline"></div>
</div>

<div className="donation-grid">

{/* Donation Form */}
<div className="donation-form-wrapper glass-panel">
<h3 className="panel-title">{t('chooseContribution')}</h3>
<p className="panel-subtitle">{t('generousDonationSub')}</p>

<div className="preset-amounts">
{presetAmountsArray.map((amt) => (
<button
key={amt}
className={`amount-btn ${donationAmount === amt ? 'selected' : ''}`}
onClick={() => handleAmountSelect(amt)}
>
<span className="rupee-symbol">₹</span>
<span className="amt-value">{amt}</span>
</button>
))}
</div>

<div className="divider"><span>{t('orDivider')}</span></div>

<div className="custom-input-group">
<IndianRupee className="input-icon" />
<input
type="text"
placeholder={t('enterCustomAmount')}
value={donationAmount}
onChange={handleAmountChange}
onWheel={(e) => e.target.blur()}
className="custom-amount-input"
/>
</div>

{/* Return Gift Feature */}
{isEligibleForGift && (
<div className="gift-alert slide-in">
<div className="gift-icon-wrapper">
<Gift className="gift-icon animate-bounce" size={28} />
</div>
<div className="gift-text">
<h4>{t("divineBlessingIncluded")}</h4>
<p>{t("giftEligibilityDesc")}</p>
</div>
</div>
)}

<button className="btn-grand donate-submit-btn mt-4" onClick={handleDonate}>
{t('paidSubmitDetails')} <Heart size={18} className="btn-icon" />
</button>
</div>

{/* Scanner Area */}
<div className="scanner-wrapper glass-panel">
<h3 className="panel-title">{t('scanDonateInstantly')}</h3>
<p className="panel-subtitle">
{t('scanUpiSub')}
</p>

<div className="qr-showcase">
<div className="qr-container" onMouseEnter={() => setScannerActive(true)} onMouseLeave={() => setScannerActive(false)}>
{scannerActive ? (
<div className="active-scanner">
<div className="scanner-line"></div>
<img src={qrCodeUrl} alt="QR Code" className="qr-image glow" />
<div className="corner top-left"></div>
<div className="corner top-right"></div>
<div className="corner bottom-left"></div>
<div className="corner bottom-right"></div>
</div>
) : (
<div className="inactive-scanner">
<ScanLine className="placeholder-qr" size={80} />
<span>{t('hoverToScan')}</span>
<div className="corner top-left"></div>
<div className="corner top-right"></div>
<div className="corner bottom-left"></div>
<div className="corner bottom-right"></div>
</div>
)}
</div>
</div>

<div className="supported-apps">
<p>{t('acceptedPaymentMethods')}</p>
<div className="app-badges">
{paymentMethodsArray.map(method => (
<span key={method} className="app-badge">{method}</span>
))}
</div>
</div>
</div>

</div>
</section>

</div>

{/* Donation Details Form Overlay */}
{showForm && (
<div className="modal-overlay-premium">
<div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-pop-in">
<div className="bg-gradient-to-r from-orange-600 to-orange-400 p-6 text-white text-center">
<h3 className="text-2xl font-bold font-cinzel">{t('completeOffering')}</h3>
<p className="text-orange-100">{t('submitTransactionSub')}</p>
</div>
<form onSubmit={handleSubmitDonation} className="p-8 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">{t('fullName')}</label>
                                <input 
                                    type="text" 
                                    name="donorName" 
                                    value={donorData.donorName} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^[a-zA-Z\s.'-]+$/.test(val)) {
                                            handleDonorInputChange(e);
                                        }
                                    }} 
                                    required 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                                />
                                <ValidationError error={donorErrors.donorName} />
                            </div>
<div className="grid grid-cols-2 gap-4">
<div className="space-y-1">
<label className="text-sm font-semibold text-gray-700">{t('emailAddress')}</label>
<input type="email" name="donorEmail" value={donorData.donorEmail} onChange={handleDonorInputChange} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                                    <ValidationError error={donorErrors.donorEmail} />
</div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">{t('phone')}</label>
                                    <input 
                                        type="text" 
                                        name="donorPhone" 
                                        value={donorData.donorPhone} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || /^\d{0,10}$/.test(val)) {
                                                handleDonorInputChange(e);
                                            }
                                        }} 
                                        required 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                                        placeholder="10 digit mobile"
                                    />
                                    <ValidationError error={donorErrors.donorPhone} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">{t('upiId')}</label>
                                <input 
                                    type="text" 
                                    name="donorUPI" 
                                    value={donorData.donorUPI} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || /^[a-zA-Z0-9.@-]+$/.test(val)) {
                                            handleDonorInputChange(e);
                                        }
                                    }} 
                                    required 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                                    placeholder="e.g. name@upi"
                                />
                                <ValidationError error={donorErrors.donorUPI} />
</div>
<div className="space-y-1">
<label className="text-sm font-semibold text-gray-700">{t('messageOptional')}</label>
<textarea name="message" value={donorData.message} onChange={handleDonorInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-20 resize-none" placeholder={t("donationPlaceholder")}></textarea>
                                <ValidationError error={donorErrors.message} />
</div>

<div className="flex gap-4 pt-4">
<button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 px-6 btn-cancel-premium rounded-xl font-bold">{t('cancel')}</button>
<button type="submit" className="flex-1 py-3 px-10 btn-submit-premium rounded-xl font-bold">{t('submitDetails')}</button>
</div>
</form>
</div>
</div>
)}
</div>
);
};

export default DonatePage;
