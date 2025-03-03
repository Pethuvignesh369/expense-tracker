'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type BalanceGraphProps = {
  expenses: Expense[];
  income: Income[];
};

const BalanceGraph: React.FC<BalanceGraphProps> = ({ expenses, income }) => {
  const safeExpenses = expenses || [];
  const safeIncome = income || [];

  const allDates = [
    ...safeExpenses.map((e) => e.date),
    ...safeIncome.map((i) => i.date),
  ]
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort();

  const balanceData = allDates.map((date) => {
    const totalIncomeUntilDate = safeIncome
      .filter((i) => i.date <= date)
      .reduce((sum, i) => sum + i.amount, 0);
    const totalExpensesUntilDate = safeExpenses
      .filter((e) => e.date <= date)
      .reduce((sum, e) => sum + e.amount, 0);
    return totalIncomeUntilDate - totalExpensesUntilDate;
  });

  const data = {
    labels: allDates,
    datasets: [
      {
        label: 'Expenses',
        data: allDates.map((date) =>
          safeExpenses
            .filter((e) => e.date === date)
            .reduce((sum, e) => sum + e.amount, 0)
        ),
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        fill: false,
      },
      {
        label: 'Income',
        data: allDates.map((date) =>
          safeIncome
            .filter((i) => i.date === date)
            .reduce((sum, i) => sum + i.amount, 0)
        ),
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        fill: false,
      },
      {
        label: 'Balance',
        data: balanceData,
        borderColor: 'blue',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Income, Expenses, and Balance Over Time' },
    },
    scales: { y: { beginAtZero: true } },
  };

  return <Line data={data} options={options} />;
};

export default BalanceGraph;