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
        <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-body-tertiary">
            <div className="row w-75 h-50 shadow-lg rounded-4 overflow-hidden">
                <div className="col-6 bg-dark text-white p-5 d-flex flex-column align-items-center justify-content-center text-center">
                    <h1 className="fw-bolder display-3">ORGA Flowlist</h1>
                    <p className="mt-3 mb-5 fs-5">
                        Transform the way you organize your life.
                        <br />Manage tasks, schedule events, and plan ahead —
                        <br />all in one seamless flow.
                        <br /><br />
                        Work smarter. Plan better. Stay in control.
                    </p>
                </div>
                {/* Right */}
                <div className="col-6 bg-dark text-white p-5 d-flex flex-column align-items-center justify-content-center text-center">
                    <div
                        className="p-5 rounded-4 shadow w-75"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)", // โปร่งใสนิดๆ
                            backdropFilter: "blur(6px)", // ให้ effect modern
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <h2 className="fw-bold mb-4 text-dark text-center">Register</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <input
                                    type="text"
                                    name="display_name"
                                    className="form-control"
                                    placeholder="Name"
                                    value={formData.display_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-dark w-100 mb-3 rounded-3"
                                style={{ fontWeight: "600" }}
                            >
                                Register
                            </button>
                        </form>
                        <p className="text-center small text-secondary">
                            Already have an account?{" "}
                            <span
                                className="text-primary fw-semibold"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};