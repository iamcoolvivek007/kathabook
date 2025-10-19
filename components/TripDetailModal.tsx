import React, { useState } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Trip, TripEvent, Transaction } from '../types';
import { TripStatus, LoadStatus, TransactionPurpose, TransactionType } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';
import Modal from './Modal';
import TransactionForm from './TransactionForm';

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  logisticsState: LogisticsState;
}

const TripDetailModal: React.FC<TripDetailModalProps> = ({ isOpen, onClose, trip, logisticsState }) => {
  const { loads, trucks, clients, transactions, updateTrip, updateLoad, addTransaction } = logisticsState;
  const [transactionPurpose, setTransactionPurpose] = useState<TransactionPurpose | null>(null);

  const load = loads.find(l => l.id === trip.loadId);
  const truck = trucks.find(t => t.id === trip.truckId);
  const client = clients.find(c => c.id === load?.clientId);
  
  const tripTransactions = transactions
    .filter(t => t.tripId === trip.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const nextPossibleStatuses = (): TripStatus[] => {
    switch (trip.status) {
        case TripStatus.Assigned:
            return [TripStatus.Loading];
        case TripStatus.Loading:
            return [TripStatus.InTransit];
        case TripStatus.InTransit:
            return [TripStatus.Unloaded];
        case TripStatus.Unloaded:
            return [TripStatus.Completed];
        default:
            return [];
    }
  };

  const nextStatus = nextPossibleStatuses()[0];

  const handleStatusUpdate = () => {
    if (!nextStatus) return;

    const notes = prompt("Add optional notes for this status change:");
    
    const newEvent: TripEvent = {
      status: nextStatus,
      timestamp: new Date(),
      notes: notes || undefined,
    };
    const updatedTrip: Trip = {
      ...trip,
      status: nextStatus,
      events: [...trip.events, newEvent],
    };
    updateTrip(updatedTrip);
    
    if (load && (nextStatus === TripStatus.Completed)) {
        updateLoad({...load, status: LoadStatus.Completed});
    }
    
    onClose();
  };
  
  const handleOpenTransactionModal = (purpose: TransactionPurpose) => {
    setTransactionPurpose(purpose);
  };

  const handleCloseTransactionModal = () => {
    setTransactionPurpose(null);
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
    if (!('id' in transactionData)) {
      addTransaction(transactionData);
    }
    // We don't support editing from this modal for now.
    handleCloseTransactionModal();
  };

  const getLoadStatusColor = (status: LoadStatus) => {
    switch (status) {
      case LoadStatus.Completed: return 'bg-success/10 text-success';
      case LoadStatus.Cancelled: return 'bg-danger/10 text-danger';
      case LoadStatus.Open: return 'bg-primary/10 text-primary';
      default: return 'bg-warning/10 text-warning';
    }
  };
  
  if (!load || !truck || !client) {
    return null;
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Trip Details: #${trip.id.slice(-6)}`} maxWidth="max-w-7xl">
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-dark mb-2">Update Trip Status</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <p className="flex-grow text-sm sm:text-base">
                    Current Status: <span className="font-semibold text-medium">{trip.status}</span>
                </p>
                {nextStatus ? (
                    <button
                        onClick={handleStatusUpdate}
                        className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Mark as &rarr; {nextStatus}
                    </button>
                ) : (
                    <p className="font-semibold text-success">Trip Completed</p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* --- Left Column --- */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-dark">Trip Timeline</h3>
                <ol className="relative border-l border-gray-200 mt-4">
                  {trip.events.map((event, index) => (
                    <li key={index} className="mb-6 ml-4">
                      <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400">{formatDateTime(event.timestamp)}</time>
                      <h4 className="text-md font-semibold text-gray-900">{event.status}</h4>
                      {event.notes && <p className="text-sm italic font-normal text-gray-500">"{event.notes}"</p>}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h4 className="font-semibold mb-2">Load & Route Details</h4>
                <p><strong>Client:</strong> {client.name} ({client.phoneNumber})</p>
                <p><strong>Route:</strong> {load.loadingLocation} &rarr; {load.unloadingLocation}</p>
                <p><strong>Material:</strong> {load.materialDescription} ({load.materialWeight} {load.weightUnit})</p>
                <p className="mt-2">
                  <strong>Load Status:</strong>{' '}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLoadStatusColor(load.status)}`}>
                    {load.status}
                  </span>
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                  <h4 className="font-semibold mb-2">Truck & Driver Details</h4>
                  <p><strong>Truck Number:</strong> {truck.truckNumber}</p>
                  <p><strong>Driver:</strong> {truck.driverName} ({truck.driverPhoneNumber})</p>
                  <p><strong>Owner:</strong> {truck.ownerName} ({truck.ownerContact})</p>
              </div>
            </div>
            
            {/* --- Right Column --- */}
            <div className="lg:col-span-3">
               <div className="p-6 border rounded-lg bg-white shadow-sm h-full flex flex-col">
                  <h3 className="text-lg font-semibold mb-4 text-dark border-b pb-2">Financial Overview</h3>
                  
                  <div className="space-y-4 mt-4">
                      <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-md">
                          <div>
                              <p className="font-semibold text-gray-700">Client Freight</p>
                              <p className="text-xs text-gray-500">Total amount from client</p>
                          </div>
                          <div className="text-right">
                              <p className="font-bold text-lg text-gray-800">{formatCurrency(load.clientFreight)}</p>
                              <button onClick={() => handleOpenTransactionModal(TransactionPurpose.ClientFreight)} className="text-xs font-semibold text-primary hover:underline">Log Payment</button>
                          </div>
                      </div>
                      <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-md">
                          <div>
                              <p className="font-semibold text-gray-700">Truck Freight</p>
                              <p className="text-xs text-gray-500">Payment to truck owner</p>
                          </div>
                           <div className="text-right">
                              <p className="font-bold text-lg text-gray-800">{formatCurrency(trip.truckFreight)}</p>
                              <button onClick={() => handleOpenTransactionModal(TransactionPurpose.TruckFreight)} className="text-xs font-semibold text-primary hover:underline">Log Payment</button>
                          </div>
                      </div>
                      {trip.driverCommission > 0 &&
                        <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-semibold text-gray-700">Driver Commission</p>
                                <p className="text-xs text-gray-500">Payment to driver</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-gray-800">{formatCurrency(trip.driverCommission)}</p>
                                <button onClick={() => handleOpenTransactionModal(TransactionPurpose.DriverCommission)} className="text-xs font-semibold text-primary hover:underline">Log Payment</button>
                            </div>
                        </div>
                      }
                  </div>

                  <div className="mt-6 pt-4 border-t flex-grow flex flex-col min-h-0">
                      <h4 className="text-md font-semibold mb-2 text-gray-800">Transaction History</h4>
                      {tripTransactions.length > 0 ? (
                          <div className="overflow-y-auto flex-grow">
                              <table className="w-full text-sm text-left">
                                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                      <tr>
                                          <th className="px-4 py-2">Date</th>
                                          <th className="px-4 py-2">Purpose</th>
                                          <th className="px-4 py-2 text-right">Amount</th>
                                          <th className="px-4 py-2 text-center">Status</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {tripTransactions.map(txn => (
                                          <tr key={txn.id} className="border-b hover:bg-gray-50">
                                              <td className="px-4 py-2">{formatDate(txn.date)}</td>
                                              <td className={`px-4 py-2 font-semibold ${txn.type === TransactionType.Credit ? 'text-green-600' : 'text-red-600'}`}>{txn.purpose}</td>
                                              <td className="px-4 py-2 text-right font-medium">{formatCurrency(txn.amount)}</td>
                                              <td className="px-4 py-2 text-center">
                                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${txn.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                      {txn.status}
                                                  </span>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      ) : (
                          <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-md p-4">
                              <p className="text-gray-500 text-sm text-center">No transactions logged for this trip yet.</p>
                          </div>
                      )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!transactionPurpose} onClose={handleCloseTransactionModal} title={`Add Transaction for Trip #${trip.id.slice(-4)}`}>
        {transactionPurpose &&
          <TransactionForm
              logisticsState={logisticsState}
              onSave={handleSaveTransaction}
              onClose={handleCloseTransactionModal}
              defaultTripId={trip.id}
              defaultPurpose={transactionPurpose}
          />
        }
      </Modal>
    </>
  );
};

export default TripDetailModal;