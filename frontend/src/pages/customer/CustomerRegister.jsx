import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function Register() {
    // --- YOUR EXISTING BACKEND LOGIC ---
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        try {
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.text(); 

            if (response.ok) {
                setMessage(`Success: ${data}`);
                setFormData({ fname: '', lname: '', email: '', password: '', phoneNumber: '' });
            } else {
                setMessage(`Error: ${data}`);
            }
        } catch (error) {
            setMessage("Network error. Is your Spring Boot backend running?");
        }
    };
    // ------------------------------------

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-28 font-sans text-[#2C3E2D]">
            
            {/* Main Card Container */}
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                
                {/* LEFT SIDE: Image area */}
                <div className="hidden md:flex md:w-1/2 relative bg-black">
                    <img 
                        src="/regPic.jpg" 
                        alt="Piccolo's Ambiance" 
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    <div className="absolute bottom-12 left-12 right-12 text-[#FDFBF7]">
                        <h2 className="text-4xl font-['Montserrat'] font-bold uppercase mb-3 leading-tight">
                            Join the<br/>Family!
                        </h2>
                        <p className="text-gray-300 text-sm font-medium">
                            Create an account to skip the line and save your favorite orders.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE: Form area */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[#FDFBF7]">
                    <h2 className="text-4xl font-bold mb-2 uppercase font-['Montserrat'] tracking-wide">
                        Sign Up
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 font-medium">
                        Create an account with your details
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        
                        {/* Name Fields (Side by Side) */}
                        <div className="flex gap-4">
                            <div className="relative w-1/2">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" name="fname" placeholder="First Name" required
                                    value={formData.fname} onChange={handleChange} 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm text-sm"
                                />
                            </div>
                            <div className="relative w-1/2">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" name="lname" placeholder="Last Name" required
                                    value={formData.lname} onChange={handleChange} 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm text-sm"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="email" name="email" placeholder="Email Address" required
                                value={formData.email} onChange={handleChange} 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm text-sm"
                            />
                        </div>

                        {/* Phone Number Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="tel" name="phoneNumber" placeholder="Phone Number" required
                                value={formData.phoneNumber} onChange={handleChange} 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm text-sm"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="password" name="password" placeholder="Password" required
                                value={formData.password} onChange={handleChange} 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all shadow-sm text-sm"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg mt-2 text-lg"
                        >
                            Create Account
                        </button>
                    </form>

                    {/* Backend Message Display */}
                    {message && (
                        <div className={`mt-4 p-3 rounded-lg text-sm font-semibold text-center border ${
                            message.startsWith('Error') || message.startsWith('Network') 
                                ? 'bg-red-50 text-red-600 border-red-200' 
                                : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Or continue with
                        </span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4 mb-6">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <FcGoogle className="w-5 h-5" />
                            <span className="text-sm font-semibold">Google</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-colors shadow-sm">
                            <FaFacebook className="w-5 h-5" />
                            <span className="text-sm font-semibold">Facebook</span>
                        </button>
                    </div>
                    
                    {/* Toggle to Login Page */}
                    <p className="text-sm text-center text-gray-600 font-medium">
                        Already have an account? <Link to="/login" className="text-[#D45D3C] font-bold hover:underline">Sign in</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}