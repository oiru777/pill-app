import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Button,
  Alert,
  AlertIcon,
  VStack,
  useToast,
  Text,
} from "@chakra-ui/react";

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
        withXSRFToken: true,
      });

      await axios.post(
        "http://localhost:8000/api/v1.0/reset-password",
        {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
        { withCredentials: true }
      );

      setMessage("パスワードをリセットしました。ログインしてください。");
      toast({
        title: "パスワードリセット成功",
        description: "新しいパスワードでログインできます。",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error(err);
      setError("リセットに失敗しました。もう一度お試しください。");
      toast({
        title: "エラー",
        description: "パスワードリセットに失敗しました。",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
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
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        パスワード再設定
      </Heading>

      {message && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {message}
        </Alert>
      )}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>メールアドレス</FormLabel>
          <Input type="email" value={email} isDisabled />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>新しいパスワード</FormLabel>
          <Input
            type="password"
            value={password}
            placeholder="新しいパスワードを入力"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>確認用パスワード</FormLabel>
          <Input
            type="password"
            value={passwordConfirmation}
            placeholder="もう一度入力してください"
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" w="100%" mt={2}>
          パスワードをリセット
        </Button>
      </VStack>

      <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
        新しいパスワードでログインしてください。
      </Text>
    </Box>
  );
};
