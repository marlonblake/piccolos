import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { adminRequest } from "../../api/adminApi";

const localISO = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const asArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : []);
const hhmm = (t) => (t || "").slice(0, 5);

const EMPTY_STATS = {
    topStats: { activeOrders: 0, registeredCustomers: 0, activeMenuItems: 0 },
    categoryData: []
};

const axisTick = { fontSize: 12, fill: "#6b7280" };
const PAGE_SIZE = 10;

const STATUS_STYLES = {
    ACKNOWLEDGED: "bg-green-50 text-green-700 border-green-100",
    CANCELLED: "bg-red-50 text-red-600 border-red-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100"
};

export default function AdminReports() {
    const reportRef = useRef(null);
    const [stats, setStats] = useState(EMPTY_STATS);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);

    useEffect(() => {
        let live = true;
        Promise.allSettled([adminRequest("/admin/full-stats"), adminRequest("/admin/reservations")]).then(
            ([statsResult, resResult]) => {
                if (!live) return;

                if (statsResult.status === "fulfilled") {
                    const data = statsResult.value;
                    setStats({
                        topStats: { ...EMPTY_STATS.topStats, ...data?.topStats },
                        categoryData: asArray(data?.categoryData)
                    });
                }
                if (resResult.status === "fulfilled") setReservations(asArray(resResult.value));

                const failed = [statsResult, resResult].find((r) => r.status === "rejected");
                if (failed) setError(failed.reason?.message || "Some data could not be loaded.");
                setLoading(false);
            }
        );
        return () => {
            live = false;
        };
    }, []);

    const history = useMemo(
        () =>
            [...reservations].sort((a, b) =>
                `${b.reservationDate}T${b.reservationTime}`.localeCompare(`${a.reservationDate}T${a.reservationTime}`)
            ),
        [reservations]
    );

    const downloadPDF = async () => {
        setExporting(true);
        setError("");
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });
            const img = canvas.toDataURL("image/jpeg", 0.92);
            const pdf = new jsPDF("p", "mm", "a4");
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgH = (canvas.height * pageW) / canvas.width;

            let offset = 0;
            let remaining = imgH - pageH;
            pdf.addImage(img, "JPEG", 0, 0, pageW, imgH);
            while (remaining > 0) {
                offset -= pageH;
                pdf.addPage();
                pdf.addImage(img, "JPEG", 0, offset, pageW, imgH);
                remaining -= pageH;
            }

            pdf.save(`Piccolos_Report_${localISO()}.pdf`);
        } catch (e) {
            console.error("PDF export failed", e);
            setError("Could not generate the PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const th = "border-b border-gray-200 pb-3 text-xs font-bold text-gray-500";
    const td = "py-3 border-b border-gray-50 text-sm";

    return (
        <div className="font-sans max-w-6xl mx-auto pb-16">
            <div className="mb-8 border-b border-gray-200 pb-6 flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D]">Website Reports</h1>
                    <p className="text-gray-500 text-sm mt-1">Review pickup orders, menu popularity, and reservation history.</p>
                </div>
                <button
                    onClick={downloadPDF}
                    disabled={exporting || loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm bg-[#D45D3C] hover:bg-[#B84A2E] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download className="w-5 h-5" />
                    {exporting ? "Preparing PDF…" : "Download PDF"}
                </button>
            </div>

            {error && (
                <p role="alert" className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-8">
                    <div>
                        <h2 className="text-xl font-bold font-serif text-[#2C3E2D]">Piccolo&apos;s Pizzeria</h2>
                        <p className="text-gray-500 text-xs mt-0.5">Website activity summary</p>
                    </div>
                    <p className="text-sm text-[#2C3E2D] font-semibold">{new Date().toLocaleDateString()}</p>
                </div>

                {loading ? (
                    <p className="py-16 text-center text-gray-400">Loading report…</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-semibold mb-1">Total Pickup Orders</p>
                                <p className="text-2xl font-bold text-[#2C3E2D]">{stats.topStats.activeOrders ?? 0}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-semibold mb-1">Total Reservations</p>
                                <p className="text-2xl font-bold text-[#2C3E2D]">{reservations.length}</p>
                            </div>
                            <div className="bg-[#2C3E2D] p-5 rounded-xl text-white">
                                <p className="text-xs text-white/70 font-semibold mb-1">Registered Customers</p>
                                <p className="text-2xl font-bold">{stats.topStats.registeredCustomers ?? 0}</p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="font-bold text-[#2C3E2D] mb-4">Most ordered categories</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.categoryData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ ...axisTick, fill: "#374151" }} axisLine={false} tickLine={false} />
                                        <Tooltip formatter={(v) => [`${v} items`, "Ordered"]} />
                                        <Bar dataKey="sales" fill="#2C3E2D" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Reservation history, newest first */}
                        <h3 className="font-bold text-[#2C3E2D] mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#D45D3C]" /> Reservation history
                            <span className="text-xs font-medium text-gray-400">({history.length})</span>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className={th}>Guest</th>
                                        <th className={th}>Date &amp; time</th>
                                        <th className={th}>Table</th>
                                        <th className={th}>Party</th>
                                        <th className={`${th} text-right`}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-sm text-gray-400">No reservations yet.</td>
                                        </tr>
                                    ) : (
                                        history.slice(0, visible).map((r) => (
                                            <tr key={r.reservationId ?? r.id}>
                                                <td className={td}>
                                                    <p className="font-medium text-[#2C3E2D]">{r.guestName || "Guest"}</p>
                                                    {r.guestPhone && <p className="text-xs text-gray-500">{r.guestPhone}</p>}
                                                </td>
                                                <td className={`${td} text-gray-600 whitespace-nowrap`}>
                                                    {r.reservationDate} · {hhmm(r.reservationTime)}
                                                </td>
                                                <td className={`${td} text-[#2C3E2D]`}>Table {r.tableNumber ?? r.tableId}</td>
                                                <td className={`${td} text-gray-600`}>{r.partySize ?? "-"}</td>
                                                <td className={`${td} text-right`}>
                                                    {r.status && (
                                                        <span
                                                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                                                                STATUS_STYLES[String(r.status).toUpperCase()] || "bg-gray-50 text-gray-600 border-gray-100"
                                                            }`}
                                                        >
                                                            {String(r.status).toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {history.length > visible && (
                            <div data-html2canvas-ignore="true" className="mt-4 text-center">
                                <button
                                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#2C3E2D] hover:bg-gray-50"
                                >
                                    Show more ({history.length - visible} left)
                                </button>
                            </div>
                        )}
                    </>
                )}

                <p className="mt-10 text-center border-t border-gray-100 pt-6 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Automated report • Internal use only
                </p>
            </div>
        </div>
    );
}