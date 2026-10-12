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
    const navigate = useNavigate();

    const handleAdminLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out of the admin portal?");
        if (confirmLogout) {
            localStorage.removeItem('adminToken');
            navigate('/admin');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Global Admin Header */}
            <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2C3E2D] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold font-serif text-sm">P</span>
                    </div>
                    <span className="font-bold text-[#2C3E2D] tracking-widest uppercase text-sm">
                        Admin Portal
                    </span>
                </div>
                
                <button 
                    onClick={handleAdminLogout} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Log Out
                </button>
            </header>

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
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/pos" element={<AdminPOS />} />
                </Route>

                {/* STANDALONE ROUTES - no layout wrappers */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/menu" element={<AdminMenu />} />

            </Routes>
        </BrowserRouter>
    );
}