import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  VStack,
  Text,
  useToast,
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // CSRF トークン取得
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
      });

      // Cookie から XSRF-TOKEN を取得
      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      // パスワードリセットリンク送信
      await axios.post(
        "http://localhost:8000/api/v1.0/forgot-password",
        { email },
        {
          withCredentials: true,
          headers: {
            "X-XSRF-TOKEN": decodeURIComponent(xsrfToken || ""),
          },
        }
      );

      setMessage("リセットリンクを送信しました。メールを確認してください。");
      toast({
        title: "送信完了",
        description: "リセットリンクをメールに送信しました。",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error(err);
      setError("送信に失敗しました。メールアドレスを確認してください。");
      toast({
        title: "エラー",
        description: "メール送信に失敗しました。",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider theme={extendTheme()}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        maxW="sm"
        mx="auto"
        mt={12}
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          パスワード再設定
        </Heading>

        <VStack spacing={4} align="stretch">
          {message && (
            <Alert status="success">
              <AlertIcon />
              {message}
            </Alert>
          )}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>登録済みメールアドレス</FormLabel>
            <Input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <Button colorScheme="blue" type="submit" w="100%">
            リセットリンクを送信
          </Button>
        </VStack>

        <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
          登録済みメールアドレスにリセットリンクをお送りします。
        </Text>
      </Box>
    </ChakraProvider>
  );
};
