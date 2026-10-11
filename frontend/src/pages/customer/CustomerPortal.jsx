import React, { useState } from 'react';
import CustomerMenu from '../../components/CustomerMenu';
import ShoppingCart from './ShoppingCart';

const CustomerPortal = () => {
    const [cartItems, setCartItems] = useState([]);

    const handleAddToCart = (menuItem) => {
        const itemId = menuItem.id || menuItem.menuItemId;
        const existingItemIndex = cartItems.findIndex(item => (item.id || item.menuItemId) === itemId);

        if (existingItemIndex >= 0) {
            const newCart = [...cartItems];
            newCart[existingItemIndex].quantity += 1;
            setCartItems(newCart);
        } else {
            setCartItems([...cartItems, { ...menuItem, quantity: 1 }]);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ flex: 2 }}>
                <CustomerMenu onAddToCart={handleAddToCart} />
            </div>

            <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                <ShoppingCart cartItems={cartItems} setCartItems={setCartItems} />
            </div>
        </div>
    );
};

export default CustomerPortal;