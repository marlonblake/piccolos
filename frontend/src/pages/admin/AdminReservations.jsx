import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Plus, RefreshCw, Save, Trash2, Users, X } from "lucide-react";
import { adminRequest } from "../../api/adminApi";
import {
    HOURS,
    minsToHHMM,
    hhmmToMins,
    formatTimeLabel,
    RESERVATION_START_SLOTS,
    getNearestReservationSlot,
    getValidReservationEndSlots
} from "../../utils/timeSlots";

const sortLatestFirst = (list) =>
    [...list].sort((a, b) =>
        `${b.reservationDate}T${b.reservationTime}`.localeCompare(
            `${a.reservationDate}T${a.reservationTime}`
        ) || (b.reservationId ?? 0) - (a.reservationId ?? 0)
    );

function ReservationForm({ reservation, tables, onCancel, onSaved }) {
    const defaults = useMemo(() => getNearestReservationSlot(), []);
    const [form, setForm] = useState(() => {
        if (reservation) {
            const start = (reservation.reservationTime || "19:00").slice(0, 5);
            const fallbackEnd = minsToHHMM(Math.min(hhmmToMins(start) + 60, HOURS.CLOSE_MINS));
            return {
                guestName: reservation.guestName || "",
                guestPhone: reservation.guestPhone || "",
                tableId: String(reservation.tableId || ""),
                partySize: String(reservation.partySize || 2),
                reservationDate: reservation.reservationDate || defaults.date,
                reservationTime: start,
                endTime: reservation.endTime ? reservation.endTime.slice(0, 5) : fallbackEnd
            };
        }
        return {
            guestName: "",
            guestPhone: "",
            tableId: tables[0] ? String(tables[0].id) : "",
            partySize: "2",
            reservationDate: defaults.date,
            reservationTime: defaults.startTime,
            endTime: defaults.endTime
        };
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const validEndSlots = useMemo(
        () => getValidReservationEndSlots(form.reservationTime),
        [form.reservationTime]
    );

    useEffect(() => {
        if (validEndSlots.length > 0 && !validEndSlots.includes(form.endTime)) {
            const preferred = minsToHHMM(Math.min(hhmmToMins(form.reservationTime) + 60, HOURS.CLOSE_MINS));
            setForm((current) => ({
                ...current,
                endTime: validEndSlots.includes(preferred) ? preferred : validEndSlots[0]
            }));
        }
    }, [validEndSlots, form.reservationTime, form.endTime]);

    const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);
        try {
            const payload = {
                ...form,
                tableId: Number(form.tableId),
                partySize: Number(form.partySize),
                reservationTime: `${form.reservationTime}:00`,
                endTime: `${form.endTime}:00`
            };
            const result = await adminRequest(
                reservation ? `/admin/reservations/${reservation.reservationId}` : "/admin/reservations",
                {
                    method: reservation ? "PUT" : "POST",
                    body: JSON.stringify(payload)
                }
            );
            onSaved(result);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h2 className="font-serif text-xl font-bold text-[#2C3E2D]">{reservation ? "Edit reservation" : "Create reservation"}</h2>
                    <p className="text-sm text-gray-500 mt-1">Operating hours: 12:00 PM – 12:00 AM (30-minute intervals).</p>
                </div>
                <button type="button" onClick={onCancel} aria-label="Close form" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Guest name
                    <input name="guestName" required value={form.guestName} onChange={change} autoComplete="name"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#D45D3C]" />
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Phone number
                    <input name="guestPhone" type="tel" required value={form.guestPhone} onChange={change} autoComplete="tel"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#D45D3C]" />
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Table
                    <select name="tableId" required value={form.tableId} onChange={change}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#D45D3C]">
                        <option value="" disabled>Select a table</option>
                        {tables.map((table) => <option key={table.id} value={table.id}>Table {table.tableNumber} · seats {table.capacity}</option>)}
                    </select>
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Party size
                    <input name="partySize" type="number" min="1" required value={form.partySize} onChange={change}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#D45D3C]" />
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Date
                    <input name="reservationDate" type="date" min={defaults.minDate} required value={form.reservationDate} onChange={change}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#D45D3C]" />
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Start time
                    <select name="reservationTime" required value={form.reservationTime} onChange={change}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#D45D3C]">
                        {RESERVATION_START_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>{formatTimeLabel(slot)}</option>
                        ))}
                    </select>
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    End time
                    <select name="endTime" required value={form.endTime} onChange={change}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#D45D3C]">
                        {validEndSlots.map((slot) => (
                            <option key={slot} value={slot}>{formatTimeLabel(slot)}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[#2C3E2D] font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || tables.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C3E2D] text-white font-semibold hover:bg-[#1A251B] disabled:opacity-60">
                    <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save reservation"}
                </button>
            </div>
        </form>
    );
}

export default function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formReservation, setFormReservation] = useState(undefined);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const query = date ? `?date=${encodeURIComponent(date)}` : "";
            const [reservationData, tableData] = await Promise.all([
                adminRequest(`/admin/reservations${query}`),
                adminRequest("/admin/tables")
            ]);
            setReservations(sortLatestFirst(reservationData));
            setTables(tableData);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const removeReservation = async (reservation) => {
        if (!window.confirm(`Cancel the reservation for ${reservation.guestName}?`)) return;
        setError("");
        try {
            await adminRequest(`/admin/reservations/${reservation.reservationId}`, { method: "DELETE" });
            setReservations((current) => current.filter((item) => item.reservationId !== reservation.reservationId));
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const savedReservation = (reservation) => {
        setFormReservation(undefined);
        setReservations((current) => {
            const exists = current.some((item) => item.reservationId === reservation.reservationId);
            if (date && reservation.reservationDate !== date) {
                return current.filter((item) => item.reservationId !== reservation.reservationId);
            }
            const updated = exists
                ? current.map((item) => item.reservationId === reservation.reservationId ? reservation : item)
                : [...current, reservation];
            return sortLatestFirst(updated);
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 border-b border-gray-200 pb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Guest bookings</span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">Reservations</h1>
                    <p className="text-gray-500 text-sm mt-1">View, create, and manage restaurant bookings.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor="reservation-date-filter">Filter reservations by date</label>
                    <input id="reservation-date-filter" type="date" value={date} onChange={(event) => setDate(event.target.value)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#2C3E2D] outline-none focus:border-[#D45D3C]" />
                    {date && <button onClick={() => setDate("")} className="px-3 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#2C3E2D] hover:bg-gray-50">All dates</button>}
                    <button onClick={loadData} disabled={loading} title="Refresh reservations"
                        className="p-3 rounded-xl border border-gray-200 bg-white text-[#2C3E2D] hover:bg-gray-50 disabled:opacity-50">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => setFormReservation(null)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#D45D3C] px-4 py-3 font-semibold text-white shadow-sm hover:bg-[#BD4F32]">
                        <Plus className="w-5 h-5" /> New reservation
                    </button>
                </div>
            </header>

            {error && <div role="alert" className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
            {formReservation !== undefined && (
                <div className="mb-6">
                    <ReservationForm key={formReservation?.reservationId || "new"} reservation={formReservation} tables={tables}
                        onCancel={() => setFormReservation(undefined)} onSaved={savedReservation} />
                </div>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-xl font-bold text-[#2C3E2D]">{date ? "Bookings for selected date" : "All bookings"}</h2>
                        <p className="text-xs text-gray-500 mt-1">{reservations.length} reservation{reservations.length === 1 ? "" : "s"}</p>
                    </div>
                    <CalendarDays className="w-5 h-5 text-[#D45D3C]" />
                </div>
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading reservations...</div>
                ) : reservations.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDays className="w-10 h-10 text-[#D45D3C] mx-auto mb-3" />
                        <h3 className="font-serif text-xl font-bold text-[#2C3E2D]">No reservations found</h3>
                        <p className="text-sm text-gray-500 mt-1">{date ? "Try another date or view all bookings." : "New guest bookings will appear here."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FDFBF7] text-[11px] uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-5 py-3 font-bold">Guest</th>
                                    <th className="px-5 py-3 font-bold">Date &amp; time</th>
                                    <th className="px-5 py-3 font-bold">Table</th>
                                    <th className="px-5 py-3 font-bold">Party</th>
                                    <th className="px-5 py-3 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reservations.map((reservation) => (
                                    <tr key={reservation.reservationId} className="hover:bg-[#FDFBF7]/70">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-[#2C3E2D]">{reservation.guestName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{reservation.guestPhone}</p>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#2C3E2D]">
                                                <CalendarDays className="w-4 h-4 text-[#D45D3C]" />
                                                {reservation.reservationDate}
                                            </p>
                                            <p className="inline-flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <Clock3 className="w-3.5 h-3.5" />
                                                {formatTimeLabel(reservation.reservationTime)}
                                                {reservation.endTime ? ` – ${formatTimeLabel(reservation.endTime)}` : ""}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="rounded-full bg-[#2C3E2D]/10 px-3 py-1 text-xs font-bold text-[#2C3E2D]">
                                                Table {reservation.tableNumber}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-2 text-sm text-[#2C3E2D]"><Users className="w-4 h-4 text-[#D45D3C]" />{reservation.partySize ?? reservation.tableCapacity}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setFormReservation(reservation)}
                                                    className="px-3 py-2 rounded-lg text-xs font-semibold text-[#2C3E2D] border border-gray-200 hover:bg-gray-50">Edit</button>
                                                <button onClick={() => removeReservation(reservation)} aria-label={`Cancel reservation for ${reservation.guestName}`}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}