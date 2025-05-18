'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Check, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Email form state
  const [emailForm, setEmailForm] = useState({
    currentEmail: '',
    newEmail: '',
    password: '',
  });

  // Password form state remains the same
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Success and error states
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Email change flow states
  const [emailChangeStep, setEmailChangeStep] = useState(1); // 1: initial, 2: verification, 3: success
  const [verificationCode, setVerificationCode] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password validation
  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  // Updated handleInitialEmailSubmit to validate before showing the modal
  const handleInitialEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    setIsSubmittingEmail(true);
    
    if (!emailForm.newEmail) {
      setEmailError('New email is required');
      setIsSubmittingEmail(false);
      return;
    }

    if (emailForm.newEmail === emailForm.currentEmail) {
      setEmailError('New email must be different from your current email');
      setIsSubmittingEmail(false);
      return;
    }
    
    try {
      // First validate email and password
      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/validate-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          currentEmail: emailForm.currentEmail,
          newEmail: emailForm.newEmail,
          password: emailForm.password,
        }),
      });

      // Check if response is JSON
      const contentType = validationResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await validationResponse.text();
        console.error('Server returned non-JSON response:', errorText);
        throw new Error('Server returned an invalid response format');
      }

      const validationData = await validationResponse.json();
      
      if (!validationResponse.ok) {
        setEmailError(validationData.message || 'Validation failed');
        setIsSubmittingEmail(false);
        return;
      }
      
      // If validation passes, show confirmation modal
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error validating email change:', error);
      setEmailError('An error occurred while validating. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  // After user confirms they understand they'll need to log in again
  const handleConfirmEmailChange = async () => {
    setIsSubmittingEmail(true);
    setEmailError('');
    
    try {
      // Just send verification code since validation already happened
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.id}/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentEmail: emailForm.currentEmail,
          newEmail: emailForm.newEmail,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Server returned non-JSON response:', errorText);
        setShowConfirmModal(false); // Close modal on error
        throw new Error('Server returned an invalid response format');
      }

      const data = await response.json();
      
      if (response.ok) {
        // Move to verification step
        setEmailChangeStep(2);
        setShowConfirmModal(false);
      } else {
        setEmailError(data.message || 'Failed to initiate email change');
        setShowConfirmModal(false); // Close modal on error
      }
    } catch (error) {
      console.error('Error initiating email change:', error);
      setEmailError('An error occurred while initiating email change');
      setShowConfirmModal(false); // Close modal on error
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  // Verify the code sent to new email
  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);
    setEmailError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.id}/verify-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          verificationCode,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Email successfully changed
        setEmailChangeStep(3);
        
        // Auto-logout after 5 seconds
        setTimeout(() => {
          signOut({ redirect: false }).then(() => {
            router.push('/auth/login');
          });
        }, 5000);
      } else {
        setEmailError(data.message || 'Failed to verify code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setEmailError('An error occurred while verifying the code');
    } finally {
      setIsVerifying(false);
    }
  };

  // Cancel the email change process
  const handleCancelEmailChange = () => {
    setShowConfirmModal(false);
    setEmailChangeStep(1);
    setVerificationCode('');
    setEmailError('');
  };

  // Update the handlePasswordSubmit function
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Set success state
        setPasswordSuccess(true);
        
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordStrength(0);
        
        // Add explicit success message
        setPasswordError('');
        
        // Use a longer timeout to ensure the user sees the success message
        setTimeout(() => {
          signOut({ redirect: false }).then(() => {
            router.push('/auth/login?message=Password+changed+successfully.+Please+login+with+your+new+password.');
          });
        }, 3000); // 3 seconds
      } else {
        setPasswordSuccess(false);
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch (error) {
      setPasswordSuccess(false);
      console.error('Error updating password:', error);
      setPasswordError('An error occurred while updating your password');
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPasswordForm({ ...passwordForm, newPassword });
    validatePassword(newPassword);
  };

  // Fetch user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          
          // Only update the email field, NEVER set the password from the server
          setEmailForm(prev => ({ 
            ...prev, 
            currentEmail: data.email || '' 
          }));
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      getUserData();
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/20 p-2 rounded-lg">
              <User className="h-7 w-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Account Settings
            </h2>
          </div>
          <p className="text-zinc-400 font-light">
            Manage your account credentials and security settings
          </p>
          <div className="border-b border-white/5 pt-2"></div>
        </div>

        {/* Email Change Form */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/10 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Change Email</h2>
          </div>
          
          {emailChangeStep === 1 && (
            <form onSubmit={handleInitialEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="input validator input-lg w-full">
                  <i className='fi fi-br-at text-sm text-gray-500'></i>
                  <input
                    id="currentEmail"
                    name="currentEmail"
                    type="email"
                    readOnly
                    className="text-sm cursor-not-allowed"
                    value={emailForm.currentEmail}
                  />
                </label>
                <p className="text-xs text-zinc-500">Your current email address (cannot be edited)</p>
              </div>
              
              <div className="space-y-2">
                <label className="input validator input-lg w-full">
                  <i className='fi fi-br-at text-sm text-gray-500'></i>
                  <input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    required
                    placeholder="New Email address"
                    className="text-sm"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  />
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="input validator input-lg w-full">
                  <i className='fi fi-br-lock text-sm text-gray-500'></i>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Current Password (for verification)"
                    className="text-sm"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  />
                </label>
              </div>
              
              {emailError && (
                <div className="flex items-center gap-1 text-red-400 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{emailError}</span>
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn px-6 py-2 rounded-lg font-medium text-white bg-teal-500 hover:bg-teal-600"
                  disabled={!emailForm.newEmail || !emailForm.password || emailForm.newEmail === emailForm.currentEmail}
                >
                  <span>Continue</span>
                </button>
              </div>
            </form>
          )}
          
          {emailChangeStep === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
                <p className="text-sm text-zinc-300">
                  A verification code has been sent to <span className="font-medium text-teal-400">{emailForm.newEmail}</span>. 
                  Please check your inbox and enter the code below to complete the email change.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300 mb-1">Verification Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-center text-lg tracking-widest bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  required
                />
              </div>
              
              {emailError && (
                <div className="flex items-center gap-1 text-red-400 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{emailError}</span>
                </div>
              )}
              
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCancelEmailChange}
                  className="btn px-4 py-2 rounded-lg font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700"
                >
                  <span>Cancel</span>
                </button>
                
                <button
                  type="submit"
                  className="btn px-6 py-2 rounded-lg font-medium text-white bg-teal-500 hover:bg-teal-600"
                  disabled={verificationCode.length !== 6 || isVerifying}
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <span>Verify & Change Email</span>
                  )}
                </button>
              </div>
            </form>
          )}
          
          {emailChangeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Email changed successfully!</span>
                </div>
                <p className="text-sm text-zinc-300 mt-1">
                  Your email has been updated to <span className="font-medium text-emerald-400">{emailForm.newEmail}</span>. 
                  You will be logged out in a few seconds. Please log in again with your new email address.
                </p>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="btn px-6 py-2 rounded-lg font-medium text-white bg-emerald-500 cursor-not-allowed"
                  disabled={true}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging out...</span>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Confirmation Modal*/}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
              <div className="bg-zinc-900 rounded-xl p-6 border border-amber-500/20 shadow-lg shadow-amber-500/5 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
                  <div className="bg-amber-500/10 p-2 rounded-lg">
                    <LogOut className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white">Confirm Email Change</h3>
                </div>
                
                <p className="text-zinc-300 mb-5 text-sm">
                  After changing your email address, you will be automatically logged out and will need to log in again using your new email address.
                </p>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCancelEmailChange}
                    className="btn px-4 py-2 rounded-lg font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleConfirmEmailChange}
                    className="btn px-6 py-2 rounded-lg font-medium text-white bg-amber-500 hover:bg-amber-600"
                    disabled={isSubmittingEmail}
                  >
                    {isSubmittingEmail ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <span>Continue</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Password Form - Keep as is */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-teal-500/10 p-2 rounded-lg">
              <Lock className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="input validator input-lg w-full flex items-center">
                <i className='fi fi-br-lock text-sm text-gray-500'></i>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  placeholder="Current Password"
                  className='text-sm flex-1 bg-transparent border-none outline-none'
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button 
                  type="button"
                  className="ml-2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
            </div>

            <div className="space-y-2">
              <label className="input validator input-lg w-full flex items-center">
                <i className='fi fi-br-lock text-sm text-gray-500'></i>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="New Password"
                  className='text-sm flex-1 bg-transparent border-none outline-none'
                  value={passwordForm.newPassword}
                  onChange={handleNewPasswordChange}
                />
                <button 
                  type="button"
                  className="ml-2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              {passwordForm.newPassword && (
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength 
                          ? passwordStrength === 1 
                            ? 'bg-red-500' 
                            : passwordStrength === 2 
                              ? 'bg-amber-500' 
                              : passwordStrength === 3 
                                ? 'bg-teal-500'
                                : 'bg-teal-500'
                          : 'bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="input validator input-lg w-full flex items-center">
                <i className='fi fi-br-lock text-sm text-gray-500'></i>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm New Password"
                  className='text-sm flex-1 bg-transparent border-none outline-none'
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <button 
                  type="button"
                  className="ml-2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Passwords don&apos;t match</span>
                </div>
              )}
            </div>
            
            {passwordError && (
              <div className="flex items-center gap-1 text-red-400 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              {/* Add this right after the password form, before the submit button */}
              {passwordSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Password updated successfully!</span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-1">
                    You will be logged out in a few seconds. Please log in again with your new password.
                  </p>
                </div>
              )}

              {/* And update the submit button to show proper state */}
              <button
                type="submit"
                className={`btn px-6 py-2 rounded-lg font-medium text-white
                  ${passwordSuccess 
                    ? 'bg-emerald-500 cursor-not-allowed' 
                    : 'bg-teal-500 hover:bg-teal-600'
                  }`}
                disabled={
                  passwordSuccess ||
                  !passwordForm.currentPassword || 
                  !passwordForm.newPassword || 
                  !passwordForm.confirmPassword || 
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
              >
                {passwordSuccess ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging out...</span>
                  </div>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}