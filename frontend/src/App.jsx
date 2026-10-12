import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

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
import AdminPOS from './pages/admin/AdminPOS';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

// 1. Create a Customer Layout that includes the Navbar and Footer
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

// 2. Create an Admin Layout that excludes the customer Navbar/Footer
const AdminLayout = () => {
    return (
        // flex row prevents the sidebar from stacking on top of the content
        // h-screen and overflow-hidden lock the outer window size
        <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
            
            {/* Persistent Collapsible Sidebar */}
            <AdminSidebar /> 
            
            {/* The main content area scrolls independently of the sidebar */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet /> {/* Admin pages will inject here */}
            </main>
            
        </div>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* CUSTOMER ROUTES - Wrapped in CustomerLayout */}
                <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<CustomerLogin />} />
                    <Route path="/menu" element={<CustomerMenu />} />
                    <Route path="/cart" element={<ShoppingCart />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/profile" element={<CustomerProfile />} />
                </Route>

                {/* ADMIN ROUTES - Wrapped in AdminLayout */}
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/pos" element={<AdminPOS />} />
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/stats" element={<AdminReports />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* STANDALONE ROUTES - no layout wrappers */}
                <Route path="/admin" element={<AdminLogin />} />
                

            </Routes>
        </BrowserRouter>
    );
}