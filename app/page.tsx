'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiDollarSign, FiPieChart, FiCreditCard } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleSignUp = () => router.push('/signup');
  const handleSignIn = () => router.push('/login');

  const cn = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl w-full"
      >
        {/* Logo and Title */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-6"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg"
          >
            <FiPieChart className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Expense Tracker
          </h1>
        </motion.div>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-gray-700 mb-8">
          Take control of your finances with ease. Track income, expenses, and savings in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={handleSignUp}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Get Started <FiArrowRight className={cn('transition-transform', isHovered ? 'translate-x-1' : '')} />
          </Button>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            Sign In <FiArrowRight />
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <FiDollarSign className="text-blue-600 text-3xl mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Income</h3>
            <p className="text-gray-600">Easily log your earnings and see your cash flow.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <FiCreditCard className="text-blue-600 text-3xl mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Monitor Expenses</h3>
            <p className="text-gray-600">Categorize and manage your spending effortlessly.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <FiPieChart className="text-blue-600 text-3xl mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Visualize Trends</h3>
            <p className="text-gray-600">Gain insights with intuitive charts and reports.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-12 text-gray-500 text-sm"
      >
        © {new Date().getFullYear()} Expense Tracker. All rights reserved.
      </motion.footer>
    </div>
  );
}