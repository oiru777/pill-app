import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  useToast,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import { StopDaysCard } from "../components/cards/StopDaysCard.tsx";
import { UsageDaysCard } from "../components/cards/UsageDaysCard.tsx";
import { UsageListItem, UsageList } from "../components/UsageListItem";

type StopPillData = {
  stop_days: number;
  max_stop_days: number;
  consecutive_usage_days: number;
  max_consecutive_usage_days: number;
  last_usage_date?: string;
};

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [usageLists, setUsageLists] = useState<UsageList[]>([]);
  const [userName, setUserName] = useState<string>("");

  // 断薬日数データ関連
  const [stopDaysData, setStopDaysData] = useState<StopPillData | null>(null);
  const [stopDaysLoading, setStopDaysLoading] = useState(false);
  const [stopDaysError, setStopDaysError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8000";

  // 使用記録取得
  useEffect(() => {
    const fetchUserUsageLists = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/v1.0/usage-lists/user/${userId}`,
          { withCredentials: true }
        );
        setUsageLists(res.data);

        // ユーザー名を取得（最初の記録から）
        if (res.data.length > 0) {
          setUserName(res.data[0].user.name);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "記録の取得に失敗しました",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserUsageLists();
  }, [userId, toast]);

  // 断薬日数取得
  const fetchStopDays = async () => {
    try {
      setStopDaysLoading(true);
      setStopDaysError(null);
      const res = await axios.get<StopPillData>(
        `${API_BASE}/api/v1.0/stop-pill-day/user/${userId}`,
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

  useEffect(() => {
    fetchStopDays();
  }, []);

  // マイルストーン色とメッセージ
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

  const handleUsageClick = (usageId: number) => {
    navigate(`/usage/${usageId}`);
  };

  return (
    <Box maxW="800px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md">
      <BackButton />

      <Heading mb={6} textAlign="center">
        {userName ? `${userName} の記録` : "ユーザーの記録"}
      </Heading>

      {loading && (
        <Box textAlign="center" my={4}>
          <Spinner size="lg" />
        </Box>
      )}

      {!loading && usageLists.length === 0 && (
        <Text textAlign="center" color="gray.500">
          まだ記録がありません。
        </Text>
      )}

      <VStack spacing={6} align="stretch">
        {/* 断薬日数と連続服用日数カード */}
        <SimpleGrid columns={[1, 2]} spacing={4} w="full">
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

        {/* 使用履歴 */}
        {usageLists.map((usage) => (
          <UsageListItem
            key={usage.id}
            usage={usage}
            showUser={false}
            onUsageClick={handleUsageClick}
          />
        ))}
      </VStack>
    </Box>
  );
}
