import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Spinner,
  Badge,
  useToast,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// 型定義
type Pill = { id: number; name: string };
type UsageItem = { pill_id: number; quantity: number; pill: Pill };
type User = { id: number; name: string };
type UsageList = {
  id: number;
  user_id: number;
  content: string;
  timestamp: string;
  user: User;
  items: UsageItem[];
};

type StopPillData = {
  stop_days: number;
  max_stop_days: number;
  consecutive_usage_days: number;
  max_consecutive_usage_days: number;
  last_usage_date?: string;
};

// 薬ごとのバッジ色
function getBadgeColor(pillName: string) {
  switch (pillName.toLowerCase()) {
    case "ブロン":
      return "blue";
    case "レスタミン":
      return "orange";
    case "パブロンゴールド":
      return "yellow";
    case "メジコン":
      return "purple";
    default:
      return "gray";
  }
}

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

  return (
    <Box maxW="800px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md">
      <HStack mb={4}>
        <Button
          leftIcon={<ArrowLeft size={20} />}
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          戻る
        </Button>
      </HStack>

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
          {/* 断薬日数 */}
          <Box
            borderWidth="1px"
            borderRadius="xl"
            p={6}
            bg="white"
            shadow="md"
            textAlign="center"
          >
            {stopDaysLoading ? (
              <Spinner size="lg" color="teal.500" />
            ) : stopDaysError ? (
              <VStack spacing={2}>
                <Text color="red.500" fontSize="sm">
                  {stopDaysError}
                </Text>
                <Button size="xs" onClick={fetchStopDays} colorScheme="teal">
                  再読み込み
                </Button>
              </VStack>
            ) : stopDaysData ? (
              <VStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  断薬日数
                </Text>
                <Text fontSize="5xl" fontWeight="bold" color="teal.500">
                  {stopDaysData.stop_days}
                </Text>
                <Text fontSize="lg" color="gray.500">
                  日
                </Text>
                {stopDaysData.stop_days > 0 && (
                  <Badge
                    colorScheme={getMilestoneColor(stopDaysData.stop_days)}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {getMilestoneMessage(stopDaysData.stop_days)}
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.500" mt={2}>
                  最高記録: {stopDaysData.max_stop_days}日
                </Text>
              </VStack>
            ) : (
              <Text color="gray.500" fontSize="sm">
                データなし
              </Text>
            )}
          </Box>

          {/* 連続服用日数 */}
          <Box
            borderWidth="1px"
            borderRadius="xl"
            p={6}
            bg="white"
            shadow="md"
            textAlign="center"
          >
            {stopDaysLoading ? (
              <Spinner size="lg" color="blue.500" />
            ) : stopDaysError ? (
              <VStack spacing={2}>
                <Text color="red.500" fontSize="sm">
                  {stopDaysError}
                </Text>
              </VStack>
            ) : stopDaysData ? (
              <VStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  連続服用日数
                </Text>
                <Text fontSize="5xl" fontWeight="bold" color="blue.500">
                  {stopDaysData.consecutive_usage_days}
                </Text>
                <Text fontSize="lg" color="gray.500">
                  日
                </Text>
                {stopDaysData.consecutive_usage_days >= 30 && (
                  <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
                    継続中
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.500" mt={2}>
                  最高記録: {stopDaysData.max_consecutive_usage_days}日
                </Text>
              </VStack>
            ) : (
              <Text color="gray.500" fontSize="sm">
                データなし
              </Text>
            )}
          </Box>
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
          <Box
            key={usage.id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            shadow="sm"
            bg="white"
            _hover={{ bg: "gray.50", cursor: "pointer" }}
            onClick={() => navigate(`/usage/${usage.id}`)}
          >
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold" fontSize="lg">
                {usage.content || "無題の使用記録"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(usage.timestamp).toLocaleString("ja-JP")}
              </Text>
            </HStack>

            <Divider mb={3} />

            <VStack align="start" spacing={1}>
              {usage.items.map((item) => (
                <HStack key={item.pill_id} spacing={4}>
                  <Badge colorScheme={getBadgeColor(item.pill.name)}>
                    {item.pill.name}
                  </Badge>
                  <Text>数量: {item.quantity}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
