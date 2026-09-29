import React from 'react';

const ShoppingCart = ({ cartItems, setCartItems }) => {

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

    // Updated calculations to include the 10% tax requirement
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxAndFees = subtotal * 0.10;
    const finalTotal = subtotal + taxAndFees;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const orderPayload = {
            guestName: "Walk-in Guest",
            orderType: "PICKUP",
            items: cartItems.map(item => ({
                menuItemId: item.menuItemId || item.id,
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
        <div className="cart-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif', color: 'white' }}>
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

                    {/* New Price Breakdown Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#ccc', marginBottom: '5px' }}>
                        <span>Subtotal:</span>
                        <span>LKR {subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#ccc', marginBottom: '10px' }}>
                        <span>Tax & Fees (10%):</span>
                        <span>LKR {taxAndFees.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #555', paddingTop: '10px' }}>
                        <span>Total:</span>
                        <span>LKR {finalTotal.toFixed(2)}</span>
                    </div>

                    <br />
                    <button
                        onClick={handlePlaceOrder}
                        style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Place Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;