'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
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

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: formData.email, 
        password: formData.password 
      });
      
      if (error) throw error;
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="opacity-90">Sign in to continue managing your finances with Rupee Tracker</p>
        </div>
        
        <div className="relative h-72 flex items-center justify-center">
          <div className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-2xl"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center">
              <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Track Your Finances</h2>
            <p className="text-blue-100">Insights, budgeting, and financial freedom</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-indigo-700/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <FiCheck className="mr-2"/> Secure & Private
            </h3>
            <p className="text-sm opacity-80">Your financial data is encrypted and secured</p>
          </div>
          <p className="text-sm text-center opacity-75">
            © {new Date().getFullYear()} RupeeTracker
          </p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 bg-white p-4 md:p-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-4 md:p-8"
        >
          <div className="md:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h1>
            <p className="text-gray-500">Welcome back to RupeeTracker</p>
          </div>
          
          <div className="hidden md:block mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign In to Your Account</h1>
            <p className="text-gray-500">Continue managing your finances</p>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 rounded-lg">
              <AlertDescription className="text-red-600 flex items-center text-sm py-1">
                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex justify-between">
                <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                  Password
                </Label>
                <Link 
                  href="/reset-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
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
                  placeholder="Your password"
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
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                Remember me
              </label>
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
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In <FiArrowRight className="ml-2" />
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
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium py-3 h-12 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign up here
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