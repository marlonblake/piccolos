import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

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

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
        <div className="flex min-h-screen bg-gray-100">
            {/* You can drop an <AdminSidebar /> here later if you build one */}
            <main className="flex-grow p-8">
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
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                </Route>

                {/* STANDALONE ROUTE - No layout wrappers (perfect for a clean login screen) */}
                <Route path="/admin" element={<AdminLogin />} />

            </Routes>
        </BrowserRouter>
    );
}