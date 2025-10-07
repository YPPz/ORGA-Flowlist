import { useState } from "react";
import { forgotPassword } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await forgotPassword(email);
    setMessage(res.message);
  };

  return (
   <div className="d-flex vh-100 justify-content-center align-items-center bg-body-tertiary px-3">
  <div className="card p-4 shadow w-100" style={{ maxWidth: "400px" }}>
    <h3 className="mb-3 text-center">Forgot Password</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-dark w-100">Send Reset Link</button>
        </form>
        {message && <p className="mt-3 text-center">{message}</p>}
      </div>
    </div>
  );
}
