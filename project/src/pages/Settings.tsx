import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../services/auth';
import { Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StockTransaction {
  id: string;
  stock_symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const downloadTransactionHistory = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Stock Transaction History', 14, 15);
      
      // Metadata
      pdf.setFontSize(12);
      pdf.text(`User: ${user.email}`, 14, 25);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

      // Prepare table data
      const tableData = (transactions || []).map((t: StockTransaction) => [
        new Date(t.created_at).toLocaleString(),
        t.stock_symbol,
        t.type,
        t.quantity.toString(),
        `₹${t.price.toFixed(2)}`,
        `₹${t.total.toFixed(2)}`
      ]);

      // Add table
      autoTable(pdf, {
        head: [['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total']],
        body: tableData,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 }
        }
      });

      // Summary statistics
      const totalBuy = transactions?.reduce((sum, t) => 
        t.type === 'BUY' ? sum + t.total : sum, 0
      ) || 0;
      
      const totalSell = transactions?.reduce((sum, t) => 
        t.type === 'SELL' ? sum + t.total : sum, 0
      ) || 0;

      const finalY = (pdf as any).lastAutoTable.finalY || 150;
      
      pdf.text('Summary:', 14, finalY + 10);
      pdf.text(`Total Buy: ₹${totalBuy.toFixed(2)}`, 14, finalY + 20);
      pdf.text(`Total Sell: ₹${totalSell.toFixed(2)}`, 14, finalY + 30);
      pdf.text(`Net Investment: ₹${(totalBuy - totalSell).toFixed(2)}`, 14, finalY + 40);

      pdf.save('stock-transactions.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Account Settings</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          <p className="mt-1 text-sm text-gray-500">
            Download a complete record of your stock transactions
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <button
            onClick={downloadTransactionHistory}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Generating PDF...' : 'Download Transaction History'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}