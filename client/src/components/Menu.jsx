import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import defaultAvatar from "../assets/default-avatar.png";

export default function Topbar() {
    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useUser();
    const location = useLocation();

    const menuItems = [
        { to: "/", label: "Home" },
        { to: "/calendar", label: "Calendar" },
        { to: "/setting", label: "Setting" },
    ];

    const logout = () => {
        window.open(`${API_URL}/auth/logout`, "_self");
    };

    return (
        <div className="d-flex flex-row align-items-center justify-content-between bg-white shadow-sm px-3 px-md-5 py-2 sticky-top">

            {/* Left: Avatar + Name */}
            <div className="d-flex flex-column flex-md-row align-items-center gap-0 gap-md-3 my-1 mb-md-0">
                <img
                    src={user.avatar || defaultAvatar}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
                <span className="fw-semibold">{user.display_name || user.email}</span>
            </div>

            {/* Middle & Right: Menu + Logout */}
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
                {menuItems.map(item => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`text-decoration-none ${location.pathname === item.to ? "fw-bold" : ""}`}
                        style={{ color: "inherit" }}
                    >
                        {item.label}
                    </Link>
                ))}
                <button className="btn btn-outline-danger btn-sm ms-2" onClick={logout}>
                    Logout
                </button>
            </div>
        </div>
    );
}
