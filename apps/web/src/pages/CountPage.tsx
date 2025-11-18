import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

import { detect } from "../libs/detect";
import { loadMetadata } from "../libs/load_metadata";
import { loadYOLOModel } from "../libs/load_model";
import { getImagePath, getModelPath } from "../libs/model_path";
import { detectView } from "../libs/view/detect";
import BackButton from "../components/BackButton";

import {
  Box,
  Button,
  Input,
  Image,
  Text,
  VStack,
  HStack,
  useToast,
  Spinner,
  Container,
  Card,
  CardBody,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const CountPage: React.FC = () => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [state, setState] = useState<[boolean, string]>([false, ""]);
  const [pillCount, setPillCount] = useState<number>(0);

  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imageSrc, setImageSrc] = useState<string>(getImagePath("detect"));
  const toast = useToast();
  const navigate = useNavigate();

  // 🔹 画像アップロード
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 🔹 モデル読み込み
  useEffect(() => {
    const fetchData = async () => {
      setState([true, "モデルを読み込んでいます..."]);
      const path = getModelPath("detect");

      const metadata = await loadMetadata(path);
      if (!metadata) {
        setState([false, "メタデータの読み込みに失敗しました"]);
        return;
      }
      setMetadata(metadata);

      const model = await loadYOLOModel(path, metadata.imgsz);
      if (!model) {
        setState([false, "モデルの読み込みに失敗しました"]);
        return;
      }
      setModel(model);
      setState([false, "モデル読み込み完了"]);
    };
    fetchData();
  }, []);

  // 🔹 検出
  async function predict() {
    if (!model || !metadata || !imageRef.current) return;
    setState([true, "検出中..."]);

    const restoreScale = Math.max(
      imageRef.current.width / metadata.imgsz[0],
      imageRef.current.height / metadata.imgsz[1]
    );

    const bboxes = await detect(model, imageRef.current, metadata.imgsz, 0.4);

    // 1クラス（pill）のカウント
    setPillCount(bboxes.length);

    detectView(
      canvasRef.current!,
      imageRef.current!,
      restoreScale,
      bboxes,
      metadata
    );
    setState([false, "検出完了"]);
  }

  // 🔹 AddUsagePage へ遷移してデータ渡す
  const handleGoToRegister = () => {
    if (pillCount === 0) {
      toast({
        title: "検出結果がありません。",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // pill_id は仮に1としておく（実際の運用に応じて変更）
    const items = [
      {
        pill_id: 1,
        quantity: pillCount,
      },
    ];

    navigate("/add-usage", {
      state: {
        content: "YOLO自動検出による登録",
        timestamp: new Date().toISOString().slice(0, 16),
        items,
      },
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <BackButton />
        <Heading as="h1" size="lg" textAlign="center" color="teal.600">
          錠数カウント
        </Heading>

        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                size="lg"
                borderColor="teal.300"
                _hover={{ borderColor: "teal.400" }}
              />

              <Button
                colorScheme="teal"
                size="lg"
                onClick={predict}
                isDisabled={state[0] || !model}
                width="full"
              >
                {state[0] ? (
                  <>
                    <Spinner size="sm" mr={2} />
                    {state[1]}
                  </>
                ) : (
                  "検出開始"
                )}
              </Button>

              {!state[0] && state[1] && (
                <Text color="teal.600" fontSize="sm">
                  {state[1]}
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {pillCount > 0 && (
          <Card bg="teal.50" borderColor="teal.200" borderWidth={1}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h3" size="md" color="teal.700">
                  検出結果
                </Heading>
                <Text fontSize="xl" fontWeight="bold">
                  検出された錠数:{" "}
                  <Text as="span" color="teal.600" fontSize="2xl">
                    {pillCount} 錠
                  </Text>
                </Text>

                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={handleGoToRegister}
                  width="full"
                  maxW="md"
                  mx="auto"
                  mt={2}
                >
                  この検出結果で登録
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        <HStack spacing={6} align="start" justify="center" flexWrap="wrap">
          <VStack>
            <Text fontWeight="bold" color="teal.700" mb={2}>
              入力画像
            </Text>
            <Box
              borderWidth={2}
              borderColor="teal.200"
              borderRadius="md"
              overflow="hidden"
              boxShadow="md"
            >
              <Image ref={imageRef} src={imageSrc} alt="input" maxW="400px" />
            </Box>
          </VStack>

          <VStack>
            <Text fontWeight="bold" color="teal.700" mb={2}>
              検出結果
            </Text>
            <Box
              borderWidth={2}
              borderColor="teal.200"
              borderRadius="md"
              overflow="hidden"
              boxShadow="md"
            >
              <canvas ref={canvasRef} width={400} height={400} />
            </Box>
          </VStack>
        </HStack>
      </VStack>
    </Container>
  );
};
