import { useState, useEffect } from "react";
import "./AdminMenu.css";

function AdminMenu() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8081/api/categories");
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                setCategories(await response.json());
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await fetch("http://localhost:8081/api/menu");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            setMenuItems(await response.json());
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
        setShowForm(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const menuItem = {
            name,
            description,
            price: Number(price),
            category: { id: Number(categoryId) },
            imageUrl
        };

        const adminToken = localStorage.getItem("adminToken");
        const isEditing = editingId !== null;
        const url = isEditing
            ? `http://localhost:8081/api/admin/menu/${editingId}`
            : "http://localhost:8081/api/admin/menu";

        try {
            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
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

            await response.json();
            resetForm();
            fetchMenuItems();
        } catch (error) {
            console.error("Error saving menu item:", error);
            alert("Failed to save menu item. Check the browser console.");
        }
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setImageUrl(item.imageUrl || "");
        setCategoryId(item.category?.id || "");
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) return;

        const adminToken = localStorage.getItem("adminToken");

        try {
            const response = await fetch(`http://localhost:8081/api/admin/menu/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${adminToken}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            fetchMenuItems();
        } catch (error) {
            console.error("Error deleting menu item:", error);
            alert("Failed to delete menu item. Check the browser console.");
        }
    };

    // Filter by selected category pill and by search text
    const visibleItems = menuItems.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category?.id === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const countFor = (catId) => menuItems.filter((i) => i.category?.id === catId).length;

    return (
        <div className="am-layout">

            <aside className="am-sidebar">
                <button className="am-side-btn active" title="Menu">🍽️</button>
                <button className="am-side-btn" title="Orders">📝</button>
                <button className="am-side-btn" title="Reservations">🪑</button>
                <button className="am-side-btn" title="Reports">📈</button>
                <div className="am-side-spacer" />
                <button className="am-side-btn" title="Settings">⚙️</button>
            </aside>

            <main className="am-main">

                <div className="am-topbar">
                    <input
                        className="am-search"
                        type="text"
                        placeholder="Search menu items"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="am-add-btn" onClick={() => setShowForm(true)}>
                        + Add Menu Item
                    </button>
                </div>

                <div className="am-pills">
                    <button
                        className={`am-pill ${activeCategory === "all" ? "active" : ""}`}
                        onClick={() => setActiveCategory("all")}
                    >
                        <strong>All Menu</strong>
                        <span>{menuItems.length} items</span>
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`am-pill ${activeCategory === cat.id ? "active" : ""}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <strong>{cat.name}</strong>
                            <span>{countFor(cat.id)} items</span>
                        </button>
                    ))}
                </div>

                {visibleItems.length === 0 && <p className="am-empty">No menu items found.</p>}

                <div className="am-grid">
                    {visibleItems.map((item) => (
                        <div className="am-card" key={item.id}>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} />
                            ) : (
                                <div className="am-img-placeholder">🍕</div>
                            )}

                            <div className="am-card-body">
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>

                                <div className="am-card-footer">
                                    <span className="am-price">{Number(item.price).toLocaleString()}</span>
                                    <div className="am-actions">
                                        <button className="am-btn secondary" onClick={() => handleEditClick(item)}>Edit</button>
                                        <button className="am-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showForm && (
                <div className="am-overlay">
                    <form className="am-modal" onSubmit={handleSubmit}>
                        <h2>{editingId !== null ? "Edit Menu Item" : "Add Menu Item"}</h2>

                        <label>Food Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Margherita Pizza" required />

                        <label>Description</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the food" required />

                        <label>Price</label>
                        <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2500" required />

                        <label>Category</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                            <option value="">-- Select a category --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <label>Image URL</label>
                        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste image URL" />

                        <div className="am-modal-actions">
                            <button type="button" className="am-btn secondary" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="am-btn">
                                {editingId !== null ? "Update" : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AdminMenu;