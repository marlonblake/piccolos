import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Utensils,
    X,
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
    isoDate,
    money,
    NEXT,
    norm,
    pillClass,
    resDate,
    resId,
    resStatus,
    resTime
} from "./queueApi";
import {
    isAudioUnlocked,
    playAlert,
    unlockAudio,
    useBusy,
    useConfirm,
    useLater,
    usePolling
} from "./queueUi";

const dateLabel = (iso) => (iso === isoDate(0) ? "Today" : iso === isoDate(1) ? "Tomorrow" : iso);

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

function OrderCard({ order, fresh, busy, onSeen, onMove }) {
    const status = norm(order.status);
    const next = NEXT[status];
    const pickupDate = String(order.pickupDate || "").slice(0, 10);
    const pickupTime = String(order.pickupTime || "").slice(0, 5);

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
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[#2C3E2D]/10 text-[#2C3E2D]">
                    Pickup
                </span>
            </div>

            <div className="mb-3 space-y-1">
                {order.guestName && (
                    <p className="text-sm font-semibold text-[#2C3E2D]/80">For {order.guestName}</p>
                )}
                {order.guestPhone && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-[#2C3E2D]/70">
                        <Phone className="w-3.5 h-3.5" /> {order.guestPhone}
                    </p>
                )}
                {(pickupDate || pickupTime) && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 mt-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Pickup: {pickupDate ? dateLabel(pickupDate) : ""}{pickupDate && pickupTime ? " · " : ""}{pickupTime}
                    </div>
                )}
            </div>

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
                {next && (
                    <button
                        disabled={busy}
                        onClick={() => onMove(order, next.to)}
                        className="bg-[#2C3E2D] hover:bg-[#1A251B] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md disabled:opacity-50"
                    >
                        {next.label}
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

function KitchenBoard({ orders, freshOrders, onSeen, onRefresh, confirm }) {
    const [error, setError] = useState("");
    const busy = useBusy();

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

    return (
        <div>
            <ErrorBanner message={error} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map((col) => {
                    const list = orders.filter((o) => norm(o.status) === col.status);
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
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

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
                    api.kitchen(signal),
                    api.allReservations(signal)
                ]);
                if (signal.aborted) return;

                const safeOrders = asList(orderData);
                const allRes = asList(resData);
                if (!safeOrders || !allRes) throw new Error("Unexpected response from the server.");

                const upcomingRes = allRes.filter((r) => resDate(r) >= today);

                setOrders(safeOrders);
                setReservations(upcomingRes);
                setError("");

                const prevOrders = seenOrders.current;
                if (prevOrders) {
                    const newOrders = safeOrders.filter((o) => !prevOrders.has(o.id) && norm(o.status) === "PENDING");
                    if (newOrders.length > 0) {
                        const ids = newOrders.map((o) => o.id);
                        setFreshOrders((prev) => new Set([...prev, ...ids]));
                        if (soundRef.current) playAlert("order");
                        newOrders.forEach((o) => {
                            const pickupSlot = o.pickupTime ? ` · ${String(o.pickupTime).slice(0, 5)}` : "";
                            pushToast({
                                kind: "order",
                                targetTab: "kitchen",
                                title: `New Pickup Order #${o.id}`,
                                subtitle: `${o.guestName || "Customer"}${pickupSlot} · ${money(o.total)}`
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

    const handleOpenToast = (toast) => {
        setTab(toast.targetTab);
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
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
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">
                        Order Queue
                    </h1>
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
                        Order Queue
                        <UnreadBadge count={pendingOrderCount} />
                    </button>

                    <button onClick={() => setTab("reservations")} className={pillClass(tab === "reservations")}>
                        Reservations
                        <UnreadBadge count={pendingReservationCount} />
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
        </div>
    );
}