import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Image as ImageIcon,
    ArrowLeft,
    Utensils,
    X
} from "lucide-react";

export default function AdminMenu() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [uploading, setUploading] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState("");


    // Fetch categories from the backend
    const fetchCategories = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/categories`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setCategories(await response.json());
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // Fetch menu items from the backend
    const fetchMenuItems = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/menu`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setMenuItems(await response.json());
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchMenuItems();
    }, []);

    // Upload an image file and store the returned path in the form
    const handleImageUpload = async (event) => {
        const input = event.target;
        const file = input.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/admin/upload`,
                {
                    method: "POST",
                    headers: {
                        // No Content-Type here: the browser sets it for file uploads
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`
                    },
                    body: formData
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            setImageUrl(data.imageUrl); // e.g. /food-images/garlic-bread-a1b2c3.jpg
        } catch (error) {
            console.error("Image upload failed:", error);
            alert(`Image upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            input.value = ""; // lets you pick the same file again
        }
    };


    // Reset the Add/Edit Menu Item form
    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setCategoryId("");
        setEditingId(null);
        setShowForm(false);
    };

// Rename a category
    const handleUpdateCategory = async (id) => {
        const trimmedName = editingCategoryName.trim();

        if (!trimmedName) {
            alert("Please enter a category name.");
            return;
        }

        const adminToken = localStorage.getItem("adminToken");

        try {
            const response = await fetch(
                `http://localhost:8081/api/admin/categories/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ name: trimmedName })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            setEditingCategoryId(null);
            setEditingCategoryName("");

            await fetchCategories();
            await fetchMenuItems();
        } catch (error) {
            console.error("Error updating category:", error);
            alert(`Failed to update category: ${error.message}`);
        }
    };

// Delete a category (only allowed when it has no menu items)
    const handleDeleteCategory = async (cat) => {
        const itemCount = menuItems.filter(
            (item) => String(item.category?.id) === String(cat.id)
        ).length;

        if (itemCount > 0) {
            alert(
                `"${cat.name}" still has ${itemCount} menu item(s). Move or delete them first.`
            );
            return;
        }

        if (!window.confirm(`Delete the category "${cat.name}"?`)) {
            return;
        }

        const adminToken = localStorage.getItem("adminToken");

        try {
            const response = await fetch(
                `http://localhost:8081/api/admin/categories/${cat.id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${adminToken}` }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            if (String(activeCategory) === String(cat.id)) {
                setActiveCategory("all");
            }

            await fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            alert(`Failed to delete category: ${error.message}`);
        }
    };

    // Create a new category
    const handleCreateCategory = async (event) => {
        event.preventDefault();

        const trimmedName = newCategoryName.trim();

        if (!trimmedName) {
            alert("Please enter a category name.");
            return;
        }

        const adminToken = localStorage.getItem("adminToken");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/admin/categories`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({
                        name: trimmedName
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    `HTTP ${response.status}: ${errorText}`
                );
            }

            // Refresh the category list
            const categoriesResponse = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/categories`
            );

            if (!categoriesResponse.ok) {
                throw new Error(
                    "Category created, but refreshing the category list failed."
                );
            }

            const updatedCategories = await categoriesResponse.json();

            setCategories(updatedCategories);

            // Automatically select the new category
            const newCategory = updatedCategories.find(
                (category) =>
                    category.name?.toLowerCase() ===
                    trimmedName.toLowerCase()
            );

            if (newCategory) {
                setCategoryId(String(newCategory.id));
            }

            setNewCategoryName("");
            setShowCategoryForm(false);

            alert("Category created successfully!");
        } catch (error) {
            console.error("Error creating category:", error);

            alert(
                `Failed to create category: ${error.message}`
            );
        }
    };

    // Add a new menu item or update an existing one
    const handleSubmit = async (event) => {
        event.preventDefault();

        const menuItem = {
            name,
            description,
            price: Number(price),
            category: {
                id: Number(categoryId)
            },
            imageUrl
        };

        const adminToken = localStorage.getItem("adminToken");
        const isEditing = editingId !== null;

        const url = isEditing
            ? `http://localhost:8081/api/admin/menu/${editingId}`
    : `${import.meta.env.VITE_API_BASE_URL}/api/admin/menu`;

try {
    const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(menuItem)
    });

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `HTTP ${response.status}: ${errorText}`
        );
    }

    resetForm();
    await fetchMenuItems();
} catch (error) {
    console.error("Error saving menu item:", error);

    alert(
        `Failed to save menu item: ${error.message}`
    );
}
};

// Load an existing menu item into the form
const handleEditClick = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setImageUrl(item.imageUrl || "");
    setCategoryId(
        item.category?.id != null
            ? String(item.category.id)
            : ""
    );

    setShowForm(true);
};

// Delete a menu item
const handleDelete = async (id) => {
    if (
        !window.confirm(
            "Are you sure you want to delete this menu item?"
        )
    ) {
        return;
    }

    const adminToken = localStorage.getItem("adminToken");

    try {
        const response = await fetch(
            `http://localhost:8081/api/admin/menu/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `HTTP ${response.status}: ${errorText}`
            );
        }

        await fetchMenuItems();
    } catch (error) {
        console.error("Error deleting menu item:", error);

        alert(
            `Failed to delete menu item: ${error.message}`
        );
    }
};

// Filter menu items by category and search term
const visibleItems = menuItems.filter((item) => {
    const matchesCategory =
        activeCategory === "all" ||
        String(item.category?.id) === String(activeCategory);

    const matchesSearch = (item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
});

// Count menu items in a category
const countFor = (catId) =>
    menuItems.filter(
        (item) =>
            String(item.category?.id) === String(catId)
    ).length;

return (
    <div className="max-w-7xl mx-auto font-sans pb-16">

        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3E2D]/60 hover:text-[#D45D3C] transition-colors uppercase tracking-widest mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">
                    Menu Management
                </h1>

                <p className="text-[#2C3E2D]/60 text-sm">
                    Add, update, or remove dishes from the digital menu.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => setShowCategoryManager(true)}
                    className="bg-white border-2 border-[#2C3E2D] text-[#2C3E2D] hover:bg-[#2C3E2D] hover:text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                    Manage Categories
                </button>

                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Menu Item
                </button>
            </div>
        </div>


        {/* Search and Category Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-6 justify-between items-center">

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeCategory === "all"
                            ? "bg-[#2C3E2D] text-white shadow-md"
                            : "bg-gray-50 text-[#2C3E2D] hover:bg-gray-100 border border-gray-200"
                    }`}
                >
                    All Menu
                    <span className="opacity-60 ml-1 text-xs font-normal">
                            ({menuItems.length})
                        </span>
                </button>

                {categories.map((cat) => (
                    <button
                        type="button"
                        key={cat.id}
                        onClick={() =>
                            setActiveCategory(String(cat.id))
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            String(activeCategory) === String(cat.id)
                                ? "bg-[#2C3E2D] text-white shadow-md"
                                : "bg-gray-50 text-[#2C3E2D] hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        {cat.name}

                        <span className="opacity-60 ml-1 text-xs font-normal">
                                ({countFor(cat.id)})
                            </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>

                <input
                    type="text"
                    placeholder="Search items..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2D] focus:ring-1 focus:ring-[#2C3E2D] transition-all"
                />
            </div>
        </div>

        {/* Menu Grid */}
        {visibleItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />

                <p className="text-gray-500 font-medium">
                    No menu items found in this category.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col"
                    >
                        {/* Menu Item Image */}
                        <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                            )}
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="font-serif text-lg font-bold text-[#2C3E2D] mb-1 truncate">
                                {item.name}
                            </h3>

                            <p className="text-sm text-[#2C3E2D]/60 line-clamp-2 mb-4 flex-grow">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <span className="font-bold text-[#D45D3C] text-lg">
                                        {Number(item.price).toLocaleString()}
                                    </span>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 text-gray-400 hover:text-[#2C3E2D] hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Add/Edit Menu Item Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-[#2C3E2D]">
                            {editingId !== null
                                ? "Edit Item"
                                : "New Item"}
                        </h2>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-white rounded-full shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form
                        className="p-8 space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                                Item Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. Margherita Pizza"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Describe the ingredients and flavor..."
                                required
                                rows="3"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all resize-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                                    Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(event) =>
                                        setPrice(event.target.value)
                                    }
                                    placeholder="e.g. 2500"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all"
                                />
                            </div>

                            <div className="w-1/2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                                    Category
                                </label>

                                <select
                                    value={categoryId}
                                    onChange={(event) =>
                                        setCategoryId(event.target.value)
                                    }
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all cursor-pointer"
                                >
                                    <option value="">
                                        -- Select --
                                    </option>

                                    {categories.map((cat) => (
                                        <option
                                            key={cat.id}
                                            value={cat.id}
                                        >
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                                Item Image
                            </label>

                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-[#2C3E2D] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#2C3E2D] file:text-white file:font-semibold file:cursor-pointer hover:file:bg-[#1A251B]"
                            />

                            {uploading && (
                                <p className="text-sm text-[#2C3E2D]/60 mt-2">Uploading...</p>
                            )}

                            {imageUrl && !uploading && (
                                <div className="mt-3 flex items-center gap-3">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setImageUrl("")}
                                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            )}
                        </div>


                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 py-3.5 rounded-xl font-semibold transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex-1 bg-[#2C3E2D] hover:bg-[#1A251B] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md"
                            >
                                {editingId !== null
                                    ? "Save Changes"
                                    : "Create Item"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Manage Categories Modal */}
        {showCategoryManager && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">

                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-[#2C3E2D]">
                            Manage Categories
                        </h2>

                        <button
                            type="button"
                            onClick={() => {
                                setShowCategoryManager(false);
                                setEditingCategoryId(null);
                                setEditingCategoryName("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-3">
                        {categories.length === 0 && (
                            <p className="text-gray-500 text-sm">No categories yet.</p>
                        )}

                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl"
                            >
                                {editingCategoryId === cat.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingCategoryName}
                                            onChange={(event) =>
                                                setEditingCategoryName(event.target.value)
                                            }
                                            autoFocus
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D45D3C]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCategory(cat.id)}
                                            className="px-3 py-2 bg-[#2C3E2D] text-white text-sm font-semibold rounded-lg"
                                        >
                                            Save
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCategoryId(null);
                                                setEditingCategoryName("");
                                            }}
                                            className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                <span className="flex-1 font-semibold text-[#2C3E2D]">
                                    {cat.name}
                                    <span className="opacity-60 text-xs font-normal ml-2">
                                        ({countFor(cat.id)} items)
                                    </span>
                                </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCategoryId(cat.id);
                                                setEditingCategoryName(cat.name);
                                            }}
                                            className="p-2 text-gray-400 hover:text-[#2C3E2D] hover:bg-gray-50 rounded-lg"
                                            title="Rename"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowCategoryForm(true)}
                            className="w-full bg-[#D45D3C] hover:bg-[#B84A2E] text-white py-3 rounded-xl font-semibold"
                        >
                            + New Category
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Create Category Modal */}
        {showCategoryForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#2C3E2D]">
                            Create New Category
                        </h2>

                        <button
                            type="button"
                            onClick={() => {
                                setShowCategoryForm(false);
                                setNewCategoryName("");
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateCategory}>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">
                            Category Name
                        </label>

                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(event) =>
                                setNewCategoryName(event.target.value)
                            }
                            placeholder="e.g. Desserts"
                            required
                            autoFocus
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C]"
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryForm(false);
                                    setNewCategoryName("");
                                }}
                                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex-1 bg-[#2C3E2D] hover:bg-[#1A251B] text-white py-3 rounded-xl font-semibold"
                            >
                                Create Category
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
);
}