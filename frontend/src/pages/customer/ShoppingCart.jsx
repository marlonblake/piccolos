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
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 font-sans text-[#2C3E2D]">
            <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-3xl font-serif font-bold text-center mb-8">Your Order</h2>

                {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-lg">Your cart is empty.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-[#FDFBF7] px-2 py-1 rounded-full border border-gray-200">
                                        <button onClick={() => decreaseQuantity(index)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-lg font-medium text-gray-600">-</button>
                                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => increaseQuantity(index)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-lg font-medium text-gray-600">+</button>
                                    </div>
                                    <span className="font-medium text-lg">{item.name}</span>
                                </div>
                                <span className="font-semibold text-lg">LKR {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        
                        <div className="flex justify-between items-center mt-8 pt-4 text-2xl font-bold">
                            <span>Total:</span>
                            <span>LKR {calculateTotal()}</span>
                        </div>
                        
                        <button
                            onClick={handlePlaceOrder}
                            className="w-full mt-8 bg-[#D45D3C] hover:bg-[#B84A2E] text-white py-4 rounded-full text-lg font-semibold transition-all shadow-md"
                        >
                            Place Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingCart;