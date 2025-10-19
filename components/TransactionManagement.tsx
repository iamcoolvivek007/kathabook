import React, { useState, useMemo, useCallback } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Transaction } from '../types';
import { TransactionType, PaymentStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from './Modal';
import PageHeader from './PageHeader';
import TransactionForm from './TransactionForm';

const TransactionManagement: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, trips, loads, clients } = logisticsState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const handleOpenModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setTransactionToEdit(undefined);
    setIsModalOpen(false);
  };

  const handleSave = (data: Omit<Transaction, 'id'> | Transaction) => {
    if ('id' in data) {
      updateTransaction(data);
    } else {
      addTransaction(data);
    }
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete);
    }
    setTransactionToDelete(null);
  };
  
  const getClientNameForTrip = useCallback((tripId: string): string => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return 'N/A';
    const load = loads.find(l => l.id === trip.loadId);
    if (!load) return 'N/A';
    const client = clients.find(c => c.id === load.clientId);
    return client?.name || 'Unknown Client';
  }, [clients, loads, trips]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .filter(txn => {
        const clientName = getClientNameForTrip(txn.tripId);
        const searchMatch = searchTerm === '' || 
          txn.tripId.toLowerCase().includes(searchTerm.toLowerCase()) || 
          clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const typeMatch = typeFilter === 'all' || txn.type === typeFilter;
        
        return searchMatch && typeMatch;
      });
  }, [transactions, searchTerm, typeFilter, getClientNameForTrip]);
  
  const { totalCredit, totalDebit, netFlow } = useMemo(() => {
    const totals = filteredTransactions.reduce((acc, txn) => {
      if (txn.type === TransactionType.Credit) {
        acc.credit += txn.amount;
      } else {
        acc.debit += txn.amount;
      }
      return acc;
    }, { credit: 0, debit: 0 });

    return {
      totalCredit: totals.credit,
      totalDebit: totals.debit,
      netFlow: totals.credit - totals.debit,
    };
  }, [filteredTransactions]);

  const getStatusColor = (status: PaymentStatus) => {
    return status === PaymentStatus.Completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Management"
        actionButton={
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white rounded-md flex items-center shadow-sm hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Log Payment
            </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="md:col-span-2">
                <input type="text" placeholder="Search by Trip ID, client, or notes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | TransactionType)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary">
                    <option value="all">All Types</option>
                    <option value={TransactionType.Credit}>Credit</option>
                    <option value={TransactionType.Debit}>Debit</option>
                </select>
            </div>
        </div>
      </PageHeader>
      
      {/* Mobile View */}
      <div className="space-y-4 md:hidden">
        {filteredTransactions.map(txn => {
            const clientName = getClientNameForTrip(txn.tripId);
            return (
                <div key={txn.id} className="bg-white p-4 rounded-lg shadow-md border">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`font-bold text-lg ${txn.type === TransactionType.Credit ? 'text-success' : 'text-danger'}`}>{formatCurrency(txn.amount)}</p>
                            <p className="text-sm font-semibold">{txn.purpose}</p>
                            <p className="text-xs text-medium">Trip #{txn.tripId.slice(-4)} ({clientName})</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(txn.status)}`}>{txn.status}</span>
                    </div>
                    <div className="mt-4 text-sm space-y-1">
                        <p><span className="font-semibold">Date:</span> {formatDate(txn.date)}</p>
                        <p><span className="font-semibold">Mode:</span> {txn.paymentMode}</p>
                        {txn.notes && <p className="text-xs italic text-gray-500 pt-1">"{txn.notes}"</p>}
                    </div>
                    <div className="mt-4 pt-2 border-t flex justify-end space-x-4 text-sm font-medium">
                        <button onClick={() => handleOpenModal(txn)} className="text-primary hover:underline">Edit</button>
                        <button onClick={() => setTransactionToDelete(txn.id)} className="text-danger hover:underline">Delete</button>
                    </div>
                </div>
            )
        })}
        {filteredTransactions.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md border mt-6">
            <h3 className="font-bold text-lg mb-2 text-dark">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-medium">Total Credits:</span>
                <span className="font-bold text-success text-base">{formatCurrency(totalCredit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-medium">Total Debits:</span>
                <span className="font-bold text-danger text-base">{formatCurrency(totalDebit)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="font-bold text-dark text-base">Net Flow:</span>
                <span className={`font-bold text-lg ${netFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(netFlow)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Trip ID</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => {
                const clientName = getClientNameForTrip(txn.tripId);
                return (
                  <tr key={txn.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(txn.date)}</td>
                    <td className="px-4 py-3 font-medium">{clientName}</td>
                    <td className="px-4 py-3 font-medium">#{txn.tripId.slice(-4)}</td>
                    <td className={`px-4 py-3 font-semibold ${txn.type === TransactionType.Credit ? 'text-success' : 'text-danger'}`}>{txn.purpose}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(txn.amount)}</td>
                    <td className="px-4 py-3">{txn.paymentMode}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(txn.status)}`}>{txn.status}</span></td>
                    <td className="px-4 py-3 text-xs">{txn.notes}</td>
                    <td className="px-4 py-3 flex space-x-2"><button onClick={() => handleOpenModal(txn)} className="text-primary hover:underline">Edit</button><button onClick={() => setTransactionToDelete(txn.id)} className="text-danger hover:underline">Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot className="border-t-2 border-gray-300">
                <tr className="bg-gray-50 font-semibold text-dark">
                  <td className="px-4 py-3 text-right" colSpan={4}>
                    Totals
                  </td>
                  <td className="px-4 py-3" colSpan={1}>
                      <div className="flex justify-between"><span>Credit:</span> <span className="text-success">{formatCurrency(totalCredit)}</span></div>
                      <div className="flex justify-between"><span>Debit:</span> <span className="text-danger">{formatCurrency(totalDebit)}</span></div>
                      <div className="flex justify-between border-t mt-1 pt-1"><span>Net:</span> <span className={`${netFlow >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(netFlow)}</span></div>
                  </td>
                  <td className="px-4 py-3" colSpan={4}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={transactionToEdit ? 'Edit Transaction' : 'Log New Transaction'}>
        <TransactionForm logisticsState={logisticsState} onSave={handleSave} onClose={handleCloseModal} transactionToEdit={transactionToEdit} />
      </Modal>

      <Modal isOpen={!!transactionToDelete} onClose={() => setTransactionToDelete(null)} title="Confirm Deletion">
        <div className="space-y-6">
          <p className="text-medium">Are you sure you want to permanently delete this transaction? This action cannot be undone.</p>
          <div className="flex justify-end pt-2 space-x-2">
            <button
              type="button"
              onClick={() => setTransactionToDelete(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-danger text-white rounded-md hover:bg-danger/90"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionManagement;