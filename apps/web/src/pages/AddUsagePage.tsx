import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

type Pill = {
  id: number;
  name: string;
};

type UsageItem = {
  pill_id: number;
  quantity: number;
};

export default function AddUsagePage() {
  const toast = useToast();
  // 🔹 state から初期値を設定
  const location = useLocation();
  const state = location.state as
    | { content?: string; timestamp?: string; items?: any[] }
    | undefined;

  const [content, setContent] = useState(state?.content || "");
  const [timestamp, setTimestamp] = useState(state?.timestamp || "");
  const [items, setItems] = useState(
    state?.items || [{ pill_id: 0, quantity: 0 }]
  );
  const [pills, setPills] = useState<Pill[]>([]);
  const [user, setUser] = useState<any>(null);

  // pillsデータをAPIから取得（例）
  useEffect(() => {
    async function fetchData() {
      try {
        const [pillsRes, userRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1.0/pills"),
          fetch("http://localhost:8000/api/v1.0/user", {
            credentials: "include",
          }),
        ]);

        const pillsData = await pillsRes.json();
        const userData = await userRes.json();

        setPills(pillsData);
        setUser(userData);
      } catch (e) {
        toast({
          title: "データの取得に失敗しました。",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }

    fetchData();
  }, [toast]);
  // 薬を追加
  function addItem() {
    setItems([...items, { pill_id: 0, quantity: 0 }]);
  }

  // 薬の選択や数量変更
  function updateItem(index: number, key: keyof UsageItem, value: any) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  }

  // フォーム送信
  async function handleSubmit() {
    if (!content || !timestamp) {
      toast({
        title: "内容と日時は必須です。",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // pill_idが0（未選択）の薬があれば警告
    if (items.some((item) => item.pill_id === 0 || item.quantity <= 0)) {
      toast({
        title: "すべての薬を選択し、数量は1以上にしてください。",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // LaravelサーバーのURL
      const API_BASE = "http://localhost:8000"; // ← 8000 忘れずに！

      // ✅ CSRF Cookieを取得（これで XSRF-TOKEN がセットされる）
      await axios.get(`${API_BASE}/sanctum/csrf-cookie`, {
        withCredentials: true,
        withXSRFToken: true,
      });
      const res = await axios.post(
        `${API_BASE}/api/v1.0/usage-lists`,
        {
          content,
          timestamp,
          items,
        },
        {
          withCredentials: true,
          withXSRFToken: true,
        }
      );

      if (res.status !== 201 && res.status !== 200) {
        throw new Error(`Failed: ${res.status}`);
      }

      toast({
        title: "登録成功！",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // フォームリセット
      setContent("");
      setTimestamp("");
      setItems([{ pill_id: 0, quantity: 0 }]);
    } catch (e) {
      console.error(e);
      toast({
        title: "登録に失敗しました。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  return (
    <Box maxW="600px" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="md">
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>内容</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="使用内容を入力"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>日時</FormLabel>
          <Input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </FormControl>

        <Box>
          <FormLabel>薬の使用一覧</FormLabel>
          {items.map((item, index) => (
            <HStack key={index} spacing={4} mb={2}>
              <Select
                placeholder="薬を選択"
                value={item.pill_id || ""}
                onChange={(e) =>
                  updateItem(index, "pill_id", Number(e.target.value))
                }
              >
                {pills.map((pill) => (
                  <option key={pill.id} value={pill.id}>
                    {pill.name}
                  </option>
                ))}
              </Select>

              <NumberInput
                min={1}
                value={item.quantity || ""}
                onChange={(valueString) =>
                  updateItem(index, "quantity", Number(valueString))
                }
                maxW="100px"
              >
                <NumberInputField />
              </NumberInput>
            </HStack>
          ))}
          <Button size="sm" onClick={addItem}>
            + 薬を追加
          </Button>
        </Box>

        <Button colorScheme="teal" onClick={handleSubmit}>
          登録する
        </Button>
      </VStack>
    </Box>
  );
}
