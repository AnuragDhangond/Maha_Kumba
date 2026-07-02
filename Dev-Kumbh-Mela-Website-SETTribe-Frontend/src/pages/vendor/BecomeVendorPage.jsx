import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApplicationService } from '../../api/services/vendorApplicationService';
import './BecomeVendorPage.css';

const STEPS = ['Personal Info', 'Shop Details', 'Location', 'Documents', 'Review & Submit'];
const CATEGORIES = ['Puja Items', 'Handicrafts', 'Clothing', 'Food & Sweets',
  'Herbal & Wellness', 'Metalwork', 'Jewellery', 'Books & Scriptures', 'Other'];

const STATUS_META = {
  PENDING:            { icon: '🕐', color: '#fbbf24', label: 'Application Submitted',  msg: 'Your application is in the queue.' },
  UNDER_REVIEW:       { icon: '🔍', color: '#818cf8', label: 'Under Review',           msg: 'An operator is reviewing your application.' },
  APPROVED:           { icon: '✅', color: '#10b981', label: 'Approved! Welcome!',     msg: 'Your shop is now live. Go to your Vendor Dashboard.' },
  REJECTED:           { icon: '❌', color: '#ef4444', label: 'Application Rejected',   msg: 'Please review operator remarks and re-apply.' },
  CHANGES_REQUESTED:  { icon: '📝', color: '#f59e0b', label: 'Changes Requested',      msg: 'Please update your application based on operator notes.' },
};

export default function BecomeVendorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingApp, setExistingApp] = useState(null);
  const [checkingApp, setCheckingApp] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', whatsappNumber: '',
    shopName: '', shopCategory: '', shopDescription: '',
    address: '', city: 'Nashik', state: 'Maharashtra', pincode: '', landmark: '',
    gstNumber: '', latitude: '', longitude: '', googleMapLink: '',
    openingTime: '09:00', closingTime: '21:00',
  });
  const [files, setFiles] = useState({ document: null, license: null, logo: null, banner: null });

  // Check if user already applied
  useEffect(() => {
    vendorApplicationService.getMyApplication()
      .then(r => setExistingApp(r.data))
      .catch(() => setExistingApp(null))
      .finally(() => setCheckingApp(false));
  }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setFile = (k) => (e) => setFiles(p => ({ ...p, [k]: e.target.files[0] }));

  const handleSubmit = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, latitude: parseFloat(form.latitude) || null, longitude: parseFloat(form.longitude) || null };
      await vendorApplicationService.applyAsVendor(payload);
      if (files.document || files.license || files.logo || files.banner) {
        await vendorApplicationService.uploadDocuments(files);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setSaving(false); }
  };

  if (checkingApp) return <div className="bvp-loading"><div className="bvp-spinner" /><p>Checking your status...</p></div>;

  // ── Already applied — show status tracker ───────────────────────
  if (existingApp) {
    const meta = STATUS_META[existingApp.applicationStatus] || STATUS_META.PENDING;
    return (
      <div className="bvp-root">
        <div className="bvp-status-card" style={{ '--status-color': meta.color }}>
          <div className="bvp-status-icon">{meta.icon}</div>
          <h2 className="bvp-status-title" style={{ color: meta.color }}>{meta.label}</h2>
          <p className="bvp-status-msg">{meta.msg}</p>
          {existingApp.reviewerNotes && (
            <div className="bvp-remarks-box">
              <strong>Operator Notes:</strong>
              <p>{existingApp.reviewerNotes}</p>
            </div>
          )}
          <div className="bvp-status-details">
            <p><strong>Shop Name:</strong> {existingApp.shopName}</p>
            <p><strong>Category:</strong> {existingApp.shopCategory}</p>
            <p><strong>Applied:</strong> {existingApp.createdAt ? new Date(existingApp.createdAt).toLocaleDateString('en-IN') : '—'}</p>
          </div>
          {existingApp.applicationStatus === 'APPROVED' && (
            <button className="bvp-btn-primary" onClick={() => navigate('/vendor/dashboard')}>
              🚀 Go to Vendor Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) return (
    <div className="bvp-root">
      <div className="bvp-status-card" style={{ '--status-color': '#10b981' }}>
        <div className="bvp-status-icon">🎉</div>
        <h2 className="bvp-status-title" style={{ color: '#10b981' }}>Application Submitted!</h2>
        <p className="bvp-status-msg">An operator will review your application within 24-48 hours. You'll be notified once approved.</p>
        <button className="bvp-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="bvp-root">
      <div className="bvp-hero">
        <h1>🏪 Become a Vendor</h1>
        <p>Join the Mahakumbh Marketplace. Reach thousands of pilgrims attending Nashik Kumbh Mela.</p>
      </div>

      {/* Step progress */}
      <div className="bvp-stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`bvp-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="bvp-step-circle">{i < step ? '✓' : i + 1}</div>
            <span className="bvp-step-label">{s}</span>
            {i < STEPS.length - 1 && <div className="bvp-step-line" />}
          </div>
        ))}
      </div>

      {error && <div className="bvp-alert error" onClick={() => setError('')}>{error} ✕</div>}

      <div className="bvp-card">
        {/* ── STEP 0: Personal Info ── */}
        {step === 0 && (
          <div className="bvp-section">
            <h3>Personal Information</h3>
            <div className="bvp-grid">
              <div className="bvp-field"><label>Full Name *</label><input required value={form.fullName} onChange={set('fullName')} /></div>
              <div className="bvp-field"><label>Email *</label><input type="email" required value={form.email} onChange={set('email')} /></div>
              <div className="bvp-field"><label>Phone *</label><input required pattern="[6-9]\d{9}" placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} /></div>
              <div className="bvp-field"><label>WhatsApp Number</label><input value={form.whatsappNumber} onChange={set('whatsappNumber')} /></div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Shop Details ── */}
        {step === 1 && (
          <div className="bvp-section">
            <h3>Shop Details</h3>
            <div className="bvp-grid">
              <div className="bvp-field bvp-full"><label>Shop Name *</label><input required value={form.shopName} onChange={set('shopName')} /></div>
              <div className="bvp-field"><label>Category *</label>
                <select required value={form.shopCategory} onChange={set('shopCategory')}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="bvp-field"><label>GST Number (optional)</label><input value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" /></div>
              <div className="bvp-field bvp-full"><label>Shop Description</label><textarea rows={4} maxLength={2000} value={form.shopDescription} onChange={set('shopDescription')} placeholder="Tell pilgrims what makes your shop special..." /></div>
              <div className="bvp-field"><label>Opening Time</label><input type="time" value={form.openingTime} onChange={set('openingTime')} /></div>
              <div className="bvp-field"><label>Closing Time</label><input type="time" value={form.closingTime} onChange={set('closingTime')} /></div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Location ── */}
        {step === 2 && (
          <div className="bvp-section">
            <h3>Shop Location</h3>
            <div className="bvp-location-tip">
              📍 <strong>Tip:</strong> Open Google Maps, find your shop, right-click and copy coordinates.
            </div>
            <div className="bvp-grid">
              <div className="bvp-field bvp-full"><label>Full Address *</label><input required value={form.address} onChange={set('address')} /></div>
              <div className="bvp-field"><label>City</label><input value={form.city} onChange={set('city')} /></div>
              <div className="bvp-field"><label>State</label><input value={form.state} onChange={set('state')} /></div>
              <div className="bvp-field"><label>Pincode *</label><input required pattern="[1-9][0-9]{5}" value={form.pincode} onChange={set('pincode')} /></div>
              <div className="bvp-field"><label>Landmark</label><input value={form.landmark} onChange={set('landmark')} /></div>
              <div className="bvp-field"><label>Latitude *</label><input required type="number" step="any" placeholder="e.g. 20.0115" value={form.latitude} onChange={set('latitude')} /></div>
              <div className="bvp-field"><label>Longitude *</label><input required type="number" step="any" placeholder="e.g. 73.7898" value={form.longitude} onChange={set('longitude')} /></div>
              <div className="bvp-field bvp-full"><label>Google Maps Link</label><input type="url" value={form.googleMapLink} onChange={set('googleMapLink')} placeholder="https://maps.google.com/..." /></div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Documents ── */}
        {step === 3 && (
          <div className="bvp-section">
            <h3>Upload Documents</h3>
            <p className="bvp-doc-note">All files must be JPG, PNG or PDF. Max size: 5 MB each.</p>
            <div className="bvp-grid">
              <div className="bvp-field bvp-upload-field">
                <label>Aadhaar / PAN Card *</label>
                <div className="bvp-upload-zone" onClick={() => document.getElementById('doc-aadhaar').click()}>
                  {files.document ? <><span className="bvp-file-icon">📄</span>{files.document.name}</> : <><span className="bvp-file-icon">⬆️</span>Click to upload</>}
                  <input id="doc-aadhaar" type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={setFile('document')} />
                </div>
              </div>
              <div className="bvp-field bvp-upload-field">
                <label>Shop / Trade License</label>
                <div className="bvp-upload-zone" onClick={() => document.getElementById('doc-license').click()}>
                  {files.license ? <><span className="bvp-file-icon">📄</span>{files.license.name}</> : <><span className="bvp-file-icon">⬆️</span>Click to upload</>}
                  <input id="doc-license" type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={setFile('license')} />
                </div>
              </div>
              <div className="bvp-field bvp-upload-field">
                <label>Shop Logo</label>
                <div className="bvp-upload-zone" onClick={() => document.getElementById('doc-logo').click()}>
                  {files.logo ? <img src={URL.createObjectURL(files.logo)} className="bvp-preview-img" alt="logo" /> : <><span className="bvp-file-icon">🖼️</span>Upload Logo</>}
                  <input id="doc-logo" type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={setFile('logo')} />
                </div>
              </div>
              <div className="bvp-field bvp-upload-field">
                <label>Shop Banner</label>
                <div className="bvp-upload-zone" onClick={() => document.getElementById('doc-banner').click()}>
                  {files.banner ? <img src={URL.createObjectURL(files.banner)} className="bvp-preview-img" alt="banner" /> : <><span className="bvp-file-icon">🖼️</span>Upload Banner</>}
                  <input id="doc-banner" type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={setFile('banner')} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Review & Submit ── */}
        {step === 4 && (
          <div className="bvp-section">
            <h3>Review Your Application</h3>
            <div className="bvp-review-grid">
              {[
                ['Full Name', form.fullName], ['Email', form.email], ['Phone', form.phone],
                ['Shop Name', form.shopName], ['Category', form.shopCategory],
                ['Address', form.address], ['City', form.city], ['Pincode', form.pincode],
                ['Coordinates', `${form.latitude}, ${form.longitude}`],
                ['Hours', `${form.openingTime} – ${form.closingTime}`],
              ].map(([k, v]) => v ? (
                <div key={k} className="bvp-review-row">
                  <span className="bvp-review-key">{k}</span>
                  <span className="bvp-review-val">{v}</span>
                </div>
              ) : null)}
            </div>
            <div className="bvp-tos">
              <input type="checkbox" id="tos" required /> <label htmlFor="tos">
                I confirm all details are accurate. I agree to the Mahakumbh Marketplace Terms of Service and understand my shop will be visible only after operator approval.
              </label>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="bvp-nav">
          {step > 0 && <button className="bvp-btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < STEPS.length - 1 && (
            <button className="bvp-btn-primary" onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && (!form.fullName || !form.email || !form.phone)}>
              Next →
            </button>
          )}
          {step === STEPS.length - 1 && (
            <button className="bvp-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Submitting...' : '🚀 Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
