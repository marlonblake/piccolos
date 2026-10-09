import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    Search, Plus, Edit2, Trash2, Image as ImageIcon, 
    ArrowLeft, Utensils, X 
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

    const visibleItems = menuItems.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category?.id === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const countFor = (catId) => menuItems.filter((i) => i.category?.id === catId).length;

    return (
        <div className="max-w-7xl mx-auto font-sans pb-16">
            
            {/* Header Section */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Link 
                        to="/admin/dashboard" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C3E2D]/60 hover:text-[#D45D3C] transition-colors uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mb-1">
                        Menu Management
                    </h1>
                    <p className="text-[#2C3E2D]/60 text-sm">Add, update, or remove dishes from the digital menu.</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)}
                    className="bg-[#D45D3C] hover:bg-[#B84A2E] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Menu Item
                </button>
            </div>

            {/* Controls: Search & Categories */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-6 justify-between items-center">
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeCategory === "all" 
                            ? "bg-[#2C3E2D] text-white shadow-md" 
                            : "bg-gray-50 text-[#2C3E2D] hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        All Menu <span className="opacity-60 ml-1 text-xs font-normal">({menuItems.length})</span>
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeCategory === cat.id 
                                ? "bg-[#2C3E2D] text-white shadow-md" 
                                : "bg-gray-50 text-[#2C3E2D] hover:bg-gray-100 border border-gray-200"
                            }`}
                        >
                            {cat.name} <span className="opacity-60 ml-1 text-xs font-normal">({countFor(cat.id)})</span>
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
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2D] focus:ring-1 focus:ring-[#2C3E2D] transition-all"
                    />
                </div>
            </div>

            {/* Menu Grid */}
            {visibleItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No menu items found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visibleItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                            {/* Image Placeholder or Actual Image */}
                            <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-gray-300" />
                                )}
                            </div>
                            
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="font-serif text-lg font-bold text-[#2C3E2D] mb-1 truncate">{item.name}</h3>
                                <p className="text-sm text-[#2C3E2D]/60 line-clamp-2 mb-4 flex-grow">{item.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <span className="font-bold text-[#D45D3C] text-lg">
                                        {Number(item.price).toLocaleString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-gray-400 hover:text-[#2C3E2D] hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
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

            {/* Add/Edit Modal Overlay */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-[#2C3E2D]">
                                {editingId !== null ? "Edit Item" : "New Item"}
                            </h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors p-1 bg-white rounded-full shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Item Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Margherita Pizza" required 
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the ingredients and flavor..." required rows="3"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all resize-none" />
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Price</label>
                                    <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2500" required 
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Category</label>
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required 
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all appearance-none cursor-pointer">
                                        <option value="">-- Select --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#2C3E2D] mb-2">Image URL</label>
                                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" 
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D45D3C] focus:ring-1 focus:ring-[#D45D3C] transition-all" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={resetForm} className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 py-3.5 rounded-xl font-semibold transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-[#2C3E2D] hover:bg-[#1A251B] text-white py-3.5 rounded-xl font-semibold transition-all shadow-md">
                                    {editingId !== null ? "Save Changes" : "Create Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}