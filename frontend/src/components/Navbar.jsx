import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('piccolos_cart')) || [];
      const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(totalItems);
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    const token = localStorage.getItem('customerToken');
    setIsLoggedIn(!!token);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/'); 
  };

  const isActive = (path) => location.pathname === path;
  const isHome = location.pathname === '/';
  const isSolidMode = !isHome || isScrolled;

  const navBackground = isSolidMode
      ? 'bg-gradient-to-r from-[#8e2420] to-[#d45532] shadow-lg'
      : 'bg-gradient-to-b from-black/80 to-transparent';

  const textColors = 'text-[#FDFBF7]';
  const hoverText = 'hover:text-gray-300';
  const linkBaseClass = `uppercase tracking-[0.15em] text-sm font-semibold pb-1 border-b-2 transition-all ${textColors}`;
  const activeClass = "border-[#FDFBF7]";
  const inactiveClass = `border-transparent ${hoverText}`;

  const userIconPath = isLoggedIn ? "/profile" : "/login";
  const userIconTitle = isLoggedIn ? "My Profile" : "Log In / Register";

  return (
      <nav className={`fixed w-full top-0 z-50 transition-all duration-500 font-sans ${navBackground}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* DESKTOP LAYOUT */}
          <div className={`hidden lg:flex justify-between items-center transition-all duration-300 ${isSolidMode ? 'h-20' : 'h-28'}`}>

            {/* Left Navigation Links */}
            <div className="flex-1 flex justify-end space-x-10 pr-12">
              <Link to="/" className={`${linkBaseClass} ${isActive('/') ? activeClass : inactiveClass}`}>
                Home
              </Link>
              <Link to="/menu" className={`${linkBaseClass} ${isActive('/menu') ? activeClass : inactiveClass}`}>
                Menu
              </Link>
            </div>

            {/* Centered Circular Logo */}
            <div className="flex-shrink-0 flex justify-center mt-2">
              <Link to="/" className="block transition-transform hover:scale-105 shadow-xl rounded-full">
                <img
                    src="/Logo.png"
                    alt="Piccolo's Pizzeria Logo"
                    className={`rounded-full object-cover transition-all duration-300 ${isSolidMode ? 'h-14 w-14' : 'h-20 w-20 xl:h-24 xl:w-24'}`}
                />
              </Link>
            </div>

            {/* Right Navigation Links & Icons */}
            <div className="flex-1 flex justify-between items-center pl-12">
              <div className="flex space-x-10">
                <a href="/#about" className={`${linkBaseClass} ${inactiveClass}`}>
                  About
                </a>
                <a href="/#contact" className={`${linkBaseClass} ${inactiveClass}`}>
                  Contact
                </a>
              </div>

              {/* Far Right: Divider & Icons */}
              <div className="flex items-center space-x-4">
                <div className="w-px h-8 bg-[#FDFBF7]/30 mr-2"></div>

                <Link
                    to={userIconPath}
                    className={`w-11 h-11 rounded-full border border-[#FDFBF7]/30 flex items-center justify-center ${textColors} hover:border-[#FDFBF7] transition-colors`}
                    title={userIconTitle}
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>

                <Link
                    to="/cart"
                    className={`w-11 h-11 rounded-full border border-[#FDFBF7]/30 flex items-center justify-center ${textColors} hover:border-[#FDFBF7] transition-colors relative`}
                    title="Cart"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                  )}
                </Link>

                {isLoggedIn && (
                  <button 
                    onClick={handleLogout} 
                    className="w-11 h-11 rounded-full border border-red-400/50 flex items-center justify-center text-red-400 hover:text-red-300 hover:border-red-300 transition-colors ml-2" 
                    title="Log Out"
                  >
                    <LogOut size={20} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE LAYOUT & MINIMIZED DESKTOP LAYOUT */}
          <div className="lg:hidden flex justify-between items-center h-20">
            <div className="flex-shrink-0 mt-1">
              <Link to="/" className="rounded-full shadow-md block">
                <img
                    src="/Logo.png"
                    alt="Piccolo's Pizzeria Logo"
                    className="h-12 w-12 rounded-full object-cover"
                />
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link to={userIconPath} className={`${textColors}`} title={userIconTitle}>
                <User size={24} />
              </Link>
              
              <Link to="/cart" className={`${textColors} relative`}>
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
                )}
              </Link>

              {isLoggedIn && (
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors" title="Log Out">
                  <LogOut size={24} />
                </button>
              )}

              <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`${textColors} ml-2`}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-[#FDFBF7] border-t border-gray-200 shadow-md">
              <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col items-center">
                <Link to="/" className="block py-3 uppercase tracking-widest text-sm font-semibold text-[#2C3E2D] hover:text-[#D45D3C]" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link to="/menu" className="block py-3 uppercase tracking-widest text-sm font-semibold text-[#2C3E2D] hover:text-[#D45D3C]" onClick={() => setIsMobileMenuOpen(false)}>Menu</Link>
                <a href="/#about" className="block py-3 uppercase tracking-widest text-sm font-semibold text-[#2C3E2D] hover:text-[#D45D3C]" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                <a href="/#contact" className="block py-3 uppercase tracking-widest text-sm font-semibold text-[#2C3E2D] hover:text-[#D45D3C]" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
              </div>
            </div>
        )}
      </nav>
  );
}