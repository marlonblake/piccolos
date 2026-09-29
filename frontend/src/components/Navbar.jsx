import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;
  
  // Check if we are on the home page. 
  const isHome = location.pathname === '/';
  
  // The navbar should be solid if we are NOT on the home page, OR if we have scrolled down.
  const isSolidMode = !isHome || isScrolled;

  // Apply backgrounds based on the new isSolidMode rule
  const navBackground = isSolidMode 
    ? 'bg-gradient-to-r from-[#8e2420] to-[#d45532] shadow-lg' 
    : 'bg-gradient-to-b from-black/80 to-transparent';

  const textColors = 'text-[#FDFBF7]'; 
  const hoverText = 'hover:text-gray-300';
  
  const linkBaseClass = `uppercase tracking-[0.15em] text-sm font-semibold pb-1 border-b-2 transition-all ${textColors}`;
  const activeClass = "border-[#FDFBF7]";
  const inactiveClass = `border-transparent ${hoverText}`;

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
            
            {/* Right Text Links */}
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
                to="/login" 
                className={`w-11 h-11 rounded-full border border-[#FDFBF7]/30 flex items-center justify-center ${textColors} hover:border-[#FDFBF7] transition-colors`}
                title="Log In / Register"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
              
              <Link 
                to="/cart" 
                className={`w-11 h-11 rounded-full border border-[#FDFBF7]/30 flex items-center justify-center ${textColors} hover:border-[#FDFBF7] transition-colors relative`}
                title="Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
              </Link>
            </div>
            
          </div>
        </div>

        {/* MOBILE LAYOUT */}
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
            <Link to="/login" className={`${textColors}`}>
              <User size={24} />
            </Link>
            <Link to="/cart" className={`${textColors}`}>
              <ShoppingBag size={24} />
            </Link>
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