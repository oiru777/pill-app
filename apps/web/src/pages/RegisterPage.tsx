import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Props = {
  onLogin: (user: any) => void;
};

export const RegisterPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    setError(null);

    try {
      // CSRF cookie 取得（Sanctum用）
      axios.defaults.withCredentials = true;
      await axios.get("http://localhost/sanctum/csrf-cookie", {
        withCredentials: true,
        withXSRFToken: true,
      });

      // 登録リクエスト送信
      const res = await axios.post("http://localhost/api/v1.0/register", form, {
        withCredentials: true,
        withXSRFToken: true,
      });

      console.log("✅ 登録成功:", res.data);
      onLogin(res.data);
      navigate("/");
    } catch (err: any) {
      console.error("❌ 登録失敗:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("登録に失敗しました。");
      }
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={5}>
      <Typography variant="h5" gutterBottom>
        新規登録
      </Typography>

      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="名前"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="メールアドレス"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="パスワード"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="パスワード（確認）"
          name="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={handleChange}
          fullWidth
        />

        <Button variant="contained" color="primary" onClick={handleRegister}>
          登録する
        </Button>
      </Stack>
    </Box>
  );
};
