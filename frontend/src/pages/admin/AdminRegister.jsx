import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      // Retrieve the admin token you saved during admin login
      const token = localStorage.getItem('adminToken'); 
        
      const response = await fetch('http://localhost:8081/api/auth/admin/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        setMessage({ text: 'Staff account created successfully!', type: 'success' });
        setEmail('');
        setPassword('');
        // Optional: automatically send them back to the dashboard after 2 seconds
        // setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else {
        const errData = await response.text();
        setMessage({ text: `Failed: ${errData}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Is the backend running?', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-sans">
      
      {/* Navigation Header */}
      <div className="mb-8">
        <Link 
            to="/admin/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3E2D]/60 hover:text-[#D45D3C] transition-colors uppercase tracking-widest mb-4"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">
            Register Admin
        </h1>
        <p className="text-[#2C3E2D]/60 text-sm">Provision a new back-of-house staff account.</p>
      </div>

      {/* Registration Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        
        <div className="flex justify-center mb-8">
            <div className="bg-[#2C3E2D]/5 p-4 rounded-full">
                <ShieldCheck className="w-10 h-10 text-[#2C3E2D]" />
            </div>
        </div>

        <form className="space-y-6" onSubmit={handleRegister}>
          
          <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Staff Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  placeholder="manager@piccolos.lk" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2D] focus:ring-1 focus:ring-[#2C3E2D] transition-all"
                  required
                />
              </div>
          </div>

          <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Temporary Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  placeholder="Secure Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2D] focus:ring-1 focus:ring-[#2C3E2D] transition-all"
                  required
                />
              </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#2C3E2D] hover:bg-[#1A251B] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg mt-2 text-lg"
          >
            Provision Account
          </button>
        </form>

        {/* Message Banner */}
        {message.text && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-semibold text-center border ${
                message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
                {message.text}
            </div>
        )}

      </div>
    </div>
  );
}