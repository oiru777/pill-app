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
  ButtonGroup,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

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

export default function UsageListPage() {
  const [usageLists, setUsageLists] = useState<UsageList[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"all" | "my">("all");
  const toast = useToast();
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8000";

  const fetchUsageLists = async () => {
    setLoading(true);
    try {
      const endpoint =
        mode === "all"
          ? `${API_BASE}/api/v1.0/usage-lists`
          : `${API_BASE}/api/v1.0/usage-lists/my`;

      const res = await axios.get(endpoint, { withCredentials: true });
      setUsageLists(res.data);
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

  useEffect(() => {
    fetchUsageLists();
  }, [mode]);

  return (
    <Box maxW="800px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md">
      <Heading mb={4} textAlign="center">
        使用履歴一覧
      </Heading>

      <ButtonGroup mb={6} justifyContent="center" width="100%">
        <Button
          colorScheme={mode === "my" ? "teal" : "gray"}
          onClick={() => setMode("my")}
        >
          自分の記録
        </Button>
        <Button
          colorScheme={mode === "all" ? "teal" : "gray"}
          onClick={() => setMode("all")}
        >
          みんなの記録
        </Button>
      </ButtonGroup>

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

            <Text fontSize="sm" color="gray.600" mb={2}>
              記録者: <b>{usage.user?.name ?? "不明"}</b>
            </Text>

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
