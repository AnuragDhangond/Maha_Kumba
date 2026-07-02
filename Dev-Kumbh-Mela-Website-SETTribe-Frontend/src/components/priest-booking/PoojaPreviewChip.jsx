import React from 'react';
import { Clock } from 'lucide-react';
import T from '../DynamicText';

const PoojaPreviewChip = ({ pooja }) => {
    return (
        <div className="mk-pooja-chip">
            <h5 className="mk-chip-title"><T>{pooja.name}</T></h5>
            <div className="mk-chip-meta">
                <span className="mk-chip-price">₹{pooja.price}</span>
                <span className="mk-chip-duration">
                    <Clock size={10} style={{ marginRight: '2px', display: 'inline' }} />
                    <T>{pooja.duration}</T>
                </span>
            </div>
        </div>
    );
};

export default PoojaPreviewChip;
