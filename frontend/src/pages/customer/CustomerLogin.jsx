import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            // Note: Make sure the port matches your Spring Boot server (8081)
            const response = await fetch('http://localhost:8081/api/auth/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.text();

            if (response.ok) {
                // 1. Save the JWT token to Local Storage
                localStorage.setItem('customerToken', data);
                
                // 2. Redirect the user to the home page (or menu)
                navigate('/'); 
            } else {
                setMessage(`Login Failed: ${data}`);
            }
        } catch (error) {
            setMessage("Network error. Is the backend running?");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Customer Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
            {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
        </div>
    );
}