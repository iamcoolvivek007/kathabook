import React, { useState, useEffect } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Transaction } from '../types';
import { TransactionType, PaymentMode, PaymentStatus, TransactionPurpose } from '../types';
import { formatCurrency } from '../utils/helpers';

interface TransactionFormProps {
  logisticsState: LogisticsState;
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  onClose: () => void;
  transactionToEdit?: Transaction;
  defaultTripId?: string;
  defaultPurpose?: TransactionPurpose;
}

// Transaction Form
const TransactionForm: React.FC<TransactionFormProps> = ({ logisticsState, onSave, onClose, transactionToEdit, defaultTripId, defaultPurpose }) => {
  const getInitialPurpose = () => {
    return transactionToEdit?.purpose || defaultPurpose || TransactionPurpose.ClientFreight;
  };

  const getInitialType = (purpose: TransactionPurpose) => {
    if (transactionToEdit && transactionToEdit.purpose === purpose) {
      return transactionToEdit.type;
    }
    return purpose === TransactionPurpose.ClientFreight 
      ? TransactionType.Credit 
      : TransactionType.Debit;
  };

  const initialPurpose = getInitialPurpose();

  const [formData, setFormData] = useState({
    tripId: transactionToEdit?.tripId || defaultTripId || '',
    amount: transactionToEdit?.amount || 0,
    date: transactionToEdit?.date ? transactionToEdit.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: getInitialType(initialPurpose),
    purpose: initialPurpose,
    paymentMode: transactionToEdit?.paymentMode || PaymentMode.Cash,
    status: transactionToEdit?.status || PaymentStatus.Pending,
    notes: transactionToEdit?.notes || '',
  });

  const trip = logisticsState.trips.find(t => t.id === formData.tripId);
  const load = logisticsState.loads.find(l => l.id === trip?.loadId);
  const client = logisticsState.clients.find(c => c.id === load?.clientId);

  const getRemainingAmount = () => {
    if (!trip) return 0;
    // When editing, exclude the current transaction's amount from the 'paid' total.
    // We consider both 'Pending' and 'Completed' transactions as paid to get an accurate remaining balance.
    const paid = logisticsState.transactions
        .filter(t => t.tripId === trip.id && t.purpose === formData.purpose && t.id !== transactionToEdit?.id)
        .reduce((sum, t) => sum + t.amount, 0);

    switch(formData.purpose) {
        case TransactionPurpose.ClientFreight:
            return (load?.clientFreight || 0) - paid;
        case TransactionPurpose.TruckFreight:
            return trip.truckFreight - paid;
        case TransactionPurpose.DriverCommission:
            return trip.driverCommission - paid;
        default:
            return 0;
    }
  };
  
  // Effect to pre-fill amount for new transactions when trip/purpose changes
  useEffect(() => {
    // We only auto-fill for new transactions to avoid overwriting user edits on existing ones.
    if (!transactionToEdit && formData.tripId && formData.purpose) {
        const remaining = getRemainingAmount();
        setFormData(prev => ({ ...prev, amount: remaining > 0 ? remaining : 0 }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.tripId, formData.purpose, transactionToEdit]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'purpose') {
        const newPurpose = value as TransactionPurpose;
        const newType = (newPurpose === TransactionPurpose.ClientFreight) 
            ? TransactionType.Credit 
            : TransactionType.Debit;
        // Reset amount to 0; the useEffect will then calculate and set the correct remaining amount.
        setFormData(prev => ({ ...prev, type: newType, purpose: newPurpose, amount: 0 }));
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
  
  const availablePurposes = Object.values(TransactionPurpose);

  const remainingAmount = getRemainingAmount();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Trip Association</label>
            <select name="tripId" value={formData.tripId} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary" disabled={!!defaultTripId}>
                <option value="">Select a Trip</option>{logisticsState.trips.map(trip => <option key={trip.id} value={trip.id}>Trip #{trip.id.slice(-4)} (Load #{trip.loadId.slice(-4)})</option>)}
            </select>
            {client && (
                <p className="mt-2 text-sm text-gray-600">
                    Client: <span className="font-semibold">{client.name}</span>
                </p>
            )}
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <select name="purpose" value={formData.purpose} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary">
                {availablePurposes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>
        <div>
            <div className="flex justify-between items-baseline">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                {trip && <span className="text-xs text-gray-500">Remaining: {formatCurrency(remainingAmount)}</span>}
            </div>
            <div className="mt-1 flex items-center space-x-2">
                <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary"
                />
                {trip && (
                    <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, amount: remainingAmount > 0 ? remainingAmount : 0 }))}
                        className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 whitespace-nowrap"
                        aria-label="Fill remaining amount"
                    >
                        Fill Remaining
                    </button>
                )}
            </div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary" /></div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary">
            {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary">
            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary"></textarea></div>
        <input type="hidden" name="type" value={formData.type} />
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">Save Transaction</button>
      </div>
    </form>
  );
};

export default TransactionForm;