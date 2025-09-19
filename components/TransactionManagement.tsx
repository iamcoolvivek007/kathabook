import React, { useState, useMemo } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Transaction } from '../types';
import { TransactionType, PaymentMode, PaymentStatus, TransactionPurpose } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from './Modal';
import PageHeader from './PageHeader';

// Transaction Form
const TransactionForm: React.FC<{
  logisticsState: LogisticsState;
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  onClose: () => void;
  transactionToEdit?: Transaction;
}> = ({ logisticsState, onSave, onClose, transactionToEdit }) => {
  const [formData, setFormData] = useState({
    tripId: transactionToEdit?.tripId || '',
    amount: transactionToEdit?.amount || 0,
    date: transactionToEdit?.date ? transactionToEdit.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: transactionToEdit?.type || TransactionType.Credit,
    purpose: transactionToEdit?.purpose || TransactionPurpose.ClientFreight,
    paymentMode: transactionToEdit?.paymentMode || PaymentMode.Cash,
    status: transactionToEdit?.status || PaymentStatus.Pending,
    notes: transactionToEdit?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
        const newType = value as TransactionType;
        const newPurpose = newType === TransactionType.Credit ? TransactionPurpose.ClientFreight : TransactionPurpose.TruckFreight;
        setFormData(prev => ({ ...prev, type: newType, purpose: newPurpose }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date),
    };
    if (transactionToEdit) {
      onSave({ ...transactionToEdit, ...transactionData });
    } else {
      onSave(transactionData);
    }
    onClose();
  };
  
  const availablePurposes = formData.type === TransactionType.Credit 
    ? [TransactionPurpose.ClientFreight] 
    : [TransactionPurpose.TruckFreight, TransactionPurpose.DriverCommission];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium">Trip Association</label><select name="tripId" value={formData.tripId} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md"><option value="">Select a Trip</option>{logisticsState.trips.map(trip => <option key={trip.id} value={trip.id}>Trip #{trip.id.slice(-4)} (Load #{trip.loadId.slice(-4)})</option>)}</select></div>
        <div><label className="block text-sm font-medium">Amount</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium">Type</label><select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">{Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Purpose</label><select name="purpose" value={formData.purpose} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">{availablePurposes.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        <div><label className="block text-sm font-medium">Payment Mode</label><select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">{Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium">Status</label><select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">{Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border rounded-md"></textarea></div>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Transaction</button>
      </div>
    </form>
  );
};

const TransactionManagement: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = logisticsState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const handleOpenModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setTransactionToEdit(undefined);
    setIsModalOpen(false);
  };

  const handleSave = (data: Omit<Transaction, 'id'> | Transaction) => {
    if ('id' in data) updateTransaction(data); else addTransaction(data);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .filter(txn => {
        const searchMatch = searchTerm === '' || 
          txn.tripId.toLowerCase().includes(searchTerm.toLowerCase()) || 
          txn.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const typeMatch = typeFilter === 'all' || txn.type === typeFilter;
        
        return searchMatch && typeMatch;
      });
  }, [transactions, searchTerm, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Management"
        actionButton={
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white rounded-md flex items-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Log Payment
            </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="md:col-span-2">
                <input type="text" placeholder="Search by Trip ID or notes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | TransactionType)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="all">All Types</option>
                    <option value={TransactionType.Credit}>Credit</option>
                    <option value={TransactionType.Debit}>Debit</option>
                </select>
            </div>
        </div>
      </PageHeader>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Trip ID</th><th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Amount</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th><th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(txn => (
                <tr key={txn.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(txn.date)}</td>
                  <td className="px-4 py-3 font-medium">#{txn.tripId.slice(-4)}</td>
                  <td className={`px-4 py-3 font-semibold ${txn.type === TransactionType.Credit ? 'text-success' : 'text-danger'}`}>{txn.purpose}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(txn.amount)}</td>
                  <td className="px-4 py-3">{txn.paymentMode}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${txn.status === PaymentStatus.Completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{txn.status}</span></td>
                  <td className="px-4 py-3 text-xs">{txn.notes}</td>
                  <td className="px-4 py-3 flex space-x-2"><button onClick={() => handleOpenModal(txn)} className="text-primary hover:underline">Edit</button><button onClick={() => deleteTransaction(txn.id)} className="text-danger hover:underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={transactionToEdit ? 'Edit Transaction' : 'Log New Transaction'}>
        <TransactionForm logisticsState={logisticsState} onSave={handleSave} onClose={handleCloseModal} transactionToEdit={transactionToEdit} />
      </Modal>
    </div>
  );
};

export default TransactionManagement;