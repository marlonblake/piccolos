import React, { useState, useEffect, useRef } from "react";
import { Download, FileText, Calendar as CalendarIcon } from "lucide-react";
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
            pdf.save(`Piccolos_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
        <div className="font-sans max-w-5xl mx-auto pb-16">
            
            <div className="mb-8 border-b border-gray-200 pb-6 flex justify-between items-end">
                <div>
                    <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Business Intelligence</span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">
                        Generate Reports
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Export your database metrics to a formal PDF document.</p>
                </div>
                
                <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md text-white ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D45D3C] hover:bg-[#B84A2E]'}`}
                >
                    <Download className="w-5 h-5" />
                    {isGenerating ? "Compiling PDF..." : "Download PDF Report"}
                </button>
            </div>

            {/* A4 Document Preview Area */}
            <div className="bg-gray-200 p-8 rounded-2xl">
                <div ref={reportRef} className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 min-h-[1056px]">
                    
                    {/* Formal Document Header */}
                    <div className="flex justify-between items-center border-b-2 border-[#2C3E2D] pb-6 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold font-serif text-[#2C3E2D]">Piccolo's Pizzeria</h2>
                            <p className="text-gray-500 font-medium">Official Executive Summary</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-end gap-1"><CalendarIcon className="w-4 h-4"/> Generated On</p>
                            <p className="text-[#2C3E2D] font-bold mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-10">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Cash</p>
                            <p className="text-2xl font-bold text-[#2C3E2D]">{formatRs(dashboardData.financialSummary.cash)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Card</p>
                            <p className="text-2xl font-bold text-[#2C3E2D]">{formatRs(dashboardData.financialSummary.card)}</p>
                        </div>
                        <div className="bg-[#2C3E2D] p-4 rounded-lg text-white shadow-md">
                            <p className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Net Earnings</p>
                            <p className="text-2xl font-bold">{formatRs(dashboardData.financialSummary.total)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-[#2C3E2D] mb-4 border-b border-gray-100 pb-2">Revenue Timeline</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData.revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Line type="monotone" dataKey="revenue" stroke="#D45D3C" strokeWidth={3} dot={{r: 4}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-[#2C3E2D] mb-4 border-b border-gray-100 pb-2">Category Performance</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.categoryData} layout="vertical" margin={{left: 30}}>
                                        <XAxis type="number" tick={{fontSize: 12}} />
                                        <YAxis dataKey="name" type="category" tick={{fontSize: 12, fontWeight: 500}} />
                                        <Bar dataKey="sales" fill="#2C3E2D" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-16 text-center border-t border-gray-200 pt-6">
                        <p className="text-xs text-gray-400">This is an automated system report. Internal use only.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}