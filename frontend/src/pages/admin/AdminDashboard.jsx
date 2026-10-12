import React, { useState, useEffect } from "react";
import { 
  Utensils, UserCheck, Clock, Users, DollarSign, TrendingUp, PieChart as PieChartIcon
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        topStats: { activeAdmins: 0, registeredCustomers: 0, activeOrders: 0, activeMenuItems: 0 },
        revenueData: [],
        orderTypeData: [],
        categoryData: [],
        financialSummary: { cash: 0, card: 0, total: 0 }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken'); 
                const response = await fetch('http://localhost:8081/api/admin/full-stats', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };

        fetchStats();
    }, []);

    const COLORS = ['#D45D3C', '#2C3E2D', '#8C9B8D', '#E2A089', '#F4A261'];

    const topStatsArray = [
        { label: "Active Admins", value: dashboardData.topStats.activeAdmins, icon: <Users className="w-5 h-5 text-[#D45D3C]" /> },
        { label: "Registered Customers", value: dashboardData.topStats.registeredCustomers, icon: <UserCheck className="w-5 h-5 text-[#D45D3C]" /> },
        { label: "Total Orders", value: dashboardData.topStats.activeOrders, icon: <Clock className="w-5 h-5 text-[#D45D3C]" /> },
        { label: "Menu Items", value: dashboardData.topStats.activeMenuItems, icon: <Utensils className="w-5 h-5 text-[#D45D3C]" /> }
    ];

    // Format utility for currency
    const formatRs = (value) => `Rs. ${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    return (
        <div className="font-sans">
            <div className="max-w-7xl mx-auto">
                
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Analytics & Reports</span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time performance metrics pulled from live database.</p>
                </div>

                {/* Top Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {topStatsArray.map((stat) => (
                        <div key={stat.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold text-[#2C3E2D] mt-1">{stat.value}</p>
                            </div>
                            <div className="bg-[#D45D3C]/10 p-3 rounded-xl">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Line Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-[#2C3E2D] text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#D45D3C]" /> Revenue Timeline
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Gross sales segmented by day</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Sales</p>
                                <p className="text-2xl font-bold text-[#D45D3C]">{formatRs(dashboardData.financialSummary.total)}</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData.revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `${value}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [formatRs(value), 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#D45D3C" strokeWidth={3} dot={{r: 4, fill: '#D45D3C', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Types Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="font-bold text-[#2C3E2D] text-lg flex items-center gap-2 mb-2">
                            <PieChartIcon className="w-5 h-5 text-[#D45D3C]" /> Fulfillment Methods
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Dine-in vs Pickup volume</p>
                        
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dashboardData.orderTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {dashboardData.orderTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Sales Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#2C3E2D] text-lg flex items-center gap-2 mb-2">
                            <Utensils className="w-5 h-5 text-[#D45D3C]" /> Top Selling Categories
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Volume of items ordered by menu category</p>
                        
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData.categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 500}} width={90} />
                                    <Tooltip 
                                        cursor={{fill: '#f9fafb'}}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="sales" fill="#2C3E2D" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-[#2C3E2D] p-8 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <DollarSign className="w-32 h-32" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold mb-2">Revenue Ledger</h3>
                        <p className="text-white/60 text-sm mb-8">Aggregated from completed invoices and payments.</p>
                        
                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/50">Total Cash Received</p>
                                <p className="text-3xl font-bold text-[#D45D3C] mt-1">{formatRs(dashboardData.financialSummary.cash)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/50">Total Card Received</p>
                                <p className="text-3xl font-bold text-[#D45D3C] mt-1">{formatRs(dashboardData.financialSummary.card)}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-sm font-bold uppercase tracking-widest text-white/80">Net Earnings (All Time)</p>
                                <p className="text-4xl font-bold mt-1">{formatRs(dashboardData.financialSummary.total)}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;