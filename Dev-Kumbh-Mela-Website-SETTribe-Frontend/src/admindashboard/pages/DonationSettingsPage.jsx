import React, { useState, useEffect } from 'react';
import '../../styles/DashboardForms.css';
import donationConfigService from '../../api/services/donationConfigService';
import Swal from 'sweetalert2';
import { validateUPI } from '../../utils/validationUtils';

const DonationSettingsPage = () => {
const [config, setConfig] = useState({
heroTitle: '',
heroSubtitle: '',
plannerTitle: '',
plannerDescription: '',
donationSectionTitle: '',
presetAmounts: '',
giftEligibilityAmount: 0,
giftTitle: '',
giftDescription: '',
upiId: '',
upiName: '',
paymentMethods: ''
});
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

useEffect(() => {
fetchConfig();
}, []);

const fetchConfig = async () => {
try {
const data = await donationConfigService.getConfig();
setConfig(data);
} catch (error) {
console.error("Error fetching donation config:", error);
Swal.fire('Error', 'Failed to load donation settings.', 'error');
} finally {
setLoading(false);
}
};

const handleInputChange = (e) => {
const { name, value } = e.target;

        // Input restrictions: No numbers where text is expected, and vice versa
        if (name === 'upiName' || name === 'giftTitle') {
            // Only allow letters, spaces and common name characters (no numbers)
            if (value !== '' && !/^[a-zA-Z\s.'-]+$/.test(value)) return;
        } else if (name === 'giftEligibilityAmount') {
            // Only allow digits
            if (value !== '' && !/^\d+$/.test(value)) return;
        } else if (name === 'presetAmounts') {
            // Only allow digits, commas, and spaces
            if (value !== '' && !/^[0-9, ]+$/.test(value)) return;
        } else if (name === 'upiId') {
            // Real-time character filtering for UPI (allow @, dots, hyphens, alphanumeric)
            if (value !== '' && !/^[a-zA-Z0-9.@-]+$/.test(value)) return;
        }

setConfig(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
e.preventDefault();
        
        // Final format validation for UPI ID
        const upiError = validateUPI(config.upiId);
        if (upiError) {
            Swal.fire('Invalid UPI ID', upiError, 'error');
            return;
        }

setSaving(true);
try {
await donationConfigService.updateConfig(config);
Swal.fire('Success', 'Donation settings updated successfully.', 'success');
} catch (error) {
console.error("Error updating donation config:", error);
Swal.fire('Error', 'Failed to update settings.', 'error');
} finally {
setSaving(false);
}
};

if (loading) {
return (
<div className="admin-page-content animate-fade-in">
<div className="flex items-center justify-center min-h-[400px]">
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
</div>
</div>
);
}

return (
<div className="admin-page-content animate-fade-in">
<div className="dashboard-header-modern" style={{ marginBottom: '40px' }}>
<h1 className="page-title">Donation Details</h1>
{/* <p className="page-subtitle">Manage the content, amounts, and payment details for the public donation page.</p> */}
</div>

<div className="dashboard-form-container">
<div className="form-header-modern">
<h3>Configure Donation Portal</h3>
</div>
<form onSubmit={handleSubmit}>
<h4 style={{ marginBottom: '15px', color: '#4a2a18', fontWeight: 'bold' }}>Payment Configuration</h4>
<div className="form-grid-modern">
<div className="form-group-modern">
<label className="form-label-modern">Preset Amounts (Comma Separated) <span className="required-mark">*</span></label>
<input type="text" name="presetAmounts" value={config.presetAmounts} onChange={handleInputChange} className="form-input-modern" required placeholder="e.g. 101, 501, 1001, 2100" />
</div>
<div className="form-group-modern">
<label className="form-label-modern">UPI ID <span className="required-mark">*</span></label>
<input type="text" name="upiId" value={config.upiId} onChange={handleInputChange} className="form-input-modern" required />
</div>
<div className="form-group-modern">
<label className="form-label-modern">Merchant Name (for QR Code) <span className="required-mark">*</span></label>
<input type="text" name="upiName" value={config.upiName} onChange={handleInputChange} className="form-input-modern" required />
</div>
<div className="form-group-modern form-span-2">
<label className="form-label-modern">Supported Payment Methods (Comma Separated) <span className="required-mark">*</span></label>
<input type="text" name="paymentMethods" value={config.paymentMethods} onChange={handleInputChange} className="form-input-modern" required placeholder="GPay, PhonePe, Paytm, BHIM" />
</div>
</div>

<h4 style={{ margin: '25px 0 15px', color: '#4a2a18', fontWeight: 'bold' }}>Return Gift Configuration</h4>
<div className="form-grid-modern">
<div className="form-group-modern">
<label className="form-label-modern">Gift Eligibility Threshold (₹) <span className="required-mark">*</span></label>
<input type="number" name="giftEligibilityAmount" value={config.giftEligibilityAmount} onChange={handleInputChange} className="form-input-modern" required />
</div>
<div className="form-group-modern">
<label className="form-label-modern">Gift Title <span className="required-mark">*</span></label>
<input type="text" name="giftTitle" value={config.giftTitle} onChange={handleInputChange} className="form-input-modern" required />
</div>
<div className="form-group-modern form-span-2">
<label className="form-label-modern">Gift Description <span className="required-mark">*</span></label>
<textarea name="giftDescription" value={config.giftDescription} onChange={handleInputChange} className="form-input-modern" required style={{ minHeight: '80px' }} />
</div>
</div>

<div className="form-actions-modern">
<button
type="submit"
disabled={saving}
className="btn-dashboard-primary"
>
{saving ? 'Saving Changes...' : 'Update Donation Details'}
</button>
<button
type="button"
onClick={fetchConfig}
className="btn-dashboard-secondary"
>
Reset
</button>
</div>
</form>
</div>
</div>
);
};

export default DonationSettingsPage;