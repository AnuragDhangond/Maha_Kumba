import { useState, useCallback } from 'react';

/**
 * Custom hook to handle form state and validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Object defining validation rules for each field
 */
const useValidation = (initialValues = {}, validationSchema = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isTouched, setIsTouched] = useState({});

    const handleChange = useCallback((e) => {
        const { name, value, type, checked, files } = e.target;
        let newValue = value;
        
        if (type === 'checkbox') {
            newValue = checked;
        } else if (type === 'file') {
            newValue = files[0];
        }
        
        setValues(prev => {
            const nextValues = { ...prev, [name]: newValue };
            
            // Run real-time validation if rule exists for this field
            if (validationSchema[name]) {
                const rules = validationSchema[name];
                let error = null;
                for (const rule of rules) {
                    error = rule(newValue, nextValues);
                    if (error) break;
                }
                
                setErrors(prevErrors => {
                    const nextErrors = { ...prevErrors };
                    if (error) {
                        nextErrors[name] = error;
                    } else {
                        delete nextErrors[name];
                    }
                    return nextErrors;
                });
            } else if (errors[name]) {
                setErrors(prevErrors => {
                    const nextErrors = { ...prevErrors };
                    delete nextErrors[name];
                    return nextErrors;
                });
            }
            
            return nextValues;
        });
    }, [validationSchema, errors]);

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => {
            const nextValues = { ...prev, [name]: value };
            
            if (validationSchema[name]) {
                const rules = validationSchema[name];
                let error = null;
                for (const rule of rules) {
                    error = rule(value, nextValues);
                    if (error) break;
                }
                
                setErrors(prevErrors => {
                    const nextErrors = { ...prevErrors };
                    if (error) {
                        nextErrors[name] = error;
                    } else {
                        delete nextErrors[name];
                    }
                    return nextErrors;
                });
            } else if (errors[name]) {
                setErrors(prevErrors => {
                    const nextErrors = { ...prevErrors };
                    delete nextErrors[name];
                    return nextErrors;
                });
            }
            
            return nextValues;
        });
    }, [validationSchema, errors]);

    const validateField = useCallback((name, value, schema) => {
        if (!schema[name]) return null;
        
        const rules = schema[name];
        let error = null;

        for (const rule of rules) {
            error = rule(value, values);
            if (error) break;
        }

        return error;
    }, [values]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationSchema).forEach(name => {
            const error = validateField(name, values[name], validationSchema);
            if (error) {
                newErrors[name] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        
        // Scroll to first error
        if (!isValid) {
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.getElementsByName(firstErrorField)[0];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }

        return isValid;
    }, [values, validationSchema, validateField]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsTouched({});
    }, [initialValues]);

    return {
        values,
        setValues,
        errors,
        setErrors,
        handleChange,
        setFieldValue,
        validateForm,
        resetForm,
        isValid: Object.keys(errors).length === 0
    };
};

export default useValidation;
