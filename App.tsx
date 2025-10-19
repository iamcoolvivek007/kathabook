import React, { useState } from 'react';
import type { View } from './types';
import { useLogisticsState } from './hooks/useLogisticsState';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LoadManagement from './components/LoadManagement';
import FleetManagement from './components/FleetManagement';
import TripManagement from './components/TripManagement';
import TransactionManagement from './components/TransactionManagement';
import Reporting from './components/Reporting';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const logisticsState = useLogisticsState();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard logisticsState={logisticsState} setCurrentView={setCurrentView} />;
      case 'loads':
        return <LoadManagement logisticsState={logisticsState} />;
      case 'fleet':
        return <FleetManagement logisticsState={logisticsState} />;
      case 'trips':
        return <TripManagement logisticsState={logisticsState} />;
      case 'transactions':
        return <TransactionManagement logisticsState={logisticsState} />;
      case 'reports':
        return <Reporting logisticsState={logisticsState} />;
      default:
        return <Dashboard logisticsState={logisticsState} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-light text-dark">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;