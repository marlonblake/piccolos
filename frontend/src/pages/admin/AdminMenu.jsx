import { useState, useEffect } from "react";

function AdminMenu() {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    // If this is not null, we're editing that item instead of adding a new one
    const [editingId, setEditingId] = useState(null);

    // Fetch categories once, when the page first loads
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/categories");
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    // Fetch menu items — pulled into its own function so we can re-call it after add/edit/delete
    const fetchMenuItems = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/menu");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setMenuItems(data);
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setCategoryId("");
        setEditingId(null);
    };

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

        const adminToken = localStorage.getItem("adminToken");

        // If editingId is set, we're updating an existing item (PUT).
        // Otherwise, we're adding a brand new one (POST).
        const isEditing = editingId !== null;
        const url = isEditing
            ? `http://localhost:8081/api/admin/menu/${editingId}`
            : "http://localhost:8081/api/admin/menu";
        const method = isEditing ? "PUT" : "POST";

        console.log(`${method} to ${url}:`, menuItem);

        try {
            const response = await fetch(url, {
                method: method,
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
            console.log(isEditing ? "Menu item updated:" : "Menu item added:", result);

            alert(isEditing ? "Menu item updated successfully!" : "Menu item added successfully!");

            resetForm();
            fetchMenuItems(); // refresh the list so the change shows up immediately

        } catch (error) {
            console.error("Error saving menu item:", error);
            alert("Failed to save menu item. Check the browser console.");
        }
    };

    // Called when the admin clicks "Edit" on a specific item
    const handleEditClick = (item) => {
        setEditingId(item.id);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setImageUrl(item.imageUrl || "");
        setCategoryId(item.category?.id || "");

        // Scroll up to the form so the admin sees what they're editing
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Called when the admin clicks "Delete" on a specific item
    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this menu item?");
        if (!confirmed) return;

        const adminToken = localStorage.getItem("adminToken");

        try {
            const response = await fetch(`http://localhost:8081/api/admin/menu/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${adminToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            console.log("Menu item deleted:", id);
            fetchMenuItems(); // refresh the list

        } catch (error) {
            console.error("Error deleting menu item:", error);
            alert("Failed to delete menu item. Check the browser console.");
        }
    };

    return (
        <div>
            <h1>Admin Menu Management</h1>

            <h2>{editingId !== null ? "Edit Menu Item" : "Add Menu Item"}</h2>

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
                    {editingId !== null ? "Update Menu Item" : "Add Menu Item"}
                </button>

                {editingId !== null && (
                    <button type="button" onClick={resetForm} style={{ marginLeft: "10px" }}>
                        Cancel Edit
                    </button>
                )}

            </form>

            <hr style={{ margin: "30px 0" }} />

            <h2>Existing Menu Items</h2>

            {menuItems.length === 0 && <p>No menu items yet.</p>}

            {menuItems.map((item) => (
                <div key={item.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <p>Price: {item.price}</p>
                    <p>Category: {item.category?.name}</p>

                    <button onClick={() => handleEditClick(item)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ marginLeft: "10px" }}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

export default AdminMenu;