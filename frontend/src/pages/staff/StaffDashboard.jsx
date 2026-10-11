import { useState } from 'react';
import KitchenBoard from '../../components/staff/KitchenBoard';
import TablesPanel from '../../components/staff/TablesPanel';
import '../../components/staff/staff.css';

export default function StaffDashboard() {
    const [tab, setTab] = useState('kitchen');

    return (
        <div className="staff">
            <header className="staff-header">
                <h1>Piccolos Staff</h1>
                <nav className="staff-tabs">
                    <button className={tab === 'kitchen' ? 'active' : ''} onClick={() => setTab('kitchen')}>
                        Kitchen orders
                    </button>
                    <button className={tab === 'tables' ? 'active' : ''} onClick={() => setTab('tables')}>
                        Dine-in tables
                    </button>
                </nav>
            </header>
            {tab === 'kitchen' ? <KitchenBoard /> : <TablesPanel />}
        </div>
    );
}