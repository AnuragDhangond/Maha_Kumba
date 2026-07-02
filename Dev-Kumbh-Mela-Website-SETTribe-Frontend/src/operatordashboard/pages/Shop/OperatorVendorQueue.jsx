import React, { useState, useEffect, useCallback } from 'react';
import { vendorApplicationService } from '../../../api/services/vendorApplicationService';
import './OperatorVendorQueue.css';

const STATUS_BADGE = {
  PENDING:           'badge-pending',
  UNDER_REVIEW:      'badge-review',
  APPROVED:          'badge-active',
  REJECTED:          'badge-blocked',
  CHANGES_REQUESTED: 'badge-changes',
  BLOCKED:           'badge-blocked',
};

const DECISIONS = [
  { value: 'APPROVED',          label: '✅ Approve',          cls: 'btn-approve' },
  { value: 'REJECTED',          label: '❌ Reject',           cls: 'btn-reject'  },
  { value: 'CHANGES_REQUESTED', label: '📝 Request Changes',  cls: 'btn-changes' },
  { value: 'BLOCKED',           label: '🚫 Block',            cls: 'btn-block'   },
];

export default function OperatorVendorQueue() {
  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [acting, setActing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorApplicationService.getVendorQueue({
        query: query || undefined, status: statusFilter || undefined, page, size: 15,
      });
      setApps(res.data.content || []);
      setTotal(res.data.totalElements || 0);
    } catch { setError('Failed to load vendor queue.'); }
    finally { setLoading(false); }
  }, [query, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleDecision = async (id, decision) => {
    if (!remarks && (decision === 'REJECTED' || decision === 'CHANGES_REQUESTED')) {
      setError('Please provide remarks before rejecting or requesting changes.'); return;
    }
    setActing(true); setError('');
    try {
      await vendorApplicationService.reviewApplication(id, decision, remarks);
      flash(`Application ${decision.toLowerCase().replace('_', ' ')} successfully.`);
      setSelected(null); setRemarks('');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed.');
    } finally { setActing(false); }
  };

  return (
    <div className="oq-root">
      <div className="oq-header">
        <div>
          <h1 className="oq-title">Vendor Approval Queue</h1>
          <p className="oq-subtitle">{total} application{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="oq-filters">
        <input className="oq-search" placeholder="Search by name, email, shop..."
          value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} />
        <select className="oq-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">All Statuses</option>
          {['PENDING','UNDER_REVIEW','APPROVED','REJECTED','CHANGES_REQUESTED','BLOCKED'].map(s =>
            <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {successMsg && <div className="oq-alert success">{successMsg}</div>}
      {error && <div className="oq-alert error" onClick={() => setError('')}>{error} ✕</div>}

      {loading ? (
        <div className="oq-loading"><div className="oq-spinner" /><p>Loading queue...</p></div>
      ) : (
        <div className="oq-list">
          {apps.map(app => (
            <div key={app.id} className={`oq-card ${selected?.id === app.id ? 'oq-card-expanded' : ''}`}>
              <div className="oq-card-main" onClick={() => setSelected(selected?.id === app.id ? null : app)}>
                {/* Identity */}
                <div className="oq-identity">
                  {app.logoImage
                    ? <img className="oq-logo" src={app.logoImage} alt={app.shopName} />
                    : <div className="oq-logo-placeholder">🏪</div>}
                  <div>
                    <p className="oq-shop-name">{app.shopName}</p>
                    <p className="oq-meta">{app.fullName} · {app.shopCategory}</p>
                    <p className="oq-meta">{app.email} · {app.phone}</p>
                  </div>
                </div>
                {/* Meta */}
                <div className="oq-card-meta">
                  <span className={`oq-badge ${STATUS_BADGE[app.applicationStatus] || 'badge-pending'}`}>
                    {app.applicationStatus}
                  </span>
                  <span className="oq-date">{app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                  <span className="oq-expand-icon">{selected?.id === app.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded detail panel */}
              {selected?.id === app.id && (
                <div className="oq-detail">
                  <div className="oq-detail-grid">
                    <div className="oq-detail-col">
                      <h4>Applicant Details</h4>
                      {[['Address', app.address], ['City', app.city], ['Pincode', app.pincode],
                        ['GST', app.gstNumber || '—'], ['Hours', `${app.openingTime}–${app.closingTime}`],
                        ['Coordinates', `${app.latitude}, ${app.longitude}`]
                      ].map(([k,v]) => (
                        <div key={k} className="oq-detail-row">
                          <span className="oq-detail-key">{k}</span>
                          <span className="oq-detail-val">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="oq-detail-col">
                      <h4>Documents</h4>
                      {app.documentUrl && <a className="oq-doc-link" href={app.documentUrl} target="_blank" rel="noreferrer">📄 Aadhaar / PAN</a>}
                      {app.shopLicenseUrl && <a className="oq-doc-link" href={app.shopLicenseUrl} target="_blank" rel="noreferrer">📄 Shop License</a>}
                      {app.googleMapLink && <a className="oq-doc-link" href={app.googleMapLink} target="_blank" rel="noreferrer">📍 Google Maps</a>}
                      {!app.documentUrl && !app.shopLicenseUrl && <p className="oq-no-docs">No documents uploaded yet.</p>}
                      {app.reviewerNotes && (
                        <div className="oq-prev-remarks">
                          <strong>Previous Remarks:</strong>
                          <p>{app.reviewerNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {app.shopDescription && (
                    <div className="oq-description">
                      <strong>Shop Description:</strong>
                      <p>{app.shopDescription}</p>
                    </div>
                  )}

                  {/* Action panel */}
                  {!['APPROVED','BLOCKED'].includes(app.applicationStatus) && (
                    <div className="oq-action-panel">
                      <textarea className="oq-remarks-input" rows={3} placeholder="Remarks / reason for decision (required for rejection)..."
                        value={remarks} onChange={e => setRemarks(e.target.value)} />
                      <div className="oq-decision-btns">
                        {DECISIONS.map(d => (
                          <button key={d.value} className={`oq-decision-btn ${d.cls}`}
                            disabled={acting} onClick={() => handleDecision(app.id, d.value)}>
                            {acting ? '...' : d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {app.applicationStatus === 'APPROVED' && (
                    <div className="oq-approved-note">✅ This vendor has been approved. Shop is live.</div>
                  )}
                </div>
              )}
            </div>
          ))}
          {apps.length === 0 && (
            <div className="oq-empty">No applications found for the selected filter.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div className="oq-pagination">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="oq-page-btn">← Prev</button>
          <span className="oq-page-info">Page {page + 1} of {Math.ceil(total / 15)}</span>
          <button disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)} className="oq-page-btn">Next →</button>
        </div>
      )}
    </div>
  );
}
