import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Utensils, 
  UserCheck, 
  ShoppingBag, 
  Calendar, 
  BarChart3, 
  ArrowRight,
  Clock,
  Users
} from "lucide-react";

function AdminDashboard() {
    const navigate = useNavigate();
    
    // 1. State to hold your live database numbers
    const [liveStats, setLiveStats] = useState({
        activeAdmins: 0,
        registeredCustomers: 0,
        activeOrders: 0,
        activeMenuItems: 0
    });

    // 2. Fetch the real stats when the dashboard loads
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Retrieve the admin token you saved during login
                const token = localStorage.getItem('adminToken'); // Ensure this matches your AdminLogin storage key
                
                const response = await fetch('http://localhost:8081/api/admin/stats', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setLiveStats(data);
                } else {
                    console.error("Server rejected the request. Status:", response.status);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };

        fetchStats();
    }, []);

    // 3. Map the live data to your UI cards
    const statsArray = [
        { label: "Active Admins", value: liveStats.activeAdmins, icon: <Users className="w-5 h-5 text-[#D45D3C]" /> },
        { label: "Registered Customers", value: liveStats.registeredCustomers, icon: <UserCheck className="w-5 h-5 text-[#D45D3C]" /> },
        { label: "Active Orders", value: liveStats.activeOrders, icon: <Clock className="w-5 h-5 text-[#D45D3C]" /> },
        { label: "Menu Items", value: liveStats.activeMenuItems, icon: <Utensils className="w-5 h-5 text-[#D45D3C]" /> }
    ];

    const cards = [
        {
            title: "Menu Management",
            description: "Add, edit, and remove menu items.",
            icon: <Utensils className="w-8 h-8 text-[#2C3E2D]" />,
            path: "/admin/menu",
            ready: true,
            status: "ACTIVE"
        },
        {
            title: "Manage Admins",
            description: "Register and control backend staff access.",
            icon: <UserCheck className="w-8 h-8 text-[#2C3E2D]" />,
            path: "/admin/register",
            ready: true,
            status: "ACTIVE"
        },
        {
            title: "Order Queue & POS",
            description: "View and manage incoming orders in real-time.",
            icon: <ShoppingBag className="w-8 h-8 text-gray-400" />,
            path: "/admin/orders",
            ready: false,
            status: "COMING SOON"
        },
        {
            title: "Table Reservations",
            description: "Manage physical seating and check bookings.",
            icon: <Calendar className="w-8 h-8 text-gray-400" />,
            path: "/admin/reservations",
            ready: false,
            status: "COMING SOON"
        },
        {
            title: "Stats & Reports",
            description: "View revenue patterns and portal activity stats.",
            icon: <BarChart3 className="w-8 h-8 text-gray-400" />,
            path: "/admin/stats",
            ready: false,
            status: "COMING SOON"
        }
    ];

    const handleClick = (card) => {
        if (card.ready) {
            navigate(card.path);
        } else {
            alert(`${card.title} isn't built yet — coming soon.`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] pt-12 pb-16 px-4 sm:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                
                <div className="mb-8 border-b border-[#2C3E2D]/10 pb-6">
                    <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Back-of-House Control</span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">
                        Admin Dashboard
                    </h1>
                    <p className="text-[#2C3E2D]/60 text-sm mt-1">Piccolo's Pizzeria & Café Management</p>
                </div>

                <h3 className="text-sm uppercase tracking-widest font-bold text-[#2C3E2D] mb-4">Live Database Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {statsArray.map((stat) => (
                        <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#2C3E2D]/60 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-[#2C3E2D] mt-1">{stat.value}</p>
                            </div>
                            <div className="bg-[#D45D3C]/5 p-3 rounded-lg">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="text-sm uppercase tracking-widest font-bold text-[#2C3E2D] mb-4">Management Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <button
                            key={card.title}
                            onClick={() => handleClick(card)}
                            className={`relative text-left bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[220px] group
                                ${card.ready ? "" : "opacity-75 cursor-not-allowed bg-gray-50/50"}`}
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${card.ready ? 'bg-[#2C3E2D]/5' : 'bg-gray-100'}`}>
                                        {card.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                                        card.ready 
                                          ? 'bg-green-50 text-green-700 border border-green-100' 
                                          : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {card.status}
                                    </span>
                                </div>

                                <h2 className="font-serif text-lg font-bold text-[#2C3E2D] mb-2 group-hover:text-[#D45D3C] transition-colors">
                                    {card.title}
                                </h2>
                                <p className="text-sm text-[#2C3E2D]/60 leading-relaxed">{card.description}</p>
                            </div>

                            <div className={`mt-6 pt-4 border-t border-gray-50 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${
                                card.ready ? 'text-[#D45D3C] group-hover:gap-2' : 'text-gray-400'
                            } transition-all`}>
                                {card.ready ? "Open" : "Coming Soon"} 
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;