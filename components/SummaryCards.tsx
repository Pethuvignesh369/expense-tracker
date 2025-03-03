// components/SummaryCards.tsx
'use client';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCreditCard, FiPieChart } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SummaryCardsProps = {
  data: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyBalance: number;
  };
};

export default function SummaryCards({ data }: SummaryCardsProps) {
  const { monthlyIncome, monthlyExpenses, monthlyBalance } = data;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              <span className="text-green-600">Monthly Income</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${monthlyIncome.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Current Month</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FiCreditCard className="text-red-600" />
              <span className="text-red-600">Monthly Expenses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${monthlyExpenses.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Current Month</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FiPieChart className={monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"} />
              <span className={monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"}>
                Net Balance
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${monthlyBalance.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Current Month</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}