import { useMemo } from 'react';

import useExpenseStore from '@/hooks/useExpense';
import useGroup from '@/hooks/useGroup';
import useSettlementStore from '@/hooks/useSettlement';
import { getIPaid, getIReceived, getMyCost, getOwned } from '@/lib/utils';

const Summary = () => {
  const currentParticipant = useGroup((state) => state.currentParticipant);
  const expenses = useExpenseStore((state) => state.expenses);
  const settlements = useSettlementStore((state) => state.settlements);

  const { cost, owned, paid, received } = useMemo(() => {
    const cost = getMyCost(expenses, currentParticipant).toFixed(2);
    const paid = getIPaid(expenses, currentParticipant).toFixed(2);
    const received = getIReceived(
      expenses,
      settlements,
      currentParticipant
    ).toFixed(2);
    const owned = getOwned(expenses, settlements, currentParticipant).toFixed(
      2
    );

    return { cost, paid, received, owned };
  }, [currentParticipant, expenses, settlements]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Your Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
          <div className="text-xl font-bold text-orange-600 mb-1">${cost}</div>
          <div className="text-xs font-medium text-orange-700">My Cost</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-xl font-bold text-blue-600 mb-1">${paid}</div>
          <div className="text-xs font-medium text-blue-700">I Paid</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
          <div className="text-xl font-bold text-purple-600 mb-1">
            ${received}
          </div>
          <div className="text-xs font-medium text-purple-700">I Received</div>
        </div>

        <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="text-xl font-bold text-emerald-600 mb-1">
            ${owned}
          </div>
          <div className="text-xs font-medium text-emerald-700">I'm Owed</div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
