import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Utensils, 
    UserCheck, 
    ShoppingBag, 
    Calendar, 
    BarChart3, 
    LogOut, 
    Menu, 
    ChevronLeft,
    User
} from 'lucide-react';

export default function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            localStorage.removeItem('adminToken');
            navigate('/admin');
        }
    };

    // Helper function to style active links
    const navLinkClass = ({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold
        ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}
        ${isCollapsed ? 'justify-center' : ''}
    `;

    return (
        <aside 
            className={`flex flex-col bg-[#D45D3C] text-white transition-all duration-300 ease-in-out h-screen shadow-2xl ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Header / Logo Area */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-serif font-bold text-white mb-2">Piccolo&apos;s</h2>
                    </div>
                )}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                    {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
                
                {/* GENERAL SECTION */}
                <div>
                    {!isCollapsed && <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">General</p>}
                    <ul className="space-y-2">
                        <li>
                            <NavLink to="/admin/dashboard" end className={navLinkClass}>
                                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Dashboard</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/menu" className={navLinkClass}>
                                <Utensils className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Menu Management</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/pos" className={navLinkClass}>
                                <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Orders & POS</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/reservations" className={navLinkClass}>
                                <Calendar className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Reservations</span>}
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* ACCOUNT / SETTINGS SECTION */}
                <div>
                    {!isCollapsed && <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Management</p>}
                    <ul className="space-y-2">
                        <li>
                            <NavLink to="/admin/stats" className={navLinkClass}>
                                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Stats & Reports</span>}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/register" className={navLinkClass}>
                                <UserCheck className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>Manage Admins</span>}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Footer / Profile & Logout */}
            <div className="p-4 border-t border-white/10 bg-black/10">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2 mb-4'}`}>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">Active Admin</p>
                            <p className="text-xs text-white/60 truncate">System Access</p>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold text-white/80 hover:bg-white/10 hover:text-white mt-2
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="Logout"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}