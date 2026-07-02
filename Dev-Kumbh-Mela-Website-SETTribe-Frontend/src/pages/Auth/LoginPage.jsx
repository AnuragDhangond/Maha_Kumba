import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../api/services/authService';
import { userService } from '../../api/services/userService';
import Swal from 'sweetalert2';
import HeadingOrnament from '../../components/HeadingOrnament';
import useAuth from '../../hooks/useAuth';
import { useAdminSettings } from '../../contexts/AdminSettingsContext';
import AuthLayout from './AuthLayout';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});

const LoginForm = ({ t, setActivePolicyModal }) => {
  const { settings } = useAdminSettings();
  const { login } = useAuth();
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
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const emailValue = watch('email');

  React.useEffect(() => {
    const checkEmail = async () => {
      if (emailValue) {
        try {
          const result = await userService.checkEmailExists(emailValue);
          if (!result.valid) {
            setError('email', { type: 'manual', message: result.message });
          } else if (!result.exists) {
            setError('email', { type: 'manual', message: 'Email id not found' });
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
    const normalizedEmail = data.email.toLowerCase();
    try {
      const response = await authService.loginUser({
        email: normalizedEmail,
        password: data.password,
      });

      setIsLoading(false);

      if (response.status === 200 || response.status === 201) {
        const token = response.data?.token;
        const refreshToken = response.data?.refreshToken;
        if (token) {
          localStorage.setItem('jwtToken', token);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        const currentUserResponse = await authService.getCurrentUser();
        const userData = login(currentUserResponse.data);
        
        // Check if user is active
        if (userData && userData.isActive === false) {
          Swal.fire({
            icon: 'error',
            title: 'Account Deactivated',
            text: 'Your account has been deactivated by the administrator. Please contact support.',
            background: '#fff9f0',
            confirmButtonColor: '#e65100'
          });
          return;
        }

        const role = String(userData?.role || '').toLowerCase();
        
        if (role === 'admin') {
            navigate('/admin-dashboard');
        } else if (role === 'operator') {
            navigate('/operator/dashboard');
        } else {
            navigate('/');
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: error.response?.data?.error || 'Invalid email or password. Please try again.',
          background: '#fff9f0',
          confirmButtonColor: '#e65100'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Server Error',
          text: 'Something went wrong on our end. Please try later.',
          background: '#fff9f0',
          confirmButtonColor: '#e65100'
        });
      }
    }
  };

  return (
    <div className="lp-card">
      <div className="lp-card-bar" aria-hidden="true" />
      <header className="lp-card-head">
        <div className="lp-head-om" aria-hidden="true">ॐ</div>
        <h1 className="lp-title">{t('welcomeBack')}</h1>
        <HeadingOrnament variant="leaf" />
        <p className="lp-subtitle">{t('subtitleLogin')}</p>
        <div className="lp-orn" aria-hidden="true">
          <span className="lp-orn-line" />
          <span className="lp-orn-gem"></span>
          <span className="lp-orn-line" />
        </div>
      </header>

      <form className="lp-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className={[
          'lp-field',
          activeField === 'email' ? 'lp-field--focus' : '',
          errors.email ? 'is-invalid' : ''
        ].join(' ')}>
          <label htmlFor="lp-email" className="lp-lbl">
            <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" fill="currentColor" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" fill="currentColor" />
            </svg>
            {t('emailLabel')}
            <span className="lp-star" aria-hidden="true"> *</span>
          </label>
          <div className="lp-inp-wrap">
            <input
              id="lp-email"
              type="email"
              {...register('email')}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
              placeholder={t('emailPlaceholder')}
              autoComplete="username"
              style={{ textTransform: 'lowercase' }}
            />
            <div className="lp-underline" aria-hidden="true" />
          </div>
          {errors.email && <div className="invalid-feedback-sacred">{errors.email.message}</div>}
        </div>

        {/* Password */}
        <div className={[
          'lp-field',
          activeField === 'password' ? 'lp-field--focus' : '',
          errors.password ? 'is-invalid' : ''
        ].join(' ')}>
          <label htmlFor="lp-password" className="lp-lbl">
            <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" fill="currentColor" />
            </svg>
            {t('passwordLabel')}
            <span className="lp-star" aria-hidden="true"> *</span>
          </label>
          <div className="lp-inp-wrap">
            <input
              id="lp-password"
              type={showPw ? 'text' : 'password'}
              {...register('password')}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField(null)}
              placeholder={t('passwordPlaceholder')}
              autoComplete="current-password"
            />
            <button type="button" className="lp-eye"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
            <div className="lp-underline" aria-hidden="true" />
          </div>
          {errors.password && <div className="invalid-feedback-sacred">{errors.password.message}</div>}
        </div>

        {/* Forgot */}
        <div className="lp-forgot-row">
          <Link to="/forgot-password" className="lp-forgot">{t('forgotPassword')}</Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`lp-btn ${isLoading ? 'lp-btn--busy' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="lp-btn-inner">
              <svg className="lp-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
              {t('loggingIn')}
            </span>
          ) : (
            <span className="lp-btn-inner">
              {t('loginBtn')}
              <svg viewBox="0 0 20 20" fill="currentColor" className="lp-btn-arrow" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          <span className="lp-btn-sheen" aria-hidden="true" />
        </button>
      </form>

      {/* OR */}
      <div className="lp-or" aria-hidden="true">
        <span className="lp-or-line" />
        <span className="lp-or-word">{t('orText')}</span>
        <span className="lp-or-line" />
      </div>

      {/* Register */}
      {settings?.publicRegistration !== false ? (
        <p className="lp-reg">
          {t('noAccount')}{' '}
          <Link to="/register" className="lp-reg-link">
            {t('registerLink')}
            <svg viewBox="0 0 16 16" fill="currentColor" className="lp-reg-arr" aria-hidden="true">
              <path fillRule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z" clipRule="evenodd" />
            </svg>
          </Link>
        </p>
      ) : (
        <div className="registration-paused-notice" style={{ 
          marginTop: '25px', 
          padding: '20px', 
          background: 'rgba(230, 81, 0, 0.04)', 
          border: '1px solid rgba(230, 81, 0, 0.15)', 
          borderRadius: '16px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            opacity: 0.05,
            transform: 'rotate(20deg)'
          }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2v20M12 6c3.5 0 6 2.5 6 6M12 6c-3.5 0-6 2.5-6 6M6 12h12" />
            </svg>
          </div>
          
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px',
            boxShadow: '0 4px 10px rgba(230, 81, 0, 0.2)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h3 style={{ 
            margin: '0 0 6px', 
            fontSize: '15px', 
            color: '#4a372d', 
            fontWeight: '700',
            letterSpacing: '0.3px'
          }}>
            Registration Paused
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '12px', 
            color: '#795d4d', 
            lineHeight: '1.5',
            fontWeight: '500'
          }}>
            The gateway for new pilgrims is temporarily closed by the Administration. Please sign in with existing credentials.
          </p>
        </div>
      )}

      {/* Legal */}
      <p className="lp-legal">
        {t('termsNote')}{' '}
        <a href="#terms" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }}>{t('usageTerms')}</a> &amp; <a href="#privacy" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }}>{t('dataPrivacy')}</a>
      </p>
      <p className="lp-lang-note" style={{marginTop: '20px', fontSize: '11px', color: '#888', textAlign: 'center'}}>{t('langHint')}</p>
    </div>
  );
};

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
