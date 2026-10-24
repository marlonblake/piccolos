import React, { useState, useEffect, useRef } from "react";
import { Download, Calendar as CalendarIcon, FileText } from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export default function AdminReports() {
    const reportRef = useRef();
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [dashboardData, setDashboardData] = useState({
        topStats: { activeAdmins: 0, registeredCustomers: 0, activeOrders: 0, activeMenuItems: 0 },
        revenueData: [],
        orderTypeData: [],
        categoryData: [],
        financialSummary: { cash: 0, card: 0, total: 0 },
        recentPayments: [] // Added to state
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken'); 
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/full-stats`, {
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

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        const element = reportRef.current;
        
        try {
            const canvas = await html2canvas(element, { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Piccolos_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const COLORS = ['#D45D3C', '#2C3E2D', '#8C9B8D', '#E2A089', '#F4A261'];
    const formatRs = (value) => `Rs. ${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    return (
        <div className="font-sans max-w-6xl mx-auto pb-16">
            
            <div className="mb-8 border-b border-gray-200 pb-6 flex justify-between items-end">
                <div>
                    <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Business Intelligence</span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">
                        Analytics & Reports
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review live metrics and export formal PDF documents.</p>
                </div>
                
                <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm text-white ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D45D3C] hover:bg-[#B84A2E]'}`}
                >
                    <Download className="w-5 h-5" />
                    {isGenerating ? "Compiling PDF..." : "Download PDF Report"}
                </button>
            </div>

            {/* Standard Dashboard Card Style for the Report Area */}
            <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    
                {/* Header inside the exportable area */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2C3E2D] text-white rounded-full flex items-center justify-center font-serif font-bold text-xl">
                            P
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-serif text-[#2C3E2D]">Piccolo's Pizzeria</h2>
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-0.5">Official Executive Summary</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-end gap-1"><CalendarIcon className="w-3.5 h-3.5"/> Generated On</p>
                        <p className="text-[#2C3E2D] font-bold mt-1 text-sm">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Cash</p>
                        <p className="text-2xl font-bold text-[#2C3E2D]">{formatRs(dashboardData.financialSummary.cash)}</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Card</p>
                        <p className="text-2xl font-bold text-[#2C3E2D]">{formatRs(dashboardData.financialSummary.card)}</p>
                    </div>
                    <div className="bg-[#2C3E2D] p-5 rounded-xl text-white shadow-sm">
                        <p className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Net Earnings</p>
                        <p className="text-2xl font-bold">{formatRs(dashboardData.financialSummary.total)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div>
                        <h3 className="font-bold text-[#2C3E2D] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#D45D3C]"/> Revenue Timeline</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData.revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <Line type="monotone" dataKey="revenue" stroke="#D45D3C" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-[#2C3E2D] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#D45D3C]"/> Category Performance</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData.categoryData} layout="vertical" margin={{left: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" tick={{fontSize: 12, fontWeight: 500, fill: '#374151'}} axisLine={false} tickLine={false} />
                                    <Bar dataKey="sales" fill="#2C3E2D" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Past Payments Table */}
                <div className="mb-4">
                    <h3 className="font-bold text-[#2C3E2D] mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#D45D3C]"/> Recent Payment Ledger
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Invoice ID</th>
                                    <th className="border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                                    <th className="border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Method</th>
                                    <th className="border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
                                    dashboardData.recentPayments.map((payment, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 border-b border-gray-50 text-sm font-medium text-[#2C3E2D]">#{payment.invoiceId}</td>
                                            <td className="py-4 border-b border-gray-50 text-sm text-gray-600">
                                                {new Date(payment.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            <td className="py-4 border-b border-gray-50 text-sm">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${payment.method === 'CARD' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                    {payment.method}
                                                </span>
                                            </td>
                                            <td className="py-4 border-b border-gray-50 text-sm font-bold text-[#D45D3C] text-right">
                                                {formatRs(payment.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-sm text-gray-400">
                                            No recent payments found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="mt-12 text-center border-t border-gray-100 pt-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Automated System Report • Internal Use Only</p>
                </div>

            </div>
        </div>
    );
}