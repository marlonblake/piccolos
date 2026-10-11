import { useCallback, useEffect, useRef, useState } from 'react';
import { staffApi, money } from '../../api/staffApi';

const COLUMNS = [
    { status: 'PENDING', title: 'New' },
    { status: 'PREPARING', title: 'Preparing' },
    { status: 'READY', title: 'Ready' },
];

const NEXT = {
    PENDING: { to: 'PREPARING', label: 'Start preparing' },
    PREPARING: { to: 'READY', label: 'Mark ready' },
    READY: { to: 'COMPLETED', label: 'Complete order' },
};

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

function OrderCard({ order, fresh, onMove }) {
    const status = (order.status || '').toUpperCase();
    const dineIn = (order.orderType || '').toUpperCase() === 'DINE_IN';
    const next = NEXT[status];

    const cancel = () => {
        if (window.confirm(`Cancel order #${order.id}?`)) onMove(order, 'CANCELLED');
    };

    return (
        <article className={`card ${fresh ? 'fresh' : ''}`}>
            <div className="card-head">
                <strong>Order #{order.id}</strong>
                <span className={`badge ${dineIn ? 'dine' : 'pickup'}`}>
          {dineIn ? `Table ${order.tableId}` : 'Pickup'}
        </span>
            </div>
            {!dineIn && order.guestName && <p className="muted">For {order.guestName}</p>}
            <ul className="items">
                {order.items.map((i) => (
                    <li key={i.id}>
                        {i.quantity} × {i.name}
                    </li>
                ))}
            </ul>
            <div className="card-foot">
                <span>{money(order.total)}</span>
            </div>
            <div className="actions">
                {status === 'READY' && dineIn ? (
                    <span className="muted">Waiting for payment</span>
                ) : (
                    next && (
                        <button className="primary" onClick={() => onMove(order, next.to)}>
                            {next.label}
                        </button>
                    )
                )}
                {(status === 'PENDING' || status === 'PREPARING') && (
                    <button className="ghost" onClick={cancel}>
                        Cancel
                    </button>
                )}
            </div>
        </article>
    );
}

export default function KitchenBoard() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');
    const [fresh, setFresh] = useState(new Set());
    const [sound, setSound] = useState(true);
    const seen = useRef(null);
    const soundRef = useRef(sound);
    soundRef.current = sound;

    const load = useCallback(async () => {
        try {
            const data = await staffApi.kitchen(filter);
            setOrders(data);
            setError('');
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
        const timer = setInterval(load, 5000);
        return () => clearInterval(timer);
    }, [load]);

    const move = async (order, status) => {
        try {
            await staffApi.setStatus(order.id, status);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <section>
            <div className="toolbar">
                <div className="seg">
                    {[
                        ['', 'All'],
                        ['PICKUP', 'Pickup'],
                        ['DINE_IN', 'Dine-in'],
                    ].map(([value, label]) => (
                        <button key={label} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
                            {label}
                        </button>
                    ))}
                </div>
                <label className="check">
                    <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
                    Sound alert for new orders
                </label>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="board">
                {COLUMNS.map((col) => {
                    const list = orders.filter((o) => (o.status || '').toUpperCase() === col.status);
                    return (
                        <div className="column" key={col.status}>
                            <h2>
                                {col.title} <span className="count">{list.length}</span>
                            </h2>
                            {list.length === 0 && <p className="muted">Nothing here</p>}
                            {list.map((o) => (
                                <OrderCard key={o.id} order={o} fresh={fresh.has(o.id)} onMove={move} />
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}