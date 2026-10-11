const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export const money = (v) => `Rs. ${Number(v ?? 0).toFixed(2)}`;

async function request(path, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            if (body.message) message = body.message;
        } catch {
            /* the server sent no JSON body */
        }
        throw new Error(message);
    }
    return res.status === 204 ? null : res.json();
}

export const staffApi = {
    kitchen: (type) => request(`/staff/orders/kitchen${type ? `?type=${type}` : ''}`),
    setStatus: (id, status) => request(`/staff/orders/${id}/status?status=${status}`, { method: 'PUT' }),
    openTicket: (tableId) => request(`/staff/tickets?tableId=${tableId}`, { method: 'POST' }),
    openTickets: (tableId) => request(`/staff/tables/${tableId}/tickets`),
    addItem: (orderId, menuItemId, quantity) =>
        request(`/staff/tickets/${orderId}/items`, {
            method: 'POST',
            body: JSON.stringify({ menuItemId, quantity }),
        }),
    removeItem: (orderId, itemId) => request(`/staff/tickets/${orderId}/items/${itemId}`, { method: 'DELETE' }),
    invoice: (tableId) => request(`/staff/tables/${tableId}/invoice`, { method: 'POST' }),
    pay: (invoiceId) => request(`/staff/invoices/${invoiceId}/pay`, { method: 'PATCH' }),
    menu: () => request('/menu'),
};