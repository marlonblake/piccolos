import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenu from './pages/admin/AdminMenu';
import Register from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import AdminLogin from './pages/admin/AdminLogin';
import CustomerMenu from './components/CustomerMenu';
import ShoppingCart from './pages/customer/ShoppingCart';
import Home from './pages/customer/Home';
import Booking from './pages/customer/Booking';
import CustomerProfile from './pages/customer/CustomerProfile';
import AdminRegister from './pages/admin/AdminRegister';
import AdminQueue from './pages/admin/AdminQueue';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';
import AdminTables from './pages/admin/AdminTables';
import AdminReservations from './pages/admin/AdminReservations';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return !payload.exp || payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

const CustomerLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

const AdminLayout = () => {
    const token = localStorage.getItem('adminToken');

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem('adminToken');
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* CUSTOMER ROUTES */}
                <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<CustomerLogin />} />
                    <Route path="/menu" element={<CustomerMenu />} />
                    <Route path="/cart" element={<ShoppingCart />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/profile" element={<CustomerProfile />} />
                </Route>

                {/* ADMIN ROUTES */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/queue" element={<AdminQueue />} />
                    <Route path="/admin/tables" element={<AdminTables />} />
                    <Route path="/admin/reservations" element={<AdminReservations />} />
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/stats" element={<AdminReports />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* STANDALONE ROUTES */}
                <Route path="/admin" element={<AdminLogin />} />
            </Routes>
        </BrowserRouter>
    );
}