'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
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
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [activeField, setActiveField] = useState<string | null>(null);

  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Password strength check
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(null);
      return;
    }

    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    const isLongEnough = formData.password.length >= 8;

    const criteria = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough];
    const metCriteria = criteria.filter(Boolean).length;

    if (metCriteria <= 2) {
      setPasswordStrength('weak');
    } else if (metCriteria <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [formData.password]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccess(null);
    setStep('signup');
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Form validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) throw signupError;

      // Check if user was created successfully
      if (data?.user) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setStep('verify');
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sign in/up with Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message || 'Failed to sign up with Google. Please try again.');
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

  // Email verification screen
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-t-lg"></div>
            <CardHeader className="pb-4 text-center">
              <div className="flex justify-center mb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.2 
                  }}
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-lg"
                >
                  <FiCheck className="text-green-600 w-10 h-10" />
                </motion.div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                We've sent a verification link to:
                <div className="font-medium text-green-700 mt-2 text-lg bg-green-50 py-2 px-4 rounded-lg border border-green-100">
                  {formData.email}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  Please check your email inbox and click the verification link to activate your account.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                  <p className="flex items-start">
                    <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>If you don't see the email, check your spam folder or request a new verification link.</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Go to Login
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={resetForm}
                  className="w-full border-blue-300 hover:bg-blue-50 py-3 rounded-lg font-medium transition-all"
                >
                  Go Back to Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Signup form
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to RupeeTracker</h1>
          <p className="opacity-90">Your personal finance tracker for smart money management</p>
        </div>
        
        <div className="relative h-72 flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center">
              <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Track Your Money</h2>
            <p className="text-blue-100">Get insights into your spending habits and save more</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-indigo-700/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <FiCheck className="mr-2"/> Simple & Secure
            </h3>
            <p className="text-sm opacity-80">Your data is encrypted and never shared with third parties</p>
          </div>
          <p className="text-sm text-center opacity-75">
            © {new Date().getFullYear()} RupeeTracker
          </p>
        </div>
      </div>
      
      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 bg-white p-4 md:p-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-4 md:p-8"
        >
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-500">Join RupeeTracker for better finances</p>
          </div>
          
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h1>
            <p className="text-gray-500">Start tracking your finances in minutes</p>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 rounded-lg">
              <AlertDescription className="text-red-600 flex items-center text-sm py-1">
                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 rounded-lg">
              <AlertDescription className="text-green-600 flex items-center text-sm py-1">
                <FiCheck className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleEmailSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 text-sm font-medium">
                Full Name
              </Label>
              <div className="flex h-12 rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 bg-white overflow-hidden">
                <div className="flex items-center justify-center w-12 text-gray-400 border-r border-gray-300 bg-gray-50">
                  <FiUser className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="flex-grow px-4 py-2 text-base focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email Address
              </Label>
              <div className="flex h-12 rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 bg-white overflow-hidden">
                <div className="flex items-center justify-center w-12 text-gray-400 border-r border-gray-300 bg-gray-50">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="flex-grow px-4 py-2 text-base focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                Password
              </Label>
              <div className="flex h-12 rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 bg-white overflow-hidden">
                <div className="flex items-center justify-center w-12 text-gray-400 border-r border-gray-300 bg-gray-50">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className="flex-grow px-4 py-2 text-base focus:outline-none"
                  required
                  disabled={loading}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
              
              {/* Password strength indicator */}
              {passwordFocused && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg"
                >
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
                    <div className={`flex items-center text-xs ${formData.password.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                      <FiCheck className="mr-1 flex-shrink-0" /> 8+ characters
                    </div>
                    <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}`}>
                      <FiCheck className="mr-1 flex-shrink-0" /> Uppercase letter
                    </div>
                    <div className={`flex items-center text-xs ${/[a-z]/.test(formData.password) ? "text-green-600" : "text-gray-500"}`}>
                      <FiCheck className="mr-1 flex-shrink-0" /> Lowercase letter
                    </div>
                    <div className={`flex items-center text-xs ${/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-500"}`}>
                      <FiCheck className="mr-1 flex-shrink-0" /> Number
                    </div>
                    <div className={`flex items-center text-xs ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-600" : "text-gray-500"}`} style={{gridColumn: "span 2"}}>
                      <FiCheck className="mr-1 flex-shrink-0" /> Special character (!@#$%...)
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-sm font-medium">
                Confirm Password
              </Label>
              <div className={`flex h-12 rounded-lg border focus-within:ring-2 bg-white overflow-hidden ${
                formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-200" 
                  : "border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-200"
              }`}>
                <div className="flex items-center justify-center w-12 text-gray-400 border-r border-gray-300 bg-gray-50">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account <FiArrowRight className="ml-2" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-500 text-sm">OR</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
          <Button 
            onClick={handleGoogleSignup}
            disabled={loading}
            variant="outline"
            className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium py-3 h-12 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <FcGoogle className="w-5 h-5" />
            Sign up with Google
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500 md:hidden">
            © {new Date().getFullYear()} RupeeTracker | Your money, simplified.
          </div>
        </motion.div>
      </div>
    </div>
  );
}