import React from 'react';

const ValidationError = ({ error }) => {
    if (!error) return null;
    
    return (
        <div style={{ 
            color: '#ff5252', 
            fontSize: '0.75rem', 
            marginTop: '4px', 
            fontWeight: '600',
            animation: 'fadeIn 0.3s ease'
        }}>
            {error}
        </div>
    );
};

export default ValidationError;
