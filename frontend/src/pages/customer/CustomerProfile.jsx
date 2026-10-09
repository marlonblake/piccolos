import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, AlertTriangle } from 'lucide-react';

export default function CustomerProfile() {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    phoneNumber: '',
    email: '' // Display only
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();
  
  const token = localStorage.getItem('customerToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/auth/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            fname: data.fname || '',
            lname: data.lname || '',
            phoneNumber: data.phoneNumber || '',
            email: data.email || ''
          });
        } else {
          setMessage({ text: 'Failed to load profile data.', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'Network error. Is the backend running?', type: 'error' });
      }
    };

    fetchProfile();
  }, [userId, token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`http://localhost:8081/api/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fname: formData.fname,
          lname: formData.lname,
          phoneNumber: formData.phoneNumber
        }) // Explicitly excluding email if you don't allow changing it
      });

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        const errData = await response.text();
        setMessage({ text: `Update Failed: ${errData}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error during update.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:8081/api/auth/user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('userId');
          navigate('/register');
        } else {
          setMessage({ text: 'Failed to delete account.', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'Network error during deletion.', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-28 font-sans text-[#2C3E2D]">
      
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE: Image area */}
        <div className="hidden md:flex md:w-1/2 relative bg-black">
          <img 
            src="/regPic.jpg"
            alt="Piccolo's Ambiance" 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          
          <div className="absolute bottom-12 left-12 right-12 text-[#FDFBF7]">
            <h2 className="text-4xl font-['Montserrat'] font-bold uppercase mb-3 leading-tight">
              Manage your<br/>profile
            </h2>
            <p className="text-gray-300 text-sm font-medium">
              Keep your details up to date for seamless table bookings and pickup orders.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form area */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#FDFBF7]">
          <h2 className="text-4xl font-bold mb-2 uppercase font-['Montserrat'] tracking-wide">
            Account Settings
          </h2>
          <p className="text-sm text-gray-500 mb-10 font-medium">
            Update your personal information
          </p>

          <form className="space-y-5" onSubmit={handleUpdate}>
            
            {/* Email Field (Read Only) */}
            <div className="relative opacity-60 cursor-not-allowed">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                value={formData.email}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl"
                disabled
              />
            </div>

            <div className="flex gap-4">
              {/* First Name */}
              <div className="relative w-1/2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  name="fname"
                  placeholder="First Name" 
                  value={formData.fname}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="relative w-1/2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  name="lname"
                  placeholder="Last Name" 
                  value={formData.lname}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="phoneNumber"
                placeholder="Phone Number" 
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg mt-4 text-lg"
            >
              Save Changes
            </button>
          </form>

          {/* Styled Message Display */}
          {message.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-semibold text-center border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
              Danger Zone
            </span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button 
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </button>

        </div>
      </div>
    </div>
  );
}