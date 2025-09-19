
import React, { useState, useMemo } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Load, Trip } from '../types';
import { LoadStatus, TripStatus } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import Modal from './Modal';
import TripDetailModal from './TripDetailModal';
import PageHeader from './PageHeader';

// Trip Assignment Form
const AssignTripForm: React.FC<{
  logisticsState: LogisticsState;
  load: Load;
  onSave: (tripData: Omit<Trip, 'id' | 'events'>) => void;
  onClose: () => void;
}> = ({ logisticsState, load, onSave, onClose }) => {
  const { trucks } = logisticsState;
  const [formData, setFormData] = useState({
    truckId: '',
    truckFreight: 0,
    driverCommission: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      loadId: load.id,
      truckId: formData.truckId,
      truckFreight: Number(formData.truckFreight),
      driverCommission: Number(formData.driverCommission),
      status: TripStatus.Assigned,
    });
    onClose();
  };

  const selectedTruck = trucks.find(t => t.id === formData.truckId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-semibold">Assigning Truck to Load #{load.id.slice(-6)}</h3>
        <p className="text-sm text-gray-500">{load.loadingLocation} to {load.unloadingLocation}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Truck</label>
          <select name="truckId" value={formData.truckId} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md">
            <option value="">Select Truck</option>
            {trucks.map(t => <option key={t.id} value={t.id}>{t.truckNumber} ({t.driverName})</option>)}
          </select>
          {selectedTruck && <p className="text-xs text-gray-500 mt-1">Driver: {selectedTruck.driverName}</p>}
        </div>
        <div><label className="block text-sm font-medium">Truck Freight</label><input type="number" name="truckFreight" value={formData.truckFreight} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md"/></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium">Driver Commission</label><input type="number" name="driverCommission" value={formData.driverCommission} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md"/></div>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Assign Trip</button>
      </div>
    </form>
  );
};

const TripManagement: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const { loads, trips, trucks, clients, transactions, documents, addTrip, updateTrip, updateLoad, addTransaction, addDocument } = logisticsState;
  const [assigningLoad, setAssigningLoad] = useState<Load | undefined>(undefined);
  const [viewingTrip, setViewingTrip] = useState<Trip | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'active' | 'assignment' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const getTripDetails = (trip: Trip) => ({
    load: loads.find(l => l.id === trip.loadId),
    truck: trucks.find(t => t.id === trip.truckId),
    client: clients.find(c => c.id === loads.find(l => l.id === trip.loadId)?.clientId)
  });

  const filteredData = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const searchFilter = (trip: Trip) => {
      if (!lowerSearchTerm) return true;
      const { load, truck, client } = getTripDetails(trip);
      return (
        trip.id.toLowerCase().includes(lowerSearchTerm) ||
        load?.id.toLowerCase().includes(lowerSearchTerm) ||
        truck?.truckNumber.toLowerCase().includes(lowerSearchTerm) ||
        truck?.driverName.toLowerCase().includes(lowerSearchTerm) ||
        client?.name.toLowerCase().includes(lowerSearchTerm) ||
        load?.loadingLocation.toLowerCase().includes(lowerSearchTerm) ||
        load?.unloadingLocation.toLowerCase().includes(lowerSearchTerm)
      );
    };

    if (activeTab === 'assignment') {
      return loads
        .filter(l => l.status === LoadStatus.Open)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    let filteredTrips: Trip[] = [];
    if (activeTab === 'active') {
        filteredTrips = trips.filter(t => t.status !== TripStatus.Completed && searchFilter(t));
    } else if (activeTab === 'completed') {
        filteredTrips = trips.filter(t => t.status === TripStatus.Completed && searchFilter(t));
    }

    return filteredTrips.sort((a, b) => {
        const dateA = a.events[a.events.length - 1]?.timestamp?.getTime() || 0;
        const dateB = b.events[b.events.length - 1]?.timestamp?.getTime() || 0;
        return dateB - dateA;
    });
  }, [loads, trips, clients, trucks, activeTab, searchTerm]);

  const tripDetailsForModal = useMemo(() => {
    if (!viewingTrip) return null;
    const {load, truck, client} = getTripDetails(viewingTrip);
    if (!load || !truck || !client) return null;
    const tripTransactions = transactions.filter(t => t.tripId === viewingTrip.id);
    const tripDocuments = documents.filter(d => d.tripId === viewingTrip.id);
    return { load, truck, client, tripTransactions, tripDocuments };
  }, [viewingTrip, loads, trucks, clients, transactions, documents]);
  
  const handleUpdateTripStatus = (trip: Trip, newStatus: TripStatus) => {
    const updatedTrip = { ...trip, status: newStatus, events: [...trip.events, { status: newStatus, timestamp: new Date() }] };
    updateTrip(updatedTrip);
    const relatedLoad = loads.find(l => l.id === trip.loadId);
    if (relatedLoad && (newStatus === TripStatus.Completed || newStatus === TripStatus.InTransit)) {
        updateLoad({ ...relatedLoad, status: newStatus as any });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Management"
        actionButton={activeTab === 'assignment' ? (
             <button onClick={() => alert('Add load from Load Management page')} className="px-4 py-2 bg-primary text-white rounded-md hover:brightness-95 flex items-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Add New Load
            </button>
        ) : undefined}
      >
        {activeTab !== 'assignment' && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <input type="text" placeholder="Search trips by ID, truck, driver, client, route..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
        )}
      </PageHeader>
      
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => { setActiveTab('active'); setSearchTerm(''); }} className={`${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Active Trips</button>
            <button onClick={() => { setActiveTab('assignment'); setSearchTerm(''); }} className={`${activeTab === 'assignment' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Needs Assignment</button>
            <button onClick={() => { setActiveTab('completed'); setSearchTerm(''); }} className={`${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Completed Trips</button>
          </nav>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          {activeTab === 'assignment' ? (
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr><th className="px-4 py-3">Load ID</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Material</th><th className="px-4 py-3">Action</th></tr>
                </thead>
                <tbody>
                  {(filteredData as Load[]).map(load => (
                    <tr key={load.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">#{load.id.slice(-6)}</td><td className="px-4 py-3">{load.loadingLocation} &rarr; {load.unloadingLocation}</td>
                      <td className="px-4 py-3">{load.materialDescription}</td>
                      <td className="px-4 py-3"><button onClick={() => setAssigningLoad(load)} className="px-3 py-1 bg-secondary text-white text-xs font-semibold rounded-md hover:brightness-95">Assign Truck</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr><th className="px-4 py-3">Last Update</th><th className="px-4 py-3">Trip/Load ID</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">Financials</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
                </thead>
                <tbody>
                    {(filteredData as Trip[]).map(trip => {
                        const { load, truck } = getTripDetails(trip);
                        if (!load || !truck) return null;
                        const lastEvent = trip.events[trip.events.length - 1];
                        return (
                            <tr key={trip.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 text-xs">{formatDateTime(lastEvent.timestamp)}</td>
                                <td className="px-4 py-3 font-medium">#{trip.id.slice(-4)} / #{load.id.slice(-4)}</td>
                                <td className="px-4 py-3"><p className="font-semibold">{truck.truckNumber}</p><p className="text-xs text-gray-500">{truck.driverName}</p></td>
                                <td className="px-4 py-3 text-xs"><p>Client: {formatCurrency(load.clientFreight)}</p><p>Truck: {formatCurrency(trip.truckFreight)}</p></td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${trip.status === TripStatus.Completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{trip.status}</span>
                                </td>
                                <td className="px-4 py-3 flex items-center space-x-2">
                                    {trip.status !== TripStatus.Completed && (<select onChange={(e) => handleUpdateTripStatus(trip, e.target.value as TripStatus)} value={trip.status} className="p-1 border rounded-md text-xs w-28"><option value="" disabled>Update Status</option>{Object.values(TripStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>)}
                                    <button onClick={() => setViewingTrip(trip)} className="text-primary hover:underline text-xs font-semibold">Details</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          )}
           {filteredData.length === 0 && <p className="text-center p-4 text-gray-500">No records found for this view.</p>}
        </div>
      </div>
      
      {assigningLoad && (<Modal isOpen={!!assigningLoad} onClose={() => setAssigningLoad(undefined)} title="Assign Truck to Load"><AssignTripForm logisticsState={logisticsState} load={assigningLoad} onSave={addTrip} onClose={() => setAssigningLoad(undefined)} /></Modal>)}
      {viewingTrip && tripDetailsForModal && (<TripDetailModal isOpen={!!viewingTrip} onClose={() => setViewingTrip(undefined)} trip={viewingTrip} load={tripDetailsForModal.load} truck={tripDetailsForModal.truck} client={tripDetailsForModal.client} transactions={tripDetailsForModal.tripTransactions} documents={tripDetailsForModal.tripDocuments} addTransaction={addTransaction} addDocument={addDocument}/>)}
    </div>
  );
};

export default TripManagement;