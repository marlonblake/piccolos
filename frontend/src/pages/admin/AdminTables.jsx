import React, { useCallback, useEffect, useState } from "react";
import { Armchair, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { adminRequest } from "../../api/adminApi";

const blankTable = { tableNumber: "", capacity: "" };

function TableForm({ initialTable, onCancel, onSaved }) {
    const [form, setForm] = useState(initialTable || blankTable);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const updateField = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);
        try {
            const payload = {
                tableNumber: Number(form.tableNumber),
                capacity: Number(form.capacity)
            };
            const result = await adminRequest(
                initialTable ? `/admin/tables/${initialTable.id}` : "/admin/tables",
                {
                    method: initialTable ? "PUT" : "POST",
                    body: JSON.stringify(payload)
                }
            );
            onSaved(result);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h2 className="font-serif text-xl font-bold text-[#2C3E2D]">
                        {initialTable ? `Edit Table ${initialTable.tableNumber}` : "Add a restaurant table"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Set the table number and guest capacity.</p>
                </div>
                <button type="button" onClick={onCancel} aria-label="Close form"
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Table number
                    <input name="tableNumber" type="number" min="1" required value={form.tableNumber}
                        onChange={updateField} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#D45D3C]" />
                </label>
                <label className="text-sm font-semibold text-[#2C3E2D]">
                    Guest capacity
                    <input name="capacity" type="number" min="1" required value={form.capacity}
                        onChange={updateField} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#D45D3C]" />
                </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[#2C3E2D] font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C3E2D] text-white font-semibold hover:bg-[#1A251B] disabled:opacity-60">
                    <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save table"}
                </button>
            </div>
        </form>
    );
}

export default function AdminTables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formTable, setFormTable] = useState(undefined);

    const loadTables = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setTables(await adminRequest("/admin/tables"));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTables();
    }, [loadTables]);

    const removeTable = async (table) => {
        if (!window.confirm(`Delete Table ${table.tableNumber}?`)) return;
        setError("");
        try {
            await adminRequest(`/admin/tables/${table.id}`, { method: "DELETE" });
            setTables((current) => current.filter((item) => item.id !== table.id));
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const savedTable = (table) => {
        setFormTable(undefined);
        setTables((current) => {
            const exists = current.some((item) => item.id === table.id);
            const updated = exists
                ? current.map((item) => item.id === table.id ? table : item)
                : [...current, table];
            return updated.sort((a, b) => a.tableNumber - b.tableNumber);
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 border-b border-gray-200 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <span className="text-xs uppercase tracking-widest text-[#D45D3C] font-semibold">Restaurant setup</span>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C3E2D] mt-1">Restaurant Tables</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage table numbers and seating capacity.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadTables} disabled={loading} title="Refresh tables"
                        className="p-3 rounded-xl border border-gray-200 bg-white text-[#2C3E2D] hover:bg-gray-50 disabled:opacity-50">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => setFormTable(null)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#D45D3C] px-4 py-3 font-semibold text-white shadow-sm hover:bg-[#BD4F32]">
                        <Plus className="w-5 h-5" /> Add table
                    </button>
                </div>
            </header>

            {error && <div role="alert" className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
            {formTable !== undefined && (
                <div className="mb-6">
                    <TableForm key={formTable?.id || "new"} initialTable={formTable} onCancel={() => setFormTable(undefined)} onSaved={savedTable} />
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-500">Loading restaurant tables...</div>
            ) : tables.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
                    <Armchair className="w-10 h-10 text-[#D45D3C] mx-auto mb-3" />
                    <h2 className="font-serif text-xl font-bold text-[#2C3E2D]">No tables yet</h2>
                    <p className="text-sm text-gray-500 mt-1">Add your first table to make it available for reservations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {tables.map((table) => (
                        <article key={table.id} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-xl bg-[#D45D3C]/10 flex items-center justify-center">
                                    <Armchair className="w-6 h-6 text-[#D45D3C]" />
                                </div>
                                <span className="rounded-full bg-[#2C3E2D]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#2C3E2D]">#{table.tableNumber}</span>
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-[#2C3E2D] mt-5">Table {table.tableNumber}</h2>
                            <p className="text-sm text-gray-500 mt-1">Seats up to <strong className="text-[#2C3E2D]">{table.capacity}</strong> guests</p>
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                <button onClick={() => setFormTable(table)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-[#2C3E2D] border border-gray-200 hover:bg-gray-50">Edit</button>
                                <button onClick={() => removeTable(table)} aria-label={`Delete table ${table.tableNumber}`}
                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
