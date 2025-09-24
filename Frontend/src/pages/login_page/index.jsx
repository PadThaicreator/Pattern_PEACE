import { Link , useNavigate } from "react-router-dom";


export default function LoginPage() {
     const navigate = useNavigate();
    const handleLogin = () => {
        navigate('/');
    }
    return (
        <div className="flex flex-col gap-5" >
            <div className="flex flex-col gap-2" >
                <label>Email</label>
                <input type="email" className="border-b-1 outline-0 border-gray-400" placeholder="Enter your email"/>
            </div>
            <div className="flex flex-col gap-2">
                <label>Password</label>
                <input type="password" className="border-b-1 outline-0 border-gray-400" placeholder="Enter your password"/>
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