import { MapPin, Phone } from 'lucide-react';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#2C3E2D] text-[#FDFBF7]/80 py-12 px-4 font-sans" id="contact">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Column 1: Brand & Services */}
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-3xl font-serif font-bold text-white mb-2">Piccolo&apos;s</h2>
          <p className="font-medium text-white mb-1">Italian | Chinese | BYOB</p>
          <p className="mb-6 text-sm text-[#FDFBF7]/70">Dine-in, Pick Up, Delivery & Uber Eats</p>
          
          <div className="flex space-x-5">
            <a href="https://www.facebook.com/piccoloslk/" target="_blank" rel="noreferrer" className="text-[#FDFBF7]/80 hover:text-white hover:scale-110 transition-all">
                <FaFacebook className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/piccoloslk" target="_blank" rel="noreferrer" className="text-[#FDFBF7]/80 hover:text-white hover:scale-110 transition-all">
                <FaInstagram className="w-6 h-6" />
            </a>
            <a href="https://www.tiktok.com/@piccoloslk" target="_blank" rel="noreferrer" className="text-[#FDFBF7]/80 hover:text-white hover:scale-110 transition-all">
                <FaTiktok className="w-6 h-6" />
            </a>
          </div>
        </div>
        
        {/* Column 2: Location */}
        <div className="flex flex-col items-center md:items-start mt-4 md:mt-0">
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Location</h4>
          <p className="mb-1 text-[#FDFBF7]/90">No. 103, Battaramulla-Pannipitiya Road,</p>
          <p className="mb-5 text-[#FDFBF7]/90">Depanama, Pannipitiya</p>
          
          <a 
            href="https://maps.app.goo.gl/7cUonD2tVStDSx1e9" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D45D3C] hover:bg-[#B84A2E] text-white rounded-full text-sm font-semibold transition-all shadow-md"
          >
            <MapPin className="w-4 h-4" />
            Open in Maps
          </a>
        </div>
        
        {/* Column 3: Hours & Contact */}
        <div className="flex flex-col items-center md:items-start mt-4 md:mt-0">
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hours & Contact</h4>
          <p className="mb-4">Mon - Sun: 12:00 PM - 12:00 AM</p>
          
          <a 
            href="tel:0703455455" 
            className="inline-flex items-center gap-2 text-white hover:text-[#D45D3C] transition-colors text-xl font-medium mt-1"
          >
            <Phone className="w-5 h-5" />
            070 3 455 455
          </a>
        </div>
        
      </div>
      
      <div className="mt-12 pt-8 border-t border-[#FDFBF7]/20 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Piccolo&apos;s Pizzeria. All rights reserved.</p>
      </div>
    </footer>
  );
}