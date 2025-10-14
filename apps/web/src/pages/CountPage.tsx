import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

import { detect } from "../libs/detect";
import { loadMetadata } from "../libs/load_metadata";
import { loadYOLOModel } from "../libs/load_model";
import { getImagePath, getModelPath } from "../libs/model_path";
import { detectView } from "../libs/view/detect";

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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const CountPage: React.FC = () => {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [state, setState] = useState<[boolean, string]>([false, ""]);
  const [bboxCount, setBboxCount] = useState<number>(0);
  const [labelCounts, setLabelCounts] = useState<Record<string, number>>({});

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
    setBboxCount(bboxes.length);

    const counts: Record<string, number> = {};
    for (const bbox of bboxes) {
      const labelName = metadata.names[bbox.label] || `class_${bbox.label}`;
      counts[labelName] = (counts[labelName] || 0) + 1;
    }
    setLabelCounts(counts);

    detectView(canvasRef.current!, imageRef.current!, restoreScale, bboxes);
    setState([false, "検出完了"]);
  }
  // 🔹 AddUsagePage へ遷移してデータ渡す
  const handleGoToRegister = () => {
    if (!Object.keys(labelCounts).length) {
      toast({
        title: "検出結果がありません。",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 🧩 YOLOラベル → pillsテーブルのID対応マップ
    const pillMap: Record<string, number> = {
      bron: 1, // Bron → pills.id = 1
      restamin: 2, // Restamin → pills.id = 2
      pabrongold: 3, // Pabrongold → pills.id = 3
    };

    const items = Object.entries(labelCounts).map(([label, quantity]) => ({
      pill_id: pillMap[label.toLowerCase()] ?? 1, // ラベル名小文字化して照合
      quantity,
    }));

    navigate("/add-usage", {
      state: {
        content: "YOLO自動検出による登録",
        timestamp: new Date().toISOString().slice(0, 16),
        items,
      },
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="center">
        <Text fontSize="2xl" fontWeight="bold">
          錠数カウント
        </Text>

        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          width="auto"
        />

        <Button
          colorScheme="purple"
          onClick={predict}
          isDisabled={state[0] || !model}
        >
          {state[0] ? <Spinner size="sm" /> : "検出開始"}
        </Button>

        <Text>{state[1]}</Text>

        {/* 結果表示 */}
        <Box textAlign="center">
          <Text>検出された物体数: {bboxCount}</Text>
          {Object.keys(labelCounts).length > 0 && (
            <Box mt={2}>
              <Text fontWeight="bold">ラベルごとの内訳:</Text>
              {Object.entries(labelCounts).map(([label, count]) => (
                <Text key={label}>
                  {label}: {count} 個
                </Text>
              ))}
            </Box>
          )}
        </Box>

        <HStack align="start" spacing={6}>
          <Box>
            <Text fontWeight="bold" mb={2}>
              入力画像
            </Text>
            <Image
              ref={imageRef}
              src={imageSrc}
              alt="input"
              maxW="400px"
              borderRadius="md"
              boxShadow="md"
            />
          </Box>

          <Box>
            <Text fontWeight="bold" mb={2}>
              検出結果
            </Text>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              style={{
                borderRadius: "8px",
                boxShadow: "0 0 6px rgba(0,0,0,0.2)",
              }}
            />
          </Box>
        </HStack>

        <Button
          colorScheme="pink"
          onClick={handleGoToRegister}
          isDisabled={!Object.keys(labelCounts).length}
        >
          この検出結果で登録
        </Button>
      </VStack>
    </Box>
  );
};
