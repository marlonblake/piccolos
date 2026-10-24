import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('piccolos_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const navigate = useNavigate();

    const updateCartState = (newCart) => {
        setCartItems(newCart);
        localStorage.setItem('piccolos_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const increaseQuantity = (index) => {
        const newCart = [...cartItems];
        newCart[index].quantity += 1;
        updateCartState(newCart);
    };

    const decreaseQuantity = (index) => {
        const newCart = [...cartItems];
        if (newCart[index].quantity > 1) {
            newCart[index].quantity -= 1;
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
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleInitiateCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const token = localStorage.getItem('customerToken');
        if (token) {
            const userId = localStorage.getItem('userId');
            processOrder(userId);
        } else {
            setShowAuthPrompt(true);
        }
    };

    const processOrder = async (userId = null) => {
        const orderPayload = {
            userId: userId,
            guestName: userId ? null : "Walk-in Guest",
            orderType: "PICKUP",
            total: Number(calculateTotal()),
            items: cartItems.map(item => ({
                menuItemId: item.menuItemId || item.id,
                quantity: item.quantity,
                price: item.price
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
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("Could not connect to the backend.");
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
                    <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: '1.5' }}>Thank you for your order. The kitchen has received it and is preparing your food.</p>
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
                        {cartItems.map((item, index) => (
                            <div key={item.menuItemId || index} style={{
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
                                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#1a1a1a' }}>{item.name}</span>
                                        <span style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>{item.category || 'MENU ITEM'}</span>
                                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#F59E0B', marginTop: '4px' }}>LKR {item.price.toLocaleString()}</span>
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
                        ))}
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

                    <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a' }}>Total Amount:</span>
                            <span style={{ fontSize: '26px', fontWeight: '900', color: '#8e2420' }}>LKR {Number(calculateTotal()).toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handleInitiateCheckout}
                            style={{ width: '100%', padding: '18px', fontSize: '18px', backgroundColor: '#8e2420', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', transition: 'background-color 0.2s', boxShadow: '0 4px 14px rgba(142, 36, 32, 0.3)' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a8322d'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8e2420'}
                        >
                            Place Order Now
                        </button>
                    </div>
                </>
            )}

            {showAuthPrompt && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 10px 0' }}>How would you like to checkout?</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>Log in to track your orders and save your details for next time.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Link 
                                to="/login" 
                                style={{ display: 'block', width: '100%', backgroundColor: '#1a1a1a', color: '#fff', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px' }}
                            >
                                Log In / Register
                            </Link>
                            
                            <button 
                                onClick={() => processOrder(null)}
                                style={{ width: '100%', backgroundColor: '#fff', border: '2px solid #f0f0f0', color: '#666', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                            >
                                Continue as Guest
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setShowAuthPrompt(false)}
                            style={{ width: '100%', marginTop: '20px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
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