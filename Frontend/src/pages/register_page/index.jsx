import { Link } from "react-router-dom";

export default function RegisterPage() {

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2" >
                <label>Email</label>
                <input type="email" className="border-b-1 outline-0 border-gray-400" placeholder="Enter your email"/>
            </div>
            <div className="flex flex-col gap-2">
                <label>Password</label>
                <input type="password" className="border-b-1 outline-0 border-gray-400" placeholder="Enter your password"/>
            </div>
             <div className="flex flex-col gap-2">
                <label>Confirm Password</label>
                <input type="password" className="border-b-1 outline-0 border-gray-400" placeholder="Confirm your password"/>
            </div>
            <div className="p-2 bg-blue-400 text-center rounded-lg cursor-pointer text-white" >
                Register
            </div>
            <Link to="/login" className="self-center">Back</Link>
        </div>

    );
}