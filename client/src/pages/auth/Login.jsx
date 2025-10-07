import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import UserContext from "../../contexts/UserContext";
import facebook from "../../assets/facebook.png"
import google from "../../assets/google.png"
import { login, facebookLogin, googleLogin } from "../../api/auth";
import SocialLoginButtons from "../../components/SocialLoginButtons";

export default function Login() {
    const alertShown = useRef(false);
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (alertShown.current) return;
        const params = new URLSearchParams(window.location.search);
        const errorMessage = params.get("error");
        if (errorMessage) {
            alert(errorMessage);
            alertShown.current = true;

            const newPath = window.location.pathname;
            window.history.replaceState({}, "", newPath);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            if (!data.success) {
                alert(data.message);
                return;
            }
            setUser(data.user);
            navigate("/");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 w-100 bg-body-tertiary px-3">
            <div className="row w-100 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: "900px" }}>
                {/* Left */}
                <div className="col-12 col-md-6 bg-white d-flex flex-column align-items-center justify-content-center text-center p-4">
                    <h2 className="fw-bold mb-2">Sign In</h2>
                    <div className="d-flex flex-row gap-3 mb-3">
                        <SocialLoginButtons socialIcon={facebook} onClick={facebookLogin} />
                        <SocialLoginButtons socialIcon={google} onClick={googleLogin} />
                    </div>
                    <p className="text-muted small mb-4">Or use your email account</p>

                    <form className="w-100" style={{ maxWidth: "320px" }} onSubmit={handleLogin}>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-2">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3 text-center">
                            <a href="/forgot-password" className="small text-muted">
                                Forgot your password?
                            </a>
                        </div>

                        <button type="submit" className="btn btn-outline-dark w-100">
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Right */}
                <div className="col-12 col-md-6 bg-dark text-white p-5 d-flex flex-column align-items-center justify-content-center text-center">
                    <h2 className="fw-bold mb-2">Welcome to</h2>
                    <h1 className="fw-bolder display-6">ORGA Flowlist</h1>
                    <p className="mt-3 mb-4 small">
                        Let’s create your own flow of <br /> tasks, events, and plans in one place.
                    </p>
                    <p className="text-light small mb-2">Don’t have an account yet?</p>
                    <a href="/register" className="btn btn-outline-light px-4">
                        Sign Up
                    </a>
                </div>
            </div>
        </div>

    );
}
