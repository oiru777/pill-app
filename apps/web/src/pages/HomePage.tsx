import React, { useEffect, useState } from "react";
import axios from "axios";
import type { FC } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import type { User } from "../types";
import { LoginPage } from "./LoginPage";
import { useNavigate } from "react-router-dom";

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1.0/user", { withCredentials: true })
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
    <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        ようこそ、{user.name}さん！
      </Text>

      <Button
        variant="outline"
        mb={2}
        onClick={async () => {
          await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
            withCredentials: true,
          });

          const xsrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

          await axios.post(
            "http://localhost:8000/api/v1.0/logout",
            {},
            {
              withCredentials: true,
              headers: {
                "X-XSRF-TOKEN": decodeURIComponent(xsrfToken || ""),
              },
            }
          );

          setUser(null);
        }}
      >
        ログアウト
      </Button>

      <Button variant="outline" mb={2} onClick={() => navigate("/count")}>
        錠数カウント
      </Button>

      <Button variant="outline" mb={2} onClick={() => navigate("/add-usage")}>
        記録追加
      </Button>

      <Button variant="outline" mb={2} onClick={() => navigate("/usage-list")}>
        記録一覧
      </Button>

      <Box mt={4} width="100%" maxW="600px"></Box>
    </Box>
  );
};
