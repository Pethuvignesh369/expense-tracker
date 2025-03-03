// components/IncomeTable.tsx
'use client';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Income } from '@/types/income';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type IncomeTableProps = {
  income: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
};

export default function IncomeTable({ income, onEdit, onDelete }: IncomeTableProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Recent Income</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {income.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                    No income records found. Add your first income!
                  </td>
                </tr>
              ) : (
                income.map((item) => (
                  <motion.tr 
                    key={item.id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="hover:text-blue-600"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}