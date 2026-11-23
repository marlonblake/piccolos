import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingBag,
    Utensils,
    Plus,
    Trash2,
    X,
    Receipt,
    Volume2,
    VolumeX,
    CalendarClock,
    Bell,
    Phone,
    Users,
    CheckCircle2
} from "lucide-react";
import {
    api,
    AuthError,
    asList,
    COLUMNS,
    FILTERS,
    isoDate,
    money,
    NEXT,
    norm,
    pillClass,
    resDate,
    resId,
    resStatus,
    resTime,
    store
} from "./posApi";
import {
    isAudioUnlocked,
    Modal,
    playAlert,
    unlockAudio,
    useBusy,
    useConfirm,
    useLater,
    usePolling
} from "./posUi";

const TERMINAL = ["COMPLETED", "CANCELLED"];

function UnreadBadge({ count }) {
    if (!count || count <= 0) return null;
    return (
        <span
            aria-label={`${count} pending`}
            className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold leading-none"
        >
            {count > 99 ? "99+" : count}
        </span>
    );
}

function ToastStack({ toasts, onDismiss, onOpen }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]"
        >
            {toasts.map((t) => {
                const isRes = t.kind === "reservation";
                return (
                    <div
                        key={t.id}
                        className={`bg-white rounded-2xl shadow-xl border-l-4 p-4 flex items-start gap-3 ${
                            isRes ? "border-amber-500" : "border-[#D45D3C]"
                        }`}
                    >
                        <div
                            className={`p-2 rounded-xl shrink-0 ${
                                isRes ? "bg-amber-100 text-amber-700" : "bg-[#D45D3C]/10 text-[#D45D3C]"
                            }`}
                        >
                            {isRes ? <CalendarClock className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#2C3E2D]">{t.title}</p>
                            <p className="text-xs text-[#2C3E2D]/70 mt-0.5">{t.subtitle}</p>
                            <button
                                onClick={() => onOpen(t)}
                                className="mt-2 text-xs font-bold text-[#D45D3C] hover:underline"
                            >
                                View now →
                            </button>
                        </div>
                        <button
                            onClick={() => onDismiss(t.id)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Dismiss notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div role="alert" className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            {message}{" "}
            {message.startsWith("Not authorised") && (
                <Link to="/admin" className="font-semibold underline">
                    Go to login
                </Link>
            )}
        </div>
    );
}

function OrderCard({ order, fresh, busy, onSeen, onMove, onInvoice, onOpenTable }) {
    const status = norm(order.status);
    const dineIn = norm(order.orderType) === "DINE_IN";
    const next = NEXT[status];

    return (
        <div
            onPointerEnter={() => fresh && onSeen(order.id)}
            onFocus={() => fresh && onSeen(order.id)}
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

            {!dineIn && order.guestName && <p className="text-sm text-[#2C3E2D]/60 mb-2">For {order.guestName}</p>}

            <ul className="text-sm text-[#2C3E2D] divide-y divide-gray-50 mb-3">
                {(order.items || []).map((item) => (
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
                    <>
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#2C3E2D]/60">
                            Waiting for payment
                        </span>
                        <button
                            onClick={() => onOpenTable(order.tableId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D45D3C] border border-[#D45D3C]/40 hover:bg-[#D45D3C]/5 transition-all"
                        >
                            Open table
                        </button>
                    </>
                ) : (
                    next && (
                        <button
                            disabled={busy}
                            onClick={() => onMove(order, next.to)}
                            className="bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50"
                        >
                            {next.label}
                        </button>
                    )
                )}
                {status === "READY" && !dineIn && (
                    <button
                        disabled={busy}
                        onClick={() => onInvoice(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#D45D3C] border border-[#D45D3C]/40 hover:bg-[#D45D3C]/5 transition-all disabled:opacity-50"
                    >
                        <Receipt className="w-4 h-4" /> Invoice
                    </button>
                )}
                {(status === "PENDING" || status === "PREPARING") && (
                    <button
                        disabled={busy}
                        onClick={() => onMove(order, "CANCELLED")}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

function KitchenBoard({ orders, freshOrders, onSeen, onRefresh, confirm, onOpenTable }) {
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");
    const [invoice, setInvoice] = useState(null);
    const busy = useBusy();

    const visibleOrders = filter ? orders.filter((o) => norm(o.orderType) === filter) : orders;

    const move = (order, status) =>
        busy.run(`order-${order.id}`, async () => {
            if (status === "CANCELLED" && !(await confirm(`Cancel order #${order.id}?`))) return;
            try {
                await api.setStatus(order.id, status);
                setError("");
                await onRefresh();
            } catch (e) {
                setError(e.message);
            }
        });

    const openInvoice = (order) =>
        busy.run(`order-${order.id}`, async () => {
            try {
                setInvoice(await api.orderInvoice(order.id));
                setError("");
            } catch (e) {
                setError(e.message);
            }
        });

    const paid = () => {
        setInvoice(null);
        onRefresh();
    };

    return (
        <div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-2 items-center">
                {FILTERS.map(({ value, label }) => (
                    <button
                        key={value}
                        aria-pressed={filter === value}
                        onClick={() => setFilter(value)}
                        className={pillClass(filter === value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <ErrorBanner message={error} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map((col) => {
                    const list = visibleOrders.filter((o) => norm(o.status) === col.status);
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
                                            fresh={freshOrders.has(o.id)}
                                            busy={busy.isBusy(`order-${o.id}`)}
                                            onSeen={onSeen}
                                            onMove={move}
                                            onInvoice={openInvoice}
                                            onOpenTable={onOpenTable}
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

const dateLabel = (iso) => (iso === isoDate(0) ? "Today" : iso === isoDate(1) ? "Tomorrow" : iso);

function ReservationsPanel({ reservations, freshReservations, onSeen, onRefresh, confirm }) {
    const [error, setError] = useState("");
    const busy = useBusy();

    const byDateTime = (a, b) => `${resDate(a)} ${resTime(a)}`.localeCompare(`${resDate(b)} ${resTime(b)}`);
    const active = reservations.filter((r) => resStatus(r) !== "CANCELLED").sort(byDateTime);
    const pending = active.filter((r) => resStatus(r) === "PENDING");
    const acknowledged = active.filter((r) => resStatus(r) === "ACKNOWLEDGED");

    const updateStatus = (res, status) => {
        const id = resId(res);
        return busy.run(`res-${id}`, async () => {
            if (status === "CANCELLED" && !(await confirm(`Cancel reservation for ${res.guestName || "this guest"}?`))) {
                return;
            }
            try {
                await api.setReservationStatus(id, status);
                setError("");
                await onRefresh();
            } catch (e) {
                setError(e.message);
            }
        });
    };

    const renderCard = (r, isPending) => {
        const id = resId(r);
        const time = resTime(r) || "Time TBC";
        const isFresh = freshReservations.has(id);
        const working = busy.isBusy(`res-${id}`);

        return (
            <div
                key={id}
                onPointerEnter={() => isFresh && onSeen(id)}
                onFocus={() => isFresh && onSeen(id)}
                className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${
                    isFresh
                        ? "border-amber-500 ring-2 ring-amber-400/50 animate-pulse"
                        : isPending
                            ? "border-amber-200"
                            : "border-gray-100"
                }`}
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <span className="inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 mb-2">
                            {dateLabel(resDate(r))} · {time} · Table {r.tableNumber ?? r.tableId}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#2C3E2D]">{r.guestName || "Registered Guest"}</h3>
                    </div>
                    {!isPending && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-[#2C3E2D]/70 mb-3">
                    {r.partySize ? (
                        <span className="inline-flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> {r.partySize} guests
                        </span>
                    ) : null}
                    {r.guestPhone && (
                        <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-4 h-4" /> {r.guestPhone}
                        </span>
                    )}
                </div>

                {r.notes && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900">
                        <span className="font-bold">Note:</span> {r.notes}
                    </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                    {isPending && (
                        <button
                            disabled={working}
                            onClick={() => updateStatus(r, "ACKNOWLEDGED")}
                            className="flex-1 bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                        >
                            Acknowledge
                        </button>
                    )}
                    <button
                        disabled={working}
                        onClick={() => updateStatus(r, "CANCELLED")}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <ErrorBanner message={error} />

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-sm uppercase tracking-widest font-bold text-[#2C3E2D]">
                        Pending Reservations (Upcoming)
                    </h2>
                    <UnreadBadge count={pending.length} />
                </div>

                {pending.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
                        No pending reservations right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {pending.map((r) => renderCard(r, true))}
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-sm uppercase tracking-widest font-bold text-[#2C3E2D]/70 mb-4">
                    Acknowledged ({acknowledged.length})
                </h2>

                {acknowledged.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
                        No acknowledged reservations yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {acknowledged.map((r) => renderCard(r, false))}
                    </div>
                )}
            </div>
        </div>
    );
}

function InvoiceModal({ invoice, onClose, onPaid }) {
    const [error, setError] = useState("");
    const [working, setWorking] = useState(false);
    const [method, setMethod] = useState("CASH");
    const [paid, setPaid] = useState(Boolean(invoice.paid));
    const submitting = useRef(false);

    const pay = async () => {
        if (submitting.current || paid) return;
        submitting.current = true;
        setWorking(true);
        try {
            await api.pay(invoice.id, method);
            setPaid(true);
            onPaid(invoice);
        } catch (e) {
            setError(e.message);
            setWorking(false);
        } finally {
            submitting.current = false;
        }
    };

    return (
        <Modal label={`Invoice ${invoice.id}`} onClose={onClose}>
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-[#2C3E2D]">
                    Invoice #{invoice.id}
                </h2>
                <button
                    onClick={onClose}
                    aria-label="Close invoice"
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

                {!paid && (
                    <div className="mt-6">
                        <p className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                            Payment Method
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                aria-pressed={method === "CASH"}
                                onClick={() => setMethod("CASH")}
                                className={pillClass(method === "CASH")}
                            >
                                Cash
                            </button>
                            <button
                                type="button"
                                aria-pressed={method === "CARD"}
                                onClick={() => setMethod("CARD")}
                                className={pillClass(method === "CARD")}
                            >
                                Card
                            </button>
                        </div>
                    </div>
                )}

                {error && <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

                <div className="pt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 py-3.5 rounded-xl font-semibold transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={pay}
                        disabled={working || paid}
                        className="flex-1 bg-[#2C3E2D] hover:bg-[#1A251B] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50"
                    >
                        {paid ? "Already paid" : working ? "Saving…" : "Mark as paid"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function TicketPanel({ tableId, tableNumber, reservations = [], bill, tick, onInvoice, onChanged }) {
    const [tickets, setTickets] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [loadState, setLoadState] = useState("loading");
    const [menu, setMenu] = useState([]);
    const [menuError, setMenuError] = useState("");
    const [menuItemId, setMenuItemId] = useState("");
    const [qty, setQty] = useState("1");
    const [error, setError] = useState("");
    const busy = useBusy();
    const loadSeq = useRef(0);

    const working = busy.isBusy("ticket");
    const ticket = tickets.find((t) => t.id === activeId) ?? tickets[0] ?? null;

    const loadTickets = useCallback(async () => {
        const id = ++loadSeq.current;
        try {
            const list = (await api.openTickets(tableId)) || [];
            if (id !== loadSeq.current) return;
            setTickets(list);
            setLoadState("ok");
            setError("");
        } catch (e) {
            if (id !== loadSeq.current) return;
            setLoadState((s) => (s === "ok" ? "ok" : "error"));
            setError(e.message);
        }
    }, [tableId]);

    useEffect(() => {
        if (!bill && !busy.isBusy("ticket")) loadTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bill, tick, loadTickets]);

    const loadMenu = useCallback(() => {
        api.menu()
            .then((data) => {
                setMenu(asList(data) || []);
                setMenuError("");
            })
            .catch(() => setMenuError("Could not load the menu."));
    }, []);

    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    const upsert = (t) => {
        setTickets((list) => (list.some((x) => x.id === t.id) ? list.map((x) => (x.id === t.id ? t : x)) : [...list, t]));
        setActiveId(t.id);
    };

    const run = (action) =>
        busy.run("ticket", async () => {
            loadSeq.current += 1;
            try {
                await action();
                setError("");
            } catch (e) {
                setError(e.message);
            }
        });

    const open = () =>
        run(async () => {
            upsert(await api.openTicket(tableId));
            setLoadState("ok");
            await onChanged();
        });

    const add = () =>
        run(async () => {
            const quantity = Number(qty);
            if (!menuItemId) throw new Error("Choose a menu item first.");
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                throw new Error("Quantity must be a whole number from 1 to 99.");
            }
            upsert(await api.addItem(ticket.id, Number(menuItemId), quantity));
            setQty("1");
            await onChanged();
        });

    const remove = (itemId) =>
        run(async () => {
            upsert(await api.removeItem(ticket.id, itemId));
            await onChanged();
        });

    const generate = () =>
        run(async () => {
            onInvoice(await api.invoice(tableId), tableId);
        });

    const acknowledge = (reservationId) =>
        run(async () => {
            await api.setReservationStatus(reservationId, "ACKNOWLEDGED");
            await onChanged();
        });

    const panel = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";
    const inputClass =
        "px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all";
    const title = `Table ${tableNumber ?? tableId}`;

    const reservationBox = reservations.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <p className="font-bold uppercase tracking-wider">Today&apos;s Reservations</p>
            {reservations.map((r) => {
                const id = resId(r);
                const time = resTime(r) || "Time TBC";
                const name = r.guestName || r.customerName || "Registered Guest";
                const isAck = resStatus(r) === "ACKNOWLEDGED";

                return (
                    <div
                        key={id}
                        className="flex items-center justify-between gap-2 pt-1.5 border-t border-amber-200/60 first:border-0 first:pt-0"
                    >
                        <div>
                            <p className="font-semibold">
                                {time} — {name} {r.partySize ? `(${r.partySize} guests)` : ""}
                            </p>
                            {r.notes && <p className="text-[11px] opacity-80 mt-0.5">{r.notes}</p>}
                        </div>
                        {isAck ? (
                            <span className="shrink-0 px-2 py-1 rounded-md bg-green-100 text-green-800 font-bold uppercase text-[10px]">
                                Acknowledged
                            </span>
                        ) : (
                            <button
                                type="button"
                                disabled={working}
                                onClick={() => acknowledge(id)}
                                className="shrink-0 px-2.5 py-1 rounded-md bg-[#2C3E2D] hover:bg-[#1A251B] text-white font-semibold text-[11px] transition-colors disabled:opacity-50"
                            >
                                Acknowledge
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );

    if (bill) {
        return (
            <div className={panel}>
                <h2 className="font-serif text-xl font-bold text-[#2C3E2D] mb-2">{title}</h2>
                {reservationBox}
                <p className="text-sm text-[#2C3E2D]/60 mb-4">
                    The bill has been issued: <span className="font-bold text-[#D45D3C]">{money(bill.totalAmount)}</span>
                </p>
                <button
                    onClick={() => onInvoice(bill, tableId)}
                    className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                    <Receipt className="w-5 h-5" /> View invoice and take payment
                </button>
            </div>
        );
    }

    if (loadState === "loading") {
        return (
            <div className={panel}>
                <p className="text-sm text-gray-400">Loading…</p>
            </div>
        );
    }

    if (loadState === "error") {
        return (
            <div className={panel}>
                <h2 className="font-serif text-xl font-bold text-[#2C3E2D] mb-4">{title}</h2>
                <ErrorBanner message={error} />
                <button
                    onClick={loadTickets}
                    className="w-full bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className={panel}>
            <h2 className="font-serif text-xl font-bold text-[#2C3E2D] mb-4">{title}</h2>
            {reservationBox}
            <ErrorBanner message={error || menuError} />
            {menuError && (
                <button onClick={loadMenu} className="mb-4 text-xs font-bold text-[#D45D3C] hover:underline">
                    Reload menu
                </button>
            )}

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
                    {tickets.length > 1 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tickets.map((t) => (
                                <button
                                    key={t.id}
                                    aria-pressed={t.id === ticket.id}
                                    onClick={() => setActiveId(t.id)}
                                    className={pillClass(t.id === ticket.id)}
                                >
                                    Ticket #{t.id}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs uppercase tracking-widest font-bold text-[#2C3E2D]/50 mb-3">
                            Ticket #{ticket.id}
                        </p>
                    )}

                    <div className="flex gap-2 mb-5">
                        <select
                            aria-label="Menu item"
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
                            aria-label="Quantity"
                            type="number"
                            min="1"
                            max="99"
                            step="1"
                            inputMode="numeric"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className={`${inputClass} w-20`}
                        />
                        <button
                            onClick={add}
                            disabled={working}
                            className="bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-4 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50"
                            title="Add to bill"
                            aria-label="Add to bill"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {(ticket.items || []).length === 0 ? (
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
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Remove"
                                        aria-label={`Remove ${i.name}`}
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
                        disabled={working || (ticket.items || []).length === 0}
                        className="mt-6 w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Receipt className="w-5 h-5" /> Generate invoice
                    </button>
                </>
            )}
        </div>
    );
}

function loadLocalBills() {
    try {
        const parsed = JSON.parse(store.get("pendingInvoices"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
        return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v && typeof v === "object" && v.id != null));
    } catch {
        return {};
    }
}

function TablesPanel({ orders, reservations, tick, selected, onSelect, onRefresh }) {
    const [tables, setTables] = useState([]);
    const [invoice, setInvoice] = useState(null);
    const [error, setError] = useState("");
    const [bills, setBills] = useState(loadLocalBills);

    useEffect(() => {
        store.set("pendingInvoices", JSON.stringify(bills));
    }, [bills]);

    useEffect(() => {
        api.tables()
            .then((data) => {
                setTables(asList(data) || []);
                setError("");
            })
            .catch((e) => setError(e.message));
    }, []);

    const activeDineInTables = useMemo(
        () =>
            new Set(
                orders
                    .filter((o) => norm(o.orderType) === "DINE_IN" && !TERMINAL.includes(norm(o.status)))
                    .map((o) => o.tableId)
            ),
        [orders]
    );

    const reservationsByTable = useMemo(() => {
        const map = {};
        for (const r of reservations) {
            if (resStatus(r) === "CANCELLED") continue;
            const tId = r.tableId ?? r.restaurantTableId ?? r.table?.id;
            if (tId != null) (map[tId] ||= []).push(r);
        }
        return map;
    }, [reservations]);

    const issued = async (inv, tableId) => {
        const key = inv.tableId ?? tableId;
        setBills((b) => ({ ...b, [key]: { ...inv, tableId: key } }));
        setInvoice({ ...inv, tableId: key });
        await onRefresh();
    };

    const paid = async (inv) => {
        setBills((b) => {
            const copy = { ...b };
            delete copy[inv.tableId];
            return copy;
        });
        setInvoice(null);
        onSelect(null);
        await onRefresh();
    };

    const tileClass = (state, isSelected) => {
        const base =
            "rounded-2xl border-2 p-5 flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 hover:shadow-md";
        const colour =
            state === "billed"
                ? "bg-green-50 border-green-200 text-green-800"
                : state === "busy"
                    ? "bg-[#D45D3C]/10 border-[#D45D3C]/40 text-[#D45D3C]"
                    : state === "reserved"
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-white border-gray-200 text-[#2C3E2D]";
        return `${base} ${colour} ${isSelected ? "ring-2 ring-[#2C3E2D]" : ""}`;
    };

    const selectedTable = tables.find((t) => t.id === selected);

    return (
        <div>
            <ErrorBanner message={error} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start">
                    {tables.map((t) => {
                        const tableRes = reservationsByTable[t.id] || [];
                        const firstTime = resTime(tableRes[0] || {});
                        const state = bills[t.id]
                            ? "billed"
                            : activeDineInTables.has(t.id)
                                ? "busy"
                                : tableRes.length > 0
                                    ? "reserved"
                                    : "free";
                        const label =
                            state === "billed"
                                ? "Bill issued"
                                : state === "busy"
                                    ? "Occupied"
                                    : state === "reserved"
                                        ? `Reserved${firstTime ? ` (${firstTime})` : ""}`
                                        : "Free";

                        return (
                            <button
                                key={t.id}
                                aria-pressed={selected === t.id}
                                onClick={() => onSelect(t.id)}
                                className={tileClass(state, selected === t.id)}
                            >
                                <span className="font-serif text-3xl font-bold">{t.tableNumber ?? t.id}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                                {t.capacity && <span className="text-[11px] opacity-60">{t.capacity} seats</span>}
                            </button>
                        );
                    })}
                </div>

                <div>
                    {selectedTable ? (
                        <TicketPanel
                            key={selectedTable.id}
                            tableId={selectedTable.id}
                            tableNumber={selectedTable.tableNumber ?? selectedTable.id}
                            reservations={reservationsByTable[selectedTable.id] || []}
                            bill={bills[selectedTable.id]}
                            tick={tick}
                            onInvoice={issued}
                            onChanged={onRefresh}
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
        </div>
    );
}

export default function AdminPOS() {
    const navigate = useNavigate();
    const later = useLater();
    const [confirm, confirmDialog] = useConfirm();

    const [tab, setTab] = useState("kitchen");
    const [sound, setSound] = useState(true);
    const [audioReady, setAudioReady] = useState(isAudioUnlocked);
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState("");
    const [freshOrders, setFreshOrders] = useState(() => new Set());
    const [freshReservations, setFreshReservations] = useState(() => new Set());
    const [toasts, setToasts] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tick, setTick] = useState(0);

    const seenOrders = useRef(null);
    const seenReservations = useRef(null);
    const soundRef = useRef(sound);
    soundRef.current = sound;

    useEffect(() => {
        const unlock = async () => {
            const ok = await unlockAudio();
            setAudioReady(ok);
        };
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
        return () => {
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, []);

    const pushToast = useCallback(
        (toast) => {
            const id = `${Date.now()}-${Math.random()}`;
            setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 6));
            later(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 12000);
        },
        [later]
    );

    const poll = useCallback(
        async (signal) => {
            try {
                const today = isoDate(0);
                const [orderData, resData] = await Promise.all([
                    api.kitchen("", signal),
                    api.allReservations(signal)
                ]);
                if (signal.aborted) return;

                const safeOrders = asList(orderData);
                const allRes = asList(resData);
                if (!safeOrders || !allRes) throw new Error("Unexpected response from the server.");

                const upcomingRes = allRes.filter((r) => resDate(r) >= today);

                setOrders(safeOrders);
                setReservations(upcomingRes);
                setTick((t) => t + 1);
                setError("");

                const prevOrders = seenOrders.current;
                if (prevOrders) {
                    const newOrders = safeOrders.filter((o) => !prevOrders.has(o.id) && norm(o.status) === "PENDING");
                    if (newOrders.length > 0) {
                        const ids = newOrders.map((o) => o.id);
                        setFreshOrders((prev) => new Set([...prev, ...ids]));
                        if (soundRef.current) playAlert("order");
                        newOrders.forEach((o) => {
                            const isPickup = norm(o.orderType) !== "DINE_IN";
                            pushToast({
                                kind: "order",
                                targetTab: "kitchen",
                                title: isPickup ? `New Pickup Order #${o.id}` : `New Dine-in Order #${o.id}`,
                                subtitle: isPickup
                                    ? `${o.guestName || "Customer"} · ${money(o.total)}`
                                    : `Table ${o.tableId} · ${money(o.total)}`
                            });
                        });
                    }
                }
                seenOrders.current = new Set([...(prevOrders || []), ...safeOrders.map((o) => o.id)]);

                const prevRes = seenReservations.current;
                if (prevRes) {
                    const newRes = upcomingRes.filter((r) => !prevRes.has(resId(r)) && resStatus(r) !== "CANCELLED");
                    if (newRes.length > 0) {
                        const ids = newRes.map(resId);
                        setFreshReservations((prev) => new Set([...prev, ...ids]));
                        if (soundRef.current) playAlert("reservation");
                        newRes.forEach((r) => {
                            pushToast({
                                kind: "reservation",
                                targetTab: "reservations",
                                title: "New Table Reservation",
                                subtitle: `${r.guestName || "Guest"} · Table ${r.tableNumber ?? r.tableId} · ${dateLabel(resDate(r))} ${resTime(r) || "Time TBC"}`
                            });
                        });
                    }
                }
                seenReservations.current = new Set([...(prevRes || []), ...upcomingRes.map(resId)]);
            } catch (e) {
                if (e?.name !== "AbortError" && !(e instanceof AuthError)) setError(e.message);
                throw e;
            }
        },
        [pushToast]
    );

    const refresh = usePolling(poll, {
        onAuthError: () => navigate("/admin", { replace: true })
    });

    const markOrderSeen = useCallback((id) => {
        setFreshOrders((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const markReservationSeen = useCallback((id) => {
        setFreshReservations((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const pendingOrderCount = orders.filter((o) => norm(o.status) === "PENDING").length;
    const pendingReservationCount = reservations.filter((r) => resStatus(r) === "PENDING").length;
    const todaysReservations = reservations.filter((r) => resDate(r) === isoDate(0));

    const handleOpenToast = (toast) => {
        setTab(toast.targetTab);
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    };

    const openTable = (tableId) => {
        setSelectedTable(tableId);
        setTab("tables");
    };

    const toggleSound = async () => {
        const ok = await unlockAudio();
        setAudioReady(ok);
        if (!audioReady && sound) return;
        setSound((s) => !s);
    };

    return (
        <div className="max-w-7xl mx-auto font-sans pb-16 px-4 sm:px-8 pt-28">
            <ToastStack
                toasts={toasts}
                onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
                onOpen={handleOpenToast}
            />
            {confirmDialog}

            <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3E2D]/60 hover:text-[#D45D3C] transition-colors uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">Order Queue &amp; POS</h1>
                    <p className="text-[#2C3E2D]/60 text-sm">
                        Track food orders, table reservations, and dine-in billing in real time.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        aria-pressed={sound && audioReady}
                        onClick={toggleSound}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                            sound && !audioReady
                                ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                                : "bg-white border-gray-200 text-[#2C3E2D]/80 hover:text-[#D45D3C]"
                        }`}
                    >
                        {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        {!sound ? "Sound Off" : audioReady ? "Sound On" : "Click to Enable Sound"}
                    </button>

                    <button onClick={() => setTab("kitchen")} className={pillClass(tab === "kitchen")}>
                        Kitchen Orders
                        <UnreadBadge count={pendingOrderCount} />
                    </button>

                    <button onClick={() => setTab("reservations")} className={pillClass(tab === "reservations")}>
                        Reservations
                        <UnreadBadge count={pendingReservationCount} />
                    </button>

                    <button onClick={() => setTab("tables")} className={pillClass(tab === "tables")}>
                        Dine-in Tables
                    </button>
                </div>
            </div>

            <ErrorBanner message={error} />

            {tab === "kitchen" && (
                <KitchenBoard
                    orders={orders}
                    freshOrders={freshOrders}
                    onSeen={markOrderSeen}
                    onRefresh={refresh}
                    confirm={confirm}
                    onOpenTable={openTable}
                />
            )}
            {tab === "reservations" && (
                <ReservationsPanel
                    reservations={reservations}
                    freshReservations={freshReservations}
                    onSeen={markReservationSeen}
                    onRefresh={refresh}
                    confirm={confirm}
                />
            )}
            {tab === "tables" && (
                <TablesPanel
                    orders={orders}
                    reservations={todaysReservations}
                    tick={tick}
                    selected={selectedTable}
                    onSelect={setSelectedTable}
                    onRefresh={refresh}
                />
            )}
        </div>
    );
}