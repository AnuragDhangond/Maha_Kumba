import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userService } from '../../api/services/userService';
import Swal from 'sweetalert2';
import HeadingOrnament from '../../components/HeadingOrnament';
import AuthLayout from './AuthLayout';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import '../../styles/RegisterPage.css';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters (numbers or special characters are not allowed)')
    .regex(/^(?!.*(.)\1{3,}).*$/, 'Name cannot contain repeated consecutive characters'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  address: z.string().min(1, 'Address is required'),
});

const RegisterForm = ({ t, setActivePolicyModal }) => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const emailValue = watch('email');

  React.useEffect(() => {
    const checkEmail = async () => {
      const normalizedEmail = emailValue?.toLowerCase();
      if (normalizedEmail) {
        try {
          const result = await userService.checkEmailExists(normalizedEmail);
          if (!result.valid || result.exists) {
            setError('email', { type: 'manual', message: result.message });
          } else if (errors.email?.type === 'manual') {
            clearErrors('email');
          }
        } catch (error) {
          console.error("Error checking email:", error);
        }
      } else if (errors.email?.type === 'manual') {
        clearErrors('email');
      }
    };

    checkEmail();
  }, [emailValue, setError, clearErrors, errors.email?.type]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const normalizedData = {
        ...data,
        email: data.email.toLowerCase()
    };

    try {
        const response = await userService.registerUser(normalizedData);
        if (response.status === 200 || response.status === 201) {
            Swal.fire({
                icon: 'success',
                title: t('registrationSuccessTitle'),
                text: t('registrationSuccessText'),
                background: '#fff9f0',
                confirmButtonColor: '#e65100',
                timer: 3000,
                timerProgressBar: true
            });
            navigate('/login');
        }
    } catch (error) {
        console.error("Error during registration:", error);
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error.response?.data?.password || error.response?.data?.error || 'Email already exists or invalid data. Please try again.',
            background: '#fff9f0',
            confirmButtonColor: '#e65100'
        });
    } finally {
        setIsLoading(false);
    }
  };

  const isFieldActive = (name) => activeField === name;

  const renderInput = (name, type, placeholder, required = true, iconPath, labelOverride) => {
      const error = errors[name];
      const idStr = `rp-${name}`;
      const isActive = isFieldActive(name);
      
      let autoCompleteVal = "off";
      if (name === "name") autoCompleteVal = "name";
      if (name === "email") autoCompleteVal = "email";
      if (name === "password") autoCompleteVal = "new-password";
      if (name === "address") autoCompleteVal = "street-address";

      return (
          <div className={['lp-field', isActive ? 'lp-field--focus' : '', error ? 'is-invalid' : ''].join(' ')}>
              <label htmlFor={idStr} className="lp-lbl">
                  {iconPath && (
                      <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true">
                          {iconPath}
                      </svg>
                  )}
                  {labelOverride || (name === 'name' ? t('nameLabel') : name.toUpperCase())}
                  {required && <span className="lp-star" aria-hidden="true"> *</span>}
              </label>
              <div className="lp-inp-wrap">
                  <input
                      id={idStr}
                      type={type === 'password' && showPw ? 'text' : type}
                      {...register(name)}
                      onFocus={() => setActiveField(name)}
                      onBlur={() => setActiveField(null)}
                      placeholder={placeholder}
                      autoComplete={autoCompleteVal}
                      style={name === 'email' ? { textTransform: 'lowercase' } : {}}
                  />
                  {type === 'password' && (
                      <button type="button" className="lp-eye" onClick={() => setShowPw(v => !v)}>
                          {showPw ? (
                              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                          ) : (
                              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                          )}
                      </button>
                  )}
                  <div className="lp-underline" aria-hidden="true" />
              </div>
              {error && <div className="invalid-feedback-sacred">{error.message}</div>}
          </div>
      );
  };

  return (
      <div className="lp-card">
          <div className="lp-card-bar" aria-hidden="true" />
          <header className="lp-card-head">
              <div className="lp-head-om" aria-hidden="true">ॐ</div>
              <h1 className="lp-title">{t('registerTitle')}</h1>
              <HeadingOrnament variant="flower" />
              <p className="lp-subtitle">{t('registerSubtitle')}</p>
              <div className="lp-orn" aria-hidden="true"><span className="lp-orn-line" /><span className="lp-orn-gem"></span><span className="lp-orn-line" /></div>
          </header>

          <form className="lp-form rp-form-override" onSubmit={handleSubmit(onSubmit)} noValidate>
              {renderInput('name', 'text', t('namePlaceholder'), true, <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" fill="currentColor" />)}
              {renderInput('email', 'email', t('emailPlaceholder'), true, <><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" fill="currentColor" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" fill="currentColor" /></>)}
              {renderInput('password', 'password', t('passwordPlaceholder'), true, <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" fill="currentColor" />)}

              <div className={['lp-field', activeField === 'address' ? 'lp-field--focus' : '', errors.address ? 'is-invalid' : ''].join(' ')}>
                  <label htmlFor="rp-address" className="lp-lbl">
                      <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" fill="currentColor" /></svg>
                      {t('addressLabel')} <span className='lp-star'> *</span>
                  </label>
                  <div className="lp-inp-wrap">
                      <input id="rp-address" type="text" {...register('address')} onFocus={() => setActiveField('address')} onBlur={() => setActiveField(null)} placeholder={t('addressPlaceholder')} autoComplete="street-address" />
                      <div className="lp-underline" aria-hidden="true" />
                  </div>
                  {errors.address && <div className="invalid-feedback-sacred">{errors.address.message}</div>}
              </div>

              <div style={{ paddingBottom: '16px' }}>
                  <button type="submit" className={`lp-btn ${isLoading ? 'lp-btn--busy' : ''}`} disabled={isLoading}>
                      {isLoading ? (
                          <span className="lp-btn-inner"><svg className="lp-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" /></svg>{t('registering')}</span>
                      ) : (
                          <span className="lp-btn-inner">{t('joinNow')} <svg viewBox="0 0 20 20" fill="currentColor" className="lp-btn-arrow"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg></span>
                      )}
                      <span className="lp-btn-sheen" />
                  </button>
              </div>
          </form>

          <div className="lp-or" aria-hidden="true"><span className="lp-or-line" /><span className='lp-or-word'>{t('orText')}</span><span className="lp-or-line" /></div>
          <p className="lp-reg">{t('alreadyAccount')} <Link to="/login" className="lp-reg-link">{t('signInLink')}<svg viewBox="0 0 16 16" fill="currentColor" className="lp-reg-arr"><path fillRule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z" clipRule="evenodd" /></svg></Link></p>
          <p className="lp-legal">{t('termsNote')} <a href="#terms" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }}>{t('usageTerms')}</a> &amp; <a href="#privacy" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }}>{t('dataPrivacy')}</a></p>
          <p className="lp-lang-note" style={{marginTop: '20px', fontSize: '11px', color: '#888', textAlign: 'center'}}>{t('langHint')}</p>
      </div>
  );
};

const RegisterPage = () => {
  const { settings } = useAdminSettings();
  const navigate = useNavigate();

  if (settings?.publicRegistration === false) {
    return (
      <AuthLayout isRegisterPage={true}>
        <div className="lp-card">
          <div className="lp-card-bar" style={{ background: 'linear-gradient(90deg, #e65100, #ff9800)' }} aria-hidden="true" />
          <header className="lp-card-head" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <div className="lp-head-om" style={{ color: 'rgba(230, 81, 0, 0.15)' }} aria-hidden="true">ॐ</div>
            
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(230, 81, 0, 0.05)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px',
              border: '1px solid rgba(230, 81, 0, 0.1)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e65100" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            <h1 className="lp-title" style={{ color: '#4a372d', fontSize: '28px' }}>Registration Paused</h1>
            <HeadingOrnament variant="flower" />
            
            <div style={{ maxWidth: '280px', margin: '20px auto' }}>
              <p className="lp-subtitle" style={{ fontSize: '14px', lineHeight: '1.6', color: '#795d4d' }}>
                The sacred gateway for new pilgrims is currently restricted by the Maha Kumbh Administration.
              </p>
            </div>
            
            <div className="lp-orn" aria-hidden="true">
              <span className="lp-orn-line" />
              <span className="lp-orn-gem" style={{ background: '#e65100' }}></span>
              <span className="lp-orn-line" />
            </div>
          </header>
          
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <button 
              className="lp-btn" 
              onClick={() => navigate('/')}
              style={{ 
                background: 'linear-gradient(135deg, #e65100 0%, #bf360c 100%)',
                boxShadow: '0 10px 20px rgba(191, 54, 12, 0.2)'
              }}
            >
              <span className="lp-btn-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Back to Home
              </span>
            </button>
          </div>

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <p className="lp-reg" style={{ margin: 0 }}>
              Already have an account? <Link to="/login" className="lp-reg-link" style={{ color: '#e65100', fontWeight: '700' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout isRegisterPage={true}>
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
