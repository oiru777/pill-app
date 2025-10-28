import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Badge,
  Button,
  Textarea,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type Pill = { id: number; name: string };
type UsageItem = { pill_id: number; quantity: number; pill: Pill };
type User = { id: number; name: string };
type Comment = { id: number; user: User; content: string; timestamp: string };
type UsageDetail = {
  id: number;
  user_id: number;
  content: string;
  timestamp: string;
  user: User;
  items: UsageItem[];
  comments: Comment[];
};

const API_BASE = "http://localhost:8000";

export default function UsageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [usage, setUsage] = useState<UsageDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // 🔹 使用履歴の取得
  const fetchUsage = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1.0/usage-lists/${id}`, {
        withCredentials: true,
      });
      setUsage(res.data);
    } catch (err) {
      console.error("使用履歴取得エラー:", err);
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

  // 🔹 ログイン中のユーザー取得
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1.0/user`, {
        withCredentials: true,
      });
      setCurrentUserId(res.data.id);
    } catch (err) {
      console.error("ユーザー情報取得エラー:", err);
    }
  };

  // 🔹 削除処理
  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      await axios.delete(`${API_BASE}/api/v1.0/usage-lists/${id}`, {
        withCredentials: true,
        withXSRFToken: true,
      });
      toast({ title: "削除しました", status: "info", duration: 2000 });
      navigate("/usage");
    } catch (err) {
      console.error("削除エラー:", err);
      toast({
        title: "削除に失敗しました",
        status: "error",
        duration: 3000,
      });
    }
  };

  // 🔹 編集処理
  const handleEdit = async () => {
    const newContent = prompt("新しい内容を入力してください", usage?.content);
    if (!newContent || !newContent.trim()) return;
    try {
      await axios.put(
        `${API_BASE}/api/v1.0/usage-lists/${id}`,
        { content: newContent },
        { withCredentials: true, withXSRFToken: true }
      );
      toast({ title: "更新しました", status: "success", duration: 2000 });
      fetchUsage();
    } catch (err) {
      console.error("編集エラー:", err);
      toast({
        title: "更新に失敗しました",
        status: "error",
        duration: 3000,
      });
    }
  };

  // 🔹 コメント投稿
  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(
        `${API_BASE}/api/v1.0/usage-lists/${id}/comments`,
        { content: comment },
        { withCredentials: true, withXSRFToken: true }
      );
      setComment("");
      fetchUsage();
    } catch (err) {
      console.error("コメント送信エラー:", err);
      toast({
        title: "コメントの投稿に失敗しました",
        status: "error",
        duration: 3000,
      });
    }
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

  useEffect(() => {
    fetchCurrentUser();
    fetchUsage();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!usage) {
    return (
      <Text textAlign="center" mt={8} color="gray.500">
        記録が見つかりません。
      </Text>
    );
  }

  return (
    <Box maxW="700px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md">
      <Heading size="md" mb={3}>
        {usage.content || "無題の記録"}
      </Heading>
      <Text color="gray.600" mb={2}>
        記録者: {usage.user?.name ?? "不明"}
      </Text>
      <Text color="gray.500" fontSize="sm">
        {new Date(usage.timestamp).toLocaleString("ja-JP")}
      </Text>

      <Divider my={3} />

      {/* 🔹 使用アイテム一覧 */}
      <VStack align="start" spacing={1} mb={3}>
        {usage.items?.length ? (
          usage.items.map((item) => (
            <HStack key={item.pill_id} spacing={4}>
              <Badge colorScheme={getBadgeColor(item.pill.name)}>
                {item.pill.name}
              </Badge>
              <Text>数量: {item.quantity}</Text>
            </HStack>
          ))
        ) : (
          <Text color="gray.500">アイテムがありません。</Text>
        )}
      </VStack>

      {/* 🔹 編集・削除ボタン（自分の記録のみ） */}
      {usage.user_id === currentUserId && (
        <HStack mb={3}>
          <Button colorScheme="blue" onClick={handleEdit}>
            編集
          </Button>
          <Button colorScheme="red" onClick={handleDelete}>
            削除
          </Button>
        </HStack>
      )}

      <Divider my={3} />

      {/* 🔹 コメント一覧 */}
      <VStack align="stretch" spacing={2}>
        {usage.comments?.length ? (
          usage.comments.map((c) => (
            <Box key={c.id} p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="sm">{c.content}</Text>
              <Text fontSize="xs" color="gray.500">
                {c.user?.name ?? "不明"} ・{" "}
                {new Date(c.created_at).toLocaleString("ja-JP")}
              </Text>
            </Box>
          ))
        ) : (
          <Text color="gray.500" fontSize="sm">
            まだコメントはありません。
          </Text>
        )}
      </VStack>

      {/* 🔹 コメント投稿欄 */}
      <HStack mt={3} align="start">
        <Textarea
          placeholder="コメントを書く..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button colorScheme="teal" onClick={handleComment}>
          送信
        </Button>
      </HStack>
    </Box>
  );
}
