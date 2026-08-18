import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            // Notice this points to the admin endpoint!
            const response = await fetch('http://localhost:8081/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.text();

            if (response.ok) {
                // Save it specifically as the admin token
                localStorage.setItem('adminToken', data);
                
                // Redirect to the staff dashboard
                navigate('/admin/dashboard'); 
            } else {
                setMessage(`Login Failed: ${data}`);
            }
        } catch (error) {
            setMessage("Network error. Is the backend running?");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif', border: '2px solid #333', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ color: '#d32f2f' }}>Staff Portal Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="email" 
                    placeholder="Staff Email" 
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
                <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none' }}>
                    Access POS System
                </button>
            </form>
            {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
            
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>
                Back to Customer Site
            </button>
        </div>
    );
}