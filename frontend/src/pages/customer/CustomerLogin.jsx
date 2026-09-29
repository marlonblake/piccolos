import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function CustomerLogin() {
  // Your original state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  // Your original login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    
    try {
      // Your exact Spring Boot endpoint
      const response = await fetch('http://localhost:8081/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.text();

      if (response.ok) {
        // 1. Save the JWT token to Local Storage
        localStorage.setItem('customerToken', data);
        
        // 2. Redirect the user to the home page
        navigate('/'); 
      } else {
        setMessage(`Login Failed: ${data}`);
      }
    } catch (error) {
      setMessage("Network error. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-28 font-sans text-[#2C3E2D]">
      
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE: Image area */}
        <div className="hidden md:flex md:w-1/2 relative bg-black">
          <img 
            src="/loginPic.jpg" 
            alt="Piccolo's Ambiance" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute bottom-12 left-12 right-12 text-[#FDFBF7]">
            <h2 className="text-4xl font-['Montserrat'] font-bold uppercase mb-3 leading-tight">
              Sign in to<br/>your craving!
            </h2>
            <p className="text-gray-300 text-sm font-medium">
              Experience authentic flavors and seamless dining.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form area */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#FDFBF7]">
          <h2 className="text-4xl font-bold mb-2 uppercase font-['Montserrat'] tracking-wide">
            Sign In
          </h2>
          <p className="text-sm text-gray-500 mb-10 font-medium">
            Sign in with email address
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                placeholder="Yourname@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg mt-4 text-lg"
            >
              Sign in
            </button>
          </form>

          {/* Styled Error Message Display */}
          {message && (
              <div className="mt-4 p-3 rounded-lg text-sm font-semibold text-center border bg-red-50 text-red-600 border-red-200">
                  {message}
              </div>
          )}

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="flex gap-4 mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <FcGoogle className="w-5 h-5" />
              <span className="text-sm font-semibold">Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-colors shadow-sm">
              <FaFacebook className="w-5 h-5" />
              <span className="text-sm font-semibold">Facebook</span>
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 mb-6">
            By registering you with our <a href="#" className="text-[#D45D3C] hover:underline">Terms and Conditions</a>
          </p>
          
          <p className="text-sm text-center text-gray-600 font-medium">
            Don't have an account? <Link to="/register" className="text-[#D45D3C] font-bold hover:underline">Sign up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}