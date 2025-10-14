import "./app.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { CountPage } from "./pages/CountPage";
import AddUsagePage from "./pages/AddUsagePage";
import UsageListPage from "./pages/UsageListPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { Verified } from "./pages/Verified";

import { Layout } from "./pages/Layout";
import type { User } from "./types";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1.0/user", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* 未ログイン時 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage onLogin={setUser} />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verified" element={<Verified />} />

        {/* ログイン後：Layout付き */}
        {user && (
          <Route element={<Layout user={user} setUser={setUser} />}>
            <Route path="/count" element={<CountPage />} />
            <Route path="/add-usage" element={<AddUsagePage />} />
            <Route path="/usage-list" element={<UsageListPage />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
