import React, { useState, useEffect } from 'react';

const CustomerMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [statusMessage, setStatusMessage] = useState("Loading menu items...");

    const [selectedItem, setSelectedItem] = useState(null);
    const [isAdded, setIsAdded] = useState(false);
    // NEW: Quantity state added here
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoryResponse = await fetch('http://localhost:8081/api/categories');
                if (categoryResponse.ok) {
                    const categoryData = await categoryResponse.json();
                    if (Array.isArray(categoryData)) {
                        const categoryNames = categoryData.map(cat => cat.name).sort((a, b) => a.localeCompare(b));
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

    const openModal = (item) => {
        setSelectedItem(item);
        setIsAdded(false);
        // NEW: Reset quantity to 1 every time a new item is opened
        setQuantity(1);
    };

    const handleAddToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem('piccolos_cart')) || [];
        const itemId = item.id || item.menuItemId;
        const itemIndex = existingCart.findIndex(cartItem => (cartItem.id || cartItem.menuItemId) === itemId);

        const itemImage = item.imageUrl || item.image_url;
        const itemCategory = item.category?.name || "MENU ITEM";

        if (itemIndex >= 0) {
            // NEW: Add the selected quantity instead of just +1
            existingCart[itemIndex].quantity += quantity;
        } else {
            existingCart.push({
                menuItemId: itemId,
                name: item.name,
                price: item.price,
                quantity: quantity, // NEW: Use selected quantity
                imageUrl: itemImage,
                category: itemCategory
            });
        }
        localStorage.setItem('piccolos_cart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setIsAdded(true);
    };

    return (
        <div style={{ padding: '120px 20px 40px', maxWidth: '1200px', margin: 'auto', fontFamily: "'Poppins', sans-serif", minHeight: '70vh' }}>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a1a' }}>OUR MENU</h2>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '30px',
                            border: 'none',
                            backgroundColor: selectedCategory === cat ? '#FFF4E5' : '#f8f9fa',
                            color: selectedCategory === cat ? '#D97706' : '#4b5563',
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: '800',
                            fontSize: '13px',
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

            <div style={{ marginBottom: '40px', position: 'relative', maxWidth: '450px' }}>
                <svg
                    style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>

                <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '16px 48px 16px 48px',
                        borderRadius: '30px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#fff',
                        outline: 'none',
                        fontSize: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease',
                        color: '#1a1a1a'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#8e2420';
                        e.target.style.boxShadow = '0 4px 20px rgba(142, 36, 32, 0.12)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.04)';
                    }}
                />

                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#f4f6f8',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f4f6f8'}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                {filteredMenu.map(item => (
                    <div
                        key={item.id || item.menuItemId}
                        onClick={() => openModal(item)}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                            border: '1px solid #f0f0f0',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            height: '240px',
                            backgroundColor: '#f8f9fa',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                backgroundColor: '#F59E0B',
                                color: '#000',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: '900',
                                fontSize: '16px',
                                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                                zIndex: 2
                            }}>
                                LKR {item.price.toLocaleString()}
                            </div>

                            {item.imageUrl || item.image_url ? (
                                <img
                                    src={item.imageUrl || item.image_url}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
                                />
                            ) : (
                                <span style={{ color: '#b0b0b0', fontSize: '14px', fontWeight: 'bold', zIndex: 1 }}>IMAGE PLACEHOLDER</span>
                            )}
                        </div>

                        <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: '#1a1a1a' }}>{item.name}</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{item.description || "A delicious selection prepared fresh daily."}</p>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMenu.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px', color: '#dc3545', fontWeight: 'bold' }}>{statusMessage}</p>}

            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        width: '100%',
                        maxWidth: '850px',
                        minHeight: '400px',
                        padding: '24px',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', fontWeight: 'bold' }}
                        >
                            ✕
                        </button>

                        <div style={{
                            flex: '1',
                            border: '1px solid #eaeaea',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            minHeight: '250px',
                            backgroundColor: '#f8f9fa'
                        }}>
                            {selectedItem.imageUrl || selectedItem.image_url ? (
                                <img src={selectedItem.imageUrl || selectedItem.image_url} alt={selectedItem.name} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                            ) : (
                                <span style={{ color: '#b0b0b0', fontWeight: 'bold' }}>IMAGE PLACEHOLDER</span>
                            )}
                        </div>

                        <div style={{ flex: '1', padding: window.innerWidth < 768 ? '20px 0 0 0' : '0 0 0 40px', display: 'flex', flexDirection: 'column' }}>

                            <div style={{
                                display: 'inline-block',
                                backgroundColor: '#f4f6f8',
                                color: '#666',
                                padding: '6px 14px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                alignSelf: 'flex-start',
                                marginBottom: '16px',
                                letterSpacing: '1px'
                            }}>
                                {selectedItem.category?.name || "MENU ITEM"}
                            </div>

                            <h2 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: '900', color: '#1a1a1a' }}>{selectedItem.name}</h2>

                            <div style={{
                                backgroundColor: '#F59E0B',
                                color: '#000',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: '900',
                                fontSize: '18px',
                                display: 'inline-block',
                                alignSelf: 'flex-start',
                                marginBottom: '24px',
                                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                            }}>
                                LKR {(selectedItem.price * quantity).toLocaleString()}
                            </div>

                            <hr style={{ borderTop: '1px solid #f0f0f0', width: '100%', margin: '0 0 24px 0' }} />

                            <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Description</div>
                            <p style={{ color: '#666', lineHeight: '1.6', margin: '0 0 auto 0', fontSize: '15px' }}>
                                {selectedItem.description || "A delicious selection prepared fresh daily."}
                            </p>

                            <div style={{ marginTop: 'auto' }}>
                                {/* NEW: Quantity Pill UI */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '800', textTransform: 'uppercase', marginRight: '16px' }}>Quantity</span>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '24px',
                                        padding: '4px 12px',
                                        width: 'fit-content'
                                    }}>
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '0 12px', color: '#334155', fontWeight: 'bold' }}
                                        >−</button>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 12px', minWidth: '20px', textAlign: 'center', color: '#1e293b' }}>{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '0 12px', color: '#334155', fontWeight: 'bold' }}
                                        >+</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        style={{ flex: 1, padding: '14px', backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', color: '#1a1a1a', fontSize: '15px' }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={() => handleAddToCart(selectedItem)}
                                        onMouseOver={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#a8322d')}
                                        onMouseOut={(e) => !isAdded && (e.currentTarget.style.backgroundColor = '#8e2420')}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            backgroundColor: isAdded ? '#2C3E2D' : '#8e2420',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            color: '#fff',
                                            fontSize: '15px',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {isAdded ? '✓ Added' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerMenu;