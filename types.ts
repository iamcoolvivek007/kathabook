
export enum LoadStatus {
  Open = 'Open',
  Assigned = 'Assigned',
  InTransit = 'In-Transit',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum TripStatus {
  Pending = 'Pending Assignment',
  Assigned = 'Assigned',
  Loading = 'Truck Loaded',
  InTransit = 'In-Transit',
  Unloaded = 'Unloaded',
  Completed = 'Completed'
}

export enum TransactionType {
  Credit = 'Credit',
  Debit = 'Debit'
}

export enum TransactionPurpose {
  ClientFreight = 'Client Freight',
  TruckFreight = 'Truck Freight',
  DriverCommission = 'Driver Commission',
}

export enum PaymentMode {
  Cash = 'Cash',
  UPI = 'UPI',
  BankTransfer = 'Bank Transfer',
  Cheque = 'Cheque'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed'
}

export enum WeightUnit {
    Tons = 'Tons',
    Kg = 'Kg'
}

export interface Client {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface Load {
  id: string;
  clientId: string;
  loadingLocation: string;
  unloadingLocation: string;
  materialDescription: string;
  materialWeight: number;
  weightUnit: WeightUnit;
  clientFreight: number;
  status: LoadStatus;
  createdAt: Date;
}

export interface Truck {
  id:string;
  truckNumber: string;
  truckType: string;
  ownerName: string;
  ownerContact: string;
  driverName: string;
  driverPhoneNumber: string;
  // New fields
  truckImageUrl?: string;
  driverImageUrl?: string;
  drivingLicenceUrl?: string;
  rcUrl?: string;
  insuranceUrl?: string;
  panCard?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
}

export interface TripEvent {
    status: TripStatus | LoadStatus;
    timestamp: Date;
    notes?: string;
}

export interface Trip {
  id: string;
  loadId: string;
  truckId: string;
  truckFreight: number;
  driverCommission: number;
  status: TripStatus;
  events: TripEvent[];
}

export interface Transaction {
  id: string;
  tripId: string;
  amount: number;
  date: Date;
  type: TransactionType;
  purpose: TransactionPurpose;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  notes?: string;
}

export interface LoadTemplate {
  id: string;
  templateName: string;
  clientId: string;
  loadingLocation: string;
  unloadingLocation: string;
  materialDescription: string;
  materialWeight: number;
  weightUnit: WeightUnit;
  clientFreight: number;
}

export interface Document {
  id: string;
  tripId: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  fileUrl: string; // Data URL
}

export type View = 'dashboard' | 'loads' | 'fleet' | 'trips' | 'transactions' | 'reports';