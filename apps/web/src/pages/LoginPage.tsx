import React, { useState } from "react";
import type { FC } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Text,
  useToast,
  Avatar,
  Link,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import type { LoginFormProps } from "../types";
import { useNavigate } from "react-router-dom";

export const LoginPage: FC<LoginFormProps> = ({ onLogin }) => {
  const [loginId, setLoginId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    const url = "http://localhost:8000";
    axios.defaults.baseURL = url;
    axios.defaults.withCredentials = true;

    try {
      // CSRFトークン取得
      await axios.get("/sanctum/csrf-cookie", { withCredentials: true });
      console.log("==csrf-cookie success==");

      // Cookie から XSRF-TOKEN を取得してデコード
      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      // ログインAPI呼び出し
      const res = await axios.post(
        "/api/v1.0/login",
        {
          email: loginId,
          password: password,
        },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(xsrfToken || ""),
          },
        }
      );

      // 成功時処理
      onLogin(res.data);
      console.log("==login success==", res);
      setErrorMessage(null);
      setSuccessMessage("ログインに成功しました。");

      toast({
        title: "ログイン成功",
        description: "ログインに成功しました。",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e: any) {
      console.error("===login error===", e);
      setSuccessMessage(null);
      setErrorMessage("ログインに失敗しました。");

      toast({
        title: "ログインエラー",
        description: "メールアドレスまたはパスワードが正しくありません。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="sm" centerContent>
      <Box
        mt={12}
        p={8}
        w="100%"
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
      >
        <VStack spacing={6}>
          <Avatar bg="blue.500" icon={<LockIcon />} />
          <Heading as="h1" size="lg">
            ログイン
          </Heading>

          {successMessage && (
            <Alert status="success">
              <AlertIcon />
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert status="error">
              <AlertIcon />
              {errorMessage}
            </Alert>
          )}

          <FormControl id="email" isRequired>
            <FormLabel>メールアドレス</FormLabel>
            <Input
              type="email"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="your@email.com"
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>パスワード</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormControl>

          <Button colorScheme="blue" w="100%" onClick={handleLogin} mt={4}>
            ログイン
          </Button>

          <Button
            variant="outline"
            w="100%"
            onClick={() => navigate("/register")}
          >
            新規登録
          </Button>

          <Text fontSize="sm">
            <Link color="blue.500" onClick={() => navigate("/forgotpassword")}>
              パスワードをお忘れですか？
            </Link>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
