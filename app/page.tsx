'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, 
  FiDollarSign, 
  FiPieChart, 
  FiCreditCard, 
  FiShield,
  FiSmartphone,
  FiZap
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { RupeeSvg } from '@/components/RupeeSvg';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<'signup' | 'signin' | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Features section data
  const features = [
    {
      title: 'Simple Expense Tracking',
      description: 'Log your daily expenses with just a few taps and organize them into categories.',
      icon: <FiCreditCard />
    },
    {
      title: 'Income Management',
      description: 'Track all your income sources in one place to keep a complete financial picture.',
      icon: <RupeeSvg />
    },
    {
      title: 'Visual Analytics',
      description: 'See your spending patterns with beautiful charts and actionable insights.',
      icon: <FiPieChart />
    },
    {
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely. Only you can access it.',
      icon: <FiShield />
    },
    {
      title: 'Mobile Friendly',
      description: 'A fully responsive design that works perfectly on all your devices.',
      icon: <FiSmartphone />
    },
    {
      title: 'Lightning Fast',
      description: 'Built with Next.js and Supabase for blazing fast performance.',
      icon: <FiZap />
    }
  ];

  // Auto-rotate featured items every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleSignUp = () => router.push('/signup');
  const handleSignIn = () => router.push('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-600 text-white flex flex-col items-center overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            className="absolute top-10 left-10 w-24 h-24 sm:w-40 sm:h-40 bg-teal-400 rounded-full opacity-40 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-16 right-16 w-32 h-32 sm:w-48 sm:h-48 bg-indigo-400 rounded-full opacity-40 blur-3xl"
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500 rounded-lg opacity-30 blur-2xl"
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Header / Nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-4 flex justify-between items-center relative z-10 mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="bg-white/10 backdrop-blur-md p-2 rounded-full"
            >
              <FiPieChart className="text-teal-300 text-xl" />
            </motion.div>
            <span className="font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-indigo-200">
              RupeeTracker
            </span>
          </div>
          <Button
            onClick={handleSignIn}
            variant="ghost"
            className="text-teal-100 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            Log In
          </Button>
        </motion.div>

        {/* Main Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start space-y-6 z-10"
          >
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                <span className="block">Take Control of</span>
                <span className="block bg-gradient-to-r from-teal-300 via-blue-200 to-indigo-300 text-transparent bg-clip-text">
                  Your Finances
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100 max-w-lg">
                Track expenses, manage income, and visualize your financial journey with ease. All in one secure app.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                onClick={handleSignUp}
                className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-semibold py-6 px-8 rounded-xl shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all duration-300 text-lg"
                onMouseEnter={() => setIsHovered('signup')}
                onMouseLeave={() => setIsHovered(null)}
              >
                Start Free <FiArrowRight className={cn('transition-transform', isHovered === 'signup' ? 'translate-x-1' : '')} />
              </Button>
              
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="border-teal-300 bg-white/5 backdrop-blur-md text-teal-100 hover:bg-teal-500/20 hover:text-white font-semibold py-6 px-8 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300 text-lg"
                onMouseEnter={() => setIsHovered('signin')}
                onMouseLeave={() => setIsHovered(null)}
              >
                Log In <FiArrowRight className={cn('transition-transform', isHovered === 'signin' ? 'translate-x-1' : '')} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 px-2 py-3 bg-white/5 backdrop-blur-md rounded-full">
              <FcGoogle className="text-xl" />
              <span className="text-sm text-indigo-100">Sign up with Google available</span>
            </div>
          </motion.div>

          {/* Right Column - App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/30 via-blue-700/20 to-teal-700/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute top-4 left-4 right-4 h-12 bg-white/10 rounded-lg flex items-center px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto text-sm font-medium">Financial Dashboard</div>
              </div>
              
              <div className="absolute top-20 inset-x-4 bottom-4 bg-white/5 rounded-lg p-4 flex flex-col gap-4">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-80">Current Balance</div>
                    <div className="text-3xl font-bold">₹ 32,450</div>
                    <div className="text-sm opacity-80 mt-2">+8.2% from last month</div>
                  </div>
                  <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
                    <FiDollarSign className="text-2xl" />
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm opacity-70">Income</div>
                        <div className="text-xl font-semibold">₹ 45,250</div>
                      </div>
                      <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <FiArrowRight className="text-green-400 rotate-45" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm opacity-70">Expenses</div>
                        <div className="text-xl font-semibold">₹ 12,800</div>
                      </div>
                      <div className="h-8 w-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <FiArrowRight className="text-red-400 rotate-125" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 col-span-2">
                    <div className="text-sm opacity-70 mb-2">Recent Expenses</div>
                    <div className="space-y-2">
                      {[
                        { name: 'Groceries', amount: '2,450', date: 'Today' },
                        { name: 'Rent', amount: '8,000', date: 'Yesterday' },
                        { name: 'Internet', amount: '1,100', date: '3 days ago' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-white/5">
                          <div>{item.name}</div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm opacity-70">{item.date}</span>
                            <span className="font-medium">₹ {item.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 sm:mt-32 mb-12 relative z-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything You Need to
            <span className="block sm:inline ml-0 sm:ml-2 bg-gradient-to-r from-teal-300 to-indigo-300 text-transparent bg-clip-text">
              Manage Your Money
            </span>
          </h2>
          <p className="text-center max-w-2xl mx-auto text-indigo-100 mb-12">
            Powerful features designed to help you track, analyze, and optimize your personal finances with ease.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={cn(
                  "bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300",
                  index === activeFeature && "ring-2 ring-teal-300/60"
                )}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 rounded-xl text-teal-300 text-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-indigo-100">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="my-16 sm:my-24 bg-gradient-to-r from-teal-600/20 to-indigo-600/20 backdrop-blur-md p-8 sm:p-12 rounded-3xl border border-white/10 shadow-xl relative z-10"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Take Control of Your Finances?
            </h3>
            <p className="text-indigo-100 mb-8">
              Join thousands of users who are already managing their money better with RupeeTracker.
            </p>
            <Button
              onClick={handleSignUp}
              className="bg-white text-indigo-900 hover:bg-teal-200 font-semibold py-6 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg inline-flex items-center gap-2"
            >
              Start Your Free Account <FiArrowRight />
            </Button>
            <p className="mt-4 text-sm text-indigo-200">
              No credit card required. Free forever for personal use.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="w-full bg-indigo-950/50 backdrop-blur-md border-t border-white/5 py-6 px-4"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <FiPieChart className="text-teal-400" />
            <span className="font-medium">RupeeTracker</span>
          </div>
          <div className="text-indigo-200 text-sm">
            © {new Date().getFullYear()} RupeeTracker. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-indigo-200 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-indigo-200 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-indigo-200 hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}