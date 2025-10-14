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
} from "@chakra-ui/react";

type Pill = {
  id: number;
  name: string;
};

type UsageItem = {
  pill_id: number;
  quantity: number;
  pill: Pill;
};

type UsageList = {
  id: number;
  user_id: string;
  content: string;
  timestamp: string;
  items: UsageItem[];
};
function getBadgeColor(pillName: string) {
  switch (pillName.toLowerCase()) {
    case "bron":
      return "teal"; // 青系
    case "restamin":
      return "orange"; // オレンジ系
    case "pabrongold":
      return "yellow"; // 黄色系
    default:
      return "gray"; // その他はグレー
  }
}
export default function UsageListPage() {
  const [usageLists, setUsageLists] = useState<UsageList[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchUsageLists = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1.0/usage-lists",
          {
            withCredentials: true,
          }
        );
        setUsageLists(res.data);
      } catch (error) {
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

    fetchUsageLists();
  }, [toast]);

  return (
    <Box maxW="800px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md">
      <Heading mb={4} textAlign="center">
        使用履歴一覧
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
          >
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold" fontSize="lg">
                {usage.content || "無題の使用記録"}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(usage.timestamp).toLocaleString()}
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
