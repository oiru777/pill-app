import React, { useEffect, useState } from "react";
import axios from "axios";
import type { FC } from "react";
import { Button, Typography, Box } from "@mui/material";
import type { User } from "../types";
import { LoginPage } from "./LoginPage";

export const HomePage: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/api/v1.0/user", { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const resendVerificationEmail = async () => {
    setSendingVerification(true);
    try {
      await axios.post(
        "http://localhost/api/v1.0/email/verification-notification",
        {},
        { withCredentials: true }
      );
      alert("認証メールを再送しました。メールを確認してください。");
    } catch (error) {
      alert("認証メールの再送に失敗しました。");
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!user) return <LoginPage onLogin={(user) => setUser(user)} />;

  // メール認証済みチェック（email_verified_atがLaravel標準）
  if (!user.email_verified_at) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          メール認証が完了していません。
        </Typography>
        <Typography gutterBottom>
          登録時に送信されたメール内のリンクをクリックして認証を完了してください。
        </Typography>
        <Button
          variant="contained"
          disabled={sendingVerification}
          onClick={resendVerificationEmail}
        >
          {sendingVerification ? "送信中..." : "認証メールを再送する"}
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={() => {
            setUser(null); // ログアウトしてログイン画面へ戻す
          }}
        >
          ログアウト
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Typography variant="h6">ようこそ、{user.name}さん！</Typography>
      <Button
        variant="outlined"
        onClick={async () => {
          await axios.post(
            "http://localhost:8000/api/v1.0/logout",
            {},
            { withCredentials: true }
          );
          setUser(null);
        }}
      >
        ログアウト
      </Button>
      <Box sx={{ mt: 4, width: "100%", maxWidth: 600 }}></Box>
    </Box>
  );
};
