import "./app.css";

import React from "react";

import { HomePage } from "./pages/HomePage";
import { CountPage } from "./pages/CountPage";
import AddUsagePage from "./pages/AddUsagePage";
import UsageListPage from "./pages/UsageListPage";
import UsageDetailPage from "./pages/UsageDetailPage";
import UsageSummaryChart from "./pages/UsageSummaryChart.tsx";
import UserProfilePage from "./pages/UserProfilePage";
import { RegisterPage } from "./pages/beforeLogin/RegisterPage";
import { ForgotPassword } from "./pages/beforeLogin/ForgotPassword";
import { ResetPasswordPage } from "./pages/beforeLogin/ResetPasswordPage";
import { Verified } from "./pages/beforeLogin/Verified";
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
          <Route path="/chart" element={<UsageSummaryChart />} />
          <Route path="/usage-list" element={<UsageListPage />} />
          <Route path="/usage/:id" element={<UsageDetailPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route
            path="/register"
            element={<RegisterPage onLogin={handleLogin} />}
          />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/Verified" element={<Verified />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
