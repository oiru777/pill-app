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
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8000";

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
  }, [userId]);

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
