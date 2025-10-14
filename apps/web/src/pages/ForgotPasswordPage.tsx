import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      await axios.post(
        "http://localhost:8000/api/v1.0/reset-password",
        {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          withCredentials: true,
        }
      );
      setMessage("パスワードをリセットしました。ログインしてください。");
    } catch (err: any) {
      console.error(err);
      setError("リセットに失敗しました。もう一度お試しください。");
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
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom>
        パスワード再設定
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="メールアドレス"
          type="email"
          value={email}
          disabled
          fullWidth
        />
        <TextField
          label="新しいパスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="確認用パスワード"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          fullWidth
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          パスワードをリセット
        </Button>
      </Stack>
    </Box>
  );
};
