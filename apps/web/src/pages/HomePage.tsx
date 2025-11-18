import React, { useEffect, useState } from "react";
import axios from "axios";
import type { FC } from "react";
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  useToast,
  Spinner,
  Badge,
  SimpleGrid,
  Container,
} from "@chakra-ui/react";
import type { User } from "../types";
import { LoginPage } from "./beforeLogin/LoginPage.tsx";
import { useNavigate } from "react-router-dom";
import { StopDaysCard } from "../components/cards/StopDaysCard.tsx";
import { UsageDaysCard } from "../components/cards/UsageDaysCard.tsx";

interface StopPillData {
  stop_days: number;
  consecutive_usage_days: number;
  max_stop_days: number;
  max_consecutive_usage_days: number;
  last_usage_date: string | null;
  message: string;
}

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);
  const toast = useToast();
  const [stopDaysData, setStopDaysData] = useState<StopPillData | null>(null);
  const [stopDaysLoading, setStopDaysLoading] = useState(false);
  const [stopDaysError, setStopDaysError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user?.email_verified_at) {
      fetchStopDays();
    }
  }, [user]);

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

  const fetchStopDays = async () => {
    try {
      setStopDaysLoading(true);
      setStopDaysError(null);
      const res = await axios.get<StopPillData>(
        "http://localhost:8000/api/v1.0/my-stop-pill-day",
        { withCredentials: true }
      );
      setStopDaysData(res.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "データの取得に失敗しました";
      setStopDaysError(errorMessage);
    } finally {
      setStopDaysLoading(false);
    }
  };

  const getMilestoneColor = (days: number): string => {
    if (days >= 365) return "purple";
    if (days >= 180) return "blue";
    if (days >= 90) return "green";
    if (days >= 30) return "teal";
    if (days >= 7) return "cyan";
    return "gray";
  };

  const getMilestoneMessage = (days: number): string => {
    if (days >= 365) return "🎉 1年以上達成";
    if (days >= 180) return "🌟 半年達成";
    if (days >= 90) return "✨ 3ヶ月達成";
    if (days >= 30) return "💪 1ヶ月達成";
    if (days >= 28) return "🎯 4週間達成";
    if (days >= 21) return "🎯 3週間達成";
    if (days >= 14) return "🎯 2週間達成";
    if (days >= 7) return "🎯 1週間達成";
    return "継続中";
  };

  const handleLogout = async () => {
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
  };

  if (loading) {
    return (
      <Container maxW="container.md" centerContent mt={20}>
        <Spinner size="xl" color="teal.500" />
      </Container>
    );
  }

  if (!user) return <LoginPage onLogin={(user) => setUser(user)} />;

  if (!user.email_verified_at) {
    return (
      <Container maxW="container.md" mt={8}>
        <Box
          textAlign="center"
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
        >
          <Heading as="h3" size="md" mb={3}>
            メール認証が完了していません
          </Heading>
          <Text mb={5} color="gray.600">
            登録時に送信されたメール内のリンクをクリックして認証を完了してください。
          </Text>

          <VStack spacing={3}>
            <Button
              colorScheme="blue"
              isLoading={sendingVerification}
              onClick={resendVerificationEmail}
              w="200px"
            >
              認証メールを再送
            </Button>

            <Button variant="ghost" onClick={() => setUser(null)} w="200px">
              ログアウト
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        {/* ヘッダー */}
        <Box textAlign="center">
          <Text fontSize="lg" color="gray.600">
            ようこそ、{user.name} さん
          </Text>
        </Box>

        {/* 断薬日数と連続服用日数カード */}
        <SimpleGrid columns={2} spacing={4} w="full">
          <StopDaysCard
            loading={stopDaysLoading}
            error={stopDaysError}
            data={stopDaysData}
            onRetry={fetchStopDays}
            getMilestoneColor={getMilestoneColor}
            getMilestoneMessage={getMilestoneMessage}
          />

          <UsageDaysCard
            loading={stopDaysLoading}
            error={stopDaysError}
            data={stopDaysData}
          />
        </SimpleGrid>

        {/* 最終服薬日 */}
        {stopDaysData?.last_usage_date && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            最終服薬日:{" "}
            {new Date(stopDaysData.last_usage_date).toLocaleDateString("ja-JP")}
          </Text>
        )}

        {/* メニューボタン */}
        <SimpleGrid columns={2} spacing={4} w="full">
          <Button
            h="60px"
            colorScheme="teal"
            onClick={() => navigate("/count")}
          >
            錠数カウント
          </Button>

          <Button
            h="60px"
            colorScheme="teal"
            onClick={() => navigate("/add-usage")}
          >
            記録追加
          </Button>

          <Button
            h="60px"
            colorScheme="teal"
            onClick={() => navigate("/usage-list")}
          >
            記録一覧
          </Button>

          <Button
            h="60px"
            colorScheme="teal"
            onClick={() => navigate("/chart")}
          >
            集計
          </Button>
        </SimpleGrid>

        {/* ログアウトボタン */}
        <Button variant="ghost" onClick={handleLogout} w="full" mt={4}>
          ログアウト
        </Button>
      </VStack>
    </Container>
  );
};
