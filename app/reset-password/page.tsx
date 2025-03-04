'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiArrowLeft, 
  FiArrowRight, 
  FiCheck, 
  FiAlertCircle 
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
import Link from 'next/link';

export default function PasswordReset() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Email validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Send password reset email through Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });

      if (resetError) throw resetError;

      // Show success message
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                We've sent password reset instructions to:
                <div className="font-medium text-green-700 mt-2 text-lg bg-green-50 py-2 px-4 rounded-lg border border-green-100">
                  {email}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  Please check your email and follow the instructions to reset your password.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                  <p className="flex items-start">
                    <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>If you don't see the email, check your spam folder or request a new link.</span>
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Return to Login
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setSuccess(false)}
                  className="w-full border-blue-300 hover:bg-blue-50 py-3 rounded-lg font-medium transition-all"
                >
                  Send Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Password reset request form
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Password Reset</h1>
          <p className="opacity-90">We'll help you get back into your account</p>
        </div>
        
        <div className="relative h-72 flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center">
              <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
            <p className="text-blue-100">Get back to managing your finances</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-indigo-700/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <FiCheck className="mr-2"/> Simple & Secure
            </h3>
            <p className="text-sm opacity-80">We'll email you instructions to safely reset your password</p>
          </div>
          <p className="text-sm text-center opacity-75">
            © {new Date().getFullYear()} RupeeTracker
          </p>
        </div>
      </div>
      
      {/* Right side - Reset form */}
      <div className="w-full md:w-1/2 bg-white p-4 md:p-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-4 md:p-8"
        >
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h1>
            <p className="text-gray-500">We'll help you recover your account</p>
          </div>
          
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h1>
            <p className="text-gray-500">Enter your email to get a password reset link</p>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 rounded-lg">
              <AlertDescription className="text-red-600 flex items-center text-sm py-1">
                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handlePasswordReset} className="space-y-5">
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
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-grow px-4 py-2 text-base focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
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
                  Sending Reset Link...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Send Reset Link <FiArrowRight className="ml-2" />
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <FiArrowLeft className="mr-2" /> Back to Login
            </Link>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-500 md:hidden">
            © {new Date().getFullYear()} RupeeTracker | Your money, simplified.
          </div>
        </motion.div>
      </div>
    </div>
  );
}