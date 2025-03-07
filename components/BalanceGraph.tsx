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
  ChartOptions,
  ChartData
} from 'chart.js';
import { Expense } from '@/types/expense';
import { Income } from '@/types/income';
import { formatIndianCurrency } from '@/utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface BalanceGraphProps {
  expenses: Expense[];
  income: Income[];
  useRupees?: boolean;
}

const BalanceGraph: React.FC<BalanceGraphProps> = ({ 
  expenses = [], 
  income = [], 
  useRupees = true 
}) => {
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

    // Get expense data for each date
    const expenseData = allDates.map((date) =>
      safeExpenses
        .filter((e) => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0)
    );

    // Get income data for each date
    const incomeData = allDates.map((date) =>
      safeIncome
        .filter((i) => i.date === date)
        .reduce((sum, i) => sum + i.amount, 0)
    );

    // Format dates for better display (DD/MM format for India)
    const formattedDates = allDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}`;
    });

    // Create chart data
    const data: ChartData<'line'> = {
      labels: formattedDates,
      datasets: [
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Income',
          data: incomeData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: false,
        },
        {
          label: 'Balance',
          data: balanceData,
          borderColor: 'rgb(59, 130, 246)',
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
        },
      ],
    };

    // Chart options
    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        title: { 
          display: false 
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            weight: 'bold',
            size: 14
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                if (useRupees) {
                  try {
                    label += formatIndianCurrency(context.parsed.y);
                  } catch (e) {
                    // Fallback if formatter is not available
                    label += '₹' + context.parsed.y.toFixed(2);
                  }
                } else {
                  label += '$' + context.parsed.y.toFixed(2);
                }
              }
              return label;
            }
          }
        }
      },
      scales: { 
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 10
            }
          }
        },
        y: { 
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              if (typeof value !== 'number') return value;
              return useRupees 
                ? '₹' + value.toLocaleString('en-IN')
                : '$' + value;
            },
            font: {
              size: 10
            }
          }
        } 
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    };

    return { chartData: data, options };
  }, [expenses, income, useRupees]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default BalanceGraph;