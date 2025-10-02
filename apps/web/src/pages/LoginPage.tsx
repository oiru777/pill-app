import React, { useState } from "react";
import type { FC } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Avatar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { LoginFormProps } from "../types";
import { useNavigate } from "react-router-dom";

export const LoginPage: FC<LoginFormProps> = ({ onLogin }) => {
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const url = "http://localhost";
    axios.defaults.baseURL = url;
    axios.defaults.withCredentials = true;

    try {
      await axios.get("/sanctum/csrf-cookie");
      console.log("==csrf-cookie success==");

      const res = await axios.post("/api/v1.0/login", {
        email: loginId,
        password: password,
      });
      onLogin(res.data);

      console.log("==login success==", res);
      setErrorMessage(null);
      setSuccessMessage("ログインに成功しました。");
    } catch (e: any) {
      console.error("===login error===", e);
      setSuccessMessage(null);
      setErrorMessage("ログインに失敗しました。");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          ログイン
        </Typography>

        <Box sx={{ mt: 3, width: "100%" }}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="メールアドレス"
            type="email"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            ログイン
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => navigate(`/register`)}
          >
            新規登録
          </Button>
          <Button variant="text" onClick={() => navigate(`/forgotpassword`)}>
            パスワード忘れた方はこちら
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
