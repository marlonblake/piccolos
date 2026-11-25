import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    Clock,
    Users,
    Phone,
    User,
    CheckCircle,
    StickyNote,
    Armchair
} from 'lucide-react';
import {
    HOURS,
    minsToHHMM,
    hhmmToMins,
    formatTimeLabel,
    getNearestReservationSlot,
    getValidReservationStartSlots,
    getValidReservationEndSlots
} from '../../utils/timeSlots';

export default function Booking() {
    const navigate = useNavigate();
    const initial = useMemo(() => getNearestReservationSlot(), []);

    const [date, setDate] = useState(initial.date);
    const [time, setTime] = useState(initial.startTime);
    const [endTime, setEndTime] = useState(initial.endTime);
    const [partySize, setPartySize] = useState(2);

    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [extraSeats, setExtraSeats] = useState(0);
    const [notes, setNotes] = useState('');

    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);

    const validStartSlots = useMemo(() => getValidReservationStartSlots(date), [date]);
    const validEndSlots = useMemo(() => getValidReservationEndSlots(time), [time]);

    useEffect(() => {
        if (validStartSlots.length > 0 && !validStartSlots.includes(time)) {
            setTime(validStartSlots[0]);
        }
    }, [validStartSlots, time]);

    useEffect(() => {
        if (validEndSlots.length > 0 && !validEndSlots.includes(endTime)) {
            const preferred = minsToHHMM(Math.min(hhmmToMins(time) + 60, HOURS.CLOSE_MINS));
            setEndTime(validEndSlots.includes(preferred) ? preferred : validEndSlots[0]);
        }
    }, [validEndSlots, time, endTime]);

    const checkAvailability = useCallback(async () => {
        if (!date || !time || !endTime || hhmmToMins(endTime) <= hhmmToMins(time)) return;

        setError('');
        setMessage('');
        setSelectedTable(null);

        try {
            setChecking(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/reservations/availability?date=${date}&time=${time}:00&endTime=${endTime}:00&partySize=${partySize}`
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setAvailableTables([]);
                setError(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Unable to check table availability.'
                );
                return;
            }

            const tables = Array.isArray(data)
                ? data
                : data?.availableTables || data?.tables || [];

            setAvailableTables(tables);

            if (tables.length === 0) {
                setMessage('No tables are available for the selected date and time.');
            } else {
                setMessage(`${tables.length} table(s) available. Please select one.`);
            }
        } catch {
            setAvailableTables([]);
            setError('Could not connect to the booking server. Make sure the backend is running.');
        } finally {
            setChecking(false);
        }
    }, [date, time, endTime, partySize]);

    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    const handleBooking = async (e) => {
        e.preventDefault();

        setError('');
        setMessage('');

        if (!selectedTable) {
            setError('Please select an available table.');
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem('customerToken');
            const rawUserId = token ? localStorage.getItem('userId') : null;
            const parsedUserId = rawUserId && !Number.isNaN(Number(rawUserId)) ? Number(rawUserId) : null;

            const noteParts = [];
            if (extraSeats > 0) noteParts.push(`Extra seats needed: ${extraSeats}`);
            if (notes.trim()) noteParts.push(notes.trim());
            const finalNote = noteParts.length > 0 ? noteParts.join(' | ') : null;

            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/reservations`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        guestName,
                        guestPhone,
                        tableId: selectedTable.id,
                        partySize,
                        reservationDate: date,
                        reservationTime: `${time}:00`,
                        endTime: `${endTime}:00`,
                        notes: finalNote,
                        userId: parsedUserId
                    })
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setError(
                    typeof data === 'string'
                        ? data
                        : data?.message || 'Unable to create reservation.'
                );
                return;
            }

            setBookingComplete(true);
            setMessage('Your table has been reserved successfully!');
        } catch {
            setError('Could not connect to the booking server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (bookingComplete) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] pt-32 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={45} />
                    </div>

                    <h1 className="text-4xl font-bold text-[#2C3E2D] mb-4">
                        Table Reserved!
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Your reservation has been successfully recorded.
                    </p>

                    <div className="bg-[#FDFBF7] rounded-2xl p-6 text-left mb-8 space-y-1">
                        <p><strong>Guest:</strong> {guestName}</p>
                        <p><strong>Date:</strong> {date}</p>
                        <p><strong>Time:</strong> {formatTimeLabel(time)} – {formatTimeLabel(endTime)}</p>
                        <p><strong>Guests:</strong> {partySize}{extraSeats > 0 ? ` (+${extraSeats} extra seat${extraSeats > 1 ? 's' : ''})` : ''}</p>
                        <p><strong>Table:</strong> Table {selectedTable?.tableNumber}</p>
                        {notes.trim() && <p><strong>Note:</strong> {notes.trim()}</p>}
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#D45D3C] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#B84A2E]"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-32 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-[#D45D3C] uppercase tracking-widest font-semibold text-sm">
                        Piccolo's Pizzeria
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E2D] mt-2">
                        Book a Table
                    </h1>
                    <p className="text-gray-600 mt-4">
                        Open daily from 12:00 PM to 12:00 AM. Select your date, time slot, and party size.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
                    <form onSubmit={handleBooking}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div>
                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <CalendarDays className="inline mr-2" size={18} />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    min={initial.minDate}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <Clock className="inline mr-2" size={18} />
                                    Start Time
                                </label>
                                <select
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                >
                                    {validStartSlots.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {formatTimeLabel(slot)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <Clock className="inline mr-2" size={18} />
                                    End Time
                                </label>
                                <select
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                >
                                    {validEndSlots.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {formatTimeLabel(slot)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <Users className="inline mr-2" size={18} />
                                    Guests
                                </label>
                                <select
                                    value={partySize}
                                    onChange={(e) => setPartySize(Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                >
                                    {[1, 2, 3, 4, 5, 6].map((number) => (
                                        <option key={number} value={number}>
                                            {number} {number === 1 ? 'Guest' : 'Guests'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={checkAvailability}
                            disabled={checking}
                            className="w-full bg-[#2C3E2D] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1f2d20] transition disabled:opacity-50"
                        >
                            {checking ? 'Checking Availability...' : 'Refresh Availability'}
                        </button>

                        {message && (
                            <div className="mt-5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mt-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-[#2C3E2D] mb-5">
                                Available Tables
                            </h2>

                            {checking ? (
                                <p className="text-gray-500">Loading available tables...</p>
                            ) : availableTables.length === 0 ? (
                                <p className="text-gray-500">
                                    No tables available for this slot. Try another time or date.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {availableTables.map((table) => (
                                        <button
                                            type="button"
                                            key={table.id}
                                            onClick={() => setSelectedTable(table)}
                                            className={`text-left p-5 rounded-2xl border-2 transition ${
                                                selectedTable?.id === table.id
                                                    ? 'border-[#D45D3C] bg-[#D45D3C]/10'
                                                    : 'border-gray-200 hover:border-[#D45D3C]'
                                            }`}
                                        >
                                            <p className="font-bold text-xl text-[#2C3E2D]">
                                                Table {table.tableNumber}
                                            </p>
                                            <p className="text-gray-500">
                                                Seats up to {table.capacity} guests
                                            </p>
                                            {selectedTable?.id === table.id && (
                                                <p className="text-[#D45D3C] font-semibold mt-2">
                                                    Selected
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedTable && (
                            <div className="mt-10 border-t pt-8">
                                <h2 className="text-2xl font-bold text-[#2C3E2D] mb-6">
                                    Your Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block font-semibold mb-2">
                                            <User className="inline mr-2" size={18} />
                                            Guest Name
                                        </label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-2">
                                            <Phone className="inline mr-2" size={18} />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            placeholder="0771234567"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                            <Armchair className="inline mr-2" size={18} />
                                            Extra Seats (Optional)
                                        </label>
                                        <select
                                            value={extraSeats}
                                            onChange={(e) => setExtraSeats(Number(e.target.value))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                        >
                                            <option value={0}>None</option>
                                            {[1, 2, 3, 4].map((n) => (
                                                <option key={n} value={n}>
                                                    +{n} Extra {n === 1 ? 'Seat' : 'Seats'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                        <StickyNote className="inline mr-2" size={18} />
                                        Note (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any special requests (e.g., baby chair, window seat)..."
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-8 bg-[#D45D3C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#B84A2E] transition disabled:opacity-50"
                                >
                                    {submitting
                                        ? 'Confirming Reservation...'
                                        : `Reserve Table ${selectedTable.tableNumber}`}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}