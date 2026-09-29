import React, { useState } from 'react';

const ShoppingCart = () => {
    const [cartItems, setCartItems] = useState([
        { menuItemId: 1, name: "Margherita Pizza", price: 2000.00, quantity: 2 },
        { menuItemId: 2, name: "Garlic Bread", price: 1000.00, quantity: 1 }
    ]);

    const addToCart = (menuItem) => {
        const existingItemIndex = cartItems.findIndex(item => item.menuItemId === menuItem.menuItemId);

        if (existingItemIndex >= 0) {
            const newCart = [...cartItems];
            newCart[existingItemIndex].quantity += 1;
            setCartItems(newCart);
        } else {
            setCartItems([...cartItems, {
                menuItemId: menuItem.menuItemId,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1
            }]);
        }
    };

    const increaseQuantity = (index) => {
        const newCart = [...cartItems];
        newCart[index].quantity += 1;
        setCartItems(newCart);
    };

    const decreaseQuantity = (index) => {
        const newCart = [...cartItems];
        if (newCart[index].quantity > 1) {
            newCart[index].quantity -= 1;
        } else {
            newCart.splice(index, 1);
        }
        setCartItems(newCart);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    // Renamed from handleCheckout to handlePlaceOrder
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
                // Updated success message to match your business logic
                alert("Order placed successfully! The admin has been notified.");
                setCartItems([]);
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("Could not connect to the backend.");
        }
    };

    return (
        <div className="cart-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Your Order</h2>

            {cartItems.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Your cart is empty.</p>
            ) : (
                <div>
                    {cartItems.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #555', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => decreaseQuantity(index)} style={{ padding: '2px 8px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}>-</button>
                                <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => increaseQuantity(index)} style={{ padding: '2px 8px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}>+</button>
                                <span style={{ marginLeft: '10px' }}>{item.name}</span>
                            </div>
                            <span>LKR {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                        <span>Total:</span>
                        <span>LKR {calculateTotal()}</span>
                    </div>
                    <br />
                    <button
                        onClick={handlePlaceOrder}
                        style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Place Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;