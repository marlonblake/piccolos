import { useEffect, useState } from "react";

function CustomerMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:8081/api/menu")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch menu");
                }
                return response.json();
            })
            .then(data => {
                setMenuItems(data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setError("Could not load the menu.");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading menu...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (menuItems.length === 0) {
        return <p>No menu items available.</p>;
    }

    return (
        <div>
            <h1>Piccolos Menu</h1>

            {menuItems.map(item => (
                <div key={item.id}>
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <p>Price: {item.price}</p>
                    <p>Category: {item.category?.name}</p>

                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            width="200"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default CustomerMenu;