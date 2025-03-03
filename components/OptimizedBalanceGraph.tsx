// components/OptimizedBalanceGraph.tsx
'use client';
import { useMemo } from 'react';
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

const OptimizedBalanceGraph: React.FC<BalanceGraphProps> = ({ expenses, income }) => {
  // Memoize the graph data calculation to prevent recalculation on every render
  const { chartData, options } = useMemo(() => {
    // Ensure we have valid data
    const safeExpenses = expenses || [];
    const safeIncome = income || [];

    // Collect all unique dates and sort them
    const allDates = [
      ...safeExpenses.map((e) => e.date),
      ...safeIncome.map((i) => i.date),
    ]
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort();

    // Calculate cumulative balances for each date
    const balanceData = allDates.map((date) => {
      const totalIncomeUntilDate = safeIncome
        .filter((i) => i.date <= date)
        .reduce((sum, i) => sum + i.amount, 0);
        
      const totalExpensesUntilDate = safeExpenses
        .filter((e) => e.date <= date)
        .reduce((sum, e) => sum + e.amount, 0);
        
      return totalIncomeUntilDate - totalExpensesUntilDate;
    });

    // Get income and expense data for each date
    const incomeData = allDates.map((date) =>
      safeIncome
        .filter((i) => i.date === date)
        .reduce((sum, i) => sum + i.amount, 0)
    );

    const expenseData = allDates.map((date) =>
      safeExpenses
        .filter((e) => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0)
    );

    // Format dates for better display
    const formattedDates = allDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${month}/${day}`;
    });

    // Create chart data
    const data = {
      labels: formattedDates,
      datasets: [
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
        },
        {
          label: 'Income',
          data: incomeData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: false,
        },
        {
          label: 'Balance',
          data: balanceData,
          borderColor: 'rgb(59, 130, 246)',
          borderDash: [5, 5],
          fill: false,
        },
      ],
    };

    // Chart options
    const options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: { 
          display: true, 
          text: 'Income, Expenses, and Balance Over Time',
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: { 
        y: { 
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return '$' + value;
            }
          }
        } 
      },
      maintainAspectRatio: false,
    };

    return { chartData: data, options };
  }, [expenses, income]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default OptimizedBalanceGraph;