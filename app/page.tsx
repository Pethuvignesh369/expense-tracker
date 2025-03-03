'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiDollarSign, FiPieChart, FiCreditCard } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleSignUp = () => router.push('/signup');
  const handleSignIn = () => router.push('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8">
      {/* Main Content */}
      <div className="flex flex-col items-center flex-1 w-full max-w-5xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div
            className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-full shadow-lg"
            >
              <FiPieChart className="text-white text-2xl sm:text-3xl" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Expense Tracker
            </h1>
          </motion.div>

          {/* Tagline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-700 px-2 sm:px-0 max-w-2xl mx-auto">
            Take control of your finances with ease. Track income, expenses, and savings in one place.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mb-8 sm:mb-12"
        >
          <Button
            onClick={handleSignUp}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Get Started <FiArrowRight className={cn('transition-transform', isHovered ? 'translate-x-1' : '')} />
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
          >
            Sign In <FiArrowRight />
          </Button>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center text-center"
          >
            <FiDollarSign className="text-blue-600 text-2xl sm:text-3xl mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Track Income</h3>
            <p className="text-gray-600 text-sm sm:text-base">Easily log your earnings and see your cash flow.</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center text-center"
          >
            <FiCreditCard className="text-blue-600 text-2xl sm:text-3xl mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Monitor Expenses</h3>
            <p className="text-gray-600 text-sm sm:text-base">Categorize and manage your spending effortlessly.</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center text-center sm:col-span-2 md:col-span-1"
          >
            <FiPieChart className="text-blue-600 text-2xl sm:text-3xl mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Visualize Trends</h3>
            <p className="text-gray-600 text-sm sm:text-base">Gain insights with intuitive charts and reports.</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6 sm:mt-12 text-gray-500 text-xs sm:text-sm w-full text-center py-4"
      >
        © {new Date().getFullYear()} Expense Tracker. All rights reserved.
      </motion.footer>
    </div>
  );
}