const API = "http://localhost:8081/api";

export async function adminRequest(path, options = {}) {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = `Request failed (${response.status})`;
        if (contentType.includes("application/json")) {
            const body = await response.json();
            message = body.detail || body.message || message;
        } else {
            const body = await response.text();
            if (body) message = body;
        }
        throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
}
