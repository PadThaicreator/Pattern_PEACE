import { Outlet } from "react-router-dom";

export default function NavBar() {
    return (
        <div >
            <div className="sticky top-0">
                This is NavBar
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}