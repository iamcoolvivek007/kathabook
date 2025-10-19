import React, { useMemo, useState } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import { TripStatus } from '../types';
import { formatCurrency } from '../utils/helpers';
import StatCard from '../StatCard';
import PageHeader from './PageHeader';

type DateFilter = 'all' | '30d' | '90d';

const Reporting: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const { clients, trips, loads } = logisticsState;

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0); // A very long time ago

    if (dateFilter === '30d') {
      startDate = new Date(new Date().setDate(now.getDate() - 30));
    } else if (dateFilter === '90d') {
      startDate = new Date(new Date().setDate(now.getDate() - 90));
    }

    const relevantTrips = trips.filter(t => (t.events[0]?.timestamp || new Date(0)) >= startDate);
    
    // Ensure loads are filtered based on the trips that are in the date range
    const relevantTripIds = new Set(relevantTrips.map(t => t.id));
    const relevantLoads = loads.filter(l => {
        // A load is relevant if it's part of a trip that's within the date range
        const tripForLoad = trips.find(t => t.loadId === l.id);
        return tripForLoad ? relevantTripIds.has(tripForLoad.id) : false;
    });

    return {
      trips: relevantTrips,
      loads: relevantLoads,
    };
  }, [trips, loads, dateFilter]);

  const financialSummary = useMemo(() => {
    const { trips, loads } = filteredData;
    const totalRevenue = trips.reduce((sum, trip) => {
        const load = loads.find(l => l.id === trip.loadId);
        return sum + (load?.clientFreight || 0);
    }, 0);
    const totalCosts = trips.reduce((sum, trip) => sum + trip.truckFreight + trip.driverCommission, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const completedTrips = trips.filter(t => t.status === TripStatus.Completed).length;

    return { totalRevenue, totalCosts, netProfit, profitMargin, totalLoads: loads.length, completedTrips };
  }, [filteredData]);

  const tripProfitabilityData = useMemo(() => {
    return filteredData.trips
      .map(trip => {
        const load = filteredData.loads.find(l => l.id === trip.loadId);
        if (!load) return null;
        
        const client = clients.find(c => c.id === load.clientId);
        const revenue = load.clientFreight;
        const cost = trip.truckFreight + trip.driverCommission;
        const profit = revenue - cost;

        return {
          tripId: trip.id,
          route: `${load.loadingLocation} → ${load.unloadingLocation}`,
          clientName: client?.name || 'Unknown',
          revenue,
          cost,
          profit,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.profit - a.profit);
  }, [filteredData, clients]);
  
  const clientProfitabilityData = useMemo(() => {
    const clientData: { [key: string]: { loadCount: number, totalRevenue: number, totalProfit: number } } = {};
    
    tripProfitabilityData.forEach(trip => {
      if (!clientData[trip.clientName]) {
        clientData[trip.clientName] = { loadCount: 0, totalRevenue: 0, totalProfit: 0 };
      }
      clientData[trip.clientName].loadCount++;
      clientData[trip.clientName].totalRevenue += trip.revenue;
      clientData[trip.clientName].totalProfit += trip.profit;
    });

    return Object.entries(clientData)
      .map(([clientName, data]) => ({ clientName, ...data }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }, [tripProfitabilityData]);

  return (
    <div className="space-y-8">
      <PageHeader title="Reports">
        <div className="bg-white p-4 rounded-lg shadow-sm border mt-4">
            <div className="flex items-center justify-end">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                    {(['30d', '90d', 'all'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setDateFilter(filter)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${dateFilter === filter ? 'bg-white text-primary shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                        >
                            {filter === '30d' ? 'Last 30 Days' : filter === '90d' ? 'Last 90 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard title="Total Revenue" value={formatCurrency(financialSummary.totalRevenue)} icon={<TrendingUpIcon />} />
        <StatCard title="Total Costs" value={formatCurrency(financialSummary.totalCosts)} icon={<TrendingDownIcon />} />
        <StatCard title="Net Profit" value={formatCurrency(financialSummary.netProfit)} icon={<CashIcon />} />
        <StatCard title="Profit Margin" value={`${financialSummary.profitMargin.toFixed(1)}%`} icon={<PercentageIcon />} />
        <StatCard title="Total Loads" value={financialSummary.totalLoads} icon={<ClipboardListIcon />} />
        <StatCard title="Completed Trips" value={financialSummary.completedTrips} icon={<CheckCircleIcon />} />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-dark">Client Profitability</h3>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                      <tr>
                          <th className="px-4 py-3">Client</th>
                          <th className="px-4 py-3 text-center">Loads</th>
                          <th className="px-4 py-3 text-right">Total Profit</th>
                      </tr>
                  </thead>
                  <tbody>
                      {clientProfitabilityData.map(item => (
                          <tr key={item.clientName} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{item.clientName}</td>
                              <td className="px-4 py-3 text-center">{item.loadCount}</td>
                              <td className={`px-4 py-3 text-right font-bold ${item.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.totalProfit)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-dark">Trip Profitability</h3>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                      <tr>
                          <th className="px-4 py-3">Trip</th>
                          <th className="px-4 py-3">Client</th>
                          <th className="px-4 py-3 text-right">Profit</th>
                      </tr>
                  </thead>
                  <tbody>
                      {tripProfitabilityData.map(item => (
                          <tr key={item.tripId} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">#{item.tripId.slice(-4)} <span className="text-gray-400 font-normal text-xs block truncate max-w-[200px]">{item.route}</span></td>
                              <td className="px-4 py-3">{item.clientName}</td>
                              <td className={`px-4 py-3 text-right font-bold ${item.profit >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(item.profit)}</td>
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

// SVG Icons
const TrendingUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const TrendingDownIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>);
const CashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const PercentageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 100-8 4 4 0 000 8zm0 0l9-9m-9 0a4 4 0 108 0 4 4 0 00-8 0z" /></svg>);
const ClipboardListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

export default Reporting;
