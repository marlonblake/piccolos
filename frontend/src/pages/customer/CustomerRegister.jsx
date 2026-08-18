import { useState } from 'react';

export default function Register() {
    // 1. Manage form state matching our backend DTO exactly
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    // To show success or error messages to the user
    const [message, setMessage] = useState('');

    // 2. Handle input changes dynamically
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page reload
        
        try {
            // Send POST request to Spring Boot
            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Our backend returns a simple String (ResponseEntity<String>)
            const data = await response.text(); 

            if (response.ok) {
                setMessage(`Success: ${data}`);
                // Optional: Clear the form
                setFormData({ fname: '', lname: '', email: '', password: '', phoneNumber: '' });
            } else {
                setMessage(`Error: ${data}`);
            }
        } catch (error) {
            setMessage("Network error. Is your Spring Boot backend running?");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Register for Piccolos</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="text" name="fname" placeholder="First Name" required
                    value={formData.fname} onChange={handleChange} 
                />
                <input 
                    type="text" name="lname" placeholder="Last Name" required
                    value={formData.lname} onChange={handleChange} 
                />
                <input 
                    type="email" name="email" placeholder="Email Address" required
                    value={formData.email} onChange={handleChange} 
                />
                <input 
                    type="text" name="phoneNumber" placeholder="Phone Number" 
                    value={formData.phoneNumber} onChange={handleChange} 
                />
                <input 
                    type="password" name="password" placeholder="Password" required
                    value={formData.password} onChange={handleChange} 
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
                    Register
                </button>
            </form>

            {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
}