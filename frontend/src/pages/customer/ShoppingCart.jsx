import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const getDefaultPickup = () => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}` };
};

const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('piccolos_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const defaultPickup = getDefaultPickup();
    const [pickupDate, setPickupDate] = useState(defaultPickup.date);
    const [pickupTime, setPickupTime] = useState(defaultPickup.time);
    const [checkoutError, setCheckoutError] = useState("");

    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestError, setGuestError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [orderSuccess, setOrderSuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const navigate = useNavigate();

    const updateCartState = (newCart) => {
        setCartItems(newCart);
        localStorage.setItem('piccolos_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const increaseQuantity = (index) => {
        const newCart = [...cartItems];
        newCart[index] = { ...newCart[index], quantity: newCart[index].quantity + 1 };
        updateCartState(newCart);
    };

    const decreaseQuantity = (index) => {
        const newCart = [...cartItems];
        if (newCart[index].quantity > 1) {
            newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 };
        } else {
            newCart.splice(index, 1);
        }
        updateCartState(newCart);
    };

    const deleteItem = (index) => {
        const newCart = [...cartItems];
        newCart.splice(index, 1);
        updateCartState(newCart);
    };

    const clearCart = () => {
        updateCartState([]);
        setToastMessage("Cart cleared!");
        setTimeout(() => {
            setToastMessage("");
        }, 3000);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2);
    };

    const formatSizeLabel = (size) => {
        if (!size) return null;
        const cleaned = String(size).replace(/"/g, '').trim();
        if (!cleaned) return null;
        return `${cleaned}"`;
    };

    const validatePickupSlot = () => {
        if (!pickupDate || !pickupTime) {
            return "Please select a pickup date and time.";
        }
        const selected = new Date(`${pickupDate}T${pickupTime}:00`);
        if (Number.isNaN(selected.getTime()) || selected < new Date()) {
            return "Pickup time cannot be in the past.";
        }
        return "";
    };

    const handleInitiateCheckout = () => {
        setCheckoutError("");
        if (cartItems.length === 0) {
            setCheckoutError("Your cart is empty!");
            return;
        }

        const slotError = validatePickupSlot();
        if (slotError) {
            setCheckoutError(slotError);
            return;
        }

        const token = localStorage.getItem('customerToken');
        if (token) {
            const userId = localStorage.getItem('userId');
            processOrder(userId ? Number(userId) : null);
        } else {
            setShowGuestForm(false);
            setGuestError("");
            setShowAuthPrompt(true);
        }
    };

    const handleGuestSubmit = (e) => {
        e.preventDefault();
        setGuestError("");

        if (!guestName.trim() || !guestPhone.trim()) {
            setGuestError("Please enter both your name and phone number.");
            return;
        }

        processOrder(null, guestName.trim(), guestPhone.trim());
    };

    const processOrder = async (userId = null, gName = null, gPhone = null) => {
        setSubmitting(true);
        const orderPayload = {
            userId: userId,
            guestName: userId ? null : gName,
            guestPhone: userId ? null : gPhone,
            pickupDate: pickupDate,
            pickupTime: `${pickupTime}:00`,
            orderType: "PICKUP",
            total: Number(calculateTotal()),
            items: cartItems.map(item => ({
                menuItemId: item.menuItemId || item.id,
                quantity: item.quantity,
                size: item.size || null,
                price: Number(item.price)
            }))
        };

        try {
            const headers = { 'Content-Type': 'application/json' };
            const token = localStorage.getItem('customerToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/checkout`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                setOrderSuccess(true);
                updateCartState([]);
                setShowAuthPrompt(false);
                setShowGuestForm(false);
            } else {
                const errText = await response.text();
                const message = errText || "Failed to place order. Please try again.";
                if (showAuthPrompt) {
                    setGuestError(message);
                } else {
                    setCheckoutError(message);
                }
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            const message = "Could not connect to the backend.";
            if (showAuthPrompt) {
                setGuestError(message);
            } else {
                setCheckoutError(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={{ padding: '160px 20px 60px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif', textAlign: 'center', minHeight: '75vh' }}>
                <div style={{ backgroundColor: '#fff', padding: '50px 30px', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 24px auto' }}>
                        ✓
                    </div>
                    <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#1a1a1a', marginBottom: '12px' }}>Order Placed Successfully!</h2>
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '10px', lineHeight: '1.5' }}>
                        Thank you for your order. Your pickup is scheduled for <strong>{pickupDate} at {pickupTime}</strong>.
                    </p>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '30px' }}>
                        The kitchen has received it and will have it ready for collection.
                    </p>
                    <button
                        onClick={() => navigate('/menu')}
                        style={{ padding: '14px 32px', backgroundColor: '#8e2420', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div style={{ padding: '140px 20px 60px', maxWidth: '850px', margin: 'auto', fontFamily: 'sans-serif', minHeight: '75vh', position: 'relative' }}>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#1a1a1a' }}>←</button>
                <div>
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#1a1a1a' }}>Your Cart</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '16px', fontWeight: '500' }}>{totalItemsCount} items</p>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div style={{ backgroundColor: '#fff', padding: '50px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px', fontWeight: '600' }}>Your cart is currently empty.</p>
                    <button
                        onClick={() => navigate('/menu')}
                        style={{ padding: '12px 30px', backgroundColor: '#8e2420', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                    >
                        Explore Menu
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        {cartItems.map((item, index) => {
                            const sizeLabel = formatSizeLabel(item.size);
                            return (
                                <div key={`${item.menuItemId || item.id}-${item.size || 'default'}-${index}`} style={{
                                    backgroundColor: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                    border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 300px' }}>
                                        <div style={{
                                            width: '80px', height: '80px', backgroundColor: '#f8f9fa', borderRadius: '16px', overflow: 'hidden',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0
                                        }}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#ccc', fontWeight: 'bold' }}>NO IMG</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '18px', fontWeight: '900', color: '#1a1a1a' }}>{item.name}</span>
                                                {sizeLabel && (
                                                    <span style={{
                                                        fontSize: '12px', fontWeight: '800', color: '#8e2420',
                                                        backgroundColor: '#fdecec', padding: '2px 8px', borderRadius: '8px'
                                                    }}>
                                                        {sizeLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>{item.category || 'MENU ITEM'}</span>
                                            <span style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', marginTop: '4px' }}>LKR {Number(item.price).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <button onClick={() => decreaseQuantity(index)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#8e2420', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                                            <span style={{ fontWeight: '900', fontSize: '16px', minWidth: '20px', textAlign: 'center', color: '#1a1a1a' }}>{item.quantity}</span>
                                            <button onClick={() => increaseQuantity(index)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#8e2420', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                                        </div>
                                        <button
                                            onClick={() => deleteItem(index)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <button
                            onClick={clearCart}
                            style={{
                                background: 'none', border: 'none', color: '#ef4444', fontFamily: "'Poppins', sans-serif", fontSize: '16px',
                                fontWeight: '700', cursor: 'pointer', padding: '8px', transition: 'opacity 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Clear cart
                        </button>
                    </div>

                    <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Store Pickup
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#333' }}>
                                    Pickup Date
                                    <input
                                        type="date"
                                        min={getTodayISO()}
                                        value={pickupDate}
                                        onChange={(e) => {
                                            setPickupDate(e.target.value);
                                            setCheckoutError("");
                                        }}
                                        required
                                        style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
                                    />
                                </label>
                                <label style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#333' }}>
                                    Pickup Time
                                    <input
                                        type="time"
                                        value={pickupTime}
                                        onChange={(e) => {
                                            setPickupTime(e.target.value);
                                            setCheckoutError("");
                                        }}
                                        required
                                        style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
                                    />
                                </label>
                            </div>
                        </div>

                        {checkoutError && (
                            <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px', fontWeight: '600' }}>
                                {checkoutError}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a' }}>Total Amount:</span>
                            <span style={{ fontSize: '26px', fontWeight: '900', color: '#8e2420' }}>LKR {Number(calculateTotal()).toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handleInitiateCheckout}
                            disabled={submitting}
                            style={{ width: '100%', padding: '18px', fontSize: '18px', backgroundColor: '#8e2420', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', transition: 'background-color 0.2s', boxShadow: '0 4px 14px rgba(142, 36, 32, 0.3)', opacity: submitting ? 0.6 : 1 }}
                            onMouseOver={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#a8322d')}
                            onMouseOut={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#8e2420')}
                        >
                            {submitting ? 'Placing Order...' : 'Place Order Now'}
                        </button>
                    </div>
                </>
            )}

            {showAuthPrompt && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        {!showGuestForm ? (
                            <>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 10px 0' }}>How would you like to checkout?</h3>
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>Log in to track your orders and save your details for next time.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link
                                        to="/login"
                                        style={{ display: 'block', width: '100%', backgroundColor: '#1a1a1a', color: '#fff', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px', boxSizing: 'border-box' }}
                                    >
                                        Log In / Register
                                    </Link>

                                    <button
                                        onClick={() => setShowGuestForm(true)}
                                        style={{ width: '100%', backgroundColor: '#fff', border: '2px solid #f0f0f0', color: '#333', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                                    >
                                        Continue as Guest
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleGuestSubmit} style={{ textAlign: 'left' }}>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 8px 0', textAlign: 'center' }}>Guest Details</h3>
                                <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
                                    Pickup: <strong>{pickupDate} at {pickupTime}</strong>
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#333' }}>
                                        Your Name
                                        <input
                                            type="text"
                                            placeholder="e.g. Kasun Perera"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            required
                                            style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
                                        />
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#333' }}>
                                        Phone Number
                                        <input
                                            type="tel"
                                            placeholder="e.g. 0771234567"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            required
                                            style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '15px', outline: 'none' }}
                                        />
                                    </label>
                                </div>

                                {guestError && (
                                    <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', fontWeight: '600' }}>
                                        {guestError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ width: '100%', backgroundColor: '#8e2420', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', opacity: submitting ? 0.6 : 1 }}
                                >
                                    {submitting ? 'Placing Order...' : 'Confirm Pickup Order'}
                                </button>
                            </form>
                        )}

                        <button
                            onClick={() => {
                                setShowAuthPrompt(false);
                                setShowGuestForm(false);
                            }}
                            style={{ width: '100%', marginTop: '18px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(20, 20, 20, 0.85)',
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: '#ffffff', padding: '24px 48px',
                    borderRadius: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: '1px solid rgba(255, 255, 255, 0.15)',
                    zIndex: 9999, fontWeight: '700', fontSize: '22px', letterSpacing: '0.5px', textAlign: 'center',
                    display: 'flex', alignItems: 'center', gap: '16px', animation: 'fadeIn 0.3s ease-out'
                }}>
                    <span style={{ color: '#ef4444', fontSize: '26px' }}>✓</span> {toastMessage}
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;