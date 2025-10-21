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
  Textarea,
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

type User = {
  id: number;
  name: string;
};

type Comment = {
  id: number;
  user: User;
  content: string;
  timestamp: string;
};

type UsageList = {
  id: number;
  user_id: number;
  content: string;
  timestamp: string;
  user: User;
  items: UsageItem[];
  comments: Comment[];
};

function getBadgeColor(pillName: string) {
  switch (pillName.toLowerCase()) {
    case "bron":
      return "teal";
    case "restamin":
      return "orange";
    case "pabrongold":
      return "yellow";
    default:
      return "gray";
  }
}

export default function UsageListPage() {
  const [usageLists, setUsageLists] = useState<UsageList[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"all" | "my">("all");
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>(
    {}
  );
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const toast = useToast();

  const API_BASE = "http://localhost:8000";

  // ✅ 現在ログイン中のユーザー取得
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1.0/user`, {
        withCredentials: true,
        withXSRFToken: true,
      });
      setCurrentUserId(res.data.id);
    } catch (err) {
      console.error("ユーザー情報取得エラー:", err);
    }
  };

  // ✅ 使用履歴一覧取得
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

  // ✅ コメント送信
  const handleAddComment = async (usageId: number) => {
    const content = commentTexts[usageId];
    if (!content?.trim()) return;

    try {
      await axios.post(
        `${API_BASE}/api/v1.0/usage-lists/${usageId}/comments`,
        { content },
        { withCredentials: true, withXSRFToken: true }
      );
      setCommentTexts((prev) => ({ ...prev, [usageId]: "" }));
      fetchUsageLists(); // 再取得
    } catch (error) {
      console.error(error);
      toast({
        title: "コメントの送信に失敗しました",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // ✅ 編集
  const handleEdit = async (usage: UsageList) => {
    const newContent = prompt("新しい内容を入力してください", usage.content);
    if (newContent === null) return;

    try {
      await axios.put(
        `${API_BASE}/api/v1.0/usage-lists/${usage.id}`,
        { content: newContent },
        { withCredentials: true, withXSRFToken: true }
      );
      fetchUsageLists();
      toast({
        title: "更新しました",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "更新に失敗しました",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // ✅ 削除
  const handleDelete = async (usageId: number) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await axios.delete(`${API_BASE}/api/v1.0/usage-lists/${usageId}`, {
        withCredentials: true,
      });
      fetchUsageLists();
      toast({
        title: "削除しました",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "削除に失敗しました",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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

            {/* ✅ 自分の記録のみ 編集・削除ボタン表示 */}
            {usage.user_id === currentUserId && (
              <ButtonGroup mt={3} size="sm">
                <Button colorScheme="blue" onClick={() => handleEdit(usage)}>
                  編集
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleDelete(usage.id)}
                >
                  削除
                </Button>
              </ButtonGroup>
            )}

            <Divider my={3} />

            {/* ✅ コメント一覧 */}
            <VStack align="stretch" spacing={2}>
              {usage.comments?.map((comment) => (
                <Box key={comment.id} p={2} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.700">
                    {comment.content}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {comment.user?.name ?? "不明"} ・{" "}
                    {new Date(comment.timestamp).toLocaleString("ja-JP")}
                  </Text>
                </Box>
              ))}
            </VStack>

            {/* ✅ コメント投稿欄 */}
            <HStack mt={2}>
              <Textarea
                size="sm"
                placeholder="コメントを書く..."
                value={commentTexts[usage.id] || ""}
                onChange={(e) =>
                  setCommentTexts((prev) => ({
                    ...prev,
                    [usage.id]: e.target.value,
                  }))
                }
              />
              <Button
                colorScheme="teal"
                size="sm"
                onClick={() => handleAddComment(usage.id)}
              >
                送信
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
