
import type { Client, Load, Truck, Trip, Transaction, TripEvent, LoadTemplate, Document } from './types';
import { LoadStatus, TripStatus, TransactionType, PaymentMode, PaymentStatus, WeightUnit, TransactionPurpose } from './types';

export const initialClients: Client[] = [
  { id: 'cli1', name: 'Global Concrete Inc.', phoneNumber: '555-0101' },
  { id: 'cli2', name: 'Steel Beams Co.', phoneNumber: '555-0102' },
  { id: 'cli3', name: 'Agro Produce Ltd.', phoneNumber: '555-0103' },
];

export const initialLoads: Load[] = [
  { id: 'load1', clientId: 'cli1', loadingLocation: 'Mumbai Port', unloadingLocation: 'Pune Warehouse', materialDescription: 'Cement Bags', materialWeight: 20, weightUnit: WeightUnit.Tons, clientFreight: 50000, status: LoadStatus.Open, createdAt: new Date('2024-07-20T10:00:00Z') },
  { id: 'load2', clientId: 'cli2', loadingLocation: 'Factory A, Delhi', unloadingLocation: 'Site B, Gurgaon', materialDescription: 'Steel Rods', materialWeight: 15, weightUnit: WeightUnit.Tons, clientFreight: 35000, status: LoadStatus.Assigned, createdAt: new Date('2024-07-21T11:00:00Z') },
  { id: 'load3', clientId: 'cli3', loadingLocation: 'Farmville, Punjab', unloadingLocation: 'Market, Delhi', materialDescription: 'Wheat Grain', materialWeight: 25000, weightUnit: WeightUnit.Kg, clientFreight: 60000, status: LoadStatus.InTransit, createdAt: new Date('2024-07-22T09:30:00Z') },
  { id: 'load4', clientId: 'cli1', loadingLocation: 'Chennai Plant', unloadingLocation: 'Bangalore Site', materialDescription: 'Ready-Mix Concrete', materialWeight: 18, weightUnit: WeightUnit.Tons, clientFreight: 45000, status: LoadStatus.Completed, createdAt: new Date('2024-07-18T14:00:00Z') },
  { id: 'load5', clientId: 'cli2', loadingLocation: 'Jaipur Depot', unloadingLocation: 'Agra Factory', materialDescription: 'Iron Plates', materialWeight: 22, weightUnit: WeightUnit.Tons, clientFreight: 52000, status: LoadStatus.Open, createdAt: new Date('2024-07-23T08:00:00Z') },
];

export const initialTrucks: Truck[] = [
  { id: 'truck1', truckNumber: 'MH-12-AB-1234', truckType: '10-wheeler', ownerName: 'Rajesh Kumar', ownerContact: '555-0201', driverName: 'Amit Sharma', driverPhoneNumber: '555-0301', panCard: 'ABCDE1234F', bankAccountNumber: '1234567890', bankIfscCode: 'HDFC0001234' },
  { id: 'truck2', truckNumber: 'DL-01-CD-5678', truckType: 'Container', ownerName: 'Suresh Singh', ownerContact: '555-0202', driverName: 'Vikram Patel', driverPhoneNumber: '555-0302' },
  { id: 'truck3', truckNumber: 'KA-05-EF-9012', truckType: '12-wheeler', ownerName: 'Anil Desai', ownerContact: '555-0203', driverName: 'Manoj Reddy', driverPhoneNumber: '555-0303' },
];

const trip1Events: TripEvent[] = [
    { status: LoadStatus.Assigned, timestamp: new Date('2024-07-21T12:00:00Z') },
    { status: TripStatus.Assigned, timestamp: new Date('2024-07-21T12:05:00Z') },
];
const trip2Events: TripEvent[] = [
    { status: LoadStatus.Assigned, timestamp: new Date('2024-07-22T10:00:00Z') },
    { status: TripStatus.Assigned, timestamp: new Date('2024-07-22T10:05:00Z') },
    { status: TripStatus.Loading, timestamp: new Date('2024-07-22T11:30:00Z') },
    { status: TripStatus.InTransit, timestamp: new Date('2024-07-22T12:00:00Z') },
];
const trip3Events: TripEvent[] = [
    { status: LoadStatus.Assigned, timestamp: new Date('2024-07-18T15:00:00Z') },
    { status: TripStatus.Assigned, timestamp: new Date('2024-07-18T15:05:00Z') },
    { status: TripStatus.Loading, timestamp: new Date('2024-07-18T16:00:00Z') },
    { status: TripStatus.InTransit, timestamp: new Date('2024-07-18T16:30:00Z') },
    { status: TripStatus.Unloaded, timestamp: new Date('2024-07-19T08:00:00Z') },
    { status: TripStatus.Completed, timestamp: new Date('2024-07-19T08:30:00Z') },
];

export const initialTrips: Trip[] = [
  { id: 'trip1', loadId: 'load2', truckId: 'truck1', truckFreight: 30000, driverCommission: 2000, status: TripStatus.Assigned, events: trip1Events },
  { id: 'trip2', loadId: 'load3', truckId: 'truck2', truckFreight: 50000, driverCommission: 3000, status: TripStatus.InTransit, events: trip2Events },
  { id: 'trip3', loadId: 'load4', truckId: 'truck3', truckFreight: 40000, driverCommission: 2500, status: TripStatus.Completed, events: trip3Events },
];

export const initialTransactions: Transaction[] = [
  { id: 'txn1', tripId: 'trip3', amount: 45000, date: new Date('2024-07-20'), type: TransactionType.Credit, purpose: TransactionPurpose.ClientFreight, paymentMode: PaymentMode.BankTransfer, status: PaymentStatus.Completed, notes: 'Full payment from Global Concrete' },
  { id: 'txn2', tripId: 'trip3', amount: 40000, date: new Date('2024-07-21'), type: TransactionType.Debit, purpose: TransactionPurpose.TruckFreight, paymentMode: PaymentMode.UPI, status: PaymentStatus.Completed, notes: 'Payment to truck owner Anil Desai' },
  { id: 'txn3', tripId: 'trip2', amount: 30000, date: new Date('2024-07-23'), type: TransactionType.Credit, purpose: TransactionPurpose.ClientFreight, paymentMode: PaymentMode.Cash, status: PaymentStatus.Pending, notes: 'Advance from Agro Produce' },
  { id: 'txn4', tripId: 'trip2', amount: 50000, date: new Date('2024-07-25'), type: TransactionType.Debit, purpose: TransactionPurpose.TruckFreight, paymentMode: PaymentMode.BankTransfer, status: PaymentStatus.Pending, notes: 'Payment to truck owner Suresh Singh' },
];

export const initialLoadTemplates: LoadTemplate[] = [];
export const initialDocuments: Document[] = [];