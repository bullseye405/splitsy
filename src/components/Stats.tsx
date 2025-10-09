import useExpenseStore from '@/hooks/useExpense';
import { useShallow } from 'zustand/react/shallow';

const Stats = () => {
  const { expenses } = useExpenseStore(
    useShallow((state) => ({
      expenses: state.expenses,
    }))
  );

  const totalExpenses = expenses
    .filter((e) => e.expense_type === 'expense' || !e.expense_type)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = expenses
    .filter((e) => e.expense_type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
        <div className="text-3xl font-bold text-red-600 mb-1">
          ${totalExpenses.toFixed(2)}
        </div>
        <div className="text-sm font-medium text-red-700">Total Expenses</div>
      </div>

      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
        <div className="text-3xl font-bold text-green-600 mb-1">
          ${totalIncome.toFixed(2)}
        </div>
        <div className="text-sm font-medium text-green-700">Total Income</div>
      </div>
    </div>
  );
};

export default Stats;
