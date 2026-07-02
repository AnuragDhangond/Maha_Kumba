import React, { useState, useEffect } from 'react';
import donationTransactionService from '../../api/services/donationTransactionService';
import donationConfigService from '../../api/services/donationConfigService';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { donationConfigSchema } from '../../schemas/donationSchemas';
import { scrollAndFocusError } from '../../utils/validationUtils';

const DonationTransactionsPage = () => {
const [donations, setDonations] = useState([]);
const [loading, setLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalElements, setTotalElements] = useState(0);
const [searchTerm, setSearchTerm] = useState('');
const entriesPerPage = 10;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(donationConfigSchema),
        mode: 'onTouched',
        defaultValues: {
            upiId: '', merchantName: '', isActive: true, minAmount: 1
        }
    });

useEffect(() => {
        fetchConfig();
const timer = setTimeout(() => {
fetchDonations();
}, 300); // Debounce search
return () => clearTimeout(timer);
}, [currentPage, searchTerm]);

// Reset to page 1 when search term changes
useEffect(() => {
setCurrentPage(1);
}, [searchTerm]);

    const fetchConfig = async () => {
        try {
            const config = await donationConfigService.getConfig();
            reset(config);
        } catch (error) {
            console.error("Error fetching donation config:", error);
        }
    };

const fetchDonations = async () => {
try {
const data = await donationTransactionService.getAllDonations(currentPage - 1, entriesPerPage, searchTerm);
setDonations(data.content || []);
setTotalPages(data.totalPages || 1);
setTotalElements(data.totalElements || 0);
} catch (error) {
console.error("Error fetching donations:", error);
Swal.fire('Error', 'Failed to load donation records.', 'error');
} finally {
setLoading(false);
}
};

    const onSubmitConfig = async (data) => {
        try {
            await donationConfigService.updateConfig(data);
            Swal.fire('Success', 'Donation portal configuration updated.', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update configuration.', 'error');
        }
    };

const handleVerify = async (id) => {
const result = await Swal.fire({
title: 'Verify Donation?',
text: "Are you sure you have received this amount in your bank account?",
icon: 'question',
showCancelButton: true,
confirmButtonColor: '#4caf50',
confirmButtonText: 'Yes, VERIFY'
});

if (result.isConfirmed) {
try {
await donationTransactionService.verifyDonation(id);
Swal.fire('Verified!', 'The donation has been marked as verified.', 'success');
fetchDonations();
} catch (error) {
Swal.fire('Error', 'Failed to verify donation.', 'error');
}
}
};

const formatAmount = (amt) => {
return new Intl.NumberFormat('en-IN', {
style: 'currency',
currency: 'INR',
maximumFractionDigits: 0
}).format(amt);
};

const formatDate = (dateStr) => {
return new Date(dateStr).toLocaleDateString('en-IN', {
day: '2-digit',
month: 'short',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
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

    const currentEntries = donations.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

return (
<div className="admin-page-content animate-fade-in">
<div className="dashboard-header-modern" style={{ marginBottom: '40px' }}>
                <h1 className="page-title">Donation Management</h1>
            </div>

            {/* --- CONFIGURATION FORM --- */}
            <div className="dashboard-form-container" style={{ marginBottom: '40px' }}>
                <div className="form-header-modern">
                    <h3>Configure Donation Portal</h3>
                </div>
                <form onSubmit={handleSubmit(onSubmitConfig, scrollAndFocusError)}>
                    <div className="form-grid-modern">
                        <div className={`form-group-modern ${errors.upiId ? 'has-error' : ''}`}>
                            <label className="form-label-modern">UPI ID <span className="required-mark">*</span></label>
                            <input 
                                type="text" 
                                {...register('upiId')} 
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9.@-]/g, '');
                                }}
                                className={`form-input-modern ${errors.upiId ? 'has-error' : ''}`} 
                                placeholder="e.g. merchant@upi" 
                            />
                            {errors.upiId && <div className="form-error-message">{errors.upiId.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.merchantName ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Merchant Name <span className="required-mark">*</span></label>
                            <input 
                                type="text" 
                                {...register('merchantName')} 
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
                                }}
                                className={`form-input-modern ${errors.merchantName ? 'has-error' : ''}`} 
                                placeholder="e.g. Maha Kumbh Trust" 
                            />
                            {errors.merchantName && <div className="form-error-message">{errors.merchantName.message}</div>}
                        </div>
                        <div className={`form-group-modern ${errors.minAmount ? 'has-error' : ''}`}>
                            <label className="form-label-modern">Minimum Amount (INR) <span className="required-mark">*</span></label>
                            <input 
                                type="number" 
                                {...register('minAmount', { valueAsNumber: true })} 
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                }}
                                className={`form-input-modern ${errors.minAmount ? 'has-error' : ''}`} 
                                placeholder="e.g. 100" 
                            />
                            {errors.minAmount && <div className="form-error-message">{errors.minAmount.message}</div>}
                        </div>
                        <div className="form-group-modern">
                            <label className="form-label-modern">Portal Status</label>
                            <div className="flex items-center gap-2" style={{ padding: '10px 0' }}>
                                <input type="checkbox" {...register('isActive')} className="form-checkbox" />
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="form-actions-modern">
                        <button type="submit" className="btn-dashboard-primary">Save Configuration</button>
                    </div>
                </form>
</div>

            {/* Existing Donation Table... */}
<div className="emergency-banner-static">
<div className="banner-context">
<div className="static-marker-sos" style={{ background: 'rgba(255, 126, 54, 0.08)' }}>
<div className="marker-inner" style={{ background: '#ff7e36' }}></div>
</div>
<div>
<h2 className="title-static">Contribution Tracking</h2>
<span className="subtitle-static">Maha Kumbh • Divine Fund Management</span>
</div>
</div>
<div className="banner-metrics-static">
<div className="metric-box-fixed" style={{ borderBottom: '3px solid #ff7e36' }}>

<div className="m-vals">
<span className="digit">{totalElements}</span>
<span className="lab">Donations</span>
</div>
</div>
</div>
</div>

<div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
<input
type="text"
placeholder="Search by Donor Name, Email, Reference or Status..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="form-input-modern"
style={{ width: '100%', maxWidth: 'none' }}
/>
</div>

<div className="table-wrapper-premium">
<table className="admin-table">
<thead>
<tr>
<th>Date</th>
<th>Donor Details</th>
<th>Amount</th>
<th>UPI Reference</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{donations.length === 0 ? (
<tr><td colSpan="6" className="text-center p-8 text-muted">No donation records found matching your search.</td></tr>
) : (
donations.map(donation => (
<tr key={donation.id}>
<td style={{ fontSize: '0.85rem' }}>{formatDate(donation.createdAt)}</td>
<td>
<div className="font-bold">{donation.donorName}</div>
<div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{donation.donorEmail}</div>
{donation.donorPhone && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{donation.donorPhone}</div>}
</td>
<td className="font-bold text-orange-600">{formatAmount(donation.amount)}</td>
<td>
<span className="id-badge-alt" style={{ fontFamily: 'var(--font-dashboard-mono)' }}>{donation.transactionReference}</span>
</td>
<td>
<span className={`status-pill status-${donation.status.toLowerCase() === 'verified' ? 'accepted' : 'pending'}`}>
{donation.status === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
</span>
</td>
<td>
<div className="luxury-action-btns">
{donation.status === 'PENDING' ? (
<button
onClick={() => handleVerify(donation.id)}
className="edit-btn-luxury"
style={{
padding: '6px 15px',
borderRadius: '8px',
border: '1px solid #4caf50',
background: 'rgba(76, 175, 80, 0.05)',
color: '#2e7d32',
cursor: 'pointer',
fontWeight: '700',
fontSize: '0.85rem'
}}
>
Verify Payment
</button>
) : (
<span style={{ color: '#4caf50', fontWeight: '800', fontSize: '0.85rem' }}>Verified Asset</span>
)}
</div>
</td>
</tr>
))
)}
</tbody>
</table>
<div className="pagination-bar-premium">
<button
className="pager-btn"
disabled={currentPage === 1}
onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
>
Previous
</button>
<div className="pager-info">
Page <strong>{currentPage}</strong> of {totalPages}
</div>
<button
className="pager-btn"
disabled={currentPage >= totalPages}
onClick={() => setCurrentPage(prev => prev + 1)}
>
Next
</button>
</div>
</div>
</div>
);
};

export default DonationTransactionsPage;