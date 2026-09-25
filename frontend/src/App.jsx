import AdminMenu from './pages/admin/AdminMenu';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Register from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import AdminLogin from './pages/admin/AdminLogin';
import CustomerMenu from './components/CustomerMenu';
import ShoppingCart from './pages/customer/ShoppingCart';
import Home from './pages/customer/Home';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[#FDFBF7]">

                <Navbar />

                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<CustomerLogin />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/menu" element={<AdminMenu />} />
                        <Route path="/menu" element={<CustomerMenu />} />
                        <Route path="/cart" element={<ShoppingCart />} />
                    </Routes>
                </main>

                <Footer />

            </div>
        </BrowserRouter>
    );
}