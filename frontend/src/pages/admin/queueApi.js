const API = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const POLL_MS = 5000;
export const RESTAURANT_TZ = "Asia/Colombo";

export class AuthError extends Error {
    constructor(message = "Not authorised. Please log in as an admin again.") {
        super(message);
        this.name = "AuthError";
    }
}

export const store = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch {
            /* ignore */
        }
    }
};

const moneyFmt = new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (v) => `Rs. ${moneyFmt.format(Number(v ?? 0))}`;

export const norm = (v) => String(v ?? "").toUpperCase();
export const resStatus = (r) => norm(r.status) || "PENDING";
export const resId = (r) => r.reservationId ?? r.id;
export const resTime = (r) => String(r.reservationTime || r.time || "").slice(0, 5);
export const resDate = (r) => String(r.reservationDate || r.date || "").slice(0, 10);

const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: RESTAURANT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});
export const isoDate = (offsetDays = 0) => dateFmt.format(new Date(Date.now() + offsetDays * 86400000));

export const asList = (data) => (Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : null);

async function request(path, { auth = true, headers: extraHeaders, ...options } = {}) {
    const token = store.get("adminToken");

    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
            ...extraHeaders
        }
    });

    if (response.status === 401) {
        store.remove("adminToken");
        throw new AuthError();
    }
    if (response.status === 403) {
        throw new Error("Access denied (403). You do not have permission for this action.");
    }
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try {
            const body = await response.json();
            if (body.message) message = body.message;
        } catch {
            // no JSON body
        }
        throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
}

const q = encodeURIComponent;

export const api = {
    kitchen: (signal) => request("/admin/orders/kitchen", { signal }),
    setStatus: (id, status) => request(`/admin/orders/${id}/status?status=${q(status)}`, { method: "PUT" }),
    allReservations: (signal) => request("/admin/reservations", { signal }),
    setReservationStatus: (id, status) =>
        request(`/admin/reservations/${id}/status?status=${q(status)}`, { method: "PATCH" })
};

export const COLUMNS = [
    { status: "PENDING", title: "New" },
    { status: "PREPARING", title: "Preparing" },
    { status: "READY", title: "Ready" }
];

export const NEXT = {
    PENDING: { to: "PREPARING", label: "Start preparing" },
    PREPARING: { to: "READY", label: "Mark ready" },
    READY: { to: "COMPLETED", label: "Complete order" }
};

export const pillClass = (active) =>
    `relative inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        active
            ? "bg-[#2C3E2D] text-white shadow-md"
            : "bg-gray-50 text-[#2C3E2D] hover:bg-gray-100 border border-gray-200"
    }`;