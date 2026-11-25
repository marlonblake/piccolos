import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import AdminSidebar from './AdminSidebar';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default function AdminLayout() {
  const token = localStorage.getItem('adminToken');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <AdminSidebar /> */}

      <div className="flex-grow p-8">
        <Outlet />
      </div>
    </div>
  );
}