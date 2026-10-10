import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('piccolos_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [orderSuccess, setOrderSuccess] = useState(false);
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

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const orderPayload = {
            guestName: "Walk-in Guest",
            orderType: "PICKUP",
            items: cartItems.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity
            }))
        };

        try {
            const response = await fetch('http://localhost:8081/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                setOrderSuccess(true);
                updateCartState([]);
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

    return (
        <div style={{ padding: '140px 20px 60px', maxWidth: '850px', margin: 'auto', fontFamily: 'sans-serif', minHeight: '75vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#8e2420', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
                    🛒
                </div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Shopping Cart</h2>
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
                <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px' }}>
                        {cartItems.map((item, index) => (
                            <div key={item.menuItemId || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: index < cartItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '17px', fontWeight: '800', color: '#1a1a1a' }}>{item.name}</span>
                                    <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>LKR {item.price.toLocaleString()} each</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f4f6f8', borderRadius: '10px', padding: '4px' }}>
                                        <button onClick={() => decreaseQuantity(index)} style={{ width: '32px', height: '32px', cursor: 'pointer', backgroundColor: '#fff', color: '#1a1a1a', border: '1px solid #e0e0e0', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                                        <span style={{ fontWeight: '800', width: '36px', textAlign: 'center', fontSize: '15px' }}>{item.quantity}</span>
                                        <button onClick={() => increaseQuantity(index)} style={{ width: '32px', height: '32px', cursor: 'pointer', backgroundColor: '#fff', color: '#1a1a1a', border: '1px solid #e0e0e0', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                    </div>
                                    <span style={{ fontSize: '17px', fontWeight: '900', color: '#8e2420', minWidth: '110px', textAlign: 'right' }}>LKR {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', padding: '24px', borderTop: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>Total Amount:</span>
                            <span style={{ fontSize: '24px', fontWeight: '900', color: '#8e2420' }}>LKR {Number(calculateTotal()).toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            style={{ width: '100%', padding: '16px', fontSize: '16px', backgroundColor: '#8e2420', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s', boxShadow: '0 4px 14px rgba(142, 36, 32, 0.3)' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a8322d'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8e2420'}
                        >
                            Place Order Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;