import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        
        if (!username.trim()) {
            alert("Please enter a username");
            return;
        }
        if (!email.trim()) {
            alert("Please enter an email");
            return;
        }
        if (!password) {
            alert("Please enter a password");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        try {
            console.log('Sending registration request with:', { name: username, email });
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name: username,
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Registration response:', response.data);
            if (response.data) {
                alert("Registration successful! Please log in.");
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (error.response) {
                console.error('Error response:', {
                    data: error.response.data,
                    status: error.response.status,
                    headers: error.response.headers
                });
                alert(error.response.data.message || "Registration failed. Please check your details.");
            } else if (error.request) {
                console.error('No response received');
                alert("Server is not responding. Please check if the backend server is running.");
            } else {
                console.error('Error:', error.message);
                alert("Registration failed: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2" >
                <label>Username</label>
                <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} className="border-1 p-2 rounded-lg outline-0 border-gray-400" placeholder="Enter your username"/>
            </div>
            <div className="flex flex-col gap-2" >
                <label>Email</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)}  className="border-1 p-2 rounded-lg outline-0 border-gray-400" placeholder="Enter your email"/>
            </div>
            <div className="flex flex-col gap-2">
                <label>Password</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="border-1 p-2 rounded-lg outline-0 border-gray-400" placeholder="Enter your password"/>
            </div>
             <div className="flex flex-col gap-2">
                <label>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="border-1 p-2 rounded-lg outline-0 border-gray-400" placeholder="Confirm your password"/>
            </div>
            <div className="p-2 bg-blue-400 text-center rounded-lg cursor-pointer text-white" onClick={handleRegister}>
                Register
            </div>
            <Link to="/" className="self-center">
                <div className="p-2 bg-white text-center rounded-lg cursor-pointer text-blue-400 border-2">
                    Back
                </div>
            </Link>
        </div>

    );
}