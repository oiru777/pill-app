import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      // CSRFトークン取得（XSRF-TOKEN Cookie をセット）
      await axios.get("http://localhost/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Cookie からトークンを取得してデコード
      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      // パスワードリセットリンク送信
      await axios.post(
        "http://localhost/api/v1.0/forgot-password",
        { email },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(xsrfToken || ""),
          },
        }
      );

      setMessage("リセットリンクを送信しました。メールを確認してください。");
    } catch (err: any) {
      console.error(err);
      setError("送信に失敗しました。メールアドレスを確認してください。");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 6,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        パスワード再設定
      </Typography>

      <TextField
        label="登録済みメールアドレス"
        type="email"
        fullWidth
        required
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        リセットリンクを送信
      </Button>

      {message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
