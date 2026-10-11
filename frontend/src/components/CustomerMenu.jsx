import React, { useState, useEffect } from 'react';

const CustomerMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Appetizers");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        "Appetizers 🍟", "Signature Range 🍕", "Premium Range 🍕",
        "Loaded Fries 🍟", "Wraps 🌯", "Spaghetti 🍝", "Pasta - Penne 🍝",
        "Healthy Bowls 🥗", "Fresh Juice 🍹", "Mojito 🍹", "Iced Tea 🍹",
        "Milkshakes 🥤", "Hot Beverages ☕", "Soft Drinks 🥤", "Desserts 🍰",
        "Signature Platter 🍛", "Signature Fried Rice 🍚", "Nasi-Goreng 🍛",
        "Mongolian Fried Rice 🍚", "Rice Specialties 🍚", "Two Person Executive Packs 🍱",
        "Chopsuey Rice 🍚", "Chicken Specialties 🍗", "Beef Specialties 🥩",
        "Prawns Specialties 🍤", "Mutton Specialties 🍖", "Fish Specialties 🐟"
    ];

    useEffect(() => {
        fetch('http://localhost:8081/api/menu')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch menu');
                return response.json();
            })
            .then(data => {
                setMenuItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const addToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem('cartItems')) || [];
        const existingItemIndex = existingCart.findIndex(cartItem => cartItem.menuItemId === item.id);

        if (existingItemIndex >= 0) {
            existingCart[existingItemIndex].quantity += 1;
        } else {
            existingCart.push({
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        localStorage.setItem('cartItems', JSON.stringify(existingCart));

        const btn = document.getElementById(`add-btn-${item.id}`);
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = "Added!";
            btn.classList.add("bg-green-600");
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove("bg-green-600");
            }, 1000);
        }
    };

    const filteredItems = menuItems.filter(item => {
        // Filters items based on the search bar text
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading) return <div className="text-center mt-20 text-xl font-semibold text-gray-800">Loading menu...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-white text-gray-900 p-6 font-sans">
            <div className="max-w-7xl mx-auto mb-6">

                {/* Search Bar & Filter Icon */}
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-[#C1432E]"
                        />
                        <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    <button className="bg-white p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-300">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                        </svg>
                    </button>
                </div>

                {/* Category Pills with Scrollbar Hidden */}
                <div
                    className="flex space-x-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map(cat => {
                        const baseCategory = cat.split(" ")[0];
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(baseCategory)}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                                    activeCategory === baseCategory
                                        ? "bg-[#C1432E] text-white border-[#C1432E]"
                                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Menu Header */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
                    <div>
                        <span className="text-xs text-gray-500 mb-1 block">{filteredItems.length} items found</span>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                            {activeCategory}
                        </h2>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="flex flex-col bg-white rounded-xl overflow-hidden cursor-pointer transform transition-transform hover:-translate-y-1 hover:shadow-xl group border border-gray-200 shadow-sm"
                        >
                            {/* Card Image Half - Beige Background */}
                            <div className="bg-[#f4ebd9] h-56 w-full flex items-center justify-center p-6 relative">
                                <img
                                    src={item.imageUrl || "https://via.placeholder.com/200?text=Food+Image"}
                                    alt={item.name}
                                    className="max-h-full object-contain drop-shadow-xl"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                    <span id={`add-btn-${item.id}`} className="opacity-0 group-hover:opacity-100 bg-[#C1432E] text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all transform translate-y-4 group-hover:translate-y-0">
                                        + Add to Cart
                                    </span>
                                </div>
                            </div>

                            {/* Card Text Half */}
                            <div className="p-5 flex flex-col flex-grow bg-white">
                                <h3 className="text-md font-bold text-gray-800 mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-600 mb-2 font-medium">LKR {item.price.toFixed(2)}</p>

                                {item.isVegetarian && (
                                    <span className="text-xs text-green-600 mb-2 block font-semibold">Vegetarian</span>
                                )}

                                <p className="text-xs text-gray-500 line-clamp-2 mt-auto">
                                    {item.description || "Freshly prepared ingredients with signature spices."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomerMenu;