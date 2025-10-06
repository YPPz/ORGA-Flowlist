import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import hide_icon from "../../assets/hide.png";
import view_icon from "../../assets/view.png";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await resetPassword(token, password);
      setMessage(res.message);
      if (res.success) {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="mb-3">Reset Password</h3>
        <form onSubmit={handleSubmit}>

          {/* Password */}
          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-sm position-absolute top-50 end-0 translate-middle-y"
            >
              <img
                src={showPassword ? hide_icon : view_icon}
                alt={showPassword ? "Hide" : "Show"}
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          </div>

          {/* Confirm Password */}
          <div className="mb-3 position-relative">
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="btn btn-sm position-absolute top-50 end-0 translate-middle-y"
            >
              <img
                src={showConfirm ? hide_icon : view_icon}
                alt={showConfirm ? "Hide" : "Show"}
                style={{ width: "20px", height: "20px" }}
              />
            </button>
          </div>

          <button type="submit" className="btn btn-dark w-100">
            Reset Password
          </button>
        </form>

        <div className="text-start">
          <button
            className="btn small mt-2 text-muted"
            onClick={() => navigate("/login")}
          >
            ← Go to Login
          </button>
        </div>
        {message && <p className="mt-3 text-center">{message}</p>}
      </div>
    </div>
  );
}
