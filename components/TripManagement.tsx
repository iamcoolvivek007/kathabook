import React, { useState, useMemo, useEffect } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Trip } from '../types';
import { LoadStatus, TripStatus } from '../types';
import { formatCurrency } from '../utils/helpers';
import Modal from './Modal';
import PageHeader from './PageHeader';
import TripDetailModal from './TripDetailModal';

// Form for creating a new trip
const TripForm: React.FC<{
  logisticsState: LogisticsState;
  onSave: (trip: Omit<Trip, 'id' | 'events'>) => void;
  onClose: () => void;
}> = ({ logisticsState, onSave, onClose }) => {
  const { loads, trucks } = logisticsState;
  const [formData, setFormData] = useState({
    loadId: '',
    truckId: '',
    truckFreight: 0,
    driverCommission: 0,
    status: TripStatus.Assigned,
  });

  // New state for commission calculation
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [commissionPercentage, setCommissionPercentage] = useState(10); // Default 10%

  const availableLoads = useMemo(() => loads.filter(load => load.status === LoadStatus.Open), [loads]);

  // Effect to automatically calculate commission
  useEffect(() => {
    if (autoCalculate) {
      const freight = Number(formData.truckFreight) || 0;
      const percentage = Number(commissionPercentage) || 0;
      const commission = Math.round((freight * percentage) / 100);
      setFormData(prev => ({ ...prev, driverCommission: commission }));
    }
  }, [formData.truckFreight, commissionPercentage, autoCalculate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommissionPercentage(Number(e.target.value));
  };
  
  const handleAutoToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoCalculate(e.target.checked);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      truckFreight: Number(formData.truckFreight),
      driverCommission: Number(formData.driverCommission),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Load</label>
          <select name="loadId" value={formData.loadId} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary">
            <option value="">Select an open load</option>
            {availableLoads.map(load => (
              <option key={load.id} value={load.id}>
                #{load.id.slice(-4)}: {load.loadingLocation} to {load.unloadingLocation}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Truck</label>
          <select name="truckId" value={formData.truckId} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary">
            <option value="">Select an available truck</option>
            {trucks.map(truck => (
              <option key={truck.id} value={truck.id}>{truck.truckNumber} ({truck.driverName})</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Truck Freight</label>
            <input type="number" name="truckFreight" value={formData.truckFreight} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary" />
        </div>
        <div className="md:col-span-2 p-4 border rounded-md bg-gray-50 space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="auto-calculate-commission"
                  name="auto-calculate-commission"
                  type="checkbox"
                  checked={autoCalculate}
                  onChange={handleAutoToggle}
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="auto-calculate-commission" className="font-medium text-gray-700">
                  Auto-calculate Driver Commission
                </label>
                <p className="text-gray-500">Calculate commission based on a percentage of the truck freight.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="commissionPercentage" className="block text-sm font-medium text-gray-700">Commission Percentage (%)</label>
                  <input
                    type="number"
                    id="commissionPercentage"
                    value={commissionPercentage}
                    onChange={handlePercentageChange}
                    disabled={!autoCalculate}
                    className={`mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary ${!autoCalculate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
               </div>
               <div>
                  <label htmlFor="driverCommission" className="block text-sm font-medium text-gray-700">Driver Commission Amount</label>
                  <input
                    type="number"
                    name="driverCommission"
                    id="driverCommission"
                    value={formData.driverCommission}
                    onChange={handleChange}
                    disabled={autoCalculate}
                    className={`mt-1 block w-full p-2 border rounded-md bg-white focus:ring-primary focus:border-primary ${autoCalculate ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
               </div>
            </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Assign Truck</button>
      </div>
    </form>
  );
};

const TripManagement: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const { trips, loads, trucks, addTrip } = logisticsState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all');
  
  const handleSaveTrip = (tripData: Omit<Trip, 'id' | 'events'>) => {
    addTrip(tripData);
  };

  const filteredTrips = useMemo(() => {
    return [...trips]
      .sort((a, b) => b.events[0].timestamp.getTime() - a.events[0].timestamp.getTime())
      .filter(trip => {
        const load = loads.find(l => l.id === trip.loadId);
        const truck = trucks.find(t => t.id === trip.truckId);
        
        const searchMatch =
          searchTerm === '' ||
          trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load?.loadingLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load?.unloadingLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          truck?.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          truck?.driverName.toLowerCase().includes(searchTerm.toLowerCase());
          
        const statusMatch = statusFilter === 'all' || trip.status === statusFilter;
        
        return searchMatch && statusMatch;
      });
  }, [trips, loads, trucks, searchTerm, statusFilter]);

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.Completed: return 'bg-success/10 text-success';
      case TripStatus.Pending: return 'bg-gray-200 text-gray-800';
      default: return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Management"
        actionButton={
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md flex items-center shadow-sm hover:bg-primary/90">
            Assign Truck to Load
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="md:col-span-2">
                <input
                    type="text"
                    placeholder="Search by Trip ID, route, truck, driver..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary"
                />
            </div>
            <div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as TripStatus | 'all')}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary"
                >
                    <option value="all">All Statuses</option>
                    {Object.values(TripStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
        </div>
      </PageHeader>
      
      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {filteredTrips.map(trip => {
            const load = loads.find(l => l.id === trip.loadId);
            const truck = trucks.find(t => t.id === trip.truckId);
            return (
                <div key={trip.id} onClick={() => setSelectedTrip(trip)} className="bg-white p-4 rounded-lg shadow-md border cursor-pointer hover:border-primary">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-dark">Trip #{trip.id.slice(-4)}</p>
                            <p className="text-sm text-medium">{truck?.truckNumber}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                            {trip.status}
                        </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        <p><span className="font-semibold">Route:</span> {load?.loadingLocation} &rarr; {load?.unloadingLocation}</p>
                        <p><span className="font-semibold">Driver:</span> {truck?.driverName}</p>
                        <p><span className="font-semibold">Freight:</span> {formatCurrency(trip.truckFreight)}</p>
                        {trip.driverCommission > 0 && <p><span className="font-semibold">Commission:</span> {formatCurrency(trip.driverCommission)}</p>}
                    </div>
                </div>
            )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Trip ID</th>
                <th className="px-4 py-3">Load ID</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Truck</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Truck Freight</th>
                <th className="px-4 py-3">Driver Commission</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(trip => {
                const load = loads.find(l => l.id === trip.loadId);
                const truck = trucks.find(t => t.id === trip.truckId);
                return (
                  <tr key={trip.id} onClick={() => setSelectedTrip(trip)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium">#{trip.id.slice(-4)}</td>
                    <td className="px-4 py-3">#{load?.id.slice(-4)}</td>
                    <td className="px-4 py-3">{load?.loadingLocation} &rarr; {load?.unloadingLocation}</td>
                    <td className="px-4 py-3">{truck?.truckNumber}</td>
                    <td className="px-4 py-3">{truck?.driverName}</td>
                    <td className="px-4 py-3">{formatCurrency(trip.truckFreight)}</td>
                    <td className="px-4 py-3">{formatCurrency(trip.driverCommission)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Truck to a Load">
        <TripForm logisticsState={logisticsState} onSave={handleSaveTrip} onClose={() => setIsModalOpen(false)} />
      </Modal>

      {selectedTrip && (
        <TripDetailModal
            isOpen={!!selectedTrip}
            onClose={() => setSelectedTrip(undefined)}
            trip={selectedTrip}
            logisticsState={logisticsState}
        />
      )}
    </div>
  );
};

export default TripManagement;