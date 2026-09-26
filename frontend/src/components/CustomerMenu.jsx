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

    // Group menu items by category name
    // Example result: { "Pizza": [item1, item2], "Appetizers": [item3] }
    const groupedByCategory = {};

    menuItems.forEach(item => {
        const categoryName = item.category?.name || "Uncategorized";

        if (!groupedByCategory[categoryName]) {
            groupedByCategory[categoryName] = [];
        }

        groupedByCategory[categoryName].push(item);
    });

    return (
        <div>
            <h1>Piccolos Menu</h1>

            {Object.keys(groupedByCategory).map(categoryName => (
                <div key={categoryName}>
                    <h2>{categoryName}</h2>

                    {groupedByCategory[categoryName].map(item => (
                        <div key={item.id} style={{ marginBottom: "20px", paddingLeft: "10px" }}>
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p>Price: {item.price}</p>

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
            ))}
        </div>
    );
}

export default CustomerMenu;