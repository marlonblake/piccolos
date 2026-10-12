import React, { useState } from 'react';
import { Mail, Shield, Key } from 'lucide-react';

export default function AdminProfile() {
    const adminEmail = localStorage.getItem('adminEmail') || "admin@piccolos.lk";

    // Placeholder for future password update logic
    const [message, setMessage] = useState('');

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        setMessage("Password update endpoint coming soon.");
    };

    return (
        <div className="max-w-3xl mx-auto font-sans pb-16">
            
            <div className="mb-8 border-b border-gray-200 pb-6">
                <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Security & Access</span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">
                    Admin Profile
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage your back-office credentials.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 mb-8">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-16 h-16 bg-[#2C3E2D]/5 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-[#2C3E2D]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#2C3E2D]">System Administrator</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Active Session
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handlePasswordUpdate}>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Registered Email</label>
                        <div className="relative opacity-70 cursor-not-allowed">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="email" 
                                value={adminEmail}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                                disabled
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Update Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="password" 
                                placeholder="Enter new password" 
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
                    >
                        Update Credentials
                    </button>
                </form>

                {message && (
                    <div className="mt-6 p-4 rounded-xl text-sm font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}