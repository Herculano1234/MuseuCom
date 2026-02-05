import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './components/UserSidebar';
import UserNavbar from './components/UserNavbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  const toggleSidebar = () => setSidebarOpen(open => !open);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCompact = () => setCompact(c => !c);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserSidebar isOpen={sidebarOpen} onClose={closeSidebar} onToggleCompact={toggleCompact} />
      <div className={`lg:pl-64 transition-all`}>
        <UserNavbar onToggleSidebar={toggleSidebar} />
        <main className="pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
