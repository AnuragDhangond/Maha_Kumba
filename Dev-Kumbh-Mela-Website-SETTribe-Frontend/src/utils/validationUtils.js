/**
 * Reusable validation utility functions for form validation
 */

export const validateRequired = (value) => {
    if (value === null || value === undefined || value === '') return 'This field is required';
    if (typeof value === 'string' && value.trim() === '') return 'This field cannot be only spaces';
    return null;
};

export const validateEmail = (email) => {
    if (!email) return null; // Use validateRequired for mandatory emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validatePhone = (phone) => {
    if (!phone) return null;
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) return 'Phone number must be exactly 10 digits';
    return null;
};

export const validateIndianMobile = (phone) => {
    if (!phone) return 'Mobile number is required';
    const trimmed = phone.toString().trim();
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobileRegex.test(trimmed)) return 'Invalid Indian mobile number (10 digits starting with 6-9)';
    return null;
};

export const validateName = (name, fieldName = 'Name') => {
    if (!name) return null;
    const trimmed = name.trim();
    if (trimmed.length < 2) return `${fieldName} must be at least 2 characters`;
    if (trimmed.length > 100) return `${fieldName} must not exceed 100 characters`;
    
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(trimmed)) return `${fieldName} contains invalid characters`;
    
    if (/(.)\1{3,}/.test(trimmed)) {
        return `${fieldName} cannot contain repeated consecutive characters`;
    }
    return null;
};

export const validateNumber = (value, options = {}) => {
    const { min, max, allowZero = true, allowDecimal = true, fieldName = 'Value' } = options;
    
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    
    if (!allowDecimal && !Number.isInteger(num)) return `${fieldName} must be an integer`;
    if (!allowZero && num === 0) return `${fieldName} cannot be zero`;
    if (num < 0 && min === undefined) return `${fieldName} cannot be negative`;
    
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
    
    return null;
};

export const validateImage = (file, options = {}) => {
    if (!file) return null;
    
    const { 
        maxSizeMB = 5, 
        allowedTypes = ['image/jpeg', 'image/png'],
        allowedExtensions = ['.jpg', '.jpeg', '.png']
    } = options;
    
    // Check for double/multiple extensions (e.g. "image.png.jpg", "file.exe.png")
    const fileName = file.name || '';
    const nameParts = fileName.split('.');
    if (nameParts.length > 2) {
        return 'File has multiple extensions which is not allowed. Please upload a valid image file.';
    }
    
    // Check MIME type
    const isValidType = allowedTypes.includes(file.type);
    
    // Fallback check: Extension (useful if browser doesn't detect MIME type correctly)
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const isValidExtension = allowedExtensions.includes(extension);

    if (!isValidType && !isValidExtension) {
        return 'Invalid file format. Only PNG and JPEG images are allowed.';
    }
    
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
        return `File size too large (${sizeInMB.toFixed(2)}MB). Maximum allowed is ${maxSizeMB}MB.`;
    }
    
    return null;
};

export const validateTextLength = (value, min, max, fieldName = 'Field') => {
    if (!value) return null;
    const len = value.trim().length;
    if (min && len < min) return `${fieldName} must be at least ${min} characters`;
    if (max && len > max) return `${fieldName} must not exceed ${max} characters`;
    return null;
};

export const validateDate = (date, options = {}) => {
    if (!date) return null;
    const { preventPast = false, preventFuture = false } = options;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (preventPast && selectedDate < today) return 'Previous dates are not allowed';
    if (preventFuture && selectedDate > today) return 'Date cannot be in the future';
    
    return null;
};

export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    if (new Date(endDate) < new Date(startDate)) return 'End date cannot be before start date';
    return null;
};

export const validatePincode = (pincode) => {
    if (!pincode) return null;
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) return 'Pincode must be exactly 6 digits';
    return null;
};

export const validateUPI = (upi) => {
    if (!upi) return 'UPI ID is required';
    const upiRegex = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(upi)) return 'Invalid UPI ID format (e.g., example@upi)';
    return null;
};


export const validateImageUrl = (url) => {
    if (!url) return null;
    try {
        new URL(url);
        const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
        if (!isImage) return 'URL must point to a valid image file (jpg, png, webp, etc.)';
        return null;
    } catch (_) {
        return 'Please enter a valid URL';
    }   
};

export const scrollAndFocusError = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
        const firstErrorKey = errorKeys[0];
        const element = document.getElementsByName(firstErrorKey)[0];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
    }
};
