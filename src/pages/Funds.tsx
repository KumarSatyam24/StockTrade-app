import React, { useState, useEffect } from 'react';
import { Download, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FundTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  created_at: string;
}

interface UserFunds {
  balance: number;
}

export function Funds() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');

  useEffect(() => {
    if (!user) return;
    fetchBalance();
    fetchTransactions();
  }, [user]);

  async function fetchBalance() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_funds')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      showNotification('error', 'Failed to fetch balance');
    }
  }

  async function fetchTransactions() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('fund_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }

  async function handleTransaction() {
    if (!user) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }

    if (transactionType === 'WITHDRAWAL' && numAmount > balance) {
      showNotification('error', 'Insufficient funds');
      return;
    }

    try {
      const { error } = await supabase
        .from('fund_transactions')
        .insert({
          user_id: user.id,
          type: transactionType,
          amount: numAmount,
          status: 'COMPLETED'
        });

      if (error) throw error;

      showNotification('success', `${transactionType.toLowerCase()} successful`);
      setAmount('');
      await fetchBalance();
      await fetchTransactions();
    } catch (error) {
      console.error('Transaction error:', error);
      showNotification('error', 'Transaction failed');
    }
  }

  function downloadPDF() {
    const pdf = new jsPDF();
    
    pdf.setFontSize(20);
    pdf.text('Transaction History', 14, 15);
    pdf.setFontSize(12);
    pdf.text(`Balance: ₹${balance.toFixed(2)}`, 14, 25);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.type,
      `₹${t.amount.toFixed(2)}`,
      t.status
    ]);

    autoTable(pdf, {
      head: [['Date', 'Type', 'Amount', 'Status']],
      body: tableData,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const totalBuy = transactions?.reduce((sum, t) => 
      t.type === 'DEPOSIT' ? sum + t.amount : sum, 0
    ) || 0;
    
    const totalSell = transactions?.reduce((sum, t) => 
      t.type === 'WITHDRAWAL' ? sum + t.amount : sum, 0
    ) || 0;

    const finalY = (pdf as any).lastAutoTable.finalY || 150;
    
    pdf.text('Summary:', 14, finalY + 10);
    pdf.text(`Total Deposits: ₹${totalBuy.toFixed(2)}`, 14, finalY + 20);
    pdf.text(`Total Withdrawals: ₹${totalSell.toFixed(2)}`, 14, finalY + 30);
    pdf.text(`Net Balance: ₹${(totalBuy - totalSell).toFixed(2)}`, 14, finalY + 40);

    pdf.save('transaction-history.pdf');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Funds Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account balance and view transaction history
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-3xl font-bold text-gray-900">₹{balance.toFixed(2)}</p>
          </div>
          <DollarSign className="h-12 w-12 text-blue-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add/Withdraw Funds</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transaction Type
            </label>
            <div className="mt-1 flex space-x-4">
              <button
                onClick={() => setTransactionType('DEPOSIT')}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
                  transactionType === 'DEPOSIT'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowUpCircle className="h-5 w-5" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => setTransactionType('WITHDRAWAL')}
                className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
                  transactionType === 'WITHDRAWAL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowDownCircle className="h-5 w-5" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <button
            onClick={handleTransaction}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {transactionType === 'DEPOSIT' ? 'Add Funds' : 'Withdraw Funds'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'DEPOSIT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ₹{transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}