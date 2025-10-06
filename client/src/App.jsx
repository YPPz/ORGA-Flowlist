import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Home from "./pages/Home";
import Calendar from "./pages/calendar/Calendar";
import Setting from "./pages/Setting";
import UserContext from "./contexts/UserContext";
import { getUser } from "./api/user";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/login/success`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json", "Content-Type": "application/json", },
        });

        if (res.status === 200) {
          const data = await res.json();
          const updatedUser = await getUser(data.user.user_id);
          setUser(updatedUser.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("fetchUser error:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  if (user === undefined) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center">
        <p className="fs-4">Loading...</p>
      </div>
    );
  }
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Home />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="setting" element={<Setting />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
