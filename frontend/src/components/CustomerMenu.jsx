import React, { useState, useEffect } from 'react';

const CustomerMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [statusMessage, setStatusMessage] = useState("Loading menu items...");

    // States for the modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAdded, setIsAdded] = useState(false);

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

    const openModal = (item) => {
        setSelectedItem(item);
        setIsAdded(false);
    };

    const handleAddToCart = (item) => {
        const existingCart = JSON.parse(localStorage.getItem('piccolos_cart')) || [];
        const itemId = item.id || item.menuItemId;
        const itemIndex = existingCart.findIndex(cartItem => (cartItem.id || cartItem.menuItemId) === itemId);

        // Safely grab the image whether the backend sends it as imageUrl or image_url
        const itemImage = item.imageUrl || item.image_url;
        const itemCategory = item.category?.name || "MENU ITEM";

        if (itemIndex >= 0) {
            existingCart[itemIndex].quantity += 1;
        } else {
            existingCart.push({
                menuItemId: itemId,
                name: item.name,
                price: item.price,
                quantity: 1,
                imageUrl: itemImage,
                category: itemCategory
            });
        }
        localStorage.setItem('piccolos_cart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('cartUpdated'));

        setIsAdded(true);
    };

    return (
        <div style={{ padding: '120px 20px 40px', maxWidth: '1200px', margin: 'auto', fontFamily: 'sans-serif', minHeight: '70vh' }}>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
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
                            {item.imageUrl || item.image_url ? (
                                <img
                                    src={item.imageUrl || item.image_url}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ color: '#ccc', fontSize: '14px', fontWeight: 'bold' }}>NO IMAGE</span>
                            )}
                        </div>

                        <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>{item.name}</h3>
                            <div style={{ color: '#F59E0B', fontWeight: '900', fontSize: '16px' }}>LKR {item.price.toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMenu.length === 0 && <p style={{ textAlign: 'center', marginTop: '40px', color: '#dc3545', fontWeight: 'bold' }}>{statusMessage}</p>}

            {/* MODAL OVERLAY WITH ORIGINAL BRANDING */}
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
                        {/* Close Icon */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', fontWeight: 'bold' }}
                        >
                            ✕
                        </button>

                        {/* Left: Image Container */}
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
                                <span style={{ color: '#ccc', fontWeight: 'bold' }}>NO IMAGE</span>
                            )}
                        </div>

                        {/* Right: Details Container */}
                        <div style={{ flex: '1', padding: window.innerWidth < 768 ? '20px 0 0 0' : '0 0 0 40px', display: 'flex', flexDirection: 'column' }}>

                            {/* Category Badge */}
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

                            {/* Original Yellow Price Badge */}
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
                                LKR {selectedItem.price.toLocaleString()}
                            </div>

                            <hr style={{ borderTop: '1px solid #f0f0f0', width: '100%', margin: '0 0 24px 0' }} />

                            <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Description</div>
                            <p style={{ color: '#666', lineHeight: '1.6', margin: '0 0 auto 0', fontSize: '15px' }}>
                                {selectedItem.description || "A delicious selection prepared fresh daily."}
                            </p>

                            {/* Buttons with Original Red */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
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
            )}
        </div>
    );
};

export default CustomerMenu;