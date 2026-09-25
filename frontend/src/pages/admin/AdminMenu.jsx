import { useState, useEffect } from "react";

function AdminMenu() {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/categories");

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                setCategories(data);

            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const menuItem = {
            name: name,
            description: description,
            price: Number(price),
            category: {
                id: Number(categoryId)
            },
            imageUrl: imageUrl
        };

        console.log("Sending:", menuItem);

        const adminToken = localStorage.getItem("adminToken");

        try {
            const response = await fetch("http://localhost:8081/api/admin/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`
                },
                body: JSON.stringify(menuItem)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            console.log("Menu item added:", result);

            alert("Menu item added successfully!");

            setName("");
            setDescription("");
            setPrice("");
            setImageUrl("");
            setCategoryId("");

        } catch (error) {
            console.error("Error adding menu item:", error);
            alert("Failed to add menu item. Check the browser console.");
        }
    };

    return (
        <div>
            <h1>Admin Menu Management</h1>

            <h2>Add Menu Item</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Food Name</label>
                    <br />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Margherita Pizza"
                    />
                </div>

                <br />

                <div>
                    <label>Description</label>
                    <br />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the food"
                    />
                </div>

                <br />

                <div>
                    <label>Price</label>
                    <br />
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 2500"
                    />
                </div>

                <br />

                <div>
                    <label>Category</label>
                    <br />
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">-- Select a category --</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                <div>
                    <label>Image URL</label>
                    <br />
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste image URL"
                    />
                </div>

                <br />

                <button type="submit">
                    Add Menu Item
                </button>

            </form>
        </div>
    );
}

export default AdminMenu;