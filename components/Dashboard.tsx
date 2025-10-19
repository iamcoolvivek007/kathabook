import React, { useState, useMemo } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { View } from '../types';
import { TripStatus, PaymentStatus, TransactionType, TransactionPurpose } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/helpers';
import StatCard from '../StatCard';
import Modal from './Modal';

interface DashboardProps {
  logisticsState: LogisticsState;
  setCurrentView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logisticsState, setCurrentView }) => {
  const { trips, transactions, loads, trucks, clients } = logisticsState;
  const [modalDetails, setModalDetails] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const activeTrips = useMemo(() => trips
    .filter(t => t.status !== TripStatus.Completed)
    .sort((a,b) => (b.events[b.events.length-1].timestamp.getTime()) - (a.events[a.events.length-1].timestamp.getTime()))
  , [trips]);

  const activeTripsCount = activeTrips.length;
  
  // Financial Calculations
  const totalRevenue = useMemo(() => {
    return trips.reduce((sum, trip) => {
        const load = loads.find(l => l.id === trip.loadId);
        const clientFreight = load ? load.clientFreight : 0;
        return sum + clientFreight + trip.driverCommission;
    }, 0);
  }, [trips, loads]);

  const totalCosts = useMemo(() => trips.reduce((sum, trip) => sum + trip.truckFreight, 0), [trips]);

  const totalReceived = useMemo(() => transactions
    .filter(t => t.type === TransactionType.Credit && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const totalPaidOut = useMemo(() => transactions
    .filter(t => t.type === TransactionType.Debit && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const totalReceivables = totalRevenue - totalReceived;
  const totalPayables = totalCosts - totalPaidOut;
  const cashInHand = totalReceived - totalPaidOut;

  const showActiveTripsDetails = () => {
    setModalDetails({
        title: 'Active Trips',
        content: (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Trip ID</th><th className="px-6 py-3">Route</th><th className="px-6 py-3">Truck</th><th className="px-6 py-3">Driver</th><th className="px-6 py-3">Status</th></tr></thead>
                    <tbody>
                        {activeTrips.map(trip => {
                            const load = loads.find(l => l.id === trip.loadId);
                            const truck = trucks.find(t => t.id === trip.truckId);
                            return (
                                <tr key={trip.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">#{trip.id.slice(-4)}</td>
                                    <td className="px-6 py-4">{load?.loadingLocation} &rarr; {load?.unloadingLocation}</td>
                                    <td className="px-6 py-4">{truck?.truckNumber}</td>
                                    <td className="px-6 py-4">{truck?.driverName}</td>
                                    <td className="px-6 py-4"><span className="font-semibold text-warning">{trip.status}</span></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    });
  };

  const showReceivablesDetails = () => {
      const clientDues = loads.map(load => {
          const trip = trips.find(t => t.loadId === load.id);
          if (!trip) return null;
          const paid = transactions.filter(tx => tx.tripId === trip.id && tx.purpose === TransactionPurpose.ClientFreight).reduce((acc, tx) => acc + tx.amount, 0);
          const due = load.clientFreight - paid;
          if (due <= 0) return null;
          const client = clients.find(c => c.id === load.clientId);
          return { source: client?.name, type: 'Client Freight', tripId: trip.id, total: load.clientFreight, paid, due };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      const driverDues = trips.map(trip => {
        const paid = transactions.filter(tx => tx.tripId === trip.id && tx.purpose === TransactionPurpose.DriverCommission).reduce((acc, tx) => acc + tx.amount, 0);
        const due = trip.driverCommission - paid;
        if (due <= 0 || trip.driverCommission <= 0) return null;
        const truck = trucks.find(t => t.id === trip.truckId);
        return { source: truck?.driverName, type: 'Driver Commission', tripId: trip.id, total: trip.driverCommission, paid, due };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      const allDues = [...clientDues, ...driverDues];

      setModalDetails({
          title: 'Outstanding Receivables',
          content: (
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Source</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Trip ID</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Paid</th><th className="px-6 py-3">Due</th></tr></thead>
                      <tbody>
                          {allDues.map(item => (
                              <tr key={`${item.tripId}-${item.type}`} className="bg-white border-b hover:bg-gray-50">
                                  <td className="px-6 py-4 font-medium">{item.source}</td>
                                  <td className="px-6 py-4">{item.type}</td>
                                  <td className="px-6 py-4">#{item.tripId.slice(-4)}</td>
                                  <td className="px-6 py-4">{formatCurrency(item.total)}</td>
                                  <td className="px-6 py-4 text-success">{formatCurrency(item.paid)}</td>
                                  <td className="px-6 py-4 font-bold text-danger">{formatCurrency(item.due)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )
      })
  }
  
  const showTruckDuesDetails = () => {
    const dueDetails = trips.map(trip => {
      const truck = trucks.find(t => t.id === trip.truckId);
      const freightPaid = transactions.filter(tx => tx.tripId === trip.id && tx.purpose === TransactionPurpose.TruckFreight).reduce((acc, tx) => acc + tx.amount, 0);
      const freightDue = trip.truckFreight - freightPaid;
      if (freightDue > 0) {
        return { id: trip.id + '-freight', payee: truck?.ownerName, purpose: 'Truck Freight', total: trip.truckFreight, paid: freightPaid, due: freightDue };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    setModalDetails({
      title: 'Outstanding Truck/Driver Payments',
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Payee</th><th className="px-6 py-3">Purpose</th><th className="px-6 py-3">Total</th><th className="px-6 py-3">Paid</th><th className="px-6 py-3">Due</th></tr></thead>
            <tbody>
              {dueDetails.map(item => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.payee}</td>
                  <td className="px-6 py-4">{item.purpose}</td>
                  <td className="px-6 py-4">{formatCurrency(item.total)}</td>
                  <td className="px-6 py-4 text-success">{formatCurrency(item.paid)}</td>
                  <td className="px-6 py-4 font-bold text-danger">{formatCurrency(item.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-dark">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Active Trips" value={activeTripsCount} icon={<TruckIcon />} description="Trips currently in progress" onClick={showActiveTripsDetails} />
        <StatCard title="Total Receivables" value={formatCurrency(totalReceivables)} icon={<TrendingUpIcon />} description="Outstanding from clients & drivers" onClick={showReceivablesDetails} />
        <StatCard title="Truck/Driver Dues" value={formatCurrency(totalPayables)} icon={<TrendingDownIcon />} description="Outstanding payments" onClick={showTruckDuesDetails} />
        <StatCard title="Cash in Hand" value={formatCurrency(cashInHand)} icon={<CashIcon />} description="Net cash flow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-dark">Quick Actions</h2>
          <div className="space-y-4">
            <button onClick={() => setCurrentView('loads')} className="w-full flex items-center justify-center bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 transition duration-200">
              <PlusCircleIcon />
              <span className="ml-2">Add New Load</span>
            </button>
            <button onClick={() => setCurrentView('trips')} className="w-full flex items-center justify-center bg-secondary text-white py-3 px-4 rounded-lg font-semibold hover:bg-secondary/90 transition duration-200">
              <SwitchHorizontalIcon />
              <span className="ml-2">Assign Truck to Load</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-dark">Active Trips Overview</h2>
            {activeTrips.length > 0 ? (
                <div className="space-y-4">
                    {activeTrips.slice(0, 5).map(trip => {
                        const load = loads.find(l => l.id === trip.loadId);
                        const truck = trucks.find(t => t.id === trip.truckId);
                        return (
                            <div key={trip.id} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-dark">{load?.loadingLocation} &rarr; {load?.unloadingLocation}</p>
                                        <p className="text-sm text-medium">{truck?.truckNumber}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-warning bg-warning/10 px-2 py-1 rounded-full">{trip.status}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No active trips at the moment.</p>
            )}
        </div>
      </div>
      {modalDetails && (
          <Modal 
            isOpen={!!modalDetails} 
            onClose={() => setModalDetails(null)} 
            title={modalDetails.title} 
            maxWidth="max-w-4xl"
          >
              {modalDetails.content}
          </Modal>
      )}
    </div>
  );
};

// SVG Icons
const TruckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17H6v-6h13l-3-6H6V3h9l3 6v6h-2" /></svg>);
const TrendingUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const TrendingDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>);
const CashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const PlusCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>);
const SwitchHorizontalIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);

export default Dashboard;