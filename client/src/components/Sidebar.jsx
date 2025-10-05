import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import defaultAvatar from "../assets/default-avatar.png";


export default function Sidebar() {
    const API_URL = import.meta.env.VITE_API_URL;
    const { user } = useUser();
    const logout = () => {
        window.open(`${API_URL}/auth/logout`, "_self");
    };
    const location = useLocation();

    const menuItems = [
        { to: "/", label: "Home" },
        { to: "/calendar", label: "Calendar" },
        { to: "/setting", label: "Setting" },
    ];


    return (
        <div className="position-absolute d-flex flex-column">
            {/* profile */}
            <div className="d-flex flex-column align-items-center m-4 gap-2">
                <img
                    src={user.avatar || defaultAvatar}
                    alt=""
                    className="border border-2 border-secondary-subtle rounded-circle"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <span className="fs-2 fw-semibold">
                    {user.display_name || user.email}
                </span>
            </div>

            {/* menu */}
            <div className="d-flex flex-column align-items-start ms-4 mt-2">
                <div className="d-flex flex-column align-items-start fw-bold mb-5">
                    {menuItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="m-2"
                            style={{
                                color: "inherit",
                                textDecoration: "none",
                                fontWeight: location.pathname === item.to ? "bold" : "normal",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px"
                            }}
                        >
                            {item.label}
                            {location.pathname === item.to && (
                                <span style={{ fontSize: "0.8em", marginLeft: "8px" }}>●</span>
                            )}

                        </Link>
                    ))}

                    <button className="btn btn-outline-danger btn-sm mt-4" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}