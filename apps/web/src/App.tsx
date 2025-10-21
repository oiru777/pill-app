import "./app.css";

import React from "react";

import { HomePage } from "./pages/HomePage";
import { CountPage } from "./pages/CountPage";
import AddUsagePage from "./pages/AddUsagePage";
import UsageListPage from "./pages/UsageListPage";
import UsageDetailPage from "./pages/UsageDetailPage";
import UsageLineChart from "./pages/UsageLineChart";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { Verified } from "./pages/Verified";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

const App: React.FC = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (user: any) => {
    console.log("ログイン成功:", user);
    setUser(user); // ログイン状態を保存
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/count" element={<CountPage />} />
          <Route path="/add-usage" element={<AddUsagePage />} />
          <Route path="/chart" element={<UsageLineChart />} />
          <Route path="/usage-list" element={<UsageListPage />} />
          <Route path="/usage/:id" element={<UsageDetailPage />} />
          <Route
            path="/register"
            element={<RegisterPage onLogin={handleLogin} />}
          />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/Verified" element={<Verified />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
