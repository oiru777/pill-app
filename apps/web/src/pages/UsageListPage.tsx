import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  useToast,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { UsageListItem, UsageList } from "../components/UsageListItem";

export default function UsageListPage() {
  const [usageLists, setUsageLists] = useState<UsageList[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"all" | "my">("my");
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

  const handleUsageClick = (usageId: number) => {
    navigate(`/usage/${usageId}`);
  };

  const handleUserClick = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${userId}`);
  };

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
          <UsageListItem
            key={usage.id}
            usage={usage}
            showUser={true}
            onUsageClick={handleUsageClick}
            onUserClick={handleUserClick}
          />
        ))}
      </VStack>
    </Box>
  );
}
