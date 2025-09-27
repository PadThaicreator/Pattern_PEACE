import { useDispatch } from "react-redux";
import { Link , useNavigate } from "react-router-dom";
import { setUser } from "../../redux/userSlice";
import axios from "axios";
import { config } from "../../config";
import { useState } from "react";


export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("")
    const handleLogin = async () => {
        if(!email || !password)
            return;
        const payload = {
            email : email,
            password : password
        }
        const res = await axios.post(`${config.apiBackend}/api/auth/login`, payload);

        if(res){
            localStorage.setItem('jwt' , res.data.token)
            dispatch(setUser({ token: res.data.token, user: res.data.user }))
            navigate('/');
        }
    }
    return (
        <div className="flex flex-col gap-5" >
            <div className="flex flex-col gap-2" >
                <label>Email</label>
                <input type="email" className="border-b-1 outline-0 border-gray-400" placeholder="Enter your email"  value={email} onChange={(e)=>setEmail(e.target.value)}/>
            </div>
            <div className="flex flex-col gap-2">
                <label>Password</label>
                <input type="password" className="border-b-1 outline-0 border-gray-400" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
            </div>
            <div className="p-2 bg-blue-400 text-center rounded-lg cursor-pointer text-white" onClick={handleLogin}>
                Login
            </div>
            <p>
                Don't have an account? <Link to="/register" className="text-blue-400">Register</Link>
            </p>
        </div>
    );
}