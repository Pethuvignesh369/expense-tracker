'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiDollarSign, FiPieChart, FiCreditCard } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState<'signup' | 'signin' | null>(null);

  const handleSignUp = () => router.push('/signup');
  const handleSignIn = () => router.push('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-600 text-white flex flex-col items-center justify-between overflow-hidden">
      {/* Hero Section */}
      <div className="relative w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex-1 flex flex-col items-center justify-center">
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
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
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 bg-blue-500 rounded-lg opacity-30 blur-2xl"
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8 md:mb-12 z-10"
        >
          <motion.div
            className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400 p-2 sm:p-3 rounded-full shadow-xl"
            >
              <FiPieChart className="text-white text-2xl sm:text-4xl" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-blue-200 to-indigo-300 text-transparent bg-clip-text">
              Expense Tracker
            </h1>
          </motion.div>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl font-light text-indigo-100 max-w-md sm:max-w-2xl mx-auto px-2 sm:px-0">
            Unleash your financial potential. Track, manage, and thrive with elegance.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto z-10 mb-8 sm:mb-12"
        >
          <Button
            onClick={handleSignUp}
            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-lg md:text-xl"
            onMouseEnter={() => setIsHovered('signup')}
            onMouseLeave={() => setIsHovered(null)}
          >
            Start Now <FiArrowRight className={cn('transition-transform', isHovered === 'signup' ? 'translate-x-1' : '')} />
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="w-full sm:w-auto border-teal-300 bg-transparent text-teal-100 hover:bg-teal-500/20 hover:text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-md hover:shadow-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-lg md:text-xl"
            onMouseEnter={() => setIsHovered('signin')}
            onMouseLeave={() => setIsHovered(null)}
          >
            Sign In <FiArrowRight className={cn('transition-transform', isHovered === 'signin' ? 'translate-x-1' : '')} />
          </Button>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-5xl px-4 sm:px-6 md:px-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-teal-200/50"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-teal-500 text-3xl sm:text-4xl mb-3 sm:mb-4"
              >
                <FiDollarSign />
              </motion.div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">Track Income</h3>
              <p className="text-gray-600 text-sm sm:text-base">Capture every earning with precision.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-teal-200/50"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-teal-500 text-3xl sm:text-4xl mb-3 sm:mb-4"
              >
                <FiCreditCard />
              </motion.div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">Monitor Expenses</h3>
              <p className="text-gray-600 text-sm sm:text-base">Organize spending with flair.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col items-center text-center border border-teal-200/50 sm:col-span-2 md:col-span-1"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="text-teal-500 text-3xl sm:text-4xl mb-3 sm:mb-4"
              >
                <FiPieChart />
              </motion.div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">Visualize Trends</h3>
              <p className="text-gray-600 text-sm sm:text-base">See your finances in vibrant detail.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="w-full text-center py-4 sm:py-6 text-indigo-200 text-xs sm:text-sm md:text-base"
      >
        © {new Date().getFullYear()} Expense Tracker. All rights reserved.
      </motion.footer>
    </div>
  );
}