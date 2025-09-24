import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = () => {
        if(!password){
            alert("Please enter a password")
        }
        if(password !== confirmPassword){
            alert("Passwords do not match")
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