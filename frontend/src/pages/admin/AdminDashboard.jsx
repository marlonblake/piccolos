import React, { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  UserCheck,
  Clock,
  Users,
  CalendarDays,
  Flame
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const asArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : []);

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    topStats: {
      activeAdmins: 0,
      registeredCustomers: 0,
      activeOrders: 0,
      activeMenuItems: 0
    },
    categoryData: []
  });
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const [statsRes, resRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/full-stats`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/reservations`, { headers })
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setDashboardData({
            topStats: { ...dashboardData.topStats, ...data?.topStats },
            categoryData: asArray(data?.categoryData)
          });
        }

        if (resRes.ok) {
          setReservations(asArray(await resRes.json()));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  const today = todayISO();

  const { todayCount, upcomingCount, pendingCount } = useMemo(() => {
    const active = reservations.filter((r) => String(r.status || "").toUpperCase() !== "CANCELLED");
    return {
      todayCount: active.filter((r) => String(r.reservationDate || "").slice(0, 10) === today).length,
      upcomingCount: active.filter((r) => String(r.reservationDate || "").slice(0, 10) >= today).length,
      pendingCount: active.filter((r) => (String(r.status || "").toUpperCase() || "PENDING") === "PENDING").length
    };
  }, [reservations, today]);

  const topCategory = useMemo(() => {
    if (dashboardData.categoryData.length === 0) return null;
    return dashboardData.categoryData.reduce((best, cur) =>
      Number(cur.sales ?? 0) > Number(best.sales ?? 0) ? cur : best
    );
  }, [dashboardData.categoryData]);

  const topStatsArray = [
    {
      label: "Active Admins",
      value: dashboardData.topStats.activeAdmins ?? 0,
      icon: <Users className="w-5 h-5 text-[#D45D3C]" />
    },
    {
      label: "Registered Customers",
      value: dashboardData.topStats.registeredCustomers ?? 0,
      icon: <UserCheck className="w-5 h-5 text-[#D45D3C]" />
    },
    {
      label: "Total Pickup Orders",
      value: dashboardData.topStats.activeOrders ?? 0,
      icon: <Clock className="w-5 h-5 text-[#D45D3C]" />
    },
    {
      label: "Menu Items",
      value: dashboardData.topStats.activeMenuItems ?? 0,
      icon: <Utensils className="w-5 h-5 text-[#D45D3C]" />
    }
  ];

  return (
    <div className="font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">
            Website Overview
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Live overview of online pickup orders, table reservations, and menu catalog.
          </p>
        </div>

        {/* Top Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {topStatsArray.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md"
            >
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-[#2C3E2D] mt-1">{stat.value}</p>
              </div>
              <div className="bg-[#D45D3C]/10 p-3 rounded-xl shrink-0">{stat.icon}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Ordered Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#2C3E2D] text-lg flex items-center gap-2 mb-2">
              <Utensils className="w-5 h-5 text-[#D45D3C]" /> Most Ordered Categories
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Number of items ordered by menu category
            </p>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.categoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12, fontWeight: 500 }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    formatter={(value) => [`${value} items`, "Ordered"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Bar dataKey="sales" fill="#2C3E2D" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reservations & Activity Snapshot */}
          <div className="bg-[#2C3E2D] p-8 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CalendarDays className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-bold mb-1">Booking &amp; Menu Snapshot</h3>
              <p className="text-white/60 text-sm mb-8">
                Live reservation status and customer favorites.
              </p>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Today&apos;s Reservations
                  </span>
                  <span className="font-bold text-xl text-[#F4A261]">{todayCount}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Upcoming Reservations
                  </span>
                  <span className="font-bold text-xl text-white">{upcomingCount}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Pending Approval
                  </span>
                  <span className="font-bold text-xl text-white">{pendingCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60 inline-flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#F4A261]" /> Top Category
                  </span>
                  <span className="font-bold text-white">
                    {topCategory ? `${topCategory.name} (${topCategory.sales} ordered)` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;