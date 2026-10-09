import React from 'react';
import { Outlet } from 'react-router-dom';
// import AdminSidebar from './AdminSidebar'; 

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <AdminSidebar /> */}
      
      <div className="flex-grow p-8">
        <Outlet /> {/* Renders your admin pages (e.g., Manage Users, View Orders) */}
      </div>
    </div>
  );
}