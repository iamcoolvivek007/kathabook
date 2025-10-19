
import React, { useState, useMemo } from 'react';
import type { LogisticsState } from '../hooks/useLogisticsState';
import type { Load, LoadTemplate } from '../types';
import { LoadStatus, WeightUnit, LoadPriority } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from './Modal';
import PageHeader from './PageHeader';

interface LoadManagementProps {
  logisticsState: LogisticsState;
}

const LoadForm: React.FC<{
  logisticsState: LogisticsState;
  onSave: (load: Omit<Load, 'id' | 'createdAt'> | Load) => void;
  onClose: () => void;
  loadToEdit?: Load;
}> = ({ logisticsState, onSave, onClose, loadToEdit }) => {
  const [formData, setFormData] = useState({
    clientId: loadToEdit?.clientId || '',
    loadingLocation: loadToEdit?.loadingLocation || '',
    unloadingLocation: loadToEdit?.unloadingLocation || '',
    materialDescription: loadToEdit?.materialDescription || '',
    materialWeight: loadToEdit?.materialWeight || 0,
    weightUnit: loadToEdit?.weightUnit || WeightUnit.Tons,
    clientFreight: loadToEdit?.clientFreight || 0,
    status: loadToEdit?.status || LoadStatus.Open,
    priority: loadToEdit?.priority || LoadPriority.Medium,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loadToEdit) {
      onSave({ ...loadToEdit, ...formData });
    } else {
      onSave(formData as Omit<Load, 'id' | 'createdAt'>);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Load Provider (Client)</label>
          <select name="clientId" value={formData.clientId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary">
            <option value="">Select a Client</option>
            {logisticsState.clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Freight</label>
          <input type="number" name="clientFreight" value={formData.clientFreight} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Loading Location</label>
          <input type="text" name="loadingLocation" value={formData.loadingLocation} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unloading Location</label>
          <input type="text" name="unloadingLocation" value={formData.unloadingLocation} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Material Description</label>
          <input type="text" name="materialDescription" value={formData.materialDescription} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary" />
        </div>
        <div className="flex gap-2">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700">Material Weight</label>
            <input type="number" name="materialWeight" value={formData.materialWeight} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary">
              <option value={WeightUnit.Tons}>Tons</option>
              <option value={WeightUnit.Kg}>Kg</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary">
            {Object.values(LoadPriority).map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-primary focus:border-primary">
            {Object.values(LoadStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">Save Load</button>
      </div>
    </form>
  );
};


const LoadManagement: React.FC<LoadManagementProps> = ({ logisticsState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] =useState(false);
  const [loadToEdit, setLoadToEdit] = useState<Load | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoadStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | LoadPriority>('all');

  const { loads, clients, addLoad, updateLoad, deleteLoad, loadTemplates, addLoadTemplate } = logisticsState;

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown Client';

  const handleOpenModal = (load?: Load) => {
    setLoadToEdit(load);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setLoadToEdit(undefined);
    setIsModalOpen(false);
  };

  const handleSaveLoad = (loadData: Omit<Load, 'id' | 'createdAt'> | Load) => {
    if ('id' in loadData) {
      if (loadData.id.startsWith('temp-')) {
        const { id, ...newLoadData } = loadData;
        addLoad(newLoadData as Omit<Load, 'id' | 'createdAt'>);
      } else {
        updateLoad(loadData);
      }
    } else {
      addLoad(loadData);
    }
  };

  const handleSaveAsTemplate = (load: Load) => {
    const templateName = prompt("Enter a name for this template:", `${getClientName(load.clientId)} - ${load.loadingLocation} to ${load.unloadingLocation}`);
    if (templateName) {
      const { id, status, createdAt, ...templateData } = load;
      addLoadTemplate({ ...templateData, templateName });
      alert(`Template "${templateName}" saved.`);
    }
  };

  const handleCreateFromTemplate = (template: LoadTemplate) => {
    const { id, templateName, ...loadData } = template;
    const loadFromTemplate: Load = {
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        status: LoadStatus.Open,
        ...loadData
    };
    setLoadToEdit(loadFromTemplate);
    setIsTemplateModalOpen(false);
    setIsModalOpen(true);
  };
  
  const filteredLoads = useMemo(() => {
    return [...loads]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter(load => {
        const client = clients.find(c => c.id === load.clientId);
        const searchMatch =
          searchTerm === '' ||
          load.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.loadingLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.unloadingLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          load.materialDescription.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter === 'all' || load.status === statusFilter;
        const priorityMatch = priorityFilter === 'all' || load.priority === priorityFilter;

        return searchMatch && statusMatch && priorityMatch;
      });
  }, [loads, clients, searchTerm, statusFilter, priorityFilter]);

  const AddLoadButton: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Add New Load
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            New Blank Load
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setIsTemplateModalOpen(true); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                            New from Template
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

  const getStatusColor = (status: LoadStatus) => {
    switch (status) {
      case LoadStatus.Completed: return 'bg-success/10 text-success';
      case LoadStatus.Cancelled: return 'bg-danger/10 text-danger';
      case LoadStatus.Open: return 'bg-primary/10 text-primary';
      default: return 'bg-warning/10 text-warning';
    }
  }

  const getPriorityColor = (priority: LoadPriority) => {
    switch (priority) {
      case LoadPriority.High: return 'bg-danger/10 text-danger';
      case LoadPriority.Medium: return 'bg-warning/10 text-warning';
      case LoadPriority.Low: return 'bg-primary/10 text-primary';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Load Management"
        actionButton={<AddLoadButton />}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="md:col-span-2">
                <label htmlFor="search-loads" className="sr-only">Search</label>
                <input
                    id="search-loads"
                    type="text"
                    placeholder="Search by ID, client, route, material..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary"
                />
            </div>
            <div>
                <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
                <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as LoadStatus | 'all')}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary"
                >
                    <option value="all">All Statuses</option>
                    {Object.values(LoadStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="priority-filter" className="sr-only">Filter by Priority</label>
                <select
                    id="priority-filter"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value as LoadPriority | 'all')}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-primary focus:border-primary"
                >
                    <option value="all">All Priorities</option>
                    {Object.values(LoadPriority).map(p => (
                        <option key={p} value={p}>{p} Priority</option>
                    ))}
                </select>
            </div>
        </div>
      </PageHeader>
      
      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {filteredLoads.map(load => (
            <div key={load.id} className="bg-white p-4 rounded-lg shadow-md border">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-dark">#{load.id.slice(-6)}</p>
                        <p className="text-sm text-medium">{getClientName(load.clientId)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-y-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(load.status)}`}>
                            {load.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(load.priority)}`}>
                            {load.priority} Priority
                        </span>
                    </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-semibold">Route:</span> {load.loadingLocation} &rarr; {load.unloadingLocation}</p>
                    <p><span className="font-semibold">Material:</span> {load.materialDescription} ({load.materialWeight} {load.weightUnit})</p>
                    <p><span className="font-semibold">Freight:</span> {formatCurrency(load.clientFreight)}</p>
                </div>
                <div className="mt-4 pt-2 border-t flex justify-end space-x-4 text-sm font-medium">
                    <button onClick={() => handleOpenModal(load)} className="text-primary hover:underline">Edit</button>
                    <button onClick={() => deleteLoad(load.id)} className="text-danger hover:underline">Delete</button>
                    <button onClick={() => handleSaveAsTemplate(load)} className="text-secondary hover:underline">Template</button>
                </div>
            </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Load ID</th>
                <th scope="col" className="px-4 py-3">Client</th>
                <th scope="col" className="px-4 py-3">Route</th>
                <th scope="col" className="px-4 py-3">Material</th>
                <th scope="col" className="px-4 py-3">Freight</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Priority</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.map(load => (
                <tr key={load.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(load.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">#{load.id.slice(-6)}</td>
                  <td className="px-4 py-3">{getClientName(load.clientId)}</td>
                  <td className="px-4 py-3">{load.loadingLocation} &rarr; {load.unloadingLocation}</td>
                  <td className="px-4 py-3">{load.materialDescription} ({load.materialWeight} {load.weightUnit})</td>
                  <td className="px-4 py-3">{formatCurrency(load.clientFreight)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(load.status)}`}>
                      {load.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(load.priority)}`}>
                      {load.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex space-x-2 text-xs">
                    <button onClick={() => handleOpenModal(load)} className="text-primary font-semibold hover:underline">Edit</button>
                    <button onClick={() => deleteLoad(load.id)} className="text-danger font-semibold hover:underline">Delete</button>
                    <button onClick={() => handleSaveAsTemplate(load)} className="text-secondary font-semibold hover:underline">Template</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={loadToEdit ? 'Edit Load' : 'Add New Load'}>
        <LoadForm logisticsState={logisticsState} onSave={handleSaveLoad} onClose={handleCloseModal} loadToEdit={loadToEdit} />
      </Modal>

      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="Create Load from Template">
          <div className="space-y-2">
            {loadTemplates.length > 0 ? loadTemplates.map(template => (
                <div key={template.id} onClick={() => handleCreateFromTemplate(template)} className="p-4 border rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="font-semibold text-primary">{template.templateName}</p>
                    <p className="text-sm text-gray-600">{template.loadingLocation} to {template.unloadingLocation} ({template.materialDescription})</p>
                </div>
            )) : <p className="text-gray-500 text-center py-4">No templates saved yet. Save a load as a template from the main list.</p>}
          </div>
      </Modal>

    </div>
  );
};

export default LoadManagement;