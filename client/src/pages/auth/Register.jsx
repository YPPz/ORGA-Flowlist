import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        display_name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            await register(formData.display_name, formData.email, formData.password);
            alert("Registration successful!");
            navigate("/login");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 w-100 bg-body-tertiary px-3">
            <div className="row w-100 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: "1000px" }}>
                {/* Left */}
                <div className="col-12 col-md-6 bg-dark text-white p-5 text-center d-flex flex-column justify-content-center align-items-center">
                    <h1 className="fw-bolder display-5 mb-4">ORGA Flowlist</h1>
                    <p className="fs-6 mb-5">
                        Transform the way you organize your life.<br />
                        Manage tasks, schedule events, and plan ahead.
                    </p>
                </div>

                {/* Right */}
                <div className="col-12 col-md-6 bg-light d-flex flex-column align-items-center justify-content-center p-4">
                    <div
                        className="p-4 rounded-4 shadow w-100"
                        style={{
                            maxWidth: "360px",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        <h2 className="fw-bold mb-4 text-dark text-center">Register</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="display_name" className="form-control mb-3" placeholder="Name" value={formData.display_name} onChange={handleChange} required />
                            <input type="email" name="email" className="form-control mb-3" placeholder="Email" value={formData.email} onChange={handleChange} required />
                            <input type="password" name="password" className="form-control mb-3" placeholder="Password" value={formData.password} onChange={handleChange} required />
                            <input type="password" name="confirmPassword" className="form-control mb-4" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                            <button type="submit" className="btn btn-dark w-100 mb-3">Register</button>
                        </form>
                        <p className="text-center small text-secondary">
                            Already have an account?{" "}
                            <span className="text-primary fw-semibold" style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
                                Login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
};