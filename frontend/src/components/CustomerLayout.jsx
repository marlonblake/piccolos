import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer'; // Assuming you have a Footer component

export default function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Outlet is where the specific page content (like Home, Login, Profile) gets injected */}
      <main className="flex-grow">
        <Outlet /> 
      </main>
      
      <Footer />
    </div>
  );
}