import React, { useMemo } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import { TripStatus, PaymentStatus, TransactionType, LoadStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import StatCard from '../StatCard';

const Reporting: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const { trips, loads, transactions, clients } = logisticsState;

  // Financial Calculations
  const totalClientRevenue = loads.reduce((sum, load) => sum + load.clientFreight, 0);
  const totalCosts = trips.reduce((sum, trip) => sum + trip.truckFreight + trip.driverCommission, 0);

  const totalReceived = transactions
    .filter(t => t.type === TransactionType.Credit && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaidOut = transactions
    .filter(t => t.type === TransactionType.Debit && t.status === PaymentStatus.Completed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalClientDues = totalClientRevenue - totalReceived;
  const totalPayables = totalCosts - totalPaidOut;
  const cashInHand = totalReceived - totalPaidOut;


  const tripProfitability = useMemo(() => {
    return trips
      .filter(trip => trip.status === TripStatus.Completed)
      .map(trip => {
        const load = loads.find(l => l.id === trip.loadId);
        if (!load) return null;
        const profit = (load.clientFreight - trip.truckFreight) + trip.driverCommission;
        return {
          tripId: trip.id,
          loadId: load.id,
          clientFreight: load.clientFreight,
          truckFreight: trip.truckFreight,
          driverCommission: trip.driverCommission,
          profit,
        };
      }).filter(Boolean);
  }, [trips, loads]);

  const pendingReceivables = useMemo(() => {
    return transactions.filter(t => t.status === PaymentStatus.Pending && t.type === TransactionType.Credit);
  }, [transactions]);

  const pendingPayables = useMemo(() => {
    return transactions.filter(t => t.status === PaymentStatus.Pending && t.type === TransactionType.Debit);
  }, [transactions]);

  const clientWiseSummary = useMemo(() => {
    return clients.map(client => {
      const clientLoads = loads.filter(l => l.clientId === client.id);
      const totalBusiness = clientLoads.reduce((sum, l) => sum + l.clientFreight, 0);
      const completedTrips = clientLoads.filter(l => l.status === LoadStatus.Completed).length;
      return {
        clientName: client.name,
        totalLoads: clientLoads.length,
        completedTrips,
        totalBusiness,
      };
    });
  }, [clients, loads]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-dark">Financial Summary & Reports</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Client Dues" value={formatCurrency(totalClientDues)} icon={<TrendingUpIcon />} description="Total outstanding from clients" />
        <StatCard title="Truck/Driver Dues" value={formatCurrency(totalPayables)} icon={<TrendingDownIcon />} description="Total outstanding payments" />
        <StatCard title="Cash in Hand" value={formatCurrency(cashInHand)} icon={<CashIcon />} description="Net cash flow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ledgers */}
        <div>
          <h2 className="text-2xl font-semibold text-dark mb-4">Pending Payments Ledgers</h2>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2 text-success">Outstanding Client Invoices</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">Trip ID</th><th className="text-left p-2">Amount</th><th className="text-left p-2">Date</th><th className="text-left p-2">Notes</th></tr></thead>
                <tbody>
                  {pendingReceivables.length > 0 ? pendingReceivables.map(t => <tr key={t.id} className="border-b"><td className="p-2">#{t.tripId.slice(-4)}</td><td className="p-2">{formatCurrency(t.amount)}</td><td className="p-2">{formatDate(t.date)}</td><td className="p-2 text-xs">{t.notes}</td></tr>) : <tr><td colSpan={4} className="p-2 text-gray-500">No pending receivables.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-2 text-danger">Outstanding Payables</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">Trip ID</th><th className="text-left p-2">Purpose</th><th className="text-left p-2">Amount</th><th className="text-left p-2">Date</th><th className="text-left p-2">Notes</th></tr></thead>
                <tbody>
                  {pendingPayables.length > 0 ? pendingPayables.map(t => <tr key={t.id} className="border-b"><td className="p-2">#{t.tripId.slice(-4)}</td><td className="p-2 font-semibold">{t.purpose}</td><td className="p-2">{formatCurrency(t.amount)}</td><td className="p-2">{formatDate(t.date)}</td><td className="p-2 text-xs">{t.notes}</td></tr>) : <tr><td colSpan={5} className="p-2 text-gray-500">No pending payables.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Client-wise Summary */}
        <div>
          <h2 className="text-2xl font-semibold text-dark mb-4">Client-wise Business Summary</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Client</th><th className="px-6 py-3">Total Loads</th><th className="px-6 py-3">Completed</th><th className="px-6 py-3">Total Business</th></tr></thead>
                <tbody>
                  {clientWiseSummary.map(summary => (
                    <tr key={summary.clientName} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{summary.clientName}</td>
                      <td className="px-6 py-4">{summary.totalLoads}</td>
                      <td className="px-6 py-4">{summary.completedTrips}</td>
                      <td className="px-6 py-4 font-semibold">{formatCurrency(summary.totalBusiness)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trip-wise Profitability Report */}
      <div>
        <h2 className="text-2xl font-semibold text-dark mb-4">Trip-wise Profitability Report (Completed Trips)</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Trip ID</th><th className="px-6 py-3">Client Freight</th>
                  <th className="px-6 py-3">Truck Freight</th><th className="px-6 py-3">Commission</th>
                  <th className="px-6 py-3">Trip Profit</th>
                </tr>
              </thead>
              <tbody>
                {tripProfitability.map(item => item && (
                  <tr key={item.tripId} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{item.tripId.slice(-4)}</td>
                    <td className="px-6 py-4 text-success">{formatCurrency(item.clientFreight)}</td>
                    <td className="px-6 py-4 text-danger">-{formatCurrency(item.truckFreight)}</td>
                    <td className="px-6 py-4 text-success">{formatCurrency(item.driverCommission)}</td>
                    <td className={`px-6 py-4 font-bold ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// SVG Icons for StatCards
const TrendingUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const TrendingDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>);
const CashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);


export default Reporting;