import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { ShoppingBag, HeartPulse, Stethoscope, Wrench, Store, Fuel, Menu, X, LayoutDashboard } from 'lucide-react';

const SidebarItem = ({ icon, text, path, active }) => (
  <Link 
    to={path} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </Link>
);

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
