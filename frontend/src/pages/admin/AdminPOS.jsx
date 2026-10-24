import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft, ShoppingBag, Utensils, Plus, Trash2, X, Receipt, Volume2, VolumeX
} from "lucide-react";

const API = `${import.meta.env.VITE_API_BASE_URL}/api`;
const TABLE_COUNT = 10; // change this to match the restaurant
const POLL_MS = 5000;

const money = (v) =>
    `Rs. ${Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ---------- API helper ---------- */

async function request(path, options = {}) {
    const { auth = true, ...fetchOptions } = options;
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API}${path}`, {
        ...fetchOptions,
        headers: {
            "Content-Type": "application/json",
            ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
            ...fetchOptions.headers
        }
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Not authorised. Please log in as an admin again.");
    }
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const body = await response.json();
            if (body.message) message = body.message;
        } catch {
            /* the server sent no JSON body */
        }
        throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
}

const api = {
    kitchen: (type) => request(`/admin/orders/kitchen${type ? `?type=${type}` : ""}`),
    setStatus: (id, status) => request(`/admin/orders/${id}/status?status=${status}`, { method: "PUT" }),
    openTicket: (tableId) => request(`/admin/tickets?tableId=${tableId}`, { method: "POST" }),
    openTickets: (tableId) => request(`/admin/tables/${tableId}/tickets`),
    addItem: (orderId, menuItemId, quantity) =>
        request(`/admin/tickets/${orderId}/items`, {
            method: "POST",
            body: JSON.stringify({ menuItemId, quantity })
        }),
    removeItem: (orderId, itemId) => request(`/admin/tickets/${orderId}/items/${itemId}`, { method: "DELETE" }),
    invoice: (tableId) => request(`/admin/tables/${tableId}/invoice`, { method: "POST" }),
    orderInvoice: (orderId) => request(`/admin/orders/${orderId}/invoice`, { method: "POST" }),
    pay: (invoiceId, method) => request(`/admin/invoices/${invoiceId}/pay?method=${method}`, { method: "PATCH" }),
    menu: () => request("/menu", { auth: false })
};

/* ---------- small helpers ---------- */

const COLUMNS = [
    { status: "PENDING", title: "New" },
    { status: "PREPARING", title: "Preparing" },
    { status: "READY", title: "Ready" }
];

const NEXT = {
    PENDING: { to: "PREPARING", label: "Start preparing" },
    PREPARING: { to: "READY", label: "Mark ready" },
    READY: { to: "COMPLETED", label: "Complete order" }
};

const FILTERS = [
    ["", "All"],
    ["PICKUP", "Pickup"],
    ["DINE_IN", "Dine-in"]
];

const pillClass = (active) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        active
            ? "bg-[#2C3E2D] text-white shadow-md"
            : "bg-gray-50 text-[#2C3E2D] hover:bg-gray-100 border border-gray-200"
    }`;

function beep() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        osc.frequency.value = 880;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch {
        /* the sound alert is optional */
    }
}

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            {message}{" "}
            {message.startsWith("Not authorised") && (
                <Link to="/admin" className="font-semibold underline">
                    Go to login
                </Link>
            )}
        </div>
    );
}

/* ---------- Kitchen board ---------- */

function OrderCard({ order, fresh, onMove, onInvoice }) {
    const status = (order.status || "").toUpperCase();
    const dineIn = (order.orderType || "").toUpperCase() === "DINE_IN";
    const next = NEXT[status];

    const cancel = () => {
        if (window.confirm(`Cancel order #${order.id}?`)) onMove(order, "CANCELLED");
    };

    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${
                fresh ? "border-[#D45D3C] ring-2 ring-[#D45D3C]/40 animate-pulse" : "border-gray-100"
            }`}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-bold text-[#2C3E2D]">Order #{order.id}</h3>
                <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                        dineIn ? "bg-[#D45D3C]/10 text-[#D45D3C]" : "bg-[#2C3E2D]/10 text-[#2C3E2D]"
                    }`}
                >
                    {dineIn ? `Table ${order.tableId}` : "Pickup"}
                </span>
            </div>

            {!dineIn && order.guestName && (
                <p className="text-sm text-[#2C3E2D]/60 mb-2">For {order.guestName}</p>
            )}

            <ul className="text-sm text-[#2C3E2D] divide-y divide-gray-50 mb-3">
                {order.items.map((item) => (
                    <li key={item.id} className="py-1.5">
                        {item.quantity} × {item.name}
                    </li>
                ))}
            </ul>

            <div className="pt-3 border-t border-gray-50">
                <span className="font-bold text-[#D45D3C] text-lg">{money(order.total)}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {status === "READY" && dineIn ? (
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#2C3E2D]/60">
                        Waiting for payment
                    </span>
                ) : (
                    next && (
                        <button
                            onClick={() => onMove(order, next.to)}
                            className="bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md"
                        >
                            {next.label}
                        </button>
                    )
                )}
                {status === "READY" && !dineIn && (
                    <button
                        onClick={() => onInvoice(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#D45D3C] border border-[#D45D3C]/40 hover:bg-[#D45D3C]/5 transition-all"
                    >
                        <Receipt className="w-4 h-4" /> Invoice
                    </button>
                )}
                {(status === "PENDING" || status === "PREPARING") && (
                    <button
                        onClick={cancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

function KitchenBoard() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");
    const [fresh, setFresh] = useState(new Set());
    const [sound, setSound] = useState(true);
    const [invoice, setInvoice] = useState(null);
    const seen = useRef(null);
    const soundRef = useRef(sound);
    soundRef.current = sound;

    const load = useCallback(async () => {
        try {
            const data = await api.kitchen(filter);
            setOrders(data);
            setError("");
            if (seen.current) {
                const added = data.filter((o) => !seen.current.has(o.id)).map((o) => o.id);
                if (added.length > 0) {
                    setFresh((prev) => new Set([...prev, ...added]));
                    if (soundRef.current) beep();
                    setTimeout(() => {
                        setFresh((prev) => {
                            const copy = new Set(prev);
                            added.forEach((id) => copy.delete(id));
                            return copy;
                        });
                    }, 6000);
                }
            }
            seen.current = new Set(data.map((o) => o.id));
        } catch (e) {
            setError(e.message);
        }
    }, [filter]);

    useEffect(() => {
        seen.current = null;
        load();
        const timer = setInterval(load, POLL_MS);
        return () => clearInterval(timer);
    }, [load]);

    const move = async (order, status) => {
        try {
            await api.setStatus(order.id, status);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    const openInvoice = async (order) => {
        try {
            setInvoice(await api.orderInvoice(order.id));
            setError("");
        } catch (e) {
            setError(e.message);
        }
    };

    const paid = () => {
        setInvoice(null);
        load();
    };

    return (
        <div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {FILTERS.map(([value, label]) => (
                        <button key={label} onClick={() => setFilter(value)} className={pillClass(filter === value)}>
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setSound((s) => !s)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3E2D]/70 hover:text-[#D45D3C] transition-colors"
                >
                    {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    Sound alert {sound ? "on" : "off"}
                </button>
            </div>

            <ErrorBanner message={error} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map((col) => {
                    const list = orders.filter((o) => (o.status || "").toUpperCase() === col.status);
                    return (
                        <div key={col.status} className="bg-[#2C3E2D]/5 rounded-2xl p-4 min-h-[220px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm uppercase tracking-widest font-bold text-[#2C3E2D]">{col.title}</h2>
                                <span className="bg-[#2C3E2D] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                    {list.length}
                                </span>
                            </div>
                            {list.length === 0 ? (
                                <div className="text-center py-10">
                                    <Utensils className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Nothing here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {list.map((o) => (
                                        <OrderCard
                                            key={o.id}
                                            order={o}
                                            fresh={fresh.has(o.id)}
                                            onMove={move}
                                            onInvoice={openInvoice}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {invoice && <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} onPaid={paid} />}
        </div>
    );
}

/* ---------- Dine-in tables ---------- */

function InvoiceModal({ invoice, onClose, onPaid }) {
    const [error, setError] = useState("");
    const [working, setWorking] = useState(false);
    const [method, setMethod] = useState("CASH");

    const pay = async () => {
        setWorking(true);
        try {
            await api.pay(invoice.id, method);
            onPaid(invoice);
        } catch (e) {
            setError(e.message);
            setWorking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-[#2C3E2D]">
                        Invoice #{invoice.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-white rounded-full shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <p className="text-sm text-[#2C3E2D]/60 mb-4">
                        {invoice.tableId ? `Table ${invoice.tableId}` : `Pickup order #${invoice.orderId}`}
                    </p>
                    <div className="space-y-2 text-[#2C3E2D]">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{money(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>{money(invoice.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between pt-3 mt-3 border-t-2 border-[#2C3E2D] text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[#D45D3C]">{money(invoice.totalAmount)}</span>
                        </div>
                    </div>

                    {!invoice.paid && (
                        <div className="mt-6">
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                                Payment Method
                            </label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setMethod("CASH")} className={pillClass(method === "CASH")}>
                                    Cash
                                </button>
                                <button type="button" onClick={() => setMethod("CARD")} className={pillClass(method === "CARD")}>
                                    Card
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                    )}

                    <div className="pt-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 py-3.5 rounded-xl font-semibold transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={pay}
                            disabled={working || invoice.paid}
                            className="flex-1 bg-[#2C3E2D] hover:bg-[#1A251B] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50"
                        >
                            {invoice.paid ? "Already paid" : "Mark as paid"}
                        </button>
                    </div>

                    {error && (
                        <button
                            onClick={() => onPaid(invoice)}
                            className="mt-3 w-full text-xs text-gray-500 underline"
                        >
                            Clear this bill from the list
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function TicketPanel({ tableId, bill, onInvoice, onChanged }) {
    const [ticket, setTicket] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [menu, setMenu] = useState([]);
    const [menuItemId, setMenuItemId] = useState("");
    const [qty, setQty] = useState(1);
    const [error, setError] = useState("");
    const [working, setWorking] = useState(false);

    const loadTicket = useCallback(async () => {
        try {
            const list = await api.openTickets(tableId);
            setTicket(list[0] || null);
            setError("");
        } catch (e) {
            setError(e.message);
        }
        setLoaded(true);
    }, [tableId]);

    useEffect(() => {
        if (!bill) loadTicket();
    }, [bill, loadTicket]);

    useEffect(() => {
        api.menu()
            .then((data) => setMenu(Array.isArray(data) ? data : data?.content || []))
            .catch(() => setError("Could not load the menu"));
    }, []);

    const run = async (action) => {
        setWorking(true);
        try {
            await action();
            setError("");
        } catch (e) {
            setError(e.message);
        }
        setWorking(false);
    };

    const open = () =>
        run(async () => {
            setTicket(await api.openTicket(tableId));
            onChanged();
        });

    const add = () =>
        run(async () => {
            if (!menuItemId) throw new Error("Choose a menu item first");
            setTicket(await api.addItem(ticket.id, Number(menuItemId), Number(qty)));
            setQty(1);
            onChanged();
        });

    const remove = (itemId) =>
        run(async () => {
            setTicket(await api.removeItem(ticket.id, itemId));
            onChanged();
        });

    const generate = () =>
        run(async () => {
            onInvoice(await api.invoice(tableId));
        });

    const panel = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";
    const inputClass =
        "px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all";

    if (bill) {
        return (
            <div className={panel}>
                <h2 className="font-serif text-xl font-bold text-[#2C3E2D] mb-2">Table {tableId}</h2>
                <p className="text-sm text-[#2C3E2D]/60 mb-4">
                    The bill has been issued: <span className="font-bold text-[#D45D3C]">{money(bill.totalAmount)}</span>
                </p>
                <button
                    onClick={() => onInvoice(bill)}
                    className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                    <Receipt className="w-5 h-5" /> View invoice and take payment
                </button>
            </div>
        );
    }

    if (!loaded) {
        return (
            <div className={panel}>
                <p className="text-sm text-gray-400">Loading…</p>
            </div>
        );
    }

    return (
        <div className={panel}>
            <h2 className="font-serif text-xl font-bold text-[#2C3E2D] mb-4">Table {tableId}</h2>
            <ErrorBanner message={error} />

            {!ticket ? (
                <button
                    onClick={open}
                    disabled={working}
                    className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Plus className="w-5 h-5" /> Open ticket
                </button>
            ) : (
                <>
                    <p className="text-xs uppercase tracking-widest font-bold text-[#2C3E2D]/50 mb-3">
                        Ticket #{ticket.id}
                    </p>

                    <div className="flex gap-2 mb-5">
                        <select
                            value={menuItemId}
                            onChange={(e) => setMenuItemId(e.target.value)}
                            className={`${inputClass} flex-1 min-w-0 cursor-pointer`}
                        >
                            <option value="">-- Select item --</option>
                            {menu.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({money(m.price)})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className={`${inputClass} w-20`}
                        />
                        <button
                            onClick={add}
                            disabled={working}
                            className="bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-4 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50"
                            title="Add to bill"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {ticket.items.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">No items yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-50 text-sm text-[#2C3E2D]">
                            {ticket.items.map((i) => (
                                <div key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                                    <span className="flex-1">
                                        {i.quantity} × {i.name}
                                    </span>
                                    <span className="font-semibold">{money(i.lineTotal)}</span>
                                    <button
                                        onClick={() => remove(i.id)}
                                        disabled={working}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="pt-3 flex justify-between font-bold text-base">
                                <span>Subtotal</span>
                                <span className="text-[#D45D3C]">{money(ticket.total)}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={generate}
                        disabled={working || ticket.items.length === 0}
                        className="mt-6 w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Receipt className="w-5 h-5" /> Generate invoice
                    </button>
                </>
            )}
        </div>
    );
}

function TablesPanel() {
    const [selected, setSelected] = useState(null);
    const [busy, setBusy] = useState(new Set());
    const [invoice, setInvoice] = useState(null);
    const [bills, setBills] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("pendingInvoices")) || {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem("pendingInvoices", JSON.stringify(bills));
    }, [bills]);

    const refreshOccupied = useCallback(async () => {
        try {
            const data = await api.kitchen("DINE_IN");
            setBusy(new Set(data.map((o) => o.tableId)));
        } catch {
            /* the ticket panel shows the errors */
        }
    }, []);

    useEffect(() => {
        refreshOccupied();
        const timer = setInterval(refreshOccupied, POLL_MS);
        return () => clearInterval(timer);
    }, [refreshOccupied]);

    const issued = (inv) => {
        setBills((b) => ({ ...b, [inv.tableId]: inv }));
        setInvoice(inv);
        refreshOccupied();
    };

    const paid = (inv) => {
        setBills((b) => {
            const copy = { ...b };
            delete copy[inv.tableId];
            return copy;
        });
        setInvoice(null);
        setSelected(null);
        refreshOccupied();
    };

    const tileClass = (state, isSelected) => {
        const base = "rounded-2xl border-2 p-5 flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md";
        const colour =
            state === "billed"
                ? "bg-green-50 border-green-200 text-green-800"
                : state === "busy"
                    ? "bg-[#D45D3C]/10 border-[#D45D3C]/40 text-[#D45D3C]"
                    : "bg-white border-gray-200 text-[#2C3E2D]";
        return `${base} ${colour} ${isSelected ? "ring-2 ring-[#2C3E2D]" : ""}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start">
                {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map((n) => {
                    const state = bills[n] ? "billed" : busy.has(n) ? "busy" : "free";
                    const label = state === "billed" ? "Bill issued" : state === "busy" ? "Occupied" : "Free";
                    return (
                        <button key={n} onClick={() => setSelected(n)} className={tileClass(state, selected === n)}>
                            <span className="font-serif text-3xl font-bold">{n}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                        </button>
                    );
                })}
            </div>

            <div>
                {selected ? (
                    <TicketPanel
                        key={selected}
                        tableId={selected}
                        bill={bills[selected]}
                        onInvoice={issued}
                        onChanged={refreshOccupied}
                    />
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Select a table to open or edit its ticket.</p>
                    </div>
                )}
            </div>

            {invoice && <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} onPaid={paid} />}
        </div>
    );
}

/* ---------- Page ---------- */

export default function AdminPOS() {
    const [tab, setTab] = useState("kitchen");

    return (
        <div className="max-w-7xl mx-auto font-sans pb-16 px-4 sm:px-8 pt-28">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3E2D]/60 hover:text-[#D45D3C] transition-colors uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">
                        Order Queue &amp; POS
                    </h1>
                    <p className="text-[#2C3E2D]/60 text-sm">
                        Track kitchen orders and bill dine-in tables in real time.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        to="/menu"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#D45D3C] bg-white hover:bg-[#D45D3C]/5 border border-[#D45D3C]/40 transition-all"
                    >
                        <Utensils className="w-4 h-4" /> View Menu
                    </Link>
                    <button onClick={() => setTab("kitchen")} className={pillClass(tab === "kitchen")}>
                        Kitchen Orders
                    </button>
                    <button onClick={() => setTab("tables")} className={pillClass(tab === "tables")}>
                        Dine-in Tables
                    </button>
                </div>
            </div>

            {tab === "kitchen" ? <KitchenBoard /> : <TablesPanel />}
        </div>
    );
}

