import React, { useState, useEffect } from 'react';

const CustomerMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [statusMessage, setStatusMessage] = useState("Loading menu items...");
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoryResponse = await fetch('http://localhost:8081/api/categories');
                if (categoryResponse.ok) {
                    const categoryData = await categoryResponse.json();
                    if (Array.isArray(categoryData)) {
                        const categoryNames = categoryData.map(cat => cat.name);
                        setCategories(["All", ...categoryNames]);
                    }
                }

                const menuResponse = await fetch('http://localhost:8081/api/menu');
                if (menuResponse.ok) {
                    const menuData = await menuResponse.json();
                    if (Array.isArray(menuData)) {
                        setMenuItems(menuData);
                        if (menuData.length === 0) setStatusMessage("Database is connected, but the menu is empty.");
                    } else if (menuData && Array.isArray(menuData.content)) {
                        setMenuItems(menuData.content);
                    } else if (menuData && Array.isArray(menuData.data)) {
                        setMenuItems(menuData.data);
                    } else {
                        setStatusMessage("Error: Backend connected, but data format is unrecognized.");
                    }
                } else {
                    setStatusMessage(`Connection blocked by backend. Error Status: ${menuResponse.status}`);
                }
            } catch (error) {
                setStatusMessage(`Frontend Network Error: ${error.message}`);
            }
        };
        fetchData();
    }, []);

    const filteredMenu = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

        let itemCategoryName = "Unknown";
        if (item.category && item.category.name) {
            itemCategoryName = item.category.name;
        } else {
            const categoryMap = { 1: "Appetizers", 2: "Pizza", 3: "Lasagna", 4: "Wraps", 5: "Spaghetti", 6: "Drinks", 7: "Desserts" };
            itemCategoryName = categoryMap[item.category_id || item.categoryId] || "Unknown";
        }

        const matchesCategory = selectedCategory === "All" || itemCategoryName === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem('piccolos_cart')) || [];
        const itemId = item.id || item.menuItemId;
        const itemIndex = existingCart.findIndex(cartItem => (cartItem.id || cartItem.menuItemId) === itemId);

        if (itemIndex >= 0) {
            existingCart[itemIndex].quantity += 1;
        } else {
            existingCart.push({ menuItemId: itemId, name: item.name, price: item.price, quantity: 1 });
        }
        localStorage.setItem('piccolos_cart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setToastMessage(`${item.name} added to cart!`);
        setTimeout(() => {
            setToastMessage("");
        }, 3000);
    };

    return (
        <div style={{ padding: '120px 20px 40px', maxWidth: '1200px', margin: 'auto', fontFamily: 'sans-serif', minHeight: '70vh' }}>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#8e2420', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
                    🍕
                </div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Menu</h2>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '30px',
                            border: 'none',
                            backgroundColor: selectedCategory === cat ? '#FFF4E5' : '#f4f6f8',
                            color: selectedCategory === cat ? '#D97706' : '#666',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '30px', border: '1px solid #e0e0e0', backgroundColor: '#f9fafb', outline: 'none', fontSize: '15px' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                {filteredMenu.map(item => (
                    <div key={item.id || item.menuItemId} style={{
                        backgroundColor: '#fff',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            height: '240px',
                            backgroundColor: '#f8f9fa',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ color: '#ccc', fontSize: '14px', fontWeight: 'bold' }}>IMAGE PLACEHOLDER</span>

                            <div style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                backgroundColor: '#F59E0B',
                                color: '#000',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontWeight: '900',
                                fontSize: '15px',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                            }}>
                                LKR {item.price.toLocaleString()}
                            </div>
                        </div>

                        <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>{item.name}</h3>
                            {item.description && <p style={{ color: '#666', fontSize: '13px', margin: '0 0 20px 0' }}>{item.description}</p>}

                            <div style={{ marginTop: 'auto' }}>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: '#8e2420',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '15px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a8322d'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8e2420'}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMenu.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px', color: '#dc3545', fontWeight: 'bold' }}>{statusMessage}</p>}

            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    backgroundColor: '#2C3E2D',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '20px' }}>🍕</span> {toastMessage}
                </div>
            )}
        </div>
    );
};

export default CustomerMenu;