import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const cards = [
        {
            title: "Menu Management",
            description: "Add, edit, and remove menu items",
            icon: "🍽️",
            path: "/admin/menu",
            ready: true
        },
        {
            title: "Orders",
            description: "View and manage incoming orders",
            icon: "📝",
            path: "/admin/orders",
            ready: false
        },
        {
            title: "Reservations",
            description: "Manage table reservations",
            icon: "🪑",
            path: "/admin/reservations",
            ready: false
        },
        {
            title: "Stats & Reports",
            description: "View sales and performance stats",
            icon: "📈",
            path: "/admin/stats",
            ready: false
        }
    ];

    const handleClick = (card) => {
        if (card.ready) {
            navigate(card.path);
        } else {
            alert(`${card.title} isn't built yet — coming soon.`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#FDFBF7] pt-28 pb-16 px-4 sm:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-[#2C3E2D]/60 mb-10">Choose a section to manage</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card) => (
                        <button
                            key={card.title}
                            onClick={() => handleClick(card)}
                            className={`relative text-left bg-white rounded-2xl p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg
                                ${card.ready ? "" : "opacity-70"}`}
                        >
                            {!card.ready && (
                                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider bg-[#2C3E2D]/10 text-[#2C3E2D] px-2 py-1 rounded-full">
                                    Coming soon
                                </span>
                            )}

                            <div className="text-3xl mb-4">{card.icon}</div>

                            <h2 className="font-serif text-lg font-bold text-[#2C3E2D] mb-1">
                                {card.title}
                            </h2>
                            <p className="text-sm text-[#2C3E2D]/60">{card.description}</p>

                            <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-[#D45D3C]">
                                {card.ready ? "Open" : "Locked"} →
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;