import React from 'react';
import { Inbox, ShoppingBag, CheckCircle, Clock } from 'lucide-react';

const EmptyModerationState = ({ totalApproved = 0 }) => {
    return (
        <div className="op-empty-state">
            <div className="op-empty-icon-wrapper">
                <div className="op-empty-glow"></div>
                <div className="op-empty-icon-frame">
                    <Inbox size={64} className="text-orange-500" />
                    <div className="op-empty-badge">
                        <CheckCircle size={20} />
                    </div>
                </div>
            </div>
            
            <h3 className="op-empty-title">All Caught Up!</h3>
            <p className="op-empty-subtitle">
                No pending product requests at the moment. Your marketplace is healthy and up to date.
            </p>

            <div className="op-empty-metrics-grid">
                <div className="op-empty-metric-card">
                    <div className="icon-orange"><ShoppingBag size={20} style={{ margin: '0 auto' }} /></div>
                    <div className="val">{totalApproved}</div>
                    <div className="label">Live Products</div>
                </div>
                <div className="op-empty-metric-card">
                    <div className="icon-blue"><Clock size={20} style={{ margin: '0 auto' }} /></div>
                    <div className="val">0</div>
                    <div className="label">Pending</div>
                </div>
            </div>
        </div>
    );
};

export default EmptyModerationState;
