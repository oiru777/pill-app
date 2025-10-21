import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  useToast,
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Props = {
  onLogin: (user: any) => void;
};

export const RegisterPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    setError(null);

    try {
      axios.defaults.withCredentials = true;

      // CSRFトークンを取得
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
        withCredentials: true,
        withXSRFToken: true,
      });

      // 登録API呼び出し
      const res = await axios.post(
        "http://localhost:8000/api/v1.0/register",
        form,
        {
          withCredentials: true,
          withXSRFToken: true,
        }
      );

      console.log("✅ 登録成功:", res.data);
      toast({
        title: "登録成功",
        description: "アカウントを作成しました！",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onLogin(res.data);
      navigate("/");
    } catch (err: any) {
      console.error("❌ 登録失敗:", err);
      const message =
        err.response?.data?.message ||
        "登録に失敗しました。もう一度お試しください。";
      setError(message);
      toast({
        title: "エラー",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider theme={extendTheme()}>
      <Box
        maxW="sm"
        mx="auto"
        mt={10}
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          新規登録
        </Heading>

        <VStack spacing={4} align="stretch">
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>名前</FormLabel>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder=""
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>メールアドレス</FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@mail.com"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>パスワード</FormLabel>
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>パスワード（確認）</FormLabel>
            <Input
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="********"
            />
          </FormControl>

          <Button colorScheme="blue" w="100%" onClick={handleRegister}>
            登録する
          </Button>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};
