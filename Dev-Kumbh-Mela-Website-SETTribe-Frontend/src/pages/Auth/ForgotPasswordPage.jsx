import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '../../api/services/authService';
import Swal from 'sweetalert2';
import HeadingOrnament from '../../components/HeadingOrnament';
import AuthLayout from './AuthLayout';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .regex(/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Invalid email format (e.g., user@example.com)'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const ForgotPasswordForm = ({ t = {}, setActivePolicyModal }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const handleEmailBlur = async (e) => {
      const email = e.target.value;
      setActiveField(null);
      
      if (!email) return;

      // Trigger local validation first
      const isValidFormat = await trigger('email');
      if (!isValidFormat) return;

      try {
          const result = await authService.checkEmailExists(email);
          if (!result.exists) {
              setError('email', { 
                  type: 'manual', 
                  message: 'Email not found in our records' 
              });
          } else {
              clearErrors('email');
          }
      } catch (error) {
          console.error("Email check failed:", error);
      }
  };

  const onSubmit = async (data) => {
      setIsLoading(true);

      try {
          const response = await authService.resetPassword({
              email: data.email,
              newPassword: data.password
          });

          if (response.status === 200 || response.status === 201) {
              Swal.fire({
                  icon: 'success',
                  title: 'Peace Restored!',
                  text: `Password for ${data.email} has been successfully reset.`,
                  background: '#fff9f0',
                  confirmButtonColor: '#e65100',
                  timer: 3000,
                  timerProgressBar: true
              });
              navigate('/login');
          }
      } catch (error) {
          console.error("Error during password reset:", error);
          if (error.response) {
              Swal.fire({
                  icon: 'error',
                  title: 'Reset Denied',
                  text: error.response?.data?.newPassword || error.response?.data?.error || 'Email not found or server refused. Please try again.',
                  background: '#fff9f0',
                  confirmButtonColor: '#e65100'
              });
          } else {
              Swal.fire({
                  icon: 'warning',
                  title: 'Connectivity Lost',
                  text: 'Could not connect to the cloud. Check your link.',
                  background: '#fff9f0',
                  confirmButtonColor: '#e65100'
              });
          }
      } finally {
          setIsLoading(false);
      }
  };

  return (
      <div className="lp-card">
          <div className="lp-card-bar" aria-hidden="true" />
          <header className="lp-card-head">
              <div className="lp-head-om" aria-hidden="true">ॐ</div>
              <h1 className="lp-title">Reset Password</h1>
              <HeadingOrnament variant="swirl" />
              <p className="lp-subtitle">Enter your email and new password</p>
              <div className="lp-orn" aria-hidden="true">
                  <span className="lp-orn-line" />
                  <span className="lp-orn-gem"></span>
                  <span className="lp-orn-line" />
              </div>
          </header>

          <form className="lp-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={[
                  'lp-field',
                  activeField === 'email' ? 'lp-field--focus' : '',
                  errors.email ? 'is-invalid' : ''
              ].join(' ')}>
                  <label htmlFor="fp-email" className="lp-lbl">
                      <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" fill="currentColor" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" fill="currentColor" />
                      </svg>
                      Email Address
                      <span className="lp-star" aria-hidden="true"> *</span>
                  </label>
                  <div className="lp-inp-wrap">
                      <input
                          id="fp-email"
                          type="email"
                          {...register('email', { onBlur: handleEmailBlur })}
                          onFocus={() => setActiveField('email')}
                          placeholder="Enter your registered email"
                          autoComplete="email"
                      />
                      <div className="lp-underline" aria-hidden="true" />
                  </div>
                  {errors.email && <div className="invalid-feedback-sacred">{errors.email.message}</div>}
              </div>

              <div className={[
                  'lp-field',
                  activeField === 'password' ? 'lp-field--focus' : '',
                  errors.password ? 'is-invalid' : ''
              ].join(' ')}>
                  <label htmlFor="fp-password" className="lp-lbl">
                      <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      New Password
                      <span className="lp-star" aria-hidden="true"> *</span>
                  </label>
                  <div className="lp-inp-wrap">
                      <input
                          id="fp-password"
                          type={showPassword ? "text" : "password"}
                          {...register('password')}
                          onFocus={() => setActiveField('password')}
                          onBlur={() => setActiveField(null)}
                          autoComplete="new-password"
                      />
                      <button
                          type="button"
                          className="lp-eye"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                          {showPassword ? (
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

              <div className={[
                  'lp-field',
                  activeField === 'confirm' ? 'lp-field--focus' : '',
                  errors.confirmPassword ? 'is-invalid' : ''
              ].join(' ')}>
                  <label htmlFor="fp-confirm" className="lp-lbl">
                      <svg className="lp-lbl-ico" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Confirm Password
                      <span className="lp-star" aria-hidden="true"> *</span>
                  </label>
                  <div className="lp-inp-wrap">
                      <input
                          id="fp-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          {...register('confirmPassword')}
                          onFocus={() => setActiveField('confirm')}
                          onBlur={() => setActiveField(null)}
                          autoComplete="new-password"
                      />
                      <button
                          type="button"
                          className="lp-eye"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                          {showConfirmPassword ? (
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
                  {errors.confirmPassword && <div className="invalid-feedback-sacred">{errors.confirmPassword.message}</div>}
              </div>

              <button
                  type="submit"
                  className={`lp-btn ${isLoading ? 'lp-btn--busy' : ''}`}
                  disabled={isLoading}
                  style={{ marginTop: '16px', marginBottom: '16px' }}
              >
                  {isLoading ? (
                      <span className="lp-btn-inner">
                          <svg className="lp-spin" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
                          </svg>
                          Sending...
                      </span>
                  ) : (
                      <span className="lp-btn-inner">
                          Reset Password
                          <svg viewBox="0 0 20 20" fill="currentColor" className="lp-btn-arrow" aria-hidden="true">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                      </span>
                  )}
                  <span className="lp-btn-sheen" aria-hidden="true" />
              </button>
          </form>

          <div className="lp-or" aria-hidden="true">
              <span className="lp-or-line" />
              <span className="lp-or-word">or</span>
              <span className="lp-or-line" />
          </div>

          <p className="lp-reg">
              Remembered your password?{' '}
              <Link to="/login" className="lp-reg-link">
                  Sign in
                  <svg viewBox="0 0 16 16" fill="currentColor" className="lp-reg-arr" aria-hidden="true">
                      <path fillRule="evenodd" d="M4 8a.5.5 0 01.5-.5h5.793L8.146 5.354a.5.5 0 11.708-.708l3 3a.5.5 0 010 .708l-3 3a.5.5 0 01-.708-.708L10.293 8.5H4.5A.5.5 0 014 8z" clipRule="evenodd" />
                  </svg>
              </Link>
          </p>

          <p className="lp-legal">
              {t.termsNote}{' '}
              <a href="#terms" onClick={(e) => { e.preventDefault(); setActivePolicyModal('terms'); }}>{t.terms}</a> &amp; <a href="#privacy" onClick={(e) => { e.preventDefault(); setActivePolicyModal('privacy'); }}>{t.privacy}</a>
          </p>
      </div>
  );
};

const ForgotPasswordPage = () => {
  return (
    <AuthLayout isForgotPasswordPage={true}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
