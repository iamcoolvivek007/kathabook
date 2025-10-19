
import React, { useState } from 'react';
import type { Client, Load, Truck, Trip, Transaction, LoadTemplate, Document } from '../types';
import { initialClients, initialLoads, initialTrucks, initialTrips, initialTransactions, initialLoadTemplates, initialDocuments } from '../constants';

export const useLogisticsState = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loads, setLoads] = useState<Load[]>(initialLoads);
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loadTemplates, setLoadTemplates] = useState<LoadTemplate[]>(initialLoadTemplates);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  // FIX: These functions were throwing errors because the `React` namespace was not available for types.
  // Generic CRUD helpers
  const addItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
    setter(prev => [...prev, item]);
  };
  
  const updateItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, updatedItem: T) => {
    setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const deleteItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, itemId: string) => {
    setter(prev => prev.filter(item => item.id !== itemId));
  };

  const updateLoad = (load: Load) => updateItem(setLoads, load);

  return {
    clients,
    addClient: (client: Omit<Client, 'id'>) => addItem(setClients, { ...client, id: `cli${Date.now()}` }),
    updateClient: (client: Client) => updateItem(setClients, client),
    deleteClient: (id: string) => deleteItem(setClients, id),
    
    loads,
    addLoad: (load: Omit<Load, 'id' | 'createdAt'>) => addItem(setLoads, { ...load, id: `load${Date.now()}`, createdAt: new Date() }),
    updateLoad,
    deleteLoad: (id: string) => deleteItem(setLoads, id),
    
    trucks,
    addTruck: (truck: Omit<Truck, 'id'>) => addItem(setTrucks, { ...truck, id: `truck${Date.now()}` }),
    updateTruck: (truck: Truck) => updateItem(setTrucks, truck),
    deleteTruck: (id: string) => deleteItem(setTrucks, id),
    
    trips,
    addTrip: (trip: Omit<Trip, 'id' | 'events'>) => {
        const newTrip: Trip = { ...trip, id: `trip${Date.now()}`, events: [{ status: trip.status, timestamp: new Date() }] };
        addItem(setTrips, newTrip);
        
        // Also update the associated load's status
        const load = loads.find(l => l.id === trip.loadId);
        if(load) {
            updateLoad({ ...load, status: trip.status as any }); // Assuming TripStatus maps to LoadStatus
        }
    },
    updateTrip: (trip: Trip) => updateItem(setTrips, trip),
    deleteTrip: (id: string) => deleteItem(setTrips, id),
    
    transactions,
    addTransaction: (transaction: Omit<Transaction, 'id'>) => addItem(setTransactions, { ...transaction, id: `txn${Date.now()}` }),
    updateTransaction: (transaction: Transaction) => updateItem(setTransactions, transaction),
    deleteTransaction: (id: string) => deleteItem(setTransactions, id),

    loadTemplates,
    addLoadTemplate: (template: Omit<LoadTemplate, 'id'>) => addItem(setLoadTemplates, { ...template, id: `template${Date.now()}` }),
    deleteLoadTemplate: (id: string) => deleteItem(setLoadTemplates, id),

    documents,
    addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => addItem(setDocuments, { ...doc, id: `doc${Date.now()}`, uploadedAt: new Date() }),
    deleteDocument: (id: string) => deleteItem(setDocuments, id),
  };
};

export type LogisticsState = ReturnType<typeof useLogisticsState>;