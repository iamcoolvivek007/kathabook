
import React, { useState, useEffect } from 'react';
import type { Trip, Load, Truck, Client, Transaction, Document } from '../types';
import { TripStatus, TransactionType, PaymentMode, PaymentStatus, TransactionPurpose } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';
import Modal from './Modal';

interface AddTransactionInlineFormProps {
  tripId: string;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  initialData: Partial<Omit<Transaction, 'id'>>;
}

// Inline form for adding a transaction
const AddTransactionInlineForm: React.FC<AddTransactionInlineFormProps> = ({ tripId, onSave, onCancel, initialData }) => {
  const getInitialState = () => ({
    amount: initialData.amount || 0,
    date: initialData.date ? (initialData.date as Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    type: initialData.type || TransactionType.Credit,
    purpose: initialData.purpose || TransactionPurpose.ClientFreight,
    paymentMode: initialData.paymentMode || PaymentMode.UPI,
    status: initialData.status || PaymentStatus.Completed,
    notes: initialData.notes || '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    setFormData(getInitialState());
  }, [initialData]);

  const getTitle = () => {
    switch(formData.purpose) {
        case TransactionPurpose.ClientFreight: return 'Log Client Payment';
        case TransactionPurpose.TruckFreight: return 'Log Truck Payment';
        case TransactionPurpose.DriverCommission: return 'Log Commission Payment';
        default: return 'Log Payment';
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      tripId,
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mt-4 border space-y-4">
      <h5 className="text-md font-semibold text-gray-800">{getTitle()}</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="block text-xs font-medium text-gray-600">Amount</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md text-sm"/></div>
        <div><label className="block text-xs font-medium text-gray-600">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md text-sm"/></div>
        <div><label className="block text-xs font-medium text-gray-600">Payment Mode</label><select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md text-sm">{Object.values(PaymentMode).map(m=><option key={m} value={m}>{m}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-600">Notes (e.g., "Advance", "Balance")</label><input type="text" name="notes" value={formData.notes} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md text-sm"/></div>
         <div><label className="block text-xs font-medium text-gray-600">Status</label><select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md text-sm">{Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Cancel</button>
        <button type="submit" className="px-3 py-1 bg-primary text-white rounded-md hover:brightness-95 text-sm">Save</button>
      </div>
    </form>
  );
};


interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  load: Load;
  truck: Truck;
  client: Client;
  transactions: Transaction[];
  documents: Document[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => void;
}

// Helper components & Icons
const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode; className?: string; }> = ({ label, value, icon, className }) => (
  <div className={`flex items-start ${className}`}>
    {icon && <div className="text-primary mr-3 mt-1 flex-shrink-0 w-5 h-5">{icon}</div>}
    <div className="min-w-0">
      <p className="text-sm text-gray-500 truncate">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const StatusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zm12 0a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 00-1-1h-2zM10 5h2v6h-2V5z" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


const TripDetailModal: React.FC<TripDetailModalProps> = ({ isOpen, onClose, trip, load, truck, client, transactions, documents, addTransaction, addDocument }) => {
  const [transactionFormInitialData, setTransactionFormInitialData] = useState<Partial<Omit<Transaction, 'id'>> | null>(null);
  
  if (!trip || !load || !truck || !client) return null;

  const clientPaid = transactions
    .filter(t => t.purpose === TransactionPurpose.ClientFreight && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0);
  const clientDue = load.clientFreight - clientPaid;

  const truckPaid = transactions
    .filter(t => t.purpose === TransactionPurpose.TruckFreight && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0);
  const truckDue = trip.truckFreight - truckPaid;

  const commissionPaid = transactions
    .filter(t => t.purpose === TransactionPurpose.DriverCommission && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0);
  const commissionDue = trip.driverCommission - commissionPaid;
  
  const profit = clientPaid - truckPaid - commissionPaid;

  const handleSaveTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    setTransactionFormInitialData(null);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const fileUrl = loadEvent.target?.result as string;
            addDocument({
                tripId: trip.id,
                fileName: file.name,
                fileType: file.type,
                fileUrl,
            });
        };
        reader.readAsDataURL(file);
    }
    // Reset file input to allow uploading the same file again
    e.target.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Trip Details: #${trip.id.slice(-4)}`} maxWidth="max-w-5xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Client" value={client.name} icon={<UserIcon />} />
          <DetailItem label="Route" value={`${load.loadingLocation} → ${load.unloadingLocation}`} icon={<LocationIcon />} className="sm:col-span-2 lg:col-span-1" />
          <DetailItem label="Current Status" value={<span className={`font-bold ${trip.status === TripStatus.Completed ? 'text-success' : 'text-warning'}`}>{trip.status}</span>} icon={<StatusIcon />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-lg mb-3">Financial Breakdown</h4>
              <div className="space-y-3 text-sm">
                 {/* Client */}
                <div className="p-2 bg-green-50/50 rounded-md">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Client Freight (Total)</span><span className="font-medium text-gray-900">{formatCurrency(load.clientFreight)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Client Paid</span><span className="font-medium text-success">{formatCurrency(clientPaid)}</span></div>
                    <div className="flex justify-between items-center border-t mt-1 pt-1"><span className="font-semibold text-gray-800">Client Due</span><span className={`font-bold ${clientDue > 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(clientDue)}</span></div>
                </div>
                 {/* Truck */}
                <div className="p-2 bg-red-50/50 rounded-md">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Truck Freight (Total)</span><span className="font-medium text-gray-900">{formatCurrency(trip.truckFreight)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Truck Paid</span><span className="font-medium text-danger">{formatCurrency(truckPaid)}</span></div>
                    <div className="flex justify-between items-center border-t mt-1 pt-1"><span className="font-semibold text-gray-800">Truck Due</span><span className={`font-bold ${truckDue > 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(truckDue)}</span></div>
                </div>
                 {/* Commission */}
                <div className="p-2 bg-yellow-50/50 rounded-md">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Driver Commission</span><span className="font-medium text-gray-900">{formatCurrency(trip.driverCommission)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Commission Paid</span><span className="font-medium text-danger">{formatCurrency(commissionPaid)}</span></div>
                    <div className="flex justify-between items-center border-t mt-1 pt-1"><span className="font-semibold text-gray-800">Commission Due</span><span className={`font-bold ${commissionDue > 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(commissionDue)}</span></div>
                </div>
                <div className="flex justify-between items-center text-base border-t pt-2 mt-2"><span className="font-bold">Net Profit (from completed txns)</span><span className={`font-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(profit)}</span></div>
              </div>
            </div>

             {/* Transactions */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg">Transaction History</h4>
                {!transactionFormInitialData && (
                   <div className="space-x-2 flex flex-wrap gap-2 justify-end">
                     <button
                        onClick={() => setTransactionFormInitialData({ type: TransactionType.Credit, purpose: TransactionPurpose.ClientFreight, amount: clientDue > 0 ? clientDue : undefined, notes: clientPaid > 0 ? 'Balance Payment' : 'Advance Payment' })}
                        disabled={clientDue <= 0}
                        className="px-3 py-1 bg-success text-white text-xs font-semibold rounded-md hover:brightness-95 filter disabled:bg-gray-400 disabled:cursor-not-allowed"
                     >
                        Log Client Payment
                     </button>
                     <button
                        onClick={() => setTransactionFormInitialData({ type: TransactionType.Debit, purpose: TransactionPurpose.TruckFreight, amount: truckDue > 0 ? truckDue : undefined, notes: truckPaid > 0 ? 'Balance Payment' : 'Advance Payment' })}
                        disabled={truckDue <= 0}
                        className="px-3 py-1 bg-danger text-white text-xs font-semibold rounded-md hover:brightness-95 filter disabled:bg-gray-400 disabled:cursor-not-allowed"
                     >
                        Log Truck Payment
                     </button>
                      <button
                        onClick={() => setTransactionFormInitialData({ type: TransactionType.Debit, purpose: TransactionPurpose.DriverCommission, amount: commissionDue > 0 ? commissionDue : undefined, notes: 'Commission Payment'})}
                        disabled={commissionDue <= 0}
                        className="px-3 py-1 bg-warning text-white text-xs font-semibold rounded-md hover:brightness-95 filter disabled:bg-gray-400 disabled:cursor-not-allowed"
                     >
                        Log Commission
                     </button>
                   </div>
                )}
              </div>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr className="text-left text-gray-600"><th className="p-2 font-medium">Date</th><th className="p-2 font-medium">Purpose</th><th className="p-2 font-medium">Amount</th><th className="p-2 font-medium">Mode</th><th className="p-2 font-medium">Status</th><th className="p-2 font-medium">Notes</th></tr></thead>
                        <tbody>{transactions.map(t => <tr key={t.id} className="border-b"><td className="p-2 whitespace-nowrap">{formatDate(t.date)}</td><td className={`p-2 font-semibold ${t.type === TransactionType.Credit ? 'text-success' : 'text-danger'}`}>{t.purpose}</td><td className="p-2 whitespace-nowrap">{formatCurrency(t.amount)}</td><td className="p-2">{t.paymentMode}</td><td className="p-2">{t.status}</td><td className="p-2 text-xs max-w-xs whitespace-normal">{t.notes}</td></tr>)}</tbody>
                    </table>
                </div>
              ) : <p className="text-sm text-gray-500">No transactions recorded for this trip.</p>}
              {transactionFormInitialData && <AddTransactionInlineForm tripId={trip.id} initialData={transactionFormInitialData} onSave={handleSaveTransaction} onCancel={() => setTransactionFormInitialData(null)} />}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Fleet Details */}
            <div className="bg-white p-4 rounded-lg border">
                 <h4 className="font-semibold text-lg mb-3 flex items-center"><TruckIcon /> <span className="ml-2">Fleet Details</span></h4>
                 <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Truck Number" value={truck.truckNumber} />
                    <DetailItem label="Truck Type" value={truck.truckType} />
                    <DetailItem label="Driver Name" value={truck.driverName} />
                    <DetailItem label="Driver Contact" value={truck.driverPhoneNumber} />
                 </div>
            </div>

            {/* Documents */}
            <div className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg flex items-center"><DocumentIcon /> <span className="ml-2">Documents</span></h4>
                    <label htmlFor="trip-doc-upload" className="cursor-pointer text-sm px-3 py-1 bg-primary text-white font-semibold rounded-md hover:brightness-95">
                        Upload
                        <input id="trip-doc-upload" type="file" className="sr-only" onChange={handleFileUpload} />
                    </label>
                </div>
                {documents.length > 0 ? (
                    <ul className="space-y-2">
                        {documents.map(doc => (
                            <li key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate pr-4">{doc.fileName}</a>
                                <span className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-sm text-gray-500">No documents uploaded for this trip.</p>}
            </div>

            {/* Trip Timeline */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-lg mb-3">Trip Timeline</h4>
              <div className="relative pl-4">
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" aria-hidden="true"></div>
                <ul className="space-y-4">
                  {trip.events.map((event, index) => (
                    <li key={index} className="relative flex items-center">
                       <div className="absolute -left-[22px] z-10 bg-primary h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-white">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{event.status.toString()}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(event.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TripDetailModal;