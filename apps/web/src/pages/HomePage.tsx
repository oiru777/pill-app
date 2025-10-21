import React, { useEffect, useState } from "react";
import axios from "axios";
import type { FC } from "react";
import { Box, Button, Text, Heading, VStack, useToast } from "@chakra-ui/react";
import type { User } from "../types";
import { LoginPage } from "./LoginPage";
import { useNavigate } from "react-router-dom";

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);
  const toast = useToast();

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
        "http://localhost:8000/api/v1.0/email/verification-notification",
        {},
        { withCredentials: true }
      );

      toast({
        title: "認証メールを再送しました。",
        description: "メールを確認してください。",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "認証メールの再送に失敗しました。",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSendingVerification(false);
    }
  };

  if (loading) return <Text textAlign="center">Loading...</Text>;

  if (!user) return <LoginPage onLogin={(user) => setUser(user)} />;

  // メール認証チェック
  if (!user.email_verified_at) {
    return (
      <Box textAlign="center" mt={8}>
        <Heading as="h3" size="md" mb={3}>
          メール認証が完了していません
        </Heading>
        <Text mb={5}>
          登録時に送信されたメール内のリンクをクリックして認証を完了してください。
        </Text>

        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            isLoading={sendingVerification}
            onClick={resendVerificationEmail}
          >
            {sendingVerification ? "送信中..." : "認証メールを再送する"}
          </Button>

          <Button
            colorScheme="gray"
            variant="outline"
            onClick={() => setUser(null)} // ログアウトしてログイン画面へ戻す
          >
            ログアウト
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        ようこそ、{user.name} さん！
      </Text>

      <VStack spacing={3}>
        <Button
          colorScheme="gray"
          variant="outline"
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

        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => navigate("/count")}
        >
          錠数カウント
        </Button>

        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => navigate("/add-usage")}
        >
          記録追加
        </Button>

        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => navigate("/usage-list")}
        >
          記録一覧
        </Button>
        <Button
          colorScheme="teal"
          variant="outline"
          onClick={() => navigate("/chart")}
        >
          グラフ
        </Button>
      </VStack>
    </Box>
  );
};
