import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/customer/CustomerRegister';
import CustomerLogin from './pages/customer/CustomerLogin';
import AdminLogin from './pages/admin/AdminLogin';
import CustomerMenu from './components/CustomerMenu';

function Home() {
    const testSecureEndpoint = async () => {
        const token = localStorage.getItem('customerToken');
        
        try {
            const response = await fetch('http://localhost:8081/api/customer/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                const data = await response.text();
                alert(data); 
            } else {
                alert("Access Denied! Status: " + response.status); 
            }
        } catch (error) {
            alert("Network Error");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to Piccolos</h1>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <Link to="/menu">View Menu</Link> {/* <-- Added link to see Dev 4's work */}
            </div>
            
            <button onClick={testSecureEndpoint} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#e0e0e0', border: '1px solid #ccc' }}>
                Test Secure API
            </button>
        </div>
    );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/menu" element={<CustomerMenu />} />
      </Routes>
    </BrowserRouter>
  );
}