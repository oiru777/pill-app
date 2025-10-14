// src/components/Layout.tsx
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import type { FC } from "react";
import type { User } from "../types";

type LayoutProps = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const Layout: FC<LayoutProps> = ({ user, setUser }) => {
  const navigate = useNavigate();

  // ✅ ログアウト処理
  const handleLogout = async () => {
    try {
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
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box display="flex" minH="100vh" p={4}>
      {/* 左メニュー */}
      <VStack
        spacing={4}
        align="stretch"
        width="220px"
        borderRight="1px solid"
        borderColor="gray.200"
        pr={4}
      >
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          ようこそ、{user?.name ?? "ゲスト"} さん！
        </Text>

        <Button colorScheme="gray" variant="outline" onClick={handleLogout}>
          ログアウト
        </Button>

        <Button
          colorScheme="blue"
          variant="solid"
          onClick={() => navigate("/count")}
        >
          錠数カウント
        </Button>

        <Button
          colorScheme="teal"
          variant="solid"
          onClick={() => navigate("/add-usage")}
        >
          記録追加
        </Button>

        <Button
          colorScheme="pink"
          variant="solid"
          onClick={() => navigate("/usage-list")}
        >
          記録一覧
        </Button>
      </VStack>

      {/* 右コンテンツエリア */}
      <Box flex="1" pl={8}>
        <Outlet />
      </Box>
    </Box>
  );
};
