import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NotificationToast from './components/NotificationToast';

// Pages
import OverviewPage from './pages/OverviewPage';
import MenuPage from './pages/MenuPage';
import PricingPage from './pages/PricingPage';
import MembersPage from './pages/MembersPage';
import RebatePage from './pages/RebatePage';
import BillingPage from './pages/BillingPage';
import AttendanceScannerPage from './pages/AttendanceScannerPage';
import FeedbackPage from './pages/FeedbackPage';
import NoticesPage from './pages/NoticesPage';

function MainApp() {
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useAuth();

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage setActivePage={setActivePage} />;
      case 'menu':
        return <MenuPage />;
      case 'pricing':
        return <PricingPage />;
      case 'members':
        return <MembersPage />;
      case 'rebate':
        return <RebatePage />;
      case 'billing':
        return <BillingPage />;
      case 'attendance':
        return <AttendanceScannerPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'notices':
        return <NoticesPage />;
      default:
        return <OverviewPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 min-w-0 transition-all">
          {renderPage()}
        </main>
      </div>

      {/* Toast Notification Container */}
      <NotificationToast toast={toast} onClose={() => {}} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
