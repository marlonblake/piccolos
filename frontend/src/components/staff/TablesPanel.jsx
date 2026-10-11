import { useCallback, useEffect, useState } from 'react';
import { staffApi, money } from '../../api/staffApi';

const TABLE_COUNT = 10; // change this to match your restaurant

function InvoiceModal({ invoice, onClose, onPaid }) {
    const [error, setError] = useState('');
    const [working, setWorking] = useState(false);

    const pay = async () => {
        setWorking(true);
        try {
            await staffApi.pay(invoice.id);
            onPaid(invoice);
        } catch (e) {
            setError(e.message);
            setWorking(false);
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Invoice #{invoice.id}</h2>
                <p className="muted">Table {invoice.tableId}</p>
                <dl className="totals">
                    <div>
                        <dt>Subtotal</dt>
                        <dd>{money(invoice.subtotal)}</dd>
                    </div>
                    <div>
                        <dt>Tax</dt>
                        <dd>{money(invoice.taxAmount)}</dd>
                    </div>
                    <div className="grand">
                        <dt>Total</dt>
                        <dd>{money(invoice.totalAmount)}</dd>
                    </div>
                </dl>
                {error && <p className="error">{error}</p>}
                <div className="actions">
                    <button className="primary" onClick={pay} disabled={working}>
                        Mark as paid
                    </button>
                    <button className="ghost" onClick={onClose}>
                        Close
                    </button>
                    {error && (
                        <button className="ghost" onClick={() => onPaid(invoice)}>
                            Clear this bill
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
    const [menuItemId, setMenuItemId] = useState('');
    const [qty, setQty] = useState(1);
    const [error, setError] = useState('');
    const [working, setWorking] = useState(false);

    const loadTicket = useCallback(async () => {
        try {
            const list = await staffApi.openTickets(tableId);
            setTicket(list[0] || null);
            setError('');
        } catch (e) {
            setError(e.message);
        }
        setLoaded(true);
    }, [tableId]);

    useEffect(() => {
        if (!bill) loadTicket();
    }, [bill, loadTicket]);

    useEffect(() => {
        staffApi
            .menu()
            .then((data) => setMenu(Array.isArray(data) ? data : data?.content || []))
            .catch(() => setError('Could not load the menu'));
    }, []);

    const run = async (action) => {
        setWorking(true);
        try {
            await action();
            setError('');
        } catch (e) {
            setError(e.message);
        }
        setWorking(false);
    };

    const open = () =>
        run(async () => {
            setTicket(await staffApi.openTicket(tableId));
            onChanged();
        });

    const add = () =>
        run(async () => {
            if (!menuItemId) throw new Error('Choose a menu item first');
            setTicket(await staffApi.addItem(ticket.id, Number(menuItemId), Number(qty)));
            setQty(1);
            onChanged();
        });

    const remove = (itemId) =>
        run(async () => {
            setTicket(await staffApi.removeItem(ticket.id, itemId));
            onChanged();
        });

    const generate = () =>
        run(async () => {
            onInvoice(await staffApi.invoice(tableId));
        });

    if (bill) {
        return (
            <div className="panel">
                <h2>Table {tableId}</h2>
                <p>
                    The bill has been issued: <strong>{money(bill.totalAmount)}</strong>
                </p>
                <button className="primary" onClick={() => onInvoice(bill)}>
                    View invoice and take payment
                </button>
            </div>
        );
    }

    if (!loaded) {
        return (
            <div className="panel">
                <p className="muted">Loading…</p>
            </div>
        );
    }

    return (
        <div className="panel">
            <h2>Table {tableId}</h2>
            {error && <p className="error">{error}</p>}

            {!ticket ? (
                <button className="primary" onClick={open} disabled={working}>
                    Open ticket
                </button>
            ) : (
                <>
                    <p className="muted">Ticket #{ticket.id}</p>
                    <div className="add-row">
                        <select value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)}>
                            <option value="">Choose a menu item…</option>
                            {menu.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({money(m.price)})
                                </option>
                            ))}
                        </select>
                        <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
                        <button className="primary" onClick={add} disabled={working}>
                            Add
                        </button>
                    </div>

                    {ticket.items.length === 0 ? (
                        <p className="muted">No items yet.</p>
                    ) : (
                        <table className="bill">
                            <tbody>
                            {ticket.items.map((i) => (
                                <tr key={i.id}>
                                    <td>
                                        {i.quantity} × {i.name}
                                    </td>
                                    <td className="right">{money(i.lineTotal)}</td>
                                    <td className="right">
                                        <button className="ghost" onClick={() => remove(i.id)} disabled={working}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td>Subtotal</td>
                                <td className="right">{money(ticket.total)}</td>
                                <td />
                            </tr>
                            </tfoot>
                        </table>
                    )}

                    <button
                        className="primary wide"
                        onClick={generate}
                        disabled={working || ticket.items.length === 0}
                    >
                        Generate invoice
                    </button>
                </>
            )}
        </div>
    );
}

export default function TablesPanel() {
    const [selected, setSelected] = useState(null);
    const [busy, setBusy] = useState(new Set());
    const [invoice, setInvoice] = useState(null);
    const [bills, setBills] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pendingInvoices')) || {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem('pendingInvoices', JSON.stringify(bills));
    }, [bills]);

    const refreshOccupied = useCallback(async () => {
        try {
            const data = await staffApi.kitchen('DINE_IN');
            setBusy(new Set(data.map((o) => o.tableId)));
        } catch {
            /* the ticket panel shows connection errors */
        }
    }, []);

    useEffect(() => {
        refreshOccupied();
        const timer = setInterval(refreshOccupied, 5000);
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

    return (
        <section className="tables-layout">
            <div className="tables-grid">
                {Array.from({ length: TABLE_COUNT }, (_, i) => i + 1).map((n) => {
                    const state = bills[n] ? 'billed' : busy.has(n) ? 'busy' : 'free';
                    const label = state === 'billed' ? 'Bill issued' : state === 'busy' ? 'Occupied' : 'Free';
                    return (
                        <button
                            key={n}
                            className={`table ${state} ${selected === n ? 'selected' : ''}`}
                            onClick={() => setSelected(n)}
                        >
                            <span className="num">{n}</span>
                            <span className="state">{label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="ticket-area">
                {selected ? (
                    <TicketPanel
                        key={selected}
                        tableId={selected}
                        bill={bills[selected]}
                        onInvoice={issued}
                        onChanged={refreshOccupied}
                    />
                ) : (
                    <p className="muted">Select a table to open or edit its ticket.</p>
                )}
            </div>

            {invoice && <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} onPaid={paid} />}
        </section>
    );
}