
import React, { useState, useMemo } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Truck, Client } from '../types';
import Modal from './Modal';
import PageHeader from './PageHeader';
import FileInput from './FileInput';

// Truck and Driver Form Component
const TruckForm: React.FC<{
  onSave: (truck: Omit<Truck, 'id'> | Truck) => void;
  onClose: () => void;
  truckToEdit?: Truck;
}> = ({ onSave, onClose, truckToEdit }) => {
  const [formData, setFormData] = useState({
    truckNumber: truckToEdit?.truckNumber || '',
    truckType: truckToEdit?.truckType || '',
    ownerName: truckToEdit?.ownerName || '',
    ownerContact: truckToEdit?.ownerContact || '',
    driverName: truckToEdit?.driverName || '',
    driverPhoneNumber: truckToEdit?.driverPhoneNumber || '',
    truckImageUrl: truckToEdit?.truckImageUrl || undefined,
    driverImageUrl: truckToEdit?.driverImageUrl || undefined,
    drivingLicenceUrl: truckToEdit?.drivingLicenceUrl || undefined,
    rcUrl: truckToEdit?.rcUrl || undefined,
    insuranceUrl: truckToEdit?.insuranceUrl || undefined,
    panCard: truckToEdit?.panCard || '',
    bankAccountNumber: truckToEdit?.bankAccountNumber || '',
    bankIfscCode: truckToEdit?.bankIfscCode || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (name: string, fileUrl: string) => {
    setFormData(prev => ({ ...prev, [name]: fileUrl }));
  };
  
  const handleFileRemove = (name: string) => {
    setFormData(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (truckToEdit) {
      onSave({ ...truckToEdit, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-medium text-gray-900 px-2">Vehicle & Owner</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium">Truck Number</label><input type="text" name="truckNumber" value={formData.truckNumber} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
          <div><label className="block text-sm font-medium">Truck Type</label><input type="text" name="truckType" value={formData.truckType} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
          <div><label className="block text-sm font-medium">Owner Name</label><input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
          <div><label className="block text-sm font-medium">Owner Contact</label><input type="text" name="ownerContact" value={formData.ownerContact} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
        </div>
      </fieldset>
      
      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-medium text-gray-900 px-2">Driver Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium">Driver Name</label><input type="text" name="driverName" value={formData.driverName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
          <div><label className="block text-sm font-medium">Driver Phone Number</label><input type="text" name="driverPhoneNumber" value={formData.driverPhoneNumber} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
          <div><label className="block text-sm font-medium">PAN Card</label><input type="text" name="panCard" value={formData.panCard} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-medium text-gray-900 px-2">Bank Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Bank Account Number</label><input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
            <div><label className="block text-sm font-medium">IFSC Code</label><input type="text" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 p-4 border rounded-md">
        <legend className="text-lg font-medium text-gray-900 px-2">Documents & Images</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FileInput label="Truck Picture" name="truckImageUrl" currentFileUrl={formData.truckImageUrl} onFileChange={handleFileChange} onFileRemove={handleFileRemove} accept="image/*" />
            <FileInput label="Driver Picture" name="driverImageUrl" currentFileUrl={formData.driverImageUrl} onFileChange={handleFileChange} onFileRemove={handleFileRemove} accept="image/*" />
            <FileInput label="Driving Licence" name="drivingLicenceUrl" currentFileUrl={formData.drivingLicenceUrl} onFileChange={handleFileChange} onFileRemove={handleFileRemove} />
            <FileInput label="Registration (RC)" name="rcUrl" currentFileUrl={formData.rcUrl} onFileChange={handleFileChange} onFileRemove={handleFileRemove} />
            <FileInput label="Insurance" name="insuranceUrl" currentFileUrl={formData.insuranceUrl} onFileChange={handleFileChange} onFileRemove={handleFileRemove} />
        </div>
      </fieldset>

      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Truck</button>
      </div>
    </form>
  );
};

// Client Form Component
const ClientForm: React.FC<{
  onSave: (client: Omit<Client, 'id'> | Client) => void;
  onClose: () => void;
  clientToEdit?: Client;
}> = ({ onSave, onClose, clientToEdit }) => {
  const [formData, setFormData] = useState({
    name: clientToEdit?.name || '',
    phoneNumber: clientToEdit?.phoneNumber || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientToEdit) {
      onSave({ ...clientToEdit, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium">Client Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
        <div><label className="block text-sm font-medium">Phone Number</label><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Client</button>
      </div>
    </form>
  );
};

// Main Fleet Management Component
const FleetManagement: React.FC<{ logisticsState: LogisticsState }> = ({ logisticsState }) => {
  const [activeTab, setActiveTab] = useState<'trucks' | 'clients'>('trucks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Truck | Client | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const { trucks, addTruck, updateTruck, deleteTruck, clients, addClient, updateClient, deleteClient } = logisticsState;

  const handleOpenModal = (item?: Truck | Client) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(false);
  };

  const handleSaveTruck = (truckData: Omit<Truck, 'id'> | Truck) => {
    if ('id' in truckData) updateTruck(truckData); else addTruck(truckData);
  };
  
  const handleSaveClient = (clientData: Omit<Client, 'id'> | Client) => {
    if ('id' in clientData) updateClient(clientData); else addClient(clientData);
  };
  
  const getTabTitle = () => activeTab === 'trucks' ? 'Truck' : 'Client';

  const filteredTrucks = useMemo(() => trucks.filter(t => 
    t.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  ), [trucks, searchTerm]);
  
  const filteredClients = useMemo(() => clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [clients, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet & Client Management"
        actionButton={
          <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white rounded-md flex items-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add New {getTabTitle()}
          </button>
        }
      >
        <div className="bg-white p-4 rounded-lg shadow-sm border">
           <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </PageHeader>
      
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => {setActiveTab('trucks'); setSearchTerm('');}} className={`${activeTab === 'trucks' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Truck Records</button>
            <button onClick={() => {setActiveTab('clients'); setSearchTerm('');}} className={`${activeTab === 'clients' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Client Records</button>
          </nav>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        {activeTab === 'trucks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Truck Number</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Owner Name</th>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Driver Phone</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrucks.map(truck => (
                  <tr key={truck.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {truck.truckImageUrl ? <img src={truck.truckImageUrl} alt={truck.truckNumber} className="h-10 w-10 rounded-md object-cover" /> : <div className="h-10 w-10 bg-gray-200 rounded-md"></div>}
                    </td>
                    <td className="px-4 py-3 font-medium">{truck.truckNumber}</td>
                    <td className="px-4 py-3">{truck.truckType}</td>
                    <td className="px-4 py-3">{truck.ownerName}</td>
                    <td className="px-4 py-3">{truck.driverName}</td>
                    <td className="px-4 py-3">{truck.driverPhoneNumber}</td>
                    <td className="px-4 py-3 flex space-x-2"><button onClick={() => handleOpenModal(truck)} className="text-primary hover:underline">Edit</button><button onClick={() => deleteTruck(truck.id)} className="text-danger hover:underline">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'clients' && (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Client Name</th>
                            <th className="px-6 py-3">Phone Number</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{client.name}</td>
                                <td className="px-6 py-4">{client.phoneNumber}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => handleOpenModal(client)} className="text-primary hover:underline">Edit</button>
                                    <button onClick={() => deleteClient(client.id)} className="text-danger hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? `Edit ${getTabTitle()}` : `Add New ${getTabTitle()}`} maxWidth="max-w-4xl">
        {activeTab === 'trucks' ? (
          <TruckForm onSave={handleSaveTruck} onClose={handleCloseModal} truckToEdit={editingItem as Truck} />
        ) : (
          <ClientForm onSave={handleSaveClient} onClose={handleCloseModal} clientToEdit={editingItem as Client} />
        )}
      </Modal>
    </div>
  );
};

export default FleetManagement;