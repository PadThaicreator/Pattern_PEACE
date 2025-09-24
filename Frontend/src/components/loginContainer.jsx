import { Outlet } from "react-router-dom";

export default function LoginContainer() {
  return (
    <div className="flex flex-1 items-center justify-center h-screen bg-red-200">
        <div className="w-300 p-6 bg-white rounded-lg flex shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
            <div className="flex-1 p-10 items-center justify-center flex">
                <div className="shadow-md rounded-full w-100 h-100 overflow-hidden">
                    <img src="/logo.png" alt="Login" className="object-cover w-full h-full" />
                </div>
                    
                
            </div>
            <div className="flex flex-1  justify-center items-center">
                <Outlet /> 
            </div>
        </div>  
    </div>
  );
}
