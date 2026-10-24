import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import Register from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import AdminLogin from './pages/admin/AdminLogin';
import ShoppingCart from './pages/customer/ShoppingCart';
import Home from './pages/customer/Home';
import Booking from './pages/customer/Booking';
import CustomerProfile from './pages/customer/CustomerProfile';
import AdminRegister from './pages/admin/AdminRegister';
import AdminPOS from './pages/admin/AdminPOS';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';
import AdminTables from './pages/admin/AdminTables';
import AdminReservations from './pages/admin/AdminReservations';
import ComingSoon from './components/ComingSoon';

// Components
import CustomerMenu from './components/CustomerMenu';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

// 1. Customer Layout
const CustomerLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-grow">
                <Outlet /> {/* Customer pages will inject here */}
            </main>
            <Footer />
        </div>
    );
};

// 2. Admin Layout (Commented out until development is finished)
/*
const AdminLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
            <AdminSidebar /> 
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};
*/

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* CUSTOMER ROUTES - Wrapped in CustomerLayout */}
                <Route element={<CustomerLayout />}>
                    {/* Active Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<CustomerLogin />} />
                    <Route path="/menu" element={<CustomerMenu />} />
                    <Route path="/profile" element={<CustomerProfile />} />

                    {/* Under Development Routes -> Redirected to ComingSoon */}
                    <Route path="/cart" element={<ComingSoon />} />
                    <Route path="/booking" element={<ComingSoon />} />
                </Route>

                {/* ADMIN ROUTES -> Redirected to ComingSoon */}
                {/* The '/*' catches all paths starting with /admin (e.g., /admin, /admin/dashboard) */}
                <Route path="/admin/*" element={<ComingSoon />} />

                {/* 
                ========================================================
                REAL ADMIN ROUTES - KEEP COMMENTED OUT UNTIL READY
                ========================================================
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/pos" element={<AdminPOS />} />
                    <Route path="/admin/tables" element={<AdminTables />} />
                    <Route path="/admin/reservations" element={<AdminReservations />} />
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/stats" element={<AdminReports />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>
                <Route path="/admin" element={<AdminLogin />} />
                */}

            </Routes>
        </BrowserRouter>
    );
}