'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function PasswordResetConfirm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  // Check if there's a valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // If there's a session but the user needs to set a new password, it's a valid reset session
        if (session && session.user.email) {
          setValidSession(true);
        } else {
          // Try to extract the reset token from URL if it's there
          const hash = window.location.hash;
          const accessToken = hash.replace('#access_token=', '');
          
          if (accessToken && accessToken.length > 0) {
            // If there's an access token in the URL, we'll consider it valid
            // Supabase will handle the validation when we try to update the password
            setValidSession(true);
          } else {
            setValidSession(false);
            setError('Invalid or expired password reset link. Please request a new one.');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setValidSession(false);
        setError('Unable to verify your session. Please request a new password reset link.');
      }
    };

    checkSession();
  }, []);

  // Password strength check
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(null);
      return;
    }

    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

    const criteria = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough];
    const metCriteria = criteria.filter(Boolean).length;

    if (metCriteria <= 2) {
      setPasswordStrength('weak');
    } else if (metCriteria <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [newPassword]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Update password through Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Show success message
      setSuccess(true);
      
      // Sign out after password reset
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  // Loading state
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Verifying your request...</p>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (validSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 rounded-t-lg"></div>
            <CardHeader className="pb-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center shadow-lg">
                  <FiAlertCircle className="text-red-600 w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p>
                  For security reasons, password reset links are only valid for a limited time.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/reset-password')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Request New Link
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full border-blue-300 hover:bg-blue-50 py-3 rounded-lg font-medium transition-all"
                >
                  Return to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <div className="absolute top-0 left-0 right-0 h-2 bg-green-500 rounded-t-lg"></div>
            <CardHeader className="pb-4 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                  <FiCheck className="text-green-600 w-8 h-8" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Password Updated!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your password has been successfully changed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  You can now sign in to your account with your new password.
                </p>
              </div>
              
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
          <p className="opacity-90">Set a secure password for your account</p>
        </div>
        
        <div className="relative h-72 flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center">
              <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
            <p className="text-blue-100">Choose a strong password to keep your account secure</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-indigo-700/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <FiCheck className="mr-2"/> Security Tip
            </h3>
            <p className="text-sm opacity-80">Use a unique password that you don't use on other sites</p>
          </div>
          <p className="text-sm text-center opacity-75">
            © {new Date().getFullYear()} RupeeTracker
          </p>
        </div>
      </div>
      
      {/* Right side - New password form */}
      <div className="w-full md:w-1/2 bg-white p-4 md:p-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-4 md:p-8"
        >
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h1>
            <p className="text-gray-500">Choose a strong password for your account</p>
          </div>
          
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h1>
            <p className="text-gray-500">Please enter a secure password for your account</p>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 rounded-lg">
              <AlertDescription className="text-red-600 flex items-center text-sm py-1">
                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-700 text-sm font-medium">
                New Password
              </Label>
              <div className="flex h-12 rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 bg-white overflow-hidden">
                <div className="flex items-center justify-center w-12 text-gray-400 border-r border-gray-300 bg-gray-50">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="flex-grow px-4 py-2 text-base focus:outline-none"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="px-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <FiEyeOff className="w-5 h-5" /> : 
                    <FiEye className="w-5 h-5" />
                  }
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="mb-1 flex justify-between items-center">
                  <span>Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-500' :
                    passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {passwordStrength || 'None'}
                  </span>
                </p>
                <div className="h-1.5 w-full bg-gray-200 rounded-full mt-1 mb-3 overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    style={{ 
                      width: passwordStrength === 'weak' ? '33%' : 
                             passwordStrength === 'medium' ? '66%' : 
                             passwordStrength === 'strong' ? '100%' : '0%' 
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center text-xs ${newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                    <FiCheck className="mr-1 flex-shrink-0" /> 8+ characters
                  </div>
                  <div className={`flex items-center text-xs ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                    <FiCheck className="mr-1 flex-shrink-0" /> Uppercase letter
                  </div>
                  <div className={`flex items-center text-xs ${/[a-z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                    <FiCheck className="mr-1 flex-shrink-0" /> Lowercase letter
                  </div>
                  <div className={`flex items-center text-xs ${/[0-9]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}>
                    <FiCheck className="mr-1 flex-shrink-0" /> Number
                  </div>
                  <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`} style={{gridColumn: "span 2"}}>
                    <FiCheck className="mr-1 flex-shrink-0" /> Special character (!@#$%...)
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 text-sm font-medium">
                Confirm Password
              </Label>
              <div className={`flex h-12 rounded-lg border focus-within:ring-2 bg-white overflow-hidden ${
                confirmPassword && newPassword !== confirmPassword 
                  ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-200" 
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-200"
              }`}>
                <div className="flex items-center justify-center w-12 text-gray-400 border-r border-gray-300 bg-gray-50">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="flex-grow px-4 py-2 text-base focus:outline-none"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="px-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <FiEyeOff className="w-5 h-5" /> : 
                    <FiEye className="w-5 h-5" />
                  }
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Update Password <FiArrowRight className="ml-2" />
                </div>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}