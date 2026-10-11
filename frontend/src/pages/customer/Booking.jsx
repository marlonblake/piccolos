import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDays,
    Clock,
    Users,
    Phone,
    User,
    CheckCircle
} from 'lucide-react';

export default function Booking() {

    const navigate = useNavigate();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('19:00');
    const [partySize, setPartySize] = useState(2);

    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    const [availableTables, setAvailableTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const checkAvailability = async () => {

        setError('');
        setMessage('');
        setSelectedTable(null);

        if (!date) {
            setError('Please select a date.');
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `http://localhost:8081/api/reservations/availability?date=${date}&time=${time}:00&partySize=${partySize}`
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data);
                return;
            }

            setAvailableTables(data);

            if (data.length === 0) {
                setMessage(
                    'No tables are available for the selected date and time.'
                );
            } else {
                setMessage(
                    `${data.length} table(s) available. Please select one.`
                );
            }

        } catch (err) {

            setError(
                'Could not connect to the booking server. Make sure the backend is running.'
            );

        } finally {

            setLoading(false);

        }
    };

    const handleBooking = async (e) => {

        e.preventDefault();

        setError('');
        setMessage('');

        if (!selectedTable) {
            setError('Please select an available table.');
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                'http://localhost:8081/api/reservations',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        guestName,
                        guestPhone,
                        tableId: selectedTable.id,
                        partySize,
                        reservationDate: date,
                        reservationTime: `${time}:00`
                    })
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {

                setError(
                    typeof data === 'string'
                        ? data
                        : 'Unable to create reservation.'
                );

                return;
            }

            setBookingComplete(true);
            setMessage('Your table has been reserved successfully!');

        } catch (err) {

            setError(
                'Could not connect to the booking server.'
            );

        } finally {

            setLoading(false);

        }
    };

    if (bookingComplete) {

        return (
            <div className="min-h-screen bg-[#FDFBF7] pt-32 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-center">

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle
                            className="text-green-600"
                            size={45}
                        />
                    </div>

                    <h1 className="text-4xl font-bold text-[#2C3E2D] mb-4">
                        Table Reserved!
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Your reservation has been successfully recorded.
                    </p>

                    <div className="bg-[#FDFBF7] rounded-2xl p-6 text-left mb-8">

                        <p>
                            <strong>Guest:</strong> {guestName}
                        </p>

                        <p>
                            <strong>Date:</strong> {date}
                        </p>

                        <p>
                            <strong>Time:</strong> {time}
                        </p>

                        <p>
                            <strong>Guests:</strong> {partySize}
                        </p>

                        <p>
                            <strong>Table:</strong> Table {selectedTable?.tableNumber}
                        </p>

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
                        Select your preferred date, time and party size to find an available table.
                    </p>

                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">

                    <form onSubmit={handleBooking}>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                            <div>

                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <CalendarDays className="inline mr-2" size={18} />
                                    Date
                                </label>

                                <input
                                    type="date"
                                    min={today}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                    required
                                />

                            </div>

                            <div>

                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <Clock className="inline mr-2" size={18} />
                                    Time
                                </label>

                                <select
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                >
                                    <option value="17:00">5:00 PM</option>
                                    <option value="17:30">5:30 PM</option>
                                    <option value="18:00">6:00 PM</option>
                                    <option value="18:30">6:30 PM</option>
                                    <option value="19:00">7:00 PM</option>
                                    <option value="19:30">7:30 PM</option>
                                    <option value="20:00">8:00 PM</option>
                                    <option value="20:30">8:30 PM</option>
                                    <option value="21:00">9:00 PM</option>
                                </select>

                            </div>

                            <div>

                                <label className="block font-semibold mb-2 text-[#2C3E2D]">
                                    <Users className="inline mr-2" size={18} />
                                    Guests
                                </label>

                                <select
                                    value={partySize}
                                    onChange={(e) =>
                                        setPartySize(Number(e.target.value))
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D45D3C]"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(number => (
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
                            disabled={loading}
                            className="w-full bg-[#2C3E2D] text-white py-4 rounded-xl font-semibold hover:bg-[#1f2d20] transition"
                        >
                            {loading
                                ? 'Checking...'
                                : 'Check Availability'}
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

                        {availableTables.length > 0 && (

                            <div className="mt-8">

                                <h2 className="text-2xl font-bold text-[#2C3E2D] mb-5">
                                    Available Tables
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                                    {availableTables.map(table => (

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

                                            <p className="font-bold text-xl">
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

                            </div>

                        )}

                        {selectedTable && (

                            <div className="mt-10 border-t pt-8">

                                <h2 className="text-2xl font-bold text-[#2C3E2D] mb-6">
                                    Your Details
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div>

                                        <label className="block font-semibold mb-2">
                                            <User className="inline mr-2" size={18} />
                                            Guest Name
                                        </label>

                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) =>
                                                setGuestName(e.target.value)
                                            }
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
                                            onChange={(e) =>
                                                setGuestPhone(e.target.value)
                                            }
                                            placeholder="0771234567"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3"
                                            required
                                        />

                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-8 bg-[#D45D3C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#B84A2E] transition"
                                >
                                    {loading
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